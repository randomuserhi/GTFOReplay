export interface FinderEntry {
    id: number;
    key: string;
    type: string;
    known: boolean;
    dimension: number;
    onGround: boolean;
    serial: number;
}

export type FinderSort = "name" | "name-desc" | "number" | "number-desc";

export function filterItems<T extends FinderEntry>(entries: readonly T[], options: {
    query: string; dimension: number; type: string; includeUnknown: boolean; sort: FinderSort;
}): T[] {
    const words = options.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const result = entries.filter(entry => entry.onGround
        && (options.dimension === -1 || entry.dimension === options.dimension)
        && (options.includeUnknown || entry.known)
        && (!options.type || entry.type === options.type)
        && words.every(word => `${entry.key} ${entry.type}`.toLowerCase().includes(word)));
    return result.sort((a, b) => {
        if (options.sort.startsWith("number")) {
            const aNumber = a.serial < 1000, bNumber = b.serial < 1000;
            if (aNumber !== bNumber) return aNumber ? -1 : 1;
            if (aNumber && a.serial !== b.serial) return (a.serial - b.serial) * (options.sort === "number-desc" ? -1 : 1);
        }
        return a.key.localeCompare(b.key, "en", { numeric: true, sensitivity: "base" }) * (options.sort === "name-desc" ? -1 : 1) || a.id - b.id;
    });
}
