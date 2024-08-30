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

	const {button, div, a} = HTML;
	export class ArchivePrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, div("No thanks!"));
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 250px;"}, 
			div({ style: "font-size: 2em" }, div("Archives")),
			div({ style: "text-align: center;" }, div('These are the Archives. Below are previous versions of Modded Beepbox/Sandbox that you are able to play around with, changelog included. Go nuts!')),
			div({ style: "text-align: center;" }, 
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.3.0.htm" }, div("MB 1.3.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.6.0.htm" }, div("MB 1.6.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.9.1.htm" }, div("MB 1.9.1")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.0.0.htm" }, div("MB v2.0.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.3.0.htm" }, div("MB v2.2.2")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.3.html" }, div("MB v2.3.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/3.0.html" }, div("MB v3.0.3")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.2.1.htm" }, div("SB v1.2.1")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.3.0.htm" }, div("SB v1.3.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.4.0.htm" }, div("SB v1.4.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/2.0.6.1.htm" }, div("SB v2.0.6.1")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/2.1.3.htm" }, div("SB v2.1.3")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/3.0.0.htm" }, div("SB v3.0.0")), div(" | "),
				a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/changelogs/mbchangelog.html" }, div("Changelog")),
			),
			this._cancelButton,
		);

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
