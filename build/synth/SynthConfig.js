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
export class Config {
    static _centerWave(wave) {
        let sum = 0.0;
        for (let i = 0; i < wave.length; i++)
            sum += wave[i];
        const average = sum / wave.length;
        for (let i = 0; i < wave.length; i++)
            wave[i] -= average;
        return new Float64Array(wave);
    }
    static getDrumWave(index) {
        let wave = Config._drumWaves[index];
        if (wave == null) {
            wave = new Float32Array(32768);
            Config._drumWaves[index] = wave;
            if (index == 0) {
                let drumBuffer = 1;
                for (let i = 0; i < 32768; i++) {
                    wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                    let newBuffer = drumBuffer >> 1;
                    if (((drumBuffer + newBuffer) & 1) == 1) {
                        newBuffer += 1 << 14;
                    }
                    drumBuffer = newBuffer;
                }
            }
            else if (index == 1) {
                for (let i = 0; i < 32768; i++) {
                    wave[i] = Math.random() * 2.0 - 1.0;
                }
            }
            else if (index == 2) {
                let drumBuffer = 1;
                for (let i = 0; i < 32768; i++) {
                    wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                    let newBuffer = drumBuffer >> 1;
                    if (((drumBuffer + newBuffer) & 1) == 1) {
                        newBuffer += 2 << 14;
                    }
                    drumBuffer = newBuffer;
                }
            }
            else if (index == 3) {
                let drumBuffer = 1;
                for (let i = 0; i < 32767; i++) {
                    wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                    let newBuffer = drumBuffer >> 2;
                    if (((drumBuffer + newBuffer) & 1) == 1) {
                        newBuffer += 4 << 14;
                    }
                    drumBuffer = newBuffer;
                }
            }
            else if (index == 4) {
                let drumBuffer = 1;
                for (let i = 0; i < 32768; i++) {
                    wave[i] = (drumBuffer & 1) * 2.0 - 1.0;
                    let newBuffer = drumBuffer >> 1;
                    if (((drumBuffer + newBuffer) & 1) == 1) {
                        newBuffer += 10 << 2;
                    }
                    drumBuffer = newBuffer;
                }
            }
            else if (index == 5) {
                Config.drawNoiseSpectrum(wave, 10, 11, 1, 1, 0);
                Config.drawNoiseSpectrum(wave, 11, 14, -2, -2, 0);
                inverseRealFourierTransform(wave);
                scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
            }
            else if (index == 6) {
                Config.drawNoiseSpectrum(wave, 1, 10, 1, 1, 0);
                Config.drawNoiseSpectrum(wave, 20, 14, -2, -2, 0);
                inverseRealFourierTransform(wave);
                scaleElementsByFactor(wave, 1.0 / Math.sqrt(wave.length));
            }
            else if (index == 7) {
                let drumBuffer = 1;
                for (let i = 0; i < 32768; i++) {
                    wave[i] = (drumBuffer & 1) * 4.0 * Math.random();
                    let newBuffer = drumBuffer >> 1;
                    if (((drumBuffer + newBuffer) & 1) == 1) {
                        newBuffer += 15 << 2;
                    }
                    drumBuffer = newBuffer;
                }
            }
            else if (index == 8) {
                let drumBuffer = 1;
                for (let i = 0; i < 32768; i++) {
                    wave[i] = (drumBuffer & 1) / 2.0 + 0.5;
                    let newBuffer = drumBuffer >> 1;
                    if (((drumBuffer + newBuffer) & 1) == 1) {
                        newBuffer -= 10 << 2;
                    }
                    drumBuffer = newBuffer;
                }
            }
            else if (index == 9) {
                for (let i = 0; i < 32768; i++) {
                    wave[i] = Math.random() * 2.0 - 1.0;
                }
            }
            else {
                throw new Error("Unrecognized drum index: " + index);
            }
        }
        return wave;
    }
    static drawNoiseSpectrum(wave, lowOctave, highOctave, lowPower, highPower, overalSlope) {
        const referenceOctave = 11;
        const referenceIndex = 1 << referenceOctave;
        const lowIndex = Math.pow(2, lowOctave) | 0;
        const highIndex = Math.pow(2, highOctave) | 0;
        const log2 = Math.log(2);
        for (let i = lowIndex; i < highIndex; i++) {
            let amplitude = Math.pow(2, lowPower + (highPower - lowPower) * (Math.log(i) / log2 - lowOctave) / (highOctave - lowOctave));
            amplitude *= Math.pow(i / referenceIndex, overalSlope);
            const radians = Math.random() * Math.PI * 2.0;
            wave[i] = Math.cos(radians) * amplitude;
            wave[32768 - i] = Math.sin(radians) * amplitude;
        }
    }
    static generateSineWave() {
        const wave = new Float64Array(Config.sineWaveLength + 1);
        for (let i = 0; i < Config.sineWaveLength + 1; i++) {
            wave[i] = Math.sin(i * Math.PI * 2.0 / Config.sineWaveLength);
        }
        return wave;
    }
}
Config.scaleNames = ["easy :)", "easy :(", "island :)", "island :(", "blues :)", "blues :(", "normal :)", "normal :(", "dbl harmonic :)", "dbl harmonic :(", "enigma", "expert", "monotonic", "no dabbing"];
Config.scaleFlags = [
    [true, false, true, false, true, false, false, true, false, true, false, false],
    [true, false, false, true, false, true, false, true, false, false, true, false],
    [true, false, false, false, true, true, false, true, false, false, false, true],
    [true, true, false, true, false, false, false, true, true, false, false, false],
    [true, false, true, true, true, false, false, true, false, true, false, false],
    [true, false, false, true, false, true, true, true, false, false, true, false],
    [true, false, true, false, true, true, false, true, false, true, false, true],
    [true, false, true, true, false, true, false, true, true, false, true, false],
    [true, true, false, false, true, true, false, true, true, false, false, true],
    [true, false, true, true, false, false, true, true, true, false, false, true],
    [true, false, true, false, true, false, true, false, true, false, true, false],
    [true, true, true, true, true, true, true, true, true, true, true, true],
    [true, false, false, false, false, false, false, false, false, false, false, false],
    [true, true, false, true, true, true, true, true, true, false, true, false],
];
Config.pianoScaleFlags = [true, false, true, false, true, true, false, true, false, true, false, true];
Config.blackKeyNameParents = [-1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, -1];
Config.pitchNames = ["C", null, "D", null, "E", "F", null, "G", null, "A", null, "B"];
Config.keyNames = ["B", "A♯", "A", "G♯", "G", "F♯", "F", "E", "D♯", "D", "C♯", "C"];
Config.keyTransposes = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12];
Config.mixNames = ["Type A (B & S)", "Type B (M)", "Type C"];
Config.sampleRateNames = ["44100kHz", "48000kHz", "default", "×4", "×2", "÷2", "÷4", "÷8", "÷16"];
Config.tempoSteps = 24;
Config.reverbRange = 5;
Config.blendRange = 4;
Config.riffRange = 11;
Config.detuneRange = 24;
Config.muffRange = 24;
Config.beatsPerBarMin = 1;
Config.beatsPerBarMax = 24;
Config.barCountMin = 1;
Config.barCountMax = 256;
Config.patternsPerChannelMin = 1;
Config.patternsPerChannelMax = 64;
Config.instrumentsPerChannelMin = 1;
Config.instrumentsPerChannelMax = 64;
Config.partNames = ["÷3 (triplets)", "÷4 (standard)", "÷6", "÷8", "÷16 (arpfest)", "÷12", "÷9", "÷5", "÷50", "÷24"];
Config.partCounts = [3, 4, 6, 8, 16, 12, 9, 5, 50, 24];
Config.waveNames = ["triangle", "square", "pulse wide", "pulse narrow", "sawtooth", "double saw", "double pulse", "spiky", "plateau", "glitch", "10% pulse", "sunsoft bass", "loud pulse", "sax", "guitar", "sine", "atari bass", "atari pulse", "1% pulse", "curved sawtooth", "viola", "brass", "acoustic bass", "lyre", "ramp pulse", "piccolo", "squaretooth", "flatline", "pnryshk a (u5)", "pnryshk b (riff)"];
Config.waveVolumes = [1.0, 0.5, 0.5, 0.5, 0.65, 0.5, 0.4, 0.4, 0.94, 0.5, 0.5, 1.0, 0.6, 0.1, 0.25, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.9, 0.9, 1.0, 0.4, 0.5];
Config.drumNames = ["retro", "white", "periodic", "detuned periodic", "shine", "hollow", "deep", "cutter", "metallic", "snare"];
Config.drumVolumes = [0.25, 1.0, 0.4, 0.3, 0.3, 1.5, 1.5, 0.25, 1.0, 1.0];
Config.drumBasePitches = [69, 69, 69, 69, 69, 96, 120, 96, 96, 69];
Config.drumPitchFilterMult = [100.0, 8.0, 100.0, 100.0, 100.0, 1.0, 100.0, 100.0, 100.0, 100.0];
Config.drumWaveIsSoft = [false, true, false, false, false, true, true, false, false, false];
Config._drumWaves = [null, null, null, null, null, null, null, null, null, null];
Config.pwmwaveNames = ["5%", "10%", "15%", "20%", "25%", "30%", "35%", "40%", "45%", "50%"];
Config.pwmwaveVolumes = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
Config.filterNames = ["none", "sustain sharp", "sustain medium", "sustain soft", "decay sharp", "decay medium", "decay soft", "decay drawn", "fade sharp", "fade medium", "fade soft", "ring", "muffled", "submerged", "shift", "overtone", "woosh", "undertone"];
Config.filterBases = [0.0, 2.0, 3.5, 5.0, 1.0, 2.5, 4.0, 1.0, 5.0, 7.5, 10.0, -1.0, 4.0, 6.0, 0.0, 1.0, 2.0, 5.0];
Config.filterDecays = [0.0, 0.0, 0.0, 0.0, 10.0, 7.0, 4.0, 0.5, -10.0, -7.0, -4.0, 0.2, 0.2, 0.3, 0.0, 0.0, -6.0, 0.0];
Config.filterVolumes = [0.2, 0.4, 0.7, 1.0, 0.5, 0.75, 1.0, 0.5, 0.4, 0.7, 1.0, 0.5, 0.75, 0.4, 0.4, 1.0, 0.5, 1.75];
Config.transitionNames = ["seamless", "sudden", "smooth", "slide", "trill", "click", "bow", "blip"];
Config.effectNames = ["none", "vibrato light", "vibrato delayed", "vibrato heavy", "tremolo light", "tremolo heavy", "alien", "stutter", "strum"];
Config.effectVibratos = [0.0, 0.15, 0.3, 0.45, 0.0, 0.0, 1.0, 0.0, 0.05];
Config.effectTremolos = [0.0, 0.0, 0.0, 0.0, 0.25, 0.5, 0.0, 1.0, 0.025];
Config.effectVibratoDelays = [0, 0, 3, 0, 0, 0, 0, 0];
Config.chorusNames = ["union", "shimmer", "hum", "honky tonk", "dissonant", "fifths", "octaves", "spinner", "detune", "bowed", "rising", "vibrate", "fourths", "bass", "dirty", "stationary", "harmonic (legacy)", "recurve", "voiced", "fluctuate"];
Config.chorusIntervals = [0.0, 0.02, 0.05, 0.1, 0.25, 3.5, 6, 0.02, 0.0, 0.02, 1.0, 3.5, 4, 0, 0.0, 3.5, 0.0, 0.005, 0.25, 12];
Config.chorusOffsets = [0.0, 0.0, 0.0, 0.0, 0.0, 3.5, 6, 0.0, 0.25, 0.0, 0.7, 7, 4, -7, 0.1, 0.0, 0.0, 0.0, 3.0, 0.0];
Config.chorusVolumes = [0.9, 0.9, 1.0, 1.0, 0.95, 0.95, 0.9, 1.0, 1.0, 1.0, 0.95, 0.975, 0.95, 1.0, 0.975, 0.9, 1.0, 1.0, 0.9, 1.0];
Config.chorusSigns = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0];
Config.chorusRiffApp = [0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
Config.chorusHarmonizes = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
Config.harmDisplay = ["arpeggio", "duet", "chord", "seventh", "half arpeggio", "arp-chord"];
Config.harmNames = [0, 1, 2, 3, 4, 5];
Config.fmChorusDisplay = ["none", "default", "detune", "honky tonk", "consecutive", "alt. major thirds", "alt. minor thirds", "fifths", "octaves"];
Config.fmChorusNames = [0, 1, 2, 3, 4, 5, 6, 7, 8];
Config.imuteNames = ["◉", "◎"];
Config.imuteValues = [1, 0];
Config.octoffNames = ["none", "+2 (2 octaves)", "+1 1/2 (octave and fifth)", "+1 (octave)", "+1/2 (fifth)", "-1/2 (fifth)", "-1 (octave)", "-1 1/2 (octave and fifth)", "-2 (2 octaves"];
Config.octoffValues = [0.0, 24.0, 19.0, 12.0, 7.0, -7.0, -12.0, -19.0, -24.0];
Config.volumeNames = ["loudest", "loud", "medium", "quiet", "quietest", "mute", "i", "couldnt", "be", "bothered"];
Config.volumeValues = [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, -1.0];
Config.volumeMValues = [0.0, 0.5, 1.0, 1.5, 2.0, -1.0];
Config.ipanValues = [-1.0, -0.75, -0.5, -0.25, 0.0, 0.25, 0.5, 0.75, 1.0];
Config.operatorCount = 4;
Config.operatorAlgorithmNames = [
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
Config.midiAlgorithmNames = ["1<(2 3 4)", "1<(2 3<4)", "1<2<(3 4)", "1<(2 3)<4", "1<2<3<4", "1<3 2<4", "1 2<(3 4)", "1 2<3<4", "(1 2)<3<4", "(1 2)<(3 4)", "1 2 3<4", "(1 2 3)<4", "1 2 3 4"];
Config.operatorModulatedBy = [
    [[2, 3, 4], [], [], []],
    [[2, 3], [], [4], []],
    [[2], [3, 4], [], []],
    [[2, 3], [4], [4], []],
    [[2], [3], [4], []],
    [[3], [4], [], []],
    [[], [3, 4], [], []],
    [[], [3], [4], []],
    [[3], [3], [4], []],
    [[3, 4], [3, 4], [], []],
    [[], [], [4], []],
    [[4], [4], [4], []],
    [[], [], [], []],
];
Config.operatorAssociatedCarrier = [
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
Config.operatorCarrierCounts = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4];
Config.operatorCarrierChorus = [
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
Config.operatorAmplitudeMax = 15;
Config.operatorFrequencyNames = ["1×", "~1×", "2×", "~2×", "3×", "4×", "5×", "6×", "7×", "8×", "9×", "10×", "11×", "13×", "16×", "20×"];
Config.midiFrequencyNames = ["1x", "~1x", "2x", "~2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x", "11x", "13x", "16x", "20x"];
Config.operatorFrequencies = [1.0, 1.0, 2.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 16.0, 20.0];
Config.operatorHzOffsets = [0.0, 1.5, 0.0, -1.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
Config.operatorAmplitudeSigns = [1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
Config.operatorEnvelopeNames = ["custom", "steady", "punch", "flare 1", "flare 2", "flare 3", "pluck 1", "pluck 2", "pluck 3", "swell 1", "swell 2", "swell 3", "tremolo1", "tremolo2", "tremolo3", "custom flare", "custom tremolo", "flute 1", "flute 2", "flute 3"];
Config.operatorEnvelopeType = [0, 1, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 3, 5, 6, 6, 6];
Config.operatorSpecialCustomVolume = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false];
Config.operatorEnvelopeSpeed = [0.0, 0.0, 0.0, 32.0, 8.0, 2.0, 32.0, 8.0, 2.0, 32.0, 8.0, 2.0, 4.0, 2.0, 1.0, 8.0, 0.0, 16.0, 8.0, 4.0];
Config.operatorEnvelopeInverted = [false, false, false, false, false, false, false, false, false, true, true, true, false, false, false, false, false, false, false, false];
Config.operatorFeedbackNames = [
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
Config.midiFeedbackNames = [
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
Config.operatorFeedbackIndices = [
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
    [[2], [1], [], []],
    [[3], [], [1], []],
    [[4], [], [], [1]],
    [[], [3], [2], []],
    [[], [4], [], [2]],
    [[], [], [4], [3]],
];
Config.pitchChannelTypeNames = ["chip", "FM (expert)", "PWM (beta)"];
Config.pitchChannelTypeValues = [0, 1, 3];
Config.drumChannelTypeNames = ["noise"];
Config.instrumentTypeNames = ["chip", "FM", "noise", "PWM"];
Config.themeNames = ["Default", "ModBox 2.0", "Artic", "Cinnamon Roll [!]", "Ocean", "Rainbow [!]", "Float [!]", "Windows", "Grassland", "Dessert", "Kahootiest", "Beam to the Bit [!]", "Pretty Egg", "Poniryoshka", "Gameboy [!]", "Woodkid", "Midnight", "Snedbox", "unnamed", "Piano [!] [↻]", "Halloween", "FrozenOver❄️"];
Config.volumeColorPallet = ["#777777", "#c4ffa3", "#42dcff", "#ba8418", "#090b3a", "#ff00cb", "#878787", "#15a0db", "#74bc21", "#ff0000", "#66bf39", "#fefe00", "#f01d7a", "#ffc100", "#8bac0f", "#ef3027", "#aa5599", "#a53a3d", "#ffffff", "#ff0000", "#9e2200", "#ed2d2d"];
Config.sliderOneColorPallet = ["#9900cc", "#00ff00", "#ffffff", "#ba8418", "#5982ff", "#ff0000", "#ffffff", "#2779c2", "#a0d168", "#ff6254", "#ff3355", "#fefe00", "#6b003a", "#4b4b4b", "#9bbc0f", "#e83c4e", "#445566", "#a53a3d", "#ffffff", "#ffffff", "#9e2200", "#38ef17"];
Config.sliderOctaveColorPallet = ["#444444", "#00ff00", "#a5eeff", "#e59900", "#4449a3", "#43ff00", "#ffffff", "#295294", "#74bc21", "#ff5e3a", "#eb670f", "#0001fc", "#ffb1f4", "#5f4c99", "#9bbc0f", "#ef3027", "#444444", "#444444", "#ffffff", "#211616", "#9e2200", "#ffffff"];
Config.sliderOctaveNotchColorPallet = ["#886644", "#ffffff", "#cefffd", "#ffff25", "#3dffdb", "#0400ff", "#c9c9c9", "#fdd01d", "#20330a", "#fff570", "#ff3355", "#fa0103", "#b4001b", "#ff8291", "#8bac0f", "#ffedca", "#aa5599", "#a53a3d", "#ffffff", "#ff4c4c", "#701800", "#ed2d2d"];
Config.buttonColorPallet = ["#ffffff", "#00ff00", "#42dcff", "#ffff25", "#4449a3", "#f6ff00", "#000000", "#fdd01d", "#69c400", "#fffc5b", "#66bf39", "#fefe00", "#75093e", "#818383", "#8bac0f", "#ffedca", "#000000", "#ffffff", "#ffffff", "#ffffff", "#9e2200", "#38ef17"];
Config.noteOne = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
Config.noteTwo = ["#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#9e2200"];
Config.noteThree = ["#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
Config.noteFour = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#9e2200"];
Config.noteSix = ["#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#9e2200"];
Config.noteSeven = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
Config.noteEight = ["#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#9e2200"];
Config.noteFive = ["#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
Config.noteNine = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#9e2200"];
Config.noteTen = ["#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#9e2200"];
Config.noteEleven = ["#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#9e2200"];
Config.noteTwelve = ["#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#7a7a7a", "#bfbfbf", "#bfbfbf", "#9e2200"];
Config.baseNoteColorPallet = ["#886644", "#c4ffa3", "#eafffe", "#f5bb00", "#090b3a", "#ffaaaa", "#ffffff", "#da4e2a", "#20330a", "#fffc5b", "#45a3e5", "#fefe00", "#fffafa", "#1a2844", "#9bbc0f", "#fff6fe", "#222222", "#886644", "#ffffa0", "#ffffff", "#681701", "#88bce8"];
Config.secondNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#ffceaa", "#ededed", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#9bbc0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#99c8ef"];
Config.thirdNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#ffdfaa", "#cecece", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#9bbc0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#abd3f4"];
Config.fourthNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#fff5aa", "#bababa", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#8bac0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#b8d7f2"];
Config.sixthNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#e8ffaa", "#afafaf", "#444444", "#444444", "#444444", "#444444", "#fa0103", "#444444", "#faf4c3", "#8bac0f", "#41323b", "#222222", "#10997e", "#ffffa0", "#ffffff", "#754a3f", "#cbe0f2"];
Config.seventhNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#bfffb2", "#a5a5a5", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#8bac0f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#e5f0f9"];
Config.eigthNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#b2ffc8", "#999999", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#306230", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#ffffff"];
Config.fifthNoteColorPallet = ["#446688", "#96fffb", "#b7f1ff", "#f5bb00", "#3f669b", "#b2ffe4", "#8e8e8e", "#5d9511", "#74bc21", "#ff5e3a", "#864cbf", "#111111", "#ff91ce", "#dabbe6", "#306230", "#fff6fe", "#444444", "#60389b", "#ffffa0", "#ffffff", "#914300", "#e5f0f9"];
Config.ninthNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#b2f3ff", "#828282", "#444444", "#444444", "#444444", "#444444", "#0001fc", "#444444", "#444444", "#306230", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#cbe0f2"];
Config.tenNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#b2b3ff", "#777777", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#0f380f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#b8d7f2"];
Config.elevenNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#e0b2ff", "#565656", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#0f380f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#abd3f4"];
Config.twelveNoteColorPallet = ["#444444", "#444444", "#444444", "#f5bb00", "#444444", "#ffafe9", "#282828", "#444444", "#444444", "#444444", "#444444", "#111111", "#444444", "#444444", "#0f380f", "#41323b", "#222222", "#444444", "#ffffa0", "#ffffff", "#754a3f", "#99c8ef"];
Config.channelOneBrightColorPallet = "#25f3ff";
Config.channelTwoBrightColorPallet = "#44ff44";
Config.channelThreeBrightColorPallet = "#ffff25";
Config.channelFourBrightColorPallet = "#ff9752";
Config.channelFiveBrightColorPallet = "#ff90ff";
Config.channelSixBrightColorPallet = "#9f31ea";
Config.channelSevenBrightColorPallet = "#2b6aff";
Config.channelEightBrightColorPallet = "#00ff9f";
Config.channelNineBrightColorPallet = "#ffbf00";
Config.channelTenBrightColorPallet = "#d85d00";
Config.channelElevenBrightColorPallet = "#ff00a1";
Config.channelTwelveBrightColorPallet = "#c26afc";
Config.channelThirteenBrightColorPallet = "#ff1616";
Config.channelFourteenBrightColorPallet = "#ffffff";
Config.channelFifteenBrightColorPallet = "#768dfc";
Config.channelSixteenBrightColorPallet = "#a5ff00";
Config.channelOneDimColorPallet = "#0099a1";
Config.channelTwoDimColorPallet = "#439143";
Config.channelThreeDimColorPallet = "#a1a100";
Config.channelFourDimColorPallet = "#c75000";
Config.channelFiveDimColorPallet = "#d020d0";
Config.channelSixDimColorPallet = "#552377";
Config.channelSevenDimColorPallet = "#221b89";
Config.channelEightDimColorPallet = "#00995f";
Config.channelNineDimColorPallet = "#d6b03e";
Config.channelTenDimColorPallet = "#b25915";
Config.channelElevenDimColorPallet = "#891a60";
Config.channelTwelveDimColorPallet = "#965cbc";
Config.channelThirteenDimColorPallet = "#991010";
Config.channelFourteenDimColorPallet = "#aaaaaa";
Config.channelFifteenDimColorPallet = "#5869BD";
Config.channelSixteenDimColorPallet = "#7c9b42";
Config.pitchChannelColorsDim = [Config.channelOneDimColorPallet, Config.channelTwoDimColorPallet, Config.channelThreeDimColorPallet, Config.channelFourDimColorPallet, Config.channelFiveDimColorPallet, Config.channelSixDimColorPallet, Config.channelSevenDimColorPallet, Config.channelEightDimColorPallet, Config.channelNineDimColorPallet, Config.channelTenDimColorPallet, Config.channelElevenDimColorPallet, Config.channelTwelveDimColorPallet];
Config.pitchChannelColorsBright = [Config.channelOneBrightColorPallet, Config.channelTwoBrightColorPallet, Config.channelThreeBrightColorPallet, Config.channelFourBrightColorPallet, Config.channelFiveBrightColorPallet, Config.channelSixBrightColorPallet, Config.channelSevenBrightColorPallet, Config.channelEightBrightColorPallet, Config.channelNineBrightColorPallet, Config.channelTenBrightColorPallet, Config.channelElevenBrightColorPallet, Config.channelTwelveBrightColorPallet];
Config.pitchNoteColorsDim = [Config.channelOneDimColorPallet, Config.channelTwoDimColorPallet, Config.channelThreeDimColorPallet, Config.channelFourDimColorPallet, Config.channelFiveDimColorPallet, Config.channelSixDimColorPallet, Config.channelSevenDimColorPallet, Config.channelEightDimColorPallet, Config.channelNineDimColorPallet, Config.channelTenDimColorPallet, Config.channelElevenDimColorPallet, Config.channelTwelveDimColorPallet];
Config.pitchNoteColorsBright = [Config.channelOneBrightColorPallet, Config.channelTwoBrightColorPallet, Config.channelThreeBrightColorPallet, Config.channelFourBrightColorPallet, Config.channelFiveBrightColorPallet, Config.channelSixBrightColorPallet, Config.channelSevenBrightColorPallet, Config.channelEightBrightColorPallet, Config.channelNineBrightColorPallet, Config.channelTenBrightColorPallet, Config.channelElevenBrightColorPallet, Config.channelTwelveBrightColorPallet];
Config.drumChannelColorsDim = [Config.channelThirteenDimColorPallet, Config.channelFourteenDimColorPallet, Config.channelFifteenDimColorPallet, Config.channelSixteenDimColorPallet];
Config.drumChannelColorsBright = [Config.channelThirteenBrightColorPallet, Config.channelFourteenBrightColorPallet, Config.channelFifteenBrightColorPallet, Config.channelSixteenBrightColorPallet];
Config.drumNoteColorsDim = [Config.channelThirteenDimColorPallet, Config.channelFourteenDimColorPallet, Config.channelFifteenDimColorPallet, Config.channelSixteenDimColorPallet];
Config.drumNoteColorsBright = [Config.channelThirteenBrightColorPallet, Config.channelFourteenBrightColorPallet, Config.channelFifteenBrightColorPallet, Config.channelSixteenBrightColorPallet];
Config.midiPitchChannelNames = ["cyan channel", "yellow channel", "orange channel", "green channel", "purple channel", "blue channel"];
Config.midiDrumChannelNames = ["gray channel", "brown channel", "indigo channel"];
Config.midiSustainInstruments = [
    0x47,
    0x50,
    0x46,
    0x44,
    0x51,
    0x51,
    0x51,
    0x51,
    0x4A,
];
Config.midiDecayInstruments = [
    0x2E,
    0x2E,
    0x06,
    0x18,
    0x19,
    0x19,
    0x6A,
    0x6A,
    0x21,
];
Config.drumInterval = 6;
Config.drumCount = 12;
Config.pitchCount = 37;
Config.maxPitch = 84;
Config.pitchChannelCountMin = 0;
Config.pitchChannelCountMax = 12;
Config.drumChannelCountMin = 0;
Config.drumChannelCountMax = 4;
Config.waves = [
    Config._centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 7.0 / 15.0, 9.0 / 15.0, 11.0 / 15.0, 13.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 13.0 / 15.0, 11.0 / 15.0, 9.0 / 15.0, 7.0 / 15.0, 5.0 / 15.0, 3.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -3.0 / 15.0, -5.0 / 15.0, -7.0 / 15.0, -9.0 / 15.0, -11.0 / 15.0, -13.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -13.0 / 15.0, -11.0 / 15.0, -9.0 / 15.0, -7.0 / 15.0, -5.0 / 15.0, -3.0 / 15.0, -1.0 / 15.0]),
    Config._centerWave([1.0, -1.0]),
    Config._centerWave([1.0, -1.0, -1.0, -1.0]),
    Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
    Config._centerWave([1.0 / 31.0, 3.0 / 31.0, 5.0 / 31.0, 7.0 / 31.0, 9.0 / 31.0, 11.0 / 31.0, 13.0 / 31.0, 15.0 / 31.0, 17.0 / 31.0, 19.0 / 31.0, 21.0 / 31.0, 23.0 / 31.0, 25.0 / 31.0, 27.0 / 31.0, 29.0 / 31.0, 31.0 / 31.0, -31.0 / 31.0, -29.0 / 31.0, -27.0 / 31.0, -25.0 / 31.0, -23.0 / 31.0, -21.0 / 31.0, -19.0 / 31.0, -17.0 / 31.0, -15.0 / 31.0, -13.0 / 31.0, -11.0 / 31.0, -9.0 / 31.0, -7.0 / 31.0, -5.0 / 31.0, -3.0 / 31.0, -1.0 / 31.0]),
    Config._centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]),
    Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]),
    Config._centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]),
    Config._centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]),
    Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0]),
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
Config.wavesMixC = [
    Config._centerWave([1.0 / 15.0, 3.0 / 15.0, 5.0 / 15.0, 7.0 / 15.0, 9.0 / 15.0, 11.0 / 15.0, 13.0 / 15.0, 15.0 / 15.0, 15.0 / 15.0, 13.0 / 15.0, 11.0 / 15.0, 9.0 / 15.0, 7.0 / 15.0, 5.0 / 15.0, 3.0 / 15.0, 1.0 / 15.0, -1.0 / 15.0, -3.0 / 15.0, -5.0 / 15.0, -7.0 / 15.0, -9.0 / 15.0, -11.0 / 15.0, -13.0 / 15.0, -15.0 / 15.0, -15.0 / 15.0, -13.0 / 15.0, -11.0 / 15.0, -9.0 / 15.0, -7.0 / 15.0, -5.0 / 15.0, -3.0 / 15.0, -1.0 / 15.0]),
    Config._centerWave([1.0, -1.0]),
    Config._centerWave([1.0, -1.0, -1.0, -1.0]),
    Config._centerWave([1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0]),
    Config._centerWave([1.0 / 31.0, 3.0 / 31.0, 5.0 / 31.0, 7.0 / 31.0, 9.0 / 31.0, 11.0 / 31.0, 13.0 / 31.0, 15.0 / 31.0, 17.0 / 31.0, 19.0 / 31.0, 21.0 / 31.0, 23.0 / 31.0, 25.0 / 31.0, 27.0 / 31.0, 29.0 / 31.0, 31.0 / 31.0, -31.0 / 31.0, -29.0 / 31.0, -27.0 / 31.0, -25.0 / 31.0, -23.0 / 31.0, -21.0 / 31.0, -19.0 / 31.0, -17.0 / 31.0, -15.0 / 31.0, -13.0 / 31.0, -11.0 / 31.0, -9.0 / 31.0, -7.0 / 31.0, -5.0 / 31.0, -3.0 / 31.0, -1.0 / 31.0]),
    Config._centerWave([0.0, -0.2, -0.4, -0.6, -0.8, -1.0, 1.0, -0.8, -0.6, -0.4, -0.2, 1.0, 0.8, 0.6, 0.4, 0.2]),
    Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0]),
    Config._centerWave([1.0, -1.0, 1.0, -1.0, 1.0, 0.0]),
    Config._centerWave([0.0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.0, -0.2, -0.4, -0.5, -0.6, -0.7, -0.8, -0.85, -0.9, -0.95, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -0.95, -0.9, -0.85, -0.8, -0.7, -0.6, -0.5, -0.4, -0.2]),
    Config._centerWave([1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0]),
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
Config.pwmwaves = [
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
Config.sineWaveLength = 1 << 8;
Config.sineWaveMask = Config.sineWaveLength - 1;
Config.sineWave = Config.generateSineWave();
export function toNameMap(array) {
    const dictionary = {};
    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        value.index = i;
        dictionary[value.name] = value;
    }
    const result = array;
    result.dictionary = dictionary;
    return result;
}
//# sourceMappingURL=SynthConfig.js.map