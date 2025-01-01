using BepInEx;
using BepInEx.Configuration;

namespace DanosStatTracker.BepInEx {
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

            enable = configFile.Bind(
                "Settings",
                "enable",
                true,
                "When true, sends data to DanosStatTracker service: https://thunderstore.io/c/gtfo/p/Danos/GTFOStats/.");
        }

        public static bool Debug {
            get { return debug.Value; }
            set { debug.Value = value; }
        }
        private static ConfigEntry<bool> debug;

        public static bool Enable {
            get { return enable.Value; }
            set { enable.Value = value; }
        }
        private static ConfigEntry<bool> enable;
    }
}