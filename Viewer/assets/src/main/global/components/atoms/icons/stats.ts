import { html, Macro } from "@/rhu/macro.js";
import { SVGIcon } from "./lib.js";

export const stats = Macro(SVGIcon, html`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-3 0 32 32" version="1.1">
        <defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" sketch:type="MSPage"><g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-314.000000, -673.000000)" fill="currentcolor"><path d="M328,673 L326,673 C324.896,673 324,673.896 324,675 L324,703 C324,704.104 324.896,705 326,705 L328,705 C329.104,705 330,704.104 330,703 L330,675 C330,673.896 329.104,673 328,673 L328,673 Z M338,689 L336,689 C334.896,689 334,689.896 334,691 L334,703 C334,704.104 334.896,705 336,705 L338,705 C339.104,705 340,704.104 340,703 L340,691 C340,689.896 339.104,689 338,689 L338,689 Z M318,682 L316,682 C314.896,682 314,682.896 314,684 L314,703 C314,704.104 314.896,705 316,705 L318,705 C319.104,705 320,704.104 320,703 L320,684 C320,682.896 319.104,682 318,682 L318,682 Z" id="stats" sketch:type="MSShapeGroup"></path></g></g>
    </svg>
    `);