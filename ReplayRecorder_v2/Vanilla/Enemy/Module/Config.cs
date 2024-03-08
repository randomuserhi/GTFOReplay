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

            noLocomotionAnimation = configFile.Bind(
                $"{Module.Name}",
                "noLocomotionAnimation",
                true,
                "Disables animation recording for enemies simply moving. (Maintains stagger, attack animations, screams etc...). Helps to reduce replay file size.");

            animationTickRate = configFile.Bind(
                $"{Module.Name}",
                "animationTickRate",
                3,
                "How many ticks until an animation frame is recorded. (The lower the value, the more storage space a replay will take). Value cannot be less than 1.");

            animationRange = configFile.Bind(
                $"{Module.Name}",
                "animationRange",
                20.0f,
                "The range an enemy needs to be within an alive player for animations to be processed. Scream animations can occure at any range.");

            animationAggressiveRange = configFile.Bind(
                $"{Module.Name}",
                "animationRange",
                40.0f,
                "The range an enemy needs to be within an alive player for animations to be processed. Scream animations can occure at any range.");

            animationLeeWay = configFile.Bind(
                $"{Module.Name}",
                "animationLeeWay",
                3000,
                "Buffer period in ms where animations will continue to be captured when they shouldnt be. This is to allow animation transitions to play out.");
        }

        public static bool Debug {
            get { return debug.Value; }
            set { debug.Value = value; }
        }
        private static ConfigEntry<bool> debug;

        public static bool NoLocomotionAnimation {
            get { return noLocomotionAnimation.Value; }
            set { noLocomotionAnimation.Value = value; }
        }
        private static ConfigEntry<bool> noLocomotionAnimation;

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

        public static float AnimationAggressiveRange {
            get { return animationAggressiveRange.Value; }
            set { animationAggressiveRange.Value = value; }
        }
        private static ConfigEntry<float> animationAggressiveRange;

        public static int AnimationLeeWay {
            get { return animationLeeWay.Value; }
            set { animationLeeWay.Value = value; }
        }
        private static ConfigEntry<int> animationLeeWay;
    }
}