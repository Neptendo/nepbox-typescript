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

import { HTML} from "imperative-html/dist/esm/elements-strict";
import { Prompt } from "./Prompt";
import { SongDocument } from "./SongDocument";
import { Synth } from "../synth/synth";
	const {button, div, input} = HTML;

	// function lerp(low: number, high: number, t: number): number {
	// 	return low + t * (high - low);
	// }
	
	function save(blob: Blob, name: string): void {
		if ((<any>navigator).msSaveOrOpenBlob) {
			(<any>navigator).msSaveOrOpenBlob(blob, name);
			return;
		}
	
		const anchor: HTMLAnchorElement = document.createElement("a");
		if (anchor.download != undefined) {
			const url: string = URL.createObjectURL(blob);
			setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
			anchor.href = url;
			anchor.download = name;
			// Chrome bug regression: We need to delay dispatching the click
			// event. Seems to be related to going back in the browser history.
			// https://bugs.chromium.org/p/chromium/issues/detail?id=825100
			setTimeout(function() { anchor.dispatchEvent(new MouseEvent("click")); }, 0);
		} else {
			const url: string = URL.createObjectURL(blob);
			setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
			if (!window.open(url, "_blank")) window.location.href = url;
		}
	}

	export class ExportPrompt implements Prompt {
		private readonly _fileName: HTMLInputElement = input({type: "text", style: "width: 10em;", value: "Modbox-Song", maxlength: 250});
		private readonly _enableIntro: HTMLInputElement = input({type: "checkbox"});
		private readonly _loopDropDown: HTMLInputElement = input({style:"width: 2em;", type: "number", min: "1", max: "4", step: "1"});
		private readonly _enableOutro: HTMLInputElement = input({type: "checkbox"});
		private readonly _exportWavButton: HTMLButtonElement = button({}, [div("Export to .wav file")]);
		private readonly _exportJsonButton: HTMLButtonElement = button({}, [div("Export to .json file")]);
		private readonly _cancelButton: HTMLButtonElement = button({}, [div("Cancel")]);
		
		public readonly container: HTMLDivElement = div({class: "prompt", style: "width: 200px;"}, [
			div({style: "font-size: 2em"}, [div("Export Options")]),
			div({style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between;"}, [
				div("File name:"),
				this._fileName,
			]),
			div({style: "display: table; width: 100%;"}, [
				div({style: "display: table-row;"}, [
					div({style: "display: table-cell;"}, [div("Intro:")]),
					div({style: "display: table-cell;"}, [div("Loop Count:")]),
					div({style: "display: table-cell;"}, [div("Outro:")]),
				]),
				div({style: "display: table-row;"}, [
					div({style: "display: table-cell; vertical-align: middle;"}, [this._enableIntro]),
					div({style: "display: table-cell; vertical-align: middle;"}, [this._loopDropDown]),
					div({style: "display: table-cell; vertical-align: middle;"}, [this._enableOutro]),
				]),
			]),
			this._exportWavButton,
			this._exportJsonButton,
			this._cancelButton,
		]);
		
		constructor(private _doc: SongDocument) {
			this._loopDropDown.value = "1";
			
			if (this._doc.song.loopStart == 0) {
				this._enableIntro.checked = false;
				this._enableIntro.disabled = true;
			} else {
				this._enableIntro.checked = true;
				this._enableIntro.disabled = false;
			}
			if (this._doc.song.loopStart + this._doc.song.loopLength == this._doc.song.barCount) {
				this._enableOutro.checked = false;
				this._enableOutro.disabled = true;
			} else {
				this._enableOutro.checked = true;
				this._enableOutro.disabled = false;
			}
			
			this._fileName.addEventListener("input", ExportPrompt._validateFileName);
			this._loopDropDown.addEventListener("blur", ExportPrompt._validateNumber);
			this._exportWavButton.addEventListener("click", this._whenExportToWav);
			this._exportJsonButton.addEventListener("click", this._whenExportToJson);
			this._cancelButton.addEventListener("click", this._close);
		}
		
		private _close = (): void => { 
			this._doc.undo();
		}
		
		public cleanUp = (): void => { 
			this._fileName.removeEventListener("input", ExportPrompt._validateFileName);
			this._loopDropDown.removeEventListener("blur", ExportPrompt._validateNumber);
			this._exportWavButton.removeEventListener("click", this._whenExportToWav);
			this._exportJsonButton.removeEventListener("click", this._whenExportToJson);
			this._cancelButton.removeEventListener("click", this._close);
		}
		
		private static _validateFileName(event: Event): void {
			const input: HTMLInputElement = <HTMLInputElement>event.target;
			const deleteChars = /[\+\*\$\?\|\{\}\\\/<>#%!`&'"=:@]/gi;
			if (deleteChars.test(input.value)) {
				let cursorPos: number = <number>input.selectionStart;
				input.value = input.value.replace(deleteChars, "");
				cursorPos--;
				input.setSelectionRange(cursorPos, cursorPos);
			}
		}
		
		private static _validateNumber(event: Event): void {
			const input: HTMLInputElement = <HTMLInputElement>event.target;
			input.value = Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))) + "";
		}
		
		private _whenExportToWav = (): void => {
			
			const synth: Synth = new Synth(this._doc.song)
			synth.enableIntro = this._enableIntro.checked;
			synth.enableOutro = this._enableOutro.checked;
			synth.loopCount = Number(this._loopDropDown.value);
			if (!synth.enableIntro) {
				for (let introIter: number = 0; introIter < this._doc.song.loopStart; introIter++) {
					synth.nextBar();
				}
			}
			const sampleFrames: number = synth.totalSamples;
			const recordedSamplesLeft: Float32Array = new Float32Array(sampleFrames);
			const recordedSamplesRight: Float32Array = new Float32Array(sampleFrames);
			//const timer: number = performance.now();
			synth.synthesize(recordedSamplesLeft, recordedSamplesRight, sampleFrames);
			//console.log("export timer", (performance.now() - timer) / 1000.0);
			
			const srcChannelCount: number = 2;
			const wavChannelCount: number = 2;
			// const sampleRate: number = 44100;
			const sampleRate: number = synth.samplesPerSecond;
			const bytesPerSample: number = 2;
			const bitsPerSample: number = 8 * bytesPerSample;
			const sampleCount: number = wavChannelCount * sampleFrames;
			
			const totalFileSize: number = 44 + sampleCount * bytesPerSample;
			
			let index: number = 0;
			const arrayBuffer: ArrayBuffer = new ArrayBuffer(totalFileSize);
			const data: DataView = new DataView(arrayBuffer);
			data.setUint32(index, 0x52494646, false); index += 4;
			data.setUint32(index, 36 + sampleCount * bytesPerSample, true); index += 4; // size of remaining file
			data.setUint32(index, 0x57415645, false); index += 4;
			data.setUint32(index, 0x666D7420, false); index += 4;
			data.setUint32(index, 0x00000010, true); index += 4; // size of following header
			data.setUint16(index, 0x0001, true); index += 2; // not compressed
			data.setUint16(index, wavChannelCount, true); index += 2; // channel count
			data.setUint32(index, sampleRate, true); index += 4; // sample rate
			data.setUint32(index, sampleRate * bytesPerSample * wavChannelCount, true); index += 4; // bytes per second
			data.setUint16(index, bytesPerSample, true); index += 2; // sample rate
			data.setUint16(index, bitsPerSample, true); index += 2; // sample rate
			data.setUint32(index, 0x64617461, false); index += 4;
			data.setUint32(index, sampleCount * bytesPerSample, true); index += 4;
			let stride: number;
			let repeat: number;
			if (srcChannelCount == wavChannelCount) {
				stride = 1;
				repeat = 1;
			} else {
				stride = srcChannelCount;
				repeat = wavChannelCount;
			}
			
			let valLeft: number;
			let valRight: number;
			if (bytesPerSample > 1) {
				// usually samples are signed. 
				for (let i: number = 0; i < sampleFrames; i++) {
					valLeft = Math.floor(recordedSamplesLeft[i * stride] * ((1 << (bitsPerSample - 1)) - 1));
					valRight = Math.floor(recordedSamplesRight[i * stride] * ((1 << (bitsPerSample - 1)) - 1));
					for (let k: number = 0; k < repeat; k++) {
						if (bytesPerSample == 2) {
							data.setInt16(index, valLeft, true); index += 2;
							data.setInt16(index, valRight, true); index += 2;
						} else if (bytesPerSample == 4) {
							data.setInt32(index, valLeft, true); index += 4;
							data.setInt32(index, valRight, true); index += 4;
						} else {
							throw new Error("unsupported sample size");
						}
					}
				}
			} else {
				// 8 bit samples are a special case: they are unsigned.
				for (let i: number = 0; i < sampleFrames; i++) {
					valLeft = Math.floor(recordedSamplesLeft[i*stride] * 127 + 128);
					valRight = Math.floor(recordedSamplesRight[i*stride] * 127 + 128);
					for (let k: number = 0; k < repeat; k++) {
						data.setUint8(index, valLeft > 255 ? 255 : (valLeft < 0 ? 0 : valLeft)); index++;
						data.setUint8(index, valRight > 255 ? 255 : (valRight < 0 ? 0 : valRight)); index++;
					}
				}
			}
			
			const blob = new Blob([arrayBuffer], {type: "audio/wav"});
			save(blob, this._fileName.value.trim() + ".wav");
			
			this._close();
		}
		
		private _whenExportToJson = (): void => {
			const jsonObject: Object = this._doc.song.toJsonObject(this._enableIntro.checked, Number(this._loopDropDown.value), this._enableOutro.checked);
			const jsonString: string = JSON.stringify(jsonObject, null, '\t');
			const blob = new Blob([jsonString], {type: "application/json"});
			save(blob, this._fileName.value.trim() + ".json");
			this._close();
		}
	}

