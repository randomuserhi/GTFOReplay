﻿using BepInEx.Configuration;
using BepInEx;

namespace StatTracker
{
    public static class ConfigManager
    {
        static ConfigManager()
        {
            string text = Path.Combine(Paths.ConfigPath, $"{Module.Name}.cfg");
            ConfigFile configFile = new ConfigFile(text, true);

            debug = configFile.Bind(
                "Debug",
                "enable",
                false,
                "Enables debug messages when true.");
        }

        public static bool Debug
        {
            get { return debug.Value; }
            set { debug.Value = value; }
        }

        private static ConfigEntry<bool> debug;
    }
}