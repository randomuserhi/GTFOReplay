import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    position: relative;
    width: 100%;
    height: 100%;
    `;

    const bar = style.class`
    position: absolute;
    bottom: 0px;
    top: 0px;
    height: 3px;
    width: 100%;
    background-color: #eee;
    `;

    return {
        wrapper,
        bar
    };
});

export interface seeker extends HTMLDivElement {
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.seeker": seeker;
    }
}

export const seeker = Macro((() => {
    const seeker = function(this: seeker) {
        
    } as Constructor<seeker>;

    return seeker;
})(), "routes/player.seeker", //html
`
    <div class="${style.bar}"></div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});