RHU.module(new Error(), "components/organsisms/docpages/style", { Style: "rhu/style" }, function ({ Style }) {
    const style = Style(({ style }) => {
        const wrapper = style.class `
            padding: 0 70px;
            `;
        style `
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${wrapper} {
                    padding: 0px 7px;
                }
            }
            `;
        const margin = style.class `
            width: 100%;
            max-width: 1800px;

            margin: 0 auto;

            display: flex;
            `;
        const sidebar = style.class `
            `;
        style `
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${sidebar} {
                    display: none;
                }
            }
            `;
        const page = style.class `
            display: flex;
            width: 100%;
            `;
        const content = style.class `
            padding: 0 15px;
            flex: 1;
            `;
        const outline = style.class `
            position: relative;
            flex: 0.5;
            flex-shrink: 0;
            `;
        style `
            @media screen and (max-width: 950px) { /* if width <= 950 */
                ${outline} {
                    display: none;
                }
            }
            `;
        outline.hidden = style.class `
            display: none;
            `;
        outline.content = style.class `
            position: sticky;
            top: var(--Navbar_height);
            height: calc(100vh - var(--Navbar_height));
            overflow-y: auto;
            padding: 8px;
            `;
        const headeritem = style.class `
            cursor: pointer;
            -webkit-user-select: none;
            user-select: none;
            text-decoration: inherit;
            `;
        style `
            ${headeritem}:hover {
                text-decoration: underline;
            }`;
        headeritem.align = style.class `
            align-self: stretch;
            flex-shrink: 0;
            display: flex;
            `;
        headeritem.children = style.class `
            display: none;
            padding-left: 10px;
            `;
        headeritem.content = style.class `
            display: flex;
            align-items: center;
            `;
        headeritem.nochildren = style.class ``;
        headeritem.dropdown = style.class `
            display: flex;
            align-items: start;
            `;
        style `
            ${headeritem.dropdown}::before {
                margin-top: 0.4rem;
                font-family: docons;
                font-size: .55rem;
                font-weight: 600;
                padding: 0 3px;
                content: "Ｔ";

                transition: transform .15s ease-in-out;
                transform: rotate(0);
            }
            ${headeritem.dropdown}:hover {
                cursor: pointer;
            }

            ${headeritem.nochildren}${headeritem.dropdown}::before {
                opacity: 0;
                pointer-events: none;
            }
            ${headeritem.nochildren}${headeritem.dropdown}:hover {
                cursor: unset;
            }
            `;
        headeritem.expanded = style.class ``;
        style `
            ${headeritem.expanded}>${headeritem.children} {
                display: block;
            }
            ${headeritem.expanded}>${headeritem.content}>${headeritem.align}>${headeritem.dropdown}::before {
                transform: rotate(90deg);
            }
            `;
        const path = style.class `
            display: flex;
            padding: 8px 0;
            `;
        style `
            ${path} li {
                flex-shrink: 0;
                text-wrap: nowrap;
            }
            ${path} > li::after {
                content: "/";
                padding: 3px; 0;
            }
            `;
        path.item = style.class `
            cursor: pointer;
            -webkit-user-select: none;
            user-select: none;
            text-decoration: inherit;
            `;
        style `
            ${path.item}:hover {
                text-decoration: underline;
            }
            `;
        return {
            wrapper,
            margin,
            sidebar,
            page,
            content,
            outline,
            headeritem,
            path,
        };
    });
    return style;
});
