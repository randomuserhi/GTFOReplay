export function formatTime(milliseconds: number) {
    const total = Math.max(0, Math.floor(milliseconds));
    const seconds = Math.floor(total / 1000) % 60;
    const minutes = Math.floor(total / 60000) % 60;
    const hours = Math.floor(total / 3600000);
    return `${hours ? `${hours}:` : ""}${String(hours ? minutes : Math.floor(total / 60000)).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
