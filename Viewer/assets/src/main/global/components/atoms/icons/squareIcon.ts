import { html, Macro, MacroElement } from "@/rhu/macro.js";

export const square = Macro(MacroElement, html`
    <svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
        <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect>
    </svg>
    `);