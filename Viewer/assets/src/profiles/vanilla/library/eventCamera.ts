import type { IndexedEvent } from '../../../main/interface.js';

type Point = { position: { x: number; y: number; z: number }; dimension: number };
type Player = Point & { id: number; slot: number; nickname: string };
type Enemy = Point & { health?: number; targetPlayerSlotIndex?: number };
export type EventFocus = Point & { key: string; type: 'player' | 'enemy' | 'point'; id?: number; slot?: number; name?: string };

/** Continue with the nearby squad, preferring players currently under attack. */
export function continuityFocus(players: ReadonlyMap<number, Player>, enemies: ReadonlyMap<number, Enemy>, origin?: Point, recent: readonly string[] = []): EventFocus | undefined {
    let best: Player | undefined, bestScore = Infinity;
    const threatened = new Set([...enemies.values()].filter(e => e.health === undefined || e.health > 0).map(e => e.targetPlayerSlotIndex));
    for (const player of players.values()) {
        const distance = origin ? Math.hypot(player.position.x - origin.position.x, player.position.y - origin.position.y, player.position.z - origin.position.z) : 0;
        const score = (origin && player.dimension !== origin.dimension ? 100000 : 0) + (recent.indexOf(`player:${player.id}`) + 1) * 1000 + Math.min(distance, 500) - (threatened.has(player.slot) ? 20 : 0);
        if (score < bestScore || score === bestScore && player.slot < best!.slot) { best = player; bestScore = score; }
    }
    return best && { ...best, key: `player:${best.id}`, type: 'player', name: best.nickname };
}

export const eventLeadIn = (time: number, start: number) => Math.max(start, time - 3000);

/** Participant namespaces are authoritative; never guess whether an ID is a player or enemy. */
export function resolveEventFocus(event: IndexedEvent, players: ReadonlyMap<number, Player>, enemies: ReadonlyMap<number, Enemy>): EventFocus | undefined {
    const participants = [...(event.participants ?? [])];
    // Revives, packs and damage concern the recipient, not whoever initiated them.
    participants.sort((a, b) => Number(b.role === 'target') - Number(a.role === 'target'));
    for (const person of participants) {
        if (typeof person.id !== 'number') continue;
        if (person.type === 'player') {
            const player = players.get(person.id);
            if (player) return { ...player, key: `player:${player.id}`, type: 'player', name: player.nickname };
        } else if (person.type === 'enemy') {
            const enemy = enemies.get(person.id);
            if (enemy && (enemy.health === undefined || enemy.health > 0)) return { ...enemy, key: `enemy:${person.id}`, type: 'enemy', id: person.id, name: person.name };
        }
    }
    const data = event.data as Partial<Point> | undefined;
    if (data?.position && Number.isFinite(data.dimension) && [data.position.x, data.position.y, data.position.z].every(Number.isFinite)) {
        return { position: data.position, dimension: data.dimension!, key: `point:${event.id}`, type: 'point' };
    }
}

function priority(event: IndexedEvent) {
    switch (event.kind) {
    case 'Vanilla.Player.Animation.Downed': return 100;
    case 'Vanilla.Enemy.Animation.PouncerGrab': return 95;
    case 'Vanilla.Enemy.Animation.ScoutScream': return (event.data as { start?: boolean })?.start === false ? 0 : 90;
    case 'Vanilla.StatTracker.Revive':
    case 'Vanilla.Player.Animation.Revive': return 80;
    case 'ReplayRecorder.Marker': return 70;
    case 'Vanilla.Enemy.Alert': return 30;
    case 'Vanilla.StatTracker.Damage': return 20;
    default: return 0;
    }
}

/** Real viewing seconds govern shot length, independently of replay speed. */
export class EventDirector {
    private previous?: number;
    private held = Infinity;
    private subject?: string;
    private importance = 0;
    private since = 0;
    private protectedUntil = -Infinity;
    private readonly covered = new Map<IndexedEvent['id'], number>();
    private recent: string[] = [];

    reset(time?: number) {
        this.previous = time; this.since = time ?? 0; this.held = Infinity; this.subject = undefined;
        this.importance = 0; this.protectedUntil = -Infinity; this.covered.clear(); this.recent = [];
    }

    private start(focus: EventFocus | undefined, importance = 0) {
        this.subject = focus?.key; this.held = 0; this.importance = importance;
        this.protectedUntil = -Infinity;
        if (focus) this.recent = [...this.recent.filter(key => key !== focus.key), focus.key].slice(-4);
        return focus ?? null;
    }

    update(events: readonly IndexedEvent[], time: number, dt: number, speed: number, playing: boolean, resolve: (event: IndexedEvent) => EventFocus | undefined,
        scene?: { current?: EventFocus; valid: (focus: EventFocus) => boolean; continuation: (recent: readonly string[]) => EventFocus | undefined }) {
        const previous = this.previous;
        this.previous = time;
        if (!playing || speed <= 0) {
            this.since = time;
            return;
        }
        const discontinuity = previous === undefined || time < previous || time - previous > Math.max(500, dt * speed * 1000 + 250);
        if (discontinuity) {
            this.reset(time);
        }
        if (time === previous) return;
        this.held += Math.max(0, dt);
        const invalid = scene && (!scene.current || !scene.valid(scene.current));
        if (invalid) { this.subject = undefined; this.held = Infinity; this.importance = 0; this.protectedUntil = -Infinity; }
        for (const [id, at] of this.covered) if (at < time - 3000) this.covered.delete(id);
        // Read a bounded window of the recorded future; resolve against the current scene.
        // Unspawned participants remain eligible when they appear, and seeks never replay old incidents.
        let low = 0, high = events.length;
        const boundary = Math.max(this.since, time - 3000);
        while (low < high) { const mid = (low + high) >>> 1; if (events[mid].time < boundary) low = mid + 1; else high = mid; }
        let best: { event: IndexedEvent; focus: EventFocus; importance: number; score: number } | undefined;
        for (let i = low; i < events.length && events[i].time <= time + 3000; ++i) {
            const event = events[i], importance = priority(event);
            if (!importance || this.covered.has(event.id)) continue;
            const focus = resolve(event);
            if (!focus) continue;
            if (focus.key === this.subject) {
                this.covered.set(event.id, event.time);
                // Stay through the incident, without letting repeated damage restart the shot timer.
                if (importance >= 70) this.protectedUntil = Math.max(this.protectedUntil, event.time + 1000);
                continue;
            }
            const score = importance + (this.recent.includes(focus.key) ? 0 : 5);
            if (!best || score > best.score) best = { event, focus, importance, score };
        }
        const urgent = best && best.importance >= 70 && best.importance > this.importance;
        if (best && (this.held >= 6 && time >= this.protectedUntil || this.held >= 3 && urgent)) {
            this.covered.set(best.event.id, best.event.time);
            const next = this.start(best.focus, best.importance);
            this.protectedUntil = best.event.time + 1000;
            return next;
        }
        const expired = this.held >= (scene?.current?.type === 'player' ? 12 : 6) && time >= this.protectedUntil;
        if (scene && (invalid || expired)) return this.start(scene.continuation(this.recent));
    }
}
