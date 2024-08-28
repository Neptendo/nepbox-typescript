import { Config } from "./SynthConfig";
class BitFieldReader {
    constructor(base64CharCodeToInt, source, startIndex, stopIndex) {
        this._bits = [];
        this._readIndex = 0;
        for (let i = startIndex; i < stopIndex; i++) {
            const value = base64CharCodeToInt[source.charCodeAt(i)];
            this._bits.push((value >> 5) & 0x1);
            this._bits.push((value >> 4) & 0x1);
            this._bits.push((value >> 3) & 0x1);
            this._bits.push((value >> 2) & 0x1);
            this._bits.push((value >> 1) & 0x1);
            this._bits.push(value & 0x1);
        }
    }
    read(bitCount) {
        let result = 0;
        while (bitCount > 0) {
            result = result << 1;
            result += this._bits[this._readIndex++];
            bitCount--;
        }
        return result;
    }
    readLongTail(minValue, minBits) {
        let result = minValue;
        let numBits = minBits;
        while (this._bits[this._readIndex++]) {
            result += 1 << numBits;
            numBits++;
        }
        while (numBits > 0) {
            numBits--;
            if (this._bits[this._readIndex++]) {
                result += 1 << numBits;
            }
        }
        return result;
    }
    readPartDuration() {
        return this.readLongTail(1, 2);
    }
    readPinCount() {
        return this.readLongTail(1, 0);
    }
    readPitchInterval() {
        if (this.read(1)) {
            return -this.readLongTail(1, 3);
        }
        else {
            return this.readLongTail(1, 3);
        }
    }
}
class BitFieldWriter {
    constructor() {
        this._bits = [];
    }
    write(bitCount, value) {
        bitCount--;
        while (bitCount >= 0) {
            this._bits.push((value >>> bitCount) & 1);
            bitCount--;
        }
    }
    writeLongTail(minValue, minBits, value) {
        if (value < minValue)
            throw new Error("value out of bounds");
        value -= minValue;
        let numBits = minBits;
        while (value >= (1 << numBits)) {
            this._bits.push(1);
            value -= 1 << numBits;
            numBits++;
        }
        this._bits.push(0);
        while (numBits > 0) {
            numBits--;
            this._bits.push((value >>> numBits) & 1);
        }
    }
    writePartDuration(value) {
        this.writeLongTail(1, 2, value);
    }
    writePinCount(value) {
        this.writeLongTail(1, 0, value);
    }
    writePitchInterval(value) {
        if (value < 0) {
            this.write(1, 1);
            this.writeLongTail(1, 3, -value);
        }
        else {
            this.write(1, 0);
            this.writeLongTail(1, 3, value);
        }
    }
    concat(other) {
        this._bits = this._bits.concat(other._bits);
    }
    encodeBase64(base64IntToCharCode, buffer) {
        for (let i = 0; i < this._bits.length; i += 6) {
            const value = (this._bits[i] << 5) | (this._bits[i + 1] << 4) | (this._bits[i + 2] << 3) | (this._bits[i + 3] << 2) | (this._bits[i + 4] << 1) | this._bits[i + 5];
            buffer.push(base64IntToCharCode[value]);
        }
        return buffer;
    }
    lengthBase64() {
        return Math.ceil(this._bits.length / 6);
    }
}
export function makeNotePin(interval, time, volume) {
    return { interval: interval, time: time, volume: volume };
}
export function makeNote(pitch, start, end, volume, fadeout = false) {
    return {
        pitches: [pitch],
        pins: [makeNotePin(0, 0, volume), makeNotePin(0, end - start, fadeout ? 0 : volume)],
        start: start,
        end: end,
    };
}
export class Pattern {
    constructor() {
        this.notes = [];
        this.instrument = 0;
    }
    cloneNotes() {
        const result = [];
        for (const oldNote of this.notes) {
            const newNote = makeNote(-1, oldNote.start, oldNote.end, 3);
            newNote.pitches = oldNote.pitches.concat();
            newNote.pins = [];
            for (const oldPin of oldNote.pins) {
                newNote.pins.push(makeNotePin(oldPin.interval, oldPin.time, oldPin.volume));
            }
            result.push(newNote);
        }
        return result;
    }
    reset() {
        this.notes.length = 0;
        this.instrument = 0;
    }
}
export class Operator {
    constructor(index) {
        this.frequency = 0;
        this.amplitude = 0;
        this.envelope = 0;
        this.reset(index);
    }
    reset(index) {
        this.frequency = 0;
        this.amplitude = (index <= 1) ? Config.operatorAmplitudeMax : 0;
        this.envelope = 1;
    }
    copy(other) {
        this.frequency = other.frequency;
        this.amplitude = other.amplitude;
        this.envelope = other.envelope;
    }
}
export class Instrument {
    constructor() {
        this.type = 0;
        this.wave = 1;
        this.filter = 1;
        this.transition = 1;
        this.effect = 0;
        this.harm = 0;
        this.fmChorus = 1;
        this.imute = 0;
        this.octoff = 0;
        this.chorus = 0;
        this.volume = 0;
        this.ipan = 4;
        this.algorithm = 0;
        this.feedbackType = 0;
        this.feedbackAmplitude = 0;
        this.feedbackEnvelope = 1;
        this.operators = [];
        for (let i = 0; i < Config.operatorCount; i++) {
            this.operators.push(new Operator(i));
        }
    }
    reset() {
        this.type = 0;
        this.wave = 1;
        this.filter = 1;
        this.transition = 1;
        this.effect = 0;
        this.harm = 0;
        this.fmChorus = 1;
        this.imute = 0;
        this.ipan = 4;
        this.octoff = 0;
        this.chorus = 0;
        this.volume = 0;
        this.algorithm = 0;
        this.feedbackType = 0;
        this.feedbackAmplitude = 0;
        this.feedbackEnvelope = 1;
        for (let i = 0; i < this.operators.length; i++) {
            this.operators[i].reset(i);
        }
    }
    setTypeAndReset(type) {
        this.type = type;
        switch (type) {
            case 0:
                this.wave = 1;
                this.filter = 1;
                this.transition = 1;
                this.effect = 0;
                this.harm = 0;
                this.imute = 0;
                this.ipan = 4;
                this.octoff = 0;
                this.chorus = 0;
                this.volume = 0;
                break;
            case 1:
                this.wave = 1;
                this.transition = 1;
                this.volume = 0;
                this.imute = 0;
                this.ipan = 4;
                this.harm = 0;
                this.octoff = 0;
                break;
            case 2:
                this.transition = 1;
                this.octoff = 0;
                this.fmChorus = 1;
                this.ipan = 4;
                this.effect = 0;
                this.algorithm = 0;
                this.feedbackType = 0;
                this.feedbackAmplitude = 0;
                this.feedbackEnvelope = 1;
                this.volume = 0;
                for (let i = 0; i < this.operators.length; i++) {
                    this.operators[i].reset(i);
                }
                break;
            case 3:
                this.wave = 1;
                this.filter = 1;
                this.transition = 1;
                this.effect = 0;
                this.harm = 0;
                this.imute = 0;
                this.ipan = 4;
                this.octoff = 0;
                this.chorus = 0;
                this.volume = 0;
                break;
        }
    }
    copy(other) {
        this.type = other.type;
        this.wave = other.wave;
        this.filter = other.filter;
        this.transition = other.transition;
        this.effect = other.effect;
        this.chorus = other.chorus;
        this.volume = other.volume;
        this.harm = other.harm;
        this.fmChorus = other.fmChorus;
        this.imute = other.imute;
        this.ipan = other.ipan;
        this.octoff = other.octoff;
        this.algorithm = other.algorithm;
        this.feedbackType = other.feedbackType;
        this.feedbackAmplitude = other.feedbackAmplitude;
        this.feedbackEnvelope = other.feedbackEnvelope;
        for (let i = 0; i < this.operators.length; i++) {
            this.operators[i].copy(other.operators[i]);
        }
    }
}
export class Channel {
    constructor() {
        this.octave = 0;
        this.instruments = [];
        this.patterns = [];
        this.bars = [];
    }
}
export class Song {
    constructor(string) {
        this.channels = [];
        this._fingerprint = [];
        if (string != undefined) {
            this.fromBase64String(string);
        }
        else {
            this.initToDefault(true);
        }
    }
    getChannelCount() {
        return this.pitchChannelCount + this.drumChannelCount;
    }
    getChannelUnusedCount() {
        return (Config.pitchChannelCountMax + Config.drumChannelCountMax) - (this.pitchChannelCount + this.drumChannelCount);
    }
    getThemeName() {
        return Config.themeNames[this.theme];
    }
    getTimeSig() {
        return this.beatsPerBar + "/" + this.partsPerBeat + " with " + this.barCount + " bars.";
    }
    getScaleNKey() {
        return ' "' + Config.scaleNames[this.scale] + '" and your key is ' + Config.keyNames[this.key];
    }
    getChannelIsDrum(channel) {
        return (channel >= this.pitchChannelCount);
    }
    getChannelColorDim(channel) {
        return channel < this.pitchChannelCount ? Config.pitchChannelColorsDim[channel] : Config.drumChannelColorsDim[channel - this.pitchChannelCount];
    }
    getChannelColorBright(channel) {
        return channel < this.pitchChannelCount ? Config.pitchChannelColorsBright[channel] : Config.drumChannelColorsBright[channel - this.pitchChannelCount];
    }
    getNoteColorDim(channel) {
        return channel < this.pitchChannelCount ? Config.pitchNoteColorsDim[channel] : Config.drumNoteColorsDim[channel - this.pitchChannelCount];
    }
    getNoteColorBright(channel) {
        return channel < this.pitchChannelCount ? Config.pitchNoteColorsBright[channel] : Config.drumNoteColorsBright[channel - this.pitchChannelCount];
    }
    initToDefault(andResetChannels = true) {
        this.scale = 0;
        this.theme = 0;
        this.key = Config.keyNames.length - 1;
        this.mix = 1;
        this.sampleRate = 2;
        this.loopStart = 0;
        this.loopLength = 4;
        this.tempo = 7;
        this.reverb = 0;
        this.blend = 0;
        this.riff = 0;
        this.detune = 0;
        this.muff = 0;
        this.beatsPerBar = 8;
        this.barCount = 16;
        this.patternsPerChannel = 8;
        this.partsPerBeat = 4;
        this.instrumentsPerChannel = 1;
        if (andResetChannels) {
            this.pitchChannelCount = 4;
            this.drumChannelCount = 1;
            for (let channelIndex = 0; channelIndex < this.getChannelCount(); channelIndex++) {
                if (this.channels.length <= channelIndex) {
                    this.channels[channelIndex] = new Channel();
                }
                const channel = this.channels[channelIndex];
                channel.octave = 4 - channelIndex;
                for (let pattern = 0; pattern < this.patternsPerChannel; pattern++) {
                    if (channel.patterns.length <= pattern) {
                        channel.patterns[pattern] = new Pattern();
                    }
                    else {
                        channel.patterns[pattern].reset();
                    }
                }
                channel.patterns.length = this.patternsPerChannel;
                for (let instrument = 0; instrument < this.instrumentsPerChannel; instrument++) {
                    if (channel.instruments.length <= instrument) {
                        channel.instruments[instrument] = new Instrument();
                    }
                    else {
                        channel.instruments[instrument].reset();
                    }
                }
                channel.instruments.length = this.instrumentsPerChannel;
                for (let bar = 0; bar < this.barCount; bar++) {
                    channel.bars[bar] = bar < 4 ? 1 : 0;
                }
                channel.bars.length = this.barCount;
            }
            this.channels.length = this.getChannelCount();
        }
    }
    toBase64String() {
        let bits;
        let buffer = [];
        const base64IntToCharCode = Song._base64IntToCharCode;
        buffer.push(base64IntToCharCode[Song._latestVersion]);
        buffer.push(110, base64IntToCharCode[this.pitchChannelCount], base64IntToCharCode[this.drumChannelCount]);
        buffer.push(122, base64IntToCharCode[this.theme]);
        buffer.push(115, base64IntToCharCode[this.scale]);
        buffer.push(117, base64IntToCharCode[this.mix]);
        buffer.push(124, base64IntToCharCode[this.sampleRate]);
        buffer.push(107, base64IntToCharCode[this.key]);
        buffer.push(108, base64IntToCharCode[this.loopStart >> 6], base64IntToCharCode[this.loopStart & 0x3f]);
        buffer.push(101, base64IntToCharCode[(this.loopLength - 1) >> 6], base64IntToCharCode[(this.loopLength - 1) & 0x3f]);
        buffer.push(116, base64IntToCharCode[this.tempo]);
        buffer.push(109, base64IntToCharCode[this.reverb]);
        buffer.push(120, base64IntToCharCode[this.blend]);
        buffer.push(121, base64IntToCharCode[this.riff]);
        buffer.push(72, base64IntToCharCode[this.detune]);
        buffer.push(36, base64IntToCharCode[this.muff]);
        buffer.push(97, base64IntToCharCode[this.beatsPerBar - 1]);
        buffer.push(103, base64IntToCharCode[(this.barCount - 1) >> 6], base64IntToCharCode[(this.barCount - 1) & 0x3f]);
        buffer.push(106, base64IntToCharCode[this.patternsPerChannel - 1]);
        buffer.push(105, base64IntToCharCode[this.instrumentsPerChannel - 1]);
        buffer.push(114, base64IntToCharCode[Config.partCounts.indexOf(this.partsPerBeat)]);
        buffer.push(111);
        for (let channel = 0; channel < this.getChannelCount(); channel++) {
            buffer.push(base64IntToCharCode[this.channels[channel].octave]);
        }
        for (let channel = 0; channel < this.getChannelCount(); channel++) {
            for (let i = 0; i < this.instrumentsPerChannel; i++) {
                const instrument = this.channels[channel].instruments[i];
                if (channel < this.pitchChannelCount) {
                    buffer.push(84, base64IntToCharCode[instrument.type]);
                    if (instrument.type == 0) {
                        buffer.push(119, base64IntToCharCode[instrument.wave]);
                        buffer.push(102, base64IntToCharCode[instrument.filter]);
                        buffer.push(100, base64IntToCharCode[instrument.transition]);
                        buffer.push(99, base64IntToCharCode[instrument.effect]);
                        buffer.push(113, base64IntToCharCode[instrument.harm]);
                        buffer.push(71, base64IntToCharCode[instrument.imute]);
                        buffer.push(76, base64IntToCharCode[instrument.ipan]);
                        buffer.push(66, base64IntToCharCode[instrument.octoff]);
                        buffer.push(104, base64IntToCharCode[instrument.chorus]);
                        buffer.push(118, base64IntToCharCode[instrument.volume]);
                    }
                    else if (instrument.type == 1) {
                        buffer.push(100, base64IntToCharCode[instrument.transition]);
                        buffer.push(99, base64IntToCharCode[instrument.effect]);
                        buffer.push(66, base64IntToCharCode[instrument.octoff]);
                        buffer.push(35, base64IntToCharCode[instrument.fmChorus]);
                        buffer.push(71, base64IntToCharCode[instrument.imute]);
                        buffer.push(76, base64IntToCharCode[instrument.ipan]);
                        buffer.push(65, base64IntToCharCode[instrument.algorithm]);
                        buffer.push(70, base64IntToCharCode[instrument.feedbackType]);
                        buffer.push(95, base64IntToCharCode[instrument.feedbackAmplitude]);
                        buffer.push(86, base64IntToCharCode[instrument.feedbackEnvelope]);
                        buffer.push(118, base64IntToCharCode[instrument.volume]);
                        buffer.push(81);
                        for (let o = 0; o < Config.operatorCount; o++) {
                            buffer.push(base64IntToCharCode[instrument.operators[o].frequency]);
                        }
                        buffer.push(80);
                        for (let o = 0; o < Config.operatorCount; o++) {
                            buffer.push(base64IntToCharCode[instrument.operators[o].amplitude]);
                        }
                        buffer.push(69);
                        for (let o = 0; o < Config.operatorCount; o++) {
                            buffer.push(base64IntToCharCode[instrument.operators[o].envelope]);
                        }
                    }
                    else if (instrument.type == 3) {
                        buffer.push(119, base64IntToCharCode[instrument.wave]);
                        buffer.push(102, base64IntToCharCode[instrument.filter]);
                        buffer.push(100, base64IntToCharCode[instrument.transition]);
                        buffer.push(99, base64IntToCharCode[instrument.effect]);
                        buffer.push(113, base64IntToCharCode[instrument.harm]);
                        buffer.push(71, base64IntToCharCode[instrument.imute]);
                        buffer.push(76, base64IntToCharCode[instrument.ipan]);
                        buffer.push(66, base64IntToCharCode[instrument.octoff]);
                        buffer.push(104, base64IntToCharCode[instrument.chorus]);
                        buffer.push(118, base64IntToCharCode[instrument.volume]);
                    }
                    else {
                        throw new Error("Unknown instrument type.");
                    }
                }
                else {
                    buffer.push(84, base64IntToCharCode[2]);
                    buffer.push(119, base64IntToCharCode[instrument.wave]);
                    buffer.push(100, base64IntToCharCode[instrument.transition]);
                    buffer.push(118, base64IntToCharCode[instrument.volume]);
                    buffer.push(71, base64IntToCharCode[instrument.imute]);
                    buffer.push(113, base64IntToCharCode[instrument.harm]);
                    buffer.push(66, base64IntToCharCode[instrument.octoff]);
                    buffer.push(76, base64IntToCharCode[instrument.ipan]);
                }
            }
        }
        buffer.push(98);
        bits = new BitFieldWriter();
        let neededBits = 0;
        while ((1 << neededBits) < this.patternsPerChannel + 1)
            neededBits++;
        for (let channel = 0; channel < this.getChannelCount(); channel++)
            for (let i = 0; i < this.barCount; i++) {
                bits.write(neededBits, this.channels[channel].bars[i]);
            }
        bits.encodeBase64(base64IntToCharCode, buffer);
        buffer.push(112);
        bits = new BitFieldWriter();
        let neededInstrumentBits = 0;
        while ((1 << neededInstrumentBits) < this.instrumentsPerChannel)
            neededInstrumentBits++;
        for (let channel = 0; channel < this.getChannelCount(); channel++) {
            const isDrum = this.getChannelIsDrum(channel);
            const octaveOffset = isDrum ? 0 : this.channels[channel].octave * 12;
            let lastPitch = (isDrum ? 4 : 12) + octaveOffset;
            const recentPitches = isDrum ? [4, 6, 7, 2, 3, 8, 0, 10] : [12, 19, 24, 31, 36, 7, 0];
            const recentShapes = [];
            for (let i = 0; i < recentPitches.length; i++) {
                recentPitches[i] += octaveOffset;
            }
            for (const p of this.channels[channel].patterns) {
                bits.write(neededInstrumentBits, p.instrument);
                if (p.notes.length > 0) {
                    bits.write(1, 1);
                    let curPart = 0;
                    for (const t of p.notes) {
                        if (t.start > curPart) {
                            bits.write(2, 0);
                            bits.writePartDuration(t.start - curPart);
                        }
                        const shapeBits = new BitFieldWriter();
                        for (let i = 1; i < t.pitches.length; i++)
                            shapeBits.write(1, 1);
                        if (t.pitches.length < 4)
                            shapeBits.write(1, 0);
                        shapeBits.writePinCount(t.pins.length - 1);
                        shapeBits.write(2, t.pins[0].volume);
                        let shapePart = 0;
                        let startPitch = t.pitches[0];
                        let currentPitch = startPitch;
                        const pitchBends = [];
                        for (let i = 1; i < t.pins.length; i++) {
                            const pin = t.pins[i];
                            const nextPitch = startPitch + pin.interval;
                            if (currentPitch != nextPitch) {
                                shapeBits.write(1, 1);
                                pitchBends.push(nextPitch);
                                currentPitch = nextPitch;
                            }
                            else {
                                shapeBits.write(1, 0);
                            }
                            shapeBits.writePartDuration(pin.time - shapePart);
                            shapePart = pin.time;
                            shapeBits.write(2, pin.volume);
                        }
                        const shapeString = String.fromCharCode.apply(null, shapeBits.encodeBase64(base64IntToCharCode, []));
                        const shapeIndex = recentShapes.indexOf(shapeString);
                        if (shapeIndex == -1) {
                            bits.write(2, 1);
                            bits.concat(shapeBits);
                        }
                        else {
                            bits.write(1, 1);
                            bits.writeLongTail(0, 0, shapeIndex);
                            recentShapes.splice(shapeIndex, 1);
                        }
                        recentShapes.unshift(shapeString);
                        if (recentShapes.length > 10)
                            recentShapes.pop();
                        const allPitches = t.pitches.concat(pitchBends);
                        for (let i = 0; i < allPitches.length; i++) {
                            const pitch = allPitches[i];
                            const pitchIndex = recentPitches.indexOf(pitch);
                            if (pitchIndex == -1) {
                                let interval = 0;
                                let pitchIter = lastPitch;
                                if (pitchIter < pitch) {
                                    while (pitchIter != pitch) {
                                        pitchIter++;
                                        if (recentPitches.indexOf(pitchIter) == -1)
                                            interval++;
                                    }
                                }
                                else {
                                    while (pitchIter != pitch) {
                                        pitchIter--;
                                        if (recentPitches.indexOf(pitchIter) == -1)
                                            interval--;
                                    }
                                }
                                bits.write(1, 0);
                                bits.writePitchInterval(interval);
                            }
                            else {
                                bits.write(1, 1);
                                bits.write(3, pitchIndex);
                                recentPitches.splice(pitchIndex, 1);
                            }
                            recentPitches.unshift(pitch);
                            if (recentPitches.length > 8)
                                recentPitches.pop();
                            if (i == t.pitches.length - 1) {
                                lastPitch = t.pitches[0];
                            }
                            else {
                                lastPitch = pitch;
                            }
                        }
                        curPart = t.end;
                    }
                    if (curPart < this.beatsPerBar * this.partsPerBeat) {
                        bits.write(2, 0);
                        bits.writePartDuration(this.beatsPerBar * this.partsPerBeat - curPart);
                    }
                }
                else {
                    bits.write(1, 0);
                }
            }
        }
        let stringLength = bits.lengthBase64();
        let digits = [];
        while (stringLength > 0) {
            digits.unshift(base64IntToCharCode[stringLength & 0x3f]);
            stringLength = stringLength >> 6;
        }
        buffer.push(base64IntToCharCode[digits.length]);
        Array.prototype.push.apply(buffer, digits);
        bits.encodeBase64(base64IntToCharCode, buffer);
        if (buffer.length >= 65535)
            throw new Error("Song hash code too long.");
        return String.fromCharCode.apply(null, buffer);
    }
    fromBase64String(compressed) {
        if (compressed == null || compressed == "") {
            this.initToDefault(true);
            return;
        }
        let charIndex = 0;
        while (compressed.charCodeAt(charIndex) <= 32)
            charIndex++;
        if (compressed.charCodeAt(charIndex) == 35)
            charIndex++;
        if (compressed.charCodeAt(charIndex) == 123) {
            this.fromJsonObject(JSON.parse(charIndex == 0 ? compressed : compressed.substring(charIndex)));
            return;
        }
        const version = Song._base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
        if (version == -1 || version > Song._latestVersion || version < Song._oldestVersion)
            return;
        const beforeThree = version < 3;
        const beforeFour = version < 4;
        const beforeFive = version < 5;
        const beforeSix = version < 6;
        const base64CharCodeToInt = Song._base64CharCodeToInt;
        this.initToDefault(beforeSix);
        if (beforeThree) {
            for (const channel of this.channels)
                channel.instruments[0].transition = 0;
            this.channels[3].instruments[0].wave = 0;
        }
        let instrumentChannelIterator = 0;
        let instrumentIndexIterator = -1;
        while (charIndex < compressed.length) {
            const command = compressed.charCodeAt(charIndex++);
            let channel;
            if (command == 110) {
                this.pitchChannelCount = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                this.drumChannelCount = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                this.pitchChannelCount = Song._clip(Config.pitchChannelCountMin, Config.pitchChannelCountMax + 1, this.pitchChannelCount);
                this.drumChannelCount = Song._clip(Config.drumChannelCountMin, Config.drumChannelCountMax + 1, this.drumChannelCount);
                for (let channelIndex = this.channels.length; channelIndex < this.getChannelCount(); channelIndex++) {
                    this.channels[channelIndex] = new Channel();
                }
                this.channels.length = this.getChannelCount();
            }
            else if (command == 115) {
                this.scale = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                if (beforeThree && this.scale == 10)
                    this.scale = 11;
            }
            else if (command == 117) {
                this.mix = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
            }
            else if (command == 107) {
                this.key = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
            }
            else if (command == 122) {
                this.theme = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
            }
            else if (command == 108) {
                if (beforeFive) {
                    this.loopStart = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                }
                else {
                    this.loopStart = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                }
            }
            else if (command == 101) {
                if (beforeFive) {
                    this.loopLength = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                }
                else {
                    this.loopLength = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                }
            }
            else if (command == 116) {
                if (beforeFour) {
                    this.tempo = [1, 4, 7, 10][base64CharCodeToInt[compressed.charCodeAt(charIndex++)]];
                }
                else {
                    this.tempo = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                }
                this.tempo = Song._clip(0, Config.tempoSteps, this.tempo);
            }
            else if (command == 109) {
                this.reverb = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                this.reverb = Song._clip(0, Config.reverbRange, this.reverb);
            }
            else if (command == 120) {
                this.blend = Song._clip(0, Config.blendRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 121) {
                this.riff = Song._clip(0, Config.riffRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 124) {
                this.sampleRate = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
            }
            else if (command == 72) {
                this.detune = Song._clip(0, Config.detuneRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 36) {
                this.muff = Song._clip(0, Config.muffRange, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 97) {
                if (beforeThree) {
                    this.beatsPerBar = [6, 7, 8, 9, 10][base64CharCodeToInt[compressed.charCodeAt(charIndex++)]];
                }
                else {
                    this.beatsPerBar = base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                }
                this.beatsPerBar = Math.max(Config.beatsPerBarMin, Math.min(Config.beatsPerBarMax, this.beatsPerBar));
            }
            else if (command == 103) {
                this.barCount = (base64CharCodeToInt[compressed.charCodeAt(charIndex++)] << 6) + base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                this.barCount = Math.max(Config.barCountMin, Math.min(Config.barCountMax, this.barCount));
                for (let channel = 0; channel < this.getChannelCount(); channel++) {
                    for (let bar = this.channels[channel].bars.length; bar < this.barCount; bar++) {
                        this.channels[channel].bars[bar] = 1;
                    }
                    this.channels[channel].bars.length = this.barCount;
                }
            }
            else if (command == 106) {
                this.patternsPerChannel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                this.patternsPerChannel = Math.max(1, Math.min(Config.barCountMax, this.patternsPerChannel));
                for (let channel = 0; channel < this.getChannelCount(); channel++) {
                    for (let pattern = this.channels[channel].patterns.length; pattern < this.patternsPerChannel; pattern++) {
                        this.channels[channel].patterns[pattern] = new Pattern();
                    }
                    this.channels[channel].patterns.length = this.patternsPerChannel;
                }
            }
            else if (command == 105) {
                this.instrumentsPerChannel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1;
                this.instrumentsPerChannel = Math.max(Config.instrumentsPerChannelMin, Math.min(Config.instrumentsPerChannelMax, this.instrumentsPerChannel));
                for (let channel = 0; channel < this.getChannelCount(); channel++) {
                    for (let instrument = this.channels[channel].instruments.length; instrument < this.instrumentsPerChannel; instrument++) {
                        this.channels[channel].instruments[instrument] = new Instrument();
                    }
                    this.channels[channel].instruments.length = this.instrumentsPerChannel;
                }
            }
            else if (command == 114) {
                this.partsPerBeat = Config.partCounts[base64CharCodeToInt[compressed.charCodeAt(charIndex++)]];
            }
            else if (command == 111) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    this.channels[channel].octave = Song._clip(0, 5, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
                else {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        this.channels[channel].octave = Song._clip(0, 5, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    }
                }
            }
            else if (command == 84) {
                instrumentIndexIterator++;
                if (instrumentIndexIterator >= this.instrumentsPerChannel) {
                    instrumentChannelIterator++;
                    instrumentIndexIterator = 0;
                }
                const isPitchChannel = instrumentChannelIterator < this.pitchChannelCount;
                const instrument = this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator];
                const rawInstrumentType = Song._clip(0, 4, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                let instrumentType = rawInstrumentType;
                if (instrumentType == 2 && isPitchChannel) {
                    instrumentType = 3;
                }
                instrument.setTypeAndReset(instrumentType);
            }
            else if (command == 119) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    this.channels[channel].instruments[0].wave = Song._clip(0, Config.waveNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
                else if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        const isDrums = (channel >= this.pitchChannelCount);
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].wave = Song._clip(0, isDrums ? Config.drumNames.length : Config.waveNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    const isDrums = (instrumentChannelIterator >= this.pitchChannelCount);
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].wave = Song._clip(0, isDrums ? Config.drumNames.length : Config.waveNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 102) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    this.channels[channel].instruments[0].filter = [1, 3, 4, 5][Song._clip(0, Config.filterNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)])];
                }
                else if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].filter = Song._clip(0, Config.filterNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)] + 1);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].filter = Song._clip(0, Config.filterNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 100) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    this.channels[channel].instruments[0].transition = Song._clip(0, Config.transitionNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
                else if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].transition = Song._clip(0, Config.transitionNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].transition = Song._clip(0, Config.transitionNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 99) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    let effect = Song._clip(0, Config.effectNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                    if (effect == 1)
                        effect = 3;
                    else if (effect == 3)
                        effect = 5;
                    this.channels[channel].instruments[0].effect = effect;
                }
                else if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].effect = Song._clip(0, Config.effectNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].effect = Song._clip(0, Config.effectNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 104) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    this.channels[channel].instruments[0].chorus = Song._clip(0, Config.chorusNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
                else if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].chorus = Song._clip(0, Config.chorusNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].chorus = Song._clip(0, Config.chorusNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 113) {
                if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].harm = Song._clip(0, Config.harmNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].harm = Song._clip(0, Config.harmNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 35) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].fmChorus = Song._clip(0, Config.fmChorusNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 71) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].imute = Song._clip(0, Config.imuteNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 76) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].ipan = Song._clip(0, Config.ipanValues.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 66) {
                if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].octoff = Song._clip(0, Config.octoffNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].octoff = Song._clip(0, Config.octoffNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 118) {
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    this.channels[channel].instruments[0].volume = Song._clip(0, Config.volumeNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
                else if (beforeSix) {
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.instrumentsPerChannel; i++) {
                            this.channels[channel].instruments[i].volume = Song._clip(0, Config.volumeNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                        }
                    }
                }
                else {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].volume = Song._clip(0, Config.volumeNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 65) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].algorithm = Song._clip(0, Config.operatorAlgorithmNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 70) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].feedbackType = Song._clip(0, Config.operatorFeedbackNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 95) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].feedbackAmplitude = Song._clip(0, Config.operatorAmplitudeMax + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 86) {
                this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].feedbackEnvelope = Song._clip(0, Config.operatorEnvelopeNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
            }
            else if (command == 81) {
                for (let o = 0; o < Config.operatorCount; o++) {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].operators[o].frequency = Song._clip(0, Config.operatorFrequencyNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 80) {
                for (let o = 0; o < Config.operatorCount; o++) {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].operators[o].amplitude = Song._clip(0, Config.operatorAmplitudeMax + 1, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 69) {
                for (let o = 0; o < Config.operatorCount; o++) {
                    this.channels[instrumentChannelIterator].instruments[instrumentIndexIterator].operators[o].envelope = Song._clip(0, Config.operatorEnvelopeNames.length, base64CharCodeToInt[compressed.charCodeAt(charIndex++)]);
                }
            }
            else if (command == 98) {
                let subStringLength;
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    const barCount = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    subStringLength = Math.ceil(barCount * 0.5);
                    const bits = new BitFieldReader(base64CharCodeToInt, compressed, charIndex, charIndex + subStringLength);
                    for (let i = 0; i < barCount; i++) {
                        this.channels[channel].bars[i] = bits.read(3) + 1;
                    }
                }
                else if (beforeFive) {
                    let neededBits = 0;
                    while ((1 << neededBits) < this.patternsPerChannel)
                        neededBits++;
                    subStringLength = Math.ceil(this.getChannelCount() * this.barCount * neededBits / 6);
                    const bits = new BitFieldReader(base64CharCodeToInt, compressed, charIndex, charIndex + subStringLength);
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.barCount; i++) {
                            this.channels[channel].bars[i] = bits.read(neededBits) + 1;
                        }
                    }
                }
                else {
                    let neededBits = 0;
                    while ((1 << neededBits) < this.patternsPerChannel + 1)
                        neededBits++;
                    subStringLength = Math.ceil(this.getChannelCount() * this.barCount * neededBits / 6);
                    const bits = new BitFieldReader(base64CharCodeToInt, compressed, charIndex, charIndex + subStringLength);
                    for (channel = 0; channel < this.getChannelCount(); channel++) {
                        for (let i = 0; i < this.barCount; i++) {
                            this.channels[channel].bars[i] = bits.read(neededBits);
                        }
                    }
                }
                charIndex += subStringLength;
            }
            else if (command == 112) {
                let bitStringLength = 0;
                if (beforeThree) {
                    channel = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    charIndex++;
                    bitStringLength = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    bitStringLength = bitStringLength << 6;
                    bitStringLength += base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                }
                else {
                    channel = 0;
                    let bitStringLengthLength = base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                    while (bitStringLengthLength > 0) {
                        bitStringLength = bitStringLength << 6;
                        bitStringLength += base64CharCodeToInt[compressed.charCodeAt(charIndex++)];
                        bitStringLengthLength--;
                    }
                }
                const bits = new BitFieldReader(base64CharCodeToInt, compressed, charIndex, charIndex + bitStringLength);
                charIndex += bitStringLength;
                let neededInstrumentBits = 0;
                while ((1 << neededInstrumentBits) < this.instrumentsPerChannel)
                    neededInstrumentBits++;
                while (true) {
                    const isDrum = this.getChannelIsDrum(channel);
                    const octaveOffset = isDrum ? 0 : this.channels[channel].octave * 12;
                    let note = null;
                    let pin = null;
                    let lastPitch = (isDrum ? 4 : 12) + octaveOffset;
                    const recentPitches = isDrum ? [4, 6, 7, 2, 3, 8, 0, 10] : [12, 19, 24, 31, 36, 7, 0];
                    const recentShapes = [];
                    for (let i = 0; i < recentPitches.length; i++) {
                        recentPitches[i] += octaveOffset;
                    }
                    for (let i = 0; i < this.patternsPerChannel; i++) {
                        const newPattern = this.channels[channel].patterns[i];
                        newPattern.reset();
                        newPattern.instrument = bits.read(neededInstrumentBits);
                        if (!beforeThree && bits.read(1) == 0)
                            continue;
                        let curPart = 0;
                        const newNotes = newPattern.notes;
                        while (curPart < this.beatsPerBar * this.partsPerBeat) {
                            const useOldShape = bits.read(1) == 1;
                            let newNote = false;
                            let shapeIndex = 0;
                            if (useOldShape) {
                                shapeIndex = bits.readLongTail(0, 0);
                            }
                            else {
                                newNote = bits.read(1) == 1;
                            }
                            if (!useOldShape && !newNote) {
                                const restLength = bits.readPartDuration();
                                curPart += restLength;
                            }
                            else {
                                let shape;
                                let pinObj;
                                let pitch;
                                if (useOldShape) {
                                    shape = recentShapes[shapeIndex];
                                    recentShapes.splice(shapeIndex, 1);
                                }
                                else {
                                    shape = {};
                                    shape.pitchCount = 1;
                                    while (shape.pitchCount < 4 && bits.read(1) == 1)
                                        shape.pitchCount++;
                                    shape.pinCount = bits.readPinCount();
                                    shape.initialVolume = bits.read(2);
                                    shape.pins = [];
                                    shape.length = 0;
                                    shape.bendCount = 0;
                                    for (let j = 0; j < shape.pinCount; j++) {
                                        pinObj = {};
                                        pinObj.pitchBend = bits.read(1) == 1;
                                        if (pinObj.pitchBend)
                                            shape.bendCount++;
                                        shape.length += bits.readPartDuration();
                                        pinObj.time = shape.length;
                                        pinObj.volume = bits.read(2);
                                        shape.pins.push(pinObj);
                                    }
                                }
                                recentShapes.unshift(shape);
                                if (recentShapes.length > 10)
                                    recentShapes.pop();
                                note = makeNote(0, curPart, curPart + shape.length, shape.initialVolume);
                                note.pitches = [];
                                note.pins.length = 1;
                                const pitchBends = [];
                                for (let j = 0; j < shape.pitchCount + shape.bendCount; j++) {
                                    const useOldPitch = bits.read(1) == 1;
                                    if (!useOldPitch) {
                                        const interval = bits.readPitchInterval();
                                        pitch = lastPitch;
                                        let intervalIter = interval;
                                        while (intervalIter > 0) {
                                            pitch++;
                                            while (recentPitches.indexOf(pitch) != -1)
                                                pitch++;
                                            intervalIter--;
                                        }
                                        while (intervalIter < 0) {
                                            pitch--;
                                            while (recentPitches.indexOf(pitch) != -1)
                                                pitch--;
                                            intervalIter++;
                                        }
                                    }
                                    else {
                                        const pitchIndex = bits.read(3);
                                        pitch = recentPitches[pitchIndex];
                                        recentPitches.splice(pitchIndex, 1);
                                    }
                                    recentPitches.unshift(pitch);
                                    if (recentPitches.length > 8)
                                        recentPitches.pop();
                                    if (j < shape.pitchCount) {
                                        note.pitches.push(pitch);
                                    }
                                    else {
                                        pitchBends.push(pitch);
                                    }
                                    if (j == shape.pitchCount - 1) {
                                        lastPitch = note.pitches[0];
                                    }
                                    else {
                                        lastPitch = pitch;
                                    }
                                }
                                pitchBends.unshift(note.pitches[0]);
                                for (const pinObj of shape.pins) {
                                    if (pinObj.pitchBend)
                                        pitchBends.shift();
                                    pin = makeNotePin(pitchBends[0] - note.pitches[0], pinObj.time, pinObj.volume);
                                    note.pins.push(pin);
                                }
                                curPart = note.end;
                                newNotes.push(note);
                            }
                        }
                    }
                    if (beforeThree) {
                        break;
                    }
                    else {
                        channel++;
                        if (channel >= this.getChannelCount())
                            break;
                    }
                }
            }
        }
    }
    toJsonObject(enableIntro = true, loopCount = 1, enableOutro = true) {
        const channelArray = [];
        for (let channel = 0; channel < this.getChannelCount(); channel++) {
            const instrumentArray = [];
            const isDrum = this.getChannelIsDrum(channel);
            for (let i = 0; i < this.instrumentsPerChannel; i++) {
                const instrument = this.channels[channel].instruments[i];
                if (isDrum) {
                    instrumentArray.push({
                        type: Config.instrumentTypeNames[2],
                        volume: (5 - instrument.volume) * 20,
                        imute: Config.imuteNames[instrument.imute],
                        wave: Config.drumNames[instrument.wave],
                        transition: Config.transitionNames[instrument.transition],
                        octoff: Config.octoffNames[instrument.octoff],
                        ipan: Config.ipanValues[instrument.ipan],
                    });
                }
                else {
                    if (instrument.type == 0) {
                        instrumentArray.push({
                            type: Config.instrumentTypeNames[instrument.type],
                            volume: (5 - instrument.volume) * 20,
                            wave: Config.waveNames[instrument.wave],
                            transition: Config.transitionNames[instrument.transition],
                            filter: Config.filterNames[instrument.filter],
                            chorus: Config.chorusNames[instrument.chorus],
                            effect: Config.effectNames[instrument.effect],
                            harm: Config.harmNames[instrument.harm],
                            imute: Config.imuteNames[instrument.imute],
                            octoff: Config.octoffNames[instrument.octoff],
                            ipan: Config.ipanValues[instrument.ipan],
                        });
                    }
                    else if (instrument.type == 1) {
                        const operatorArray = [];
                        for (const operator of instrument.operators) {
                            operatorArray.push({
                                frequency: Config.operatorFrequencyNames[operator.frequency],
                                amplitude: operator.amplitude,
                                envelope: Config.operatorEnvelopeNames[operator.envelope],
                            });
                        }
                        instrumentArray.push({
                            type: Config.instrumentTypeNames[instrument.type],
                            volume: (5 - instrument.volume) * 20,
                            transition: Config.transitionNames[instrument.transition],
                            effect: Config.effectNames[instrument.effect],
                            octoff: Config.octoffNames[instrument.octoff],
                            fmChorus: Config.fmChorusNames[instrument.fmChorus],
                            algorithm: Config.operatorAlgorithmNames[instrument.algorithm],
                            feedbackType: Config.operatorFeedbackNames[instrument.feedbackType],
                            feedbackAmplitude: instrument.feedbackAmplitude,
                            feedbackEnvelope: Config.operatorEnvelopeNames[instrument.feedbackEnvelope],
                            operators: operatorArray,
                            ipan: Config.ipanValues[instrument.ipan],
                            imute: Config.imuteNames[instrument.imute],
                        });
                    }
                    else if (instrument.type == 3) {
                        instrumentArray.push({
                            type: Config.instrumentTypeNames[2],
                            volume: (5 - instrument.volume) * 20,
                            wave: Config.pwmwaveNames[instrument.wave],
                            transition: Config.transitionNames[instrument.transition],
                            filter: Config.filterNames[instrument.filter],
                            chorus: Config.chorusNames[instrument.chorus],
                            effect: Config.effectNames[instrument.effect],
                            harm: Config.harmNames[instrument.harm],
                            imute: Config.imuteNames[instrument.imute],
                            octoff: Config.octoffNames[instrument.octoff],
                            ipan: Config.ipanValues[instrument.ipan],
                        });
                    }
                    else {
                        throw new Error("Unrecognized instrument type");
                    }
                }
            }
            const patternArray = [];
            for (const pattern of this.channels[channel].patterns) {
                const noteArray = [];
                for (const note of pattern.notes) {
                    const pointArray = [];
                    for (const pin of note.pins) {
                        pointArray.push({
                            tick: pin.time + note.start,
                            pitchBend: pin.interval,
                            volume: Math.round(pin.volume * 100 / 3),
                        });
                    }
                    noteArray.push({
                        pitches: note.pitches,
                        points: pointArray,
                    });
                }
                patternArray.push({
                    instrument: pattern.instrument + 1,
                    notes: noteArray,
                });
            }
            const sequenceArray = [];
            if (enableIntro)
                for (let i = 0; i < this.loopStart; i++) {
                    sequenceArray.push(this.channels[channel].bars[i]);
                }
            for (let l = 0; l < loopCount; l++)
                for (let i = this.loopStart; i < this.loopStart + this.loopLength; i++) {
                    sequenceArray.push(this.channels[channel].bars[i]);
                }
            if (enableOutro)
                for (let i = this.loopStart + this.loopLength; i < this.barCount; i++) {
                    sequenceArray.push(this.channels[channel].bars[i]);
                }
            channelArray.push({
                type: isDrum ? "drum" : "pitch",
                octaveScrollBar: this.channels[channel].octave,
                instruments: instrumentArray,
                patterns: patternArray,
                sequence: sequenceArray,
            });
        }
        return {
            format: Song._format,
            version: Song._latestVersion,
            theme: Config.themeNames[this.theme],
            scale: Config.scaleNames[this.scale],
            mix: Config.mixNames[this.mix],
            sampleRate: Config.sampleRateNames[this.sampleRate],
            key: Config.keyNames[this.key],
            introBars: this.loopStart,
            loopBars: this.loopLength,
            beatsPerBar: this.beatsPerBar,
            ticksPerBeat: this.partsPerBeat,
            beatsPerMinute: this.getBeatsPerMinute(),
            reverb: this.reverb,
            blend: this.blend,
            riff: this.riff,
            detune: this.detune,
            muff: this.muff,
            channels: channelArray,
        };
    }
    fromJsonObject(jsonObject) {
        this.initToDefault(true);
        if (!jsonObject)
            return;
        const version = jsonObject.version;
        if (version > Song._format)
            return;
        this.scale = 11;
        if (jsonObject.scale != undefined) {
            const oldScaleNames = { "romani :)": 8, "romani :(": 9 };
            const scale = oldScaleNames[jsonObject.scale] != undefined ? oldScaleNames[jsonObject.scale] : Config.scaleNames.indexOf(jsonObject.scale);
            if (scale != -1)
                this.scale = scale;
        }
        if (jsonObject.mix != undefined) {
            this.mix = Config.mixNames.indexOf(jsonObject.mix);
            if (this.mix == -1)
                this.mix = 1;
        }
        if (jsonObject.sampleRate != undefined) {
            this.sampleRate = Config.sampleRateNames.indexOf(jsonObject.sampleRate);
            if (this.sampleRate == -1)
                this.sampleRate = 2;
        }
        if (jsonObject.key != undefined) {
            if (typeof (jsonObject.key) == "number") {
                this.key = Config.keyNames.length - 1 - (((jsonObject.key + 1200) >>> 0) % Config.keyNames.length);
            }
            else if (typeof (jsonObject.key) == "string") {
                const key = jsonObject.key;
                const letter = key.charAt(0).toUpperCase();
                const symbol = key.charAt(1).toLowerCase();
                const letterMap = { "C": 11, "D": 9, "E": 7, "F": 6, "G": 4, "A": 2, "B": 0 };
                const accidentalMap = { "#": -1, "♯": -1, "b": 1, "♭": 1 };
                let index = letterMap[letter];
                const offset = accidentalMap[symbol];
                if (index != undefined) {
                    if (offset != undefined)
                        index += offset;
                    if (index < 0)
                        index += 12;
                    index = index % 12;
                    this.key = index;
                }
            }
        }
        if (jsonObject.beatsPerMinute != undefined) {
            const bpm = jsonObject.beatsPerMinute | 0;
            this.tempo = Math.round(4.0 + 9.0 * Math.log(bpm / 120) / Math.LN2);
            this.tempo = Song._clip(0, Config.tempoSteps, this.tempo);
        }
        if (jsonObject.reverb != undefined) {
            this.reverb = Song._clip(0, Config.reverbRange, jsonObject.reverb | 0);
        }
        if (jsonObject.blend != undefined) {
            this.blend = Song._clip(0, Config.blendRange, jsonObject.blend | 0);
        }
        if (jsonObject.riff != undefined) {
            this.riff = Song._clip(0, Config.riffRange, jsonObject.riff | 0);
        }
        if (jsonObject.detune != undefined) {
            this.detune = Song._clip(0, Config.detuneRange, jsonObject.detune | 0);
        }
        if (jsonObject.muff != undefined) {
            this.muff = Song._clip(0, Config.muffRange, jsonObject.muff | 0);
        }
        if (jsonObject.beatsPerBar != undefined) {
            this.beatsPerBar = Math.max(Config.beatsPerBarMin, Math.min(Config.beatsPerBarMax, jsonObject.beatsPerBar | 0));
        }
        if (jsonObject.ticksPerBeat != undefined) {
            this.partsPerBeat = jsonObject.ticksPerBeat | 0;
            if (Config.partCounts.indexOf(this.partsPerBeat) == -1) {
                this.partsPerBeat = Config.partCounts[Config.partCounts.length - 1];
            }
        }
        let maxInstruments = 1;
        let maxPatterns = 1;
        let maxBars = 1;
        if (jsonObject.channels) {
            for (const channelObject of jsonObject.channels) {
                if (channelObject.instruments)
                    maxInstruments = Math.max(maxInstruments, channelObject.instruments.length | 0);
                if (channelObject.patterns)
                    maxPatterns = Math.max(maxPatterns, channelObject.patterns.length | 0);
                if (channelObject.sequence)
                    maxBars = Math.max(maxBars, channelObject.sequence.length | 0);
            }
        }
        this.instrumentsPerChannel = maxInstruments;
        this.patternsPerChannel = maxPatterns;
        this.barCount = maxBars;
        if (jsonObject.introBars != undefined) {
            this.loopStart = Song._clip(0, this.barCount, jsonObject.introBars | 0);
        }
        if (jsonObject.loopBars != undefined) {
            this.loopLength = Song._clip(1, this.barCount - this.loopStart + 1, jsonObject.loopBars | 0);
        }
        let pitchChannelCount = 0;
        let drumChannelCount = 0;
        if (jsonObject.channels) {
            for (let channel = 0; channel < jsonObject.channels.length; channel++) {
                let channelObject = jsonObject.channels[channel];
                if (this.channels.length <= channel)
                    this.channels[channel] = new Channel();
                if (channelObject.octaveScrollBar != undefined) {
                    this.channels[channel].octave = Song._clip(0, 5, channelObject.octaveScrollBar | 0);
                }
                for (let i = this.channels[channel].instruments.length; i < this.instrumentsPerChannel; i++) {
                    this.channels[channel].instruments[i] = new Instrument();
                }
                this.channels[channel].instruments.length = this.instrumentsPerChannel;
                for (let i = this.channels[channel].patterns.length; i < this.patternsPerChannel; i++) {
                    this.channels[channel].patterns[i] = new Pattern();
                }
                this.channels[channel].patterns.length = this.patternsPerChannel;
                for (let i = 0; i < this.barCount; i++) {
                    this.channels[channel].bars[i] = 1;
                }
                this.channels[channel].bars.length = this.barCount;
                let isDrum = false;
                if (channelObject.type) {
                    isDrum = (channelObject.type == "drum");
                }
                else {
                    isDrum = (channel >= 3);
                }
                if (isDrum)
                    drumChannelCount++;
                else
                    pitchChannelCount++;
                for (let i = 0; i < this.instrumentsPerChannel; i++) {
                    const instrument = this.channels[channel].instruments[i];
                    let instrumentObject = undefined;
                    if (channelObject.instruments)
                        instrumentObject = channelObject.instruments[i];
                    if (instrumentObject == undefined)
                        instrumentObject = {};
                    const oldTransitionNames = { "binary": 0 };
                    const transitionObject = instrumentObject.transition || instrumentObject.envelope;
                    instrument.transition = oldTransitionNames[transitionObject] != undefined ? oldTransitionNames[transitionObject] : Config.transitionNames.indexOf(transitionObject);
                    if (instrument.transition == -1)
                        instrument.transition = 1;
                    if (isDrum) {
                        if (instrumentObject.volume != undefined) {
                            instrument.volume = Song._clip(0, Config.volumeNames.length, Math.round(5 - (instrumentObject.volume | 0) / 20));
                        }
                        else {
                            instrument.volume = 0;
                        }
                        instrument.wave = Config.drumNames.indexOf(instrumentObject.wave);
                        if (instrument.wave == -1)
                            instrument.wave = 1;
                        instrument.imute = Config.imuteNames.indexOf(instrumentObject.imute);
                        if (instrument.imute == -1)
                            instrument.imute = 0;
                        instrument.ipan = Config.ipanValues.indexOf(instrumentObject.ipan);
                        if (instrument.ipan == -1)
                            instrument.ipan = 4;
                    }
                    else {
                        instrument.type = Config.instrumentTypeNames.indexOf(instrumentObject.type);
                        if (instrument.type == null)
                            instrument.type = 0;
                        if (instrument.type == 0) {
                            if (instrumentObject.volume != undefined) {
                                instrument.volume = Song._clip(0, Config.volumeNames.length, Math.round(5 - (instrumentObject.volume | 0) / 20));
                            }
                            else {
                                instrument.volume = 0;
                            }
                            instrument.wave = Config.waveNames.indexOf(instrumentObject.wave);
                            if (instrument.wave == -1)
                                instrument.wave = 1;
                            const oldFilterNames = { "sustain sharp": 1, "sustain medium": 2, "sustain soft": 3, "decay sharp": 4 };
                            instrument.filter = oldFilterNames[instrumentObject.filter] != undefined ? oldFilterNames[instrumentObject.filter] : Config.filterNames.indexOf(instrumentObject.filter);
                            if (instrument.filter == -1)
                                instrument.filter = 0;
                            instrument.chorus = Config.chorusNames.indexOf(instrumentObject.chorus);
                            if (instrument.chorus == -1)
                                instrument.chorus = 0;
                            instrument.effect = Config.effectNames.indexOf(instrumentObject.effect);
                            if (instrument.effect == -1)
                                instrument.effect = 0;
                            instrument.harm = Config.harmNames.indexOf(instrumentObject.harm);
                            if (instrument.harm == -1)
                                instrument.harm = 0;
                            instrument.octoff = Config.octoffNames.indexOf(instrumentObject.octoff);
                            if (instrument.octoff == -1)
                                instrument.octoff = 0;
                            instrument.imute = Config.imuteNames.indexOf(instrumentObject.imute);
                            if (instrument.imute == -1)
                                instrument.imute = 0;
                            instrument.ipan = Config.ipanValues.indexOf(instrumentObject.ipan);
                            if (instrument.ipan == -1)
                                instrument.ipan = 4;
                        }
                        else if (instrument.type == 3
                            || instrument.type == 2) {
                            if (instrument.type == 2) {
                                instrument.type = 3;
                            }
                            if (instrumentObject.volume != undefined) {
                                instrument.volume = Song._clip(0, Config.volumeNames.length, Math.round(5 - (instrumentObject.volume | 0) / 20));
                            }
                            else {
                                instrument.volume = 0;
                            }
                            instrument.wave = Config.pwmwaveNames.indexOf(instrumentObject.wave);
                            if (instrument.wave == -1)
                                instrument.wave = 1;
                            const oldFilterNames = { "sustain sharp": 1, "sustain medium": 2, "sustain soft": 3, "decay sharp": 4 };
                            instrument.filter = oldFilterNames[instrumentObject.filter] != undefined ? oldFilterNames[instrumentObject.filter] : Config.filterNames.indexOf(instrumentObject.filter);
                            if (instrument.filter == -1)
                                instrument.filter = 0;
                            instrument.chorus = Config.chorusNames.indexOf(instrumentObject.chorus);
                            if (instrument.chorus == -1)
                                instrument.chorus = 0;
                            instrument.effect = Config.effectNames.indexOf(instrumentObject.effect);
                            if (instrument.effect == -1)
                                instrument.effect = 0;
                            instrument.harm = Config.harmNames.indexOf(instrumentObject.harm);
                            if (instrument.harm == -1)
                                instrument.harm = 0;
                            instrument.octoff = Config.octoffNames.indexOf(instrumentObject.octoff);
                            if (instrument.octoff == -1)
                                instrument.octoff = 0;
                            instrument.imute = Config.imuteNames.indexOf(instrumentObject.imute);
                            if (instrument.imute == -1)
                                instrument.imute = 0;
                            instrument.ipan = Config.ipanValues.indexOf(instrumentObject.ipan);
                            if (instrument.ipan == -1)
                                instrument.ipan = 4;
                        }
                        else if (instrument.type == 1) {
                            instrument.effect = Config.effectNames.indexOf(instrumentObject.effect);
                            if (instrument.effect == -1)
                                instrument.effect = 0;
                            instrument.octoff = Config.octoffNames.indexOf(instrumentObject.octoff);
                            if (instrument.octoff == -1)
                                instrument.octoff = 0;
                            instrument.fmChorus = Config.fmChorusNames.indexOf(instrumentObject.fmChorus);
                            if (instrument.fmChorus == -1)
                                instrument.fmChorus = 0;
                            instrument.algorithm = Config.operatorAlgorithmNames.indexOf(instrumentObject.algorithm);
                            if (instrument.algorithm == -1)
                                instrument.algorithm = 0;
                            instrument.feedbackType = Config.operatorFeedbackNames.indexOf(instrumentObject.feedbackType);
                            if (instrument.feedbackType == -1)
                                instrument.feedbackType = 0;
                            if (instrumentObject.feedbackAmplitude != undefined) {
                                instrument.feedbackAmplitude = Song._clip(0, Config.operatorAmplitudeMax + 1, instrumentObject.feedbackAmplitude | 0);
                            }
                            else {
                                instrument.feedbackAmplitude = 0;
                            }
                            instrument.feedbackEnvelope = Config.operatorEnvelopeNames.indexOf(instrumentObject.feedbackEnvelope);
                            if (instrument.feedbackEnvelope == -1)
                                instrument.feedbackEnvelope = 0;
                            for (let j = 0; j < Config.operatorCount; j++) {
                                const operator = instrument.operators[j];
                                let operatorObject = undefined;
                                if (instrumentObject.operators)
                                    operatorObject = instrumentObject.operators[j];
                                if (operatorObject == undefined)
                                    operatorObject = {};
                                operator.frequency = Config.operatorFrequencyNames.indexOf(operatorObject.frequency);
                                if (operator.frequency == -1)
                                    operator.frequency = 0;
                                if (operatorObject.amplitude != undefined) {
                                    operator.amplitude = Song._clip(0, Config.operatorAmplitudeMax + 1, operatorObject.amplitude | 0);
                                }
                                else {
                                    operator.amplitude = 0;
                                }
                                operator.envelope = Config.operatorEnvelopeNames.indexOf(operatorObject.envelope);
                                if (operator.envelope == -1)
                                    operator.envelope = 0;
                            }
                            instrument.ipan = Config.ipanValues.indexOf(instrumentObject.ipan);
                            if (instrument.ipan == -1)
                                instrument.ipan = 4;
                            instrument.imute = Config.imuteNames.indexOf(instrumentObject.imute);
                            if (instrument.imute == -1)
                                instrument.imute = 0;
                        }
                        else {
                            throw new Error("Unrecognized instrument type.");
                        }
                    }
                }
                for (let i = 0; i < this.patternsPerChannel; i++) {
                    const pattern = this.channels[channel].patterns[i];
                    let patternObject = undefined;
                    if (channelObject.patterns)
                        patternObject = channelObject.patterns[i];
                    if (patternObject == undefined)
                        continue;
                    pattern.instrument = Song._clip(0, this.instrumentsPerChannel, (patternObject.instrument | 0) - 1);
                    if (patternObject.notes && patternObject.notes.length > 0) {
                        const maxNoteCount = Math.min(this.beatsPerBar * this.partsPerBeat, patternObject.notes.length >>> 0);
                        let tickClock = 0;
                        for (let j = 0; j < patternObject.notes.length; j++) {
                            if (j >= maxNoteCount)
                                break;
                            const noteObject = patternObject.notes[j];
                            if (!noteObject || !noteObject.pitches || !(noteObject.pitches.length >= 1) || !noteObject.points || !(noteObject.points.length >= 2)) {
                                continue;
                            }
                            const note = makeNote(0, 0, 0, 0);
                            note.pitches = [];
                            note.pins = [];
                            for (let k = 0; k < noteObject.pitches.length; k++) {
                                const pitch = noteObject.pitches[k] | 0;
                                if (note.pitches.indexOf(pitch) != -1)
                                    continue;
                                note.pitches.push(pitch);
                                if (note.pitches.length >= 4)
                                    break;
                            }
                            if (note.pitches.length < 1)
                                continue;
                            let noteClock = tickClock;
                            let startInterval = 0;
                            for (let k = 0; k < noteObject.points.length; k++) {
                                const pointObject = noteObject.points[k];
                                if (pointObject == undefined || pointObject.tick == undefined)
                                    continue;
                                const interval = (pointObject.pitchBend == undefined) ? 0 : (pointObject.pitchBend | 0);
                                const time = pointObject.tick | 0;
                                const volume = (pointObject.volume == undefined) ? 3 : Math.max(0, Math.min(3, Math.round((pointObject.volume | 0) * 3 / 100)));
                                if (time > this.beatsPerBar * this.partsPerBeat)
                                    continue;
                                if (note.pins.length == 0) {
                                    if (time < noteClock)
                                        continue;
                                    note.start = time;
                                    startInterval = interval;
                                }
                                else {
                                    if (time <= noteClock)
                                        continue;
                                }
                                noteClock = time;
                                note.pins.push(makeNotePin(interval - startInterval, time - note.start, volume));
                            }
                            if (note.pins.length < 2)
                                continue;
                            note.end = note.pins[note.pins.length - 1].time + note.start;
                            const maxPitch = isDrum ? Config.drumCount - 1 : Config.maxPitch;
                            let lowestPitch = maxPitch;
                            let highestPitch = 0;
                            for (let k = 0; k < note.pitches.length; k++) {
                                note.pitches[k] += startInterval;
                                if (note.pitches[k] < 0 || note.pitches[k] > maxPitch) {
                                    note.pitches.splice(k, 1);
                                    k--;
                                }
                                if (note.pitches[k] < lowestPitch)
                                    lowestPitch = note.pitches[k];
                                if (note.pitches[k] > highestPitch)
                                    highestPitch = note.pitches[k];
                            }
                            if (note.pitches.length < 1)
                                continue;
                            for (let k = 0; k < note.pins.length; k++) {
                                const pin = note.pins[k];
                                if (pin.interval + lowestPitch < 0)
                                    pin.interval = -lowestPitch;
                                if (pin.interval + highestPitch > maxPitch)
                                    pin.interval = maxPitch - highestPitch;
                                if (k >= 2) {
                                    if (pin.interval == note.pins[k - 1].interval &&
                                        pin.interval == note.pins[k - 2].interval &&
                                        pin.volume == note.pins[k - 1].volume &&
                                        pin.volume == note.pins[k - 2].volume) {
                                        note.pins.splice(k - 1, 1);
                                        k--;
                                    }
                                }
                            }
                            pattern.notes.push(note);
                            tickClock = note.end;
                        }
                    }
                }
                for (let i = 0; i < this.barCount; i++) {
                    this.channels[channel].bars[i] = channelObject.sequence ? Math.min(this.patternsPerChannel, channelObject.sequence[i] >>> 0) : 0;
                }
            }
        }
        this.pitchChannelCount = pitchChannelCount;
        this.drumChannelCount = drumChannelCount;
        this.channels.length = this.getChannelCount();
    }
    static _clip(min, max, val) {
        max = max - 1;
        if (val <= max) {
            if (val >= min)
                return val;
            else
                return min;
        }
        else {
            return max;
        }
    }
    getPattern(channel, bar) {
        const patternIndex = this.channels[channel].bars[bar];
        if (patternIndex == 0)
            return null;
        return this.channels[channel].patterns[patternIndex - 1];
    }
    getPatternInstrument(channel, bar) {
        const pattern = this.getPattern(channel, bar);
        return pattern == null ? 0 : pattern.instrument;
    }
    getPatternInstrumentMute(channel, bar) {
        const pattern = this.getPattern(channel, bar);
        const instrumentIndex = this.getPatternInstrument(channel, bar);
        const instrument = this.channels[channel].instruments[instrumentIndex];
        return pattern == null ? 0 : instrument.imute;
    }
    getPatternInstrumentVolume(channel, bar) {
        const pattern = this.getPattern(channel, bar);
        const instrumentIndex = this.getPatternInstrument(channel, bar);
        const instrument = this.channels[channel].instruments[instrumentIndex];
        return pattern == null ? 0 : instrument.volume;
    }
    getBeatsPerMinute() {
        return Math.round(120.0 * Math.pow(2.0, (-4.0 + this.tempo) / 9.0));
    }
    getChannelFingerprint(bar) {
        const channelCount = this.getChannelCount();
        let charCount = 0;
        for (let channel = 0; channel < channelCount; channel++) {
            if (channel < this.pitchChannelCount) {
                const instrumentIndex = this.getPatternInstrument(channel, bar);
                const instrument = this.channels[channel].instruments[instrumentIndex];
                if (instrument.type == 0) {
                    this._fingerprint[charCount++] = "c";
                }
                else if (instrument.type == 1) {
                    this._fingerprint[charCount++] = "f";
                    this._fingerprint[charCount++] = instrument.algorithm;
                    this._fingerprint[charCount++] = instrument.feedbackType;
                }
                else if (instrument.type == 3) {
                    this._fingerprint[charCount++] = "p";
                }
                else {
                    throw new Error("Unknown instrument type.");
                }
            }
            else {
                this._fingerprint[charCount++] = "d";
            }
        }
        this._fingerprint.length = charCount;
        return this._fingerprint.join("");
    }
}
Song._format = "BeepBox";
Song._oldestVersion = 2;
Song._latestVersion = 6;
Song._base64CharCodeToInt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 62, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 0, 0, 0, 0, 63, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 0, 0, 0, 0, 0];
Song._base64IntToCharCode = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 45, 95];
class SynthChannel {
    constructor() {
        this.sampleLeft = 0.0;
        this.sampleRight = 0.0;
        this.phases = [];
        this.phaseDeltas = [];
        this.volumeStarts = [];
        this.volumeDeltas = [];
        this.volumeLeft = [];
        this.volumeRight = [];
        this.phaseDeltaScale = 0.0;
        this.filter = 0.0;
        this.filterScale = 0.0;
        this.vibratoScale = 0.0;
        this.harmonyMult = 0.0;
        this.harmonyVolumeMult = 1.0;
        this.feedbackOutputs = [];
        this.feedbackMult = 0.0;
        this.feedbackDelta = 0.0;
        this.reset();
    }
    reset() {
        for (let i = 0; i < Config.operatorCount; i++) {
            this.phases[i] = 0.0;
            this.feedbackOutputs[i] = 0.0;
        }
        this.sampleLeft = 0.0;
        this.sampleRight = 0.0;
    }
}
export class Synth {
    static warmUpSynthesizer(song) {
        if (song != null) {
            for (let i = 0; i < song.instrumentsPerChannel; i++) {
                for (let j = song.pitchChannelCount; j < song.pitchChannelCount + song.drumChannelCount; j++) {
                    Config.getDrumWave(song.channels[j].instruments[i].wave);
                }
            }
            for (let i = 0; i < song.barCount; i++) {
                Synth.getGeneratedSynthesizer(song, i);
            }
        }
    }
    static operatorAmplitudeCurve(amplitude) {
        return (Math.pow(16.0, amplitude / 15.0) - 1.0) / 15.0;
    }
    get playing() {
        return !this.paused;
    }
    get playhead() {
        return this.playheadInternal;
    }
    set playhead(value) {
        if (this.song != null) {
            this.playheadInternal = Math.max(0, Math.min(this.song.barCount, value));
            let remainder = this.playheadInternal;
            this.bar = Math.floor(remainder);
            remainder = this.song.beatsPerBar * (remainder - this.bar);
            this.beat = Math.floor(remainder);
            remainder = this.song.partsPerBeat * (remainder - this.beat);
            this.part = Math.floor(remainder);
            remainder = 4 * (remainder - this.part);
            this.arpeggio = Math.floor(remainder);
            const samplesPerArpeggio = this.getSamplesPerArpeggio();
            remainder = samplesPerArpeggio * (remainder - this.arpeggio);
            this.arpeggioSampleCountdown = Math.floor(samplesPerArpeggio - remainder);
            if (this.bar < this.song.loopStart) {
                this.enableIntro = true;
            }
            if (this.bar > this.song.loopStart + this.song.loopLength) {
                this.enableOutro = true;
            }
        }
    }
    get totalSamples() {
        if (this.song == null)
            return 0;
        const samplesPerBar = this.getSamplesPerArpeggio() * 4 * this.song.partsPerBeat * this.song.beatsPerBar;
        let loopMinCount = this.loopCount;
        if (loopMinCount < 0)
            loopMinCount = 1;
        let bars = this.song.loopLength * loopMinCount;
        if (this.enableIntro)
            bars += this.song.loopStart;
        if (this.enableOutro)
            bars += this.song.barCount - (this.song.loopStart + this.song.loopLength);
        return bars * samplesPerBar;
    }
    get totalSeconds() {
        return Math.round(this.totalSamples / this.samplesPerSecond);
    }
    get totalBars() {
        if (this.song == null)
            return 0.0;
        return this.song.barCount;
    }
    constructor(song = null) {
        this.samplesPerSecond = 44100;
        this.effectDuration = 0.14;
        this.effectAngle = Math.PI * 2.0 / (this.effectDuration * this.samplesPerSecond);
        this.effectYMult = 2.0 * Math.cos(this.effectAngle);
        this.limitDecay = 1.0 / (2.0 * this.samplesPerSecond);
        this.song = null;
        this.pianoPressed = false;
        this.pianoPitch = [0];
        this.pianoChannel = 0;
        this.enableIntro = true;
        this.enableOutro = false;
        this.loopCount = -1;
        this.volume = 1.0;
        this.playheadInternal = 0.0;
        this.bar = 0;
        this.beat = 0;
        this.part = 0;
        this.arpeggio = 0;
        this.arpeggioSampleCountdown = 0;
        this.paused = true;
        this.channels = [];
        this.stillGoing = false;
        this.effectPhase = 0.0;
        this.limit = 0.0;
        this.delayLineLeft = new Float32Array(16384);
        this.delayLineRight = new Float32Array(16384);
        this.delayPosLeft = 0;
        this.delayPosRight = 0;
        this.delayFeedback0Left = 0.0;
        this.delayFeedback0Right = 0.0;
        this.delayFeedback1Left = 0.0;
        this.delayFeedback1Right = 0.0;
        this.delayFeedback2Left = 0.0;
        this.delayFeedback2Right = 0.0;
        this.delayFeedback3Left = 0.0;
        this.delayFeedback3Right = 0.0;
        this.audioProcessCallback = (audioProcessingEvent) => {
            const outputBuffer = audioProcessingEvent.outputBuffer;
            const outputDataLeft = outputBuffer.getChannelData(0);
            const outputDataRight = outputBuffer.getChannelData(1);
            this.synthesize(outputDataLeft, outputDataRight, outputBuffer.length);
        };
        if (song != null)
            this.setSong(song);
    }
    setSong(song) {
        if (typeof (song) == "string") {
            this.song = new Song(song);
        }
        else if (song instanceof Song) {
            this.song = song;
        }
    }
    spsCalc() {
        Synth.warmUpSynthesizer(this.song);
        if (this.song.sampleRate == 0)
            return 44100;
        else if (this.song.sampleRate == 1)
            return 48000;
        else if (this.song.sampleRate == 2)
            return this.audioCtx.sampleRate;
        else if (this.song.sampleRate == 3)
            return this.audioCtx.sampleRate * 4;
        else if (this.song.sampleRate == 4)
            return this.audioCtx.sampleRate * 2;
        else if (this.song.sampleRate == 5)
            return this.audioCtx.sampleRate / 2;
        else if (this.song.sampleRate == 6)
            return this.audioCtx.sampleRate / 4;
        else if (this.song.sampleRate == 7)
            return this.audioCtx.sampleRate / 8;
        else if (this.song.sampleRate == 8)
            return this.audioCtx.sampleRate / 16;
        else
            return this.audioCtx.sampleRate;
    }
    play() {
        if (!this.paused)
            return;
        this.paused = false;
        Synth.warmUpSynthesizer(this.song);
        const contextClass = (window.AudioContext);
        this.audioCtx = this.audioCtx || new contextClass();
        this.scriptNode = this.audioCtx.createScriptProcessor ? this.audioCtx.createScriptProcessor(2048, 0, 2) : this.audioCtx.createJavaScriptNode(2048, 0, 2);
        this.scriptNode.onaudioprocess = this.audioProcessCallback;
        this.scriptNode.connect(this.audioCtx.destination);
        this.scriptNode.channelCountMode = 'explicit';
        this.scriptNode.channelInterpretation = 'speakers';
        this.samplesPerSecond = this.spsCalc();
        this.effectAngle = Math.PI * 2.0 / (this.effectDuration * this.samplesPerSecond);
        this.effectYMult = 2.0 * Math.cos(this.effectAngle);
        this.limitDecay = 1.0 / (2.0 * this.samplesPerSecond);
    }
    pause() {
        if (this.paused)
            return;
        this.paused = true;
        if (this.audioCtx.close) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
        this.scriptNode = null;
    }
    snapToStart() {
        this.bar = 0;
        this.enableIntro = true;
        this.snapToBar();
    }
    snapToBar(bar) {
        if (bar !== undefined)
            this.bar = bar;
        this.playheadInternal = this.bar;
        this.beat = 0;
        this.part = 0;
        this.arpeggio = 0;
        this.arpeggioSampleCountdown = 0;
        this.effectPhase = 0.0;
        for (const channel of this.channels)
            channel.reset();
        this.delayPosLeft = 0;
        this.delayPosRight = 0;
        this.delayFeedback0Left = 0.0;
        this.delayFeedback0Right = 0.0;
        this.delayFeedback1Left = 0.0;
        this.delayFeedback1Right = 0.0;
        this.delayFeedback2Left = 0.0;
        this.delayFeedback2Right = 0.0;
        this.delayFeedback3Left = 0.0;
        this.delayFeedback3Right = 0.0;
        for (let i = 0; i < this.delayLineLeft.length; i++)
            this.delayLineLeft[i] = 0.0;
        for (let i = 0; i < this.delayLineRight.length; i++)
            this.delayLineRight[i] = 0.0;
    }
    nextBar() {
        if (!this.song)
            return;
        const oldBar = this.bar;
        this.bar++;
        if (this.enableOutro) {
            if (this.bar >= this.song.barCount) {
                this.bar = this.enableIntro ? 0 : this.song.loopStart;
            }
        }
        else {
            if (this.bar >= this.song.loopStart + this.song.loopLength || this.bar >= this.song.barCount) {
                this.bar = this.song.loopStart;
            }
        }
        this.playheadInternal += this.bar - oldBar;
    }
    prevBar() {
        if (!this.song)
            return;
        const oldBar = this.bar;
        this.bar--;
        if (this.bar < 0) {
            this.bar = this.song.loopStart + this.song.loopLength - 1;
        }
        if (this.bar >= this.song.barCount) {
            this.bar = this.song.barCount - 1;
        }
        if (this.bar < this.song.loopStart) {
            this.enableIntro = true;
        }
        if (!this.enableOutro && this.bar >= this.song.loopStart + this.song.loopLength) {
            this.bar = this.song.loopStart + this.song.loopLength - 1;
        }
        this.playheadInternal += this.bar - oldBar;
    }
    synthesize(dataLeft, dataRight, bufferLength) {
        if (this.song == null) {
            for (let i = 0; i < bufferLength; i++) {
                dataLeft[i] = 0.0;
                dataRight[i] = 0.0;
            }
            return;
        }
        const channelCount = this.song.getChannelCount();
        for (let i = this.channels.length; i < channelCount; i++) {
            this.channels[i] = new SynthChannel();
        }
        this.channels.length = channelCount;
        const samplesPerArpeggio = this.getSamplesPerArpeggio();
        let bufferIndex = 0;
        let ended = false;
        if (this.arpeggioSampleCountdown == 0 || this.arpeggioSampleCountdown > samplesPerArpeggio) {
            this.arpeggioSampleCountdown = samplesPerArpeggio;
        }
        if (this.part >= this.song.partsPerBeat) {
            this.beat++;
            this.part = 0;
            this.arpeggio = 0;
            this.arpeggioSampleCountdown = samplesPerArpeggio;
        }
        if (this.beat >= this.song.beatsPerBar) {
            this.bar++;
            this.beat = 0;
            this.part = 0;
            this.arpeggio = 0;
            this.arpeggioSampleCountdown = samplesPerArpeggio;
            if (this.loopCount == -1) {
                if (this.bar < this.song.loopStart && !this.enableIntro)
                    this.bar = this.song.loopStart;
                if (this.bar >= this.song.loopStart + this.song.loopLength && !this.enableOutro)
                    this.bar = this.song.loopStart;
            }
        }
        if (this.bar >= this.song.barCount) {
            if (this.enableOutro) {
                this.bar = 0;
                this.enableIntro = true;
                ended = true;
                this.pause();
            }
            else {
                this.bar = this.song.loopStart;
            }
        }
        if (this.bar >= this.song.loopStart) {
            this.enableIntro = false;
        }
        while (true) {
            if (ended) {
                while (bufferIndex < bufferLength) {
                    dataLeft[bufferIndex] = 0.0;
                    dataRight[bufferIndex] = 0.0;
                    bufferIndex++;
                }
                break;
            }
            const generatedSynthesizer = Synth.getGeneratedSynthesizer(this.song, this.bar);
            bufferIndex = generatedSynthesizer(this, this.song, dataLeft, dataRight, bufferLength, bufferIndex, samplesPerArpeggio);
            const finishedBuffer = (bufferIndex == -1);
            if (finishedBuffer) {
                break;
            }
            else {
                this.beat = 0;
                this.effectPhase = 0.0;
                this.bar++;
                if (this.bar < this.song.loopStart) {
                    if (!this.enableIntro)
                        this.bar = this.song.loopStart;
                }
                else {
                    this.enableIntro = false;
                }
                if (this.bar >= this.song.loopStart + this.song.loopLength) {
                    if (this.loopCount > 0)
                        this.loopCount--;
                    if (this.loopCount > 0 || !this.enableOutro) {
                        this.bar = this.song.loopStart;
                    }
                }
                if (this.bar >= this.song.barCount) {
                    this.bar = 0;
                    this.enableIntro = true;
                    ended = true;
                    this.pause();
                }
            }
        }
        this.playheadInternal = (((this.arpeggio + 1.0 - this.arpeggioSampleCountdown / samplesPerArpeggio) / 4.0 + this.part) / this.song.partsPerBeat + this.beat) / this.song.beatsPerBar + this.bar;
    }
    static computeOperatorEnvelope(envelope, time, beats, customVolume) {
        switch (Config.operatorEnvelopeType[envelope]) {
            case 0: return customVolume;
            case 1: return 1.0;
            case 4:
                let curve = 1.0 / (1.0 + time * Config.operatorEnvelopeSpeed[envelope]);
                if (Config.operatorEnvelopeInverted[envelope]) {
                    return 1.0 - curve;
                }
                else {
                    return curve;
                }
            case 5:
                if (Config.operatorSpecialCustomVolume[envelope]) {
                    return 0.5 - Math.cos(beats * 2.0 * Math.PI * (customVolume * 4)) * 0.5;
                }
                else {
                    return 0.5 - Math.cos(beats * 2.0 * Math.PI * Config.operatorEnvelopeSpeed[envelope]) * 0.5;
                }
            case 2:
                return Math.max(1.0, 2.0 - time * 10.0);
            case 3:
                if (Config.operatorSpecialCustomVolume[envelope]) {
                    const attack = 0.25 / Math.sqrt(customVolume);
                    return time < attack ? time / attack : 1.0 / (1.0 + (time - attack) * (customVolume * 16));
                }
                else {
                    const speed = Config.operatorEnvelopeSpeed[envelope];
                    const attack = 0.25 / Math.sqrt(speed);
                    return time < attack ? time / attack : 1.0 / (1.0 + (time - attack) * speed);
                }
            case 6:
                return Math.max(-1.0 - time, -2.0 + time);
            default: throw new Error("Unrecognized operator envelope type.");
        }
    }
    static computeChannelInstrument(synth, song, channel, time, sampleTime, samplesPerArpeggio, samples) {
        const isDrum = song.getChannelIsDrum(channel);
        const synthChannel = synth.channels[channel];
        const pattern = song.getPattern(channel, synth.bar);
        const instrument = song.channels[channel].instruments[pattern == null ? 0 : pattern.instrument];
        const pianoMode = (synth.pianoPressed && channel == synth.pianoChannel);
        const basePitch = isDrum ? Config.drumBasePitches[instrument.wave] : Config.keyTransposes[song.key];
        const intervalScale = isDrum ? Config.drumInterval : 1;
        const pitchDamping = isDrum ? (Config.drumWaveIsSoft[instrument.wave] ? 24.0 : 60.0) : 48.0;
        const secondsPerPart = 4.0 * samplesPerArpeggio / synth.samplesPerSecond;
        const beatsPerPart = 1.0 / song.partsPerBeat;
        synthChannel.phaseDeltaScale = 0.0;
        synthChannel.filter = 1.0;
        synthChannel.filterScale = 1.0;
        synthChannel.vibratoScale = 0.0;
        synthChannel.harmonyMult = 1.0;
        synthChannel.harmonyVolumeMult = 1.0;
        let partsSinceStart = 0.0;
        let arpeggio = synth.arpeggio;
        let arpeggioSampleCountdown = synth.arpeggioSampleCountdown;
        let pitches = null;
        let resetPhases = true;
        let intervalStart = 0.0;
        let intervalEnd = 0.0;
        let transitionVolumeStart = 1.0;
        let transitionVolumeEnd = 1.0;
        let envelopeVolumeStart = 0.0;
        let envelopeVolumeEnd = 0.0;
        let partTimeStart = 0.0;
        let partTimeEnd = 0.0;
        let decayTimeStart = 0.0;
        let decayTimeEnd = 0.0;
        for (let i = 0; i < Config.operatorCount; i++) {
            synthChannel.phaseDeltas[i] = 0.0;
            synthChannel.volumeStarts[i] = 0.0;
            synthChannel.volumeDeltas[i] = 0.0;
            synthChannel.volumeLeft[0] = 0.0;
            synthChannel.volumeRight[0] = 0.0;
        }
        if (pianoMode) {
            pitches = synth.pianoPitch;
            transitionVolumeStart = transitionVolumeEnd = 1;
            envelopeVolumeStart = envelopeVolumeEnd = 1;
            resetPhases = false;
        }
        else if (pattern != null) {
            let note = null;
            let prevNote = null;
            let nextNote = null;
            for (let i = 0; i < pattern.notes.length; i++) {
                if (pattern.notes[i].end <= time) {
                    prevNote = pattern.notes[i];
                }
                else if (pattern.notes[i].start <= time && pattern.notes[i].end > time) {
                    note = pattern.notes[i];
                }
                else if (pattern.notes[i].start > time) {
                    nextNote = pattern.notes[i];
                    break;
                }
            }
            if (note != null && prevNote != null && prevNote.end != note.start)
                prevNote = null;
            if (note != null && nextNote != null && nextNote.start != note.end)
                nextNote = null;
            if (note != null) {
                pitches = note.pitches;
                partsSinceStart = time - note.start;
                let endPinIndex;
                for (endPinIndex = 1; endPinIndex < note.pins.length - 1; endPinIndex++) {
                    if (note.pins[endPinIndex].time + note.start > time)
                        break;
                }
                const startPin = note.pins[endPinIndex - 1];
                const endPin = note.pins[endPinIndex];
                const noteStart = note.start * 4;
                const noteEnd = note.end * 4;
                const pinStart = (note.start + startPin.time) * 4;
                const pinEnd = (note.start + endPin.time) * 4;
                const tickTimeStart = time * 4 + arpeggio;
                const tickTimeEnd = time * 4 + arpeggio + 1;
                const pinRatioStart = (tickTimeStart - pinStart) / (pinEnd - pinStart);
                const pinRatioEnd = (tickTimeEnd - pinStart) / (pinEnd - pinStart);
                let envelopeVolumeTickStart = startPin.volume + (endPin.volume - startPin.volume) * pinRatioStart;
                let envelopeVolumeTickEnd = startPin.volume + (endPin.volume - startPin.volume) * pinRatioEnd;
                let transitionVolumeTickStart = 1.0;
                let transitionVolumeTickEnd = 1.0;
                let intervalTickStart = startPin.interval + (endPin.interval - startPin.interval) * pinRatioStart;
                let intervalTickEnd = startPin.interval + (endPin.interval - startPin.interval) * pinRatioEnd;
                let partTimeTickStart = startPin.time + (endPin.time - startPin.time) * pinRatioStart;
                let partTimeTickEnd = startPin.time + (endPin.time - startPin.time) * pinRatioEnd;
                let decayTimeTickStart = partTimeTickStart;
                let decayTimeTickEnd = partTimeTickEnd;
                const startRatio = 1.0 - (arpeggioSampleCountdown + samples) / samplesPerArpeggio;
                const endRatio = 1.0 - (arpeggioSampleCountdown) / samplesPerArpeggio;
                resetPhases = (tickTimeStart + startRatio - noteStart == 0.0);
                const transition = instrument.transition;
                if (tickTimeStart == noteStart) {
                    if (transition == 0) {
                        resetPhases = false;
                    }
                    else if (transition == 2) {
                        transitionVolumeTickStart = 0.0;
                    }
                    else if (transition == 3) {
                        if (prevNote == null) {
                            transitionVolumeTickStart = 0.0;
                        }
                        else if (prevNote.pins[prevNote.pins.length - 1].volume == 0 || note.pins[0].volume == 0) {
                            transitionVolumeTickStart = 0.0;
                        }
                        else {
                            intervalTickStart = (prevNote.pitches[0] + prevNote.pins[prevNote.pins.length - 1].interval - note.pitches[0]) * 0.5;
                            decayTimeTickStart = prevNote.pins[prevNote.pins.length - 1].time * 0.5;
                            resetPhases = false;
                        }
                    }
                    else if (transition == 4) {
                        transitionVolumeTickEnd = 0.0;
                    }
                    else if (transition == 5) {
                        intervalTickStart = 100.0;
                    }
                    else if (transition == 6) {
                        intervalTickStart = -1.0;
                    }
                    else if (transition == 7) {
                        transitionVolumeTickStart = 6.0;
                    }
                }
                if (tickTimeEnd == noteEnd) {
                    if (transition == 0) {
                        if (nextNote == null && note.start + endPin.time != song.partsPerBeat * song.beatsPerBar) {
                            transitionVolumeTickEnd = 0.0;
                        }
                    }
                    else if (transition == 1 || transition == 2) {
                        transitionVolumeTickEnd = 0.0;
                    }
                    else if (transition == 3) {
                        if (nextNote == null) {
                            transitionVolumeTickEnd = 0.0;
                        }
                        else if (note.pins[note.pins.length - 1].volume == 0 || nextNote.pins[0].volume == 0) {
                            transitionVolumeTickEnd = 0.0;
                        }
                        else {
                            intervalTickEnd = (nextNote.pitches[0] - note.pitches[0] + note.pins[note.pins.length - 1].interval) * 0.5;
                            decayTimeTickEnd *= 0.5;
                        }
                    }
                }
                intervalStart = intervalTickStart + (intervalTickEnd - intervalTickStart) * startRatio;
                intervalEnd = intervalTickStart + (intervalTickEnd - intervalTickStart) * endRatio;
                envelopeVolumeStart = synth.volumeConversion(envelopeVolumeTickStart + (envelopeVolumeTickEnd - envelopeVolumeTickStart) * startRatio);
                envelopeVolumeEnd = synth.volumeConversion(envelopeVolumeTickStart + (envelopeVolumeTickEnd - envelopeVolumeTickStart) * endRatio);
                transitionVolumeStart = transitionVolumeTickStart + (transitionVolumeTickEnd - transitionVolumeTickStart) * startRatio;
                transitionVolumeEnd = transitionVolumeTickStart + (transitionVolumeTickEnd - transitionVolumeTickStart) * endRatio;
                partTimeStart = note.start + partTimeTickStart + (partTimeTickEnd - partTimeTickStart) * startRatio;
                partTimeEnd = note.start + partTimeTickStart + (partTimeTickEnd - partTimeTickStart) * endRatio;
                decayTimeStart = decayTimeTickStart + (decayTimeTickEnd - decayTimeTickStart) * startRatio;
                decayTimeEnd = decayTimeTickStart + (decayTimeTickEnd - decayTimeTickStart) * endRatio;
            }
        }
        if (pitches != null) {
            if (!isDrum && instrument.type == 1) {
                let sineVolumeBoost = 1.0;
                let totalCarrierVolume = 0.0;
                const carrierCount = Config.operatorCarrierCounts[instrument.algorithm];
                for (let i = 0; i < Config.operatorCount; i++) {
                    const isCarrier = i < Config.operatorCarrierCounts[instrument.algorithm];
                    const associatedCarrierIndex = Config.operatorAssociatedCarrier[instrument.algorithm][i] - 1;
                    const pitch = pitches[(i < pitches.length) ? i : ((associatedCarrierIndex < pitches.length) ? associatedCarrierIndex : 0)] + Config.octoffValues[instrument.octoff] + (song.detune / 24);
                    const freqMult = Config.operatorFrequencies[instrument.operators[i].frequency];
                    const chorusInterval = Config.operatorCarrierChorus[Config.fmChorusNames[instrument.fmChorus]][associatedCarrierIndex];
                    const startPitch = (pitch + intervalStart) * intervalScale + chorusInterval;
                    const startFreq = freqMult * (synth.frequencyFromPitch(basePitch + startPitch)) + Config.operatorHzOffsets[instrument.operators[i].frequency];
                    synthChannel.phaseDeltas[i] = startFreq * sampleTime * Config.sineWaveLength;
                    if (resetPhases)
                        synthChannel.reset();
                    const amplitudeCurve = Synth.operatorAmplitudeCurve(instrument.operators[i].amplitude);
                    let amplitudeMult = 0;
                    if ((Config.volumeValues[instrument.volume] != -1.0 && song.mix == 2) || (Config.volumeMValues[instrument.volume] != -1.0 && song.mix != 2)) {
                        if (song.mix == 2) {
                            amplitudeMult = isCarrier ? (amplitudeCurve * Config.operatorAmplitudeSigns[instrument.operators[i].frequency]) * (1 - Config.volumeValues[instrument.volume] / 2.3) : (amplitudeCurve * Config.operatorAmplitudeSigns[instrument.operators[i].frequency]);
                        }
                        else {
                            amplitudeMult = (amplitudeCurve * Config.operatorAmplitudeSigns[instrument.operators[i].frequency]) * (1 - Config.volumeMValues[instrument.volume] / 2.3);
                        }
                    }
                    else if (Config.volumeValues[instrument.volume] != -1.0) {
                        amplitudeMult = 0;
                    }
                    else if (Config.volumeMValues[instrument.volume] != -1.0) {
                        amplitudeMult = 0;
                    }
                    let volumeStart = amplitudeMult * Config.imuteValues[instrument.imute];
                    let volumeEnd = amplitudeMult * Config.imuteValues[instrument.imute];
                    synthChannel.volumeLeft[0] = Math.min(1, 1 + Config.ipanValues[instrument.ipan]);
                    synthChannel.volumeRight[0] = Math.min(1, 1 - Config.ipanValues[instrument.ipan]);
                    if (i < carrierCount) {
                        const volumeMult = 0.03;
                        const endPitch = (pitch + intervalEnd) * intervalScale;
                        let pitchVolumeStart = 0;
                        let pitchVolumeEnd = 0;
                        if (song.mix == 3) {
                            pitchVolumeStart = Math.pow(5.0, -startPitch / pitchDamping);
                            pitchVolumeEnd = Math.pow(5.0, -endPitch / pitchDamping);
                        }
                        else {
                            pitchVolumeStart = Math.pow(2.0, -startPitch / pitchDamping);
                            pitchVolumeEnd = Math.pow(2.0, -endPitch / pitchDamping);
                        }
                        volumeStart *= pitchVolumeStart * volumeMult * transitionVolumeStart;
                        volumeEnd *= pitchVolumeEnd * volumeMult * transitionVolumeEnd;
                        totalCarrierVolume += amplitudeCurve;
                    }
                    else {
                        volumeStart *= Config.sineWaveLength * 1.5;
                        volumeEnd *= Config.sineWaveLength * 1.5;
                        sineVolumeBoost *= 1.0 - Math.min(1.0, instrument.operators[i].amplitude / 15);
                    }
                    const envelope = instrument.operators[i].envelope;
                    volumeStart *= Synth.computeOperatorEnvelope(envelope, secondsPerPart * decayTimeStart, beatsPerPart * partTimeStart, envelopeVolumeStart);
                    volumeEnd *= Synth.computeOperatorEnvelope(envelope, secondsPerPart * decayTimeEnd, beatsPerPart * partTimeEnd, envelopeVolumeEnd);
                    synthChannel.volumeStarts[i] = volumeStart;
                    synthChannel.volumeDeltas[i] = (volumeEnd - volumeStart) / samples;
                }
                const feedbackAmplitude = Config.sineWaveLength * 0.3 * instrument.feedbackAmplitude / 15.0;
                let feedbackStart = feedbackAmplitude * Synth.computeOperatorEnvelope(instrument.feedbackEnvelope, secondsPerPart * decayTimeStart, beatsPerPart * partTimeStart, envelopeVolumeStart);
                let feedbackEnd = feedbackAmplitude * Synth.computeOperatorEnvelope(instrument.feedbackEnvelope, secondsPerPart * decayTimeEnd, beatsPerPart * partTimeEnd, envelopeVolumeEnd);
                synthChannel.feedbackMult = feedbackStart;
                synthChannel.feedbackDelta = (feedbackEnd - synthChannel.feedbackMult) / samples;
                sineVolumeBoost *= 1.0 - instrument.feedbackAmplitude / 15.0;
                sineVolumeBoost *= 1.0 - Math.min(1.0, Math.max(0.0, totalCarrierVolume - 1) / 2.0);
                for (let i = 0; i < carrierCount; i++) {
                    synthChannel.volumeStarts[i] *= 1.0 + sineVolumeBoost * 3.0;
                    synthChannel.volumeDeltas[i] *= 1.0 + sineVolumeBoost * 3.0;
                }
            }
            else {
                let pitch = pitches[0];
                if (!isDrum) {
                    if (Config.harmNames[instrument.harm] == 1) {
                        let harmonyOffset = 0.0;
                        if (pitches.length == 2) {
                            harmonyOffset = pitches[1] - pitches[0];
                        }
                        else if (pitches.length == 3) {
                            harmonyOffset = pitches[(arpeggio >> 1) + 1] - pitches[0];
                        }
                        else if (pitches.length == 4) {
                            harmonyOffset = pitches[(arpeggio == 3 ? 1 : arpeggio) + 1] - pitches[0];
                        }
                        synthChannel.harmonyMult = Math.pow(2.0, harmonyOffset / 12.0);
                        synthChannel.harmonyVolumeMult = Math.pow(2.0, -harmonyOffset / pitchDamping);
                    }
                    else if (Config.harmNames[instrument.harm] == 2) {
                        let harmonyOffset = 0.0;
                        if (pitches.length == 2) {
                            harmonyOffset = pitches[1] - pitches[0];
                        }
                        else if (pitches.length == 3) {
                            harmonyOffset = pitches[2] - pitches[0];
                        }
                        else if (pitches.length == 4) {
                            harmonyOffset = pitches[(arpeggio == 3 ? 2 : arpeggio) + 1] - pitches[0];
                        }
                        synthChannel.harmonyMult = Math.pow(2.0, harmonyOffset / 12.0);
                        synthChannel.harmonyVolumeMult = Math.pow(2.0, -harmonyOffset / pitchDamping);
                    }
                    else if (Config.harmNames[instrument.harm] == 3) {
                        let harmonyOffset = 0.0;
                        if (pitches.length == 2) {
                            harmonyOffset = pitches[1] - pitches[0];
                        }
                        else if (pitches.length == 3) {
                            harmonyOffset = pitches[2] - pitches[0];
                        }
                        else if (pitches.length == 4) {
                            harmonyOffset = pitches[3] - pitches[0];
                        }
                        synthChannel.harmonyMult = Math.pow(2.0, harmonyOffset / 12.0);
                        synthChannel.harmonyVolumeMult = Math.pow(2.0, -harmonyOffset / pitchDamping);
                    }
                    else if (Config.harmNames[instrument.harm] == 4) {
                        let harmonyOffset = 0.0;
                        if (pitches.length == 2) {
                            harmonyOffset = pitches[1] - pitches[0];
                        }
                        else if (pitches.length == 3) {
                            harmonyOffset = pitches[(arpeggio >> 1) + 1] - pitches[0];
                        }
                        else if (pitches.length == 4) {
                            harmonyOffset = pitches[(arpeggio >> 1) + 2] - pitches[0];
                        }
                        synthChannel.harmonyMult = Math.pow(2.0, harmonyOffset / 12.0);
                        synthChannel.harmonyVolumeMult = Math.pow(2.0, -harmonyOffset / pitchDamping);
                    }
                    else if (Config.harmNames[instrument.harm] == 5) {
                        let harmonyOffset = 0.0;
                        if (pitches.length == 2) {
                            harmonyOffset = pitches[1] - pitches[0];
                        }
                        else if (pitches.length == 3) {
                            harmonyOffset = pitches[2] - pitches[0];
                        }
                        else if (pitches.length == 4) {
                            harmonyOffset = pitches[(arpeggio == 3 ? 2 : arpeggio)] - pitches[0];
                        }
                        synthChannel.harmonyMult = Math.pow(2.0, harmonyOffset / 12.0);
                        synthChannel.harmonyVolumeMult = Math.pow(2.0, -harmonyOffset / pitchDamping);
                    }
                    else if (Config.harmNames[instrument.harm] == 0) {
                        if (pitches.length == 2) {
                            pitch = pitches[arpeggio >> 1];
                        }
                        else if (pitches.length == 3) {
                            pitch = pitches[arpeggio == 3 ? 1 : arpeggio];
                        }
                        else if (pitches.length == 4) {
                            pitch = pitches[arpeggio];
                        }
                    }
                }
                else {
                    if (Config.harmNames[instrument.harm] == 0) {
                        if (pitches.length == 1) {
                            pitch = pitches[0] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 2) {
                            pitch = pitches[arpeggio >> 1] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 3) {
                            pitch = pitches[arpeggio == 3 ? 1 : arpeggio] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 4) {
                            pitch = pitches[arpeggio] + Config.octoffValues[instrument.octoff];
                        }
                    }
                    else if (Config.harmNames[instrument.harm] == 1) {
                        if (pitches.length == 1) {
                            pitch = pitches[0] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 2) {
                            pitch = (pitches[1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 3) {
                            pitch = (pitches[(arpeggio >> 1) + 1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 4) {
                            pitch = (pitches[(arpeggio == 3 ? 1 : arpeggio) + 1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                    }
                    else if (Config.harmNames[instrument.harm] == 2) {
                        if (pitches.length == 1) {
                            pitch = pitches[0] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 2) {
                            pitch = (pitches[1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 3) {
                            pitch = (pitches[2] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 4) {
                            pitch = (pitches[(arpeggio == 3 ? 2 : arpeggio) + 1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                    }
                    else if (Config.harmNames[instrument.harm] == 3) {
                        if (pitches.length == 1) {
                            pitch = pitches[0] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 2) {
                            pitch = (pitches[1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 3) {
                            pitch = (pitches[2] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 4) {
                            pitch = (pitches[3] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                    }
                    else if (Config.harmNames[instrument.harm] == 4) {
                        if (pitches.length == 1) {
                            pitch = pitches[0] + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 2) {
                            pitch = (pitches[1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 3) {
                            pitch = (pitches[(arpeggio >> 1) + 1] + pitches[0]) / 2 + Config.octoffValues[instrument.octoff];
                        }
                        else if (pitches.length == 4) {
                            pitch = pitches[(arpeggio >> 1) + 2] + pitches[0] + Config.octoffValues[instrument.octoff];
                        }
                    }
                }
                const startPitch = (pitch + intervalStart) * intervalScale;
                const endPitch = (pitch + intervalEnd) * intervalScale;
                const startFreq = synth.frequencyFromPitch(basePitch + startPitch);
                const pitchVolumeStart = Math.pow(2.0, -startPitch / pitchDamping);
                const pitchVolumeEnd = Math.pow(2.0, -endPitch / pitchDamping);
                if (isDrum && Config.drumWaveIsSoft[instrument.wave]) {
                    synthChannel.filter = Math.min(1.0, startFreq * sampleTime * Config.drumPitchFilterMult[instrument.wave]);
                }
                let settingsVolumeMult;
                if (!isDrum) {
                    const filterScaleRate = Config.filterDecays[instrument.filter];
                    synthChannel.filter = Math.pow(2, -filterScaleRate * secondsPerPart * decayTimeStart);
                    const endFilter = Math.pow(2, -filterScaleRate * secondsPerPart * decayTimeEnd);
                    synthChannel.filterScale = Math.pow(endFilter / synthChannel.filter, 1.0 / samples);
                    settingsVolumeMult = 0.27 * 0.5 * Config.waveVolumes[instrument.wave] * Config.filterVolumes[instrument.filter] * Config.chorusVolumes[instrument.chorus];
                }
                else {
                    if (song.mix == 0) {
                        settingsVolumeMult = 0.19 * Config.drumVolumes[instrument.wave];
                    }
                    else if (song.mix == 3) {
                        settingsVolumeMult = 0.12 * Config.drumVolumes[instrument.wave];
                    }
                    else {
                        settingsVolumeMult = 0.09 * Config.drumVolumes[instrument.wave];
                    }
                }
                if (resetPhases && !isDrum) {
                    synthChannel.reset();
                }
                synthChannel.phaseDeltas[0] = startFreq * sampleTime;
                let instrumentVolumeMult = 0;
                if (song.mix == 2) {
                    instrumentVolumeMult = (instrument.volume == 9) ? 0.0 : Math.pow(3, -Config.volumeValues[instrument.volume]) * Config.imuteValues[instrument.imute];
                }
                else if (song.mix == 1) {
                    instrumentVolumeMult = (instrument.volume >= 5) ? 0.0 : Math.pow(3, -Config.volumeMValues[instrument.volume]) * Config.imuteValues[instrument.imute];
                }
                else {
                    instrumentVolumeMult = (instrument.volume >= 5) ? 0.0 : Math.pow(2, -Config.volumeMValues[instrument.volume]) * Config.imuteValues[instrument.imute];
                }
                synthChannel.volumeStarts[0] = transitionVolumeStart * envelopeVolumeStart * pitchVolumeStart * settingsVolumeMult * instrumentVolumeMult;
                const volumeEnd = transitionVolumeEnd * envelopeVolumeEnd * pitchVolumeEnd * settingsVolumeMult * instrumentVolumeMult;
                synthChannel.volumeDeltas[0] = (volumeEnd - synthChannel.volumeStarts[0]) / samples;
                synthChannel.volumeLeft[0] = Math.min(1, 1 + Config.ipanValues[instrument.ipan]);
                synthChannel.volumeRight[0] = Math.min(1, 1 - Config.ipanValues[instrument.ipan]);
            }
            synthChannel.phaseDeltaScale = Math.pow(2.0, ((intervalEnd - intervalStart) * intervalScale / 12.0) / samples);
            synthChannel.vibratoScale = (partsSinceStart < Config.effectVibratoDelays[instrument.effect]) ? 0.0 : Math.pow(2.0, Config.effectVibratos[instrument.effect] / 12.0) - 1.0;
        }
        else {
            synthChannel.reset();
            for (let i = 0; i < Config.operatorCount; i++) {
                synthChannel.phaseDeltas[0] = 0.0;
                synthChannel.volumeStarts[0] = 0.0;
                synthChannel.volumeDeltas[0] = 0.0;
                synthChannel.volumeLeft[0] = 0.0;
                synthChannel.volumeRight[0] = 0.0;
            }
        }
    }
    static getGeneratedSynthesizer(song, bar) {
        const fingerprint = song.getChannelFingerprint(bar);
        if (Synth.generatedSynthesizers[fingerprint] == undefined) {
            const synthSource = [];
            const instruments = [];
            for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                instruments[channel] = song.channels[channel].instruments[song.getPatternInstrument(channel, bar)];
            }
            for (const line of Synth.synthSourceTemplate) {
                if (line.indexOf("#") != -1) {
                    if (line.indexOf("// PITCH") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                            synthSource.push(line.replace(/#/g, channel + ""));
                        }
                    }
                    else if (line.indexOf("// JCHIP") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                            if (instruments[channel].type == 0) {
                                synthSource.push(line.replace(/#/g, channel + ""));
                            }
                        }
                    }
                    else if (line.indexOf("// CHIP") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                            if (instruments[channel].type == 0) {
                                synthSource.push(line.replace(/#/g, channel + ""));
                            }
                            else if (instruments[channel].type == 3) {
                                synthSource.push(line.replace(/#/g, channel + ""));
                            }
                        }
                    }
                    else if (line.indexOf("// FM") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                            if (instruments[channel].type == 1) {
                                if (line.indexOf("$") != -1) {
                                    for (let j = 0; j < Config.operatorCount; j++) {
                                        synthSource.push(line.replace(/#/g, channel + "").replace(/\$/g, j + ""));
                                    }
                                }
                                else {
                                    synthSource.push(line.replace(/#/g, channel + ""));
                                }
                            }
                        }
                    }
                    else if (line.indexOf("// PWM") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                            if (instruments[channel].type == 3) {
                                synthSource.push(line.replace(/#/g, channel + ""));
                            }
                        }
                    }
                    else if (line.indexOf("// CARRIER OUTPUTS") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                            if (instruments[channel].type == 1) {
                                const outputs = [];
                                for (let j = 0; j < Config.operatorCarrierCounts[instruments[channel].algorithm]; j++) {
                                    outputs.push("channel" + channel + "Operator" + j + "Scaled");
                                }
                                synthSource.push(line.replace(/#/g, channel + "").replace("/*channel" + channel + "Operator$Scaled*/", outputs.join(" + ")));
                            }
                        }
                    }
                    else if (line.indexOf("// NOISE") != -1) {
                        for (let channel = song.pitchChannelCount; channel < song.pitchChannelCount + song.drumChannelCount; channel++) {
                            synthSource.push(line.replace(/#/g, channel + ""));
                        }
                    }
                    else if (line.indexOf("// ALL") != -1) {
                        for (let channel = 0; channel < song.pitchChannelCount + song.drumChannelCount; channel++) {
                            synthSource.push(line.replace(/#/g, channel + ""));
                        }
                    }
                    else {
                        throw new Error("Missing channel type annotation for line: " + line);
                    }
                }
                else if (line.indexOf("// INSERT OPERATOR COMPUTATION HERE") != -1) {
                    for (let j = Config.operatorCount - 1; j >= 0; j--) {
                        for (const operatorLine of Synth.operatorSourceTemplate) {
                            for (let channel = 0; channel < song.pitchChannelCount; channel++) {
                                if (instruments[channel].type == 1) {
                                    if (operatorLine.indexOf("/* + channel#Operator@Scaled*/") != -1) {
                                        let modulators = "";
                                        for (const modulatorNumber of Config.operatorModulatedBy[instruments[channel].algorithm][j]) {
                                            modulators += " + channel" + channel + "Operator" + (modulatorNumber - 1) + "Scaled";
                                        }
                                        const feedbackIndices = Config.operatorFeedbackIndices[instruments[channel].feedbackType][j];
                                        if (feedbackIndices.length > 0) {
                                            modulators += " + channel" + channel + "FeedbackMult * (";
                                            const feedbacks = [];
                                            for (const modulatorNumber of feedbackIndices) {
                                                feedbacks.push("channel" + channel + "Operator" + (modulatorNumber - 1) + "Output");
                                            }
                                            modulators += feedbacks.join(" + ") + ")";
                                        }
                                        synthSource.push(operatorLine.replace(/#/g, channel + "").replace(/\$/g, j + "").replace("/* + channel" + channel + "Operator@Scaled*/", modulators));
                                    }
                                    else {
                                        synthSource.push(operatorLine.replace(/#/g, channel + "").replace(/\$/g, j + ""));
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    synthSource.push(line);
                }
            }
            Synth.generatedSynthesizers[fingerprint] = new Function("synth", "song", "dataLeft", "dataRight", "bufferLength", "bufferIndex", "samplesPerArpeggio", synthSource.join("\n"));
        }
        return Synth.generatedSynthesizers[fingerprint];
    }
    frequencyFromPitch(pitch) {
        return 440.0 * Math.pow(2.0, (pitch - 69.0) / 12.0);
    }
    volumeConversion(noteVolume) {
        return Math.pow(noteVolume / 3.0, 1.5);
    }
    getSamplesPerArpeggio() {
        if (this.song == null)
            return 0;
        const beatsPerMinute = this.song.getBeatsPerMinute();
        const beatsPerSecond = beatsPerMinute / 60.0;
        const partsPerSecond = beatsPerSecond * this.song.partsPerBeat;
        const arpeggioPerSecond = partsPerSecond * 4.0;
        return Math.floor(this.samplesPerSecond / arpeggioPerSecond);
    }
}
Synth.negativePhaseGuard = 1000;
Synth.generatedSynthesizers = {};
Synth.synthSourceTemplate = (`
			var sampleTime = 1.0 / synth.samplesPerSecond;
			var effectYMult = +synth.effectYMult;
			var limitDecay = +synth.limitDecay;
			var volume = +synth.volume;
			var delayLineLeft = synth.delayLineLeft;
			var delayLineRight = synth.delayLineRight;
			var reverb = Math.pow(song.reverb / beepbox.Config.reverbRange, 0.667) * 0.425;
			var blend = Math.pow(song.blend / beepbox.Config.blendRange, 0.667) * 0.425;
			var mix = song.mix;
			var muff = Math.pow(song.muff / beepbox.Config.muffRange, 0.667) * 0.425;
			var detune = song.detune;
			var riff = Math.pow(song.riff / beepbox.Config.riffRange, 0.667) * 0.425; 
			var sineWave = beepbox.Config.sineWave;
			
			// Initialize instruments based on current pattern.
			var instrumentChannel# = song.getPatternInstrument(#, synth.bar); // ALL
			var instrument# = song.channels[#].instruments[instrumentChannel#]; // ALL
			var channel#Wave = (mix <= 1) ? beepbox.Config.waves[instrument#.wave] : beepbox.Config.wavesMixC[instrument#.wave]; // CHIP
			var channel#Wave = beepbox.Config.getDrumWave(instrument#.wave); // NOISE
			var channel#WaveLength = channel#Wave.length; // CHIP
			var channel#Wave = beepbox.Config.pwmwaves[instrument#.wave]; // PWM
			var channel#WaveLength = channel#Wave.length; // PWM
			var channel#FilterBase = (song.mix == 2) ? Math.pow(2 - (blend * 2) + (muff * 2), -beepbox.Config.filterBases[instrument#.filter]) : Math.pow(2, -beepbox.Config.filterBases[instrument#.filter] + (blend * 4) - (muff * 4)); // CHIP
			var channel#TremoloScale = beepbox.Config.effectTremolos[instrument#.effect]; // PITCH
			
			while (bufferIndex < bufferLength) {
				
				var samples;
				var samplesLeftInBuffer = bufferLength - bufferIndex;
				if (synth.arpeggioSampleCountdown <= samplesLeftInBuffer) {
					samples = synth.arpeggioSampleCountdown;
				} else {
					samples = samplesLeftInBuffer;
				}
				synth.arpeggioSampleCountdown -= samples;
				
				var time = synth.part + synth.beat * song.partsPerBeat;
				
				beepbox.Synth.computeChannelInstrument(synth, song, #, time, sampleTime, samplesPerArpeggio, samples); // ALL
				var synthChannel# = synth.channels[#]; // ALL
				
				var channel#ChorusA = Math.pow(2.0, (beepbox.Config.chorusOffsets[instrument#.chorus] + beepbox.Config.chorusIntervals[instrument#.chorus] + beepbox.Config.octoffValues[instrument#.octoff] + (detune / 24) * ((riff * beepbox.Config.chorusRiffApp[instrument#.chorus]) + 1)) / 12.0); // CHIP
				var channel#ChorusB = Math.pow(2.0, (beepbox.Config.chorusOffsets[instrument#.chorus] - beepbox.Config.chorusIntervals[instrument#.chorus] + beepbox.Config.octoffValues[instrument#.octoff] + (detune / 24) * ((riff * beepbox.Config.chorusRiffApp[instrument#.chorus]) + 1)) / 12.0); // CHIP
				var channel#ChorusSign = synthChannel#.harmonyVolumeMult * (beepbox.Config.chorusSigns[instrument#.chorus]); // CHIP
				channel#ChorusB *= synthChannel#.harmonyMult; // CHIP
				var channel#ChorusDeltaRatio = channel#ChorusB / channel#ChorusA * ((riff * beepbox.Config.chorusRiffApp[instrument#.chorus]) + 1); // CHIP
				
				var channel#PhaseDelta = synthChannel#.phaseDeltas[0] * channel#ChorusA * ((riff * beepbox.Config.chorusRiffApp[instrument#.chorus]) + 1); // CHIP
				var channel#PhaseDelta = synthChannel#.phaseDeltas[0] / 32768.0; // NOISE
				var channel#PhaseDeltaScale = synthChannel#.phaseDeltaScale; // ALL
				var channel#Volume = synthChannel#.volumeStarts[0]; // CHIP
				var channel#Volume = synthChannel#.volumeStarts[0]; // NOISE
				var channel#VolumeLeft = synthChannel#.volumeLeft[0]; // ALL
				var channel#VolumeRight = synthChannel#.volumeRight[0]; // ALL
				var channel#VolumeDelta = synthChannel#.volumeDeltas[0]; // CHIP
				var channel#VolumeDelta = synthChannel#.volumeDeltas[0]; // NOISE
				var channel#Filter = synthChannel#.filter * channel#FilterBase; // CHIP
				var channel#Filter = synthChannel#.filter; // NOISE
				var channel#FilterScale = synthChannel#.filterScale; // CHIP
				var channel#VibratoScale = synthChannel#.vibratoScale; // PITCH
				
				var effectY     = Math.sin(synth.effectPhase);
				var prevEffectY = Math.sin(synth.effectPhase - synth.effectAngle);
				
				var channel#PhaseA = synth.channels[#].phases[0] % 1; // CHIP
				var channel#PhaseB = synth.channels[#].phases[1] % 1; // CHIP
				var channel#Phase  = synth.channels[#].phases[0] % 1; // NOISE
				
				var channel#Operator$Phase       = ((synth.channels[#].phases[$] % 1) + ` + Synth.negativePhaseGuard + `) * ` + Config.sineWaveLength + `; // FM
				var channel#Operator$PhaseDelta  = synthChannel#.phaseDeltas[$]; // FM
				var channel#Operator$OutputMult  = synthChannel#.volumeStarts[$]; // FM
				var channel#Operator$OutputDelta = synthChannel#.volumeDeltas[$]; // FM
				var channel#Operator$Output      = synthChannel#.feedbackOutputs[$]; // FM
				var channel#FeedbackMult         = synthChannel#.feedbackMult; // FM
				var channel#FeedbackDelta        = synthChannel#.feedbackDelta; // FM
				
				var channel#SampleLeft = +synth.channels[#].sampleLeft; // ALL
				var channel#SampleRight = +synth.channels[#].sampleRight; // ALL
				
				var delayPosLeft = 0|synth.delayPosLeft;
				var delayFeedback0Left = +synth.delayFeedback0Left;
				var delayFeedback1Left = +synth.delayFeedback1Left;
				var delayFeedback2Left = +synth.delayFeedback2Left;
				var delayFeedback3Left = +synth.delayFeedback3Left;
				var delayPosRight = 0|synth.delayPosRight;
				var delayFeedback0Right = +synth.delayFeedback0Right;
				var delayFeedback1Right = +synth.delayFeedback1Right;
				var delayFeedback2Right = +synth.delayFeedback2Right;
				var delayFeedback3Right = +synth.delayFeedback3Right;
				var limit = +synth.limit;
				
				while (samples) {
					var channel#Vibrato = 1.0 + channel#VibratoScale * effectY; // PITCH
					var channel#Tremolo = 1.0 + channel#TremoloScale * (effectY - 1.0); // PITCH
					var temp = effectY;
					effectY = effectYMult * effectY - prevEffectY;
					prevEffectY = temp;
					
					channel#SampleLeft += ((channel#Wave[0|(channel#PhaseA * channel#WaveLength)] + channel#Wave[0|(channel#PhaseB * channel#WaveLength)] * channel#ChorusSign) * channel#Volume * channel#Tremolo - channel#SampleLeft) * channel#Filter * channel#VolumeLeft; // CHIP 
					channel#SampleLeft += (channel#Wave[0|(channel#Phase * 32768.0)] * channel#Volume - channel#SampleLeft) * channel#Filter * channel#VolumeLeft; // NOISE
					channel#SampleRight += ((channel#Wave[0|(channel#PhaseA * channel#WaveLength)] + channel#Wave[0|(channel#PhaseB * channel#WaveLength)] * channel#ChorusSign) * channel#Volume * channel#Tremolo - channel#SampleRight) * channel#Filter * channel#VolumeRight; // CHIP 
					channel#SampleRight += (channel#Wave[0|(channel#Phase * 32768.0)] * channel#Volume - channel#SampleRight) * channel#Filter * channel#VolumeRight; // NOISE
					channel#Volume += channel#VolumeDelta; // CHIP
					channel#Volume += channel#VolumeDelta; // NOISE
					channel#PhaseA += channel#PhaseDelta * channel#Vibrato; // CHIP
					channel#PhaseB += channel#PhaseDelta * channel#Vibrato * channel#ChorusDeltaRatio; // CHIP
					channel#Phase += channel#PhaseDelta; // NOISE
					channel#Filter *= channel#FilterScale; // CHIP
					channel#PhaseA -= 0|channel#PhaseA; // CHIP
					channel#PhaseB -= 0|channel#PhaseB; // CHIP
					channel#Phase -= 0|channel#Phase; // NOISE
					channel#PhaseDelta *= channel#PhaseDeltaScale; // CHIP
					channel#PhaseDelta *= channel#PhaseDeltaScale; // NOISE
					
					// INSERT OPERATOR COMPUTATION HERE
					channel#SampleLeft = channel#Tremolo * (/*channel#Operator$Scaled*/) * channel#VolumeLeft; // CARRIER OUTPUTS
					channel#SampleRight = channel#Tremolo * (/*channel#Operator$Scaled*/) * channel#VolumeRight; // CARRIER OUTPUTS
					channel#FeedbackMult += channel#FeedbackDelta; // FM
					channel#Operator$OutputMult += channel#Operator$OutputDelta; // FM
					channel#Operator$Phase += channel#Operator$PhaseDelta * channel#Vibrato; // FM
					channel#Operator$PhaseDelta *= channel#PhaseDeltaScale; // FM
					
					// Reverb, implemented using a feedback delay network with a Hadamard matrix and lowpass filters.
					// good ratios:    0.555235 + 0.618033 + 0.818 +   1.0 = 2.991268
					// Delay lengths:  3041     + 3385     + 4481  +  5477 = 16384 = 2^14
					// Buffer offsets: 3041    -> 6426   -> 10907 -> 16384
					var delayPos1Left = (delayPosLeft +  3041) & 0x3FFF;
					var delayPos2Left = (delayPosLeft +  6426) & 0x3FFF;
					var delayPos3Left = (delayPosLeft + 10907) & 0x3FFF;
					var delaySampleLeft0 = (delayLineLeft[delayPosLeft]
						+ channel#SampleLeft // PITCH
					);
					var delayPos1Right = (delayPosRight +  3041) & 0x3FFF;
					var delayPos2Right = (delayPosRight +  6426) & 0x3FFF;
					var delayPos3Right = (delayPosRight + 10907) & 0x3FFF;
					var delaySampleRight0 = (delayLineRight[delayPosRight]
						+ channel#SampleRight // PITCH
					);
					var delaySampleLeft1 = delayLineLeft[delayPos1Left];
					var delaySampleLeft2 = delayLineLeft[delayPos2Left];
					var delaySampleLeft3 = delayLineLeft[delayPos3Left];
					var delayTemp0Left = -delaySampleLeft0 + delaySampleLeft1;
					var delayTemp1Left = -delaySampleLeft0 - delaySampleLeft1;
					var delayTemp2Left = -delaySampleLeft2 + delaySampleLeft3;
					var delayTemp3Left = -delaySampleLeft2 - delaySampleLeft3;
					delayFeedback0Left += ((delayTemp0Left + delayTemp2Left) * reverb - delayFeedback0Left) * 0.5;
					delayFeedback1Left += ((delayTemp1Left + delayTemp3Left) * reverb - delayFeedback1Left) * 0.5;
					delayFeedback2Left += ((delayTemp0Left - delayTemp2Left) * reverb - delayFeedback2Left) * 0.5;
					delayFeedback3Left += ((delayTemp1Left - delayTemp3Left) * reverb - delayFeedback3Left) * 0.5;
					delayLineLeft[delayPos1Left] = delayFeedback0Left;
					delayLineLeft[delayPos2Left] = delayFeedback1Left;
					delayLineLeft[delayPos3Left] = delayFeedback2Left;
					delayLineLeft[delayPosLeft ] = delayFeedback3Left;
					delayPosLeft = (delayPosLeft + 1) & 0x3FFF;
					
					var delaySampleRight1 = delayLineRight[delayPos1Right];
					var delaySampleRight2 = delayLineRight[delayPos2Right];
					var delaySampleRight3 = delayLineRight[delayPos3Right];
					var delayTemp0Right = -delaySampleRight0 + delaySampleRight1;
					var delayTemp1Right = -delaySampleRight0 - delaySampleRight1;
					var delayTemp2Right = -delaySampleRight2 + delaySampleRight3;
					var delayTemp3Right = -delaySampleRight2 - delaySampleRight3;
					delayFeedback0Right += ((delayTemp0Right + delayTemp2Right) * reverb - delayFeedback0Right) * 0.5;
					delayFeedback1Right += ((delayTemp1Right + delayTemp3Right) * reverb - delayFeedback1Right) * 0.5;
					delayFeedback2Right += ((delayTemp0Right - delayTemp2Right) * reverb - delayFeedback2Right) * 0.5;
					delayFeedback3Right += ((delayTemp1Right - delayTemp3Right) * reverb - delayFeedback3Right) * 0.5;
					delayLineRight[delayPos1Right] = delayFeedback0Right;
					delayLineRight[delayPos2Right] = delayFeedback1Right;
					delayLineRight[delayPos3Right] = delayFeedback2Right;
					delayLineRight[delayPosRight ] = delayFeedback3Right;
					delayPosRight = (delayPosRight + 1) & 0x3FFF;
					
					var sampleLeft = delaySampleLeft0 + delaySampleLeft1 + delaySampleLeft2 + delaySampleLeft3
						+ channel#SampleLeft // NOISE
					;
					
					var sampleRight = delaySampleRight0 + delaySampleRight1 + delaySampleRight2 + delaySampleRight3
						+ channel#SampleRight // NOISE
					;
					
					var abs = sampleLeft < 0.0 ? -sampleLeft : sampleLeft;
					limit -= limitDecay;
					if (limit < abs) limit = abs;
					sampleLeft /= limit * 0.75 + 0.25;
					sampleLeft *= volume;
					sampleLeft = sampleLeft;
					dataLeft[bufferIndex] = sampleLeft;
					sampleRight /= limit * 0.75 + 0.25;
					sampleRight *= volume;
					sampleRight = sampleRight;
					dataRight[bufferIndex] = sampleRight;
					bufferIndex++;
					samples--;
				}
				
				synthChannel#.phases[0] = channel#PhaseA; // CHIP
				synthChannel#.phases[1] = channel#PhaseB; // CHIP
				synthChannel#.phases[0] = channel#Phase; // NOISE
				synthChannel#.phases[$] = channel#Operator$Phase / ` + Config.sineWaveLength + `; // FM
				synthChannel#.feedbackOutputs[$] = channel#Operator$Output; // FM
				synthChannel#.sampleLeft = channel#SampleLeft; // ALL
				synthChannel#.sampleRight = channel#SampleRight; // ALL
				
				synth.delayPosLeft = delayPosLeft;
				synth.delayFeedback0Left = delayFeedback0Left;
				synth.delayFeedback1Left = delayFeedback1Left;
				synth.delayFeedback2Left = delayFeedback2Left;
				synth.delayFeedback3Left = delayFeedback3Left;
				synth.delayPosRight = delayPosRight;
				synth.delayFeedback0Right = delayFeedback0Right;
				synth.delayFeedback1Right = delayFeedback1Right;
				synth.delayFeedback2Right = delayFeedback2Right;
				synth.delayFeedback3Right = delayFeedback3Right;
				synth.limit = limit;
				
				if (effectYMult * effectY - prevEffectY > prevEffectY) {
					synth.effectPhase = Math.asin(effectY);
				} else {
					synth.effectPhase = Math.PI - Math.asin(effectY);
				}
				
				if (synth.arpeggioSampleCountdown == 0) {
					synth.arpeggio++;
					synth.arpeggioSampleCountdown = samplesPerArpeggio;
					if (synth.arpeggio == 4) {
						synth.arpeggio = 0;
						synth.part++;
						if (synth.part == song.partsPerBeat) {
							synth.part = 0;
							synth.beat++;
							if (synth.beat == song.beatsPerBar) {
								// The bar ended, may need to regenerate synthesizer.
								return bufferIndex;
							}
						}
					}
				}
			}
			
			// Indicate that the buffer is finished generating.
			return -1;
		`).split("\n");
Synth.operatorSourceTemplate = (`
						var channel#Operator$PhaseMix = channel#Operator$Phase/* + channel#Operator@Scaled*/;
						var channel#Operator$PhaseInt = channel#Operator$PhaseMix|0;
						var channel#Operator$Index    = channel#Operator$PhaseInt & ` + Config.sineWaveMask + `;
						var channel#Operator$Sample   = sineWave[channel#Operator$Index];
						channel#Operator$Output       = channel#Operator$Sample + (sineWave[channel#Operator$Index + 1] - channel#Operator$Sample) * (channel#Operator$PhaseMix - channel#Operator$PhaseInt);
						var channel#Operator$Scaled   = channel#Operator$OutputMult * channel#Operator$Output;
		`).split("\n");
//# sourceMappingURL=synth.js.map