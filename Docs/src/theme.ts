declare namespace RHU {
    interface Modules {
        "main/theme": Style.ClassName<{
            defaultColor: Theme.ThemeVariable;
            fullWhite: Theme.ThemeVariable;
            fullBlack: Theme.ThemeVariable;
            hoverPrimary: Theme.ThemeVariable;
            backgroundPrimary: Theme.ThemeVariable;
            backgroundAccent: Theme.ThemeVariable;
        }>;
    }
}

// TODO(randomuserhi): Better organised and named color scheme => research how its normally done

RHU.module(new Error(), "main/theme", { 
    Theme: "rhu/theme" 
}, function({ Theme }) {
    const theme = Theme(({ theme }) => {
        return {
            defaultColor: theme`rgba(255, 255, 255, 0.8)`,
            fullWhite: theme`white`,
            fullBlack: theme`black`,
            hoverPrimary: theme`#2997ff`,
            backgroundPrimary: theme`#0071e3`,
            backgroundAccent: theme`#147ce5`,
        };
    });

    return theme;
});