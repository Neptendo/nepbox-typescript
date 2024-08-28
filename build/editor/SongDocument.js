import { Song, Synth } from "../synth/synth";
import { ChangeNotifier } from "./ChangeNotifier";
import { ChangeSong } from "./changes";
import { ColorConfig } from "./ColorConfig";
export class SongDocument {
    constructor(string) {
        this.notifier = new ChangeNotifier();
        this.channel = 0;
        this.bar = 0;
        this.volume = 75;
        this.trackVisibleBars = 16;
        this.barScrollPos = 0;
        this.prompt = null;
        this._recentChange = null;
        this._sequenceNumber = 0;
        this._barFromCurrentState = 0;
        this._channelFromCurrentState = 0;
        this._shouldPushState = false;
        this._waitingToUpdateState = false;
        this._whenHistoryStateChanged = () => {
            let state = window.history.state;
            if (state && state.sequenceNumber == this._sequenceNumber)
                return;
            if (state == null) {
                this._sequenceNumber++;
                state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, prompt: this.prompt };
                new ChangeSong(this, location.hash);
                window.history.replaceState(state, "", "#" + this.song.toBase64String());
            }
            else {
                if (state.sequenceNumber == this._sequenceNumber - 1) {
                    this.bar = this._barFromCurrentState;
                    this.channel = this._channelFromCurrentState;
                }
                else if (state.sequenceNumber != this._sequenceNumber) {
                    this.bar = state.bar;
                    this.channel = state.channel;
                }
                this._sequenceNumber = state.sequenceNumber;
                this.prompt = state.prompt;
                new ChangeSong(this, location.hash);
            }
            this._barFromCurrentState = state.bar;
            this._channelFromCurrentState = state.channel;
            this.forgetLastChange();
            this.notifier.notifyWatchers();
        };
        this._cleanDocument = () => {
            this.notifier.notifyWatchers();
        };
        this._updateHistoryState = () => {
            this._waitingToUpdateState = false;
            const hash = "#" + this.song.toBase64String();
            let state;
            if (this._shouldPushState) {
                this._sequenceNumber++;
                state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, prompt: this.prompt };
                window.history.pushState(state, "", hash);
            }
            else {
                state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, prompt: this.prompt };
                window.history.replaceState(state, "", hash);
            }
            this._barFromCurrentState = state.bar;
            this._channelFromCurrentState = state.channel;
            this._shouldPushState = false;
        };
        this.song = new Song(string);
        this.synth = new Synth(this.song);
        this.autoPlay = localStorage.getItem("autoPlay") == "true";
        this.autoFollow = localStorage.getItem("autoFollow") == "true";
        this.showFifth = localStorage.getItem("showFifth") == "true";
        this.showMore = localStorage.getItem("showMore") == "true";
        this.showLetters = localStorage.getItem("showLetters") == "true";
        this.showChannels = localStorage.getItem("showChannels") == "true";
        this.showScrollBar = localStorage.getItem("showScrollBar") == "true";
        this.showVolumeBar = localStorage.getItem("showVolumeBar") == "true";
        this.advancedSettings = localStorage.getItem("advancedSettings") != "false";
        if (localStorage.getItem("volume") != null)
            this.volume = Number(localStorage.getItem("volume"));
        this.synth.volume = this._calcVolume();
        if (window.localStorage.getItem("modboxTheme") != null) {
            ColorConfig.setTheme(String(window.localStorage.getItem("modboxTheme")));
        }
        else {
            window.localStorage.setItem("modboxTheme", "default");
            ColorConfig.setTheme("default");
        }
        let state = window.history.state;
        if (state == null) {
            state = { canUndo: false, sequenceNumber: 0, bar: 0, channel: 0, prompt: null };
            window.history.replaceState(state, "", "#" + this.song.toBase64String());
        }
        window.addEventListener("hashchange", this._whenHistoryStateChanged);
        window.addEventListener("popstate", this._whenHistoryStateChanged);
        this.bar = state.bar;
        this.channel = state.channel;
        this._barFromCurrentState = state.bar;
        this._channelFromCurrentState = state.channel;
        this.barScrollPos = Math.max(0, this.bar - (this.trackVisibleBars - 6));
        this.prompt = state.prompt;
        for (const eventName of ["input", "change", "click", "keyup", "keydown", "mousedown", "mousemove", "mouseup", "touchstart", "touchmove", "touchend", "touchcancel"]) {
            window.addEventListener(eventName, this._cleanDocument);
        }
    }
    record(change, replaceState = false) {
        if (change.isNoop()) {
            this._recentChange = null;
            if (replaceState) {
                window.history.back();
            }
        }
        else {
            this._recentChange = change;
            if (!replaceState) {
                this._shouldPushState = true;
            }
            if (!this._waitingToUpdateState) {
                window.requestAnimationFrame(this._updateHistoryState);
                this._waitingToUpdateState = true;
            }
        }
    }
    openPrompt(prompt) {
        this.prompt = prompt;
        const hash = "#" + this.song.toBase64String();
        this._sequenceNumber++;
        const state = { canUndo: true, sequenceNumber: this._sequenceNumber, bar: this.bar, channel: this.channel, prompt: this.prompt };
        window.history.pushState(state, "", hash);
    }
    undo() {
        const state = window.history.state;
        if (state.canUndo)
            window.history.back();
    }
    redo() {
        window.history.forward();
    }
    setProspectiveChange(change) {
        this._recentChange = change;
    }
    forgetLastChange() {
        this._recentChange = null;
    }
    lastChangeWas(change) {
        return change != null && change == this._recentChange;
    }
    savePreferences() {
        localStorage.setItem("autoPlay", this.autoPlay ? "true" : "false");
        localStorage.setItem("autoFollow", this.autoFollow ? "true" : "false");
        localStorage.setItem("showFifth", this.showFifth ? "true" : "false");
        localStorage.setItem("showMore", this.showMore ? "true" : "false");
        localStorage.setItem("showLetters", this.showLetters ? "true" : "false");
        localStorage.setItem("showChannels", this.showChannels ? "true" : "false");
        localStorage.setItem("showScrollBar", this.showScrollBar ? "true" : "false");
        localStorage.setItem("showVolumeBar", this.showVolumeBar ? "true" : "false");
        localStorage.setItem("advancedSettings", this.advancedSettings ? "true" : "false");
        localStorage.setItem("volume", String(this.volume));
    }
    setVolume(val) {
        this.volume = val;
        this.savePreferences();
        this.synth.volume = this._calcVolume();
    }
    _calcVolume() {
        return Math.min(1.0, Math.pow(this.volume / 50.0, 0.5)) * Math.pow(2.0, (this.volume - 75.0) / 25.0);
    }
    getCurrentPattern() {
        return this.song.getPattern(this.channel, this.bar);
    }
    getCurrentInstrument() {
        const pattern = this.getCurrentPattern();
        return pattern == null ? 0 : pattern.instrument;
    }
}
SongDocument._latestVersion = 2;
//# sourceMappingURL=SongDocument.js.map