import { Constructor, Macro } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/pause": pause;
    }
}

export interface pause extends SVGElement {
}

export const pause = Macro((() => {
    const pause = function(this: pause) {
    } as Constructor<pause>;

    return pause;
})(), "atoms/icons/pause", //html
`
    <path fill="currentColor" d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path>
    `, {
    element: //html
        `<svg aria-hidden="false" style="width: 100%; height: 100%;" viewBox="0 0 36 36"></svg>`
});