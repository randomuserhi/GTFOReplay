using BepInEx.Configuration;

namespace Vanilla.Enemy.BepInEx {
    internal static partial class ConfigManager {
        static ConfigManager() {
            ConfigFile configFile = ReplayRecorder.BepInEx.ConfigManager.configFile;

            debug = configFile.Bind(
                $"{Module.Name}",
                "debug",
                false,
                "Enables debug messages when true.");

            animationTickRate = configFile.Bind(
                $"{Module.Name}",
                "animationTickRate",
                4,
                "How many ticks until an animation frame is recorded. (The lower the value, the more storage space a replay will take). Value cannot be less than 1.");

            animationRange = configFile.Bind(
                $"{Module.Name}",
                "animationRange",
                20.0f,
                "The range an enemy needs to be within for animations to be processed.");
        }

        public static bool Debug {
            get { return debug.Value; }
            set { debug.Value = value; }
        }
        private static ConfigEntry<bool> debug;

        public static int AnimationTickRate {
            get { return animationTickRate.Value; }
            set { animationTickRate.Value = value; }
        }
        private static ConfigEntry<int> animationTickRate;

        public static float AnimationRange {
            get { return animationRange.Value; }
            set { animationRange.Value = value; }
        }
        private static ConfigEntry<float> animationRange;
    }
}