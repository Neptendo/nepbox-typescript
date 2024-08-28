import { Config } from "../synth/SynthConfig";
import { isMobile, SongEditor } from "./SongEditor";
import { Pattern, Instrument, Channel, Song, Synth } from "../synth/synth";
import { SongDocument } from "./SongDocument";
import { ExportPrompt } from "./ExportPrompt";
import "./style";
const doc = new SongDocument(location.hash);
const editor = new SongEditor(doc);
const beepboxEditorContainer = document.getElementById("beepboxEditorContainer");
beepboxEditorContainer.appendChild(editor.mainLayer);
editor.whenUpdated();
editor.mainLayer.focus();
if (!isMobile && doc.autoPlay) {
    function autoplay() {
        if (!document.hidden) {
            doc.synth.play();
            editor.updatePlayButton();
            window.removeEventListener("visibilitychange", autoplay);
        }
    }
    if (document.hidden) {
        window.addEventListener("visibilitychange", autoplay);
    }
    else {
        autoplay();
    }
}
if ("scrollRestoration" in history)
    history.scrollRestoration = "manual";
editor.updatePlayButton();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service_worker.js", { updateViaCache: "all", scope: "/" }).catch(() => { });
}
export { Config, Pattern, Instrument, Channel, Song, Synth, SongDocument, SongEditor, ExportPrompt };
//# sourceMappingURL=main.js.map