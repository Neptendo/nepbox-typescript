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
	export class RefreshPrompt implements Prompt {
		private readonly _cancelButton: HTMLButtonElement = button({}, [text("Close")]);
		private readonly _refreshButton: HTMLButtonElement = button({}, [text("Refresh")]);
		
		public readonly container: HTMLDivElement = div({className: "prompt", style: "width: 200px;"}, [
			div({style: "font-size: 1em"}, [text("Refresh?")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				text("In order for the theme to change the song must refresh. If you refresh on your own after canceling your theme will not update.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				text("If you use a browser that does not support automatic refreshing, like Microsoft Edge, you will have to refresh manually.")]),
			div({style: "text-align: left; margin: 0.5em 0;"}, [
				text("Would you like to refresh now?")]),
            this._refreshButton,
			this._cancelButton,
         ]);

			constructor(private _doc: SongDocument, private _songEditor: SongEditor, private _newThemeValue: number) {
				this._cancelButton.addEventListener("click", this._saveChanges);
				this._refreshButton.addEventListener("click", this._saveChangesAndRefresh);
			}

			private _saveChanges = (): void => {
				this._doc.prompt = null;
				this._doc.record(new ChangeTheme(this._doc, this._newThemeValue), true);
			}

			private _saveChangesAndRefresh = (): void => {
				this._saveChanges();
				this._songEditor.refreshNow();
			}
			
			public cleanUp = (): void => { 
				this._cancelButton.removeEventListener("click", this._saveChanges);
				this._refreshButton.removeEventListener("click", this._saveChangesAndRefresh);
            };
    }
}
