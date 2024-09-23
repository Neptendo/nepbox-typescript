// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import {HTML} from "imperative-html/dist/esm/elements-strict";
//import {ColorConfig} from "./ColorConfig";

export class Layout {
	private static readonly _layoutMap: {[K: string]: string} = {
		"small": "",
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
		
		.beepboxEditor {
			width: 100%;
			height: 100vh;
			grid-template-columns: minmax(0, 1fr) 190px 200px;
			grid-template-rows: minmax(0px, min-content) minmax(481px, 1fr) minmax(0, min-content);
		}

		.editorBox {
			height: unset !important;
		}

		.trackContainer {
			width: unset !important;
			overflow-x: scroll !important;
		}

		.barScrollBar {
			display: none !important;
		}
		`,
		"middle": `\
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
		
		.beepboxEditor {
			width: 100%;
			height: 100vh;
			grid-template-areas:
				"settings-area      pattern-area  advanced-settings-area" 
				"song-settings-area pattern-area  advanced-settings-area" 
				"song-settings-area track-area    advanced-settings-area" !important;
			grid-template-columns: 190px minmax(0, 1fr) 200px;
			grid-template-rows: minmax(0px, min-content) minmax(481px, 1fr) minmax(0, min-content);
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

		.barScrollBar {
			display: none !important;
		}
		`,
	}
	
	private static readonly _styleElement: HTMLStyleElement = document.head.appendChild(HTML.style({type: "text/css"}));
	
	public static setLayout(layout: string): void {
		this._styleElement.textContent = this._layoutMap[layout];
	}
}
