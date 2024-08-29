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

import { HTML } from "imperative-html/dist/esm/elements-strict";
import { SongDocument } from "./SongDocument";
import { Prompt } from "./Prompt";
	const {button, div} = HTML;

	export class SongDataPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [div("Close")]);
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 250px;"}, [
                div({ style: "font-size: 2em" }, [div("Song Data")]),
				div({ style: "text-align: left;" }, [div('You are on update Modbox 3.3.0-B_1.')]),
				div({ style: "text-align: left;" }, [div('Your song is ' + this._doc.synth.totalSeconds + ' seconds long.')]),
				div({ style: "text-align: left;" }, [div('Your song runs at ' + this._doc.song.getBeatsPerMinute() + ' beats per minute.')]),
				div({ style: "text-align: left;" }, [div('There are currently ' + this._doc.song.getChannelUnusedCount() + ' unused channels in your song out of 16.')]),
				div({ style: "text-align: left;" }, [div('Your are using the ' + this._doc.song.getThemeName() + ' theme.')]),
				div({ style: "text-align: left;" }, [div('Your time signuature is ' + this._doc.song.getTimeSig())]),
				div({ style: "text-align: left;" }, [div('Your scale is ' + this._doc.song.getScaleNKey() + '.')]),
			this._cancelButton,
         ]);

			constructor(private _doc: SongDocument) {
				this._cancelButton.addEventListener("click", this._close);
			}
			private _close = (): void => { 
				this._doc.undo();
			}
			
			public cleanUp = (): void => { 
				this._cancelButton.removeEventListener("click", this._close);
            };
    }
