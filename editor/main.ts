// Copyright (c) 2012-2022 John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import {InstrumentType, Config} from "../synth/SynthConfig";
import {isMobile, SongEditor} from "./SongEditor";
import {NotePin, Note, Pattern, Instrument, Channel, Song, Synth} from "../synth/synth";
import {SongDocument} from "./SongDocument";
import {ExportPrompt} from "./ExportPrompt";
import "./style"; // Import for the side effects, there's no exports.

const doc: SongDocument = new SongDocument(location.hash);
const editor: SongEditor = new SongEditor(doc);
const beepboxEditorContainer: HTMLElement = document.getElementById("beepboxEditorContainer")!;
beepboxEditorContainer.appendChild(editor.mainLayer);
editor.whenUpdated();
editor.mainLayer.focus();

if (!isMobile && doc.autoPlay) {
	function autoplay(): void {
		if (!document.hidden) {
			doc.synth.play();
			editor.updatePlayButton();
			window.removeEventListener("visibilitychange", autoplay);
		}
	}
	if (document.hidden) {
		// Wait until the tab is visible to autoplay:
		window.addEventListener("visibilitychange", autoplay);
	} else {
		autoplay();
	}
}

// BeepBox uses browser history state as its own undo history. Browsers typically
// remember scroll position for each history state, but BeepBox users would prefer not 
// auto scrolling when undoing. Sadly this tweak doesn't work on Edge or IE.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

editor.updatePlayButton();

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service_worker.js", {updateViaCache: "all", scope: "/"}).catch(() => {});
}

// When compiling synth.ts as a standalone module named "beepbox", expose these classes as members to JavaScript:
export {InstrumentType, Config, NotePin, Note, Pattern, Instrument, Channel, Song, Synth, SongDocument, SongEditor, ExportPrompt};
