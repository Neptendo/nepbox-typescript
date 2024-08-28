import { HTML } from "imperative-html/dist/esm/elements-strict";
const { button, div, a } = HTML;
export class ArchivePrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._cancelButton = button({}, div("No thanks!"));
        this.container = div({ class: "prompt", style: "width: 250px;" }, div({ style: "font-size: 2em" }, div("Archives")), div({ style: "text-align: center;" }, div('These are the Archives. Below are previous versions of Modded Beepbox/Sandbox that you are able to play around with, changelog included. Go nuts!')), div({ style: "text-align: center;" }, a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.3.0.htm" }, div("MB 1.3.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.6.0.htm" }, div("MB 1.6.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/1.9.1.htm" }, div("MB 1.9.1")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.0.0.htm" }, div("MB v2.0.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.3.0.htm" }, div("MB v2.2.2")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/2.3.html" }, div("MB v2.3.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/mb-archives/3.0.html" }, div("MB v3.0.3")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.2.1.htm" }, div("SB v1.2.1")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.3.0.htm" }, div("SB v1.3.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/1.4.0.htm" }, div("SB v1.4.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/2.0.6.1.htm" }, div("SB v2.0.6.1")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/2.1.3.htm" }, div("SB v2.1.3")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/sb-archives/3.0.0.htm" }, div("SB v3.0.0")), div(" | "), a({ target: "_blank", href: "https://moddedbeepbox.github.io/beta/changelogs/mbchangelog.html" }, div("Changelog"))), this._cancelButton);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._cancelButton.removeEventListener("click", this._close);
        };
        this._cancelButton.addEventListener("click", this._close);
    }
}
//# sourceMappingURL=ArchivePrompt.js.map