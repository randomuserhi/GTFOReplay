RHU.require(new Error(), {
    docs: "docs", rhuDocuscript: "docuscript",
}, function ({ docs, rhuDocuscript, }) {
    docs.jit = () => docuscript((lib, include) => {
        const { p, br, link, h1, ul, frag, img, pl, i } = lib;
        const { cb, ic } = include({ cb: "code:block", ic: "code:inline" });
        p("GTFOReplay is a mod that records full game replays of your matches so that you can watch them over in post.");
        img("demo.gif");
        h1("Installation");
        ul(frag("Follow the installation process for Bepinex on ", link("https://gtfo.thunderstore.io/package/BepInEx/BepInExPack_GTFO/", "thunderstore"), "."), frag("Download the Bepinex plugin dll and viewer from ", link("https://github.com/randomuserhi/GTFOReplay/releases", "here"), " under ", ic([], "Assets"), "."), frag("Drag the plugin dll into your bepinex plugin folder."));
        h1("Usage");
        ul(frag(p("While you are playing a match, the game will write a replay file (e.g ", ic([], "R1A1 2024-11-10 22-10.gtfo"), ") to your game folder. Typically at ", ic([], "steamapps/common/GTFO"), "."), img("replay_location.png")), frag(p("You can load the replay in the viewer by opening the viewer in your browser and choosing the replay file. The ", ic([], ".html"), " is located in ", ic([], "viewer/main/main.html"), ".")), frag(p("Since this is still a work in progress, it is recommended to use the viewer with the browser developer console. On most browsers you can access this with ", ic([], "F12"), " or ", ic([], "Cntrl+Shift+I"), "."), img("viewer_dev.png", "85%")), frag(p("Load your replay file using the button on the top left. Any errors that occur will show up in the dev console. Feel free to message ", ic([], "@randomuserhi"), " on discord regarding these errors."), img("viewer_load.png", "85%")), frag("For information about the viewer, visit notes on viewer usage ", pl(["Viewer"], "here"), "."));
        h1("Reporting Bugs / Issues");
        p("Either open an issue on my ", link("https://github.com/randomuserhi/GTFOReplay/issues", "github repo"), " or send me a message on Discord through the GTFOReplay feedback thread on the ", link("https://discord.gg/gtfo-modding-server-782438773690597389", "modding server"), ".");
        ul(frag("Please provide your Bepinex logs alongside the reported issue. The log output is in your Bepinex folder called ", ic([], "LogOutput.log")), frag("If it is a viewer issue, please provide a screenshot of the issue and the DevConsole output."));
        h1("Compatability with Modded Content");
        p("As long as the modded rundown doesn't stray too far from vanilla mechanics and it doesnt overly patch key methods shared with this mod it should be fine (even with custom weapons / enemies).");
        br();
        p("If there are any issues, just report it as a bug as normal alongside which modded content you are trying to run this mod along side. Do note, that I will only make fixes where reasonable, do not post issues for specific compatability features.");
    }, rhuDocuscript);
});
