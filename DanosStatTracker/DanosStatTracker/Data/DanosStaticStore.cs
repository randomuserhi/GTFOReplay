/// Code taken directly from: https://github.com/danielmccluskey/gtfostatsmod

using System.Text.Json.Serialization;

namespace DanosStatTracker.Data {
    public class DanosStaticStore {
        public static DanosRunDownDataStore? currentRunDownDataStore { get; set; } = null;
    }

    public class DanosRunDownDataStore {
        public bool fromReplayMod { get; set; } = true;
        public ReplayData replayData { get; set; } = new ReplayData();
    }

    public class ReplayData {
        public bool isMaster { get; set; } = false;
        public ReplayModMasterData masterStats { get; set; } = new ReplayModMasterData();
    }

    public class ReplayModMasterData {
        public Dictionary<long, ReplayModSummaryData> playerStats { get; set; } = new Dictionary<long, ReplayModSummaryData>(); // Replay mod SummaryData grouped by SteamId
        public ReplayModSummaryData GetPlayerStats(long sid) {
            if (!playerStats.ContainsKey(sid)) {
                playerStats.Add(sid, new ReplayModSummaryData());
            }

            return playerStats[sid];
        }
    }

    public class ReplayModSummaryData {
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float bulletDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float meleeDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float sentryDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float explosiveDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float staggerDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float sentryStaggerDamage { get; set; } = 0;

        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float playerBulletDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float playerSentryDamage { get; set; } = 0;
        [JsonConverter(typeof(OneDecimalJsonConverter))]
        public float playerExplosiveDamage { get; set; } = 0;

        public int kills { get; set; } = 0;
        public int mineKills { get; set; } = 0;
        public int sentryKills { get; set; } = 0;
    }
}
