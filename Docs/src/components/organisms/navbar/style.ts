declare namespace RHU {
    interface Modules {
        "components/organsisms/navbar/style": {
            active: Style.ClassName;
            wrapper: Style.ClassName;
            margin: Style.ClassName;
            logo: Style.ClassName;
            controls: Style.ClassName<{
                dropdown: Style.ClassName;
            }>;
            menu: Style.ClassName<{
                button: Style.ClassName;
            }>;
            profile: Style.ClassName<{
                avatar: Style.ClassName<{
                    notif: Style.ClassName;
                }>;
                dropdown: Style.ClassName;
            }>;
        };
    }
}

RHU.module(new Error(), "components/organsisms/navbar/style",
    { Style: "rhu/style", theme: "main/theme" },
    function({ Style, theme }) {
        const style = Style(({ style }) => {
            const active = style.class``;

            style/*css*/`
            :root
            {
                --Navbar_height: 80px;
            }
            @media screen and (max-width: 780px) /* if width <= 780 */
            {
                :root
                {
                    --Navbar_height: 60px;
                }
            }

            html
            {
                scroll-padding-top: var(--Navbar_height);
            }
            `;
            const wrapper = style.class`
            display: flex;

            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;

            width: 100%;
            height: var(--Navbar_height);
            padding: 7px 70px;

            background-color: ${theme.fullBlack};
            color: ${theme.defaultColor};
            `;
            style/*css*/`
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${wrapper} {
                    padding: 7px 30px;
                }
            }
            `;

            const margin = style.class`
            width: 100%;
            max-width: 1200px;

            margin: 0 auto;

            display: flex;
            `;

            const logo = style.class`
            height: 100%; 
            padding: 15px 70px 15px 0;
            color: ${theme.defaultColor};
            transition: 
                color 100ms ease-out,
                background-color 100ms ease-out
                ;
            `;
            style/*css*/`
            ${logo}:hover {
                color: rgba(255, 255, 255, 1);
            }
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${logo} {
                    padding: 15px 0;
                    max-width: 80px;
                }
            }
            `;

            const controls = style.class<{ 
                dropdown: RHU.Style.ClassName;
            }>`
            display: flex;
            gap: 15px;
            justify-content: center;
            align-items: center;
            min-width: 100px;
            `;
            style/*css*/`
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${controls} {
                    display: none;
                }
            }
            ${controls} a
            {
                cursor: pointer;
                transition: color 100ms ease-out;
            }
            ${controls} a:hover {
                color: ${theme.hoverPrimary};
            }
            `;

            controls.dropdown = style.class`
            display: flex;
            justify-content: center;
            gap: 3px;
        
            padding: 5px;
            padding-left: 10px;
            border-radius: 5px;
        
            color: inherit;
            transition: 
                color 100ms ease-out,
                background-color 100ms ease-out
                ;
            `;
            style/*css*/`
            ${controls.dropdown}:hover {
                background-color: transparent;
                color: ${theme.hoverPrimary};
            }
            `;

            const menu = style.class<{
                button: RHU.Style.ClassName;
            }>`
            display: none;
            `;
            style/*css*/`
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${menu} {
                    display: flex;
                    align-items: center;
                }
            }
            `;

            menu.button = style.class`
            display: block;
            position: relative;
            width: 40px;
            height: 75%;
            z-index: 1;
            transform: translateY(8px);
            transition: transform 1s cubic-bezier(0.86, 0, 0.07, 1),transform-origin 1s cubic-bezier(0.86, 0, 0.07, 1);
            `;
            style/*css*/`
            ${menu.button}${active} {
                transform: translateY(0px);
            }

            ${menu.button}::before {
                content: "";
                display: block;
                box-sizing: content-box;
                position: absolute;
                top: 13px;
                width: 11px;
                height: 1px;
                z-index: 1;
                transition: transform 1s cubic-bezier(0.86, 0, 0.07, 1),transform-origin 1s cubic-bezier(0.86, 0, 0.07, 1);
                background: white;

                transform-origin: 100% 100%;
                transform: rotate(40deg) scaleY(1.1);

                right: 50%;
                border-radius: 0.5px 0 0 0.5px;
            }
            ${menu.button}${active}::before
            {
                transform-origin: 100% 0%;
                transform: rotate(-40deg) scaleY(1.1);
            }
            ${menu.button}::after
            {
                content: "";
                display: block;
                box-sizing: content-box;
                position: absolute;
                top: 13px;
                width: 11px;
                height: 1px;
                z-index: 1;
                transition: transform 1s cubic-bezier(0.86, 0, 0.07, 1),transform-origin 1s cubic-bezier(0.86, 0, 0.07, 1);
                background: white;

                transform-origin: 0% 100%;
                transform: rotate(-40deg) scaleY(1.1);

                left: 50%;
                border-radius: 0 0.5px 0.5px 0;
            }
            ${menu.button}${active}::after
            {
                transform-origin: 0% 0%;
                transform: rotate(40deg) scaleY(1.1);
            }
            `;

            const profile = style.class<{
                avatar: RHU.Style.ClassName<{
                    notif: RHU.Style.ClassName;
                }>;
                dropdown: RHU.Style.ClassName;
            }>``;
            style/*css*/`
            ${profile}>div {
                display:flex;
                gap: 5px;
                align-items: center;
                color: ${theme.defaultColor};
            }
            ${profile}:hover>div {
                color: ${theme.fullWhite};
            }
            `;

            profile.dropdown = style.class`
            display: inline;
            `;
            style/*css*/`
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${profile.dropdown} {
                    display: none;
                }
            }
            `;

            profile.avatar = style.class`
            width: 30px;
            height: 30px;
            border-radius: 50%;
            `;
            style/*css*/`
            @media screen and (max-width: 780px) { /* if width <= 780 */
                ${profile.avatar} {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;       
                }
            }
            `;

            profile.avatar.notif = style.class`
            display: none;

            border-width: 2px;
            border-style: solid;
            border-color: black;
            border-radius: 50%;

            position: absolute;
            top: 0;
            right: 0;

            width: 13px;
            height: 13px;

            background-image: linear-gradient(#54a3ff, #006eed);

            transform: translate(25%, -25%);
            `;
            style/*css*/`
            ${profile.avatar.notif}${active} {
                display: inline;
            }
            `;

            return {
                active,
                wrapper,
                margin,
                logo,
                controls,
                menu,
                profile,
            };
        });

        return style;
    }
);