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
import { SongEditor } from "./SongEditor";
import { ChangeKey } from "./changes";
	const {button, div} = HTML;
	export class RefreshKeyPrompt implements Prompt {
		private readonly _refreshButton: HTMLButtonElement = button({}, [div("Refresh")]);
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 200px;"}, [
			div({style: "font-size: 1em"}, [div("Refresh")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("Due to you using the Piano theme, you will need to refresh to display the change in key colors.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				div("You must refresh to continue.")]),
            this._refreshButton,
         ]);

			constructor(private _doc: SongDocument, private _songEditor: SongEditor, private _newKeyValue: number) {
				this._refreshButton.addEventListener("click", this._saveChangesAndRefresh);
			}

			private _saveChangesAndRefresh = (): void => {
				this._doc.prompt = null;
				this._doc.record(new ChangeKey(this._doc, this._newKeyValue));
				this._songEditor.refreshNow();
			}
			
			public cleanUp = (): void => { 
				this._refreshButton.addEventListener("click", this._saveChangesAndRefresh);
            };
    }
