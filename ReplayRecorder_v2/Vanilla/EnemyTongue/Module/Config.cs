using BepInEx.Configuration;
using ReplayRecorder.API.Attributes;

namespace Vanilla.EnemyTongue.BepInEx {
    internal static partial class ConfigManager {
        [ReplayConfig]
        static void Init() {
            ConfigFile configFile = ReplayRecorder.BepInEx.ConfigManager.configFile;

            debug = configFile.Bind(
                $"{Module.Name}",
                "debug",
                false,
                "Enables debug messages when true.");
        }

        public static bool Debug {
            get { return debug!.Value; }
            set { debug!.Value = value; }
        }
        private static ConfigEntry<bool>? debug;
    }
}