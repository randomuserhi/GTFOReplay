using API;
using BepInEx;
using BepInEx.Configuration;

namespace ReplayRecorder.BepInEx {
    public static partial class ConfigManager {
        public static ConfigFile configFile;
        private static FileSystemWatcher configWatcher;

        static ConfigManager() {
            string file = $"{Module.Name}.cfg";
            string path = Path.Combine(Paths.ConfigPath, file);
            configFile = new ConfigFile(path, true);

            debug = configFile.Bind(
                "Debug",
                "enable",
                false,
                "Enables debug messages when true.");

            debugTicks = configFile.Bind(
                "Debug",
                "ticks",
                false,
                "Enables debug messages for each tick when true.");

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
                "Filename format of stored replays. Follows C# string format syntax with (0: Rundown + Level, 1: Date, 2: Level Name). If filename is invalid (contains invalid characters etc...) default name of 'replay' is used.");

            separateByRundown = configFile.Bind(
                "Settings",
                "separateByRundown",
                false,
                "Will create a new folder for each rundown. E.g R1A1 replay will be stored in path/to/replay/folder/R1/R1A1");

            spectatorWhiteList = configFile.Bind(
                "Settings",
                "spectatorWhiteList",
                "",
                "Comma separated list of Steam64 IDs of players allowed to connect and spectate your games. A value of 'ALL' allows anyone to connect. You do not need to whitelist yourself.");

            whiteListFriends = configFile.Bind(
                "Settings",
                "whiteListFriends",
                true,
                "When set to true, considers any steam friends as part of the spectatorWhiteList.");

            disableLeaveJoinMessages = configFile.Bind(
                "Settings",
                "disableLeaveJoinMessages",
                false,
                "When set to true, disables the spectators join / leave messages.");

            muteChat = configFile.Bind(
                "Settings",
                "muteChat",
                false,
                "When set to true, disables the spectator chat.");

            configWatcher = new FileSystemWatcher(Paths.ConfigPath, file) {
                NotifyFilter = NotifyFilters.LastWrite,
                EnableRaisingEvents = true
            };
            configWatcher.Changed += async (object sender, FileSystemEventArgs args) => {
                configWatcher.EnableRaisingEvents = false;
                await Task.Delay(500);
                APILogger.Warn("Reloading config...");
                configFile.Reload();
                LoadSpectatorWhiteList();
                await Task.Delay(500);
                configWatcher.EnableRaisingEvents = true;
            };

            LoadSpectatorWhiteList();
        }

        private static void LoadSpectatorWhiteList() {
            steamIDWhitelist.Clear();
            if (SpectatorWhiteList.Trim().ToLower() != "all") {
                string[] IDs = SpectatorWhiteList.Split(",");
                foreach (string ID in IDs) {
                    if (ulong.TryParse(ID.Trim(), out ulong id)) {
                        steamIDWhitelist.Add(id);
                    } else {
                        APILogger.Error($"Unable to parse Steam64 ID: {ID}");
                    }
                }
            } else {
                allowAnySpectator = true;
            }
        }

        public static bool allowAnySpectator = false;
        public static List<ulong> steamIDWhitelist = new List<ulong>();

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

        public static bool DebugTicks {
            get { return debugTicks.Value; }
            set { debugTicks.Value = value; }
        }
        private static ConfigEntry<bool> debugTicks;

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

        public static string SpectatorWhiteList {
            get { return spectatorWhiteList.Value; }
            set { spectatorWhiteList.Value = value; }
        }
        private static ConfigEntry<string> spectatorWhiteList;

        public static bool WhiteListFriends {
            get { return whiteListFriends.Value; }
            set { whiteListFriends.Value = value; }
        }
        private static ConfigEntry<bool> whiteListFriends;

        public static bool DisableLeaveJoinMessages {
            get { return disableLeaveJoinMessages.Value; }
            set { disableLeaveJoinMessages.Value = value; }
        }
        private static ConfigEntry<bool> disableLeaveJoinMessages;

        public static bool MuteChat {
            get { return muteChat.Value; }
            set { muteChat.Value = value; }
        }
        private static ConfigEntry<bool> muteChat;

        public static bool SeparateByRundown {
            get { return separateByRundown.Value; }
            set { separateByRundown.Value = value; }
        }
        private static ConfigEntry<bool> separateByRundown;
    }
}