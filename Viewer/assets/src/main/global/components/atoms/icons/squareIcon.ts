import { Macro, MacroWrapper } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/square": MacroWrapper<SVGElement>;
    }
}

export const square = Macro(MacroWrapper<SVGElement>, "atoms/icons/square", //html
    `
    <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect>
    `, {
        element: //html
        `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"></svg>`
    });