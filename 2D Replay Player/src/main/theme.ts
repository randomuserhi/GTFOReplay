declare namespace RHU {
    interface Modules {
        "main/theme": Style.ClassName<{
            fullWhite: Theme.ThemeVariable;
            orangePrimary: Theme.ThemeVariable;
        }>;
    }
}

// TODO(randomuserhi): Better organised and named color scheme => research how its normally done

RHU.module(new Error(), "main/theme", { 
    Theme: "rhu/theme" 
}, function({ Theme }) {
    const theme = Theme(({ theme }) => {
        return {
            fullWhite: theme`#fff`,
            orangePrimary: theme`#ff3d00`,
        };
    });

    return theme;
});