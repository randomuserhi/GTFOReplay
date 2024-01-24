RHU.module(new Error(), "components/organisms/navbar", {
    Macro: "rhu/macro", style: "components/organsisms/navbar/style",
    arrowDown: "components/atoms/icons/arrowDown",
}, function ({ Macro, style, arrowDown, }) {
    const navbar = Macro((() => {
        const navbar = function () {
        };
        return navbar;
    })(), "organisms/navbar", `
        <nav class="${style.margin}">
            <!-- LOGO -->
            <svg class="${style.logo}" viewBox="0 0 26 15" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="m5 0-5 15 6 0 5-15-6 0m10 15 5-15 6 0-5 15-6 0"/>
            </svg>
            <nav class="${style.controls}">
                <!--<div>
                    <button class="${style.controls.dropdown}">
                        Blogs
                        ${arrowDown `style="height: 1.3rem;"`}
                    </button>
                </div>
                <a>What's New</a>-->
            </nav>
            <!-- Spacer -->
            <div style="flex: 1;"></div>
            <!--<button rhu-id="menuBtn" class="${style.menu}">
                <span rhu-id="chevron" class="${style.menu.button}"></span>
            </button>-->
            <button rhu-id="githubBtn" class="${style.profile}">
                <div>
                    <a style="position: relative; display: inline-block;" href="https://github.com/randomuserhi/" target="blank">
                        <!-- profile image -->
                        <img rhu-id="avatar" class="${style.profile.avatar}" src="https://avatars.githubusercontent.com/u/40913834?s=40&v=4"/>
                        <!-- notification circle -->
                        <span rhu-id="notif" class="${style.profile.avatar.notif}"></span>
                    </a>
                    <!-- dropdown -->
                    <!--${arrowDown `class="${style.profile.dropdown}" style="height: 1.3rem;"`}-->
                </div>
            </button>
        </nav>
        `, {
        element: `<header class="${style.wrapper}"></header>`
    });
    return navbar;
});
