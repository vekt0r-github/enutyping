import { toRomaji } from "wanakana";

import { Config } from "@/providers/config";

import { Kana } from "@/utils/types";

const smallKana = ["ょ", "ゃ", "ゅ", "ぃ", "ぇ", "ぁ", "ぉ", "ぅ"];

export const kanaRespellings = {
  し: ["shi", "si", "ci"],
  ち: ["chi", "ti"],
  つ: ["tsu", "tu"],
  じ: ["ji", "zi"],
  しゃ: ["sha", "sya"],
  しょ: ["sho", "syo"],
  しゅ: ["shu", "syu"],
  じゃ: ["ja", "jya", "zya"],
  じょ: ["jo", "jyo", "zyo"],
  じゅ: ["ju", "jyu", "zyu"],
  か: ["ka", "ca"],
  く: ["ku", "cu", "qu"],
  こ: ["ko", "co"],
  せ: ["se", "ce"],
  ふ: ["fu", "hu"],
  づ: ["du"],
  ん: ["n", "nn"],
};

const getRomanizations = (kana: string, config: Config) : string[] => {
  kana = kana.toLowerCase();
  function hasKey<O extends object>(obj: O, key: PropertyKey): key is keyof O {
    return key in obj; // fix ts error even though this looks stupid
  }
  const wanakanaOptions = { customRomajiMapping: config.kanaSpellings };

  const canonical = toRomaji(kana, wanakanaOptions);
  if (kana.length == 1) {
    if (hasKey(kanaRespellings, kana)) {
      return [canonical].concat(kanaRespellings[kana]);
    }
    return [canonical];
  }

  // small tsu case
  if (kana[0] == "っ") {
    const subRomanizations = getRomanizations(kana.substring(1), config);
    if(config.typePolygraphs) return ([] as string[]).concat.apply([], subRomanizations.map(r => [r[0] + r, "xtu" + r, "xtsu" + r]));
    else return subRomanizations.map(r => r[0] + r);
  }

  // all that's left after the first 2 cases is combinations e.g. きょ
  let normals: string[] = [];
  if (hasKey(kanaRespellings, kana)) {
    normals = [canonical].concat(kanaRespellings[kana]);
  }
  else normals = [canonical];

  let modifierRomaji: string = toRomaji(kana[1], wanakanaOptions);
  let weirds: string[] = getRomanizations(kana[0], config).map(r => r + "x" + modifierRomaji);

  if(config.typePolygraphs) return normals.concat(weirds);
  else return normals;
};

const USKeyboard = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>?";
const JAKeyboard = "ろぬふあうえおやゆよわほへたていすかんなにらせ゛゜むちとしはきくまのりれけつさそひこみもねるめろぬふぁぅぇぉゃゅょをーへたてぃすかんなにらせ「」むちとしはきくまのりれけっさそひこみも、。・";
const hiraganaToKey = new Map<string, string>();
for (let i = 0; i < USKeyboard.length; i++) {
  if (!hiraganaToKey.has(JAKeyboard.charAt(i))) { // lowercase comes earlier
    hiraganaToKey.set(JAKeyboard.charAt(i), USKeyboard.charAt(i));
  }
}

/**
 * find the sequence of US keyboard presses that would generate this string
 */
const getHiraganizations = (kana: string) : string[] => {
  const chars = kana.normalize('NFD').split('').map(c => {
    switch (c) {
      case '\u3099': return '゛';
      case '\u309A': return '゜';
      default: return c;
    }
  }).map(c => hiraganaToKey.get(c) ?? c);
  return [chars.reduce((a, b) => a + b)];
};

const computeKanaAt = (pos: number, config: Config, syllable: string, nextSyllable?: string) => {
  const wanakanaOptions = { customRomajiMapping: config.kanaSpellings };

  let newKana: Kana = {text: "", romanizations: [], hiraganizations: []};
  if (pos >= syllable.length) { return newKana; }

  let length = 1;
  if (syllable[pos] == "っ") {
    length++;
  }
  if (smallKana.includes(syllable[pos + length])) {
    length++;
  } 
  // n's are doubled before あ、な、や etc., carrying across syllables, but not across lines
  let future = syllable.substring(length + pos); // anything that starts with the next char
  if (future === "") { future = nextSyllable ?? "a"; } // want end of line to be doubled
  const isDoubledN = ("aeiouny".includes(toRomaji(future, wanakanaOptions)[0]));
  newKana.text = syllable.substring(pos, length + pos);
  newKana.romanizations = getRomanizations(newKana.text, config);
  if (syllable[pos] == "ん" && isDoubledN) {
    newKana.romanizations = ["nn"];
  }
  newKana.hiraganizations = getHiraganizations(newKana.text);
  return newKana;
};

export const parseKana = (syllable: string, config: Config, nextSyllable?: string) => {
  let kana: Kana[] = [];
  for (let pos = 0; pos < syllable.length; ) {
    const newKana = computeKanaAt(pos, config, syllable, nextSyllable);
    kana.push(newKana);
    pos += newKana.text.length;
  }
  return kana;
}

const minKeypressOptions = { // idk what's going on here tbh, TODO ig
  customRomajiMapping: {
    し: "si", 
    ち: "ti",
    つ: "tu",
    じ: "ji",
    しゃ: "sha",
    しょ: "sho",
    しゅ: "shu",
    じゃ: "ja",
    じょ: "jo",
    じゅ: "ju",
    か: "ka", 
    く: "ku", 
    こ: "ko", 
    せ: "se",
    ふ: "fu", 
    づ: "du",
    ん: "n", 
  },
}
export const computeMinKeypresses = (kana: Kana) => {
  const ans = Math.min(...kana.romanizations.map(s => s.length));
  return ans;
}
