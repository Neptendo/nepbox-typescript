/*
Copyright (C) 2018 John Nesky

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

import {Prompt} from "./Prompt";
import { SongDocument } from "./SongDocument";
import {Change} from "./Change";
import {PatternEditor} from "./PatternEditor";
import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { Note, Channel, Pattern, Instrument } from "../synth/synth";
import { InstrumentType, Config } from "../synth/SynthConfig";
import { TrackEditor } from "./TrackEditor";
import { LoopEditor } from "./LoopEditor";
import { BarScrollBar } from "./BarScrollBar";
import { OctaveScrollBar } from "./OctaveScrollBar";
import { Piano } from "./Piano";
import { ChangeInsertBars, ChangeTransition, ChangeAlgorithm, ChangeBlend, ChangeChannelBar, ChangeChorus, ChangeDetune, ChangeEffect,ChangeFMChorus, ChangeFeedbackAmplitude, ChangeFeedbackEnvelope, ChangeFeedbackType, ChangeFilter, ChangeHarm, ChangeImute, ChangeInstrumentType, ChangeIpan, ChangeKey,  ChangeMix, ChangeMuff, ChangeOctoff, ChangeOperatorAmplitude, ChangeOperatorEnvelope, ChangeOperatorFrequency, ChangePartsPerBeat, ChangePaste, ChangePatternInstrument, ChangeReverb, ChangeRiff, ChangeSampleRate, ChangeScale, ChangeSong, ChangeTempo, ChangeTranspose, ChangeVolume, ChangeWave, ChangeDeleteBars, ChangeRemoveChannel, ChangeAddChannel, ChangeEnsurePatternExists } from "./changes";
import { MixPrompt} from "./MixPrompt";
import { ChorusPrompt } from "./ChorusPrompt";
import { ExportPrompt } from "./ExportPrompt";
import { ImportPrompt } from "./ImportPrompt";
import { ArchivePrompt } from "./ArchivePrompt";
import { RefreshPrompt } from "./RefreshPrompt";
import { SongDataPrompt } from "./SongDataPrompt";
import { RefreshKeyPrompt } from "./RefreshKeyPrompt";
import { SongDurationPrompt } from "./SongDurationPrompt";
import { InstrumentTypePrompt } from "./InstrumentTypePrompt";
import { ManualPrompt } from "./ManualPrompt";
import { ThemePrompt } from "./ThemePrompt";
import { ColorConfig } from "./ColorConfig"; 

const {button, div, span, select, option, input, a} = HTML;
	
	export const isMobile: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|android|ipad|playbook|silk/i.test(navigator.userAgent);
	
	function buildOptions(menu: HTMLSelectElement, items: ReadonlyArray<string | number>): HTMLSelectElement {
		for (let index: number = 0; index < items.length; index++) {
			menu.appendChild(option({value: index}, items[index]));
		}
		return menu;
	}
	
	function buildOptionsWithSpecificValues(menu: HTMLSelectElement, items: ReadonlyArray<string | number>, values: ReadonlyArray<string | number>): HTMLSelectElement {
		if (items.length != values.length) {
			throw new Error("items and values don't have the same length");
		}
		for (let i: number = 0; i < items.length; i++) {
			const item: string | number = items[i];
			const value: string | number = values[i];
			menu.appendChild(option({value:value}, item));
		}
		return menu;
	}
	
	function setSelectedIndex(menu: HTMLSelectElement, index: number): void {
		if (menu.selectedIndex != index) menu.selectedIndex = index;
	}
	
	interface PatternCopy {
		notes: Note[];
		beatsPerBar: number;
		partsPerBeat: number;
		drums: boolean;
	}
	
	class Slider {
		private _change: Change | null = null;
		private _value: number = 0;
		private _oldValue: number = 0;
		
		constructor(public readonly input: HTMLInputElement, private readonly _doc: SongDocument, private readonly _getChange: (oldValue: number, newValue: number)=>Change) {
			input.addEventListener("input", this._whenInput);
			input.addEventListener("change", this._whenChange);
		}
		
		public updateValue(value: number): void {
			this._value = value;
			this.input.value = String(value);
		}
		
		private _whenInput = (): void => {
			const continuingProspectiveChange: boolean = this._doc.lastChangeWas(this._change);
			if (!continuingProspectiveChange) this._oldValue = this._value;
			this._change = this._getChange(this._oldValue, parseInt(this.input.value));
			this._doc.setProspectiveChange(this._change);
		};
		
		private _whenChange = (): void => {
			this._doc.record(this._change!);
			this._change = null;
		};
	}
	
	export class SongEditor {
		public prompt: Prompt | null = null;
		
		public readonly _patternEditor: PatternEditor = new PatternEditor(this._doc);
		private readonly _trackEditor: TrackEditor = new TrackEditor(this._doc);
		private readonly _loopEditor: LoopEditor = new LoopEditor(this._doc);
		private readonly _trackContainer: HTMLDivElement = div({class: "trackContainer"}, 
			this._trackEditor.container,
			this._loopEditor.container,
		);
		private readonly _barScrollBar: BarScrollBar = new BarScrollBar(this._doc, this._trackContainer);
		private readonly _octaveScrollBar: OctaveScrollBar = new OctaveScrollBar(this._doc);
		private readonly _piano: Piano = new Piano(this._doc);
		private readonly _editorBox: HTMLDivElement = div({}, 
			div({class: "editorBox", style: "height: 481px; display: flex; flex-direction: row; margin-bottom: 6px;"}, 
				this._piano.container,
				this._patternEditor.container,
				this._octaveScrollBar.container,
			),
			this._trackContainer,
			this._barScrollBar.container,
		);
		private readonly _playButton: HTMLButtonElement = button({style: "width:0; flex:2;", type: "button"});
		private readonly _prevBarButton: HTMLButtonElement = button({class: "prevBarButton", style: "width: 0; margin: 0px; flex:1; margin-left: 0px;", type: "button", title: "Prev Bar (left bracket)"});
		private readonly _nextBarButton: HTMLButtonElement = button({class: "nextBarButton", style: "width: 0; margin: 0px; flex:1; margin-left: 0px;", type: "button", title: "Next Bar (right bracket)"});
		private readonly _volumeSlider: HTMLInputElement = input({title: "main volume", style: "flex:1; margin: 0px;", type: "range", min: "0", max: "100", value: "50", step: "1"});
		private readonly _fileMenu: HTMLSelectElement = select({style: "width: 100%;"}, 
			option({selected: true, disabled: true, hidden: false}, "File Menu"),
			option({value: "cleanS"}, "New Song"),
			option({value: "import"}, "Import JSON"),
			option({value: "export"}, "Export Song"),
			option({value: "songdata"}, "Song Data"),
			option({value: "manual"}, "Open Manual"),
		);
		private readonly _editMenu: HTMLSelectElement = select({style: "width: 100%;"}, 
			option({selected: true, disabled: true, hidden: false}, "Edit Menu"),
			option({value: "undo"}, "Undo (Z)"),
			option({value: "redo"}, "Redo (Y)"),
			option({value: "copy"}, "Copy Pattern (C)"),
			option({value: "cut"}, "Cut Pattern (X)"),
			option({value: "paste"}, "Paste Pattern (V)"),
			option({value: "transposeUp"}, "Shift Notes Up (+)"),
			option({value: "transposeDown"}, "Shift Notes Down (-)"),
			option({value: "duration"}, "Custom Song Size (Q)"),
		);
		private readonly _optionsMenu: HTMLSelectElement = select({style: "width: 100%;"}, 
			option({selected: true, disabled: true, hidden: false}, "Preferences Menu"),
			option({value: "autoPlay"}, "Auto Play On Load"),
			option({value: "autoFollow"}, "Auto Follow Track"),
			option({value: "showLetters"}, "Show Piano"),
			option({value: "showFifth"}, "Highlight 'Fifth' Notes"),
			option({value: "showMore"}, "Advanced Color Scheme"),
			option({value: "showChannels"},"Show All Channels"),
			option({value: "showScrollBar"}, "Octave Scroll Bar"),
			option({value: "showVolumeBar"}, "Show Channel Volume"),
			option({value: "advancedSettings"}, "Enable Advanced Settings"),
			option({value: "themes"}, "Set Theme..."),
		);
		private readonly _newSongButton: HTMLButtonElement = button({type: "button"}, 
			div({},"New"),
			span({class: "fullWidthOnly"}, div({}," Song")),
			// Page icon:
			SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-5 -21 26 26"}, 
				SVG.path({d: "M 2 0 L 2 -16 L 10 -16 L 14 -12 L 14 0 z M 3 -1 L 13 -1 L 13 -11 L 9 -11 L 9 -15 L 3 -15 z", fill: "currentColor"}),
			),
		);
		private readonly _songDataButton: HTMLButtonElement = button({type: "button"}, 
			div({},"Song Data"),
			SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-5 -21 26 26"}, 
				SVG.path({d: "M 0 0 L 16 0 L 16 -13 L 10 -13 L 8 -16 L 0 -16 L 0 -13 z", fill: "currentColor"}),
			),
		);
		private readonly _customizeButton: HTMLButtonElement = button({type: "button"}, 
			span({ class: "center" }, div({},"Custom Song Size")),
			SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-13 -13 26 26"}, 
				SVG.path({d: "M -8 2 L -2 2 L -2 8 L 2 8 L 2 2 L 8 2 L 8 -2 L 2 -2 L 2 -8 L -2 -8 L -2 -2 L -8 -2 z M 0 2 L -4 -2 L -1 -2 L -1 -8 L 1 -8 L 1 -2 L 4 -2 z M -8 -8 L 8 -8 L 8 -9 L -8 -9 L -8 -8 z", fill: "currentColor"}),
			),
		);
		private readonly _archiveButton: HTMLButtonElement = button({type: "button"}, 
			span({ class: "center" }, div({},"Load Mods...")),
			SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-13 -13 26 26"}, 
				SVG.path({d: "M 5.78 -1.6 L 7.93 -0.94 L 7.93 0.94 L 5.78 1.6 L 4.85 3.53 L 5.68 5.61 L 4.21 6.78 L 2.36 5.52 L 0.27 5.99 L -0.85 7.94 L -2.68 7.52 L -2.84 5.28 L -4.52 3.95 L -6.73 4.28 L -7.55 2.59 L -5.9 1.07 L -5.9 -1.07 L -7.55 -2.59 L -6.73 -4.28 L -4.52 -3.95 L -2.84 -5.28 L -2.68 -7.52 L -0.85 -7.94 L 0.27 -5.99 L 2.36 -5.52 L 4.21 -6.78 L 5.68 -5.61 L 4.85 -3.53 M 2.92 0.67 L 2.92 -0.67 L 2.35 -1.87 L 1.3 -2.7 L 0 -3 L -1.3 -2.7 L -2.35 -1.87 L -2.92 -0.67 L -2.92 0.67 L -2.35 1.87 L -1.3 2.7 L -0 3 L 1.3 2.7 L 2.35 1.87 z", fill: "currentColor"}),
			),
		);
		private readonly _undoButton: HTMLButtonElement = button({type: "button", style: "width: 45%; margin: 0px; margin-top: -2px;"}, div({},"Undo"));
		private readonly _redoButton: HTMLButtonElement = button({type: "button", style: "width: 45%; margin: 0px; margin-top: -2px;"}, div({},"Redo"));
		private readonly _exportButton: HTMLButtonElement = button({type: "button"}, 
			div({},"Export"),
			// Download icon:
			SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-13 -13 26 26"}, 
				SVG.path({d: "M -8 3 L -8 8 L 8 8 L 8 3 L 6 3 L 6 6 L -6 6 L -6 3 z M 0 2 L -4 -2 L -1 -2 L -1 -8 L 1 -8 L 1 -2 L 4 -2 z", fill: "currentColor"}),
			),
		);
		private readonly _scaleSelect: HTMLSelectElement = buildOptions(select({}), Config.scaleNames);
		private readonly _mixSelect: HTMLSelectElement = buildOptions(select({}), Config.mixNames);
		private readonly _sampleRateSelect: HTMLSelectElement = buildOptions(select({}), Config.sampleRateNames);
		private readonly _mixHint: HTMLAnchorElement = <HTMLAnchorElement> a({ class: "hintButton" }, div({},"?"));
		private readonly _archiveHint: HTMLAnchorElement = <HTMLAnchorElement> a({ class: "hintButton" }, div({},"?"));
		private readonly _mixSelectRow: HTMLDivElement = div({class: "selectRow"}, this._mixHint, this._mixSelect);
		// private readonly _chipHint: HTMLAnchorElement = <HTMLAnchorElement> a( { class: "hintButton" }, div({},"?"));
		private readonly _instrumentTypeHint: HTMLAnchorElement = <HTMLAnchorElement> a( { class: "hintButton" }, div({},"?"));
		private readonly _keySelect: HTMLSelectElement = buildOptions(select({}), Config.keyNames);
		private readonly _themeSelect: HTMLSelectElement = buildOptions(select({}), Config.themeNames);
		private readonly _tempoSlider: Slider = new Slider(input({style: "margin: 0px;", type: "range", min: "0", max: Config.tempoSteps - 1, value: "7", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeTempo(this._doc, oldValue, newValue));
		private readonly _reverbSlider: Slider = new Slider(input({style: "margin: 0px;", type: "range", min: "0", max: Config.reverbRange - 1, value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeReverb(this._doc, oldValue, newValue));
		private readonly _blendSlider: Slider = new Slider(input({style: "width: 9em; margin: 0px;", type: "range", min: "0", max: Config.blendRange - 1, value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeBlend(this._doc, oldValue, newValue));
		private readonly _riffSlider: Slider = new Slider(input({style: "width: 9em; margin: 0px;", type: "range", min: "0", max: Config.riffRange - 1, value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeRiff(this._doc, oldValue, newValue));
		private readonly _detuneSlider: Slider = new Slider(input({style: "width: 9em; margin: 0px;", type: "range", min: "0", max: Config.detuneRange - 1, value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeDetune(this._doc, oldValue, newValue));
		private readonly _muffSlider: Slider = new Slider(input({style: "width: 9em; margin: 0px;", type: "range", min: "0", max: Config.muffRange - 1, value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeMuff(this._doc, oldValue, newValue));
		private readonly _imuteButton: HTMLButtonElement = button({ style: "width: 27px;", type: "button" });
		private readonly _iMmuteButton: HTMLButtonElement = button({ style: "width: 27px;", type: "button" });
		private readonly _partSelect: HTMLSelectElement = buildOptions(select({}), Config.partNames);
		private readonly _instrumentTypeSelect: HTMLSelectElement = buildOptionsWithSpecificValues(select({}), Config.pitchChannelTypeNames, Config.pitchChannelTypeValues);
		private readonly _instrumentTypeSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Type: ")), this._instrumentTypeHint, div({class: "selectContainer"}, this._instrumentTypeSelect));
		private readonly _algorithmSelect: HTMLSelectElement = buildOptions(select({}), Config.operatorAlgorithmNames);
		private readonly _algorithmSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Algorithm: ")), div({class: "selectContainer"}, this._algorithmSelect));
		private readonly _instrumentSelect: HTMLSelectElement = select({});
		private readonly _instrumentSelectRow: HTMLDivElement = div({class: "selectRow", style: "display: none;"}, span({}, div({},"Instrument: ")), div({class: "selectContainer"}, this._instrumentSelect));
		private readonly _instrumentVolumeSlider: Slider = new Slider(input({style: "margin: 8px; width: 60px;", type: "range", min: "-9", max: "0", value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeVolume(this._doc, oldValue, -newValue));
		private readonly _instrumentMVolumeSlider: Slider = new Slider(input({style: "margin: 8px; width: 60px;", type: "range", min: "-5", max: "0", value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeVolume(this._doc, oldValue, -newValue));
		private readonly _instrumentVolumeSliderRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Volume: ")), this._instrumentVolumeSlider.input, this._imuteButton);
		private readonly _instrumentMVolumeSliderRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Volume: ")), this._instrumentMVolumeSlider.input, this._iMmuteButton);
		private readonly _instrumentSettingsLabel: HTMLDivElement = div({ style: "margin: 3px 0; text-align: center;" }, div({},"Instrument Settings"));
		private readonly _advancedInstrumentSettingsLabel: HTMLDivElement = div({ style: "margin: 3px 0; text-align: center;" }, div({},"Advanced Instrument Settings"));
		private readonly _waveSelect: HTMLSelectElement = buildOptions(select({}), Config.waveNames);
		private readonly _drumSelect: HTMLSelectElement = buildOptions(select({}), Config.drumNames);
		private readonly _pwmwaveSelect: HTMLSelectElement = buildOptions(select({}), Config.pwmwaveNames);
		private readonly _waveSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Wave: ")), div({class: "selectContainer"}, this._waveSelect, this._pwmwaveSelect, this._drumSelect));
		private readonly _transitionSelect: HTMLSelectElement = buildOptions(select({}), Config.transitionNames);
		private readonly _filterSelect: HTMLSelectElement = buildOptions(select({}), Config.filterNames);
		private readonly _filterSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Filter: ")), div({class: "selectContainer"}, this._filterSelect));
		private readonly _chorusSelect: HTMLSelectElement = buildOptions(select({}), Config.chorusNames);
		private readonly _chorusHint = <HTMLAnchorElement> a( {class: "hintButton"}, div({},"?"));
		private readonly _chorusSelectRow: HTMLElement = div({class: "selectRow"}, span({}, div({},"Chorus: ")), div({class: "selectContainer"}, this._chorusSelect));
		private readonly _effectSelect: HTMLSelectElement = buildOptions(select({}), Config.effectNames);
		private readonly _effectSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Effect: ")), div({class: "selectContainer"}, this._effectSelect));
		private readonly _harmSelect: HTMLSelectElement = buildOptions(select({}), Config.harmDisplay);
		private readonly _harmSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Chord: ")), this._chorusHint, div({class: "selectContainer"}, this._harmSelect));
		private readonly _octoffSelect: HTMLSelectElement = buildOptions(select({}), Config.octoffNames);
		private readonly _octoffSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Octave Offset: ")), div({class: "selectContainer"}, this._octoffSelect));
		private readonly _fmChorusSelect: HTMLSelectElement = buildOptions(select({}), Config.fmChorusDisplay);
		private readonly _fmChorusSelectRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"FM Chorus: ")), div({class: "selectContainer"}, this._fmChorusSelect));
		private readonly _ipanSlider: Slider = new Slider(input({style: "margin: 8px; width: 100px;", type: "range", min: "-8", max: "0", value: "0", step: "1"}), this._doc, (oldValue: number, newValue: number) => new ChangeIpan(this._doc, oldValue, -newValue));
		private readonly _ipanSliderRow: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Panning: ")), span({}, div({},"L")), this._ipanSlider.input, span({}, div({},"R")));
		private readonly _phaseModGroup: HTMLElement = div({style: "display: flex; flex-direction: column; display: none;"}, );
		private readonly _feedbackTypeSelect: HTMLSelectElement = buildOptions(select({}), Config.operatorFeedbackNames);
		private readonly _feedbackRow1: HTMLDivElement = div({class: "selectRow"}, span({}, div({},"Feedback:")), div({class: "selectContainer"}, this._feedbackTypeSelect));
		
		private readonly _feedbackAmplitudeSlider: Slider = new Slider(input({style: "margin: 0px; width: 4em;", type: "range", min: "0", max: Config.operatorAmplitudeMax, value: "0", step: "1", title: "Feedback Amplitude"}), this._doc, (oldValue: number, newValue: number) => new ChangeFeedbackAmplitude(this._doc, oldValue, newValue));
		private readonly _feedbackEnvelopeSelect: HTMLSelectElement = buildOptions(select({style: "width: 100%;", title: "Feedback Envelope"}), Config.operatorEnvelopeNames);
		private readonly _feedbackRow2: HTMLDivElement = div({class: "operatorRow"}, 
			div({style: "margin-right: .1em; visibility: hidden;"}, div({},1 + ".")),
			div({style: "width: 3em; margin-right: .3em;"}),
			this._feedbackAmplitudeSlider.input,
			div({class: "selectContainer", style: "width: 5em; margin-left: .3em;"}, this._feedbackEnvelopeSelect),
		);
		private readonly _instrumentSettingsGroup: HTMLDivElement = div({}, 
			this._instrumentSettingsLabel,
			this._instrumentSelectRow,
			this._instrumentTypeSelectRow,
			this._instrumentMVolumeSliderRow,
			this._instrumentVolumeSliderRow,
			this._waveSelectRow,
			div({class: "selectRow"}, 
				span({}, div({},"Transitions: ")),
				div({class: "selectContainer"}, this._transitionSelect),
			),
			this._filterSelectRow,
			this._chorusSelectRow,
			this._effectSelectRow,
			this._algorithmSelectRow,
			this._phaseModGroup,
			this._feedbackRow1,
			this._feedbackRow2,
		);
		private readonly _advancedInstrumentSettingsGroup: HTMLDivElement = div({}, 
			this._advancedInstrumentSettingsLabel,
			this._ipanSliderRow,
			this._harmSelectRow,
			this._octoffSelectRow,
			this._fmChorusSelectRow,
		);
		private readonly _promptContainer: HTMLDivElement = div({class: "promptContainer", id: "promptContainer", style: "display: none;"});
		private readonly _advancedSongSettings: HTMLDivElement = div({ class: "editor-song-settings", style: "margin: 0px 5px;" }, 
			div({ style: "margin: 3px 0; text-align: center;" }, div({},"Advanced Song Settings")),
			div({ class: "selectRow" }, span({}, div({},"Mix: ")), div({ class: "selectContainer" }, this._mixSelectRow)),
			div({ class: "selectRow" }, span({}, div({},"Sample Rate: ")), div({ class: "selectContainer" }, this._sampleRateSelect)),
			div({ class: "selectRow" }, span({}, div({},"Blending: ")), this._blendSlider.input),
			div({ class: "selectRow" }, span({}, div({},"Riff: ")), this._riffSlider.input),
			div({ class: "selectRow" }, span({}, div({},"Detune: ")), this._detuneSlider.input),
			div({ class: "selectRow" }, span({}, div({},"Muff: ")), this._muffSlider.input),
		);
		private readonly _advancedSettingsContainer: HTMLDivElement = div({ class: "editor-right-widget-column", style: "margin: 0px 5px;" }, 
			div({ class: "editor-widgets" }, 
				div({ style: "text-align: center;" }, div({},"Advanced Settings")),
				div({ style: "margin: 2px 0; display: flex; flex-direction: row; align-items: center;" }, ),
				div({ class: "editor-menus" }, 
					div({ style: "margin: 5px 0; display: flex; flex-direction: row; justify-content: space-between;" }, 
						this._prevBarButton,
						this._undoButton,
						this._redoButton,
						this._nextBarButton,
					),
				),
				div({ class: "editor-settings" }, 
					this._advancedSongSettings,
					div({ class: "editor-instrument-settings" }, 
						this._advancedInstrumentSettingsGroup,
					),
				),
			),
		);
		public readonly mainLayer: HTMLDivElement = div({class: "beepboxEditor", tabIndex: "0"}, 
			this._editorBox,
			div({class: "editor-widget-column"}, 
				div({ style: "align-items: center; display: flex; justify-content: center;" }, div({},"NepBox 2.0"), this._archiveHint),
				div({ style: "margin: 5px 0; gap: 3px; display: flex; flex-direction: column; align-items: center;" }, 
					div({ style: "display:flex; flex-direction:row;" },
						SVG.svg( { width: "2em", height: "2em", viewBox: "0 0 26 26" }, 
							SVG.path({ d: "M 4 17 L 4 9 L 8 9 L 12 5 L 12 21 L 8 17 z", fill: ColorConfig.volumeIcon}),
							SVG.path({ d: "M 15 11 L 16 10 A 7.2 7.2 0 0 1 16 16 L 15 15 A 5.8 5.8 0 0 0 15 12 z", fill: ColorConfig.volumeIcon }),
							SVG.path({ d: "M 18 8 L 19 7 A 11.5 11.5 0 0 1 19 19 L 18 18 A 10.1 10.1 0 0 0 18 8 z", fill: ColorConfig.volumeIcon }),
						),
						this._volumeSlider,
					),
					div({ style: "display: flex; flex-direction: row; align-items: center; width:100%; gap: 3px;" }, 
						this._playButton,
						this._prevBarButton,
						this._nextBarButton,
					),
				),
				div({ class: "editor-widgets" }, 
					div({ class: "editor-menus" }, 
						div({class: "selectContainer menu"}, 
							this._fileMenu,
							// File icon:
							SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-5 -21 26 26"}, 
								SVG.path({d: "M 0 0 L 16 0 L 16 -13 L 10 -13 L 8 -16 L 0 -16 L 0 -13 z", fill: "currentColor"}),
							),
						),
						div({class: "selectContainer menu"}, 
							this._editMenu,
							// Edit icon:
							SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-5 -21 26 26"}, 
								SVG.path({d: "M 0 0 L 1 -4 L 4 -1 z M 2 -5 L 10 -13 L 13 -10 L 5 -2 zM 11 -14 L 13 -16 L 14 -16 L 16 -14 L 16 -13 L 14 -11 z", fill: "currentColor"}),
							),
						),
						div({class: "selectContainer menu"}, 
							this._optionsMenu,
							// Gear icon:
							SVG.svg( {style: "flex-shrink: 0; position: absolute; left: 0; top: 50%; margin-top: -1em; pointer-events: none;", width: "2em", height: "2em", viewBox: "-13 -13 26 26"}, 
								SVG.path({d: "M 5.78 -1.6 L 7.93 -0.94 L 7.93 0.94 L 5.78 1.6 L 4.85 3.53 L 5.68 5.61 L 4.21 6.78 L 2.36 5.52 L 0.27 5.99 L -0.85 7.94 L -2.68 7.52 L -2.84 5.28 L -4.52 3.95 L -6.73 4.28 L -7.55 2.59 L -5.9 1.07 L -5.9 -1.07 L -7.55 -2.59 L -6.73 -4.28 L -4.52 -3.95 L -2.84 -5.28 L -2.68 -7.52 L -0.85 -7.94 L 0.27 -5.99 L 2.36 -5.52 L 4.21 -6.78 L 5.68 -5.61 L 4.85 -3.53 M 2.92 0.67 L 2.92 -0.67 L 2.35 -1.87 L 1.3 -2.7 L 0 -3 L -1.3 -2.7 L -2.35 -1.87 L -2.92 -0.67 L -2.92 0.67 L -2.35 1.87 L -1.3 2.7 L -0 3 L 1.3 2.7 L 2.35 1.87 z", fill: "currentColor"}),
							),
						),
					),
					div({ class: "editor-settings" }, 
						div({ class: "editor-song-settings" }, 
							div({style: "margin: 3px 0; text-align: center; color: #999;"}, 
								div({},"Song Settings")
							),
							div({ class: "selectRow" }, span({}, div({},"Scale: ")), div({ class: "selectContainer", style: "margin: 3px 0; text-align: center; color: #ccc;" }, this._scaleSelect)),
							div({ class: "selectRow" }, span({}, div({},"Key: ")), div({ class: "selectContainer", style: "margin: 3px 0; text-align: center; color: #ccc;" }, this._keySelect)),
							div({ class: "selectRow" }, span({}, div({},"Tempo: ")), this._tempoSlider.input),
							div({ class: "selectRow" }, span({}, div({},"Reverb: ")), this._reverbSlider.input),
							div({ class: "selectRow" }, span({}, div({},"Rhythm: ")), div({ class: "selectContainer", style: "margin: 3px 0; text-align: center; color: #ccc;" }, this._partSelect)),
						),
						div({class: "editor-instrument-settings"}, 
							this._instrumentSettingsGroup,
						),
					),
				),
			),
			this._advancedSettingsContainer,
			this._promptContainer,
		);
		
		private _wasPlaying: boolean;
		private _changeTranspose: ChangeTranspose | null = null;
		private readonly _operatorRows: HTMLDivElement[] = []
		private readonly _operatorAmplitudeSliders: Slider[] = []
		private readonly _operatorEnvelopeSelects: HTMLSelectElement[] = []
		private readonly _operatorFrequencySelects: HTMLSelectElement[] = []
		
		constructor(private _doc: SongDocument) {
			this._doc.notifier.watch(this.whenUpdated);
			
			this._phaseModGroup.appendChild(div({class: "operatorRow", style: "height: 1em; margin-top: 0.5em;"}, 
				div({style: "margin-right: .1em; visibility: hidden;"}, div({},1 + ".")),
				div({style: "width: 3em; margin-right: .3em;"}, div({},"Freq:")),
				div({style: "width: 4em; margin: 0;"}, div({},"Volume:")),
				div({style: "width: 5em; margin-left: .3em;"}, div({},"Envelope:")),
			));
			for (let i = 0; i < Config.operatorCount; i++) {
				const operatorIndex: number = i;
				const operatorNumber: HTMLDivElement = div({style: "margin-right: .1em; color: #999;"}, div({},i + 1 + "."));
				const frequencySelect: HTMLSelectElement = buildOptions(select({style: "width: 100%;", title: "Frequency"}), Config.operatorFrequencyNames);
				const amplitudeSlider: Slider = new Slider(input({style: "margin: 0; width: 4em;", type: "range", min: "0", max: Config.operatorAmplitudeMax, value: "0", step: "1", title: "Volume"}), this._doc, (oldValue: number, newValue: number) => new ChangeOperatorAmplitude(this._doc, operatorIndex, oldValue, newValue));
				const envelopeSelect: HTMLSelectElement = buildOptions(select({style: "width: 100%;", title: "Envelope"}), Config.operatorEnvelopeNames);
				const row = div({class: "operatorRow"}, 
					operatorNumber,
					div({class: "selectContainer", style: "width: 3em; margin-right: .3em;"}, frequencySelect),
					amplitudeSlider.input,
					div({class: "selectContainer", style: "width: 5em; margin-left: .3em;"}, envelopeSelect),
				);
				this._phaseModGroup.appendChild(row);
				this._operatorRows[i] = row;
				this._operatorAmplitudeSliders[i] = amplitudeSlider;
				this._operatorEnvelopeSelects[i] = envelopeSelect;
				this._operatorFrequencySelects[i] = frequencySelect;
				
				envelopeSelect.addEventListener("change", () => {
					this._doc.record(new ChangeOperatorEnvelope(this._doc, operatorIndex, envelopeSelect.selectedIndex));
				});
				frequencySelect.addEventListener("change", () => {
					this._doc.record(new ChangeOperatorFrequency(this._doc, operatorIndex, frequencySelect.selectedIndex));
				});
			}
			
			this._fileMenu.addEventListener("change", this._fileMenuHandler);
			this._editMenu.addEventListener("change", this._editMenuHandler);
			this._optionsMenu.addEventListener("change", this._optionsMenuHandler);
			this._themeSelect.addEventListener("change", this._whenSetTheme);
			this._scaleSelect.addEventListener("change", this._whenSetScale);
			this._mixSelect.addEventListener("change", this._whenSetMix);
			this._sampleRateSelect.addEventListener("change", this._whenSetSampleRate);
			this._keySelect.addEventListener("change", this._whenSetKey);
			this._partSelect.addEventListener("change", this._whenSetPartsPerBeat);
			this._instrumentTypeSelect.addEventListener("change", this._whenSetInstrumentType);
			this._algorithmSelect.addEventListener("change", this._whenSetAlgorithm);
			this._instrumentSelect.addEventListener("change", this._whenSetInstrument);
			this._feedbackTypeSelect.addEventListener("change", this._whenSetFeedbackType);
			this._feedbackEnvelopeSelect.addEventListener("change", this._whenSetFeedbackEnvelope);
			this._waveSelect.addEventListener("change", this._whenSetWave);
			this._drumSelect.addEventListener("change", this._whenSetDrum);
			this._pwmwaveSelect.addEventListener("change", this._whenSetPWMWave);
			this._transitionSelect.addEventListener("change", this._whenSetTransition);
			this._filterSelect.addEventListener("change", this._whenSetFilter);
			this._chorusSelect.addEventListener("change", this._whenSetChorus);
			this._effectSelect.addEventListener("change", this._whenSetEffect);
			this._harmSelect.addEventListener("change", this._whenSetHarm);
			this._octoffSelect.addEventListener("change", this._whenSetOctoff);
			this._fmChorusSelect.addEventListener("change", this._whenSetFMChorus);
			this._imuteButton.addEventListener("click", this._muteInstrument);
			this._iMmuteButton.addEventListener("click", this._muteInstrument);
			this._playButton.addEventListener("click", this._togglePlay);
			this._prevBarButton.addEventListener("click", this._whenPrevBarPressed);
			this._nextBarButton.addEventListener("click", this._whenNextBarPressed);
			this._newSongButton.addEventListener("click", this._whenNewSongPressed);
			this._songDataButton.addEventListener("click", this._openSongDataPrompt);
			this._customizeButton.addEventListener("click", this._whenCustomizePressed);
			this._undoButton.addEventListener("click", this._advancedUndo);
			this._redoButton.addEventListener("click", this._advancedRedo);
			this._exportButton.addEventListener("click", this._openExportPrompt);
			this._archiveButton.addEventListener("click", this._openArchivePrompt);
			this._volumeSlider.addEventListener("input", this._setVolumeSlider);
			// this._chipHint.addEventListener("click", this._openChipPrompt);
			this._instrumentTypeHint.addEventListener("click", this._openInstrumentTypePrompt);
			this._mixHint.addEventListener("click", this._openMixPrompt);
			this._chorusHint.addEventListener("click", this._openChorusPrompt);
			this._archiveHint.addEventListener("click", this._openArchivePrompt);
			
			this._editorBox.addEventListener("mousedown", this._refocusStage);
			this.mainLayer.addEventListener("keydown", this._whenKeyPressed);
			
			if (isMobile) (<HTMLOptionElement> this._optionsMenu.children[1]).disabled = true;
		}
		
		private _openPrompt(promptName: string): void {
			this._doc.openPrompt(promptName);
			this._setPrompt(promptName);
		}
		
		private _setPrompt(promptName: string | null): void {
			if (this.prompt) {
				if (this._wasPlaying) this._play();
				this._wasPlaying = false;
				this._promptContainer.style.display = "none";
				this._promptContainer.removeChild(this.prompt.container);
				this.prompt.cleanUp();
				this.prompt = null;
				this.mainLayer.focus();
			}
			
			if (promptName) {
				switch (promptName) {
					case "export":
						this.prompt = new ExportPrompt(this._doc);
						break;
					case "import":
						this.prompt = new ImportPrompt(this._doc);
						break;
					case "duration":
						this.prompt = new SongDurationPrompt(this._doc);
						break;
					case "archive":
						this.prompt = new ArchivePrompt(this._doc);
						break;
					case "instrumentType":
						this.prompt = new InstrumentTypePrompt(this._doc);
						break;
					// case "chipPrompt":
					// 	this.prompt = new ChipPrompt(this._doc, this);
					// 	break;
					case "mix":
						this.prompt = new MixPrompt(this._doc);
						break;
					case "chorus":
						this.prompt = new ChorusPrompt(this._doc);
						break;
					case "songdata":
						this.prompt = new SongDataPrompt(this._doc);
						break;
					case "refresh":
						this.prompt = new RefreshPrompt(this._doc, this, this._themeSelect.selectedIndex);
						break;
					case "refresh key":
						this.prompt = new RefreshKeyPrompt(this._doc, this, this._keySelect.selectedIndex);
						break;
					case "archive":
						this.prompt = new ArchivePrompt(this._doc);
						break;
					case "manual":
						this.prompt = new ManualPrompt(this._doc);
						break;	
					case "themes":
						this.prompt = new ThemePrompt(this._doc);
						break;	
					default:
						throw new Error("Unrecognized prompt type.");
				}
				
				if (this.prompt) {
					this._wasPlaying = this._doc.synth.playing;
					this._pause();
					this._promptContainer.style.display = "";
					this._promptContainer.appendChild(this.prompt.container);
				}
			}
		}
		
		private _refocusStage = (): void => {
			this.mainLayer.focus();
		}
		
		public whenUpdated = (): void => {
			const trackBounds = this._trackContainer.getBoundingClientRect();
			this._doc.trackVisibleBars = Math.floor((trackBounds.right - trackBounds.left) / 32);
			this._barScrollBar.render();
			this._trackEditor.render();
			this._patternEditor.render();

			const optionCommands: ReadonlyArray<string> = [
				(this._doc.autoPlay ? "✓ " : "✗ ") + "Auto Play On Load",
				(this._doc.autoFollow ? "✓ " : "✗ ") + "Auto Follow Track",
				(this._doc.showLetters ? "✓ " : "✗ ") + "Show Piano",
				(this._doc.showFifth ? "✓ " : "✗ ") + "Highlight 'Fifth' Notes",
				(this._doc.showMore ? "✓ " : "✗ ") + "Advanced Color Scheme",
				(this._doc.showChannels ? "✓ " : "✗ ") + "Show All Channels",
				(this._doc.showScrollBar ? "✓ " : "✗ ") + "Octave Scroll Bar",
				(this._doc.showVolumeBar ? "✓ " : "✗ ") + "Show Channel Volume",
				(this._doc.advancedSettings ? "✓ " : "✗ ") + "Enable Advanced Settings",
				"  Set Theme...",
			]
			for (let i: number = 0; i < optionCommands.length; i++) {
				const option: HTMLOptionElement = <HTMLOptionElement> this._optionsMenu.children[i + 1];
				if (option.innerText != optionCommands[i]) option.innerText = optionCommands[i];
			}
			
			const channel: Channel = this._doc.song.channels[this._doc.channel];
			const pattern: Pattern | null = this._doc.getCurrentPattern();
			const instrumentIndex: number = this._doc.getCurrentInstrument();
			const instrument: Instrument = channel.instruments[instrumentIndex];
			const wasActive: boolean = this.mainLayer.contains(document.activeElement);
			let activeElement: Element = document.activeElement ? document.activeElement : document.activeElement!;

			
			setSelectedIndex(this._themeSelect, this._doc.song.theme);
			setSelectedIndex(this._scaleSelect, this._doc.song.scale);
			setSelectedIndex(this._mixSelect, this._doc.song.mix);
			setSelectedIndex(this._sampleRateSelect, this._doc.song.sampleRate);
			setSelectedIndex(this._keySelect, this._doc.song.key);
			this._tempoSlider.updateValue(this._doc.song.tempo);
			this._tempoSlider.input.title = this._doc.song.getBeatsPerMinute() + " beats per minute";
			this._reverbSlider.updateValue(this._doc.song.reverb);
			this._advancedSettingsContainer.style.display = this._doc.advancedSettings ? "" : "none";
			this._blendSlider.updateValue(this._doc.song.blend);
			this._riffSlider.updateValue(this._doc.song.riff);
			this._detuneSlider.updateValue(this._doc.song.detune);
			this._muffSlider.updateValue(this._doc.song.muff);
			setSelectedIndex(this._partSelect, Config.partCounts.indexOf(this._doc.song.partsPerBeat));
			if (this._doc.song.getChannelIsDrum(this._doc.channel)) {
				if (this._doc.song.mix == 2) {
					this._instrumentVolumeSliderRow.style.display = "";
					this._instrumentMVolumeSliderRow.style.display = "none";
				} else {
					this._instrumentVolumeSliderRow.style.display = "none";
					this._instrumentMVolumeSliderRow.style.display = "";
				}
				this._drumSelect.style.display = "";
				this._waveSelectRow.style.display = "";
				this._instrumentTypeSelectRow.style.display = "none";
				this._instrumentTypeSelect.style.display = "none";
				this._algorithmSelectRow.style.display = "none";
				this._phaseModGroup.style.display = "none";
				this._feedbackRow1.style.display = "none";
				this._feedbackRow2.style.display = "none";
				this._waveSelect.style.display = "none";
				this._pwmwaveSelect.style.display = "none";
				this._filterSelectRow.style.display = "none";
				this._chorusSelectRow.style.display = "none";
				this._effectSelectRow.style.display = "none";
				this._ipanSliderRow.style.display = "";
				this._harmSelectRow.style.display = "";
				this._octoffSelectRow.style.display = "";
				this._fmChorusSelectRow.style.display = "none";
			} else {
				this._instrumentTypeSelectRow.style.display = "";
				this._instrumentTypeSelect.style.display = "";
				this._effectSelectRow.style.display = "";
				if (this._doc.song.mix == 2) {
					this._instrumentVolumeSliderRow.style.display = "";
					this._instrumentMVolumeSliderRow.style.display = "none";
				} else {
					this._instrumentVolumeSliderRow.style.display = "none";
					this._instrumentMVolumeSliderRow.style.display = "";
				}
				this._drumSelect.style.display = "none";
				
				if (instrument.type == InstrumentType.chip) {
					this._waveSelect.style.display = "";
					this._pwmwaveSelect.style.display = "none";
					this._waveSelectRow.style.display = "";
					this._filterSelectRow.style.display = "";
					this._chorusSelectRow.style.display = "";
					this._harmSelectRow.style.display = "";
					this._algorithmSelectRow.style.display = "none";
					this._phaseModGroup.style.display = "none";
					this._feedbackRow1.style.display = "none";
					this._feedbackRow2.style.display = "none";
					this._ipanSliderRow.style.display = "";
					this._octoffSelectRow.style.display = "";
					this._fmChorusSelectRow.style.display = "none";
				} else if (instrument.type == InstrumentType.pwm) {
					this._waveSelect.style.display = "none";
					this._pwmwaveSelect.style.display = "";
					this._waveSelectRow.style.display = "";
					this._filterSelectRow.style.display = "none"; // @TODO: Unhide?
					this._chorusSelectRow.style.display = "none"; // @TODO: Unhide?
					this._harmSelectRow.style.display = "none";
					this._algorithmSelectRow.style.display = "none";
					this._phaseModGroup.style.display = "none";
					this._feedbackRow1.style.display = "none";
					this._feedbackRow2.style.display = "none";
					this._ipanSliderRow.style.display = "";
					this._octoffSelectRow.style.display = "";
					this._fmChorusSelectRow.style.display = "none";
				} else {
					this._algorithmSelectRow.style.display = "";
					this._phaseModGroup.style.display = "";
					this._feedbackRow1.style.display = "";
					this._feedbackRow2.style.display = "";
					this._harmSelectRow.style.display = "none";
					this._waveSelectRow.style.display = "none";
					this._filterSelectRow.style.display = "none";
					this._chorusSelectRow.style.display = "none";
					this._ipanSliderRow.style.display = "";
					this._octoffSelectRow.style.display = "";
					this._fmChorusSelectRow.style.display = "";
				}
			}
			
			this._instrumentTypeSelect.value = instrument.type + "";
			setSelectedIndex(this._algorithmSelect, instrument.algorithm);
			
			this._instrumentSelectRow.style.display = (this._doc.song.instrumentsPerChannel > 1) ? "" : "none";
			this._instrumentSelectRow.style.visibility = (pattern == null) ? "hidden" : "";
			if (this._instrumentSelect.children.length != this._doc.song.instrumentsPerChannel) {
				while (this._instrumentSelect.firstChild) this._instrumentSelect.removeChild(this._instrumentSelect.firstChild);
				const instrumentList: number[] = [];
				for (let i: number = 0; i < this._doc.song.instrumentsPerChannel; i++) {
					instrumentList.push(i + 1);
				}
				buildOptions(this._instrumentSelect, instrumentList);
			}
			
			if (instrument.imute == 0) {
				this._instrumentSettingsGroup.style.color = this._doc.song.getNoteColorBright(this._doc.channel);
				this._advancedInstrumentSettingsGroup.style.color = this._doc.song.getNoteColorDim(this._doc.channel);
				this._advancedSongSettings.style.color = "#aaaaaa";
				this._imuteButton.innerText = "◉";
				this._iMmuteButton.innerText = "◉";
			} else {
				this._instrumentSettingsGroup.style.color = "#cccccc";
				this._advancedInstrumentSettingsGroup.style.color = "#aaaaaa";
				this._advancedSongSettings.style.color = "#aaaaaa";
				this._imuteButton.innerText = "◎";
				this._iMmuteButton.innerText = "◎";
			}
			
			setSelectedIndex(this._waveSelect, instrument.wave);
			setSelectedIndex(this._drumSelect, instrument.wave);
			setSelectedIndex(this._pwmwaveSelect, instrument.wave);
			setSelectedIndex(this._filterSelect, instrument.filter);
			setSelectedIndex(this._transitionSelect, instrument.transition);
			setSelectedIndex(this._effectSelect, instrument.effect);
			setSelectedIndex(this._chorusSelect, instrument.chorus);
			setSelectedIndex(this._harmSelect, instrument.harm);
			setSelectedIndex(this._octoffSelect, instrument.octoff);
			setSelectedIndex(this._fmChorusSelect, instrument.fmChorus);
			setSelectedIndex(this._feedbackTypeSelect, instrument.feedbackType);
			this._feedbackAmplitudeSlider.updateValue(instrument.feedbackAmplitude);
			setSelectedIndex(this._feedbackEnvelopeSelect, instrument.feedbackEnvelope);
			this._feedbackEnvelopeSelect.parentElement!.style.color = (instrument.feedbackAmplitude > 0) ? "" : "#999";
			this._instrumentVolumeSlider.updateValue(-instrument.volume);
			this._instrumentMVolumeSlider.updateValue(-instrument.volume);
			this._ipanSlider.updateValue(-instrument.ipan);
			setSelectedIndex(this._instrumentSelect, instrumentIndex);
			for (let i: number = 0; i < Config.operatorCount; i++) {
				const isCarrier: boolean = (i < Config.operatorCarrierCounts[instrument.algorithm]);
				this._operatorRows[i].style.color = isCarrier ? "white" : "";
				setSelectedIndex(this._operatorFrequencySelects[i], instrument.operators[i].frequency);
				this._operatorAmplitudeSliders[i].updateValue(instrument.operators[i].amplitude);
				setSelectedIndex(this._operatorEnvelopeSelects[i], instrument.operators[i].envelope);
				const operatorName: string = (isCarrier ? "Voice " : "Modulator ") + (i + 1);
				this._operatorFrequencySelects[i].title = operatorName + " Frequency";
				this._operatorAmplitudeSliders[i].input.title = operatorName + (isCarrier ? " Volume" : " Amplitude");
				this._operatorEnvelopeSelects[i].title = operatorName + " Envelope";
				this._operatorEnvelopeSelects[i].parentElement!.style.color = (instrument.operators[i].amplitude > 0) ? "" : "#999";
			}
			
			this._piano.container.style.display = this._doc.showLetters ? "" : "none";
			this._octaveScrollBar.container.style.display = this._doc.showScrollBar ? "" : "none";
			this._barScrollBar.container.style.display = this._doc.song.barCount > this._doc.trackVisibleBars ? "" : "none";
			// this._chipHint.style.display = (instrument.type == InstrumentType.fm) ? "none" : "";
			this._instrumentTypeHint.style.display = (instrument.type == InstrumentType.fm) ? "" : "none";
			this._mixHint.style.display = (this._doc.song.mix != 1) ? "" : "none";
			this._chorusHint.style.display = (Config.harmNames[instrument.harm]) ? "" : "none";
			
			let patternWidth: number = 512;
			if (this._doc.showLetters) patternWidth -= 32;
			if (this._doc.showScrollBar) patternWidth -= 20;
			this._patternEditor.container.style.width = String(patternWidth) + "px";
			
			this._volumeSlider.value = String(this._doc.volume);
			
			// If an interface element was selected, but becomes invisible (e.g. an instrument
			// select menu) just select the editor container so keyboard commands still work.
			if (wasActive && (activeElement.clientWidth == 0)) {
				this._refocusStage();
			}
			
			this._setPrompt(this._doc.prompt);
			
			if (this._doc.autoFollow && !this._doc.synth.playing) {
				this._doc.synth.snapToBar(this._doc.bar);
			}
		}

		private _muteInstrument = (): void => {
			const channel: Channel = this._doc.song.channels[this._doc.channel];
			const instrumentIndex: number = this._doc.getCurrentInstrument();
			const instrument: Instrument = channel.instruments[instrumentIndex];
			const oldValue: number = instrument.imute;
			const isMuted: boolean = oldValue == 1;
			const newValue: number = isMuted ? 0 : 1;
			this._doc.record(new ChangeImute(this._doc, newValue));
			if (instrument.imute == 0) {
				this._instrumentSettingsGroup.style.color = this._doc.song.getNoteColorBright(this._doc.channel);
				this._advancedInstrumentSettingsGroup.style.color = this._doc.song.getNoteColorDim(this._doc.channel);
				this._advancedSongSettings.style.color = "#aaaaaa";
				this._imuteButton.innerText = "◉";
				this._iMmuteButton.innerText = "◉";
			} else {
				this._instrumentSettingsGroup.style.color = "#cccccc";
				this._advancedInstrumentSettingsGroup.style.color = "#aaaaaa";
				this._advancedSongSettings.style.color = "#aaaaaa";
				this._imuteButton.innerText = "◎";
				this._iMmuteButton.innerText = "◎";
			}
			this.whenUpdated();
		}
		
		public updatePlayButton(): void {
			if (this._doc.synth.playing) {
				this._playButton.classList.remove("playButton");
				this._playButton.classList.add("pauseButton");
				this._playButton.title = "Pause (Space)";
				this._playButton.innerText = "Pause";
			} else {
				this._playButton.classList.remove("pauseButton");
				this._playButton.classList.add("playButton");
				this._playButton.title = "Play (Space)";
				this._playButton.innerText = "Play";
			}
		}
		
		private _whenKeyPressed = (event: KeyboardEvent): void => {
			if (this.prompt) {
				if (event.keyCode == 27) { // ESC key
					// close prompt.
					window.history.back();
				}
				return;
			}
			//if (event.ctrlKey)
			//trace(event.keyCode)
			switch (event.keyCode) {
				case 8:
					if (event.ctrlKey) {
						this._doc.record(new ChangeRemoveChannel(this._doc, this._doc.channel, this._doc.channel));
					} else {
						this._doc.record(new ChangeDeleteBars(this._doc, this._doc.bar, 1));
					}
					
					event.preventDefault();
					break;
				case 13: // enter
					if (event.ctrlKey) {
						this._doc.record(new ChangeAddChannel(this._doc, this._doc.channel+1, this._doc.song.getChannelIsDrum(this._doc.channel)));
						this._doc.channel = this._doc.channel + 1;
					} else {
						this._doc.record(new ChangeInsertBars(this._doc, this._doc.bar+1, 1)); }
					event.preventDefault();
					break;
				case 38: // up
					this._trackEditor._setChannelBar((this._doc.channel - 1 + this._doc.song.getChannelCount()) % this._doc.song.getChannelCount(), this._doc.bar);
					event.preventDefault();
					break;
				case 40: // down
				this._trackEditor._setChannelBar((this._doc.channel + 1) % this._doc.song.getChannelCount(), this._doc.bar);
					event.preventDefault();
					break;
				case 37: // left
				this._trackEditor._setChannelBar(this._doc.channel, (this._doc.bar + this._doc.song.barCount - 1) % this._doc.song.barCount);
					event.preventDefault();
					break;
				case 39: // right
				this._trackEditor._setChannelBar(this._doc.channel, (this._doc.bar + 1) % this._doc.song.barCount);
					event.preventDefault();
					break;
				case 48: // 0
				this._trackEditor._nextDigit("0");
					event.preventDefault();
					break;
				case 49: // 1
				this._trackEditor._nextDigit("1");
					event.preventDefault();
					break;
				case 50: // 2
				this._trackEditor._nextDigit("2");
					event.preventDefault();
					break;
				case 51: // 3
				this._trackEditor._nextDigit("3");
					event.preventDefault();
					break;
				case 52: // 4
				this._trackEditor._nextDigit("4");
					event.preventDefault();
					break;
				case 53: // 5
				this._trackEditor._nextDigit("5");
					event.preventDefault();
					break;
				case 54: // 6
				this._trackEditor._nextDigit("6");
					event.preventDefault();
					break;
				case 55: // 7
				this._trackEditor._nextDigit("7");
					event.preventDefault();
					break;
				case 56: // 8
				this._trackEditor._nextDigit("8");
					event.preventDefault();
					break;
				case 57: // 9
				this._trackEditor._nextDigit("9");
					event.preventDefault();
					break;
				default:
				this._trackEditor._digits = "";
					break;

				case 77: // m
					this._muteInstrument();
					event.preventDefault();
					break;
				case 32: // space
					//stage.focus = stage;
					this._togglePlay();
					event.preventDefault();
					break;
				case 90: // z
					if (event.shiftKey) {
						this._doc.redo();
					} else {
						this._doc.undo();
					}
					event.preventDefault();
					break;
				case 89: // y
					this._doc.redo();
					event.preventDefault();
					break;
				case 88: // x
					this._cut();
					event.preventDefault();
					break;
				case 67: // c
					this._copy();
					event.preventDefault();
					break;
				case 70: // f
				if (event.shiftKey) {
					this._doc.synth.snapToBar(this._doc.song.loopStart);
				} else {
					this._doc.synth.snapToStart();
				}
					event.preventDefault();
					break;
				case 86: // v
					this._paste();
					event.preventDefault();
					break;
				case 219: // left brace
					this._doc.synth.prevBar();
					if (this._doc.autoFollow) {
						new ChangeChannelBar(this._doc, this._doc.channel, Math.floor(this._doc.synth.playhead));
					}
					event.preventDefault();
					break;
				case 221: // right brace
					this._doc.synth.nextBar();
					if (this._doc.autoFollow) {
						new ChangeChannelBar(this._doc, this._doc.channel, Math.floor(this._doc.synth.playhead));
					}
					event.preventDefault();
					break;
				case 189: // -
				case 173: // Firefox -
					this._transpose(false);
					event.preventDefault();
					break;
				case 187: // +
				case 61: // Firefox +
					this._transpose(true);
					event.preventDefault();
					break;
				case 81: // q
					this._openPrompt("duration");
					event.preventDefault();
					break;
			}
		}
		
		private _whenPrevBarPressed = (): void => {
			this._doc.synth.prevBar();
		}
		
		private _whenNextBarPressed = (): void => {
			this._doc.synth.nextBar();
		}
		
		private _togglePlay = (): void => {
			if (this._doc.synth.playing) {
				this._pause();
			} else {
				this._play();
			}
		}
		
		private _play(): void {
			this._doc.synth.play();
			this.updatePlayButton();
		}
		
		private _pause(): void {
			this._doc.synth.pause();
			if (this._doc.autoFollow) {
				this._doc.synth.snapToBar(this._doc.bar);
			} else {
				this._doc.synth.snapToBar();
			}
			this.updatePlayButton();
		}
		
		private _setVolumeSlider = (): void => {
			this._doc.setVolume(Number(this._volumeSlider.value));
			this._trackEditor.render();
		}

		private _cut(): void {
			const pattern: Pattern | null = this._doc.getCurrentPattern();
			if (pattern == null) return;
			window.localStorage.setItem("patternCopy", JSON.stringify({
				notes: pattern.notes,
				beatsPerBar: this._doc.song.beatsPerBar,
				partsPerBeat: this._doc.song.partsPerBeat,
				drums: this._doc.song.getChannelIsDrum(this._doc.channel),
			}));
			this._doc.record(new ChangePaste(this._doc, pattern, [], this._doc.song.beatsPerBar, this._doc.song.partsPerBeat));
		}
		
		private _copy(): void {
			const pattern: Pattern | null = this._doc.getCurrentPattern();
			let notes: Note[] = [];
			if (pattern != null) notes = pattern.notes;
			
			const patternCopy: PatternCopy = {
				notes: notes,
				beatsPerBar: this._doc.song.beatsPerBar,
				partsPerBeat: this._doc.song.partsPerBeat,
				drums: this._doc.song.getChannelIsDrum(this._doc.channel),
			};
			
			window.localStorage.setItem("patternCopy", JSON.stringify(patternCopy));
		}
		
		private _paste(): void {
			const patternCopy: PatternCopy | null = JSON.parse(String(window.localStorage.getItem("patternCopy")));
			if (patternCopy != null && patternCopy.drums == this._doc.song.getChannelIsDrum(this._doc.channel)) {
				new ChangeEnsurePatternExists(this._doc);
				const pattern: Pattern | null = this._doc.getCurrentPattern();
				if (pattern == null) throw new Error();
				this._doc.record(new ChangePaste(this._doc, pattern, patternCopy.notes, patternCopy.beatsPerBar, patternCopy.partsPerBeat));
			}
		}
		
		private _transpose(upward: boolean): void {
			const pattern: Pattern | null = this._doc.getCurrentPattern();
			if (pattern == null) return;
			
			const canReplaceLastChange: boolean = this._doc.lastChangeWas(this._changeTranspose);
			this._changeTranspose = new ChangeTranspose(this._doc, pattern, upward);
			this._doc.record(this._changeTranspose, canReplaceLastChange);
		}
		
		private _whenNewSongPressed = (): void => {
			this._doc.record(new ChangeSong(this._doc, ""));
			this._patternEditor.resetCopiedPins();
		}

		private _whenCustomizePressed = (): void => {
			this._openPrompt("duration");
		}

		private _advancedUndo = (): void => {
			this._doc.undo();
		}

		private _advancedRedo = (): void => {
			this._doc.redo();
		}
		
		private _openExportPrompt = (): void => {
			this._openPrompt("export");
		}
		
		private _openSongDataPrompt = (): void => {
			this._openPrompt("songdata");
		}
		
		private _openInstrumentTypePrompt = (): void => {
			this._openPrompt("instrumentType");
		}
		
		// private _openChipPrompt = (): void => {
		// 	this._openPrompt("chipPrompt");
		// }
		
		private _openMixPrompt = (): void => {
			this._openPrompt("mix");
		}
		
		private _openChorusPrompt = (): void => {
			this._openPrompt("chorus");
		}
		
		private _openArchivePrompt = (): void => {
			this._openPrompt("archive");
		}

		public refreshNow = (): void => {
			setTimeout(() => { // Prompts seem to get stuck if reloading is done too quickly.
				location.reload();
			}, 500);
		}
		
		private _whenSetTheme = (): void => {
			this._openPrompt("refresh");
		}
		
		private _whenSetScale = (): void => {
			this._doc.record(new ChangeScale(this._doc, this._scaleSelect.selectedIndex));
		}
		
		private _whenSetMix = (): void => {
			this._doc.record(new ChangeMix(this._doc, this._mixSelect.selectedIndex));
		}
		
		private _whenSetSampleRate = (): void => {
			this._doc.record(new ChangeSampleRate(this._doc, this._sampleRateSelect.selectedIndex));
		}
		
		private _whenSetKey = (): void => {
			if (this._doc.song.theme == 19) {
				this._openPrompt("refresh key");
			} else {
				this._doc.record(new ChangeKey(this._doc, this._keySelect.selectedIndex));
			}
		}
		
		private _whenSetPartsPerBeat = (): void => {
			this._doc.record(new ChangePartsPerBeat(this._doc, Config.partCounts[this._partSelect.selectedIndex]));
		}
		
		private _whenSetInstrumentType = (): void => {
			this._doc.record(new ChangeInstrumentType(this._doc, +this._instrumentTypeSelect.value));
		}
		
		private _whenSetFeedbackType = (): void => {
			this._doc.record(new ChangeFeedbackType(this._doc, this._feedbackTypeSelect.selectedIndex));
		}
		
		private _whenSetFeedbackEnvelope = (): void => {
			this._doc.record(new ChangeFeedbackEnvelope(this._doc, this._feedbackEnvelopeSelect.selectedIndex));
		}
		
		private _whenSetAlgorithm = (): void => {
			this._doc.record(new ChangeAlgorithm(this._doc, this._algorithmSelect.selectedIndex));
		}
		
		private _whenSetInstrument = (): void => {
			const pattern : Pattern | null = this._doc.getCurrentPattern();
			if (pattern == null) return;
			this._doc.record(new ChangePatternInstrument(this._doc, this._instrumentSelect.selectedIndex, pattern));
		}
		
		private _whenSetWave = (): void => {
			this._doc.record(new ChangeWave(this._doc, this._waveSelect.selectedIndex));
		}
		
		private _whenSetDrum = (): void => {
			this._doc.record(new ChangeWave(this._doc, this._drumSelect.selectedIndex));
		}
		
		private _whenSetPWMWave = (): void => {
			this._doc.record(new ChangeWave(this._doc, this._pwmwaveSelect.selectedIndex));
		}
		
		private _whenSetFilter = (): void => {
			this._doc.record(new ChangeFilter(this._doc, this._filterSelect.selectedIndex));
		}
		
		private _whenSetTransition = (): void => {
			this._doc.record(new ChangeTransition(this._doc, this._transitionSelect.selectedIndex));
		}
		
		private _whenSetEffect = (): void => {
			this._doc.record(new ChangeEffect(this._doc, this._effectSelect.selectedIndex));
		}
		
		private _whenSetHarm = (): void => {
			this._doc.record(new ChangeHarm(this._doc, this._harmSelect.selectedIndex));
		}

		private _whenSetFMChorus = (): void => {
			this._doc.record(new ChangeFMChorus(this._doc, this._fmChorusSelect.selectedIndex));
		}
		
		private _whenSetOctoff = (): void => {
			this._doc.record(new ChangeOctoff(this._doc, this._octoffSelect.selectedIndex));
		}
		
		private _whenSetChorus = (): void => {
			this._doc.record(new ChangeChorus(this._doc, this._chorusSelect.selectedIndex));
		}
		
		private _fileMenuHandler = (event:Event): void => {
			switch (this._fileMenu.value) {
				case "import":
					this._openPrompt("import");
					break;
				case "export":
					this._openPrompt("export");
					break;	
				case "cleanS":
					this._whenNewSongPressed();
					break;
				case "songdata":
					this._openPrompt("songdata");
					break;
				case "manual":
					this._openPrompt("manual");
					break;
			}
			this._fileMenu.selectedIndex = 0;
		}

		private _editMenuHandler = (event:Event): void => {
			switch (this._editMenu.value) {
				case "undo":
					this._doc.undo();
					break;
				case "redo":
					this._doc.redo();
					break;
				case "cut":
					this._cut();
					break;
				case "copy":
					this._copy();
					break;
				case "paste":
					this._paste();
					break;
				case "transposeUp":
					this._transpose(true);
					break;
				case "transposeDown":
					this._transpose(false);
					break;
				case "duration":
					this._openPrompt("duration");
					break;
				case "archive":
					this._openPrompt("archive");
					break;
			}
			this._editMenu.selectedIndex = 0;
		}
		
		private _optionsMenuHandler = (event:Event): void => {
			switch (this._optionsMenu.value) {
				case "autoPlay":
					this._doc.autoPlay = !this._doc.autoPlay;
					break;
				case "autoFollow":
					this._doc.autoFollow = !this._doc.autoFollow;
					break;
				case "showLetters":
					this._doc.showLetters = !this._doc.showLetters;
					break;
				case "showFifth":
					this._doc.showFifth = !this._doc.showFifth;
					break;
				case "showMore":
					this._doc.showMore = !this._doc.showMore;
					break;
				case "showChannels":
					this._doc.showChannels = !this._doc.showChannels;
					break;
				case "showScrollBar":
					this._doc.showScrollBar = !this._doc.showScrollBar;
					break;
				case "showVolumeBar":
					this._doc.showVolumeBar = !this._doc.showVolumeBar;
					break;
				case "advancedSettings":
					this._doc.advancedSettings = !this._doc.advancedSettings;
					break;
				case "themes":
					this._openPrompt("themes");
					break;	
			}
			this._optionsMenu.selectedIndex = 0;
			this._doc.notifier.changed();
			this._doc.savePreferences();
		}
	}
	
