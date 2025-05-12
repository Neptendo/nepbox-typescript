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

import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
import { SongDocument } from "./SongDocument";
import { Pattern } from "../synth/synth";
import { ChangePattern, ChangeChannelBar } from "./changes";
import { ColorConfig } from "./ColorConfig";
	const {select, div, option} = HTML;

	class Box {
		private readonly _label: SVGTextElement = SVG.text( {x: 16, y: 23, "font-family": "sans-serif", "font-size": 20, "text-anchor": "middle", "font-weight": "bold", fill: ColorConfig.invertedText}, "1");
		private readonly _rect = <SVGRectElement> SVG.rect( {width: 30, height: 27, x: 1, y: 1});
		private readonly _vol1 = <SVGRectElement> SVG.rect( {width: 6, height: 3, x: 24, y: 5});
		private readonly _volb = <SVGRectElement> SVG.rect( {width: 6, height: 18, x: 24, y: 5});
		public readonly container = <SVGSVGElement> SVG.svg(this._rect, this._volb, this._vol1, this._label);
		private _renderedIndex: number = 1;
		private _renderedDim: boolean = true;
		//private _renderedMute: boolean = true;
		private _renderedSelected: boolean = false;
		private _renderedColor: string = "";
		constructor(channel: number, x: number, y: number, color: string, showVolume: boolean) {
			this.container.setAttribute("x", "" + (x * 32));
			this.container.setAttribute("y", "" + (y * 32));
			this._rect.setAttribute("fill", "#444444");
			this._vol1.setAttribute("fill", "#444444");
			this._volb.setAttribute("fill", "#444444");
			this._label.setAttribute("fill", color);
		}
		
		public setSquashed(squashed: boolean, y: number): void {
			if (squashed) {
				this.container.setAttribute("y", "" + (y * 27));
				this._rect.setAttribute("height", "" + 25);
				this._vol1.setAttribute("height", "" + 2.7);
				this._volb.setAttribute("height", "" + 18);
				this._label.setAttribute("y", "" + 21);
			} else {
				this.container.setAttribute("y", "" + (y * 32));
				this._rect.setAttribute("height", "" + 30);
				this._vol1.setAttribute("height", "" + 3);
				this._volb.setAttribute("height", "" + 18);
				this._label.setAttribute("y", "" + 23);
			}
		}
		
		public setIndex(index: number, dim: boolean, selected: boolean, y: number, color: string, volume: number, colorB: string, showVolume: boolean, mix: number): void {
			if (mix == 2) {
				this._vol1.setAttribute("height", "" + (18 - volume * 2));
				this._vol1.setAttribute("y", "" + (5 + volume * 2));
			} else {
				this._vol1.setAttribute("height", "" + (18 - volume * 3.6));
				this._vol1.setAttribute("y", "" + (5 + volume * 3.6));
			}
			if (this._renderedIndex != index) {
				if (!this._renderedSelected && ((index == 0) != (this._renderedIndex == 0))) {
					this._rect.setAttribute("fill", (index == 0) ? ColorConfig.editorBackground : ColorConfig.channelBox);
					this._vol1.setAttribute("fill", (index == 0) ? ColorConfig.editorBackground : ColorConfig.channelBox);
					this._volb.setAttribute("fill", (index == 0) ? ColorConfig.editorBackground : ColorConfig.channelBox);
				}
			
				this._renderedIndex = index;
				this._label.innerHTML = String(index);
			}
			
			if (this._renderedDim != dim || this._renderedColor != color) {
				this._renderedDim = dim;
				if (selected) {
					this._label.setAttribute("fill", ColorConfig.invertedText);
				} else {
					this._label.setAttribute("fill", color);
				}
			}
			
			if (this._renderedSelected != selected || this._renderedColor != color) {
				this._renderedSelected = selected;
				if (selected) {
					this._rect.setAttribute("fill", color);
					this._vol1.setAttribute("fill", color);
					this._volb.setAttribute("fill", color);
					this._label.setAttribute("fill", ColorConfig.invertedText);
				} else {
					this._rect.setAttribute("fill", (this._renderedIndex == 0) ? ColorConfig.editorBackground : ColorConfig.channelBox);
					this._vol1.setAttribute("fill", (this._renderedIndex == 0) ? ColorConfig.editorBackground : color);
					this._volb.setAttribute("fill", (this._renderedIndex == 0) ? ColorConfig.editorBackground : colorB);
					this._label.setAttribute("fill", color);
				}
			}

			if (showVolume) {
				this._label.setAttribute("x", "12");
				this._vol1.style.visibility = "visible";
				this._volb.style.visibility = "visible";
			} else {
				this._label.setAttribute("x", "16");
				this._vol1.style.visibility = "hidden";
				this._volb.style.visibility = "hidden";
			}
			
			this._renderedColor = color;
		}
	}
	
	export class TrackEditor {
		private readonly _barWidth: number = 32;
		private readonly _svg = <SVGSVGElement> SVG.svg( {style: "position: absolute;", height: 128});
		private readonly _select: HTMLSelectElement = select({class: "trackSelectBox", style: "width: 32px; height: 32px; background: none; border: none; appearance: none; color: transparent; position: absolute;"});
		public readonly container: HTMLElement = div({style: "height: 128px; position: relative; overflow:hidden;"}, [this._svg, this._select]);
		
		private readonly _boxContainer = <SVGGElement> SVG.g();
		private readonly _playhead = <SVGRectElement> SVG.rect( {fill: "white", x: 0, y: 0, width: 4, height: 128});
		private readonly _boxHighlight = <SVGRectElement> SVG.rect( {fill: "none", stroke: "white", "stroke-width": 2, "pointer-events": "none", x: 1, y: 1, width: 30, height: 30});
		private readonly _upHighlight = <SVGPathElement> SVG.path( {fill: "black", stroke: "black", "stroke-width": 1, "pointer-events": "none"});
		private readonly _downHighlight = <SVGPathElement> SVG.path( {fill: "black", stroke: "black", "stroke-width": 1, "pointer-events": "none"});
		
		private readonly _grid: Box[][] = [];
		private _mouseX: number = 0;
		private _mouseY: number = 0;
		public _pattern: Pattern | null = null;
		private _mouseOver: boolean = false;
		public _digits: string = "";
		private _editorHeight: number = 128;
		private _channelHeight: number = 32;
		private _renderedChannelCount: number = 0;
		private _renderedBarCount: number = 0;
		private _renderedPatternCount: number = 0;
		private _renderedPlayhead: number = -1;
		private _renderedSquashed: boolean = false;
		private _changePattern: ChangePattern | null = null;
		
		constructor(private _doc: SongDocument) {
			this._svg.appendChild(this._boxContainer);
			this._svg.appendChild(this._boxHighlight);
			this._svg.appendChild(this._upHighlight);
			this._svg.appendChild(this._downHighlight);
			this._svg.appendChild(this._playhead);
			this._svg.style.backgroundColor = ColorConfig.editorBackground;

			window.requestAnimationFrame(this._animatePlayhead);
			this._svg.addEventListener("mousedown", this._whenMousePressed);
			document.addEventListener("mousemove", this._whenMouseMoved);
			document.addEventListener("mouseup", this._whenMouseReleased);
			this._svg.addEventListener("mouseover", this._whenMouseOver);
			this._svg.addEventListener("mouseout", this._whenMouseOut);
			
			this._select.addEventListener("change", this._whenSelectChanged);
		}
		
		private _whenSelectChanged = (): void => {
			this._setPattern(this._select.selectedIndex);
		}
		
		private _animatePlayhead = (timestamp: number): void => {
			const playhead = (this._barWidth * this._doc.synth.playhead - 2);
			if (this._renderedPlayhead != playhead) {
				this._renderedPlayhead = playhead;
				this._playhead.setAttribute("x", "" + playhead);
			}
			window.requestAnimationFrame(this._animatePlayhead);
		}
		
		public _setChannelBar(channel: number, bar: number): void {
			new ChangeChannelBar(this._doc, channel, bar);
			this._digits = "";
			this._doc.forgetLastChange();
		}
		
		private _setPattern(pattern: number): void {
			const currentValue: number = this._doc.song.channels[this._doc.channel].bars[this._doc.bar];
			const canReplaceLastChange: boolean = this._doc.lastChangeWas(this._changePattern);
			const oldValue: number = canReplaceLastChange ? this._changePattern!.oldValue : currentValue;
			if (pattern != currentValue) {
				this._changePattern = new ChangePattern(this._doc, oldValue, pattern);
				this._doc.record(this._changePattern, canReplaceLastChange);
			}
		}
		
		public _nextDigit(digit: string): void {
			this._digits += digit;
			let parsed: number = parseInt(this._digits);
			if (parsed <= this._doc.song.patternsPerChannel) {
				this._setPattern(parsed);
				return;
			}
				
			this._digits = digit;
			parsed = parseInt(this._digits);
			if (parsed <= this._doc.song.patternsPerChannel) {
				this._setPattern(parsed);
				return;
			}
			
			this._digits = "";
		}
		
		private _whenMouseOver = (event: MouseEvent): void => {
			if (this._mouseOver) return;
			this._mouseOver = true;
		}
		
		private _whenMouseOut = (event: MouseEvent): void => {
			if (!this._mouseOver) return;
			this._mouseOver = false;
		}
		
		private _whenMousePressed = (event: MouseEvent): void => {
			event.preventDefault();
			const boundingRect: ClientRect = this._svg.getBoundingClientRect();
    		this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
		    this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
			const channel: number = Math.floor(Math.min(this._doc.song.getChannelCount() - 1, Math.max(0, this._mouseY / this._channelHeight)));
			const bar: number = Math.floor(Math.min(this._doc.song.barCount - 1, Math.max(0, this._mouseX / this._barWidth)));
			if (this._doc.channel == channel && this._doc.bar == bar) {
				const up: boolean = (this._mouseY % this._channelHeight) < this._channelHeight / 2;
				const patternCount: number = this._doc.song.patternsPerChannel;
				this._setPattern((this._doc.song.channels[channel].bars[bar] + (up ? 1 : patternCount)) % (patternCount + 1));
			} else {
				this._setChannelBar(channel, bar);
			}
		}
		
		private _whenMouseMoved = (event: MouseEvent): void => {
			const boundingRect: ClientRect = this._svg.getBoundingClientRect();
    		this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
		    this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
			this._updatePreview();
		}
		
		private _whenMouseReleased = (event: MouseEvent): void => {
		}
		
		private _updatePreview(): void {
			let channel: number = Math.floor(Math.min(this._doc.song.getChannelCount() - 1, Math.max(0, this._mouseY / this._channelHeight)));
			let bar: number = Math.floor(Math.min(this._doc.song.barCount - 1, Math.max(0, this._mouseX / this._barWidth)));
			
			const wideScreen: boolean = window.innerWidth > 700;
			if (!wideScreen) {
				bar = this._doc.bar;
				channel = this._doc.channel;
			}
			
			const selected: boolean = (bar == this._doc.bar && channel == this._doc.channel);
			
			if (this._mouseOver && !selected) {
				this._boxHighlight.setAttribute("x", "" + (1 + this._barWidth * bar));
				this._boxHighlight.setAttribute("y", "" + (1 + (this._channelHeight * channel)));
				this._boxHighlight.setAttribute("height", "" + (this._channelHeight - 2));
				this._boxHighlight.style.visibility = "visible";
			} else {
				this._boxHighlight.style.visibility = "hidden";
			}
			
			if ((this._mouseOver || !wideScreen) && selected) {
				const up: boolean = (this._mouseY % this._channelHeight) < this._channelHeight / 2;
				const center: number = this._barWidth * (bar + 0.8);
				const middle: number = this._channelHeight * (channel + 0.5);
				const base: number = this._channelHeight * 0.1;
				const tip: number = this._channelHeight * 0.4;
				const width: number = this._channelHeight * 0.175;
				
				this._upHighlight.setAttribute("fill", up && wideScreen ? "#fff" : "#000");
				this._downHighlight.setAttribute("fill", !up && wideScreen ? "#fff" : "#000");
				
				this._upHighlight.setAttribute("d", `M ${center} ${middle - tip} L ${center + width} ${middle - base} L ${center - width} ${middle - base} z`);
				this._downHighlight.setAttribute("d", `M ${center} ${middle + tip} L ${center + width} ${middle + base} L ${center - width} ${middle + base} z`);
				
				this._upHighlight.style.visibility = "visible";
				this._downHighlight.style.visibility = "visible";
			} else {
				this._upHighlight.style.visibility = "hidden";
				this._downHighlight.style.visibility = "hidden";
			}
			
			this._select.style.left = (this._barWidth * this._doc.bar) + "px";
			this._select.style.top = (this._channelHeight * this._doc.channel) + "px";
			this._select.style.height = this._channelHeight + "px";
			
			const patternCount: number = this._doc.song.patternsPerChannel;
			for (let i: number = this._renderedPatternCount; i < patternCount; i++) {
				this._select.appendChild(option({value:i}, i));
			}
			for (let i: number = patternCount; i < this._renderedPatternCount; i++) {
				this._select.removeChild(<Node> this._select.lastChild);
			}
			this._renderedPatternCount = patternCount;
			const selectedPattern: number = this._doc.song.channels[this._doc.channel].bars[this._doc.bar];
			if (this._select.selectedIndex != selectedPattern) this._select.selectedIndex = selectedPattern;
		}
		
		public render(): void {
			this._pattern = this._doc.getCurrentPattern();
			
			const wideScreen: boolean = window.innerWidth > 700;
			const squashed: boolean = !wideScreen || this._doc.song.getChannelCount() > 5/*4*/ || (this._doc.song.barCount > this._doc.trackVisibleBars && this._doc.song.getChannelCount() > 3);
			this._channelHeight = squashed ? 27 : 32;
			
			if (this._renderedChannelCount != this._doc.song.getChannelCount()) {
				for (let y: number = this._renderedChannelCount; y < this._doc.song.getChannelCount(); y++) {
					this._grid[y] = [];
					for (let x: number = 0; x < this._renderedBarCount; x++) {
						//const box: Box = new Box(y, x, y, this._doc.song.getChannelColorDim(y), this._doc.showVolumeBar);
						const box: Box = new Box(y, x, y, ColorConfig.getChannelColor(this._doc.song, y).secondaryChannel, this._doc.showVolumeBar);
						box.setSquashed(squashed, y);
						this._boxContainer.appendChild(box.container);
						this._grid[y][x] = box;
					}
				}
				
				for (let y: number = this._doc.song.getChannelCount(); y < this._renderedChannelCount; y++) {
					for (let x: number = 0; x < this._renderedBarCount; x++) {
						this._boxContainer.removeChild(this._grid[y][x].container);
					}
				}
				
				this._grid.length = this._doc.song.getChannelCount();
			}
			
			if (this._renderedBarCount < this._doc.song.barCount) {
				for (let y: number = 0; y < this._doc.song.getChannelCount(); y++) {
					for (let x: number = this._renderedBarCount; x < this._doc.song.barCount; x++) {
						const box: Box = new Box(y, x, y, ColorConfig.getChannelColor(this._doc.song, y).secondaryChannel, this._doc.showVolumeBar);
						box.setSquashed(squashed, y);
						this._boxContainer.appendChild(box.container);
						this._grid[y][x] = box;
						//SVG.text( {x: 16, y: 23, "font-family": "sans-serif", "font-size": 20, "text-anchor": "middle", "font-weight": "bold", fill: "red"});
					}
					for (let x: number = this._doc.song.barCount; x < this._renderedBarCount; x++) {
						this._boxContainer.removeChild(this._grid[y][x].container);
					}
					this._grid[y].length = this._doc.song.barCount;
				}
			}

			if (this._renderedBarCount != this._doc.song.barCount) {
				this._renderedBarCount = this._doc.song.barCount;
				const editorWidth = 32 * this._doc.song.barCount;
				this.container.style.width = editorWidth + "px";
				this._svg.setAttribute("width", editorWidth + "");
			}
			
			if (this._renderedSquashed != squashed) {
				for (let y: number = 0; y < this._doc.song.getChannelCount(); y++) {
					for (let x: number = 0; x < this._renderedBarCount; x++) {
						this._grid[y][x].setSquashed(squashed, y);
					}
				}
			}
			
			if (this._renderedSquashed != squashed || this._renderedChannelCount != this._doc.song.getChannelCount()) {
				this._renderedSquashed = squashed;
				this._renderedChannelCount = this._doc.song.getChannelCount();
				this._editorHeight = this._doc.song.getChannelCount() * this._channelHeight;
				this._svg.setAttribute("height", "" + this._editorHeight);
				this._playhead.setAttribute("height", "" + this._editorHeight);
				this.container.style.height = this._editorHeight + "px";
			}
			
			for (let j: number = 0; j < this._doc.song.getChannelCount(); j++) {
				for (let i: number = 0; i < this._renderedBarCount; i++) {
					const pattern: Pattern | null = this._doc.song.getPattern(j, i);
					const patternMute: number = this._doc.song.getPatternInstrumentMute(j, i);
					const patternVolume: number = this._doc.song.getPatternInstrumentVolume(j, i);
					const selected: boolean = (i == this._doc.bar && j == this._doc.channel);
					const dim: boolean = (pattern == null || pattern.notes.length == 0);
					const mute: boolean = patternMute == 1;
					const volume: number = patternVolume;
					const box: Box = this._grid[j][i];
					if (i < this._doc.song.barCount) {
						box.setIndex(
							this._doc.song.channels[j].bars[i],
							dim,
							selected,
							j,
							dim && !selected && !mute ? ColorConfig.getChannelColor(this._doc.song, j).secondaryChannel : mute && !selected ? "#161616" : ColorConfig.getChannelColor(this._doc.song, j).primaryChannel,
							volume,
							dim && !selected && !mute ? ColorConfig.getChannelColor(this._doc.song, j).secondaryChannel : mute && !selected ? "#9b9b9b" : ColorConfig.getChannelColor(this._doc.song, j).secondaryChannel,
							this._doc.showVolumeBar,
							this._doc.song.mix
						);
						box.container.style.visibility = "visible";
					} else {
						box.container.style.visibility = "hidden";
					}
				}
			}
			
			this._updatePreview();
		}
	}

