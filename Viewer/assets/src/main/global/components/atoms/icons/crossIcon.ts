import { html, Macro } from "@/rhu/macro.js";
import { SVGIcon } from "./lib.js";

export const cross = Macro(SVGIcon, html`
    <svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
        <polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon>
    </svg>
    `);