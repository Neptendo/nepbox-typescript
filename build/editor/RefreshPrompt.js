import { HTML } from "imperative-html/dist/esm/elements-strict";
import { ChangeTheme } from "./changes";
const { button, div } = HTML;
export class RefreshPrompt {
    constructor(_doc, _songEditor, _newThemeValue) {
        this._doc = _doc;
        this._songEditor = _songEditor;
        this._newThemeValue = _newThemeValue;
        this._cancelButton = button({}, [div("Close")]);
        this._refreshButton = button({}, [div("Refresh")]);
        this.container = div({ class: "prompt", style: "width: 200px;" }, [
            div({ style: "font-size: 1em" }, [div("Refresh?")]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("In order for the theme to change the song must refresh. If you refresh on your own after canceling your theme will not update.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("If you use a browser that does not support automatic refreshing, like Microsoft Edge, you will have to refresh manually.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Would you like to refresh now?")
            ]),
            this._refreshButton,
            this._cancelButton,
        ]);
        this._saveChanges = () => {
            this._doc.prompt = null;
            this._doc.record(new ChangeTheme(this._doc, this._newThemeValue), true);
        };
        this._saveChangesAndRefresh = () => {
            this._saveChanges();
            this._songEditor.refreshNow();
        };
        this.cleanUp = () => {
            this._cancelButton.removeEventListener("click", this._saveChanges);
            this._refreshButton.removeEventListener("click", this._saveChangesAndRefresh);
        };
        this._cancelButton.addEventListener("click", this._saveChanges);
        this._refreshButton.addEventListener("click", this._saveChangesAndRefresh);
    }
}
//# sourceMappingURL=RefreshPrompt.js.map