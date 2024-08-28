import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeSong } from "./changes";
const { button, div, input } = HTML;
export class ImportPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._fileInput = input({ type: "file", accept: ".json,application/json" });
        this._cancelButton = button({}, [div("Cancel")]);
        this.container = div({ class: "prompt", style: "width: 200px;" }, [
            div({ style: "font-size: 2em" }, [div("Import")]),
            div({ style: "text-align: left;" }, [div("BeepBox songs can be exported and re-imported as .json files. You could also use other means to make .json files for BeepBox as long as they follow the same structure.")]),
            this._fileInput,
            this._cancelButton,
        ]);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._fileInput.removeEventListener("change", this._whenFileSelected);
            this._cancelButton.removeEventListener("click", this._close);
        };
        this._whenFileSelected = () => {
            const file = this._fileInput.files[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                this._doc.prompt = null;
                this._doc.record(new ChangeSong(this._doc, reader.result), true);
            });
            reader.readAsText(file);
        };
        this._fileInput.addEventListener("change", this._whenFileSelected);
        this._cancelButton.addEventListener("click", this._close);
    }
}
//# sourceMappingURL=ImportPrompt.js.map