import { Constructor, Macro } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/info": info;
    }
}

export interface info extends SVGElement {
}

export const info = Macro((() => {
    const info = function(this: info) {
    } as Constructor<info>;

    return info;
})(), "atoms/icons/info", //html
`
    <g id="Warning / Info"><path id="Vector" d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>
    `, {
    element: //html
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style="width: 100%; height: 100%;"></svg>`
});