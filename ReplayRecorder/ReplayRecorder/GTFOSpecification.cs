using API;
using System.Text.Json;

namespace ReplayRecorder {
    // TODO(randomuserhi): Write spec to a file so people can edit it
    //                     Load custom spec => write JS on web to also accept a custom spec sheet
    internal struct GTFOSpecification {
        public Dictionary<uint, byte> enemies { get; set; }
        public Dictionary<uint, byte> items { get; set; }

        public static GTFOSpecification LoadSpecification(string filepath) {
            string text = File.ReadAllText(filepath);
            spec = JsonSerializer.Deserialize<GTFOSpecification>(text);
            return spec;
        }

        // TODO(randomuserhi): Change to use EnemyDataID instead
        public static byte GetEnemyType(uint type) {
            if (spec.enemies.ContainsKey(type)) {
                return spec.enemies[type];
            } else {
                APILogger.Error($"Unknown enemy type, {type}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        // TODO(randomuserhi): Change to use pItemData.itemID_gearCRC instead
        public static byte GetItem(uint item) {
            if (spec.items.ContainsKey(item)) {
                return spec.items[item];
            } else {
                APILogger.Error($"Unknown item type, {item}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        private static GTFOSpecification defaultSpec = new GTFOSpecification() {
            items = new Dictionary<uint, byte>()
            {
                { uint.MaxValue, 0 }, // Not necessary for this application to know, but its here to remind that 0 is unavailable
            },
            enemies = new Dictionary<uint, byte>() {
                { uint.MaxValue, 0 }, // Not necessary for this application to know, but its here to remind that 0 is unavailable
            }
        };
        private static GTFOSpecification spec = defaultSpec;
    }
}
