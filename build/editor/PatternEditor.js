import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { makeNotePin, makeNote } from "../synth/synth";
import { Config } from "../synth/SynthConfig";
import { ChangeSequence } from "./Change";
import { ChangeChannelBar, ChangeNoteAdded, ChangeNoteTruncate, ChangePinTime, ChangeVolumeBend, ChangePitchBend, ChangePitchAdded, ChangeEnsurePatternExists } from "./changes";
import { ColorConfig } from "./ColorConfig";
const { div } = HTML;
function prettyNumber(value) {
    return value.toFixed(2).replace(/\.?0*$/, "");
}
function makeEmptyReplacementElement(node) {
    const clone = node.cloneNode(false);
    node.parentNode.replaceChild(clone, node);
    return clone;
}
class PatternCursor {
    constructor() {
        this.valid = false;
        this.prevNote = null;
        this.curNote = null;
        this.nextNote = null;
        this.pitch = 0;
        this.pitchIndex = -1;
        this.curIndex = 0;
        this.start = 0;
        this.end = 0;
        this.part = 0;
        this.notePart = 0;
        this.nearPinIndex = 0;
        this.pins = [];
    }
}
export class PatternEditor {
    constructor(_doc) {
        this._doc = _doc;
        this._svgNoteBackground = SVG.pattern({ id: "patternEditorNoteBackground", x: "0", y: "0", width: "64", height: "156", patternUnits: "userSpaceOnUse" });
        this._svgDrumBackground = SVG.pattern({ id: "patternEditorDrumBackground", x: "0", y: "0", width: "64", height: "40", patternUnits: "userSpaceOnUse" });
        this._svgBackground = SVG.rect({ x: "0", y: "0", width: "512", height: "481", "pointer-events": "none", fill: "url(#patternEditorNoteBackground)" });
        this._svgNoteContainer = SVG.svg();
        this._svgPlayhead = SVG.rect({ id: "", x: "0", y: "0", width: "4", height: "481", fill: "white", "pointer-events": "none" });
        this._svgPreview = SVG.path({ fill: "none", stroke: "white", "stroke-width": "2", "pointer-events": "none" });
        this._svg = SVG.svg({ style: "touch-action: none; position: absolute;", width: "100%", height: "100%", viewBox: "0 0 512 481", preserveAspectRatio: "none" }, [
            SVG.defs(undefined, [
                this._svgNoteBackground,
                this._svgDrumBackground,
            ]),
            this._svgBackground,
            this._svgNoteContainer,
            this._svgPreview,
            this._svgPlayhead,
        ]);
        this.container = div({ style: "height: 100%; overflow:hidden; position: relative; flex-grow: 1;" }, [this._svg]);
        this._defaultPitchHeight = 13;
        this._defaultDrumHeight = 40;
        this._backgroundPitchRows = [];
        this._backgroundDrumRow = SVG.rect();
        this._defaultPinChannels = [
            [makeNotePin(0, 0, 3), makeNotePin(0, 2, 3)],
            [makeNotePin(0, 0, 3), makeNotePin(0, 2, 3)],
            [makeNotePin(0, 0, 3), makeNotePin(0, 2, 3)],
            [makeNotePin(0, 0, 3), makeNotePin(0, 2, 0)],
        ];
        this._editorHeight = 481;
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._mouseDragging = false;
        this._mouseHorizontal = false;
        this._usingTouch = false;
        this._copiedPinChannels = [];
        this._mouseXStart = 0;
        this._mouseYStart = 0;
        this._mouseXPrev = 0;
        this._mouseYPrev = 0;
        this._dragTime = 0;
        this._dragPitch = 0;
        this._dragVolume = 0;
        this._dragVisible = false;
        this._dragChange = null;
        this._cursor = new PatternCursor();
        this._pattern = null;
        this._playheadX = 0.0;
        this._octaveOffset = 0;
        this._renderedWidth = -1;
        this._renderedBeatWidth = -1;
        this._renderedFifths = false;
        this._renderedACS = false;
        this._renderedPiano = false;
        this._renderedDrums = false;
        this._setKey = 1;
        this._renderedPartsPerBeat = -1;
        this._renderedPitchChannelCount = -1;
        this._renderedDrumChannelCount = -1;
        this._followPlayheadBar = -1;
        this.resetCopiedPins = () => {
            const maxDivision = this._getMaxDivision();
            this._copiedPinChannels.length = this._doc.song.getChannelCount();
            for (let i = 0; i < this._doc.song.pitchChannelCount; i++) {
                this._copiedPinChannels[i] = [makeNotePin(0, 0, 3), makeNotePin(0, maxDivision, 3)];
            }
            for (let i = this._doc.song.pitchChannelCount; i < this._doc.song.getChannelCount(); i++) {
                this._copiedPinChannels[i] = [makeNotePin(0, 0, 3), makeNotePin(0, maxDivision, 0)];
            }
        };
        this._animatePlayhead = (timestamp) => {
            const playheadBar = Math.floor(this._doc.synth.playhead);
            if (this._doc.synth.playing && ((this._pattern != null && this._doc.song.getPattern(this._doc.channel, Math.floor(this._doc.synth.playhead)) == this._pattern) || Math.floor(this._doc.synth.playhead) == this._doc.bar)) {
                this._svgPlayhead.setAttribute("visibility", "visible");
                const modPlayhead = this._doc.synth.playhead - playheadBar;
                if (Math.abs(modPlayhead - this._playheadX) > 0.1) {
                    this._playheadX = modPlayhead;
                }
                else {
                    this._playheadX += (modPlayhead - this._playheadX) * 0.2;
                }
                this._svgPlayhead.setAttribute("x", "" + prettyNumber(this._playheadX * this._editorWidth - 2));
            }
            else {
                this._svgPlayhead.setAttribute("visibility", "hidden");
            }
            if (this._doc.synth.playing && this._doc.autoFollow && this._followPlayheadBar != playheadBar) {
                new ChangeChannelBar(this._doc, this._doc.channel, playheadBar);
                this._doc.notifier.notifyWatchers();
            }
            this._followPlayheadBar = playheadBar;
            window.requestAnimationFrame(this._animatePlayhead);
        };
        this._whenMouseOver = (event) => {
            if (this._mouseOver)
                return;
            this._mouseOver = true;
            this._usingTouch = false;
        };
        this._whenMouseOut = (event) => {
            if (!this._mouseOver)
                return;
            this._mouseOver = false;
        };
        this._whenMousePressed = (event) => {
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._usingTouch = false;
            this._whenCursorPressed();
        };
        this._whenTouchPressed = (event) => {
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.touches[0].clientX - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = (event.touches[0].clientY - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._usingTouch = true;
            this._whenCursorPressed();
        };
        this._whenMouseMoved = (event) => {
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = ((event.clientX || event.pageX) - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = ((event.clientY || event.pageY) - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._usingTouch = false;
            this._whenCursorMoved();
        };
        this._whenTouchMoved = (event) => {
            if (!this._mouseDown)
                return;
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.touches[0].clientX - boundingRect.left) * this._editorWidth / (boundingRect.right - boundingRect.left);
            this._mouseY = (event.touches[0].clientY - boundingRect.top) * this._editorHeight / (boundingRect.bottom - boundingRect.top);
            if (isNaN(this._mouseX))
                this._mouseX = 0;
            if (isNaN(this._mouseY))
                this._mouseY = 0;
            this._whenCursorMoved();
        };
        this._whenCursorReleased = (event) => {
            if (!this._cursor.valid)
                return;
            const continuousState = this._doc.lastChangeWas(this._dragChange);
            if (this._mouseDragging && continuousState) {
                if (this._dragChange != null) {
                    this._doc.record(this._dragChange);
                    this._dragChange = null;
                }
            }
            else if (this._mouseDown && continuousState) {
                if (this._cursor.curNote == null) {
                    const note = makeNote(this._cursor.pitch, this._cursor.start, this._cursor.end, 3, this._doc.song.getChannelIsDrum(this._doc.channel));
                    note.pins = [];
                    for (const oldPin of this._cursor.pins) {
                        note.pins.push(makeNotePin(0, oldPin.time, oldPin.volume));
                    }
                    const sequence = new ChangeSequence();
                    sequence.append(new ChangeEnsurePatternExists(this._doc));
                    const pattern = this._doc.getCurrentPattern();
                    if (pattern == null)
                        throw new Error();
                    sequence.append(new ChangeNoteAdded(this._doc, pattern, note, this._cursor.curIndex));
                    this._doc.record(sequence);
                }
                else {
                    if (this._pattern == null)
                        throw new Error();
                    if (this._cursor.pitchIndex == -1) {
                        const sequence = new ChangeSequence();
                        if (this._cursor.curNote.pitches.length == 4) {
                            sequence.append(new ChangePitchAdded(this._doc, this._cursor.curNote, this._cursor.curNote.pitches[0], 0, true));
                        }
                        sequence.append(new ChangePitchAdded(this._doc, this._cursor.curNote, this._cursor.pitch, this._cursor.curNote.pitches.length));
                        this._doc.record(sequence);
                        this._copyPins(this._cursor.curNote);
                    }
                    else {
                        if (this._cursor.curNote.pitches.length == 1) {
                            this._doc.record(new ChangeNoteAdded(this._doc, this._pattern, this._cursor.curNote, this._cursor.curIndex, true));
                        }
                        else {
                            this._doc.record(new ChangePitchAdded(this._doc, this._cursor.curNote, this._cursor.pitch, this._cursor.curNote.pitches.indexOf(this._cursor.pitch), true));
                        }
                    }
                }
            }
            this._mouseDown = false;
            this._mouseDragging = false;
            this._updateCursorStatus();
            this._updatePreview();
        };
        this._documentChanged = () => {
            this._editorWidth = this._doc.showLetters ? (this._doc.showScrollBar ? 460 : 480) : (this._doc.showScrollBar ? 492 : 512);
            this._pattern = this._doc.getCurrentPattern();
            this._partWidth = this._editorWidth / (this._doc.song.beatsPerBar * this._doc.song.partsPerBeat);
            this._pitchHeight = this._doc.song.getChannelIsDrum(this._doc.channel) ? this._defaultDrumHeight : this._defaultPitchHeight;
            this._pitchCount = this._doc.song.getChannelIsDrum(this._doc.channel) ? Config.drumCount : Config.pitchCount;
            this._octaveOffset = this._doc.song.channels[this._doc.channel].octave * 12;
            if (this._renderedPartsPerBeat != this._doc.song.partsPerBeat ||
                this._renderedPitchChannelCount != this._doc.song.pitchChannelCount ||
                this._renderedDrumChannelCount != this._doc.song.drumChannelCount) {
                this._renderedPartsPerBeat = this._doc.song.partsPerBeat;
                this._renderedPitchChannelCount = this._doc.song.pitchChannelCount;
                this._renderedDrumChannelCount = this._doc.song.drumChannelCount;
                this.resetCopiedPins();
            }
            this._copiedPins = this._copiedPinChannels[this._doc.channel];
            if (this._renderedWidth != this._editorWidth) {
                this._renderedWidth = this._editorWidth;
                this._svg.setAttribute("viewBox", "0 0 " + this._editorWidth + " 481");
                this._svgBackground.setAttribute("width", "" + this._editorWidth);
            }
            const beatWidth = this._editorWidth / this._doc.song.beatsPerBar;
            if (this._renderedBeatWidth != beatWidth) {
                this._renderedBeatWidth = beatWidth;
                this._svgNoteBackground.setAttribute("width", "" + beatWidth);
                this._svgDrumBackground.setAttribute("width", "" + beatWidth);
                this._backgroundDrumRow.setAttribute("width", "" + (beatWidth - 2));
                for (let j = 0; j < 12; j++) {
                    this._backgroundPitchRows[j].setAttribute("width", "" + (beatWidth - 2));
                }
            }
            if (!this._mouseDown)
                this._updateCursorStatus();
            this._svgNoteContainer = makeEmptyReplacementElement(this._svgNoteContainer);
            this._updatePreview();
            for (let j = 0; j < 12; j++) {
                this._backgroundPitchRows[j].style.visibility = Config.scaleFlags[this._doc.song.scale][j] ? "visible" : "hidden";
            }
            if (this._doc.song.getChannelIsDrum(this._doc.channel)) {
                if (!this._renderedDrums) {
                    this._renderedDrums = true;
                    this._svgBackground.setAttribute("fill", "url(#patternEditorDrumBackground)");
                    this._svgBackground.setAttribute("height", "" + (this._defaultDrumHeight * Config.drumCount));
                }
            }
            else {
                if (this._renderedDrums) {
                    this._renderedDrums = false;
                    this._svgBackground.setAttribute("fill", "url(#patternEditorNoteBackground)");
                    this._svgBackground.setAttribute("height", "" + this._editorHeight);
                }
            }
            if (this._doc.showChannels) {
                for (let channel = this._doc.song.getChannelCount() - 1; channel >= 0; channel--) {
                    if (channel == this._doc.channel)
                        continue;
                    if (this._doc.song.getChannelIsDrum(channel) != this._doc.song.getChannelIsDrum(this._doc.channel))
                        continue;
                    const pattern2 = this._doc.song.getPattern(channel, this._doc.bar);
                    if (pattern2 == null)
                        continue;
                    for (const note of pattern2.notes) {
                        for (const pitch of note.pitches) {
                            const notePath = SVG.path();
                            notePath.setAttribute("fill", ColorConfig.getChannelColor(this._doc.song, channel).secondaryNote);
                            notePath.setAttribute("pointer-events", "none");
                            this._drawNote(notePath, pitch, note.start, note.pins, this._pitchHeight * 0.19, false, this._doc.song.channels[channel].octave * 12);
                            this._svgNoteContainer.appendChild(notePath);
                        }
                    }
                }
            }
            if (this._pattern != null) {
                for (const note of this._pattern.notes) {
                    for (let i = 0; i < note.pitches.length; i++) {
                        const pitch = note.pitches[i];
                        let notePath = SVG.path();
                        notePath.setAttribute("fill", ColorConfig.getChannelColor(this._doc.song, this._doc.channel).secondaryChannel);
                        notePath.setAttribute("pointer-events", "none");
                        this._drawNote(notePath, pitch, note.start, note.pins, this._pitchHeight / 2 + 1, false, this._octaveOffset);
                        this._svgNoteContainer.appendChild(notePath);
                        notePath = SVG.path();
                        notePath.setAttribute("fill", ColorConfig.getChannelColor(this._doc.song, this._doc.channel).primaryNote);
                        notePath.setAttribute("pointer-events", "none");
                        this._drawNote(notePath, pitch, note.start, note.pins, this._pitchHeight / 2 + 1, true, this._octaveOffset);
                        this._svgNoteContainer.appendChild(notePath);
                        if (note.pitches.length > 1) {
                            let oscillatorLabel = SVG.text();
                            oscillatorLabel.setAttribute("x", "" + prettyNumber(this._partWidth * note.start + 2));
                            oscillatorLabel.setAttribute("y", "" + prettyNumber(this._pitchToPixelHeight(pitch - this._octaveOffset)));
                            oscillatorLabel.setAttribute("width", "30");
                            oscillatorLabel.setAttribute("fill", "black");
                            oscillatorLabel.setAttribute("text-anchor", "start");
                            oscillatorLabel.setAttribute("dominant-baseline", "central");
                            oscillatorLabel.setAttribute("pointer-events", "none");
                            oscillatorLabel.textContent = "" + (i + 1);
                            this._svgNoteContainer.appendChild(oscillatorLabel);
                        }
                    }
                }
            }
        };
        for (let i = 0; i < 12; i++) {
            const y = (12 - i) % 12;
            const rectangle = SVG.rect();
            rectangle.setAttribute("x", "1");
            rectangle.setAttribute("y", "" + (y * this._defaultPitchHeight + 1));
            rectangle.setAttribute("height", "" + (this._defaultPitchHeight - 2));
            rectangle.setAttribute("fill", (i == 0) ? ColorConfig.tonic : ColorConfig.uiWidgetBackground);
            this._svgNoteBackground.appendChild(rectangle);
            this._backgroundPitchRows[i] = rectangle;
        }
        this._svg.style.backgroundColor = ColorConfig.editorBackground;
        this._backgroundDrumRow.setAttribute("x", "1");
        this._backgroundDrumRow.setAttribute("y", "1");
        this._backgroundDrumRow.setAttribute("height", "" + (this._defaultDrumHeight - 2));
        this._backgroundDrumRow.setAttribute("fill", "#444444");
        this._svgDrumBackground.appendChild(this._backgroundDrumRow);
        this._doc.notifier.watch(this._documentChanged);
        this._documentChanged();
        this._updateCursorStatus();
        this._updatePreview();
        window.requestAnimationFrame(this._animatePlayhead);
        this._svg.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this._svg.addEventListener("mouseover", this._whenMouseOver);
        this._svg.addEventListener("mouseout", this._whenMouseOut);
        this._svg.addEventListener("touchstart", this._whenTouchPressed);
        this._svg.addEventListener("touchmove", this._whenTouchMoved);
        this._svg.addEventListener("touchend", this._whenCursorReleased);
        this._svg.addEventListener("touchcancel", this._whenCursorReleased);
        this.resetCopiedPins();
    }
    _getMaxDivision() {
        if (this._doc.song.partsPerBeat % 3 == 0) {
            return this._doc.song.partsPerBeat / 3;
        }
        else if (this._doc.song.partsPerBeat % 2 == 0) {
            return this._doc.song.partsPerBeat / 2;
        }
        return this._doc.song.partsPerBeat;
    }
    _updateCursorStatus() {
        this._cursor = new PatternCursor();
        if (this._mouseX < 0 || this._mouseX > this._editorWidth || this._mouseY < 0 || this._mouseY > this._editorHeight)
            return;
        this._cursor.part = Math.floor(Math.max(0, Math.min(this._doc.song.beatsPerBar * this._doc.song.partsPerBeat - 1, this._mouseX / this._partWidth)));
        if (this._pattern != null) {
            for (const note of this._pattern.notes) {
                if (note.end <= this._cursor.part) {
                    this._cursor.prevNote = note;
                    this._cursor.curIndex++;
                }
                else if (note.start <= this._cursor.part && note.end > this._cursor.part) {
                    this._cursor.curNote = note;
                }
                else if (note.start > this._cursor.part) {
                    this._cursor.nextNote = note;
                    break;
                }
            }
        }
        let mousePitch = this._findMousePitch(this._mouseY);
        if (this._cursor.curNote != null) {
            this._cursor.start = this._cursor.curNote.start;
            this._cursor.end = this._cursor.curNote.end;
            this._cursor.pins = this._cursor.curNote.pins;
            let interval = 0;
            let error = 0;
            let prevPin;
            let nextPin = this._cursor.curNote.pins[0];
            for (let j = 1; j < this._cursor.curNote.pins.length; j++) {
                prevPin = nextPin;
                nextPin = this._cursor.curNote.pins[j];
                const leftSide = this._partWidth * (this._cursor.curNote.start + prevPin.time);
                const rightSide = this._partWidth * (this._cursor.curNote.start + nextPin.time);
                if (this._mouseX > rightSide)
                    continue;
                if (this._mouseX < leftSide)
                    throw new Error();
                const intervalRatio = (this._mouseX - leftSide) / (rightSide - leftSide);
                const arc = Math.sqrt(1.0 / Math.sqrt(4.0) - Math.pow(intervalRatio - 0.5, 2.0)) - 0.5;
                const bendHeight = Math.abs(nextPin.interval - prevPin.interval);
                interval = prevPin.interval * (1.0 - intervalRatio) + nextPin.interval * intervalRatio;
                error = arc * bendHeight + 1.0;
                break;
            }
            let minInterval = Number.MAX_VALUE;
            let maxInterval = -Number.MAX_VALUE;
            let bestDistance = Number.MAX_VALUE;
            for (const pin of this._cursor.curNote.pins) {
                if (minInterval > pin.interval)
                    minInterval = pin.interval;
                if (maxInterval < pin.interval)
                    maxInterval = pin.interval;
                const pinDistance = Math.abs(this._cursor.curNote.start + pin.time - this._mouseX / this._partWidth);
                if (bestDistance > pinDistance) {
                    bestDistance = pinDistance;
                    this._cursor.nearPinIndex = this._cursor.curNote.pins.indexOf(pin);
                }
            }
            mousePitch -= interval;
            this._cursor.pitch = this._snapToPitch(mousePitch, -minInterval, (this._doc.song.getChannelIsDrum(this._doc.channel) ? Config.drumCount - 1 : Config.maxPitch) - maxInterval);
            if (this._doc.channel != 3) {
                let nearest = error;
                for (let i = 0; i < this._cursor.curNote.pitches.length; i++) {
                    const distance = Math.abs(this._cursor.curNote.pitches[i] - mousePitch + 0.5);
                    if (distance > nearest)
                        continue;
                    nearest = distance;
                    this._cursor.pitch = this._cursor.curNote.pitches[i];
                }
            }
            for (let i = 0; i < this._cursor.curNote.pitches.length; i++) {
                if (this._cursor.curNote.pitches[i] == this._cursor.pitch) {
                    this._cursor.pitchIndex = i;
                    break;
                }
            }
        }
        else {
            this._cursor.pitch = this._snapToPitch(mousePitch, 0, Config.maxPitch);
            const defaultLength = this._copiedPins[this._copiedPins.length - 1].time;
            const fullBeats = Math.floor(this._cursor.part / this._doc.song.partsPerBeat);
            const maxDivision = this._getMaxDivision();
            const modMouse = this._cursor.part % this._doc.song.partsPerBeat;
            if (defaultLength == 1) {
                this._cursor.start = this._cursor.part;
            }
            else if (defaultLength > this._doc.song.partsPerBeat) {
                this._cursor.start = fullBeats * this._doc.song.partsPerBeat;
            }
            else if (defaultLength == this._doc.song.partsPerBeat) {
                this._cursor.start = fullBeats * this._doc.song.partsPerBeat;
                if (maxDivision < this._doc.song.partsPerBeat && modMouse > maxDivision) {
                    this._cursor.start += Math.floor(modMouse / maxDivision) * maxDivision;
                }
            }
            else {
                this._cursor.start = fullBeats * this._doc.song.partsPerBeat;
                let division = this._doc.song.partsPerBeat % defaultLength == 0 ? defaultLength : Math.min(defaultLength, maxDivision);
                while (division < maxDivision && this._doc.song.partsPerBeat % division != 0) {
                    division++;
                }
                this._cursor.start += Math.floor(modMouse / division) * division;
            }
            this._cursor.end = this._cursor.start + defaultLength;
            let forceStart = 0;
            let forceEnd = this._doc.song.beatsPerBar * this._doc.song.partsPerBeat;
            if (this._cursor.prevNote != null) {
                forceStart = this._cursor.prevNote.end;
            }
            if (this._cursor.nextNote != null) {
                forceEnd = this._cursor.nextNote.start;
            }
            if (this._cursor.start < forceStart) {
                this._cursor.start = forceStart;
                this._cursor.end = this._cursor.start + defaultLength;
                if (this._cursor.end > forceEnd) {
                    this._cursor.end = forceEnd;
                }
            }
            else if (this._cursor.end > forceEnd) {
                this._cursor.end = forceEnd;
                this._cursor.start = this._cursor.end - defaultLength;
                if (this._cursor.start < forceStart) {
                    this._cursor.start = forceStart;
                }
            }
            if (this._cursor.end - this._cursor.start == defaultLength) {
                this._cursor.pins = this._copiedPins;
            }
            else {
                this._cursor.pins = [];
                for (const oldPin of this._copiedPins) {
                    if (oldPin.time <= this._cursor.end - this._cursor.start) {
                        this._cursor.pins.push(makeNotePin(0, oldPin.time, oldPin.volume));
                        if (oldPin.time == this._cursor.end - this._cursor.start)
                            break;
                    }
                    else {
                        this._cursor.pins.push(makeNotePin(0, this._cursor.end - this._cursor.start, oldPin.volume));
                        break;
                    }
                }
            }
        }
        this._cursor.valid = true;
    }
    _findMousePitch(pixelY) {
        return Math.max(0, Math.min(this._pitchCount - 1, this._pitchCount - (pixelY / this._pitchHeight))) + this._octaveOffset;
    }
    _snapToPitch(guess, min, max) {
        if (guess < min)
            guess = min;
        if (guess > max)
            guess = max;
        const scale = Config.scaleFlags[this._doc.song.scale];
        if (scale[Math.floor(guess) % 12] || this._doc.song.getChannelIsDrum(this._doc.channel)) {
            return Math.floor(guess);
        }
        else {
            let topPitch = Math.floor(guess) + 1;
            let bottomPitch = Math.floor(guess) - 1;
            while (!scale[topPitch % 12]) {
                topPitch++;
            }
            while (!scale[(bottomPitch) % 12]) {
                bottomPitch--;
            }
            if (topPitch > max) {
                if (bottomPitch < min) {
                    return min;
                }
                else {
                    return bottomPitch;
                }
            }
            else if (bottomPitch < min) {
                return topPitch;
            }
            let topRange = topPitch;
            let bottomRange = bottomPitch + 1;
            if (topPitch % 12 == 0 || topPitch % 12 == 7) {
                topRange -= 0.5;
            }
            if (bottomPitch % 12 == 0 || bottomPitch % 12 == 7) {
                bottomRange += 0.5;
            }
            return guess - bottomRange > topRange - guess ? topPitch : bottomPitch;
        }
    }
    _copyPins(note) {
        this._copiedPins = [];
        for (const oldPin of note.pins) {
            this._copiedPins.push(makeNotePin(0, oldPin.time, oldPin.volume));
        }
        for (let i = 1; i < this._copiedPins.length - 1;) {
            if (this._copiedPins[i - 1].volume == this._copiedPins[i].volume &&
                this._copiedPins[i].volume == this._copiedPins[i + 1].volume) {
                this._copiedPins.splice(i, 1);
            }
            else {
                i++;
            }
        }
        this._copiedPinChannels[this._doc.channel] = this._copiedPins;
    }
    _whenCursorPressed() {
        this._mouseDown = true;
        this._mouseXStart = this._mouseX;
        this._mouseYStart = this._mouseY;
        this._mouseXPrev = this._mouseX;
        this._mouseYPrev = this._mouseY;
        this._updateCursorStatus();
        this._updatePreview();
        this._dragChange = new ChangeSequence();
        this._doc.setProspectiveChange(this._dragChange);
    }
    _whenCursorMoved() {
        let start;
        let end;
        const continuousState = this._doc.lastChangeWas(this._dragChange);
        if (this._mouseDown && this._cursor.valid && continuousState) {
            if (!this._mouseDragging) {
                const dx = this._mouseX - this._mouseXStart;
                const dy = this._mouseY - this._mouseYStart;
                if (Math.sqrt(dx * dx + dy * dy) > 5) {
                    this._mouseDragging = true;
                    this._mouseHorizontal = Math.abs(dx) >= Math.abs(dy);
                }
            }
            if (this._mouseDragging) {
                if (this._dragChange != null) {
                    this._dragChange.undo();
                }
                const currentPart = Math.floor(this._mouseX / this._partWidth);
                const sequence = new ChangeSequence();
                this._dragChange = sequence;
                this._doc.setProspectiveChange(this._dragChange);
                if (this._cursor.curNote == null) {
                    let backwards;
                    let directLength;
                    if (currentPart < this._cursor.start) {
                        backwards = true;
                        directLength = this._cursor.start - currentPart;
                    }
                    else {
                        backwards = false;
                        directLength = currentPart - this._cursor.start + 1;
                    }
                    let defaultLength = 1;
                    for (let i = 0; i <= this._doc.song.beatsPerBar * this._doc.song.partsPerBeat; i++) {
                        if (i >= 5 &&
                            i % this._doc.song.partsPerBeat != 0 &&
                            i != this._doc.song.partsPerBeat * 3.0 / 2.0 &&
                            i != this._doc.song.partsPerBeat * 4.0 / 3.0 &&
                            i != this._doc.song.partsPerBeat * 5.0 / 3.0) {
                            continue;
                        }
                        const blessedLength = i;
                        if (blessedLength == directLength) {
                            defaultLength = blessedLength;
                            break;
                        }
                        if (blessedLength < directLength) {
                            defaultLength = blessedLength;
                        }
                        if (blessedLength > directLength) {
                            if (defaultLength < directLength - 1) {
                                defaultLength = blessedLength;
                            }
                            break;
                        }
                    }
                    if (backwards) {
                        end = this._cursor.start;
                        start = end - defaultLength;
                    }
                    else {
                        start = this._cursor.start;
                        end = start + defaultLength;
                    }
                    if (start < 0)
                        start = 0;
                    if (end > this._doc.song.beatsPerBar * this._doc.song.partsPerBeat)
                        end = this._doc.song.beatsPerBar * this._doc.song.partsPerBeat;
                    if (start < end) {
                        sequence.append(new ChangeEnsurePatternExists(this._doc));
                        const pattern = this._doc.getCurrentPattern();
                        if (pattern == null)
                            throw new Error();
                        sequence.append(new ChangeNoteTruncate(this._doc, pattern, start, end));
                        let i;
                        for (i = 0; i < pattern.notes.length; i++) {
                            if (pattern.notes[i].start >= end)
                                break;
                        }
                        const theNote = makeNote(this._cursor.pitch, start, end, 3, this._doc.song.getChannelIsDrum(this._doc.channel));
                        sequence.append(new ChangeNoteAdded(this._doc, pattern, theNote, i));
                        this._copyPins(theNote);
                        this._dragTime = backwards ? start : end;
                        this._dragPitch = this._cursor.pitch;
                        this._dragVolume = theNote.pins[backwards ? 0 : 1].volume;
                        this._dragVisible = true;
                    }
                    this._pattern = this._doc.getCurrentPattern();
                }
                else if (this._mouseHorizontal) {
                    const shift = Math.round((this._mouseX - this._mouseXStart) / this._partWidth);
                    const shiftedPin = this._cursor.curNote.pins[this._cursor.nearPinIndex];
                    let shiftedTime = this._cursor.curNote.start + shiftedPin.time + shift;
                    if (shiftedTime < 0)
                        shiftedTime = 0;
                    if (shiftedTime > this._doc.song.beatsPerBar * this._doc.song.partsPerBeat)
                        shiftedTime = this._doc.song.beatsPerBar * this._doc.song.partsPerBeat;
                    if (this._pattern == null)
                        throw new Error();
                    if (shiftedTime <= this._cursor.curNote.start && this._cursor.nearPinIndex == this._cursor.curNote.pins.length - 1 ||
                        shiftedTime >= this._cursor.curNote.end && this._cursor.nearPinIndex == 0) {
                        sequence.append(new ChangeNoteAdded(this._doc, this._pattern, this._cursor.curNote, this._cursor.curIndex, true));
                        this._dragVisible = false;
                    }
                    else {
                        start = Math.min(this._cursor.curNote.start, shiftedTime);
                        end = Math.max(this._cursor.curNote.end, shiftedTime);
                        this._dragTime = shiftedTime;
                        this._dragPitch = this._cursor.curNote.pitches[this._cursor.pitchIndex == -1 ? 0 : this._cursor.pitchIndex] + this._cursor.curNote.pins[this._cursor.nearPinIndex].interval;
                        this._dragVolume = this._cursor.curNote.pins[this._cursor.nearPinIndex].volume;
                        this._dragVisible = true;
                        if (this._pattern == null)
                            throw new Error();
                        sequence.append(new ChangeNoteTruncate(this._doc, this._pattern, start, end, this._cursor.curNote));
                        sequence.append(new ChangePinTime(this._doc, this._cursor.curNote, this._cursor.nearPinIndex, shiftedTime));
                        this._copyPins(this._cursor.curNote);
                    }
                }
                else if (this._cursor.pitchIndex == -1) {
                    const bendPart = Math.round(Math.max(this._cursor.curNote.start, Math.min(this._cursor.curNote.end, this._mouseX / this._partWidth))) - this._cursor.curNote.start;
                    let prevPin;
                    let nextPin = this._cursor.curNote.pins[0];
                    let bendVolume = 0;
                    let bendInterval = 0;
                    for (let i = 1; i < this._cursor.curNote.pins.length; i++) {
                        prevPin = nextPin;
                        nextPin = this._cursor.curNote.pins[i];
                        if (bendPart > nextPin.time)
                            continue;
                        if (bendPart < prevPin.time)
                            throw new Error();
                        const volumeRatio = (bendPart - prevPin.time) / (nextPin.time - prevPin.time);
                        bendVolume = Math.round(prevPin.volume * (1.0 - volumeRatio) + nextPin.volume * volumeRatio + ((this._mouseYStart - this._mouseY) / 20.0));
                        if (bendVolume < 0)
                            bendVolume = 0;
                        if (bendVolume > 3)
                            bendVolume = 3;
                        bendInterval = this._snapToPitch(prevPin.interval * (1.0 - volumeRatio) + nextPin.interval * volumeRatio + this._cursor.curNote.pitches[0], 0, Config.maxPitch) - this._cursor.curNote.pitches[0];
                        break;
                    }
                    this._dragTime = this._cursor.curNote.start + bendPart;
                    this._dragPitch = this._cursor.curNote.pitches[this._cursor.pitchIndex == -1 ? 0 : this._cursor.pitchIndex] + bendInterval;
                    this._dragVolume = bendVolume;
                    this._dragVisible = true;
                    sequence.append(new ChangeVolumeBend(this._doc, this._cursor.curNote, bendPart, bendVolume, bendInterval));
                    this._copyPins(this._cursor.curNote);
                }
                else {
                    this._dragVolume = this._cursor.curNote.pins[this._cursor.nearPinIndex].volume;
                    if (this._pattern == null)
                        throw new Error();
                    let bendStart;
                    let bendEnd;
                    if (this._mouseX >= this._mouseXStart) {
                        bendStart = this._cursor.part;
                        bendEnd = currentPart + 1;
                    }
                    else {
                        bendStart = this._cursor.part + 1;
                        bendEnd = currentPart;
                    }
                    if (bendEnd < 0)
                        bendEnd = 0;
                    if (bendEnd > this._doc.song.beatsPerBar * this._doc.song.partsPerBeat)
                        bendEnd = this._doc.song.beatsPerBar * this._doc.song.partsPerBeat;
                    if (bendEnd > this._cursor.curNote.end) {
                        sequence.append(new ChangeNoteTruncate(this._doc, this._pattern, this._cursor.curNote.start, bendEnd, this._cursor.curNote));
                    }
                    if (bendEnd < this._cursor.curNote.start) {
                        sequence.append(new ChangeNoteTruncate(this._doc, this._pattern, bendEnd, this._cursor.curNote.end, this._cursor.curNote));
                    }
                    let minPitch = Number.MAX_VALUE;
                    let maxPitch = -Number.MAX_VALUE;
                    for (const pitch of this._cursor.curNote.pitches) {
                        if (minPitch > pitch)
                            minPitch = pitch;
                        if (maxPitch < pitch)
                            maxPitch = pitch;
                    }
                    minPitch -= this._cursor.curNote.pitches[this._cursor.pitchIndex];
                    maxPitch -= this._cursor.curNote.pitches[this._cursor.pitchIndex];
                    const bendTo = this._snapToPitch(this._findMousePitch(this._mouseY), -minPitch, (this._doc.song.getChannelIsDrum(this._doc.channel) ? Config.drumCount - 1 : Config.maxPitch) - maxPitch);
                    sequence.append(new ChangePitchBend(this._doc, this._cursor.curNote, bendStart, bendEnd, bendTo, this._cursor.pitchIndex));
                    this._copyPins(this._cursor.curNote);
                    this._dragTime = bendEnd;
                    this._dragPitch = bendTo;
                    this._dragVisible = true;
                }
            }
            this._mouseXPrev = this._mouseX;
            this._mouseYPrev = this._mouseY;
        }
        else {
            this._updateCursorStatus();
            this._updatePreview();
        }
    }
    _updatePreview() {
        if (this._usingTouch) {
            if (!this._mouseDown || !this._cursor.valid || !this._mouseDragging || !this._dragVisible) {
                this._svgPreview.setAttribute("visibility", "hidden");
            }
            else {
                this._svgPreview.setAttribute("visibility", "visible");
                const x = this._partWidth * this._dragTime;
                const y = this._pitchToPixelHeight(this._dragPitch - this._octaveOffset);
                const radius = this._pitchHeight / 2;
                const width = 80;
                const height = 60;
                let pathString = "";
                pathString += "M " + prettyNumber(x) + " " + prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + prettyNumber(x) + " " + prettyNumber(y - radius * (this._dragVolume / 3.0) - height) + " ";
                pathString += "M " + prettyNumber(x) + " " + prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + prettyNumber(x) + " " + prettyNumber(y + radius * (this._dragVolume / 3.0) + height) + " ";
                pathString += "M " + prettyNumber(x) + " " + prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + prettyNumber(x + width) + " " + prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "M " + prettyNumber(x) + " " + prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + prettyNumber(x + width) + " " + prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "M " + prettyNumber(x) + " " + prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + prettyNumber(x - width) + " " + prettyNumber(y - radius * (this._dragVolume / 3.0)) + " ";
                pathString += "M " + prettyNumber(x) + " " + prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                pathString += "L " + prettyNumber(x - width) + " " + prettyNumber(y + radius * (this._dragVolume / 3.0)) + " ";
                this._svgPreview.setAttribute("d", pathString);
            }
        }
        else {
            if (!this._mouseOver || this._mouseDown || !this._cursor.valid) {
                this._svgPreview.setAttribute("visibility", "hidden");
            }
            else {
                this._svgPreview.setAttribute("visibility", "visible");
                this._drawNote(this._svgPreview, this._cursor.pitch, this._cursor.start, this._cursor.pins, this._pitchHeight / 2 + 1, true, this._octaveOffset);
            }
        }
    }
    render() {
        if (this._renderedFifths != this._doc.showFifth) {
            if (this._renderedACS == false) {
                this._renderedFifths = this._doc.showFifth;
                this._backgroundPitchRows[7].setAttribute("fill", this._doc.showFifth ? ColorConfig.fifthNote : ColorConfig.pitchBackground);
            }
        }
        if (this._doc.showMore == false) {
            if (this._renderedPiano == true) {
                this._renderedPiano = false;
            }
            if (this._renderedACS == false) {
                this._backgroundPitchRows[0].setAttribute("fill", this._doc.showMore ? ColorConfig.tonic : ColorConfig.tonic);
                this._backgroundPitchRows[1].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch1Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[2].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch2Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[3].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch3Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[4].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch4Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[5].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch5Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[6].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch6Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[7].setAttribute("fill", this._doc.showMore ? ColorConfig.fifthNote : ColorConfig.fifthNote);
                this._backgroundPitchRows[8].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch8Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[9].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch9Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[10].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch10Background : ColorConfig.pitchBackground);
                this._backgroundPitchRows[11].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch11Background : ColorConfig.pitchBackground);
                this._renderedACS = true;
                console.log("this._renderedACS (acs disabled): " + this._renderedACS);
            }
            this._setKey = -1;
        }
        else {
            if (ColorConfig.usesPianoScheme == false) {
                if (this._renderedACS != this._doc.showMore) {
                    this._backgroundPitchRows[0].setAttribute("fill", this._doc.showMore ? ColorConfig.tonic : ColorConfig.tonic);
                    this._backgroundPitchRows[1].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch1Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[2].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch2Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[3].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch3Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[4].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch4Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[5].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch5Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[6].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch6Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[7].setAttribute("fill", this._doc.showFifth ? ColorConfig.fifthNote : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[8].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch8Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[9].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch9Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[10].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch10Background : ColorConfig.pitchBackground);
                    this._backgroundPitchRows[11].setAttribute("fill", this._doc.showMore ? ColorConfig.pitch11Background : ColorConfig.pitchBackground);
                    this._renderedACS = this._doc.showMore;
                    console.log("this._renderedACS (acs enabled): " + this._renderedACS);
                }
                if (this._renderedPiano == true) {
                    this._renderedPiano = false;
                    this._setKey = -1;
                    console.log("this._renderedACS (disabiling piano): " + this._renderedACS);
                }
            }
            else {
                if (this._setKey != this._doc.song.key) {
                    this._setKey = this._doc.song.key;
                    this._renderedPiano = true;
                    console.log("piano key" + this._setKey);
                    if ((this._setKey == 0) || (this._setKey == 2) || (this._setKey == 4) || (this._setKey == 6) || (this._setKey == 7) || (this._setKey == 9) || (this._setKey == 11)) {
                        this._backgroundPitchRows[0].setAttribute("fill", this._doc.showMore ? "var(--white-tonic, var(--pitch-white-key, var(--pitch-background)))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[0].setAttribute("fill", this._doc.showMore ? "var(--black-tonic, var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 0) || (this._setKey == 1) || (this._setKey == 3) || (this._setKey == 5) || (this._setKey == 7) || (this._setKey == 8) || (this._setKey == 10)) {
                        this._backgroundPitchRows[1].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[1].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 1) || (this._setKey == 2) || (this._setKey == 4) || (this._setKey == 6) || (this._setKey == 8) || (this._setKey == 9) || (this._setKey == 11)) {
                        this._backgroundPitchRows[2].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[2].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 0) || (this._setKey == 2) || (this._setKey == 3) || (this._setKey == 5) || (this._setKey == 7) || (this._setKey == 9) || (this._setKey == 10)) {
                        this._backgroundPitchRows[3].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[3].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 1) || (this._setKey == 3) || (this._setKey == 4) || (this._setKey == 6) || (this._setKey == 8) || (this._setKey == 10) || (this._setKey == 11)) {
                        this._backgroundPitchRows[4].setAttribute("fill", this._doc.showMore ? " var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[4].setAttribute("fill", this._doc.showMore ? " var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 0) || (this._setKey == 2) || (this._setKey == 4) || (this._setKey == 5) || (this._setKey == 7) || (this._setKey == 9) || (this._setKey == 11)) {
                        this._backgroundPitchRows[5].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[5].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 0) || (this._setKey == 1) || (this._setKey == 3) || (this._setKey == 5) || (this._setKey == 6) || (this._setKey == 8) || (this._setKey == 10)) {
                        this._backgroundPitchRows[6].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[6].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 1) || (this._setKey == 2) || (this._setKey == 4) || (this._setKey == 6) || (this._setKey == 7) || (this._setKey == 9) || (this._setKey == 11)) {
                        if (this._doc.showFifth == true) {
                            this._backgroundPitchRows[7].setAttribute("fill", this._doc.showMore ? "var(--white-fifth-note, var(--pitch-white-key, var(--pitch-background)))" : ColorConfig.pitchBackground);
                        }
                        else {
                            this._backgroundPitchRows[7].setAttribute("fill", this._doc.showMore ? " var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                        }
                    }
                    else {
                        if (this._doc.showFifth == true) {
                            this._backgroundPitchRows[7].setAttribute("fill", this._doc.showMore ? "var(--black-fifth-note, var(--pitch-black-key, var(--pitch-background)))" : ColorConfig.pitchBackground);
                        }
                        else {
                            this._backgroundPitchRows[7].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                        }
                    }
                    if ((this._setKey == 0) || (this._setKey == 2) || (this._setKey == 3) || (this._setKey == 5) || (this._setKey == 7) || (this._setKey == 8) || (this._setKey == 10)) {
                        this._backgroundPitchRows[8].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[8].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 1) || (this._setKey == 3) || (this._setKey == 4) || (this._setKey == 6) || (this._setKey == 8) || (this._setKey == 9) || (this._setKey == 11)) {
                        this._backgroundPitchRows[9].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[9].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 0) || (this._setKey == 2) || (this._setKey == 4) || (this._setKey == 5) || (this._setKey == 7) || (this._setKey == 9) || (this._setKey == 10)) {
                        this._backgroundPitchRows[10].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[10].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if ((this._setKey == 1) || (this._setKey == 3) || (this._setKey == 5) || (this._setKey == 6) || (this._setKey == 8) || (this._setKey == 10) || (this._setKey == 11)) {
                        this._backgroundPitchRows[11].setAttribute("fill", this._doc.showMore ? "var(--pitch-white-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    else {
                        this._backgroundPitchRows[11].setAttribute("fill", this._doc.showMore ? "var(--pitch-black-key, var(--pitch-background))" : ColorConfig.pitchBackground);
                    }
                    if (this._renderedACS == true) {
                        this._renderedACS = false;
                        console.log("this._renderedACS (in piano): " + this._renderedACS);
                    }
                }
            }
        }
    }
    _drawNote(svgElement, pitch, start, pins, radius, showVolume, offset) {
        let nextPin = pins[0];
        let pathString = "M " + prettyNumber(this._partWidth * (start + nextPin.time) + 1) + " " + prettyNumber(this._pitchToPixelHeight(pitch - offset) + radius * (showVolume ? nextPin.volume / 3.0 : 1.0)) + " ";
        for (let i = 1; i < pins.length; i++) {
            let prevPin = nextPin;
            nextPin = pins[i];
            let prevSide = this._partWidth * (start + prevPin.time) + (i == 1 ? 1 : 0);
            let nextSide = this._partWidth * (start + nextPin.time) - (i == pins.length - 1 ? 1 : 0);
            let prevHeight = this._pitchToPixelHeight(pitch + prevPin.interval - offset);
            let nextHeight = this._pitchToPixelHeight(pitch + nextPin.interval - offset);
            let prevVolume = showVolume ? prevPin.volume / 3.0 : 1.0;
            let nextVolume = showVolume ? nextPin.volume / 3.0 : 1.0;
            pathString += "L " + prettyNumber(prevSide) + " " + prettyNumber(prevHeight - radius * prevVolume) + " ";
            if (prevPin.interval > nextPin.interval)
                pathString += "L " + prettyNumber(prevSide + 1) + " " + prettyNumber(prevHeight - radius * prevVolume) + " ";
            if (prevPin.interval < nextPin.interval)
                pathString += "L " + prettyNumber(nextSide - 1) + " " + prettyNumber(nextHeight - radius * nextVolume) + " ";
            pathString += "L " + prettyNumber(nextSide) + " " + prettyNumber(nextHeight - radius * nextVolume) + " ";
        }
        for (let i = pins.length - 2; i >= 0; i--) {
            let prevPin = nextPin;
            nextPin = pins[i];
            let prevSide = this._partWidth * (start + prevPin.time) - (i == pins.length - 2 ? 1 : 0);
            let nextSide = this._partWidth * (start + nextPin.time) + (i == 0 ? 1 : 0);
            let prevHeight = this._pitchToPixelHeight(pitch + prevPin.interval - offset);
            let nextHeight = this._pitchToPixelHeight(pitch + nextPin.interval - offset);
            let prevVolume = showVolume ? prevPin.volume / 3.0 : 1.0;
            let nextVolume = showVolume ? nextPin.volume / 3.0 : 1.0;
            pathString += "L " + prettyNumber(prevSide) + " " + prettyNumber(prevHeight + radius * prevVolume) + " ";
            if (prevPin.interval < nextPin.interval)
                pathString += "L " + prettyNumber(prevSide - 1) + " " + prettyNumber(prevHeight + radius * prevVolume) + " ";
            if (prevPin.interval > nextPin.interval)
                pathString += "L " + prettyNumber(nextSide + 1) + " " + prettyNumber(nextHeight + radius * nextVolume) + " ";
            pathString += "L " + prettyNumber(nextSide) + " " + prettyNumber(nextHeight + radius * nextVolume) + " ";
        }
        pathString += "z";
        svgElement.setAttribute("d", pathString);
    }
    _pitchToPixelHeight(pitch) {
        return this._pitchHeight * (this._pitchCount - (pitch) - 0.5);
    }
}
//# sourceMappingURL=PatternEditor.js.map