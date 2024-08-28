import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeKey } from "./changes";
const { button, div } = HTML;
export class RefreshKeyPrompt {
    constructor(_doc, _songEditor, _newKeyValue) {
        this._doc = _doc;
        this._songEditor = _songEditor;
        this._newKeyValue = _newKeyValue;
        this._refreshButton = button({}, [div("Refresh")]);
        this.container = div({ class: "prompt", style: "width: 200px;" }, [
            div({ style: "font-size: 1em" }, [div("Refresh")]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Due to you using the Piano theme, you will need to refresh to display the change in key colors.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("You must refresh to continue.")
            ]),
            this._refreshButton,
        ]);
        this._saveChangesAndRefresh = () => {
            this._doc.prompt = null;
            this._doc.record(new ChangeKey(this._doc, this._newKeyValue));
            this._songEditor.refreshNow();
        };
        this.cleanUp = () => {
            this._refreshButton.addEventListener("click", this._saveChangesAndRefresh);
        };
        this._refreshButton.addEventListener("click", this._saveChangesAndRefresh);
    }
}
//# sourceMappingURL=RefreshKeyPrompt.js.map