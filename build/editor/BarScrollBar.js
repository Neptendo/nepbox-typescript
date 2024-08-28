import { HTML, SVG } from "imperative-html/dist/esm/elements-strict";
const { div } = HTML;
export class BarScrollBar {
    constructor(_doc, _trackContainer) {
        this._doc = _doc;
        this._trackContainer = _trackContainer;
        this._editorWidth = 512;
        this._editorHeight = 20;
        this._notches = SVG.svg({ "pointer-events": "none" });
        this._handle = SVG.rect({ fill: "#444444", x: 0, y: 2, width: 10, height: this._editorHeight - 4 });
        this._handleHighlight = SVG.rect({ fill: "none", stroke: "white", "stroke-width": 2, "pointer-events": "none", x: 0, y: 1, width: 10, height: this._editorHeight - 2 });
        this._leftHighlight = SVG.path({ fill: "white", "pointer-events": "none" });
        this._rightHighlight = SVG.path({ fill: "white", "pointer-events": "none" });
        this._svg = SVG.svg({ style: "background-color: #000000; touch-action: pan-y; position: absolute;", width: this._editorWidth, height: this._editorHeight }, [
            this._notches,
            this._handle,
            this._handleHighlight,
            this._leftHighlight,
            this._rightHighlight,
        ]);
        this.container = div({ class: "barScrollBar", style: "width: 512px; height: 20px; overflow: hidden; position: relative;" }, [this._svg]);
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseOver = false;
        this._dragging = false;
        this._renderedNotchCount = -1;
        this._renderedBarPos = -1;
        this._onScroll = (event) => {
            this._doc.barScrollPos = (this._trackContainer.scrollLeft / 32);
        };
        this._whenMouseOver = (event) => {
            if (this._mouseOver)
                return;
            this._mouseOver = true;
            this._updatePreview();
        };
        this._whenMouseOut = (event) => {
            if (!this._mouseOver)
                return;
            this._mouseOver = false;
            this._updatePreview();
        };
        this._whenMousePressed = (event) => {
            event.preventDefault();
            this._mouseDown = true;
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
            this._updatePreview();
            if (this._mouseX >= this._doc.barScrollPos * this._barWidth && this._mouseX <= (this._doc.barScrollPos + this._doc.trackVisibleBars) * this._barWidth) {
                this._dragging = true;
                this._dragStart = this._mouseX;
            }
        };
        this._whenTouchPressed = (event) => {
            event.preventDefault();
            this._mouseDown = true;
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = event.touches[0].clientX - boundingRect.left;
            this._mouseY = event.touches[0].clientY - boundingRect.top;
            this._updatePreview();
            if (this._mouseX >= this._doc.barScrollPos * this._barWidth && this._mouseX <= (this._doc.barScrollPos + this._doc.trackVisibleBars) * this._barWidth) {
                this._dragging = true;
                this._dragStart = this._mouseX;
            }
        };
        this._whenMouseMoved = (event) => {
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = (event.clientX || event.pageX) - boundingRect.left;
            this._mouseY = (event.clientY || event.pageY) - boundingRect.top;
            this._whenCursorMoved();
        };
        this._whenTouchMoved = (event) => {
            if (!this._mouseDown)
                return;
            event.preventDefault();
            const boundingRect = this._svg.getBoundingClientRect();
            this._mouseX = event.touches[0].clientX - boundingRect.left;
            this._mouseY = event.touches[0].clientY - boundingRect.top;
            this._whenCursorMoved();
        };
        this._whenCursorReleased = (event) => {
            if (!this._dragging && this._mouseDown) {
                if (this._mouseX < (this._doc.barScrollPos + 8) * this._barWidth) {
                    if (this._doc.barScrollPos > 0)
                        this._doc.barScrollPos--;
                    this._doc.notifier.changed();
                }
                else {
                    if (this._doc.barScrollPos < this._doc.song.barCount - this._doc.trackVisibleBars)
                        this._doc.barScrollPos++;
                    this._doc.notifier.changed();
                }
            }
            this._mouseDown = false;
            this._dragging = false;
            this._updatePreview();
        };
        const center = this._editorHeight * 0.5;
        const base = 20;
        const tip = 9;
        const arrowHeight = 6;
        this._leftHighlight.setAttribute("d", `M ${tip} ${center} L ${base} ${center + arrowHeight} L ${base} ${center - arrowHeight} z`);
        this._rightHighlight.setAttribute("d", `M ${this._editorWidth - tip} ${center} L ${this._editorWidth - base} ${center + arrowHeight} L ${this._editorWidth - base} ${center - arrowHeight} z`);
        this.container.addEventListener("mousedown", this._whenMousePressed);
        document.addEventListener("mousemove", this._whenMouseMoved);
        document.addEventListener("mouseup", this._whenCursorReleased);
        this.container.addEventListener("mouseover", this._whenMouseOver);
        this.container.addEventListener("mouseout", this._whenMouseOut);
        this.container.addEventListener("touchstart", this._whenTouchPressed);
        this.container.addEventListener("touchmove", this._whenTouchMoved);
        this.container.addEventListener("touchend", this._whenCursorReleased);
        this.container.addEventListener("touchcancel", this._whenCursorReleased);
        this._trackContainer.addEventListener("scroll", this._onScroll, { capture: false, passive: true });
    }
    _whenCursorMoved() {
        if (this._dragging) {
            while (this._mouseX - this._dragStart < -this._barWidth * 0.5) {
                if (this._doc.barScrollPos > 0) {
                    this._doc.barScrollPos--;
                    this._dragStart -= this._barWidth;
                    this._doc.notifier.changed();
                }
                else {
                    break;
                }
            }
            while (this._mouseX - this._dragStart > this._barWidth * 0.5) {
                if (this._doc.barScrollPos < this._doc.song.barCount - this._doc.trackVisibleBars) {
                    this._doc.barScrollPos++;
                    this._dragStart += this._barWidth;
                    this._doc.notifier.changed();
                }
                else {
                    break;
                }
            }
        }
        if (this._mouseOver)
            this._updatePreview();
    }
    _updatePreview() {
        const showHighlight = this._mouseOver && !this._mouseDown;
        let showleftHighlight = false;
        let showRightHighlight = false;
        let showHandleHighlight = false;
        if (showHighlight) {
            if (this._mouseX < this._doc.barScrollPos * this._barWidth) {
                showleftHighlight = true;
            }
            else if (this._mouseX > (this._doc.barScrollPos + this._doc.trackVisibleBars) * this._barWidth) {
                showRightHighlight = true;
            }
            else {
                showHandleHighlight = true;
            }
        }
        this._leftHighlight.style.visibility = showleftHighlight ? "visible" : "hidden";
        this._rightHighlight.style.visibility = showRightHighlight ? "visible" : "hidden";
        this._handleHighlight.style.visibility = showHandleHighlight ? "visible" : "hidden";
    }
    render() {
        this._barWidth = (this._editorWidth - 1) / Math.max(this._doc.trackVisibleBars, this._doc.song.barCount);
        const resized = this._renderedNotchCount != this._doc.song.barCount;
        if (resized) {
            this._renderedNotchCount = this._doc.song.barCount;
            while (this._notches.firstChild)
                this._notches.removeChild(this._notches.firstChild);
            for (let i = 0; i <= this._doc.song.barCount; i++) {
                const lineHeight = (i % 16 == 0) ? 0 : ((i % 4 == 0) ? this._editorHeight / 8 : this._editorHeight / 3);
                this._notches.appendChild(SVG.rect({ fill: "#444444", x: i * this._barWidth - 1, y: lineHeight, width: 2, height: this._editorHeight - lineHeight * 2 }));
            }
        }
        if (resized || this._renderedBarPos != this._doc.barScrollPos) {
            this._renderedBarPos = this._doc.barScrollPos;
            this._handle.setAttribute("x", "" + (this._barWidth * this._doc.barScrollPos));
            this._handle.setAttribute("width", "" + (this._barWidth * this._doc.trackVisibleBars));
            this._handleHighlight.setAttribute("x", "" + (this._barWidth * this._doc.barScrollPos));
            this._handleHighlight.setAttribute("width", "" + (this._barWidth * this._doc.trackVisibleBars));
        }
        this._updatePreview();
        this._trackContainer.scrollLeft = this._doc.barScrollPos * 32;
    }
}
//# sourceMappingURL=BarScrollBar.js.map