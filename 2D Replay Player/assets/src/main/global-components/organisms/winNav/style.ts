declare namespace RHU {
    interface Modules {
        "components/organisms/winNav/style": {
            wrapper: RHU.Style.ClassName;
            button: RHU.Style.ClassName;
            text: RHU.Style.ClassName;
        };
    }
}

RHU.module(new Error(), "components/organisms/winNav/style",
    { Style: "rhu/style", theme: "main/theme" },
    function({ Style }) {
        const style = Style(({ style }) => {
            const wrapper = style.class`
            display: flex;
            justify-content: flex-start;
            flex-direction: row-reverse;
            align-items: stretch;
            height: 22px;
            background-color: #11111B; /*TODO: Theme-ColorScheme*/

            z-index: 3001;
            -webkit-app-region: drag;
            -ms-flex-negative: 0;
            flex-shrink: 0;
            `;
            const button = style.class`
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            position: relative;
            width: 28px;
            height: 22px;
            color: #B9BBBE; /*TODO: Theme-ColorScheme*/

            -webkit-app-region: no-drag;
            pointer-events: auto;
            `;
            style`
            ${button}:hover {
                background-color: #272733; /*TODO: Theme-ColorScheme*/
            }
            `;
            const text = style.class`
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 100%;
            margin-left: 10px;
            color: white;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 0.75rem;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            `;

            return {
                wrapper,
                button,
                text
            };
        });

        return style;
    }
);