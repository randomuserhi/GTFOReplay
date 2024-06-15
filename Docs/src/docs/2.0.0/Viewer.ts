RHU.require(new Error(), { 
    docs: "docs", rhuDocuscript: "docuscript",
}, function({
    docs, rhuDocuscript,
}) {
    docs.jit = () => docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>((lib, include) => {
        const { 
            p, h1, h2, ul, frag, i, img
        } = lib;
        const { 
            cb, ic
        } = include({ cb: "code:block", ic: "code:inline" });
       
        h1("Disclaimer");
        p("The viewer is very much still in its infancy and thus many features are missing. Please be patient as I work on these.");

        h1("Camera Controls");
        ul(
            frag(ic([], `1-4`), " - Follow the player in slot 1-4."),
            frag(ic([], `WASD`), " - Classic first person movement."),
            frag(ic([], `Space`), `/`, ic([], `Cntrl`), " - Up or down along the Y-axis."),
            frag(ic([], `Scroll Wheel`), " - Increases or decreases the camera's movement speed."),
            frag(ic([], `Tab`), " - Shows the scoreboard.")
        );

        h1("Time Controls");
        ul(
            frag(ic([], `Up`), `/`, ic([], `Down`), " - Skip 10 seconds."),
            frag(ic([], `Left`), `/`, ic([], `Right`), " - Skip 5 seconds."),
            frag(ic([], `F`), " - Pause the replay."),
        );

        h1("Information");
        img("replay_information.png", "75%");
        p("Information about the loaded replay is viewable from the button in the bottom left. This will include information about whether the replay was recorded as Host or Client, what differences this makes and what version of the mod the replay was recorded on.");
        img("replay_information_panel.png", "75%");

        h1("Settings");
        img("replay_settings.png", "75%");
        p("Settings of the viewer is viewable from the button on the top left. Settings allow you to configure how the viewer behaves.");
        img("replay_settings_panel.png", "75%");

        h1("Stats");
        img("replay_stats.png", "75%");
        p("Player stats from the loaded replay is viewable from the button on the left. Select a player from the above dropdown to view their stats. Note that stats are only tracked if the replay is recorded from Host. Otherwise, all stats will read 0.");
        img("replay_stats_panel.png", "75%");

        h1("Medals");
        p("Players are awarded various medals, viewable via the scoreboard when you hold ", ic([], `Tab`), ".");
        img("replay_medals.png", "75%");

        h1("Item Finder");
        img("replay_finder.png", "75%");
        p("Player stats from the loaded replay is viewable from the button on the left. It allows you to search for specific items in the level.");
        img("replay_finder_panel.png", "75%");
        p("Clicking on an item will teleport the camera to that item.");
    }, rhuDocuscript);
});