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

		export class MixPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [div("Close")]);
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 300px;"}, [
			div({style: "font-size: 2em"}, [div("Mixing Styles")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("Mixing styles are a way how changing how loud or soft different sounds are and can change the way different sounds blend and mix together. Using different mixing styles can drastically change your song.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("Type A Mixing is akin to mixing in vanilla Beepbox, Sandbox, and most other beepbox mods. In this mixing type, the drums are about twice as loud as in Type B mixing and the sound is generally a bit sharper and blends together differently.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("Type B Mixing is regular Modbox mixing.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("Type C Mixing is like Type B, save for a few upgrades. There are more volume options in Type C mixing, certain waves (acoustic bass, lyre, ramp pulse, and piccolo) are a bit quieter, the flatline wave is a bit louder, and blending works slightly differently.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("Type D Mixing includes slightly quieter drums from Type B, but also includes sharper sounds for regular notes in pitch channels.")]),
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
	