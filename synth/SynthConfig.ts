/*!
Copyright (c) 2012-2022 John Nesky and contributing authors

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

import { inverseRealFourierTransform, scaleElementsByFactor } from "./FFT";

export interface Dictionary<T> {
	[K: string]: T;
}

export interface DictionaryArray<T> extends ReadonlyArray<T> {
	dictionary: Dictionary<T>;
}

export interface BeepBoxOption {
	readonly index: number;
	readonly name: string;
}

export const enum EnvelopeType {
	custom,
	steady,
	punch,
	flare,
	pluck,
	tremolo,
	flute,
}

export const enum InstrumentType {
	chip = 0,
	fm = 1,
	noise = 2,
	pwm = 3,
}

export class Config {
	public static readonly scaleNames: ReadonlyArray<string> = ["easy :)", "easy :(", "island :)", "island :(", "blues :)", "blues :(", "normal :)", "normal :(", "dbl harmonic :)", "dbl harmonic :(", "enigma", "expert", "monotonic", "no dabbing"];
	public static readonly scaleFlags: ReadonlyArray<ReadonlyArray<boolean>> = [
		[ true, false,  true, false,  true, false, false,  true, false,  true, false, false],
		[ true, false, false,  true, false,  true, false,  true, false, false,  true, false],
		[ true, false, false, false,  true,  true, false,  true, false, false, false,  true],
		[ true,  true, false,  true, false, false, false,  true,  true, false, false, false],
		[ true, false,  true,  true,  true, false, false,  true, false,  true, false, false],
		[ true, false, false,  true, false,  true,  true,  true, false, false,  true, false],
		[ true, false,  true, false,  true,  true, false,  true, false,  true, false,  true],
		[ true, false,  true,  true, false,  true, false,  true,  true, false,  true, false],
		[ true,  true, false, false,  true,  true, false,  true,  true, false, false,  true],
		[ true, false,  true,  true, false, false,  true,  true,  true, false, false,  true],
		[ true, false,  true, false,  true, false,  true, false,  true, false,  true, false],
		[ true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true],
		[ true, false, false, false, false, false, false, false, false, false, false, false],
		[ true,  true, false,  true,  true,  true,  true,  true,  true, false,  true, false],
	];
	public static readonly pianoScaleFlags: ReadonlyArray<boolean> = [ true, false,  true, false,  true,  true, false,  true, false,  true, false,  true];
	public static readonly blackKeyNameParents: ReadonlyArray<number> = [-1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1];
	public static readonly pitchNames: ReadonlyArray<string | null> = ["C", null, "D", null, "E", "F", null, "G", null, "A", null, "B"];
	public static readonly keyNames: ReadonlyArray<string> = ["B", "A♯", "A", "G♯", "G", "F♯", "F", "E", "D♯", "D", "C♯", "C"];
	// C1 has index 24 on the MIDI scale. C8 is 108, and C9 is 120. C10 is barely in the audible range.
	public static readonly keyTransposes: ReadonlyArray<number> = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12];
	public static readonly mixNames: ReadonlyArray<string> = ["Type A (B & S)", "Type B (M)", "Type C"];
	public static readonly sampleRateNames: ReadonlyArray<string> = ["44100kHz", "48000kHz", "default", "×4", "×2", "÷2", "÷4", "÷8", "÷16"];
	public static readonly tempoSteps: number = 24;
	public static readonly reverbRange: number = 5;
	public static readonly blendRange: number = 4;
	public static readonly riffRange: number = 11;
	public static readonly detuneRange: number = 24;
	public static readonly muffRange: number = 24;
	public static readonly beatsPerBarMin: number = 1;
	public static readonly beatsPerBarMax: number = 24;
	public static readonly barCountMin: number = 1;
	public static readonly barCountMax: number = 256;
	public static readonly patternsPerChannelMin: number = 1;
	public static readonly patternsPerChannelMax: number = 64;
	public static readonly instrumentsPerChannelMin: number = 1;
	public static readonly instrumentsPerChannelMax: number = 64;
	public static readonly partNames: ReadonlyArray<string> = ["÷3 (triplets)", "÷4 (standard)", "÷6", "÷8", "÷16 (arpfest)", "÷12", "÷9", "÷5", "÷50", "÷24"];
	public static readonly partCounts: ReadonlyArray<number> = [3, 4, 6, 8, 16, 12, 9, 5, 50, 24];
	public static readonly waveNames: ReadonlyArray<string> = ["triangle", "square", "pulse wide", "pulse narrow", "sawtooth", "double saw", "double pulse", "spiky", "plateau", "glitch", "10% pulse", "sunsoft bass", "loud pulse", "sax", "guitar", "sine", "atari bass", "atari pulse", "1% pulse", "curved sawtooth", "viola", "brass", "acoustic bass", "lyre", "ramp pulse", "piccolo", "squaretooth", "flatline", "pnryshk a (u5)", "pnryshk b (riff)"];
	public static readonly waveVolumes: ReadonlyArray<number> = [1.0,        0.5,      0.5,          0.5,            0.65,       0.5,          0.4,            0.4,     0.94,      0.5,      0.5,         1.0,            0.6,          0.1,   0.25,     1.0,    1.0,          1.0,           1.0,        1.0,               1.0,     1.0,     1.0,             0.2,    0.2,          0.9,       0.9,           1.0,        0.4,                 0.5];
	public static readonly drumNames: ReadonlyArray<string> = ["retro", "white", "periodic", "detuned periodic", "shine", "hollow", "deep", "cutter", "metallic", "snare"/*, "tom-tom", "cymbal", "bass"*/];
	public static readonly drumVolumes: ReadonlyArray<number> = [0.25, 1.0, 0.4, 0.3, 0.3, 1.5, 1.5, 0.25, 1.0, 1.0/*, 1.5, 1.5, 1.5*/];
	public static readonly drumBasePitches: ReadonlyArray<number> = [69, 69, 69, 69, 69, 96, 120, 96, 96, 69/*, 96, 90, 126*/];
	public static readonly drumPitchFilterMult: ReadonlyArray<number> = [100.0, 8.0, 100.0, 100.0, 100.0, 1.0, 100.0, 100.0, 100.0, 100.0/*, 1.0, 1.0, 1.0*/];
	public static readonly drumWaveIsSoft: ReadonlyArray<boolean> = [false, true, false, false, false, true, true, false, false, false/*, true, true, true*/];
	// Noise waves have too many samples to write by hand, they're generated on-demand by getDrumWave instead.
	private static readonly _drumWaves: Array<Float32Array | null> = [null, null, null, null, null, null, null, null, null, null/*, null, null, null*/];
	public static readonly pwmwaveNames: ReadonlyArray<string> = ["5%", "10%", "15%", "20%", "25%", "30%", "35%", "40%", "45%", "50%"];
	public static readonly pwmwaveVolumes: ReadonlyArray<number> = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
	public static readonly filterNames: ReadonlyArray<string> = ["none", "sustain sharp", "sustain medium", "sustain soft", "decay sharp", "decay medium", "decay soft", "decay drawn", "fade sharp", "fade medium", "fade soft", "ring", "muffled", "submerged", "shift", "overtone", "woosh", "undertone"];
	public static readonly filterBases: ReadonlyArray<number> = [0.0, 2.0, 3.5, 5.0, 1.0, 2.5, 4.0, 1.0, 5.0, 7.5, 10.0, -1.0, 4.0, 6.0, 0.0, 1.0, 2.0, 5.0];
	public static readonly filterDecays: ReadonlyArray<number> = [0.0, 0.0, 0.0, 0.0, 10.0, 7.0, 4.0, 0.5, -10.0, -7.0, -4.0, 0.2, 0.2, 0.3, 0.0, 0.0, -6.0, 0.0];
	public static readonly filterVolumes: ReadonlyArray<number> = [0.2, 0.4, 0.7, 1.0, 0.5, 0.75, 1.0, 0.5, 0.4, 0.7, 1.0, 0.5, 0.75, 0.4, 0.4, 1.0, 0.5, 1.75];
	public static readonly transitionNames: ReadonlyArray<string> = ["seamless", "sudden", "smooth", "slide", "trill", "click", "bow", "blip"];
	public static readonly effectNames: ReadonlyArray<string> = ["none", "vibrato light", "vibrato delayed", "vibrato heavy", "tremolo light", "tremolo heavy", "alien", "stutter", "strum"];
	public static readonly effectVibratos: ReadonlyArray<number> = [0.0, 0.15, 0.3, 0.45, 0.0, 0.0, 1.0, 0.0, 0.05];
	public static readonly effectTremolos: ReadonlyArray<number> = [0.0, 0.0, 0.0, 0.0, 0.25, 0.5, 0.0, 1.0, 0.025];
	public static readonly effectVibratoDelays: ReadonlyArray<number> = [0, 0, 3, 0, 0, 0, 0, 0];
	public static readonly chorusNames: ReadonlyArray<string> = ["union", "shimmer", "hum", "honky tonk", "dissonant", "fifths", "octaves", "spinner", "detune", "bowed", "rising", "vibrate", "fourths", "bass", "dirty", "stationary", "harmonic (legacy)", "recurve", "voiced", "fluctuate"];
	public static readonly chorusIntervals: ReadonlyArray<number> = [0.0, 0.02, 0.05, 0.1, 0.25, 3.5, 6, 0.02, 0.0, 0.02, 1.0, 3.5, 4, 0, 0.0, 3.5, 0.0, 0.005, 0.25, 12];
	public static readonly chorusOffsets: ReadonlyArray<number> = [0.0, 0.0, 0.0, 0.0, 0.0, 3.5, 6, 0.0, 0.25, 0.0, 0.7, 7, 4, -7, 0.1, 0.0, 0.0, 0.0, 3.0, 0.0];
	public static readonly chorusVolumes: ReadonlyArray<number> = [0.9, 0.9, 1.0, 1.0, 0.95, 0.95, 0.9, 1.0, 1.0, 1.0, 0.95, 0.975, 0.95, 1.0, 0.975, 0.9, 1.0, 1.0, 0.9, 1.0];
	public static readonly chorusSigns: ReadonlyArray<number> = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0];
	public static readonly chorusRiffApp: ReadonlyArray<number> = [0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
	public static readonly chorusHarmonizes: ReadonlyArray<boolean> = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
	public static readonly harmDisplay: ReadonlyArray<string> = ["arpeggio", "duet", "chord", "seventh", "half arpeggio", "arp-chord"];
	public static readonly harmNames: ReadonlyArray<number> = [0, 1, 2, 3, 4, 5];
	public static readonly fmChorusDisplay: ReadonlyArray<string> = ["none", "default", "detune", "honky tonk", "consecutive", "alt. major thirds", "alt. minor thirds", "fifths", "octaves"];
	public static readonly fmChorusNames: ReadonlyArray<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	public static readonly imuteNames: ReadonlyArray<string> = ["◉", "◎"];
	public static readonly imuteValues: ReadonlyArray<number> = [1, 0];
	public static readonly octoffNames: ReadonlyArray<string> = ["none", "+2 (2 octaves)",  "+1 1/2 (octave and fifth)",  "+1 (octave)",  "+1/2 (fifth)", "-1/2 (fifth)", "-1 (octave)", "-1 1/2 (octave and fifth)", "-2 (2 octaves"];
	public static readonly octoffValues: ReadonlyArray<number> = [0.0, 24.0, 19.0, 12.0, 7.0, -7.0, -12.0, -19.0, -24.0];
	public static readonly volumeNames: ReadonlyArray<string> = ["loudest", "loud", "medium", "quiet", "quietest", "mute", "i", "couldnt", "be", "bothered"];
	public static readonly volumeValues: ReadonlyArray<number> = [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, -1.0];
	public static readonly volumeMValues: ReadonlyArray<number> = [0.0, 0.5, 1.0, 1.5, 2.0, -1.0];
	public static readonly ipanValues: ReadonlyArray<number> = [-1.0, -0.75, -0.5, -0.25, 0.0, 0.25, 0.5, 0.75, 1.0];
	public static readonly operatorCount: number = 4;
	public static readonly operatorAlgorithmNames: ReadonlyArray<string> = [
		"1←(2 3 4)",
		"1←(2 3←4)",
		"1←2←(3 4)",
		"1←(2 3)←4",
		"1←2←3←4",
		"1←3 2←4",
		"1 2←(3 4)",
		"1 2←3←4",
		"(1 2)←3←4",
		"(1 2)←(3 4)",
		"1 2 3←4",
		"(1 2 3)←4",
		"1 2 3 4",
	];
	public static readonly midiAlgorithmNames: ReadonlyArray<string> = ["1<(2 3 4)", "1<(2 3<4)", "1<2<(3 4)", "1<(2 3)<4", "1<2<3<4", "1<3 2<4", "1 2<(3 4)", "1 2<3<4", "(1 2)<3<4", "(1 2)<(3 4)", "1 2 3<4", "(1 2 3)<4", "1 2 3 4"];
	public static readonly operatorModulatedBy: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>> = [
		[[2, 3, 4], [],     [],  []],
		[[2, 3],    [],     [4], []],
		[[2],       [3, 4], [],  []],
		[[2, 3],    [4],    [4], []],
		[[2],       [3],    [4], []],
		[[3],       [4],    [],  []],
		[[],        [3, 4], [],  []],
		[[],        [3],    [4], []],
		[[3],       [3],    [4], []],
		[[3, 4],    [3, 4], [],  []],
		[[],        [],     [4], []],
		[[4],       [4],    [4], []],
		[[],        [],     [],  []],
	];
	public static readonly operatorAssociatedCarrier: ReadonlyArray<ReadonlyArray<number>> = [
		[1, 1, 1, 1],
		[1, 1, 1, 1],
		[1, 1, 1, 1],
		[1, 1, 1, 1],
		[1, 1, 1, 1],
		[1, 2, 1, 2],
		[1, 2, 2, 2],
		[1, 2, 2, 2],
		[1, 2, 2, 2],
		[1, 2, 2, 2],
		[1, 2, 3, 3],
		[1, 2, 3, 3],
		[1, 2, 3, 4],
	];
	public static readonly operatorCarrierCounts: ReadonlyArray<number> = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4];
	public static readonly operatorCarrierChorus: ReadonlyArray<ReadonlyArray<number>> = [
		[0.0, 0.0, 0.0, 0.0],
		[0.0, 0.04, -0.073, 0.091],
		[0.5, 0.54, 0.427, 0.591],
		[0.0, 0.26, -0.45, 0.67],
		[0.0, 1.0, 2.0, 3.0],
		[0.0, 4.0, 7.0, 11.0],
		[0.0, 3.0, 7.0, 10.0],
		[0.0, 7.0, 14.0, 21.0],
		[0.0, 12.0, 24.0, 36.0],
	];
	public static readonly operatorAmplitudeMax: number = 15;
	public static readonly operatorFrequencyNames: ReadonlyArray<string> = ["1×", "~1×", "2×", "~2×", "3×", "4×", "5×", "6×", "7×", "8×", "9×", "10×", "11×", "13×", "16×", "20×"];
	public static readonly midiFrequencyNames: ReadonlyArray<string> = ["1x", "~1x", "2x", "~2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x", "11x", "13x", "16x", "20x"];
	public static readonly operatorFrequencies: ReadonlyArray<number> =    [1.0, 1.0, 2.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 16.0, 20.0];
	public static readonly operatorHzOffsets: ReadonlyArray<number> =      [0.0, 1.5, 0.0, -1.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	public static readonly operatorAmplitudeSigns: ReadonlyArray<number> = [1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
	public static readonly operatorEnvelopeNames: ReadonlyArray<string> = ["custom", "steady", "punch", "flare 1", "flare 2", "flare 3", "pluck 1", "pluck 2", "pluck 3", "swell 1", "swell 2", "swell 3", "tremolo1", "tremolo2", "tremolo3", "custom flare", "custom tremolo", "flute 1", "flute 2", "flute 3"];
	public static readonly operatorEnvelopeType: ReadonlyArray<EnvelopeType> = [EnvelopeType.custom, EnvelopeType.steady, EnvelopeType.punch, EnvelopeType.flare, EnvelopeType.flare, EnvelopeType.flare, EnvelopeType.pluck, EnvelopeType.pluck, EnvelopeType.pluck, EnvelopeType.pluck, EnvelopeType.pluck, EnvelopeType.pluck, EnvelopeType.tremolo, EnvelopeType.tremolo, EnvelopeType.tremolo, EnvelopeType.flare, EnvelopeType.tremolo, EnvelopeType.flute, EnvelopeType.flute, EnvelopeType.flute];
	public static readonly operatorSpecialCustomVolume: ReadonlyArray<boolean> = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false];
	public static readonly operatorEnvelopeSpeed: ReadonlyArray<number> = [0.0, 0.0, 0.0, 32.0, 8.0, 2.0, 32.0, 8.0, 2.0, 32.0, 8.0, 2.0, 4.0, 2.0, 1.0, 8.0, 0.0, 16.0, 8.0, 4.0];
	public static readonly operatorEnvelopeInverted: ReadonlyArray<boolean> = [false, false, false, false, false, false, false, false, false, true, true, true, false, false, false, false, false, false, false, false];
	public static readonly operatorFeedbackNames: ReadonlyArray<string> = [
		"1⟲",
		"2⟲",
		"3⟲",
		"4⟲",
		"1⟲ 2⟲",
		"3⟲ 4⟲",
		"1⟲ 2⟲ 3⟲ ",
		"2⟲ 3⟲ 4⟲ ",
		"1⟲ 2⟲ 3⟲ 4⟲ ",
		"1→2",
		"1→3",
		"1→4",
		"2→3",
		"2→4",
		"3→4",
		"1→3 2→4",
		"1→4 2→3",
		"1→2→3→4",
		"1🗘2",
		"1🗘3",
		"1🗘4",
		"2🗘3",
		"2🗘4",
		"3🗘4",
	];
	public static readonly midiFeedbackNames: ReadonlyArray<string> = [
		"1",
		"2",
		"3",
		"4",
		"1 2",
		"3 4",
		"1 2 3",
		"2 3 4",
		"1 2 3 4",
		"1>2",
		"1>3",
		"1>4",
		"2>3",
		"2>4",
		"3>4",
		"1>3 2>4",
		"1>4 2>3",
		"1>2>3>4",
		"1-2",
		"1-3",
		"1-4",
		"2-3",
		"2-4",
		"3-4",
	];
	public static readonly operatorFeedbackIndices: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>> = [
		[[1], [], [], []],
		[[], [2], [], []],
		[[], [], [3], []],
		[[], [], [], [4]],
		[[1], [2], [], []],
		[[], [], [3], [4]],
		[[1], [2], [3], []],
		[[], [2], [3], [4]],
		[[1], [2], [3], [4]],
		[[], [1], [], []],
		[[], [], [1], []],
		[[], [], [], [1]],
		[[], [], [2], []],
		[[], [], [], [2]],
		[[], [], [], [3]],
		[[], [], [1], [2]],
		[[], [], [2], [1]],
		[[], [1], [2], [3]],
		[[2], [1], [],  []  ],
		[[3], [],  [1], []  ],
		[[4], [],  [],  [1] ],
		[[],  [3], [2], []  ],
		[[],  [4], [],  [2] ],
		[[],  [],  [4], [3] ],
	];
	public static readonly pitchChannelTypeNames: ReadonlyArray<string> = ["chip", "FM (expert)", "PWM (beta)"];
	public static readonly pitchChannelTypeValues: ReadonlyArray<number> = [InstrumentType.chip, InstrumentType.fm, InstrumentType.pwm];
	public static readonly drumChannelTypeNames: ReadonlyArray<string> = ["noise"];
	public static readonly instrumentTypeNames: ReadonlyArray<string> = ["chip", "FM", "noise", "PWM"];

	public static readonly themeNames: ReadonlyArray<string> = ["Default", "ModBox 2.0", "Artic", "Cinnamon Roll [!]", "Ocean", "Rainbow [!]", "Float [!]", "Windows", "Grassland", "Dessert", "Kahootiest", "Beam to the Bit [!]", "Pretty Egg", "Poniryoshka", "Gameboy [!]", "Woodkid", "Midnight", "Snedbox", "unnamed", "Piano [!] [↻]", "Halloween", "FrozenOver❄️"];
	public static readonly volumeColorPallet: ReadonlyArray<string>            = ["#777777", "#c4ffa3", "#42dcff", "#ba8418", "#090b3a", "#ff00cb", "#878787", "#15a0db", "#74bc21", "#ff0000", "#66bf39", "#fefe00", "#f01d7a", "#ffc100", "#8bac0f", "#ef3027", "#aa5599", "#a53a3d", "#ffffff", "#ff0000", "#9e2200", "#ed2d2d"];
	public static readonly sliderOneColorPallet: ReadonlyArray<string>         = ["#9900cc", "#00ff00", "#ffffff", "#ba8418", "#5982ff", "#ff0000", "#ffffff", "#2779c2", "#a0d168", "#ff6254", "#ff3355", "#fefe00", "#6b003a", "#4b4b4b", "#9bbc0f", "#e83c4e", "#445566", "#a53a3d", "#ffffff", "#ffffff", "#9e2200", "#38ef17"];
	public static readonly sliderOctaveColorPallet: ReadonlyArray<string>      = ["#444444", "#00ff00", "#a5eeff", "#e59900", "#4449a3", "#43ff00", "#ffffff", "#295294", "#74bc21", "#ff5e3a", "#eb670f", "#0001fc", "#ffb1f4", "#5f4c99", "#9bbc0f", "#ef3027", "#444444", "#444444", "#ffffff", "#211616", "#9e2200", "#ffffff"];
	public static readonly sliderOctaveNotchColorPallet: ReadonlyArray<string> = ["#886644", "#ffffff", "#cefffd", "#ffff25", "#3dffdb", "#0400ff", "#c9c9c9", "#fdd01d", "#20330a", "#fff570", "#ff3355", "#fa0103", "#b4001b", "#ff8291", "#8bac0f", "#ffedca", "#aa5599", "#a53a3d", "#ffffff", "#ff4c4c", "#701800", "#ed2d2d"];
	public static readonly buttonColorPallet: ReadonlyArray<string>            = ["#ffffff", "#00ff00", "#42dcff", "#ffff25", "#4449a3", "#f6ff00", "#000000", "#fdd01d", "#69c400", "#fffc5b", "#66bf39", "#fefe00", "#75093e", "#818383", "#8bac0f", "#ffedca", "#000000", "#ffffff", "#ffffff", "#ffffff", "#9e2200", "#38ef17"];

	public static readonly noteOne: ReadonlyArray<string>    = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
	public static readonly noteTwo: ReadonlyArray<string>    = ["#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#9e2200"];
	public static readonly noteThree: ReadonlyArray<string>  = ["#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
	public static readonly noteFour: ReadonlyArray<string>   = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#9e2200"];
	public static readonly noteSix: ReadonlyArray<string>    = ["#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#9e2200"];
	public static readonly noteSeven: ReadonlyArray<string>  = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
	public static readonly noteEight: ReadonlyArray<string>  = ["#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#9e2200"];
	public static readonly noteFive: ReadonlyArray<string>   = ["#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
	public static readonly noteNine: ReadonlyArray<string>   = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#9e2200"];
	public static readonly noteTen: ReadonlyArray<string>    = ["#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
	public static readonly noteEleven: ReadonlyArray<string> = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#9e2200"];
	public static readonly noteTwelve: ReadonlyArray<string> = ["#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#9e2200"];

	public static readonly baseNoteColorPallet: ReadonlyArray<string>    = ["#886644", "#c4ffa3", "#eafffe", "#f5bb00", "#090b3a", "#ffaaaa", "#ffffff", "#da4e2a", "#20330a", "#fffc5b", "#45a3e5", "#fefe00", "#fffafa", "#1a2844", "#9bbc0f", "#fff6fe", "#222222", "#886644", "#ffffa0", "#ffffff", "#681701", "#88bce8"];
	public static readonly secondNoteColorPallet: ReadonlyArray<string>  = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#ffceaa", "#ededed", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#9bbc0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#99c8ef"];
	public static readonly thirdNoteColorPallet: ReadonlyArray<string>   = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#ffdfaa", "#cecece", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#9bbc0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#abd3f4"];
	public static readonly fourthNoteColorPallet: ReadonlyArray<string>  = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#fff5aa", "#bababa", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#8bac0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#b8d7f2"];
	public static readonly sixthNoteColorPallet: ReadonlyArray<string>   = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#e8ffaa", "#afafaf", "#444444", "#444444", "#444444", "#444444", "#fa0103", "#444444", "#faf4c3", "#8bac0f", "#41323b", "#222222", "#10997e", "#ffffa0", "#ffffff", "#754a3f", "#cbe0f2"];
	public static readonly seventhNoteColorPallet: ReadonlyArray<string> = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#bfffb2", "#a5a5a5", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#8bac0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#e5f0f9"];
	public static readonly eigthNoteColorPallet: ReadonlyArray<string>   = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#b2ffc8", "#999999", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#306230", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#ffffff"];
	public static readonly fifthNoteColorPallet: ReadonlyArray<string>   = ["#446688", "#96fffb", "#b7f1ff", "#f5bb00", "#3f669b", "#b2ffe4", "#8e8e8e", "#5d9511", "#74bc21", "#ff5e3a", "#864cbf", "#111111", "#ff91ce", "#dabbe6", "#306230", "#fff6fe", "#444444", "#60389b", "#ffffa0", "#ffffff", "#914300", "#e5f0f9"];
	public static readonly ninthNoteColorPallet: ReadonlyArray<string>   = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#b2f3ff", "#828282", "#444444", "#444444", "#444444", "#444444", "#0001fc", "#444444", "#444444", "#306230", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#cbe0f2"];
	public static readonly tenNoteColorPallet: ReadonlyArray<string>     = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#b2b3ff", "#777777", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#0f380f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#b8d7f2"];
	public static readonly elevenNoteColorPallet: ReadonlyArray<string>  = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#e0b2ff", "#565656", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#0f380f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#abd3f4"];
	public static readonly twelveNoteColorPallet: ReadonlyArray<string>  = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#ffafe9", "#282828", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#0f380f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#99c8ef"];

	public static readonly channelOneBrightColorPallet: string      = "#25f3ff";
	public static readonly channelTwoBrightColorPallet: string      = "#44ff44";
	public static readonly channelThreeBrightColorPallet: string    = "#ffff25";
	public static readonly channelFourBrightColorPallet: string     = "#ff9752";
	public static readonly channelFiveBrightColorPallet: string     = "#ff90ff";
	public static readonly channelSixBrightColorPallet: string      = "#9f31ea";
	public static readonly channelSevenBrightColorPallet: string    = "#2b6aff";
	public static readonly channelEightBrightColorPallet: string    = "#00ff9f";
	public static readonly channelNineBrightColorPallet: string     = "#ffbf00";
	public static readonly channelTenBrightColorPallet: string      = "#d85d00";
	public static readonly channelElevenBrightColorPallet: string   = "#ff00a1";
	public static readonly channelTwelveBrightColorPallet: string   = "#c26afc";
	public static readonly channelThirteenBrightColorPallet: string = "#ff1616";
	public static readonly channelFourteenBrightColorPallet: string = "#ffffff";
	public static readonly channelFifteenBrightColorPallet: string  = "#768dfc";
	public static readonly channelSixteenBrightColorPallet: string  = "#a5ff00";

	public static readonly channelOneDimColorPallet: string      = "#0099a1";
	public static readonly channelTwoDimColorPallet: string      = "#439143";
	public static readonly channelThreeDimColorPallet: string    = "#a1a100";
	public static readonly channelFourDimColorPallet: string     = "#c75000";
	public static readonly channelFiveDimColorPallet: string     = "#d020d0";
	public static readonly channelSixDimColorPallet: string      = "#552377";
	public static readonly channelSevenDimColorPallet: string    = "#221b89";
	public static readonly channelEightDimColorPallet: string    = "#00995f";
	public static readonly channelNineDimColorPallet: string     = "#d6b03e";
	public static readonly channelTenDimColorPallet: string      = "#b25915";
	public static readonly channelElevenDimColorPallet: string   = "#891a60";
	public static readonly channelTwelveDimColorPallet: string   = "#965cbc";
	public static readonly channelThirteenDimColorPallet: string = "#991010";
	public static readonly channelFourteenDimColorPallet: string = "#aaaaaa";
	public static readonly channelFifteenDimColorPallet: string  = "#5869BD";
	public static readonly channelSixteenDimColorPallet: string  = "#7c9b42";

	public static readonly pitchChannelColorsDim: ReadonlyArray<string>    = [Config.channelOneDimColorPallet, Config.channelTwoDimColorPallet, Config.channelThreeDimColorPallet, Config.channelFourDimColorPallet, Config.channelFiveDimColorPallet, Config.channelSixDimColorPallet, Config.channelSevenDimColorPallet, Config.channelEightDimColorPallet, Config.channelNineDimColorPallet, Config.channelTenDimColorPallet, Config.channelElevenDimColorPallet, Config.channelTwelveDimColorPallet];
	public static readonly pitchChannelColorsBright: ReadonlyArray<string> = [Config.channelOneBrightColorPallet, Config.channelTwoBrightColorPallet, Config.channelThreeBrightColorPallet, Config.channelFourBrightColorPallet, Config.channelFiveBrightColorPallet, Config.channelSixBrightColorPallet, Config.channelSevenBrightColorPallet, Config.channelEightBrightColorPallet, Config.channelNineBrightColorPallet, Config.channelTenBrightColorPallet, Config.channelElevenBrightColorPallet, Config.channelTwelveBrightColorPallet];
	public static readonly pitchNoteColorsDim: ReadonlyArray<string>       = [Config.channelOneDimColorPallet, Config.channelTwoDimColorPallet, Config.channelThreeDimColorPallet, Config.channelFourDimColorPallet, Config.channelFiveDimColorPallet, Config.channelSixDimColorPallet, Config.channelSevenDimColorPallet, Config.channelEightDimColorPallet, Config.channelNineDimColorPallet, Config.channelTenDimColorPallet, Config.channelElevenDimColorPallet, Config.channelTwelveDimColorPallet];
	public static readonly pitchNoteColorsBright: ReadonlyArray<string>    = [Config.channelOneBrightColorPallet, Config.channelTwoBrightColorPallet, Config.channelThreeBrightColorPallet, Config.channelFourBrightColorPallet, Config.channelFiveBrightColorPallet, Config.channelSixBrightColorPallet, Config.channelSevenBrightColorPallet, Config.channelEightBrightColorPallet, Config.channelNineBrightColorPallet, Config.channelTenBrightColorPallet, Config.channelElevenBrightColorPallet, Config.channelTwelveBrightColorPallet];
	public static readonly drumChannelColorsDim: ReadonlyArray<string>    = [Config.channelThirteenDimColorPallet, Config.channelFourteenDimColorPallet, Config.channelFifteenDimColorPallet, Config.channelSixteenDimColorPallet];
	public static readonly drumChannelColorsBright: ReadonlyArray<string> = [Config.channelThirteenBrightColorPallet, Config.channelFourteenBrightColorPallet, Config.channelFifteenBrightColorPallet, Config.channelSixteenBrightColorPallet];
	public static readonly drumNoteColorsDim: ReadonlyArray<string>       = [Config.channelThirteenDimColorPallet, Config.channelFourteenDimColorPallet, Config.channelFifteenDimColorPallet, Config.channelSixteenDimColorPallet];
	public static readonly drumNoteColorsBright: ReadonlyArray<string>    = [Config.channelThirteenBrightColorPallet, Config.channelFourteenBrightColorPallet, Config.channelFifteenBrightColorPallet, Config.channelSixteenBrightColorPallet];

	public static readonly midiPitchChannelNames: ReadonlyArray<string> = ["cyan channel", "yellow channel", "orange channel", "green channel", "purple channel", "blue channel"];
	public static readonly midiDrumChannelNames: ReadonlyArray<string> = ["gray channel", "brown channel", "indigo channel"];
	public static readonly midiSustainInstruments: number[] = [
		0x47, // triangle -> clarinet
		0x50, // square -> square wave
		0x46, // pulse wide -> bassoon
		0x44, // pulse narrow -> oboe
		0x51, // sawtooth -> sawtooth wave
		0x51, // double saw -> sawtooth wave
		0x51, // double pulse -> sawtooth wave
		0x51, // spiky -> sawtooth wave
		0x4A, // plateau -> recorder
	];
	public static readonly midiDecayInstruments: number[] = [
		0x2E, // triangle -> harp
		0x2E, // square -> harp
		0x06, // pulse wide -> harpsichord
		0x18, // pulse narrow -> nylon guitar
		0x19, // sawtooth -> steel guitar
		0x19, // double saw -> steel guitar
		0x6A, // double pulse -> shamisen
		0x6A, // spiky -> shamisen
		0x21, // plateau -> fingered bass
	];
	public static readonly drumInterval: number = 6;
	public static readonly drumCount: number = 12;
	public static readonly pitchCount: number = 37;
	public static readonly maxPitch: number = 84;
	public static readonly pitchChannelCountMin: number = 0;
	public static readonly pitchChannelCountMax: number = 12;
	public static readonly drumChannelCountMin: number = 0;
	public static readonly drumChannelCountMax: number = 4;
	public static readonly waves: ReadonlyArray<Float64Array> = [
		Config._centerWave([1.0/15.0, 3.0/15.0, 5.0/15.0, 7.0/15.0, 9.0/15.0, 11.0/15.0, 13.0/15.0, 15.0/15.0, 15.0/15.0, 13.0/15.0, 11.0/15.0, 9.0/15.0, 7.0/15.0, 5.0/15.0, 3.0/15.0, 1.0/15.0, -1.0/15.0, -3.0/15.0, -5.0/15.0, -7.0/15.0, -9.0/15.0, -11.0/15.0, -13.0/15.0, -15.0/15.0, -15.0/15.0, -13.0/15.0, -11.0/15.0, -9.0/15.0, -7.0/15.0, -5.0/15.0, -3.0/15.0, -1.0/15.0]),
		Config._centerWave([1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0/31.0, 3.0/31.0, 5.0/31.0, 7.0/31.0, 9.0/31.0, 11.0/31.0, 13.0/31.0, 15.0/31.0, 17.0/31.0, 19.0/31.0, 21.0/31.0, 23.0/31.0, 25.0/31.0, 27.0/31.0, 29.0/31.0, 31.0/31.0, -31.0/31.0, -29.0/31.0, -27.0/31.0, -25.0/31.0, -23.0/31.0, -21.0/31.0, -19.0/31.0, -17.0/31.0, -15.0/31.0, -13.0/31.0, -11.0/31.0, -9.0/31.0, -7.0/31.0, -5.0/31.0, -3.0/31.0, -1.0/31.0]),
		Config._centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]),
		Config._centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0,1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([0.0, 0.1875, 0.3125, 0.5625, 0.5, 0.75, 0.875, 1.0, 1.0, 0.6875, 0.5, 0.625, 0.625, 0.5, 0.375, 0.5625, 0.4375, 0.5625, 0.4375, 0.4375, 0.3125, 0.1875, 0.1875, 0.375, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.4375, 0.25, 0.0]),
		Config._centerWave([1.0, 0.7, 0.1, 0.1, 0, 0, 0, 0, 0, 0.1, 0.2, 0.15, 0.25, 0.125, 0.215, 0.345, 4.0]),
		Config._centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 9.0, 0.06]),
		Config._centerWave([-0.5, 3.5, 3.0, -0.5, -0.25, -1.0]),
		Config._centerWave([0.0, 0.05, 0.125, 0.2, 0.25, 0.3, 0.425, 0.475, 0.525, 0.625, 0.675, 0.725, 0.775, 0.8, 0.825, 0.875, 0.9, 0.925, 0.95, 0.975, 0.98, 0.99, 0.995, 1, 0.995, 0.99, 0.98, 0.975, 0.95, 0.925, 0.9, 0.875, 0.825, 0.8, 0.775, 0.725, 0.675, 0.625, 0.525, 0.475, 0.425, 0.3, 0.25, 0.2, 0.125, 0.05, 0.0, -0.05, -0.125, -0.2, -0.25, -0.3, -0.425, -0.475, -0.525, -0.625, -0.675, -0.725, -0.775, -0.8, -0.825, -0.875, -0.9, -0.925, -0.95, -0.975, -0.98, -0.99, -0.995, -1, -0.995, -0.99, -0.98, -0.975, -0.95, -0.925, -0.9, -0.875, -0.825, -0.8, -0.775, -0.725, -0.675, -0.625, -0.525, -0.475, -0.425, -0.3, -0.25, -0.2, -0.125, -0.05]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]),
		Config._centerWave([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0 / 2.0, 1.0 / 3.0, 1.0 / 4.0]),
		Config._centerWave([-0.9, -1.0, -0.85, -0.775, -0.7, -0.6, -0.5, -0.4, -0.325, -0.225, -0.2, -0.125, -0.1, -0.11, -0.125, -0.15, -0.175, -0.18, -0.2, -0.21, -0.22, -0.21, -0.2, -0.175, -0.15, -0.1, -0.5, 0.75, 0.11, 0.175, 0.2, 0.25, 0.26, 0.275, 0.26, 0.25, 0.225, 0.2, 0.19, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.275, 0.28, 0.29, 0.3, 0.29, 0.28, 0.27, 0.26, 0.25, 0.225, 0.2, 0.175, 0.15, 0.1, 0.075, 0.0, -0.01, -0.025, 0.025, 0.075, 0.2, 0.3, 0.475, 0.6, 0.75, 0.85, 0.85, 1.0, 0.99, 0.95, 0.8, 0.675, 0.475, 0.275, 0.01, -0.15, -0.3, -0.475, -0.5, -0.6, -0.71, -0.81, -0.9, -1.0, -0.9]),
		Config._centerWave([-1.0, -0.95, -0.975, -0.9, -0.85, -0.8, -0.775, -0.65, -0.6, -0.5, -0.475, -0.35, -0.275, -0.2, -0.125, -0.05, 0.0, 0.075, 0.125, 0.15, 0.20, 0.21, 0.225, 0.25, 0.225, 0.21, 0.20, 0.19, 0.175, 0.125, 0.10, 0.075, 0.06, 0.05, 0.04, 0.025, 0.04, 0.05, 0.10, 0.15, 0.225, 0.325, 0.425, 0.575, 0.70, 0.85, 0.95, 1.0, 0.9, 0.675, 0.375, 0.2, 0.275, 0.4, 0.5, 0.55, 0.6, 0.625, 0.65, 0.65, 0.65, 0.65, 0.64, 0.6, 0.55, 0.5, 0.4, 0.325, 0.25, 0.15, 0.05, -0.05, -0.15, -0.275, -0.35, -0.45, -0.55, -0.65, -0.7, -0.78, -0.825, -0.9, -0.925, -0.95, -0.975]),
		Config._centerWave([1.0, 0.0, 0.1, -0.1, -0.2, -0.4, -0.3, -1.0]),
		Config._centerWave([1.0, -1.0, 4.0, 2.15, 4.13, 5.15, 0.0, -0.05, 1.0]),
		Config._centerWave([6.1, -2.9, 1.4, -2.9]),
		Config._centerWave([1, 4, 2, 1, -0.1, -1, -0.12]),
		Config._centerWave([0.2, 1.0, 2.6, 1.0, 0.0, -2.4]),
		Config._centerWave([1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]),
		Config._centerWave([1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0]),
		Config._centerWave([1.0, -0.9, 0.8, -0.7, 0.6, -0.5, 0.4, -0.3, 0.2, -0.1, 0.0, -0.1, 0.2, -0.3, 0.4, -0.5, 0.6, -0.7, 0.8, -0.9, 1.0]),
	];
	public static readonly wavesMixC: ReadonlyArray<Float64Array> = [
		Config._centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 7.0 / 15.0, 9.0 / 15.0, 11.0 / 15.0, 13.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 13.0 / 15.0, 11.0 / 15.0, 9.0 / 15.0, 7.0 / 15.0, 5.0 / 15.0, 3.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -3.0 / 15.0, -5.0 / 15.0, -7.0 / 15.0, -9.0 / 15.0, -11.0 / 15.0, -13.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -13.0 / 15.0, -11.0 / 15.0, -9.0 / 15.0, -7.0 / 15.0, -5.0 / 15.0, -3.0 / 15.0, -1.0 / 15.0]),
		Config._centerWave([1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0 / 31.0, 3.0 / 31.0, 5.0 / 31.0, 7.0 / 31.0, 9.0 / 31.0, 11.0 / 31.0, 13.0 / 31.0, 15.0 / 31.0, 17.0 / 31.0, 19.0 / 31.0, 21.0 / 31.0, 23.0 / 31.0, 25.0 / 31.0, 27.0 / 31.0, 29.0 / 31.0, 31.0 / 31.0, -31.0 / 31.0, -29.0 / 31.0, -27.0 / 31.0, -25.0 / 31.0, -23.0 / 31.0, -21.0 / 31.0, -19.0 / 31.0, -17.0 / 31.0, -15.0 / 31.0, -13.0 / 31.0, -11.0 / 31.0, -9.0 / 31.0, -7.0 / 31.0, -5.0 / 31.0, -3.0 / 31.0, -1.0 / 31.0]),
		Config._centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]),
		Config._centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0,1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([0.0, 0.1875, 0.3125, 0.5625, 0.5, 0.75, 0.875, 1.0, 1.0, 0.6875, 0.5, 0.625, 0.625, 0.5, 0.375, 0.5625, 0.4375, 0.5625, 0.4375, 0.4375, 0.3125, 0.1875, 0.1875, 0.375, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.4375, 0.25, 0.0]),
		Config._centerWave([1.0, 0.7, 0.1, 0.1, 0, 0, 0, 0, 0, 0.1, 0.2, 0.15, 0.25, 0.125, 0.215, 0.345, 4.0]),
		Config._centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 9.0, 0.06]),
		Config._centerWave([-0.5, 3.5, 3.0, -0.5, -0.25, -1.0]),
		Config._centerWave([0.0, 0.05, 0.125, 0.2, 0.25, 0.3, 0.425, 0.475, 0.525, 0.625, 0.675, 0.725, 0.775, 0.8, 0.825, 0.875, 0.9, 0.925, 0.95, 0.975, 0.98, 0.99, 0.995, 1, 0.995, 0.99, 0.98, 0.975, 0.95, 0.925, 0.9, 0.875, 0.825, 0.8, 0.775, 0.725, 0.675, 0.625, 0.525, 0.475, 0.425, 0.3, 0.25, 0.2, 0.125, 0.05, 0.0, -0.05, -0.125, -0.2, -0.25, -0.3, -0.425, -0.475, -0.525, -0.625, -0.675, -0.725, -0.775, -0.8, -0.825, -0.875, -0.9, -0.925, -0.95, -0.975, -0.98, -0.99, -0.995, -1, -0.995, -0.99, -0.98, -0.975, -0.95, -0.925, -0.9, -0.875, -0.825, -0.8, -0.775, -0.725, -0.675, -0.625, -0.525, -0.475, -0.425, -0.3, -0.25, -0.2, -0.125, -0.05]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0]),
		Config._centerWave([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0 / 2.0, 1.0 / 3.0, 1.0 / 4.0]),
		Config._centerWave([-0.9, -1.0, -0.85, -0.775, -0.7, -0.6, -0.5, -0.4, -0.325, -0.225, -0.2, -0.125, -0.1, -0.11, -0.125, -0.15, -0.175, -0.18, -0.2, -0.21, -0.22, -0.21, -0.2, -0.175, -0.15, -0.1, -0.5, 0.75, 0.11, 0.175, 0.2, 0.25, 0.26, 0.275, 0.26, 0.25, 0.225, 0.2, 0.19, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.275, 0.28, 0.29, 0.3, 0.29, 0.28, 0.27, 0.26, 0.25, 0.225, 0.2, 0.175, 0.15, 0.1, 0.075, 0.0, -0.01, -0.025, 0.025, 0.075, 0.2, 0.3, 0.475, 0.6, 0.75, 0.85, 0.85, 1.0, 0.99, 0.95, 0.8, 0.675, 0.475, 0.275, 0.01, -0.15, -0.3, -0.475, -0.5, -0.6, -0.71, -0.81, -0.9, -1.0, -0.9]),
		Config._centerWave([-1.0, -0.95, -0.975, -0.9, -0.85, -0.8, -0.775, -0.65, -0.6, -0.5, -0.475, -0.35, -0.275, -0.2, -0.125, -0.05, 0.0, 0.075, 0.125, 0.15, 0.20, 0.21, 0.225, 0.25, 0.225, 0.21, 0.20, 0.19, 0.175, 0.125, 0.10, 0.075, 0.06, 0.05, 0.04, 0.025, 0.04, 0.05, 0.10, 0.15, 0.225, 0.325, 0.425, 0.575, 0.70, 0.85, 0.95, 1.0, 0.9, 0.675, 0.375, 0.2, 0.275, 0.4, 0.5, 0.55, 0.6, 0.625, 0.65, 0.65, 0.65, 0.65, 0.64, 0.6, 0.55, 0.5, 0.4, 0.325, 0.25, 0.15, 0.05, -0.05, -0.15, -0.275, -0.35, -0.45, -0.55, -0.65, -0.7, -0.78, -0.825, -0.9, -0.925, -0.95, -0.975]),
		Config._centerWave([0.7, 0.0, 0.1, -0.1, -0.2, -0.4, -0.3, -0.7]),
		Config._centerWave([1.0, -1.0, 4.0, 2.15, 4.1, 5.05, 0.0, -0.05, 1.0]),
		Config._centerWave([4.5, -1.7, 1.0, -1.7]),
		Config._centerWave([0.1, 0.4, 0.2, 0.1, -0.1, -1, -0.12]),
		Config._centerWave([.03, .13, .30, 1.0, 0.0, -.26]),
		Config._centerWave([2, 1.75, 1.5, 1.25, 1, .75, .5, .25, 0.0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75]),
		Config._centerWave([1.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0]),
		Config._centerWave([-1.0, -0.9, 0.8, -0.7, 0.6, -0.5, 0.4, -0.3, 0.2, -0.1, 0.0, -0.1, 0.2, -0.3, 0.4, -0.5, 0.6, -0.7, 0.8, -0.9, -1.0]),
	];
	public static readonly pwmwaves: ReadonlyArray<Float64Array> = [
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
		Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
	];
	public static readonly sineWaveLength: number = 1 << 8; // 256
	public static readonly sineWaveMask: number = Config.sineWaveLength - 1;
	public static readonly sineWave: Float64Array = Config.generateSineWave();
	
	private static _centerWave(wave: Array<number>): Float64Array {
		let sum: number = 0.0;
		for (let i: number = 0; i < wave.length; i++) sum += wave[i];
		const average: number = sum / wave.length;
		for (let i: number = 0; i < wave.length; i++) wave[i] -= average;
		return new Float64Array(wave);
	}
	
	public static getDrumWave(index: number): Float32Array {
		let wave: Float32Array | null = Config._drumWaves[index];
		if (wave == null) {
			wave = new Float32Array(32768);
			Config._drumWaves[index] = wave;
			
			if (index == 0) {
				// The "retro" drum uses a "Linear Feedback Shift Register" similar to the NES noise channel.
				let drumBuffer: number = 1;
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
					let newBuffer: number = drumBuffer >> 1;
					if (((drumBuffer + newBuffer) & 1) == 1) {
						newBuffer += 1 << 14;
					}
					drumBuffer = newBuffer;
				}
			} else if (index == 1) {
				// White noise is just random values for each sample.
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = Math.random() * 2.0 - 1.0;
				}
			} else if (index == 2) {
				// "periodic" drum.
				let drumBuffer: number = 1;
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
					let newBuffer: number = drumBuffer >> 1;
					if (((drumBuffer + newBuffer) & 1) == 1) {
						newBuffer += 2 << 14;
					}
					drumBuffer = newBuffer;
				}
			} else if (index == 3) {
				// "detuned periodic" drum.
				let drumBuffer: number = 1;
				for (let i: number = 0; i < 32767; i++) {
					wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
					let newBuffer: number = drumBuffer >> 2;
					if (((drumBuffer + newBuffer) & 1) == 1) {
						newBuffer += 4 << 14;
					}
					drumBuffer = newBuffer;
				}
			} else if (index == 4) {
				// "shine" drum.
				let drumBuffer: number = 1;
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
					let newBuffer: number = drumBuffer >> 1;
					if (((drumBuffer + newBuffer) & 1) == 1) {
						newBuffer += 10 << 2;
					}
					drumBuffer = newBuffer;
				}
			} else if (index == 5) {
				// "hollow" drums, designed in frequency space and then converted via FFT:
				Config.drawNoiseSpectrum(wave, 10, 11, 1, 1, 0);
				Config.drawNoiseSpectrum(wave, 11, 14, -2, -2, 0);
				inverseRealFourierTransform(wave);
				scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
			} else if (index == 6) {
				// "deep" drum, designed in frequency space and then converted via FFT:
				Config.drawNoiseSpectrum(wave, 1, 10, 1, 1, 0);
				Config.drawNoiseSpectrum(wave, 20, 14, -2, -2, 0);
				inverseRealFourierTransform(wave);
				scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
			} else if (index == 7) {
				// "cutter" drum.
				let drumBuffer: number = 1;
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = (drumBuffer & 1) * 4.0 * Math.random();
					let newBuffer: number = drumBuffer >> 1;
					if (((drumBuffer + newBuffer) & 1) == 1) {
						newBuffer += 15 << 2;
					}
					drumBuffer = newBuffer;
				}
			} else if (index == 8) {
				// "metallic" drum.
				let drumBuffer: number = 1;
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = (drumBuffer & 1) / 2.0 + 0.5;
					let newBuffer: number = drumBuffer >> 1;
					if (((drumBuffer + newBuffer) & 1) == 1) {
						newBuffer -= 10 << 2;
					}
					drumBuffer = newBuffer;
				}
			} else if (index == 9) {
				// "snare" drum.
				for (let i: number = 0; i < 32768; i++) {
					wave[i] = Math.random() * 2.0 - 1.0;
				}
			/*
			} else if (index == 10) {
				// "tom-tom" drums, designed in frequency space and then converted via FFT:
				Config.drawNoiseSpectrum(wave, 10, 14, 0, -4, 0);
				inverseRealFourierTransform(wave);
				scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
			} else if (index == 11) {
				// "cymbal" drums, designed in frequency space and then converted via FFT:
				Config.drawNoiseSpectrum(wave, 9, 9.4, -1, -1, -0.5);
				Config.drawNoiseSpectrum(wave, 9.7, 10, -1, -1, -0.5);
				Config.drawNoiseSpectrum(wave, 10.3, 10.6, -1, -1, -0.5);
				Config.drawNoiseSpectrum(wave, 10.9, 11.1, -1, -1, -0.5);
				Config.drawNoiseSpectrum(wave, 11.3, 11.4, 0, 0, -0.5);
				Config.drawNoiseSpectrum(wave, 11.5, 11.7, 1.5, 1.5, -0.5);
				Config.drawNoiseSpectrum(wave, 11.7, 12, -1, -1, -0.5);
				Config.drawNoiseSpectrum(wave, 12, 12.1, 2, 2, -0.5);
				Config.drawNoiseSpectrum(wave, 12.1, 12.6, 0, 2, -0.5);
				Config.drawNoiseSpectrum(wave, 12.6, 13, 0, 0, -0.5);
				Config.drawNoiseSpectrum(wave, 13, 14, 1, -3, -0.5);
				inverseRealFourierTransform(wave);
				scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
			} else if (index == 12) {
				// "bass" drums, designed in frequency space and then converted via FFT:
				Config.drawNoiseSpectrum(wave, 7, 8, -2, 4, 0);
				Config.drawNoiseSpectrum(wave, 8, 9, 4, -2, 0);
				Config.drawNoiseSpectrum(wave, 9, 14, -2, -6, 0);
				inverseRealFourierTransform(wave);
				scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
			*/
			} else {
				throw new Error("Unrecognized drum index: " + index);
			}
		}
		
		return wave;
	}
	
	private static drawNoiseSpectrum(wave: Float32Array, lowOctave: number, highOctave: number, lowPower: number, highPower: number, overalSlope: number): void {
		const referenceOctave: number = 11;
		const referenceIndex: number = 1 << referenceOctave;
		const lowIndex: number = Math.pow(2, lowOctave) | 0;
		const highIndex: number = Math.pow(2, highOctave) | 0;
		const log2: number = Math.log(2);
		for (let i: number = lowIndex; i < highIndex; i++) {
			let amplitude: number = Math.pow(2, lowPower + (highPower - lowPower) * (Math.log(i) / log2 - lowOctave) / (highOctave - lowOctave));
			amplitude *= Math.pow(i / referenceIndex, overalSlope);
			const radians: number = Math.random() * Math.PI * 2.0;
			wave[i] = Math.cos(radians) * amplitude;
			wave[32768 - i] = Math.sin(radians) * amplitude;
		}
	}
	
	private static generateSineWave(): Float64Array {
		const wave: Float64Array = new Float64Array(Config.sineWaveLength + 1);
		for (let i: number = 0; i < Config.sineWaveLength + 1; i++) {
			wave[i] = Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength);
		}
		return wave;
	}
}

// Pardon the messy type casting. This allows accessing array members by numerical index or string name.
export function toNameMap<T extends BeepBoxOption>(array: Array<Pick<T, Exclude<keyof T, "index">>>): DictionaryArray<T> {
	const dictionary: Dictionary<T> = {};
	for (let i: number = 0; i < array.length; i++) {
		const value: any = array[i];
		value.index = i;
		dictionary[value.name] = <T> value;
	}
	const result: DictionaryArray<T> = <DictionaryArray<T>> <any> array;
	result.dictionary = dictionary;
	return result;
}