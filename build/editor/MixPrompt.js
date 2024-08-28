import { HTML } from "imperative-html/dist/esm/elements-strict";
const { button, div } = HTML;
export class MixPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._cancelButton = button({}, [div("Close")]);
        this.container = div({ class: "prompt", style: "width: 300px;" }, [
            div({ style: "font-size: 2em" }, [div("Mixing Styles")]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Mixing styles are a way how changing how loud or soft different sounds are and can change the way different sounds blend and mix together. Using different mixing styles can drastically change your song.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Type A Mixing is akin to mixing in vanilla Beepbox, Sandbox, and most other beepbox mods. In this mixing type, the drums are about twice as loud as in Type B mixing and the sound is generally a bit sharper and blends together differently.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Type B Mixing is regular Modbox mixing.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Type C Mixing is like Type B, save for a few upgrades. There are more volume options in Type C mixing, certain waves (acoustic bass, lyre, ramp pulse, and piccolo) are a bit quieter, the flatline wave is a bit louder, and blending works slightly differently.")
            ]),
            div({ style: "text-align: left; margin: 0.5em 0;" }, [
                div("Type D Mixing includes slightly quieter drums from Type B, but also includes sharper sounds for regular notes in pitch channels.")
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
//# sourceMappingURL=MixPrompt.js.map