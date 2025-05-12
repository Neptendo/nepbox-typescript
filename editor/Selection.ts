import {ChangeGroup} from "./Change";
import { ChangeChannelBar, ChangeAddChannel, ChangeSoloChannels, ChangeAllImute } from "./changes";
import { Config } from "../synth/SynthConfig";
import { SongDocument } from "./SongDocument";
//import { Channel, Instrument } from "../synth/synth";

export class Selection {

    constructor(private _doc: SongDocument) {}

    public muteAllInstruments(): void {
        let shouldMute: boolean = false;
        if (this._doc.song.channels[this._doc.channel].instruments[0].imute == 0) {
            shouldMute = true;
        }

        for(let instrumentIndex: number = 0; instrumentIndex < this._doc.song.channels[this._doc.channel].instruments.length; instrumentIndex++) {  
            this._doc.record(new ChangeAllImute(this._doc, Number(shouldMute), instrumentIndex));
        }

    this._doc.notifier.changed();
}

    public soloChannels(invert: boolean): void {

            let mutedCounter: number = 0;

			for (let channelIndex: number = 0; channelIndex < this._doc.song.channels.length; channelIndex++) {
				for(let instrumentIndex: number = 0; instrumentIndex < this._doc.song.channels[channelIndex].instruments.length; instrumentIndex++) {

                    if (this._doc.song.channels[channelIndex].instruments[instrumentIndex].imute == (invert ? 0 : 1) && channelIndex != this._doc.channel) {
                        mutedCounter++;
                    }

                    if (channelIndex != this._doc.channel) {
                        this._doc.record(new ChangeSoloChannels(this._doc, Number(!invert), channelIndex, instrumentIndex));
                    } else {
                        this._doc.record(new ChangeSoloChannels(this._doc, Number(invert), channelIndex, instrumentIndex));
                    }

                    
                }
			}

            if (mutedCounter >= this._doc.song.pitchChannelCount + this._doc.song.drumChannelCount - 1) {
                for (let channelIndex: number = 0; channelIndex < this._doc.song.channels.length; channelIndex++) {
                    for(let instrumentIndex: number = 0; instrumentIndex < this._doc.song.channels[channelIndex].instruments.length; instrumentIndex++) {
                        this._doc.record(new ChangeSoloChannels(this._doc, Number(invert), channelIndex, instrumentIndex));  
                    }
                }
            }
		this._doc.notifier.changed();
	}

    public insertChannel(): void {

        const group: ChangeGroup = new ChangeGroup();
        const insertIndex: number = this._doc.channel;
        const isNoise: boolean = this._doc.song.getChannelIsDrum(insertIndex);
        group.append(new ChangeAddChannel(this._doc, insertIndex+1, isNoise));
        if (!group.isNoop()) {
            group.append(new ChangeChannelBar(this._doc, insertIndex, this._doc.bar));
            this._doc.record(group);
        }

        if (!isNoise && this._doc.channel < Config.pitchChannelCountMax-1) {
            this._doc.channel++;
        }

        if (isNoise && this._doc.channel < Config.drumChannelCountMax + this._doc.song.pitchChannelCount - 1) {
            this._doc.channel++;
        }

    }
}