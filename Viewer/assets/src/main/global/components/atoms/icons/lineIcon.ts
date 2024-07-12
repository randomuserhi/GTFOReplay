import { html, Macro, MacroElement } from "@/rhu/macro.js";

export const line = Macro(MacroElement, html`
    <svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
        <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
    </svg>
    `);