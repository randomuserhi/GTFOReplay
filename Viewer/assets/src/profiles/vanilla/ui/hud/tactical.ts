import { html } from "@esm/@/rhu/html.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "../../../../main/routes/player/components/view/index.js";
import { tacticalState } from "../../library/tacticalHud.js";
import { dispose } from "../main.js";

const style = Style(({ css }) => {
    const panel = css.class`
        position:absolute;left:24px;right:24px;top:24px;bottom:112px;
        color:#edf0f4;pointer-events:none;color-scheme:dark;
        font:13px/1.45 "Segoe UI","Microsoft YaHei UI",sans-serif;font-variant-numeric:tabular-nums;
        text-shadow:0 1px 3px #000,0 1px 1px #000;white-space:pre-wrap;overflow-wrap:anywhere;
    `;
    css`${panel} .objective {box-sizing:border-box;width:min(420px,100%);padding:10px 12px 11px;border-left:2px solid #dba852;background:#111820dc;box-shadow:0 5px 18px #00000045;pointer-events:auto;text-shadow:none;}
    ${panel} .objective summary {display:flex;align-items:center;justify-content:space-between;gap:12px;color:#e5ba68;cursor:pointer;list-style:none;font-family:Oxanium,"Segoe UI",sans-serif;font-size:12px;font-weight:600;letter-spacing:.08em;user-select:none;}
    ${panel} .objective summary::-webkit-details-marker {display:none;}
    ${panel} .objective summary::after {content:"−";color:#a7b1c1;font:16px/1 "Segoe UI",sans-serif;}
    ${panel} .objective:not([open]) summary::after {content:"+";}
    ${panel} .objective summary:focus-visible {outline:2px solid #dba852;outline-offset:4px;}
    ${panel} .objective p {margin:7px 0 0;color:#d3dce3;font-size:13px;line-height:1.5;}
    ${panel} .objective + .scans {margin-top:12px;}
    ${panel} .scans {width:min(300px,100%);max-height:50%;overflow:auto;scrollbar-width:thin;scrollbar-color:#c2ccd766 transparent;pointer-events:auto;}
    ${panel} .messages {position:absolute;bottom:0;left:0;width:min(340px,100%);max-height:40%;overflow:auto;scrollbar-width:thin;scrollbar-color:#c2ccd766 transparent;pointer-events:auto;}
    ${panel} section + section {margin-top:16px;}
    ${panel} strong {display:block;font-family:Oxanium,"Segoe UI",sans-serif;font-size:13px;font-weight:500;letter-spacing:.025em;}
    ${panel} small {display:block;color:#d3dce3;font-size:12px;}
    ${panel} .scan-heading {display:flex;justify-content:space-between;align-items:baseline;gap:16px;}
    ${panel} .scan-percent {white-space:nowrap;}
    ${panel} progress {appearance:none;display:block;width:100%;height:3px;margin:9px 0 7px;border:0;border-radius:0;background:#dbe7ee40;color:#83ccf4;}
    ${panel} progress::-webkit-progress-bar {background:#dbe7ee40;border-radius:0;}
    ${panel} progress::-webkit-progress-value {background:currentColor;border-radius:0;}
    ${panel} progress::-moz-progress-bar {background:currentColor;border-radius:0;}
    ${panel} progress:indeterminate {visibility:hidden;}
    ${panel} p {margin:4px 0 0;}
    ${panel} .messages strong {color:#d3dce3;}
    ${panel} .alarm, ${panel} .alarm progress {color:#ffaaa5;}
    ${panel} .extraction progress {color:#78e5aa;}`;
    return { panel };
});

export const TacticalDisplay = () => {
    const dom = html<{wrapper: HTMLDivElement; view: Signal<html<typeof View> | undefined>}>`
        <aside m-id="wrapper" class="${style.panel}" aria-label="Scans and mission information" hidden></aside>
    `;
    html(dom).box();
    dom.view = signal<html<typeof View> | undefined>(undefined);
    let previous = '';
    dom.view.on(view => {
        previous = ''; dom.wrapper.hidden = !view;
        if (!view) return;
        view.api.on(api => {
            if (!api) { dom.wrapper.hidden = true; return; }
            const state = tacticalState(api, view.renderer.get('Dimension') ?? 0);
            const key = JSON.stringify(state);
            if (key === previous) return;
            previous = key;
            const objectiveOpen = (dom.wrapper.querySelector('.objective') as HTMLDetailsElement | null)?.open ?? true;
            const fragment = document.createDocumentFragment();
            const scans = document.createElement('div'); scans.className = 'scans';
            const messages = document.createElement('div'); messages.className = 'messages';
            const section = (title: string, text = '', className = '') => {
                const root = document.createElement('section');
                // A section without heading or body must not reserve vertical space in the panel.
                if (title) {
                    const heading = document.createElement('strong');
                    heading.textContent = title; heading.className = className; root.append(heading);
                }
                if (text) { const body = document.createElement('p'); body.textContent = text; root.append(body); }
                messages.append(root); return root;
            };
            const note = (root: HTMLElement, text: string) => { const item = document.createElement('small'); item.textContent = text; root.append(item); };
            for (const scan of state.scans) {
                const root = document.createElement('section');
                root.className = scan.title.startsWith('EXTRACTION') ? 'extraction' : scan.title.startsWith('ALARM') ? 'alarm' : '';
                const heading = document.createElement('div'); heading.className = 'scan-heading';
                const title = document.createElement('strong'); title.textContent = scan.title;
                const percent = document.createElement('span'); percent.className = 'scan-percent';
                percent.textContent = scan.percent === undefined ? '—' : `${scan.percent}%`;
                heading.append(title, percent); root.append(heading); scans.append(root);
                const bar = document.createElement('progress'); bar.max = 100;
                if (scan.percent !== undefined) bar.value = scan.percent;
                bar.setAttribute('aria-label', scan.title); root.append(bar);
                if (scan.percent === undefined) note(root, 'Progress not recorded');
                if (scan.detail) note(root, scan.detail);
            }
            if (state.objective?.text) {
                const objective = document.createElement('details'); objective.className = 'objective'; objective.open = objectiveOpen;
                const summary = document.createElement('summary'); summary.textContent = 'MISSION OBJECTIVE'; summary.title = 'Show or hide mission objective';
                const text = document.createElement('p'); text.textContent = state.objective.text;
                objective.append(summary, text); fragment.append(objective);
            }
            if (state.timer?.text) section(state.timer.title || 'COUNTDOWN', state.timer.text);
            for (const alarm of state.alarms) section(alarm.title || 'ALARM', alarm.text, 'alarm');
            for (const wave of state.waves) section(wave.title, wave.text);
            if (state.terminal?.text) section(state.terminal.title, state.terminal.text);
            if (state.alarmed > 0) section(`ALERTED ENEMIES ${state.alarmed}`);
            if (scans.childNodes.length) fragment.append(scans);
            if (messages.childNodes.length) fragment.append(messages);
            dom.wrapper.replaceChildren(fragment);
            // A tactical state without content must not leave an empty framed panel over the scene.
            dom.wrapper.hidden = dom.wrapper.childNodes.length === 0;
        }, { signal: dispose.signal });
    }, { signal: dispose.signal });
    return dom;
};
