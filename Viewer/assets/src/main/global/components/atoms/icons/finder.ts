import { Constructor, Macro } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/finder": finder;
    }
}

export interface finder extends SVGElement {
}

export const finder = Macro((() => {
    const finder = function(this: finder) {
    } as Constructor<finder>;

    return finder;
})(), "atoms/icons/finder", //html
`
    <g><path fill="none" d="M0 0h24v24H0z"/><path fill="currentcolor" d="M18 2a1 1 0 0 1 1 1v8.529A6 6 0 0 0 9 16c0 3.238 2.76 6 6 6H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12zm-3 10a4 4 0 0 1 3.446 6.032l2.21 2.21-1.413 1.415-2.211-2.21A4 4 0 1 1 15 12zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></g>
    `, {
    element: //html
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 100%; height: 100%"></svg>`
});