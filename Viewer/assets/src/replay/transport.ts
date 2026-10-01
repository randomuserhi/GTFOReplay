export interface TimeRange { start: number; end: number }
export function validateRange(range: TimeRange, duration: number): void {
    if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.start < 0 || range.end > duration || range.end <= range.start) {
        throw new Error("Invalid playback interval.");
    }
}
export function advanceTime(time: number, delta: number, duration: number, loop?: TimeRange): number {
    const next = time + delta;
    if (!loop) return Math.min(duration, Math.max(0, next));
    const span = loop.end - loop.start;
    if (next >= loop.end || next < loop.start) return loop.start + ((next - loop.start) % span + span) % span;
    return next;
}
