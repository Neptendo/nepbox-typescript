// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import {SongDocument} from "./SongDocument";
import {Layout} from "./Layout";
import {Prompt} from "./Prompt";
import {HTML, SVG} from "imperative-html/dist/esm/elements-strict";

const {button, label, div, form, input} = HTML;

export class LayoutPrompt implements Prompt {
	private readonly _fileInput: HTMLInputElement = input({type: "file", accept: ".json,application/json,.mid,.midi,audio/midi,audio/x-midi"});
	private readonly _okayButton: HTMLButtonElement = button({class: "okayButton", style: "flex:1;"}, "Okay");
	private readonly _cancelButton: HTMLButtonElement = button({style:"flex: 1; width: 0;"},"Cancel");
	private readonly _form: HTMLFormElement = form({style: "display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; max-height: 265px; overflow-y: scroll; overflow-x: hidden;"},
			label({class: "layout-option"},
				input({type: "radio", name: "layout", value: "small"}),
				SVG(`\
					<svg viewBox="-4 -1 28 22">
						<rect x="0" y="0" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1"/>
						<rect x="2" y="2" width="11" height="10" fill="currentColor"/>
						<rect x="14" y="2" width="4" height="16" fill="currentColor"/>
						<rect x="2" y="13" width="11" height="5" fill="currentColor"/>
					</svg>
				`),
				div("Small"),
			),
			label({class: "layout-option"},
				input({type: "radio", name: "layout", value: "full"}),
				SVG(`\
					<svg viewBox="-1 -1 28 22">
						<rect x="0" y="0" width="26" height="20" fill="none" stroke="currentColor" stroke-width="1"/>
						<rect x="2" y="2" width="12" height="10" fill="currentColor"/>
						<rect x="15" y="2" width="4" height="16" fill="currentColor"/>
						<rect x="20" y="2" width="4" height="16" fill="currentColor"/>
						<rect x="2" y="13" width="12" height="5" fill="currentColor"/>
					</svg>
				`),
				div("Full"),
			),
			label({class: "layout-option"},
				input({type: "radio", name: "layout", value: "middle"}),
				SVG(`\
					<svg viewBox="-1 -1 28 22">
						<rect x="0" y="0" width="26" height="20" fill="none" stroke="currentColor" stroke-width="1"/>
						<rect x="7" y="2" width="12" height="10" fill="currentColor"/>
						<rect x="2" y="2" width="4" height="16" fill="currentColor"/>
						<rect x="20" y="2" width="4" height="16" fill="currentColor"/>
						<rect x="7" y="13" width="12" height="5" fill="currentColor"/>
					</svg>
				`),
				div("Middle"),
			),
			label({class: "layout-option"},
				input({type: "radio", name: "layout", value: "flow"}),
				SVG(`\
					<svg viewBox="-1 -1 28 22">
						<rect x="0" y="0" width="26" height="20" fill="none" stroke="currentColor" stroke-width="1"/>
						<rect x="7" y="5" width="17" height="7" fill="currentColor"/>
						<rect x="2" y="2" width="22" height="2" fill="currentColor"/>
						<rect x="2" y="5" width="4" height="13" fill="currentColor"/>
						<rect x="7" y="13" width="17" height="5" fill="currentColor"/>
					</svg>
				`),
				div("Flow"),
			),
		);
	
	public readonly container: HTMLDivElement = div({class: "prompt noSelection", style: "width: 300px;"},
		div({ style: "font-size: 2em" }, div("Layouts")),
		this._form,
		div({style: "display: flex; flex-direction: row; justify-content: space-between; gap: 3px;"},
			this._cancelButton,
			this._okayButton,
		),
	);
	
	constructor(private _doc: SongDocument) {
		this._fileInput.select();
		setTimeout(()=>this._fileInput.focus());
		
		this._okayButton.addEventListener("click", this._confirm);
		this._cancelButton.addEventListener("click", this._close);
		this.container.addEventListener("keydown", this._whenKeyPressed);
		
		(<any> this._form.elements)["layout"].value = this._doc.layout;
	}
	
	private _close = (): void => { 
		this._doc.undo();
	}
	
	public cleanUp = (): void => { 
		this._okayButton.removeEventListener("click", this._confirm);
		this._cancelButton.removeEventListener("click", this._close);
		this.container.removeEventListener("keydown", this._whenKeyPressed);
	}
	
	private _whenKeyPressed = (event: KeyboardEvent): void => {
		if ((<Element> event.target).tagName != "BUTTON" && event.keyCode == 13) { // Enter key
			this._confirm();
		}
	}
	
	private _confirm = (): void => { 
		window.localStorage.setItem("layout", (<any> this._form.elements)["layout"].value)
		this._doc.layout = (<any> this._form.elements)["layout"].value;
		Layout.setLayout(this._doc.layout);
		this._close();
	}
}
