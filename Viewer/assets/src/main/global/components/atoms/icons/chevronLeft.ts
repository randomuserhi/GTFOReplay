import { html, Macro } from "@/rhu/macro.js";
import { SVGIcon } from "./lib.js";

export const chevronLeft = Macro(SVGIcon, () => html`
    <svg aria-hidden="false" width="16" height="16" viewBox="0 0 16 16">
        <path fill="currentColor" fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
    </svg>
    `);