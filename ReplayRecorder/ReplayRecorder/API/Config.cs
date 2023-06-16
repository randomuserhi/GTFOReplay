using BepInEx.Configuration;
using BepInEx;

public static partial class ConfigManager
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

        pelletLingerTime = configFile.Bind(
            "Settings",
            "lingerTime",
            500,
            "Time projectiles linger post removal.");
    }

    public static bool Debug
    {
        get { return debug.Value; }
        set { debug.Value = value; }
    }
    private static ConfigEntry<bool> debug;

    public static int PelletLingerTime
    {
        get { return pelletLingerTime.Value; }
        set { pelletLingerTime.Value = value; }
    }
    private static ConfigEntry<int> pelletLingerTime;
}