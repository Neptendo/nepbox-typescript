export function scaleElementsByFactor(array, factor) {
    for (let i = 0; i < array.length; i++) {
        array[i] *= factor;
    }
}
function isPowerOf2(n) {
    return !!n && !(n & (n - 1));
}
function countBits(n) {
    if (!isPowerOf2(n))
        throw new Error("FFT array length must be a power of 2.");
    return Math.round(Math.log(n) / Math.log(2));
}
function reverseIndexBits(array) {
    const fullArrayLength = array.length;
    const bitCount = countBits(fullArrayLength);
    if (bitCount > 16)
        throw new Error("FFT array length must not be greater than 2^16.");
    const finalShift = 16 - bitCount;
    for (let i = 0; i < fullArrayLength; i++) {
        let j;
        j = ((i & 0xaaaa) >> 1) | ((i & 0x5555) << 1);
        j = ((j & 0xcccc) >> 2) | ((j & 0x3333) << 2);
        j = ((j & 0xf0f0) >> 4) | ((j & 0x0f0f) << 4);
        j = ((j >> 8) | ((j & 0xff) << 8)) >> finalShift;
        if (j > i) {
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}
export function inverseRealFourierTransform(array) {
    const fullArrayLength = array.length;
    const totalPasses = countBits(fullArrayLength);
    if (fullArrayLength < 4)
        throw new Error("FFT array length must be at least 4.");
    for (let pass = totalPasses - 1; pass >= 2; pass--) {
        const subStride = 1 << pass;
        const midSubStride = subStride >> 1;
        const stride = subStride << 1;
        const radiansIncrement = Math.PI * 2.0 / stride;
        const cosIncrement = Math.cos(radiansIncrement);
        const sinIncrement = Math.sin(radiansIncrement);
        const oscillatorMultiplier = 2.0 * cosIncrement;
        for (let startIndex = 0; startIndex < fullArrayLength; startIndex += stride) {
            const startIndexA = startIndex;
            const midIndexA = startIndexA + midSubStride;
            const startIndexB = startIndexA + subStride;
            const midIndexB = startIndexB + midSubStride;
            const stopIndex = startIndexB + subStride;
            const realStartA = array[startIndexA];
            const imagStartB = array[startIndexB];
            array[startIndexA] = realStartA + imagStartB;
            array[midIndexA] *= 2;
            array[startIndexB] = realStartA - imagStartB;
            array[midIndexB] *= 2;
            let c = cosIncrement;
            let s = -sinIncrement;
            let cPrev = 1.0;
            let sPrev = 0.0;
            for (let index = 1; index < midSubStride; index++) {
                const indexA0 = startIndexA + index;
                const indexA1 = startIndexB - index;
                const indexB0 = startIndexB + index;
                const indexB1 = stopIndex - index;
                const real0 = array[indexA0];
                const real1 = array[indexA1];
                const imag0 = array[indexB0];
                const imag1 = array[indexB1];
                const tempA = real0 - real1;
                const tempB = imag0 + imag1;
                array[indexA0] = real0 + real1;
                array[indexA1] = imag1 - imag0;
                array[indexB0] = tempA * c - tempB * s;
                array[indexB1] = tempB * c + tempA * s;
                const cTemp = oscillatorMultiplier * c - cPrev;
                const sTemp = oscillatorMultiplier * s - sPrev;
                cPrev = c;
                sPrev = s;
                c = cTemp;
                s = sTemp;
            }
        }
    }
    for (let index = 0; index < fullArrayLength; index += 4) {
        const index1 = index + 1;
        const index2 = index + 2;
        const index3 = index + 3;
        const real0 = array[index];
        const real1 = array[index1] * 2;
        const imag2 = array[index2];
        const imag3 = array[index3] * 2;
        const tempA = real0 + imag2;
        const tempB = real0 - imag2;
        array[index] = tempA + real1;
        array[index1] = tempA - real1;
        array[index2] = tempB + imag3;
        array[index3] = tempB - imag3;
    }
    reverseIndexBits(array);
}
//# sourceMappingURL=FFT.js.map