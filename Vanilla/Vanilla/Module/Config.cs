using BepInEx;
using BepInEx.Configuration;

namespace Vanilla.BepInEx {
    public static partial class ConfigManager {
        public static ConfigFile configFile;

        static ConfigManager() {
            string text = Path.Combine(Paths.ConfigPath, $"{Module.Name}.cfg");
            configFile = new ConfigFile(text, true);

            debug = configFile.Bind(
                "Debug",
                "enable",
                false,
                "Enables debug messages when true.");

            subdivideNavMesh = configFile.Bind(
                "Map",
                "subdivideNavMesh",
                true,
                "The navmesh is often inaccurate, by subdividing and sampling we can get a more accurate map but this may take levels to take longer to load.");
        }

        public static bool Debug {
            get { return debug.Value; }
            set { debug.Value = value; }
        }
        private static ConfigEntry<bool> debug;

        public static bool SubdivideNavMesh {
            get { return subdivideNavMesh.Value; }
            set { subdivideNavMesh.Value = value; }
        }
        private static ConfigEntry<bool> subdivideNavMesh;
    }
}