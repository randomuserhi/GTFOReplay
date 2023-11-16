(function () {
    let RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.import(RHU.module({ trace: new Error(),
        name: "x-rhu/bezier", hard: [],
        callback: function () {
            if (RHU.exists(RHU.Bezier))
                console.warn("Overwriting RHU.Bezier...");
            let NEWTON_ITERATIONS = 4;
            let NEWTON_MIN_SLOPE = 0.001;
            let SUBDIVISION_PRECISION = 0.0000001;
            let SUBDIVISION_MAX_ITERATIONS = 10;
            let kSplineTableSize = 11;
            let kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
            let float32ArraySupported = typeof Float32Array === 'function';
            let A = function (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; };
            let B = function (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; };
            let C = function (aA1) { return 3.0 * aA1; };
            let calcBezier = function (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; };
            let getSlope = function (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); };
            let binarySubdivide = function (aX, aA, aB, mX1, mX2) {
                let currentX, currentT, i = 0;
                do {
                    currentT = aA + (aB - aA) / 2.0;
                    currentX = calcBezier(currentT, mX1, mX2) - aX;
                    if (currentX > 0.0)
                        aB = currentT;
                    else
                        aA = currentT;
                } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
                return currentT;
            };
            let newtonRaphsonIterate = function (aX, aGuessT, mX1, mX2) {
                for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
                    let currentSlope = getSlope(aGuessT, mX1, mX2);
                    if (currentSlope === 0.0)
                        return aGuessT;
                    let currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                    aGuessT -= currentX / currentSlope;
                }
                return aGuessT;
            };
            let LinearEasing = function (x) { return x; };
            RHU.Bezier = function (x0 = 0, y0 = 0, x1 = 0, y1 = 0) {
                if (x0 < 0)
                    x0 = 0;
                else if (x0 > 1)
                    x0 = 1;
                if (x1 < 0)
                    x1 = 0;
                else if (x1 > 1)
                    x1 = 1;
                if (x0 === y0 && x1 === y1)
                    return LinearEasing;
                let sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
                for (let i = 0; i < kSplineTableSize; ++i)
                    sampleValues[i] = calcBezier(i * kSampleStepSize, x0, x1);
                let getTForX = function (aX) {
                    let intervalStart = 0.0;
                    let currentSample = 1;
                    let lastSample = kSplineTableSize - 1;
                    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample)
                        intervalStart += kSampleStepSize;
                    --currentSample;
                    let dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
                    let guessForT = intervalStart + dist * kSampleStepSize;
                    let initialSlope = getSlope(guessForT, x0, x1);
                    if (initialSlope >= NEWTON_MIN_SLOPE)
                        return newtonRaphsonIterate(aX, guessForT, x0, x1);
                    else if (initialSlope === 0.0)
                        return guessForT;
                    else
                        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, x0, x1);
                };
                return function (x) {
                    if (x === 0 || x === 1)
                        return x;
                    return calcBezier(getTForX(x), y0, y1);
                };
            };
        }
    }));
})();
