import { HTML } from "imperative-html/dist/esm/elements-strict";
const { button, div } = HTML;
export class SongDataPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._cancelButton = button({}, [div("Close")]);
        this.container = div({ class: "prompt", style: "width: 250px;" }, [
            div({ style: "font-size: 2em" }, [div("Song Data")]),
            div({ style: "text-align: left;" }, [div('You are on update Modbox 3.3.0-B_1.')]),
            div({ style: "text-align: left;" }, [div('Your song is ' + this._doc.synth.totalSeconds + ' seconds long.')]),
            div({ style: "text-align: left;" }, [div('Your song runs at ' + this._doc.song.getBeatsPerMinute() + ' beats per minute.')]),
            div({ style: "text-align: left;" }, [div('There are currently ' + this._doc.song.getChannelUnusedCount() + ' unused channels in your song out of 16.')]),
            div({ style: "text-align: left;" }, [div('Your are using the ' + this._doc.song.getThemeName() + ' theme.')]),
            div({ style: "text-align: left;" }, [div('Your time signuature is ' + this._doc.song.getTimeSig())]),
            div({ style: "text-align: left;" }, [div('Your scale is ' + this._doc.song.getScaleNKey() + '.')]),
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
//# sourceMappingURL=SongDataPrompt.js.map