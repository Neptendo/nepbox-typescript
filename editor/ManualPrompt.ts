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
	const {button, div, p, a } = HTML;

	export class ManualPrompt implements Prompt {
		private readonly _nextButton: HTMLButtonElement = button({style:"flex: 1; width: 0;"},"Next");
		private readonly _backButton: HTMLButtonElement = button({style:"flex: 1; width: 0;"},"Close");
		private page: number = 0;

		private readonly introContainer: HTMLDivElement = div({style:"display:flex; flex-direction: column; gap: 16px; text-align: left; font-size: 16px; overflow-y: scroll;"},
			div({ style: "font-size: 1.5em" }, div("Introduction")),
			div({},
			"BeepBox is an online tool for sketching and sharing chiptune melodies. ModBox expands the world of BeepBox into a whole new realm! We are on the frontier of exploaration with this beta!"
			),
			div({},
				"This is a specialized manual explaining the basics of using ModBox",
			),
			div({},
				"All song data is packaged into the URL at the top of your browser. When you make changes to the song, the URL is updated ",
				"to reflect your changes. When you are satisfied with your song, just copy and paste the URL to save and share your song!"
			),
			
		);

		private readonly instructionsContainer: HTMLDivElement = div({style:"display:none;  flex-direction: column; gap: 16px; text-align: left; font-size: 16px; overflow-y: scroll;"},
			div({ style: "font-size: 1.5em" }, div("Instructions")),
			div({},
			p({}," You can add or remove notes by clicking on the gray rows at the top. BeepBox automatically plays the notes out loud for you. Try it!",),
			p({},"Notes go into patterns, and you can edit one pattern at a time. Those numbered boxes at the bottom of the editor are the different patterns you can edit. Click the other boxes to move to a different part of the song, or click the arrows on the currently selected box to swap which pattern is played during that part of the song.",),
			p({},"There are four rows of patterns that BeepBox can play simultaneously, and each row has its own set of patterns. The first three rows can play melodies and the bottom row is for drums.",),
			p({},"The purple loop underneath the numbered boxes controls which part of the song is currently repeating. Move the loop to listen to a different part of the song, or drag the ends to expand the loop to include the whole song.",),
			),
			div({},
				p({},"When BeepBox has focus (click on its interface above), you can use these keyboard shortcuts:",),
				p({},	"Spacebar: Pause or Resume",),
				p({},	"Z: Undo",),
				p({},	"Y or Shift Z: Redo",),
				p({},	"C: Copy the current pattern",),
				p({},	"V: Paste the current pattern",),
				p({},	"Q: Go to Custom Song Settings",),
				p({},	"[ ]: Move the playhead backward and forward",),
				p({},	"Arrow Keys: Change which bar is selected",),
				p({},	"1-8: Reassign a pattern to the currently selected bar",),
				p({},	"In the pattern editor, you can click and drag horizontally on a note to adjust its duration. You can also click above or below an existing note to enable a rapid arpeggio/trill effect, oscillating between two or more simultaneous notes.",),

				p({},"AVDANCED: Drag vertically from an existing note to bend its pitch, or drag vertically from above or below the note to adjust its volume.",),

				p({},"ModBox has many more features. Enabling Advanced Settings via the Prefernces Menu unlocks much more of Modbox's features! ",),
				p({},"to reflect your changes. When you are satisfied with your song, just copy and paste the URL to save and share your song!",),
			),
		);

		private readonly aboutContainer: HTMLDivElement = div({style:"display:none;  flex-direction: column; gap: 16px; text-align: left; font-size: 16px; overflow-y: scroll;"},
			div({ style: "font-size: 1.5em" }, div("About")),
			div({},
				p({},"BeepBox is developed by John Nesky, also known as shaktool. Modded Beepbox is developed by Quirby64, Theepicosity, Fillygroove, and DARE. "),
			),
			div({},
				p({},"BeepBox and Modded Beepbox do not claim ownership over songs created with it, so original songs belong to their authors. ",),
			),
			div({},
				p({},"Neither John Nesky, BeepBox, nor the Modded BeepBox Dev Team assume responsibility for any copyrighted material played on BeepBox. No songs are ever received, recorded, or distributed by BeepBox or Moded Beepbox's servers. The Modbox Dev Team is not liable for any problems that may occur when your song gets updated in this beta and this beta alone. All song data is contained in the URL after the hash (#) mark, and BeepBox running inside your browser converts that data into sound waves. ",),
				p({},"You can download and use the",a({ href: "https://github.com/ModdedBeepbox/beta" }, "source code"),  "under the MIT license."),
			),
			
		);

		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 400px; max-height: 600px;"}, [
                div({ style: "font-size: 2em" }, div("Manual")),
				this.introContainer,
				this.instructionsContainer,
				this.aboutContainer,
				div({style:"display:flex; flex-direction:row; justify-content:space-between; width:100%; gap: 16px;"},
			this._backButton, this._nextButton),
         ]);

			constructor(private _doc: SongDocument) {
				this._backButton.addEventListener("click", this._backPage);
				this._nextButton.addEventListener("click", this._nextPage);
			}

			private _backPage = (): void => {
				if (this.page > 0) {
				this.page--;
				this._changePage();
				} else {
					this._close();
					this.cleanUp();
				}
			}

			private _nextPage = (): void => {
				if (this.page < 2) {
					this.page++;
					this._changePage();
				}
			}

			private _changePage = (): void => { 
				if (this.page == 0) {
					this.introContainer.style.display = "flex";
					this.instructionsContainer.style.display = "none";
					this.aboutContainer.style.display = "none";
					this._backButton.innerHTML = "Close";
				}
				if (this.page == 1) {
					this.introContainer.style.display = "none";
					this.instructionsContainer.style.display = "flex";
					this.aboutContainer.style.display = "none";
					this._backButton.innerHTML = "Back";
					this._nextButton.style.display = "";
				} 
				if (this.page == 2) {
					this.introContainer.style.display = "none";
					this.instructionsContainer.style.display = "none";
					this.aboutContainer.style.display = "flex";
					this._nextButton.style.display = "none";
				}
			}
			private _close = (): void => { 
				this._doc.undo();
			}
			
			public cleanUp = (): void => { 
				this._backButton.removeEventListener("click", this._backPage);
				this._nextButton.removeEventListener("click", this._nextPage);
            };
    }
