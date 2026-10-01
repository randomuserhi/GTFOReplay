export interface ReplayOpenProgress {
    phase: "extracting" | "readingDuration" | "loadingScene";
    loaded?: number;
    total?: number;
}
