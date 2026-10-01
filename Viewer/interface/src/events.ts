import type { EventParticipant, IndexedEvent } from '../../assets/src/main/interface';

// State/transport traffic is useful for diagnostics, but obscures gameplay moments.
const shots = /(?:^|\.)(?:GunshotInfo|Gunshots?)(?:\.|$)/i;
const detailed = /(?:^|\.)(?:Heartbeat|Damage|Bullet|Projectile|State|Sync|Sound|AttackWindup|Hitreact|Melee|Jump|MeleeSwing|MeleeShove|TongueEvent|LimbDestruction|Punch)(?:\.|$)/i;
export const eventKindKey = (kind: string) => kind === 'Vanilla.Gameplay.Info' ? 'GameplayInfo' : kind === 'Vanilla.Bioscan.Info' ? 'ScanInfo' : kind === 'Vanilla.Player.Animation.Revive' ? 'PlayerRevived' : kind === 'Vanilla.Player.Gunshots.Info' ? 'GunshotInfo' : kind.split('.').pop()!;
export function eventDetail(event: IndexedEvent, name: (participant: EventParticipant) => string = p => p.name ? `${p.name}${p.type === 'enemy' ? ` #${p.id}` : ''}` : `${p.type} #${p.id}`) {
    const data = event.data as Record<string, unknown> | undefined;
    if (!data || typeof data !== 'object') return '';
    if (event.kind === 'Vanilla.Gameplay.Info') return [data.channel, data.title, data.text || 'Ended'].filter(Boolean).join(' · ');
    if (event.kind === 'Vanilla.Bioscan.Info') return `${data.exit ? 'Extraction' : data.alarm ? 'Alarm scan' : 'Bioscan'} · ${['Disabled','Revealing','Waiting','Scanning','Completed','Timed out'][Number(data.state)] ?? 'Unknown'} · ${data.players}/${data.required} players`;
    const people = event.participants?.map(name).join(' → ');
    const amount = typeof data.damage === 'number' ? data.damage.toFixed(1) : '';
    const label = typeof data.label === 'string' ? data.label : '';
    return [people, label, amount].filter(Boolean).join(' · ');
}
export function visibleEvents(events: readonly IndexedEvent[], includeDetails: boolean, kind = '', query = '', label: (event: IndexedEvent) => string = e => e.kind) {
    const text = query.trim().toLocaleLowerCase();
    return events.filter(event => !shots.test(event.kind) && (includeDetails || !detailed.test(event.kind) && !(event.kind === 'Vanilla.Gameplay.Info' && (event.data as {channel?: string})?.channel === 'Timer')) && (!kind || event.kind === kind) && (!text || label(event).toLocaleLowerCase().includes(text)));
}
export interface EventGroup { events: IndexedEvent[]; time: number; endTime: number }
export function groupEvents(events: readonly IndexedEvent[]): EventGroup[] {
    const groups: EventGroup[] = [], active = new Map<string, EventGroup>();
    for (const event of [...events].sort((a,b) => a.time - b.time || a.id - b.id)) {
        const mergeable = event.kind === 'Vanilla.Enemy.Alert' || event.kind === 'Vanilla.Enemy.Animation.Wakeup';
        // Different enemies may wake together, but alerts aimed at different players
        // stay separate. Anchor to the first event so a long fight cannot become one row.
        const player = event.participants?.find(p => p.role === 'player');
        const slot = (event.data as { slot?: number } | undefined)?.slot;
        const key = `${event.kind}:${player ? `${player.id}:${player.name}` : slot ?? ''}`;
        const previous = mergeable ? active.get(key) : undefined;
        if (previous && event.time - previous.time <= 2000) {
            previous.events.push(event); previous.endTime = event.time;
        } else {
            const group = { events: [event], time: event.time, endTime: event.time };
            groups.push(group);
            if (mergeable) active.set(key, group);
        }
        if (!mergeable) active.clear();
    }
    return groups;
}
export function timelineEvents(events: readonly IndexedEvent[], start: number, duration: number, width: number) {
    const columns = new Map<number, IndexedEvent>();
    for (const event of events) {
        const column = Math.floor((event.time - start) / Math.max(duration - start, 1) * width / 3) * 3;
        if (column >= 0 && column < width && (!columns.has(column) || event.kind.endsWith('Marker'))) columns.set(column, event);
    }
    return columns;
}
