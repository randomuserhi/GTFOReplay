import type { EventParticipant, IndexedEvent } from '../../../main/interface.js';

type Player = { id: number; slot: number; nickname: string; snet: bigint };
type Role = EventParticipant['role'];

/** Capture identities while parsing, before despawns or later slot reuse change them. */
export function describeParticipants(event: IndexedEvent, players: ReadonlyMap<number, Player>, enemies: ReadonlyMap<number, { type?: { id: number } }>, mineOwners: ReadonlyMap<number, { snet: bigint }>, enemyNames: ReadonlyMap<number, string>) {
    const data = event.data as Record<string, unknown> | undefined;
    if (!data || typeof data !== 'object') return [];
    const result: EventParticipant[] = [];
    const add = (role: Role, value: unknown, type: EventParticipant['type']) => {
        if (typeof value !== 'number' && typeof value !== 'bigint') return;
        const player = type === 'player' ? (typeof value === 'bigint' ? [...players.values()].find(p => p.snet === value) : players.get(value)) : undefined;
        const enemyType = type === 'enemy' && typeof value === 'number' ? enemies.get(value)?.type?.id : undefined;
        const name = player?.nickname ?? (enemyType === undefined ? undefined : enemyNames.get(enemyType));
        result.push({ role, type, id: player?.id ?? (typeof value === 'bigint' ? String(value) : value), ...(name ? { name } : {}) });
    };
    const kind = event.kind;
    if (kind === 'Vanilla.Enemy.Alert') {
        add('enemy', data.enemy, 'enemy');
        const player = [...players.values()].find(p => p.slot === data.slot);
        if (player) add('player', player.id, 'player');
    } else if (kind === 'ReplayRecorder.Marker') add('player', data.player, 'player');
    else if (kind.startsWith('Vanilla.Player.Animation.')) add('player', data.owner, 'player');
    else if (kind.startsWith('Vanilla.Enemy.Animation.')) add('enemy', data.id, 'enemy');
    else if (kind === 'Vanilla.StatTracker.Revive' || kind === 'Vanilla.StatTracker.Pack') {
        add('source', data.source, 'player'); add('target', data.target, 'player');
    } else if (kind === 'Vanilla.StatTracker.PackConsumed') add('player', data.owner, 'player');
    else if (kind === 'Vanilla.StatTracker.EnemyDeath') add('enemy', data.id, 'enemy');
    else if (kind === 'Vanilla.StatTracker.TongueDodge') {
        add('source', data.source, 'enemy'); add('target', data.target, 'player');
    } else if (kind === 'Vanilla.StatTracker.Damage') {
        if (data.type === 'Explosive') {
            const mine = mineOwners.get(data.source as number);
            add('source', mine?.snet ?? data.source, mine ? 'player' : 'entity');
        } else if (data.type !== 'Fall') {
            const enemySource = data.type === 'Tongue' || data.type === 'Projectile';
            add('source', data.source, enemySource ? (enemies.has(data.source as number) ? 'enemy' : 'entity') : 'player');
        }
        add('target', data.target, enemies.has(data.target as number) ? 'enemy' : 'player');
    }
    return result;
}
