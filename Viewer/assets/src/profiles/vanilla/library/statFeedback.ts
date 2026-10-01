export type StatFeedback = { time: number; color: number };

/** Replay timestamps make flashes reproducible when seeking; fade out within one second. */
export function feedbackColor(feedback: StatFeedback | undefined, time: number, base = 0xffffff): number {
    if (!feedback) return base;
    const age = time - feedback.time;
    if (age < 0 || age >= 1000) return base;
    const amount = (1 - age / 1000) ** 2;
    let color = 0;
    for (const shift of [16, 8, 0]) {
        const channel = (base >> shift) & 255;
        color |= Math.round(channel + (((feedback.color >> shift) & 255) - channel) * amount) << shift;
    }
    return color;
}
