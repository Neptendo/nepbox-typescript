import { HTML } from "imperative-html/dist/esm/elements-strict";
import { Config } from "../synth/SynthConfig";
import { ChangeGroup } from "./Change";
import { ChangeBeatsPerBar, ChangeBarCount, ChangePatternsPerChannel, ChangeInstrumentsPerChannel, ChangeChannelCount } from "./changes";
const { button, div, input, span } = HTML;
export class SongDurationPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._beatsStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._barsStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._patternsStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._instrumentsStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._pitchChannelStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._drumChannelStepper = input({ style: "width: 3em; margin-left: 1em;", type: "number", step: "1" });
        this._okayButton = button({ style: "width:45%;" }, [div("Okay")]);
        this._cancelButton = button({ style: "width:45%;" }, [div("Cancel")]);
        this.container = div({ class: "prompt", style: "width: 250px;" }, [
            div({ style: "font-size: 2em" }, [div("Custom Song Size")]),
            div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, [
                div({ style: "text-align: right;" }, [
                    div("Beats per bar:"),
                    span({ style: "font-size: smaller; color: #888888;" }, [div("(Multiples of 3 or 4 are recommended)")]),
                ]),
                this._beatsStepper,
            ]),
            div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, [
                div({ style: "display: inline-block; text-align: right;" }, [
                    div("Bars per song:"),
                    span({ style: "font-size: smaller; color: #888888;" }, [div("(Multiples of 2 or 4 are recommended)")]),
                ]),
                this._barsStepper,
            ]),
            div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, [
                div("Patterns per channel:"),
                this._patternsStepper,
            ]),
            div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, [
                div("Instruments per channel:"),
                this._instrumentsStepper,
            ]),
            div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, [
                div("Number of pitch channels:"),
                this._pitchChannelStepper,
            ]),
            div({ style: "display: flex; flex-direction: row; align-items: center; height: 2em; justify-content: flex-end;" }, [
                div("Number of drum channels:"),
                this._drumChannelStepper,
            ]),
            div({ style: "display: flex; flex-direction: row; justify-content: space-between;" }, [
                this._okayButton,
                this._cancelButton,
            ]),
        ]);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._okayButton.removeEventListener("click", this._saveChanges);
            this._cancelButton.removeEventListener("click", this._close);
            this._beatsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            this._barsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            this._patternsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            this._instrumentsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            this._pitchChannelStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            this._drumChannelStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
            this._beatsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
            this._barsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
            this._patternsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
            this._instrumentsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
            this._pitchChannelStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
            this._drumChannelStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
        };
        this._saveChanges = () => {
            const group = new ChangeGroup();
            group.append(new ChangeBeatsPerBar(this._doc, SongDurationPrompt._validate(this._beatsStepper)));
            group.append(new ChangeBarCount(this._doc, SongDurationPrompt._validate(this._barsStepper)));
            group.append(new ChangePatternsPerChannel(this._doc, SongDurationPrompt._validate(this._patternsStepper)));
            group.append(new ChangeInstrumentsPerChannel(this._doc, SongDurationPrompt._validate(this._instrumentsStepper)));
            group.append(new ChangeChannelCount(this._doc, SongDurationPrompt._validate(this._pitchChannelStepper), SongDurationPrompt._validate(this._drumChannelStepper)));
            this._doc.prompt = null;
            this._doc.record(group, true);
        };
        this._beatsStepper.value = this._doc.song.beatsPerBar + "";
        this._beatsStepper.min = Config.beatsPerBarMin + "";
        this._beatsStepper.max = Config.beatsPerBarMax + "";
        this._barsStepper.value = this._doc.song.barCount + "";
        this._barsStepper.min = Config.barCountMin + "";
        this._barsStepper.max = Config.barCountMax + "";
        this._patternsStepper.value = this._doc.song.patternsPerChannel + "";
        this._patternsStepper.min = Config.patternsPerChannelMin + "";
        this._patternsStepper.max = Config.patternsPerChannelMax + "";
        this._instrumentsStepper.value = this._doc.song.instrumentsPerChannel + "";
        this._instrumentsStepper.min = Config.instrumentsPerChannelMin + "";
        this._instrumentsStepper.max = Config.instrumentsPerChannelMax + "";
        this._pitchChannelStepper.value = this._doc.song.pitchChannelCount + "";
        this._pitchChannelStepper.min = Config.pitchChannelCountMin + "";
        this._pitchChannelStepper.max = Config.pitchChannelCountMax + "";
        this._drumChannelStepper.value = this._doc.song.drumChannelCount + "";
        this._drumChannelStepper.min = Config.drumChannelCountMin + "";
        this._drumChannelStepper.max = Config.drumChannelCountMax + "";
        this._okayButton.addEventListener("click", this._saveChanges);
        this._cancelButton.addEventListener("click", this._close);
        this._beatsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._barsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._patternsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._instrumentsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._pitchChannelStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._drumChannelStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
        this._beatsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
        this._barsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
        this._patternsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
        this._instrumentsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
        this._pitchChannelStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
        this._drumChannelStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
    }
    static _validateKey(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return true;
        }
        return false;
    }
    static _validateNumber(event) {
        const input = event.target;
        input.value = Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))) + "";
    }
    static _validate(input) {
        return Math.floor(Number(input.value));
    }
}
//# sourceMappingURL=SongDurationPrompt.js.map