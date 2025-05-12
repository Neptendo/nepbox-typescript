/*
Copyright (C) 2018 John Nesky

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

import { SongDocument } from "./SongDocument";
import { Change, UndoableChange, ChangeSequence, ChangeGroup } from "./Change";
import { NotePin, Note, Instrument, Channel, Pattern, makeNotePin, Song } from "../synth/synth";
import { InstrumentType, Config } from "../synth/SynthConfig";

	export class ChangePins extends UndoableChange {
		protected _oldStart: number;
		protected _newStart: number;
		protected _oldEnd: number;
		protected _newEnd: number;
		protected _oldPins: NotePin[];
		protected _newPins: NotePin[];
		protected _oldPitches: number[];
		protected _newPitches: number[];
		constructor(protected _doc: SongDocument, protected _note: Note) {
			super(false);
			this._oldStart = this._note.start;
			this._oldEnd   = this._note.end;
			this._newStart = this._note.start;
			this._newEnd   = this._note.end;
			this._oldPins = this._note.pins;
			this._newPins = [];
			this._oldPitches = this._note.pitches;
			this._newPitches = [];
		}
		
		protected _finishSetup(): void {
			for (let i: number = 0; i < this._newPins.length - 1; ) {
				if (this._newPins[i].time >= this._newPins[i+1].time) {
					this._newPins.splice(i, 1);
				} else {
					i++;
				}
			}
			
			for (let i: number = 1; i < this._newPins.length - 1; ) {
				if (this._newPins[i-1].interval == this._newPins[i].interval && 
				    this._newPins[i].interval == this._newPins[i+1].interval && 
				    this._newPins[i-1].volume == this._newPins[i].volume && 
				    this._newPins[i].volume == this._newPins[i+1].volume)
				{
					this._newPins.splice(i, 1);
				} else {
					i++;
				}
			}
			
			const firstInterval: number = this._newPins[0].interval;
			const firstTime: number = this._newPins[0].time;
			for (let i: number = 0; i < this._oldPitches.length; i++) {
				this._newPitches[i] = this._oldPitches[i] + firstInterval;
			}
			for (let i: number = 0; i < this._newPins.length; i++) {
				this._newPins[i].interval -= firstInterval;
				this._newPins[i].time -= firstTime;
			}
			this._newStart = this._oldStart + firstTime;
			this._newEnd   = this._newStart + this._newPins[this._newPins.length-1].time;
			
			this._doForwards();
			this._didSomething();
		}
		
		protected _doForwards(): void {
			this._note.pins = this._newPins;
			this._note.pitches = this._newPitches;
			this._note.start = this._newStart;
			this._note.end = this._newEnd;
			this._doc.notifier.changed();
		}
		
		protected _doBackwards(): void {
			this._note.pins = this._oldPins;
			this._note.pitches = this._oldPitches;
			this._note.start = this._oldStart;
			this._note.end = this._oldEnd;
			this._doc.notifier.changed();
		}
	}
	
	export class ChangeInstrumentType extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].type;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].type = newValue;
				if (newValue == InstrumentType.chip) {
					// This is technically not necessary, so long as there are
					// more chip waves than pwm waves, but might as well have
					// it here for safety.
					const instrument: Instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
					instrument.wave = Math.max(0, Math.min(Config.waves.length - 1, instrument.wave));
				} else if (newValue == InstrumentType.pwm) {
					// When going from chip to pwm, if there are more chip
					// waves than pwm waves, .wave can be invalid.
					const instrument: Instrument = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()];
					instrument.wave = Math.max(0, Math.min(Config.pwmwaves.length - 1, instrument.wave));
				}
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeTransition extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].transition;
			if (oldValue != newValue) {
				this._didSomething();
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].transition = newValue;
				doc.notifier.changed();
			}
		}
	}
	
	export class ChangePattern extends Change {
		constructor(doc: SongDocument, public oldValue: number, newValue: number) {
			super();
			if (newValue > doc.song.patternsPerChannel) throw new Error("invalid pattern");
			doc.song.channels[doc.channel].bars[doc.bar] = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeBarCount extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.barCount != newValue) {
				for (let channel: number = 0; channel < doc.song.getChannelCount(); channel++) {
					for (let bar: number = doc.song.barCount; bar < newValue; bar++) {
						doc.song.channels[channel].bars[bar] = 0;
					}
					doc.song.channels[channel].bars.length = newValue;
				}
				
				let newBar: number = doc.bar;
				let newBarScrollPos: number = doc.barScrollPos;
				let newLoopStart: number = doc.song.loopStart;
				let newLoopLength: number = doc.song.loopLength;
				if (doc.song.barCount > newValue) {
					newBar = Math.min(newBar, newValue - 1);
					newBarScrollPos = Math.max(0, Math.min(newValue - doc.trackVisibleBars, newBarScrollPos));
					newLoopLength = Math.min(newValue, newLoopLength);
					newLoopStart = Math.min(newValue - newLoopLength, newLoopStart);
				}
				doc.bar = newBar;
				doc.barScrollPos = newBarScrollPos;
				doc.song.loopStart = newLoopStart;
				doc.song.loopLength = newLoopLength;
				doc.song.barCount = newValue;
				doc.notifier.changed();
				
				this._didSomething();
			}
		}
	}
	
	export class ChangeInsertBars extends Change {
		constructor(doc: SongDocument, start: number, count: number) {
			super();
			
			const newLength: number = Math.min(Config.barCountMax, doc.song.barCount + count);
			count = newLength - doc.song.barCount;
			if (count == 0) return;
			
			for (const channel of doc.song.channels) {
				while (channel.bars.length < newLength) {
					channel.bars.splice(start, 0, 0);
				}
			}
			doc.song.barCount = newLength;
			
			doc.bar += count;
			doc.barScrollPos += count;
			if (doc.song.loopStart >= start) {
				doc.song.loopStart += count;
			} else if (doc.song.loopStart + doc.song.loopLength >= start) {
				doc.song.loopLength += count;
			}
			
			doc.notifier.changed();
			this._didSomething();
		}
	}

	export class ChangeDeleteBars extends Change {
		constructor(doc: SongDocument, start: number, count: number) {
			super();
			
			for (const channel of doc.song.channels) {
				channel.bars.splice(start, count);
				if (channel.bars.length == 0) channel.bars.push(0);
			}
			doc.song.barCount = Math.max(1, doc.song.barCount - count);
			
			doc.bar = Math.max(0, doc.bar - count);
			doc.barScrollPos = Math.max(0, doc.barScrollPos - count);
			if (doc.song.loopStart >= start) {
				doc.song.loopStart = Math.max(0, doc.song.loopStart - count);
			} else if (doc.song.loopStart + doc.song.loopLength > start) {
				doc.song.loopLength -= count;
			}
			doc.song.loopLength = Math.max(1, Math.min(doc.song.barCount - doc.song.loopStart, doc.song.loopLength));
			
			doc.notifier.changed();
			this._didSomething();
		}
	}

	export class ChangeChannelCount extends Change {
		constructor(doc: SongDocument, newPitchChannelCount: number, newDrumChannelCount: number) {
			super();
			if (doc.song.pitchChannelCount != newPitchChannelCount || doc.song.drumChannelCount != newDrumChannelCount) {
				const newChannels: Channel[] = [];
				
				for (let i: number = 0; i < newPitchChannelCount; i++) {
					const channel = i;
					const oldChannel = i;
					if (i < doc.song.pitchChannelCount) {
						newChannels[channel] = doc.song.channels[oldChannel]
					} else {
						newChannels[channel] = new Channel();
						newChannels[channel].octave = 2;
						for (let j: number = 0; j < doc.song.instrumentsPerChannel; j++) newChannels[channel].instruments[j] = new Instrument();
						for (let j: number = 0; j < doc.song.patternsPerChannel; j++) newChannels[channel].patterns[j] = new Pattern();
						for (let j: number = 0; j < doc.song.barCount; j++) newChannels[channel].bars[j] = 0;
					}
				}

				for (let i: number = 0; i < newDrumChannelCount; i++) {
					const channel = i + newPitchChannelCount;
					const oldChannel = i + doc.song.pitchChannelCount;
					if (i < doc.song.drumChannelCount) {
						newChannels[channel] = doc.song.channels[oldChannel]
					} else {
						newChannels[channel] = new Channel();
						newChannels[channel].octave = 0;
						for (let j: number = 0; j < doc.song.instrumentsPerChannel; j++) newChannels[channel].instruments[j] = new Instrument();
						for (let j: number = 0; j < doc.song.patternsPerChannel; j++) newChannels[channel].patterns[j] = new Pattern();
						for (let j: number = 0; j < doc.song.barCount; j++) newChannels[channel].bars[j] = 0;
					}
				}
				
				doc.song.pitchChannelCount = newPitchChannelCount;
				doc.song.drumChannelCount = newDrumChannelCount;
				for (let channel: number = 0; channel < doc.song.getChannelCount(); channel++) {
					doc.song.channels[channel] = newChannels[channel];
				}
				doc.song.channels.length = doc.song.getChannelCount();
				
				doc.channel = Math.min(doc.channel, newPitchChannelCount + newDrumChannelCount - 1);
				doc.notifier.changed();
				
				this._didSomething();
			}
		}
	}
	
	export class ChangeBeatsPerBar extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.beatsPerBar != newValue) {
				if (doc.song.beatsPerBar > newValue) {
					const sequence: ChangeSequence = new ChangeSequence();
					for (let i: number = 0; i < doc.song.getChannelCount(); i++) {
						for (let j: number = 0; j < doc.song.channels[i].patterns.length; j++) {
							sequence.append(new ChangeNoteTruncate(doc, doc.song.channels[i].patterns[j], newValue * doc.song.partsPerBeat, doc.song.beatsPerBar * doc.song.partsPerBeat));
						}
					}
				}
				doc.song.beatsPerBar = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeChannelOrder extends Change {
		constructor(doc: SongDocument, selectionMin: number, selectionMax: number, offset: number) {
			super();
			doc.song.channels.splice(selectionMin + offset, 0, ...doc.song.channels.splice(selectionMin, selectionMax - selectionMin + 1));
			doc.notifier.changed();
			this._didSomething();
		}
	}

	export class ChangeAddChannel extends ChangeGroup {
		constructor(doc: SongDocument, index: number, isNoise: boolean) {
			super();
			const newPitchChannelCount: number = doc.song.pitchChannelCount + (isNoise ? 0 : 1);
			const newNoiseChannelCount: number = doc.song.drumChannelCount + (isNoise ? 1 : 0);
			if (newPitchChannelCount <= Config.pitchChannelCountMax && newNoiseChannelCount <= Config.drumChannelCountMax) {
				const addedChannelIndex: number = isNoise ? doc.song.pitchChannelCount + doc.song.drumChannelCount : doc.song.pitchChannelCount;
				this.append(new ChangeChannelCount(doc, newPitchChannelCount, newNoiseChannelCount));
				this.append(new ChangeChannelOrder(doc, index, addedChannelIndex - 1, 1));
			}
			doc.notifier.changed();
			this._didSomething();
		}
	}
	
	export class ChangeRemoveChannel extends ChangeGroup {
		constructor(doc: SongDocument, minIndex: number, maxIndex: number) {
			super();
			while (maxIndex >= minIndex) {
				const isNoise: boolean = doc.song.getChannelIsDrum(maxIndex);
				doc.song.channels.splice(maxIndex, 1);
				if (isNoise) {
					doc.song.drumChannelCount--;
				} else {
						doc.song.pitchChannelCount--;
				}
				maxIndex--;
			}
			
			if (doc.song.pitchChannelCount < Config.pitchChannelCountMin) {
				this.append(new ChangeChannelCount(doc, Config.pitchChannelCountMin, doc.song.drumChannelCount));
			}
			
			this.append(new ChangeChannelBar(doc, Math.max(0, minIndex - 1), doc.bar));
			
			this._didSomething();
			doc.notifier.changed();
		}
	}

	export class ChangeChannelBar extends Change {
		constructor(doc: SongDocument, newChannel: number, newBar: number) {
			super();
			const oldChannel: number = doc.channel;
			const oldBar: number = doc.bar;
			doc.channel = newChannel;
			doc.bar = newBar;
			doc.barScrollPos = Math.min(doc.bar, Math.max(doc.bar - (doc.trackVisibleBars - 1), doc.barScrollPos));
			doc.notifier.changed();
			if (oldChannel != newChannel || oldBar != newBar) {
				this._didSomething();
			}
		}
	}
	
	export class ChangeChorus extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].chorus;
			if (oldValue != newValue) {
				this._didSomething();
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].chorus = newValue;
				doc.notifier.changed();
			}
		}
	}
	
	export class ChangeEffect extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].effect;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].effect = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeHarm extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].harm;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].harm = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}

	export class ChangeFMChorus extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].fmChorus;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].fmChorus = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeOctoff extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].octoff;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].octoff = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeImute extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].imute;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].imute = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}

	export class ChangeAllImute extends Change {
		constructor(doc: SongDocument, newValue: number, index: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[index].imute;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[index].imute = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}

	export class ChangeSoloChannels extends Change {
		constructor(doc: SongDocument, newValue: number, curChannel: number, curInstrument: number) {
			super();
			const oldValue: number = doc.song.channels[curChannel].instruments[curInstrument].imute;
			if (oldValue != newValue) {
				doc.song.channels[curChannel].instruments[curInstrument].imute = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeIpan extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].ipan = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeFilter extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].filter;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].filter = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeAlgorithm extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].algorithm;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].algorithm = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeFeedbackType extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].feedbackType;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].feedbackType = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeFeedbackEnvelope extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].feedbackEnvelope;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].feedbackEnvelope = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeOperatorEnvelope extends Change {
		constructor(doc: SongDocument, operatorIndex: number, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].operators[operatorIndex].envelope;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].operators[operatorIndex].envelope = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeOperatorFrequency extends Change {
		constructor(doc: SongDocument, operatorIndex: number, newValue: number) {
			super();
			const oldValue: number = doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].operators[operatorIndex].frequency;
			if (oldValue != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].operators[operatorIndex].frequency = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeOperatorAmplitude extends Change {
		constructor(doc: SongDocument, operatorIndex: number, oldValue: number, newValue: number) {
			super();
			doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].operators[operatorIndex].amplitude = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeFeedbackAmplitude extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].feedbackAmplitude = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeInstrumentsPerChannel extends Change {
		constructor(doc: SongDocument, newInstrumentsPerChannel: number) {
			super();
			if (doc.song.instrumentsPerChannel != newInstrumentsPerChannel) {
				for (let channel: number = 0; channel < doc.song.getChannelCount(); channel++) {
					const sampleInstrument: Instrument = doc.song.channels[channel].instruments[doc.song.instrumentsPerChannel - 1];
					for (let j: number = doc.song.instrumentsPerChannel; j < newInstrumentsPerChannel; j++) {
						const newInstrument: Instrument = new Instrument();
						newInstrument.copy(sampleInstrument);
						doc.song.channels[channel].instruments[j] = newInstrument;
					}
					doc.song.channels[channel].instruments.length = newInstrumentsPerChannel;
					for (let j: number = 0; j < doc.song.patternsPerChannel; j++) {
						if (doc.song.channels[channel].patterns[j].instrument >= newInstrumentsPerChannel) {
							doc.song.channels[channel].patterns[j].instrument = 0;
						}
					}
				}
				doc.song.instrumentsPerChannel = newInstrumentsPerChannel;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeKey extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.key != newValue) {
				doc.song.key = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeTheme extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.theme != newValue) {
				doc.song.theme = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeLoop extends Change {
		constructor(private _doc: SongDocument, public oldStart: number, public oldLength: number, public newStart: number, public newLength: number) {
			super();
			this._doc.song.loopStart = this.newStart;
			this._doc.song.loopLength = this.newLength;
			this._doc.notifier.changed();
			if (this.oldStart != this.newStart || this.oldLength != this.newLength) {
				this._didSomething();
			}
		}
	}
	
	export class ChangePitchAdded extends UndoableChange {
		private _doc: SongDocument;
		private _note: Note;
		private _pitch: number;
		private _index: number;
		constructor(doc: SongDocument, note: Note, pitch: number, index: number, deletion: boolean = false) {
			super(deletion);
			this._doc = doc;
			this._note = note;
			this._pitch = pitch;
			this._index = index;
			this._didSomething();
			this.redo();
		}
		
		protected _doForwards(): void {
			this._note.pitches.splice(this._index, 0, this._pitch);
			this._doc.notifier.changed();
		}
		
		protected _doBackwards(): void {
			this._note.pitches.splice(this._index, 1);
			this._doc.notifier.changed();
		}
	}
	
	export class ChangeOctave extends Change {
		constructor(doc: SongDocument, public oldValue: number, newValue: number) {
			super();
			doc.song.channels[doc.channel].octave = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangePartsPerBeat extends ChangeGroup {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.partsPerBeat != newValue) {
				for (let i: number = 0; i < doc.song.getChannelCount(); i++) {
					for (let j: number = 0; j < doc.song.channels[i].patterns.length; j++) {
						this.append(new ChangeRhythm(doc, doc.song.channels[i].patterns[j], doc.song.partsPerBeat, newValue));
					}
				}
				doc.song.partsPerBeat = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangePaste extends ChangeGroup {
		constructor(doc: SongDocument, pattern: Pattern, notes: Note[], newBeatsPerBar: number, newPartsPerBeat: number) {
			super();
			pattern.notes = notes;
			
			if (doc.song.partsPerBeat != newPartsPerBeat) {
				this.append(new ChangeRhythm(doc, pattern, newPartsPerBeat, doc.song.partsPerBeat));
			}
			
			if (doc.song.beatsPerBar != newBeatsPerBar) {
				this.append(new ChangeNoteTruncate(doc, pattern, doc.song.beatsPerBar * doc.song.partsPerBeat, newBeatsPerBar * doc.song.partsPerBeat));
			}
			
			doc.notifier.changed();
			this._didSomething();
		}
	}
	
	export class ChangePatternInstrument extends Change {
		constructor(doc: SongDocument, newValue: number, pattern: Pattern) {
			super();
			if (pattern.instrument != newValue) {
				pattern.instrument = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangePatternsPerChannel extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.patternsPerChannel != newValue) {
				for (let i: number = 0; i < doc.song.getChannelCount(); i++) {
					const channelBars: number[] = doc.song.channels[i].bars;
					const channelPatterns: Pattern[] = doc.song.channels[i].patterns;
					for (let j: number = 0; j < channelBars.length; j++) {
						if (channelBars[j] > newValue) channelBars[j] = 0;
					}
					for (let j: number = channelPatterns.length; j < newValue; j++) {
						channelPatterns[j] = new Pattern();
					}
					channelPatterns.length = newValue;
				}
				doc.song.patternsPerChannel = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeEnsurePatternExists extends UndoableChange {
		private _doc: SongDocument;
		private _bar: number;
		private _channel: number;
		private _patternIndex: number;
		private _patternOldNotes: Note[] | null = null;
		private _oldPatternCount: number;
		private _newPatternCount: number;

		constructor(doc: SongDocument) {
			super(false);
			const song: Song = doc.song;
			if (song.channels[doc.channel].bars[doc.bar] != 0) return;

			this._doc = doc;
			this._bar = doc.bar;
			this._channel = doc.channel;
			this._oldPatternCount = song.patternsPerChannel;
			this._newPatternCount = song.patternsPerChannel;

			let firstEmptyUnusedIndex: number | null = null;
			let firstUnusedIndex: number | null = null;
			for (let patternIndex: number = 1; patternIndex <= song.patternsPerChannel; patternIndex++) {
				let used = false;
				for (let barIndex: number = 0; barIndex < song.barCount; barIndex++) {
					if (song.channels[doc.channel].bars[barIndex] == patternIndex) {
						used = true;
						break;
					}
				}
				if (used) continue;
				if (firstUnusedIndex == null) {
					firstUnusedIndex = patternIndex;
				}
				const pattern: Pattern = song.channels[doc.channel].patterns[patternIndex - 1];
				if (pattern.notes.length == 0) {
					firstEmptyUnusedIndex = patternIndex;
					break;
				}
			}

			if (firstEmptyUnusedIndex != null) {
				this._patternIndex = firstEmptyUnusedIndex;
			} else if (song.patternsPerChannel < song.barCount) {
				this._newPatternCount = song.patternsPerChannel + 1;
				this._patternIndex = song.patternsPerChannel + 1;
			} else if (firstUnusedIndex != null) {
				this._patternIndex = firstUnusedIndex;
				this._patternOldNotes = song.channels[doc.channel].patterns[firstUnusedIndex - 1].notes;
			} else {
				throw new Error();
			}

			this._didSomething();
			this._doForwards();
		}

		protected _doForwards(): void {
			const song: Song = this._doc.song;
			for (let j: number = song.patternsPerChannel; j < this._newPatternCount; j++) {
				for (let i: number = 0; i < song.getChannelCount(); i++) {
					song.channels[i].patterns[j] = new Pattern();
				}
			}
			song.patternsPerChannel = this._newPatternCount;
			const pattern: Pattern = song.channels[this._channel].patterns[this._patternIndex - 1];
			pattern.notes = [];
			song.channels[this._channel].bars[this._bar] = this._patternIndex;
			this._doc.notifier.changed();
		}

		protected _doBackwards(): void {
			const song: Song = this._doc.song;
			const pattern: Pattern = song.channels[this._channel].patterns[this._patternIndex - 1];
			if (this._patternOldNotes != null) pattern.notes = this._patternOldNotes;
			song.channels[this._channel].bars[this._bar] = 0;
			for (let i: number = 0; i < song.getChannelCount(); i++) {
				song.channels[i].patterns.length = this._oldPatternCount;
			}
			song.patternsPerChannel = this._oldPatternCount;
			this._doc.notifier.changed();
		}
	}

	export class ChangePinTime extends ChangePins {
		constructor(doc: SongDocument, note: Note, pinIndex: number, shiftedTime: number) {
			super(doc, note);
			
			shiftedTime -= this._oldStart;
			const originalTime: number = this._oldPins[pinIndex].time;
			const skipStart: number = Math.min(originalTime, shiftedTime);
			const skipEnd: number = Math.max(originalTime, shiftedTime);
			let setPin: boolean = false;
			for (let i: number = 0; i < this._oldPins.length; i++) {
				const oldPin: NotePin = note.pins[i];
				const time: number = oldPin.time;
				if (time < skipStart) {
					this._newPins.push(makeNotePin(oldPin.interval, time, oldPin.volume));
				} else if (time > skipEnd) {
					if (!setPin) {
						this._newPins.push(makeNotePin(this._oldPins[pinIndex].interval, shiftedTime, this._oldPins[pinIndex].volume));
						setPin = true;
					}
					this._newPins.push(makeNotePin(oldPin.interval, time, oldPin.volume));
				}
			}
			if (!setPin) {
				this._newPins.push(makeNotePin(this._oldPins[pinIndex].interval, shiftedTime, this._oldPins[pinIndex].volume));
			}
			
			this._finishSetup();
		}
	}
	
	export class ChangePitchBend extends ChangePins {
		constructor(doc: SongDocument, note: Note, bendStart: number, bendEnd: number, bendTo: number, pitchIndex: number) {
			super(doc, note);
			
			bendStart -= this._oldStart;
			bendEnd   -= this._oldStart;
			bendTo    -= note.pitches[pitchIndex];
			
			let setStart: boolean = false;
			let setEnd: boolean   = false;
			let prevInterval: number = 0;
			let prevVolume: number = 3;
			let persist: boolean = true;
			let i: number;
			let direction: number;
			let stop: number;
			let push: (item: NotePin)=>void;
			if (bendEnd > bendStart) {
				i = 0;
				direction = 1;
				stop = note.pins.length;
				push = (item: NotePin)=>{ this._newPins.push(item); };
			} else {
				i = note.pins.length - 1;
				direction = -1;
				stop = -1;
				push = (item: NotePin)=>{ this._newPins.unshift(item); };
			}
			for (; i != stop; i += direction) {
				const oldPin: NotePin = note.pins[i];
				const time: number = oldPin.time;
				for (;;) {
					if (!setStart) {
						if (time * direction <= bendStart * direction) {
							prevInterval = oldPin.interval;
							prevVolume = oldPin.volume;
						}
						if (time * direction < bendStart * direction) {
							push(makeNotePin(oldPin.interval, time, oldPin.volume));
							break;
						} else {
							push(makeNotePin(prevInterval, bendStart, prevVolume));
							setStart = true;
						}
					} else if (!setEnd) {
						if (time * direction <= bendEnd * direction) {
							prevInterval = oldPin.interval;
							prevVolume = oldPin.volume;
						}
						if (time * direction < bendEnd * direction) {
							break;
						} else {
							push(makeNotePin(bendTo, bendEnd, prevVolume));
							setEnd = true;
						}
					} else {
						if (time * direction == bendEnd * direction) {
							break;
						} else {
							if (oldPin.interval != prevInterval) persist = false;
							push(makeNotePin(persist ? bendTo : oldPin.interval, time, oldPin.volume));
							break;
						}
					}
				}
			}
			if (!setEnd) {
				push(makeNotePin(bendTo, bendEnd, prevVolume));
			}
			
			this._finishSetup();
		}
	}
	
	export class ChangeRhythm extends ChangeSequence {
		constructor(doc: SongDocument, bar: Pattern, oldPartsPerBeat: number, newPartsPerBeat: number) {
			super();
			let changeRhythm: (oldTime:number)=>number;
			
			if (oldPartsPerBeat > newPartsPerBeat) {
				changeRhythm = (oldTime: number)=> Math.ceil(oldTime * newPartsPerBeat / oldPartsPerBeat);
			} else if (oldPartsPerBeat < newPartsPerBeat) {
				changeRhythm = (oldTime: number)=> Math.floor(oldTime * newPartsPerBeat / oldPartsPerBeat);
			} else {
				throw new Error("ChangeRhythm couldn't handle rhythm change from " + oldPartsPerBeat + " to " + newPartsPerBeat + ".");
			}
			let i: number = 0;
			while (i < bar.notes.length) {
				const note: Note = bar.notes[i];
				if (changeRhythm(note.start) >= changeRhythm(note.end)) {
					this.append(new ChangeNoteAdded(doc, bar, note, i, true));
				} else {
					this.append(new ChangeRhythmNote(doc, note, changeRhythm));
					i++;
				}
			}
		}
	}
	
	export class ChangeRhythmNote extends ChangePins {
		constructor(doc: SongDocument, note: Note, changeRhythm: (oldTime:number)=>number) {
			super(doc, note);
			
			for (const oldPin of this._oldPins) {
				this._newPins.push(makeNotePin(oldPin.interval, changeRhythm(oldPin.time + this._oldStart) - this._oldStart, oldPin.volume));
			}
			
			this._finishSetup();
		}
	}
	
	export class ChangeScale extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.scale != newValue) {
				doc.song.scale = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeMix extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.mix != newValue) {
				doc.song.mix = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeSampleRate extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.sampleRate != newValue) {
				doc.song.sampleRate = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}
	
	export class ChangeSong extends Change {
		constructor(doc: SongDocument, newHash: string) {
			super();
			doc.song.fromBase64String(newHash);
			doc.channel = Math.min(doc.channel, doc.song.getChannelCount() - 1);
			doc.bar = Math.max(0, Math.min(doc.song.barCount - 1, doc.bar));
			doc.barScrollPos = Math.max(0, Math.min(doc.song.barCount - doc.trackVisibleBars, doc.barScrollPos));
			doc.barScrollPos = Math.min(doc.bar, Math.max(doc.bar - (doc.trackVisibleBars - 1), doc.barScrollPos));
			doc.notifier.changed();
			this._didSomething();
		}
	}
	
	export class ChangeTempo extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.tempo = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeReverb extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.reverb = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeBlend extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.blend = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeRiff extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.riff = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeDetune extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.detune = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeMuff extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.muff = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeNoteAdded extends UndoableChange {
		private _doc: SongDocument;
		private _pattern: Pattern;
		private _note: Note;
		private _index: number;
		constructor(doc: SongDocument, pattern: Pattern, note: Note, index: number, deletion: boolean = false) {
			super(deletion);
			this._doc = doc;
			this._pattern = pattern;
			this._note = note;
			this._index = index;
			this._didSomething();
			this.redo();
		}
		
		protected _doForwards(): void {
			this._pattern.notes.splice(this._index, 0, this._note);
			this._doc.notifier.changed();
		}
		
		protected _doBackwards(): void {
			this._pattern.notes.splice(this._index, 1);
			this._doc.notifier.changed();
		}
	}
	
	export class ChangeNoteLength extends ChangePins {
		constructor(doc: SongDocument, note: Note, truncStart: number, truncEnd: number) {
			super(doc, note);
			
			truncStart -= this._oldStart;
			truncEnd   -= this._oldStart;
			let setStart: boolean = false;
			let prevVolume: number = this._oldPins[0].volume;
			let prevInterval: number = this._oldPins[0].interval;
			let pushLastPin: boolean = true;
			let i: number;
			for (i = 0; i < this._oldPins.length; i++) {
				const oldPin: NotePin = this._oldPins[i];
				if (oldPin.time < truncStart) {
					prevVolume = oldPin.volume;
					prevInterval = oldPin.interval;
				} else if (oldPin.time <= truncEnd) {
					if (oldPin.time > truncStart && !setStart) {
						this._newPins.push(makeNotePin(prevInterval, truncStart, prevVolume));
					}
					this._newPins.push(makeNotePin(oldPin.interval, oldPin.time, oldPin.volume));
					setStart = true;
					if (oldPin.time == truncEnd) {
						pushLastPin = false;
						break;
					}
				} else {
					break;
				} 
				
			}
			
			if (pushLastPin) this._newPins.push(makeNotePin(this._oldPins[i].interval, truncEnd, this._oldPins[i].volume));
			
			this._finishSetup();
		}
	}
	
	export class ChangeNoteTruncate extends ChangeSequence {
		constructor(doc: SongDocument, pattern: Pattern, start: number, end: number, skipNote?: Note) {
			super();
			let i: number = 0;
			while (i < pattern.notes.length) {
				const note: Note = pattern.notes[i];
				if (note == skipNote && skipNote != undefined) {
					i++;
				} else if (note.end <= start) {
					i++;
				} else if (note.start >= end) {
					break;
				} else if (note.start < start) {
					this.append(new ChangeNoteLength(doc, note, note.start, start));
					i++;
				} else if (note.end > end) {
					this.append(new ChangeNoteLength(doc, note, end, note.end));
					i++;
				} else {
					this.append(new ChangeNoteAdded(doc, pattern, note, i, true));
				}
			}
		}
	}
	
	export class ChangeTransposeNote extends UndoableChange {
		protected _doc: SongDocument;
		protected _note: Note;
		protected _oldStart: number;
		protected _newStart: number;
		protected _oldEnd: number;
		protected _newEnd: number;
		protected _oldPins: NotePin[];
		protected _newPins: NotePin[];
		protected _oldPitches: number[];
		protected _newPitches: number[];
		constructor(doc: SongDocument, note: Note, upward: boolean) {
			super(false);
			this._doc = doc;
			this._note = note;
			this._oldPins = note.pins;
			this._newPins = [];
			this._oldPitches = note.pitches;
			this._newPitches = [];
			
			const maxPitch: number = (doc.song.getChannelIsDrum(doc.channel) ? Config.drumCount - 1 : Config.maxPitch);
			
			for (let i: number = 0; i < this._oldPitches.length; i++) {
				let pitch: number = this._oldPitches[i];
				if (upward) {
					for (let j: number = pitch + 1; j <= maxPitch; j++) {
						if (doc.song.getChannelIsDrum(doc.channel) || Config.scaleFlags[doc.song.scale][j%12]) {
							pitch = j;
							break;
						}
					}
				} else {
					for (let j: number = pitch - 1; j >= 0; j--) {
						if (doc.song.getChannelIsDrum(doc.channel) || Config.scaleFlags[doc.song.scale][j%12]) {
							pitch = j;
							break;
						}
					}
				}
				
				let foundMatch: boolean = false;
				for (let j: number = 0; j < this._newPitches.length; j++) {
					if (this._newPitches[j] == pitch) {
						foundMatch = true;
						break;
					}
				}
				if (!foundMatch) this._newPitches.push(pitch);
			}
			
			let min: number = 0;
			let max: number = maxPitch;
			
			for (let i: number = 1; i < this._newPitches.length; i++) {
				const diff: number = this._newPitches[0] - this._newPitches[i];
				if (min < diff) min = diff;
				if (max > diff + maxPitch) max = diff + maxPitch;
			}
			
			for (const oldPin of this._oldPins) {
				let interval: number = oldPin.interval + this._oldPitches[0];
				
				if (interval < min) interval = min;
				if (interval > max) interval = max;
				if (upward) {
					for (let i: number = interval + 1; i <= max; i++) {
						if (doc.song.getChannelIsDrum(doc.channel) || Config.scaleFlags[doc.song.scale][i%12]) {
							interval = i;
							break;
						}
					}
				} else {
					for (let i: number = interval - 1; i >= min; i--) {
						if (doc.song.getChannelIsDrum(doc.channel) || Config.scaleFlags[doc.song.scale][i%12]) {
							interval = i;
							break;
						}
					}
				}
				interval -= this._newPitches[0];
				this._newPins.push(makeNotePin(interval, oldPin.time, oldPin.volume));
			}
			
			if (this._newPins[0].interval != 0) throw new Error("wrong pin start interval");
			
			for (let i: number = 1; i < this._newPins.length - 1; ) {
				if (this._newPins[i-1].interval == this._newPins[i].interval && 
				    this._newPins[i].interval == this._newPins[i+1].interval && 
				    this._newPins[i-1].volume == this._newPins[i].volume && 
				    this._newPins[i].volume == this._newPins[i+1].volume)
				{
					this._newPins.splice(i, 1);
				} else {
					i++;
				}
			}
			
			this._doForwards();
			this._didSomething();
		}
		
		protected _doForwards(): void {
			this._note.pins = this._newPins;
			this._note.pitches = this._newPitches;
			this._doc.notifier.changed();
		}
		
		protected _doBackwards(): void {
			this._note.pins = this._oldPins;
			this._note.pitches = this._oldPitches;
			this._doc.notifier.changed();
		}
	}
	
	export class ChangeTranspose extends ChangeSequence {
		constructor(doc: SongDocument, pattern: Pattern, upward: boolean) {
			super();
			for (let i: number = 0; i < pattern.notes.length; i++) {
				this.append(new ChangeTransposeNote(doc, pattern.notes[i], upward));
			}
		}
	}
	
	export class ChangeVolume extends Change {
		constructor(doc: SongDocument, oldValue: number, newValue: number) {
			super();
			doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].volume = newValue;
			doc.notifier.changed();
			if (oldValue != newValue) this._didSomething();
		}
	}
	
	export class ChangeVolumeBend extends UndoableChange {
		private _doc: SongDocument;
		private _note: Note;
		private _oldPins: NotePin[];
		private _newPins: NotePin[];
		constructor(doc: SongDocument, note: Note, bendPart: number, bendVolume: number, bendInterval: number) {
			super(false);
			this._doc = doc;
			this._note = note;
			this._oldPins = note.pins;
			this._newPins = [];
			
			let inserted: boolean = false;
			
			for (const pin of note.pins) {
				if (pin.time < bendPart) {
					this._newPins.push(pin);
				} else if (pin.time == bendPart) {
					this._newPins.push(makeNotePin(bendInterval, bendPart, bendVolume));
					inserted = true;
				} else {
					if (!inserted) {
						this._newPins.push(makeNotePin(bendInterval, bendPart, bendVolume));
						inserted = true;
					}
					this._newPins.push(pin);
				}
			}
			
			for (let i: number = 1; i < this._newPins.length - 1; ) {
				if (this._newPins[i-1].interval == this._newPins[i].interval && 
				    this._newPins[i].interval == this._newPins[i+1].interval && 
				    this._newPins[i-1].volume == this._newPins[i].volume && 
				    this._newPins[i].volume == this._newPins[i+1].volume)
				{
					this._newPins.splice(i, 1);
				} else {
					i++;
				}
			}
			
			this._doForwards();
			this._didSomething();
		}
		
		protected _doForwards(): void {
			this._note.pins = this._newPins;
			this._doc.notifier.changed();
		}
		
		protected _doBackwards(): void {
			this._note.pins = this._oldPins;
			this._doc.notifier.changed();
		}
	}
	
	export class ChangeWave extends Change {
		constructor(doc: SongDocument, newValue: number) {
			super();
			if (doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].wave != newValue) {
				doc.song.channels[doc.channel].instruments[doc.getCurrentInstrument()].wave = newValue;
				doc.notifier.changed();
				this._didSomething();
			}
		}
	}

