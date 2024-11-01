import { html, Macro } from "@/rhu/macro.js";
import { SVGIcon } from "./lib.js";

export const chevronRight = Macro(SVGIcon, () => html`
    <svg aria-hidden="false" width="16" height="16" viewBox="0 0 16 16">
        <path fill="currentColor" fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
    </svg>
    `);