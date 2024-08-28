import { HTML } from "imperative-html/dist/esm/elements-strict";
const { button, div } = HTML;
export class ChorusPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._cancelButton = button({}, [div("Close")]);
        this.container = div({ class: "prompt", style: "width: 250px;" }, [
            div({ style: "font-size: 2em" }, [div("Custom Harmony")]),
            div({ style: "text-align: left;" }, [div('BeepBox "chip" instruments play two waves at once, each with their own pitch.')]),
            div({ style: "text-align: left;" }, [div('By placing two notes one above another it will play two indivdual sounds. ' +
                    'This replaces the "arpeggio/trill" effect, and gives you greater control over your harmony. ')]),
            div({ style: "text-align: left;" }, [
                div('In older versions of Modbox, union would not allow notes to harmonize properly and needed a special harmonic chorus in order to work. This has been patched in Modbox 3.1.0. ')
            ]),
            this._cancelButton,
        ]);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._cancelButton.removeEventListener("click", this._close);
        };
        this._cancelButton.addEventListener("click", this._close);
    }
}
//# sourceMappingURL=ChorusPrompt.js.map