import { Macro, Constructor } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/line": line;
    }
}

export interface line extends SVGElement {
}

export const line = Macro((() => {
    const line = function(this: line) {
    } as Constructor<line>;

    return line;
})(), "atoms/icons/line", //html
`
    <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
    `, {
    element: //html
        `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"></svg>`
});