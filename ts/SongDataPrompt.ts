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

/// <reference path="synth.ts" />
/// <reference path="SongDocument.ts" />
/// <reference path="SongEditor.ts" />
/// <reference path="Prompt.ts" />
/// <reference path="html.ts" />
/// <reference path="changes.ts" />

namespace beepbox {
	const {button, div, text} = html;
	export class SongDataPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [text("Close")]);
		
		public readonly container: HTMLDivElement = div({className: "prompt", style: "width: 250px;"}, [
                div({ style: "font-size: 2em" }, [text("Song Data")]),
				div({ style: "text-align: left;" }, [text('You are on update Nepbox 2.0')]),
				div({ style: "text-align: left;" }, [text('Your song is ' + this._doc.synth.totalSeconds + ' seconds long.')]),
				div({ style: "text-align: left;" }, [text('Your song runs at ' + this._doc.song.getBeatsPerMinute() + ' beats per minute.')]),
				div({ style: "text-align: left;" }, [text('There are currently ' + this._doc.song.getChannelUnusedCount() + ' unused channels in your song out of 16.')]),
				div({ style: "text-align: left;" }, [text('Your are using the ' + this._doc.song.getThemeName() + ' theme.')]),
				div({ style: "text-align: left;" }, [text('Your time signuature is ' + this._doc.song.getTimeSig())]),
				div({ style: "text-align: left;" }, [text('Your scale is ' + this._doc.song.getScaleNKey() + '.')]),
			this._cancelButton,
         ]);

			constructor(private _doc: SongDocument, private _songEditor: SongEditor) {
				this._cancelButton.addEventListener("click", this._close);
			}
			private _close = (): void => { 
				this._doc.undo();
			}
			
			public cleanUp = (): void => { 
				this._cancelButton.removeEventListener("click", this._close);
            };
    }
}