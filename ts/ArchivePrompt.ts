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
	export class ArchivePrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [text("No thanks!")]);
		
		public readonly container: HTMLDivElement = div({className: "prompt", style: "width: 250px;"}, [
			div({ style: "font-size: 2em" }, [text("Archives")]),
			div({ style: "text-align: center;" }, [text('These are the Archives. Below are previous versions of Modded Beepbox/Sandbox that you are able to play around with, changelog included. Go nuts!')]),
			div({ style: "text-align: center;" }, [
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.3.0.htm" }, [text("MB 1.3.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.6.0.htm" }, [text("MB 1.6.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.9.1.htm" }, [text("MB 1.9.1")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.0.0.htm" }, [text("MB v2.0.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.3.0.htm" }, [text("MB v2.2.2")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.3.html" }, [text("MB v2.3.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/3.0.html" }, [text("MB v3.0.3")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.2.1.htm" }, [text("SB v1.2.1")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.3.0.htm" }, [text("SB v1.3.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.4.0.htm" }, [text("SB v1.4.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/2.0.6.1.htm" }, [text("SB v2.0.6.1")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/2.1.3.htm" }, [text("SB v2.1.3")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/3.0.0.htm" }, [text("SB v3.0.0")]), text(" | "),
				html.element("a", { target: "_blank", href: "https://moddedbeepbox.github.io/beta/changelogs/mbchangelog.html" }, [text("Changelog")]),
			]),
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