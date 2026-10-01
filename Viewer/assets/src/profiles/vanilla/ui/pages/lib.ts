import { Style } from "@esm/@/rhu/style.js";

export const pageStyles = Style(({ css }) => {
    const wrapper = css.class`
    position: relative;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
    padding: 20px 18px;
    color: #edf0f4;
    font-size: 13px;
    `;
    css`
    ${wrapper} h1 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 32px 8px 0;
    }
    `;

    const search = css.class`
    box-sizing: border-box;
    min-width: 0;
    background-color: #202732;
    padding: 7px 10px;
    border-radius: 6px;
    border: 1px solid #35404b;
    color: #edf0f4;
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
    border-bottom-color: #edf0f4;
    `;

    const body = css.class`
    display: flex;
    flex-direction: column;
    gap: 20px;
    `;

    return {
        wrapper,
        search,
        row,
        divider,
        body
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
