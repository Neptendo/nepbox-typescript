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

import { HTML} from "imperative-html/dist/esm/elements-strict";
import { Prompt } from "./Prompt";
import { SongDocument } from "./SongDocument";
	const {button, div, a} = HTML;

	export class InstrumentTypePrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [div("Close")]);
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 300px;"}, [
			div({style: "font-size: 2em"}, [div("FM Synthesis")]),
			div({ style: "text-align: left; margin: 0.5em 0;" }, [
				div('Popularized by the Sega Genesis and Yamaha keyboards, FM Synthesis is a mysterious but powerful technique for crafting sounds. It may seem confusing, but just play around with the options until you get a feel for it, check out some examples in '),
				a( { target: "_blank", href: "#6n10s0kbl00e07t5m0a7g07j7i7r1o2T1d2c0A0F1B0V1Q0200Pff00E0411T1d1c0A0F0B0V1Q2800Pf700E0711T1d2c0A0F1B4VaQ0200Pfb00E0911T1d1c2A0F9B3V1Q1000Pfbc0E0191T1d2c0AcF8B5V1Q0259PffffE0000T1d3c1AcF4B5V4Q2600Pff00E0011T1d1c0AbF0B0V1Q2580PfffaE2226T1d1c0A1F0B0V1Q520dPff4dEd41eb4zhmu0p21h5dfxd7ij7XrjfiAjPudUTtUSRsTzudTudJvdUTztTzrpPudUTtUSSYTzudTudJTdUTztTzrvPudUTtUSQ" }, [div("this demo")]),
				div(", or find some instruments to use in the Beepbox Discord's FM sheet "),
				a( { target: "_blank", href: "https://docs.google.com/spreadsheets/d/1ddbXnrP7yvv5X4oUur9boi3AxcI-Xxz1XIHIAo-wi0s/edit#gid=230623845" }, [div("right here")]),
				div(".")
			]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [div(
				'This FM instrument uses up to four waves, numbered 1, 2, 3, and 4. ' +
				'Each wave may have its own frequency, volume, and volume envelope to control its effect over time. '
			)]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [div(
				'There are two kinds of waves: "carrier" waves play a tone out loud, but "modulator" waves distort other waves instead. ' +
				'Wave 1 is always a carrier and plays a tone, but other waves may distort it. ' +
				'The "Algorithm" setting determines which waves are modulators, and which other waves those modulators distort. '
			)]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [div(
				'Modulators distort in one direction (like 1←2), but you can also use "Feedback" to make any wave distort in the opposite direction (1→2), in both directions (1🗘2), or even itself (1⟲). '
			)]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [div(
				'You can set the pitch of each wave independently by adding simultaneous notes, one above another. This often sounds harsh or dissonant, but can make cool sound effects! '
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

