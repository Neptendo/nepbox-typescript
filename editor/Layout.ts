// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import {HTML} from "imperative-html/dist/esm/elements-strict";
//import {ColorConfig} from "./ColorConfig";

export class Layout {
	private static readonly _layoutMap: {[K: string]: string} = {
		"small": "",

		// Full

		"full": `\
		body {
			margin: 0;
		}

		.centerDiv {
			width: unset !important;
		}

		#beepboxEditorContainer {
			width: 100% !important;
			height: 100vh !important;
		}
		
		.modTitle {
		display: none;
		}

		.beepboxEditor {
			width: 100%;
			height: 100vh;
			grid-template-columns: minmax(0, 1fr) 190px 200px;
			grid-template-rows: minmax(0px, min-content) minmax(0px, 1fr) minmax(0, min-content);
			overflow-y: hidden;
		}

		.editorBox {
			height: unset !important;
		}

		.trackContainer {
			width: unset !important;
			overflow-x: scroll !important;
		}

		.beepboxEditor .trackAndMuteContainer {
			width: 100%;
			min-height: 0;
			flex: 1;
			overflow: auto;
		}

		.trackArea {
			overflow-y: scroll;
		}

		.barScrollBar {
			display: none !important;
		}
		`,

		// Middle

		"middle": `\
				body {
			margin: 0;
		}

		.centerDiv {
			width: unset !important;
		}

		.modTitle {
		display: none;
		}

		#beepboxEditorContainer {
			width: 100% !important;
			height: 100vh !important;
		}
		
		.beepboxEditor {
			width: 100%;
			height: 100vh;
			grid-template-areas:
				"settings-area      pattern-area  advanced-settings-area" 
				"song-settings-area pattern-area  advanced-settings-area" 
				"song-settings-area track-area    advanced-settings-area" !important;
			grid-template-columns: 190px minmax(0, 1fr) 200px;
			grid-template-rows: minmax(0px, min-content) minmax(0px, 1fr) minmax(0, min-content);
			overflow-y: hidden;
		}

		.settings-area {
			margin-left: 0 !important;
			margin-right: 6px !important;
		}

		.song-settings-area {
			margin-left: 0 !important;
			margin-right: 6px !important;
		}

		.editorBox {
			height: unset !important;
		}

		.trackContainer {
			width: unset !important;
			overflow-x: scroll !important;
		}

		.trackArea {
			overflow-y: scroll;
		}

		.beepboxEditor .trackAndMuteContainer {
			width: 100%;
			min-height: 0;
			flex: 1;
			overflow: auto;
		}

		.barScrollBar {
			display: none !important;
		}
		`,

		// Flow

		"flow": `\
		body {
			margin: 0;
		}

		.beepboxEditor {
			width: 100%;
			height: 100vh;
			grid-template-areas:
				"settings-area settings-area         " 
				"song-settings-area     pattern-area" 
				"advanced-settings-area pattern-area"
				"advanced-settings-area track-area  " !important;
			grid-template-columns: 190px minmax(0, 1fr);
			grid-template-rows: minmax(0px, min-content) minmax(0px, min-content) minmax(0px, 1fr);
			overflow-y: hidden;
		}


		.centerDiv {
			width: unset !important;
		}

		#beepboxEditorContainer {
			width: 100% !important;
			height: 100vh !important;
		}
		
		.modTitle {
		display: none;
		}

		.editorBox {
			height: unset !important;
		}

		.trackContainer {
			width: unset !important;
			overflow-x: scroll !important;
		}

		.beepboxEditor .trackAndMuteContainer {
			width: 100%;
			min-height: 0;
			flex: 1;
			overflow: auto;
		}

		.trackArea {
			overflow-y: scroll;
		}

		.barScrollBar {
			display: none !important;
		}

		.beepboxEditor .editor-settings {
			margin-right: 6px;
		}

		.settings-area {
			width: 50% !important;
  			gap: 3px !important;
			flex-direction: row !important;
		}

		.settings-area .title {
			flex: 1;
		}

		.settings-area .controller {
			flex-direction: row-reverse !important;
			flex: 3;
		}

		.settings-area .controller div {
			flex: 1;
		}

		.settings-area .editor-widgets {
			flex: 1;
		}

		.settings-area .editor-widgets .editor-menus {
			flex-direction: row;
			gap: 3px;
			margin-top: .2em;
			width: 0 !important;
		}

		.settings-area .editor-widgets .editor-menus .selectContainer {
			display: flex;
  			justify-content: center;
		}

		.settings-area .editor-widgets .editor-menus svg {
			left: unset !important;
		}

		.settings-area .editor-widgets .editor-menus .selectContainer select {
			width: 0 !important;
		}

		.beepboxEditor .selectContainer.menu::after {
			content: none !important;
		}
		`,
	}
	
	private static readonly _styleElement: HTMLStyleElement = document.head.appendChild(HTML.style({type: "text/css"}));
	
	public static setLayout(layout: string): void {
		this._styleElement.textContent = this._layoutMap[layout];
	}
}
