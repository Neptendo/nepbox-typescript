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
import { Prompt } from "./Prompt";
import { SongDocument } from "./SongDocument";
	const {button, div} = HTML;

	export class ChorusPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [div("Close")]);
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 250px;"}, [
			div({style: "font-size: 2em"}, [div("Custom Harmony")]),
			div({style: "text-align: left;"}, [div(
				'BeepBox "chip" instruments play two waves at once, each with their own pitch.')]),
			div({style: "text-align: left;" }, [div('By placing two notes one above another it will play two indivdual sounds. ' +
			'This replaces the "arpeggio/trill" effect, and gives you greater control over your harmony. ')]),
			div({ style: "text-align: left;" }, [
				div('In older versions of Modbox, union would not allow notes to harmonize properly and needed a special harmonic chorus in order to work. This has been patched in Modbox 3.1.0. '
				)]),
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
		}
	}

