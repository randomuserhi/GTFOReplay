RHU.module(new Error(), "main/theme", {
    Theme: "rhu/theme"
}, function ({ Theme }) {
    const theme = Theme(({ theme }) => {
        return {
            defaultColor: theme `rgba(255, 255, 255, 0.8)`,
            fullWhite: theme `white`,
            fullBlack: theme `black`,
            hoverPrimary: theme `#2997ff`,
            backgroundPrimary: theme `#0071e3`,
            backgroundAccent: theme `#147ce5`,
        };
    });
    return theme;
});
