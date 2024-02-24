interface Vector {
    x: number;
    y: number;
    z: number;
}

interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Math {
    clamp(value: number, min: number, max: number): number;
    clamp01(value: number): number;
}

Math.clamp = function (value, min, max) {
    return Math.min(max, Math.max(value, min));
};
Math.clamp01 = function (value) {
    return Math.clamp(value, 0, 1);
};
