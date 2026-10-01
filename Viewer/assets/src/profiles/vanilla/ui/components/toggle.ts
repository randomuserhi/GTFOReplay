import { html } from "@esm/@/rhu/html.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { dispose } from "../main.js";
export const Toggle = (label = "Toggle") => {
    const dom = html<{ value: Signal<boolean>; mount: HTMLSpanElement }>`<span m-id="mount"></span>`;
    html(dom).box(); dom.value = signal(false);
    const mounted = window.ReplayInterface.mountSwitch(dom.mount, false, value => dom.value(value), window.ReplayInterface.ui(label));
    const update = () => mounted.update(dom.value(), window.ReplayInterface.ui(label));
    dom.value.on(update, { signal: dispose.signal });
    window.addEventListener("replay-language-changed", update, { signal: dispose.signal });
    dispose.signal.addEventListener("abort", () => mounted.unmount(), { once: true });
    return dom;
};
