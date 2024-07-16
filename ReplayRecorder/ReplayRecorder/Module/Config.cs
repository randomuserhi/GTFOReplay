using BepInEx;
using BepInEx.Configuration;

namespace ReplayRecorder.BepInEx {
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

            debugDynamics = configFile.Bind(
                "Debug",
                "dynamics",
                false,
                "Enables debug messages for dynamics when true.");

            performanceDebug = configFile.Bind(
                "Debug",
                "performanceDebug",
                false,
                "Shows the amount of memory buffers used and time taken to write a snapshot to disk. Useful to know the performance impact of this mod.");

            replayFolder = configFile.Bind(
                "Settings",
                "replayFolder",
                "./",
                "Location of which replays will be stored. If invalid, defaults to the games location.");
            replayFilename = configFile.Bind(
                "Settings",
                "replayFilename",
                "{0} {1:yyyy-MM-dd HH-mm}",
                "Filename format of stored replays. Follows C# string format syntax with (0: Rundown + Level, 1: Date). If filename is invalid (contains invalid characters etc...) default name of 'replay' is used.");

            separateByRundown = configFile.Bind(
                "Settings",
                "separateByRundown",
                false,
                "Will create a new folder for each rundown. E.g R1A1 replay will be stored in path/to/replay/folder/R1/R1A1");
        }

        public static bool Debug {
            get { return debug.Value; }
            set { debug.Value = value; }
        }
        private static ConfigEntry<bool> debug;

        public static bool PerformanceDebug {
            get { return performanceDebug.Value; }
            set { performanceDebug.Value = value; }
        }
        private static ConfigEntry<bool> performanceDebug;

        // TODO(randomuserhi): Convert to string and have space seperated debug filters "ALL" etc...
        public static bool DebugDynamics {
            get { return debugDynamics.Value; }
            set { debugDynamics.Value = value; }
        }
        private static ConfigEntry<bool> debugDynamics;

        public static string ReplayFolder {
            get { return replayFolder.Value; }
            set { replayFolder.Value = value; }
        }
        private static ConfigEntry<string> replayFolder;

        public static string ReplayFileName {
            get { return replayFilename.Value; }
            set { replayFilename.Value = value; }
        }
        private static ConfigEntry<string> replayFilename;

        public static bool SeparateByRundown {
            get { return separateByRundown.Value; }
            set { separateByRundown.Value = value; }
        }
        private static ConfigEntry<bool> separateByRundown;
    }
}