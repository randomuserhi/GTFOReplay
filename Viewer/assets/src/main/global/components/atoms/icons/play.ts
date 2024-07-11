import { Macro, MacroWrapper } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/play": MacroWrapper<SVGElement>;
    }
}

export const play = Macro(MacroWrapper<SVGElement>, "atoms/icons/play", //html
    `
    <path fill="currentColor" d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path>
    `, {
        element: //html
        `<svg aria-hidden="false" style="width: 100%; height: 100%;" viewBox="0 0 36 36"></svg>`
    });