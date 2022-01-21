import { Beatmap, LineData, defaultConfig } from '@/utils/types';
import { computeMinKeypresses, parseKana } from '@/utils/kana';

const MS_IN_MINUTE = 60000;

const computeLineKeypresses = (line: LineData) => {
	let keypresses: number = 0;
	line.syllables.forEach(({ text }) => { keypresses += computeMinKeypresses(text) });
	return keypresses;
}

export const computeLineKPM = (line: LineData) => {
	const lineTime = (line.endTime - line.startTime) / MS_IN_MINUTE;
	return computeLineKeypresses(line) / lineTime;
};

export const computeBeatmapKPM = (map: Beatmap) => {
	let keypresses: number = 0;
	let drainTime: number = 0;
	map.lines.forEach((line: LineData) => {
		keypresses += computeLineKeypresses(line);
		drainTime += (line.endTime - line.startTime) / MS_IN_MINUTE;
	});
	return keypresses / drainTime;
};

export const computeLineKana = (line: LineData) => {
	let totalKana: number = 0;
	line.syllables.forEach(({ text }) => {totalKana += parseKana(text, defaultConfig).length});  
	return totalKana;
}


