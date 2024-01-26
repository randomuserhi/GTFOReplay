declare namespace RHU {
    interface Modules {
        "docuscript/@style": {
            body: Style.ClassName;
            block: Style.ClassName;
            center: Style.ClassName;
        };
    }
}

RHU.module(new Error(), "docuscript/@style",
    { Style: "rhu/style" },
    function({ Style }) {
        const style = Style(({ style }) => {
            const body = style.class`
            `;

            const block = style.class`
            width: 100%;
            `;

            const center = style.class`
            width: 100%;
            `;
            style`
            ${center}>* {
                margin: 0 auto;
            }
            `;

            // ITALICS & BOLD
            style`
            ${body} i {
                font-style: italic;
            }
            ${body} b {
                font-weight: bold;
            }
            `;

            // HEADINGS
            style`
            ${body} h1, h2, h3, h4, h5, h6 {
                padding-bottom: 8px;
                padding-top: 16px;
                font-weight: 700;
            }

            ${body} h1 {
                font-size: 2rem;
            }
            ${body} h2 {
                font-size: 1.8rem;
            }
            ${body} h3 {
                font-size: 1.5rem;
            }
            ${body} h4 {
                font-size: 1.3rem;
            }
            ${body} h5 {
                font-size: 1.125rem;
            }
            ${body} h6 {
                font-size: 1rem;
            }
            `;

            return {
                body,
                block,
                center
            };
        });

        return style;
    }
);