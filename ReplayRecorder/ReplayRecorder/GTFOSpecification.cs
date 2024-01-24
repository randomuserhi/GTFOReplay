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

                // Scout
                { 20, 1 }, // scout

                // Shadow Scout
                { 40, 2 }, // scout_shadow

                // Charger Scout
                { 41, 3 }, // scout_bullrush

                // Shadow
                { 21, 4 }, // shadow

                // Big Shadow
                { 35, 5 }, // striker_big_shadow

                // Baby
                { 38, 6 }, // striker_child
                { 48, 6 }, // striker_child_jacob

                // Striker
                { 13, 7 }, // striker_wave
                { 32, 7 }, // striker_patrol
                { 31, 7 }, // striker_wave_fast
                { 24, 7 }, // striker_hibernate
                { 49, 7 }, // striker_hibernate_jacob

                // Big Striker
                { 16, 8 }, // striker_big_wave
                { 28, 8 }, // striker_big_hibernate
                { 50, 8 }, // striker_big_hibernate_jacob

                // Shooter
                { 26, 9 }, // shooter_hibernate
                { 51, 9 }, // shooter_hibernate_jacob
                { 11, 9 }, // shooter_wave

                // Big Shooter
                { 18, 10 }, // shooter_big

                // Hybrid
                { 33, 11 }, // shooter_big_rapidfire

                // Charger
                { 30, 12 }, // striker_bullrush

                // Big Charger
                { 39, 13 }, // striker_big_bullrush

                // Tank
                { 29, 14 }, // tank

                // Birther
                { 36, 15 }, // birther

                // Birther Boss
                { 37, 16 }, // birther_boss
                
                // Snatcher
                { 46, 17 }, // pouncer

                // Pablo??
                { 47, 18 }, // tank_boss

                // Flyer
                { 42, 19 }, // flyer

                // Big Flyer
                { 45, 20 }, // flyer_big

                // Squid
                { 43, 21 }, // squidward

                // Squid Boss R6 ??
                { 44, 22 }, // squidboss_big
            }
        };
        private static GTFOSpecification spec = defaultSpec;
    }
}
