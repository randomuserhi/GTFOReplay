import { html, Macro, MacroElement, RHU_CHILDREN } from "@esm/@/rhu/macro.js";
import { signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    width: 60px;
    height: 100%;
    background-color: #050506; /*TODO: Theme-ColorScheme*/

    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    `;

    const button = css.class`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    position: relative;
    width: 60px;
    height: 60px;
    padding: 20px 20px 20px 15px;
    color: #B9BBBE; /*TODO: Theme-ColorScheme*/
    `;
    css`
    ${button}:focus {
        outline:0;
    }
    ${button}:hover {
        background-color: #272733; /*TODO: Theme-ColorScheme*/
    }
    `;

    const highlight = css.class`
    width: 5px;
    height: 10px;
    background-color: white;
    border-radius: 100px;
    margin-right: 5px;
    visibility: hidden;
    transition: all ease-in-out 200ms;
    `;

    const selected = css.class`
        padding: 20px 15px 20px 15px;
    `;

    css`
    ${selected} ${highlight} {
        height: 30px;
        margin-right: 10px;
        visibility: visible;
    }
    `;
    
    return {
        wrapper,
        button,
        highlight,
        selected
    };
});

export const Button = Macro(class Button extends MacroElement {
    public button: HTMLButtonElement;
    private icon: HTMLSpanElement;

    public toggle = signal(false);

    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN) {
        super(dom, bindings);

        this.icon.replaceWith(...children);

        this.toggle.on((value) => {
            if (value) this.button.classList.add(`${style.selected}`);
            else this.button.classList.remove(`${style.selected}`);
        });
    }
}, html`
    <button m-id="button" class="${style.button}">
        <div class="${style.highlight}"></div>
        <span m-id="icon"></span>
    </button>
    `);

export const Bar = Macro(class Bar extends MacroElement {
    private mount: HTMLDivElement;
    
    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN) {
        super(dom, bindings);

        this.mount.append(...children);
    }
}, html`<div m-id="mount" class="${style.wrapper}"></div>`);