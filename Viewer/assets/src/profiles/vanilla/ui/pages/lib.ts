import { Style } from "@esm/@/rhu/style.js";

export const pageStyles = Style(({ css }) => {
    const wrapper = css.class`
    position: relative;
    width: 400px;
    padding: 20px;
    color: white;
    font-size: 15px;
    `;
    css`
    ${wrapper} h1 {
        font-size: 30px;
    }
    `;

    const search = css.class`
    background-color: #12121a;
    padding: 7px 10px;
    border-radius: 3px;
    color: white;
    width: 100%;
    `;

    const row = css.class`
    width: 100%;
    display: flex;
    flex-direction: column;
    `;

    const divider = css.class`
    width: 100%;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: white;
    `;

    const body = css.class`
    display: flex;
    flex-direction: column;
    gap: 30px;
    `;

    const active = css.class``;
    const toggle = css.class`
    width: 50px;
    height: 15px;
    border-radius: 100px;
    border-style: solid;
    border-width: 3px;

    --color: #7169ce;
    border-color: var(--color);
    background-color: transparent;
    transition: all ease-in-out 100ms;
    `;
    css`
    ${toggle}:hover {
        --color: #bfb9eb;
    }
    ${toggle}${active} {
    background-color: var(--color);
    }
    `;

    return {
        wrapper,
        search,
        row,
        divider,
        body,
        toggle,
        active
    };
});

export function setInputFilter(textbox: Element, inputFilter: (value: string) => boolean): void {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop", "focusout" ].forEach(function(event) {
        textbox.addEventListener(event, function(this: (HTMLInputElement | HTMLTextAreaElement) & { oldValue: string; oldSelectionStart: number | null, oldSelectionEnd: number | null }) {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (Object.prototype.hasOwnProperty.call(this, "oldValue")) {
                this.value = this.oldValue;
          
                if (this.oldSelectionStart !== null &&
            this.oldSelectionEnd !== null) {
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                }
            } else {
                this.value = "";
            }
        });
    });
}