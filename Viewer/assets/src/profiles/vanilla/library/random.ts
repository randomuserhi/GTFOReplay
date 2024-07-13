export const xor = (seed: number) => {
    const baseSeeds = [123456789, 362436069, 521288629, 88675123];

    let [x, y, z, w] = baseSeeds.map(i => i + seed);

    const random = () => {
        const t = x ^ (x << 11);
        [x, y, z] = [y, z, w];
        w = w ^ (w >> 19) ^ (t ^ (t >> 8));
        return w / 0x7fffffff;
    };

    return random;
};