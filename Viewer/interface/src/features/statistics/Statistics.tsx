import { notify } from "../../components/feedback/overlays";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IntervalPlayerStats, PlaybackAdapter, RunStatistics } from "../../../../assets/src/main/interface";
import { formatTime } from "../../time";

export function Statistics({ adapter, start, end }: { adapter: PlaybackAdapter; start: number; end: number }) {
    const { t, i18n } = useTranslation();
    const [result, setData] = useState<RunStatistics>({ players: [], confirmedEnemyDeaths: null });
    const data = result.players;
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        setLoading(true); setError("");
        adapter.statistics(start, end).then(value => { if (active) setData(value); }, error => { if (active) { setError(String(error)); notify(`${t("statsError")} ${error}`); } }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [adapter, start, end]);
    const metrics = ["damage", "kills", "assists", "shots", "hits", "accuracy", "revives", "packs", "packsConsumed"] as const;
    const [sorting, setSorting] = useState<{ metric: typeof metrics[number]; descending: boolean }>({ metric: "damage", descending: true });
    const metricValue = (player: IntervalPlayerStats, metric: typeof metrics[number]) => metric === "accuracy" ? player.shots && player.hits !== null ? player.hits / player.shots : null : player[metric];
    const players = [...data].sort((a, b) => {
        const left = metricValue(a, sorting.metric), right = metricValue(b, sorting.metric);
        if (left === null) return right === null ? 0 : 1;
        if (right === null) return -1;
        return (left - right) * (sorting.descending ? -1 : 1);
    });
    const format = (player: IntervalPlayerStats, metric: typeof metrics[number]) => {
        if (metric === "accuracy") return player.shots && player.hits !== null ? (player.hits / player.shots).toLocaleString(i18n.language, { style: "percent", maximumFractionDigits: 1 }) : "—";
        return player[metric]?.toLocaleString(i18n.language, { maximumFractionDigits: 1 }) ?? "—";
    };
    return <section className="stats-panel" aria-label={t("statistics")}>
        <div className="stats-intro"><span>{formatTime(start)} – {formatTime(end)}</span><p className="muted">{t("statsScope")}</p></div>
        {!loading && !error && <div className="stats-confirmed-deaths"><p><span>{t("statsConfirmedDeaths")}</span><strong>{result.confirmedEnemyDeaths?.toLocaleString(i18n.language) ?? "—"}</strong></p><p className="muted">{t("statsClientHint")}</p></div>}
        {loading ? <p role="status">{t("loadingSegment")}</p> : error ? <p role="alert">{t("statsError")} {error}</p> : data.length === 0 ? <p>{t("emptyStats")}</p> :
            <div className="stats-table-scroll" tabIndex={0} role="region" aria-label={t("statistics")}><table style={{ minWidth: 88 + data.length * 56 }}>
                <colgroup><col className="stats-metric-column" />{data.map((_, index) => <col key={index} />)}</colgroup>
                <thead><tr><th scope="col">{t("statsMetric")}</th>{players.map((player, index) => <th scope="col" key={index} title={player.player}>{player.player}</th>)}</tr></thead>
                <tbody>{metrics.map(metric => <tr key={metric}><th scope="row" aria-sort={sorting.metric === metric ? sorting.descending ? "descending" : "ascending" : "none"}>
                    <button className="stats-sort" onClick={() => setSorting({ metric, descending: sorting.metric !== metric || !sorting.descending })}>{t(`stats.${metric}`)}{sorting.metric === metric && (sorting.descending ? <ArrowDown /> : <ArrowUp />)}</button>
                </th>{players.map((player, index) => <td key={index}>{format(player, metric)}</td>)}</tr>)}</tbody>
            </table></div>}
        <details className="stats-coverage"><summary>{t("statsCoverage")}</summary><p className="muted">{t("statsHint")}</p></details>
    </section>;
}
