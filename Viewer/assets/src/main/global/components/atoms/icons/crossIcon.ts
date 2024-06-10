import { Macro, Constructor } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/cross": cross;
    }
}

export interface cross extends SVGElement {
}

export const cross = Macro((() => {
    const cross = function(this: cross) {
    } as Constructor<cross>;

    return cross;
})(), "atoms/icons/cross", //html
`
    <polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon>
    `, {
    element: //html
        `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"></svg>`
});