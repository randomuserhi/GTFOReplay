import { html, Mutable } from "@esm/@/rhu/html.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { dispose } from "../main.js";
export const Dropdown = (label = "Select") => {
    const dom = html<Mutable<{ value: Signal<any>; options: Signal<[string, any][]>; wrapper: HTMLDivElement }>>`<div m-id="wrapper"></div>`;
    html(dom).box();
    dom.value = signal<any>(undefined);
    dom.options = signal<[string, any][]>([], (a, b) => a?.length === b?.length && a?.every((entry, i) => entry[0] === b![i][0] && entry[1] === b![i][1]) === true);
    const props = () => ({
        label: window.ReplayInterface.ui(label),
        value: String(dom.options().findIndex(entry => entry[1] === dom.value())),
        options: dom.options().map(([label], i) => ({ label, value: String(i) })),
        disabled: dom.options().length === 0,
        onChange: (value: string) => dom.value(dom.options()[Number(value)]?.[1])
    });
    const mounted = window.ReplayInterface.mountSelect(dom.wrapper, props());
    const update = () => mounted.update(props());
    dom.value.on(update, { signal: dispose.signal }); dom.options.on(update, { signal: dispose.signal });
    window.addEventListener("replay-language-changed", update, { signal: dispose.signal });
    dispose.signal.addEventListener("abort", () => mounted.unmount(), { once: true });
    return dom;
};
