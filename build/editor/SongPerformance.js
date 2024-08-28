export class SongPerformance {
    constructor(_doc) {
        this._doc = _doc;
        this._pitchesAreTemporary = false;
        this._onAnimationFrame = () => {
            window.requestAnimationFrame(this._onAnimationFrame);
        };
        window.requestAnimationFrame(this._onAnimationFrame);
    }
    play() {
        this._doc.synth.play();
        this._doc.synth.maintainLiveInput();
    }
    pause() {
        this._doc.synth.pause();
        this._doc.synth.snapToBar();
    }
    pitchesAreTemporary() {
        return this._pitchesAreTemporary;
    }
}
//# sourceMappingURL=SongPerformance.js.map