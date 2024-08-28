import { HTML } from "imperative-html/dist/esm/elements-strict";
import { Synth } from "../synth/synth";
const { button, div, input } = HTML;
function save(blob, name) {
    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, name);
        return;
    }
    const anchor = document.createElement("a");
    if (anchor.download != undefined) {
        const url = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        anchor.href = url;
        anchor.download = name;
        setTimeout(function () { anchor.dispatchEvent(new MouseEvent("click")); }, 0);
    }
    else {
        const url = URL.createObjectURL(blob);
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        if (!window.open(url, "_blank"))
            window.location.href = url;
    }
}
export class ExportPrompt {
    constructor(_doc) {
        this._doc = _doc;
        this._fileName = input({ type: "text", style: "width: 10em;", value: "Modbox-Song", maxlength: 250 });
        this._enableIntro = input({ type: "checkbox" });
        this._loopDropDown = input({ style: "width: 2em;", type: "number", min: "1", max: "4", step: "1" });
        this._enableOutro = input({ type: "checkbox" });
        this._exportWavButton = button({}, [div("Export to .wav file")]);
        this._exportJsonButton = button({}, [div("Export to .json file")]);
        this._cancelButton = button({}, [div("Cancel")]);
        this.container = div({ class: "prompt", style: "width: 200px;" }, [
            div({ style: "font-size: 2em" }, [div("Export Options")]),
            div({ style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between;" }, [
                div("File name:"),
                this._fileName,
            ]),
            div({ style: "display: table; width: 100%;" }, [
                div({ style: "display: table-row;" }, [
                    div({ style: "display: table-cell;" }, [div("Intro:")]),
                    div({ style: "display: table-cell;" }, [div("Loop Count:")]),
                    div({ style: "display: table-cell;" }, [div("Outro:")]),
                ]),
                div({ style: "display: table-row;" }, [
                    div({ style: "display: table-cell; vertical-align: middle;" }, [this._enableIntro]),
                    div({ style: "display: table-cell; vertical-align: middle;" }, [this._loopDropDown]),
                    div({ style: "display: table-cell; vertical-align: middle;" }, [this._enableOutro]),
                ]),
            ]),
            this._exportWavButton,
            this._exportJsonButton,
            this._cancelButton,
        ]);
        this._close = () => {
            this._doc.undo();
        };
        this.cleanUp = () => {
            this._fileName.removeEventListener("input", ExportPrompt._validateFileName);
            this._loopDropDown.removeEventListener("blur", ExportPrompt._validateNumber);
            this._exportWavButton.removeEventListener("click", this._whenExportToWav);
            this._exportJsonButton.removeEventListener("click", this._whenExportToJson);
            this._cancelButton.removeEventListener("click", this._close);
        };
        this._whenExportToWav = () => {
            const synth = new Synth(this._doc.song);
            synth.enableIntro = this._enableIntro.checked;
            synth.enableOutro = this._enableOutro.checked;
            synth.loopCount = Number(this._loopDropDown.value);
            if (!synth.enableIntro) {
                for (let introIter = 0; introIter < this._doc.song.loopStart; introIter++) {
                    synth.nextBar();
                }
            }
            const sampleFrames = synth.totalSamples;
            const recordedSamplesLeft = new Float32Array(sampleFrames);
            const recordedSamplesRight = new Float32Array(sampleFrames);
            synth.synthesize(recordedSamplesLeft, recordedSamplesRight, sampleFrames);
            const srcChannelCount = 2;
            const wavChannelCount = 2;
            const sampleRate = synth.samplesPerSecond;
            const bytesPerSample = 2;
            const bitsPerSample = 8 * bytesPerSample;
            const sampleCount = wavChannelCount * sampleFrames;
            const totalFileSize = 44 + sampleCount * bytesPerSample;
            let index = 0;
            const arrayBuffer = new ArrayBuffer(totalFileSize);
            const data = new DataView(arrayBuffer);
            data.setUint32(index, 0x52494646, false);
            index += 4;
            data.setUint32(index, 36 + sampleCount * bytesPerSample, true);
            index += 4;
            data.setUint32(index, 0x57415645, false);
            index += 4;
            data.setUint32(index, 0x666D7420, false);
            index += 4;
            data.setUint32(index, 0x00000010, true);
            index += 4;
            data.setUint16(index, 0x0001, true);
            index += 2;
            data.setUint16(index, wavChannelCount, true);
            index += 2;
            data.setUint32(index, sampleRate, true);
            index += 4;
            data.setUint32(index, sampleRate * bytesPerSample * wavChannelCount, true);
            index += 4;
            data.setUint16(index, bytesPerSample, true);
            index += 2;
            data.setUint16(index, bitsPerSample, true);
            index += 2;
            data.setUint32(index, 0x64617461, false);
            index += 4;
            data.setUint32(index, sampleCount * bytesPerSample, true);
            index += 4;
            let stride;
            let repeat;
            if (srcChannelCount == wavChannelCount) {
                stride = 1;
                repeat = 1;
            }
            else {
                stride = srcChannelCount;
                repeat = wavChannelCount;
            }
            let valLeft;
            let valRight;
            if (bytesPerSample > 1) {
                for (let i = 0; i < sampleFrames; i++) {
                    valLeft = Math.floor(recordedSamplesLeft[i * stride] * ((1 << (bitsPerSample - 1)) - 1));
                    valRight = Math.floor(recordedSamplesRight[i * stride] * ((1 << (bitsPerSample - 1)) - 1));
                    for (let k = 0; k < repeat; k++) {
                        if (bytesPerSample == 2) {
                            data.setInt16(index, valLeft, true);
                            index += 2;
                            data.setInt16(index, valRight, true);
                            index += 2;
                        }
                        else if (bytesPerSample == 4) {
                            data.setInt32(index, valLeft, true);
                            index += 4;
                            data.setInt32(index, valRight, true);
                            index += 4;
                        }
                        else {
                            throw new Error("unsupported sample size");
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < sampleFrames; i++) {
                    valLeft = Math.floor(recordedSamplesLeft[i * stride] * 127 + 128);
                    valRight = Math.floor(recordedSamplesRight[i * stride] * 127 + 128);
                    for (let k = 0; k < repeat; k++) {
                        data.setUint8(index, valLeft > 255 ? 255 : (valLeft < 0 ? 0 : valLeft));
                        index++;
                        data.setUint8(index, valRight > 255 ? 255 : (valRight < 0 ? 0 : valRight));
                        index++;
                    }
                }
            }
            const blob = new Blob([arrayBuffer], { type: "audio/wav" });
            save(blob, this._fileName.value.trim() + ".wav");
            this._close();
        };
        this._whenExportToJson = () => {
            const jsonObject = this._doc.song.toJsonObject(this._enableIntro.checked, Number(this._loopDropDown.value), this._enableOutro.checked);
            const jsonString = JSON.stringify(jsonObject, null, '\t');
            const blob = new Blob([jsonString], { type: "application/json" });
            save(blob, this._fileName.value.trim() + ".json");
            this._close();
        };
        this._loopDropDown.value = "1";
        if (this._doc.song.loopStart == 0) {
            this._enableIntro.checked = false;
            this._enableIntro.disabled = true;
        }
        else {
            this._enableIntro.checked = true;
            this._enableIntro.disabled = false;
        }
        if (this._doc.song.loopStart + this._doc.song.loopLength == this._doc.song.barCount) {
            this._enableOutro.checked = false;
            this._enableOutro.disabled = true;
        }
        else {
            this._enableOutro.checked = true;
            this._enableOutro.disabled = false;
        }
        this._fileName.addEventListener("input", ExportPrompt._validateFileName);
        this._loopDropDown.addEventListener("blur", ExportPrompt._validateNumber);
        this._exportWavButton.addEventListener("click", this._whenExportToWav);
        this._exportJsonButton.addEventListener("click", this._whenExportToJson);
        this._cancelButton.addEventListener("click", this._close);
    }
    static _validateFileName(event) {
        const input = event.target;
        const deleteChars = /[\+\*\$\?\|\{\}\\\/<>#%!`&'"=:@]/gi;
        if (deleteChars.test(input.value)) {
            let cursorPos = input.selectionStart;
            input.value = input.value.replace(deleteChars, "");
            cursorPos--;
            input.setSelectionRange(cursorPos, cursorPos);
        }
    }
    static _validateNumber(event) {
        const input = event.target;
        input.value = Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))) + "";
    }
}
//# sourceMappingURL=ExportPrompt.js.map