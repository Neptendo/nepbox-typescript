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
import { ColorConfig } from "./ColorConfig"; 
	const {button, div, form, label, input } = HTML;

	export class ThemePrompt implements Prompt {
		public hasChanged = false;
		private readonly _closeButton: HTMLButtonElement = button({style:"flex: 1; width: 0;"},"Close");
		private readonly _previewButton: HTMLButtonElement = button({style:"flex: 1; width: 0;"},"Preview");
		private readonly _previewText: HTMLDivElement = div({style:"opacity: 0; position:absolute; left: 8px; top: 24px; font-size: 32px; font-weight:bold;"},"Previewing...")
		public readonly previewExit: HTMLDivElement = div({style: "width: 100vw; height: 100vh; position: fixed; left: 0; top: -2vh; display: flex; pointer-events: none;"},this._previewText);
		
		private _form: HTMLFormElement = form({style: "display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-height:265px; overflow-y: scroll; overflow-x: hidden;"},
			label({title:"Default", class: "theme-option"},
				input({type: "radio", name: "theme", value: "default", style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #606060; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Default"),
				),
			),
			label({title:"NepBox", class: "theme-option"},
				input({type: "radio", name: "theme", value: "nepbox",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #9150ff; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"NepBox"),
				),
			),
			label({title:"ModBox 2.0", class: "theme-option"},
				input({type: "radio", name: "theme", value: "modbox2",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #c4ffa3; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"ModBox 2.0"),
				),
			),
			label({title:"Artic", class: "theme-option"},
				input({type: "radio", name: "theme", value: "artic",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #a5eeff; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Artic"),
				),
			),
			label({title:"Cinnamon Roll [!]", class: "theme-option"},
				input({type: "radio", name: "theme", value: "Cinnamon Roll",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #f5bb00; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"CinnaBun [!]"),
				),
			),
			label({title:"Ocean", class: "theme-option"},
				input({type: "radio", name: "theme", value: "Ocean",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #4449a3; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Ocean"),
				),
			),
			label({title:"Rainbow [!]", class: "theme-option"},
				input({type: "radio", name: "theme", value: "rainbow",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: linear-gradient(140deg, #faa, #ffceaa, #ffdfaa, #fff5aa, #e8ffaa, #bfffb2, #b2ffc8, #b2ffe4, #b2b3ff, #e0b2ff, #ffafe9); border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Rainbow [!]"),
				),
			),
			label({title:"Float", class: "theme-option"},
				input({type: "radio", name: "theme", value: "float",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: linear-gradient(140deg, #fff, #282828); border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Float [!]"),
				),
			),
			label({ title:"Windows", class: "theme-option"},
				input({type: "radio", name: "theme", value: "windows",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #295294; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Windows"),
				),
			),
			label({title:"Grassland",class: "theme-option"},
				input({type: "radio", name: "theme", value: "grassland",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #74bc21; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Grassland"),
				),
			),
			label({title:"Dessert",class: "theme-option"},
				input({type: "radio", name: "theme", value: "dessert",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #fffc5b; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Dessert"),
				),
			),
			label({title:"Kahootiest",class: "theme-option"},
				input({type: "radio", name: "theme", value: "kahootiest",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #864cbf; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Kahoot"),
				),
			),
			label({title:"Beam to the Bit [!]",class: "theme-option"},
				input({type: "radio", name: "theme", value: "beambit",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #fa0103; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Beambit [!]"),
				),
			),
			label({title:"Pretty Egg",class: "theme-option"},
				input({type: "radio", name: "theme", value: "egg",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #ffb1f4; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Pretty Egg"),
				),
			),
			label({title:"Poniryoshka",class: "theme-option"},
				input({type: "radio", name: "theme", value: "Poniryoshka",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #dabbe6; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Poni"),
				),
			),
			label({title:"Gameboy [!]",class: "theme-option"},
				input({type: "radio", name: "theme", value: "gameboy",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #306230; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Gameboy [!]"),
				),
			),
			label({title:"Woodkid",class: "theme-option"},
				input({type: "radio", name: "theme", value: "woodkid",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #41323b; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Woodkid"),
				),
			),
			label({title:"Midnight",class: "theme-option"},
				input({type: "radio", name: "theme", value: "midnight",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #445566; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Midnight"),
				),
			),
			label({title:"Snedbox",class: "theme-option"},
				input({type: "radio", name: "theme", value: "snedbox",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #10997e; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Snedbox"),
				),
			),
			label({title:"unnamed",class: "theme-option"},
				input({type: "radio", name: "theme", value: "unnamed",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #ffffa0; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"unnamed"),
				),
			),
			label({title:"Piano",class: "theme-option"},
				input({type: "radio", name: "theme", value: "piano",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #bfbfbf; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Piano [!]"),
				),
			),
			label({title:"Halloween",class: "theme-option"},
				input({type: "radio", name: "theme", value: "halloween",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #914300; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Halloween"),
				),
			),
			label({title:"FrozenOver❄️",class: "theme-option"},
				input({type: "radio", name: "theme", value: "frozen",style:"display:none;"}),
				div({style:"display: flex; flex-direction: column; gap: 3px; align-items: center;"},
					div({style:"background: black; width: 64px; height: 64px; border-radius: 35px; border: solid; border-color:currentColor; display: flex; align-items: center; justify-content: center;"},
						div({style:"width: 58px; height: 58px; background: #99c8ef; border-radius: 35px;"}),
					),
					div({style:"text-wrap:wrap; max-width: 64px; color:currentColor;"},"Frozen"),
				),
			),
		);
		
		
		public readonly themeContainer: HTMLDivElement = div({class: "prompt", style: "width: 330px; max-height: 600px;"}, 
                div({ style: "font-size: 2em" }, div("Themes")),
				this._form,
				div({style:"display:flex; flex-direction:row; width:100%; gap: 16px;"},
			this._previewButton,
			this._closeButton),
        );
		public readonly container: HTMLDivElement = div({}, 
			this.themeContainer,
			this.previewExit,
        );

			constructor(private _doc: SongDocument) {
				this._closeButton.addEventListener("click", this._close);
				this._previewButton.addEventListener("click", this._previewTheme);
				this.previewExit.addEventListener("click", this._exitPreview);
				this._form.addEventListener("change", this._themeChange);
				if (window.localStorage.getItem("modboxTheme") != null) {
					(<any> this._form.elements)["theme"].value = window.localStorage.getItem("modboxTheme");
				}
			}

			private _close = (): void => { 
				if (this.hasChanged == false) {
					if (window.localStorage.getItem("modboxTheme")){
						ColorConfig.setTheme(String(window.localStorage.getItem("modboxTheme")));
					} else {
						ColorConfig.setTheme("default");
					}
					this._doc.prompt = null;
					this._doc.undo(); 
				} else {
					window.localStorage.setItem("modboxTheme", (<any> this._form.elements)["theme"].value);
					this._doc.prompt = null;
					this._doc.undo();	
				}
			}

			private _themeChange = (): void => {
				ColorConfig.setTheme((<any> this._form.elements)["theme"].value);
				
				if ((<any> this._form.elements)["theme"].value != window.localStorage.getItem("modboxTheme")) {
				this.hasChanged = true;
				this._closeButton.innerHTML = "Save"; 
			} else {
				this.hasChanged = false;
				this._closeButton.innerHTML = "Cancel"; 
				}
			}

			private _previewTheme = (): void => { 
				this.themeContainer.style.opacity = "0";
				this.previewExit.style.pointerEvents = "";
				this._previewText.style.opacity = "1";
			}

			private _exitPreview = (): void => { 
				this.themeContainer.style.opacity = "1";
				this.previewExit.style.pointerEvents = "none";
				this._previewText.style.opacity = "0";
			}
			
			public cleanUp = (): void => { 
				this._closeButton.removeEventListener("click", this._close);
            };
    }
