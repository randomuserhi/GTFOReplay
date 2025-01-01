/// Code taken directly from: https://github.com/danielmccluskey/gtfostatsmod

using System.Text.Json.Serialization;

namespace DanosStatTracker.Data {
    public class DanosStaticStore {
        public static DanosRunDownDataStore? currentRunDownDataStore { get; set; }
    }

    public class DanosRunDownDataStore {
        public long st { get; set; } = 0; // StartTimestamp
        public long et { get; set; } = 0; // EndTimestamp
        public string rid { get; set; } = ""; // RundownId
        public string en { get; set; } = ""; // expeditionName
        public string ei { get; set; } = ""; // expeditionindex
        public string rsg { get; set; } = ""; // RundownSessionGUID
        public long msid { get; set; } = 0; // MySteamId

        // Global counters for events
        public int bioscanStarts { get; set; } = 0; // Bioscan start events
        public int scoutEnemiesDead { get; set; } = 0; // Scout enemies killed
        public int enemiesDead { get; set; } = 0; // Total enemies killed
        public int enemyWavesSpawned { get; set; } = 0; // Enemy waves spawned
        public int scoutEnemiesFoundPlayer { get; set; } = 0; // Scout enemies found player
        public int hibernatingEnemiesDead { get; set; } = 0; // Hibernating enemies killed
        public int hibernatingEnemiesWokeUp { get; set; } = 0; // Hibernating enemies woke up
        public int enemiesDeadFromMelee { get; set; } = 0; // Enemies killed by melee
        public int scoutEnemiesDeadFromMelee { get; set; } = 0; // Scout enemies killed by melee

        // Methods to increment counters
        public void IncrementBioscanStart() => bioscanStarts++;
        public void IncrementScoutEnemiesDead() => scoutEnemiesDead++;
        public void IncrementEnemiesDead() => enemiesDead++;
        public void IncrementEnemyWavesSpawned() => enemyWavesSpawned++;
        public void IncrementScoutEnemiesFoundPlayer() => scoutEnemiesFoundPlayer++;
        public void IncrementHibernatingEnemiesDead() => hibernatingEnemiesDead++;
        public void IncrementHibernatingEnemiesWokeUp() => hibernatingEnemiesWokeUp++;
        public void IncrementEnemiesDeadFromMelee() => enemiesDeadFromMelee++;
        public void IncrementScoutEnemiesDeadFromMelee() => scoutEnemiesDeadFromMelee++;


        public Dictionary<long, string> pl { get; set; } = new Dictionary<long, string>(); // Players
        public Dictionary<long, List<DanosPositionalData>> pd { get; set; } = new Dictionary<long, List<DanosPositionalData>>(); // PositionalData grouped by SteamId
        public Dictionary<long, DanosSummaryData> sd { get; set; } = new Dictionary<long, DanosSummaryData>(); // SummaryData grouped by SteamId
        public void AddPlayerDownData(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();

            }
            sd[sid].downs++;
        }
        public void AddPlayerReloadData(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].reloads++;
        }
        public void AddPlayerHealthPackUsed(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].healthpacksused++;
        }

        public void AddPlayerAmmoPackUsed(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].ammopacksused++;
        }

        public void AddPlayerArtifactPickup(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].artifacts++;
        }

        public void AddPlayerDisinfectionUsed(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].disinfections++;
        }

        public void AddPlayerTripMinePlaced(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].tripminesplaced++;
        }

        public void AddPlayerKeyCardPickup(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].keycards++;
        }

        public void AddPlayerHackingSuccess(long sid) {
            if (!sd.ContainsKey(sid)) {
                sd[sid] = new DanosSummaryData();
            }
            sd[sid].hackingSuccesses++;
        }


        public void AddPositionalData(DanosPositionalDataTransfer dataTransfer) {
            if (!pl.ContainsKey(dataTransfer.sid)) {
                pl[dataTransfer.sid] = dataTransfer.Name;
            }
            if (!pd.ContainsKey(dataTransfer.sid)) {
                pd[dataTransfer.sid] = new List<DanosPositionalData>();
            }
            var buffer = pd[dataTransfer.sid];
            if (buffer.Count > 0 && dataTransfer.Timestamp - buffer[^1].rt < 3) return; // Only record every 3 seconds.
            buffer.Add(new DanosPositionalData {
                x = (float)dataTransfer.x,
                z = (float)dataTransfer.z,
                rt = (int)(dataTransfer.Timestamp)
            });
        }

        public bool fromReplayMod { get; set; } = true;
        public Dictionary<long, ReplayModSummaryData> rd { get; set; } = new Dictionary<long, ReplayModSummaryData>(); // Replay mod SummaryData grouped by SteamId
        public ReplayModSummaryData GetReplayData(long player) {
            if (!rd.ContainsKey(player)) {
                rd.Add(player, new ReplayModSummaryData());
            }

            return rd[player];
        }
    }

    public class DanosPositionalData {
        [JsonConverter(typeof(OneDecimalJsonConverter))]

        public float x { get; set; } // X
        [JsonConverter(typeof(OneDecimalJsonConverter))]

        public float z { get; set; } // Z
        public int rt { get; set; } // RelativeTimestamp
    }

    public class DanosPositionalDataTransfer {
        public double x { get; set; } // X (higher precision if needed)
        public double z { get; set; } // Z (higher precision if needed)
        public long Timestamp { get; set; } // Full Timestamp
        public long sid { get; set; } // SteamId
        public string Name { get; set; } // Player Name
    }


    public class DanosSummaryData {
        public int reloads { get; set; } = 0; // Reloads
        public int downs { get; set; } = 0; // Downs
        public int healthpacksused { get; set; } = 0; // HealthPacksUsed
        public int ammopacksused { get; set; } = 0; // AmmoPacksUsed
        public int artifacts { get; set; } = 0; // Artifacts
        public int disinfections { get; set; } = 0; // Disinfections
        public int tripminesplaced { get; set; } = 0; // TripMinesPlaced
        public int keycards { get; set; } = 0; // KeyCardsPickedUp
        public int hackingSuccesses { get; set; } = 0; // HackingSuccesses
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
