RHU.require(new Error(), { 
    docs: "docs", rhuDocuscript: "docuscript",
}, function({
    docs, rhuDocuscript,
}) {
    docs.jit = () => docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>((lib, include) => {
        const { 
            p, br, link, h1, ul, frag, img, pl, i
        } = lib;
        const { 
            cb, ic
        } = include({ cb: "code:block", ic: "code:inline" });
       
        p(
            "GTFOReplay is a mod that records full game replays of your matches so that you can watch them over in post."
        );
        img("demo.gif");

        h1("Installation");
        ul(
            frag("Follow the installation process for Bepinex on ", link("https://gtfo.thunderstore.io/package/BepInEx/BepInExPack_GTFO/", "thunderstore"), "."),
            frag("Download the Bepinex plugin dll and viewer from ", link("https://github.com/randomuserhi/GTFOReplay/releases", "here"), "."),
            frag("Drag the plugin dll into your bepinex plugin folder")
        );

        h1("Disclaimer");
        p(
            "This mod is still in its early stages and thus has not been fleshed out as much as it needs to. There are many missing / broken features and the viewer is barely",
            " usable through the browser DevConsole."
        );
        br();
        p(
            "For this reason, debugging messages are enabled by default. If this is an issue you may turn this off in the bepinix config (", ic([], "ReplayRecorder.cfg"), "):"
        );
        cb([], `[Debug]

## Enables debug messages when true.
# Setting type: Boolean
# Default value: true
enable = true`);

        h1("Usage");
        ul(
            frag(
                p("While you are playing a match, the game will write a replay file called ", ic([], "replay.gtfo"), " in your game folder. Typically at ", ic([], "steamapps/common/GTFO"), "."),
                img("replay_location.png")
            ),
            frag("You can load the replay in the viewer by opening the viewer in your browser and choosing the replay file. The ", ic([], ".html"), " is located in ", ic([], "viewer/main/main.html"), "."),
            frag("For information about the viewer, visit notes on viewer usage ", pl(["Viewer"], "here"), ".")
        );
        i("NOTE: The replay file gets overwritten every time you drop, if you want to save the current replay you will need to rename it or copy it somewhere else.");

        h1("Reporting Bugs / Issues");
        p(
            "Either open an issue on my ", link("https://github.com/randomuserhi/GTFOReplay/issues", "github repo"), " or send me a message on Discord through the ", 
            link("https://discord.gg/gtfo-modding-server-782438773690597389", "modding server"), "."
        );
        ul(
            frag("Please provide your Bepinex logs alongside the reported issue. The log output is in your Bepinex folder called ", ic([], "LogOutput.log")),
            frag("If it is a viewer issue, please provide a screenshot of the issue and the DevConsole output.")
        );

        h1("Compatability with Modded Content");
        p(
            "As long as the modded rundown doesn't stray too far from vanilla mechanics and it doesnt overly patch key methods shared with this mod it should be fine (even with custom weapons / enemies)."
        );
        br();
        p(
            "If there are any issues, just report it as a bug as normal alongside which modded content you are trying to run this mod along side. Do note, that I will only make fixes where reasonable, do not post issues for specific compatability features."
        );

    }, rhuDocuscript);
});