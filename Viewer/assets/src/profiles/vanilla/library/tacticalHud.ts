import type { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import type { GameplayInfo } from "../parser/events/gameplayinfo.js";

export function tacticalState(api: ReplayApi, dimension: number) {
    const info = [...(api.get("Vanilla.Gameplay.Info")?.values() ?? [])];
    const latest = (channel: string) => {
        let newest: GameplayInfo | undefined;
        for (const row of info) if (row.channel === channel && (!newest || row.time > newest.time)) newest = row;
        return newest;
    };
    const transient = (row: GameplayInfo | undefined) => row && api.time() >= row.time && api.time() - row.time < 12000 ? row : undefined;
    const statuses = api.get("Vanilla.Bioscan.Status");
    const scanInfo = api.get("Vanilla.Bioscan.Info");
    const scans = [...(api.get("Vanilla.Bioscan")?.values() ?? [])].filter(scan => scan.dimension === dimension).map(scan => {
        const meta = scanInfo?.get(scan.id), progress = statuses?.get(scan.id)?.progress;
        return {
            id: scan.id,
            title: meta?.exit ? 'EXTRACTION SCAN' : meta?.alarm ? 'ALARM SCAN' : 'BIOSCAN',
            percent: progress === undefined || !Number.isFinite(progress) ? undefined : Math.round(Math.max(0, Math.min(1, progress)) * 100),
            detail: meta ? [meta.requirement === 'All' ? 'Team scan' : meta.requirement === 'Solo' ? 'Single-player scan' : 'Scan', `${meta.players}/${meta.required} players`, meta.missingItems ? `${meta.missingItems} required items missing` : '', meta.state === 2 ? 'Waiting' : 'Scanning'].filter(Boolean).join(' · ') : ''
        };
    }).sort((a, b) => Number(b.title === 'EXTRACTION SCAN') - Number(a.title === 'EXTRACTION SCAN') || a.id - b.id);
    const animations = api.get("Vanilla.Enemy.Animation");
    const enemies = [...(api.get("Vanilla.Enemy")?.values() ?? [])].filter(enemy => enemy.dimension === dimension && enemy.health > 0 && !animations?.get(enemy.id)?.state.startsWith('Dead'));
    const alertData = api.get("Vanilla.Enemy.Alert") as { values?: () => Iterable<{ enemy: number }> } | undefined;
    const alerts = Array.isArray(alertData) ? alertData : [...((alertData?.values?.() as Iterable<{ enemy: number }>) ?? [])];
    const alarmedIds = new Set<number>();
    const enemyIds = new Set(enemies.map(enemy => enemy.id));
    for (const alert of alerts) {
        if (enemyIds.has(alert.enemy)) alarmedIds.add(alert.enemy);
    }
    return { scans,
        alarmed: alarmedIds.size,
        objective: latest('Objective'), timer: latest('Timer'), terminal: transient(latest('Terminal')),
        alarms: info.filter(row => row.channel === 'Alarm' && row.text), waves: info.filter(row => row.channel === 'Wave' && row.text) };
}
