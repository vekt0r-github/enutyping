import { toRomaji } from "wanakana";

export type Kana = {
  text: string,
  romanizations: string[],
};

const smallKana = ["ょ", "ゃ", "ゅ", "ぃ", "ぇ", "ぁ", "ぉ", "ぅ"];

const kanaRespellings = {
  shi: ["shi", "si", "ci"],
  chi: ["chi", "ti"],
  tsu: ["tsu", "tu"],
  ji: ["ji", "zi"],
  sha: ["sha", "sya"],
  sho: ["sho", "syo"],
  shu: ["shu", "syu"],
  ja: ["ja", "jya", "zya"],
  jo: ["jo", "jyo", "zyo"],
  ju: ["ju", "jyu", "zyu"],
  ka: ["ka", "ca"],
  ku: ["ku", "cu", "qu"],
  ko: ["ko", "co"],
  se: ["se", "ce"],
  fu: ["fu", "hu"],
  n: ["n", "nn"]
};

const getRomanizations = (kana: string) : string[] => {
  function hasKey<O>(obj: O, key: PropertyKey): key is keyof O {
    return key in obj; // fix ts error even though this looks stupid
  }
  const canonical = toRomaji(kana);
  if (kana.length == 1) {
    if (hasKey(kanaRespellings, canonical)) {
      return kanaRespellings[canonical];
    }
    return [canonical];
  }

  // small tsu case
  if (kana[0] == "っ") {
    const subRomanizations = getRomanizations(kana.substring(1));
    return ([] as string[]).concat.apply([], subRomanizations.map(r => [r[0] + r, "xtu" + r, "xtsu" + r]));
  }

  // all that's left after the first 2 cases is combinations e.g. きょ
  let normals: string[] = [];
  if (hasKey(kanaRespellings, canonical)) {
    normals = kanaRespellings[canonical];
  }
  else normals = [canonical];

  let modifierRomaji: string = toRomaji(kana[1]);
  let weirds: string[] = getRomanizations(kana[0]).map(r => r + "x" + modifierRomaji);

  return normals.concat(weirds);
};

const computeKanaAt = (pos: number, syllable: string, nextSyllable?: string) => {
  let newKana: Kana = {text: "", romanizations: []};
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
  const isDoubledN = ("aeiouny".includes(toRomaji(future)[0]));
  newKana.text = syllable.substring(pos, length + pos);
  newKana.romanizations = getRomanizations(newKana.text);
  if (syllable[pos] == "ん" && isDoubledN) {
    newKana.romanizations = ["nn"];
  }
  return newKana;
};

export const parseKana = (syllable: string, nextSyllable?: string) => {
  let kana = [];
  for (let pos = 0; pos < syllable.length; ) {
    const newKana = computeKanaAt(pos, syllable, nextSyllable);
    kana.push(newKana);
    pos += newKana.text.length;
  }
  return kana;
}
