using API;
using System.Text.Json;

namespace ReplayRecorder {
    // TODO(randomuserhi): Write spec to a file so people can edit it
    //                     Load custom spec => write JS on web to also accept a custom spec sheet
    internal struct GTFOSpecification {
        public Dictionary<uint, byte> enemies { get; set; }
        public Dictionary<uint, byte> items { get; set; }
        public Dictionary<uint, byte> gear { get; set; }

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

        public static byte GetGear(string playfabInstanceId) {
            uint id;
            if (!uint.TryParse(playfabInstanceId.Replace("OfflineGear_ID_", ""), out id)) {
                APILogger.Error($"Failed to parse gear PlayfabItemInstanceId [{playfabInstanceId}]");
                return 0;
            }
            if (spec.gear.ContainsKey(id)) {
                return spec.gear[id];
            } else {
                APILogger.Error($"Unknown gear type, {id}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        public static byte GetItem(uint item) {
            if (spec.items.ContainsKey(item)) {
                return spec.items[item];
            } else {
                APILogger.Error($"Unknown item type, {item}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        private static GTFOSpecification defaultSpec = new GTFOSpecification() {
            gear = new Dictionary<uint, byte>() {
                // Primary
                { 3, 1 }, // Shelling S49
                { 67, 2 }, // Shelling Nano
                { 47, 3 }, // Bataldo 3RB
                { 29, 4 }, // Raptus Treffen 2
                { 45, 5 }, // Raptus Steigro
                { 40, 6 }, // Accrat Golok DA
                { 4, 7 }, // Van Auken LTC5
                { 60, 8 }, // Accrat STB
                { 49, 9 }, // Accrat ND6
                { 34, 10 }, // Van Auken CAB F4
                { 5, 11 }, // TR22 Hanaway
                { 50, 12 }, // Hanaway PSB
                { 12, 13 }, // Malatack LX
                { 30, 14 }, // Malatack CH 4
                { 41, 15 }, // Drekker Pres MOD 556
                { 51, 16 }, // Buckland SBS III
                { 61, 17 }, // Bataldo J 300
                { 65, 18 }, // Bataldo Custom K330

                // Secondary
                { 46, 19 }, // Malatack HXC
                { 66, 20 }, // Drekker CLR
                { 13, 21 }, // Buckland S870
                { 31, 22 }, // Buckland AF6
                { 56, 23 }, // Drekker INEX DREI
                { 44, 24 }, // Buckland XDist2
                { 15, 25 }, // Mastaba R66
                { 16, 26 }, // Techman Arbalist V
                { 38, 27 }, // Techman Veruta XII
                { 39, 28 }, // Techman Klust 6
                { 43, 29 }, // Omneco exp 1
                { 63, 30 }, // Shelling Arid 5
                { 62, 31 }, // Drekker DEL P1
                { 14, 32 }, // Koning PR 11
                { 42, 33 }, // Omneco LRG 42

                // Tool
                { 18, 34 }, // D-Tek Optron IV
                { 17, 35 }, // Stalwart Flow G2
                { 20, 36 }, // Krieger O4
                { 24, 37 }, // Mechatronic SGB3
                { 6, 38 }, // RAD Labs Meduza
                { 23, 39 }, // Autotek 51 RSG
                { 25, 40 }, // Mechatronic B5 LFR

                // Melee Weapon
                { 57, 41 }, // Santonian HDH
                { 26, 42 }, // Omneco Maul
                { 53, 43 }, // Mastaba Fixed Blade
                { 68, 44 }, // Wox Compact
                { 55, 45 }, // Kovac Peacekeeper
                { 69, 46 }, // Attroc Titanium
                { 54, 47 }, // Maco Drillhead
                { 70, 48 }, // ISOCO Stinger
                { 9, 49 }, // Kovac Sledgehammer
                { 27, 50 }, // Santonian Mallet

                // Hacking Tool
                { 2, 51 },
            },
            items = new Dictionary<uint, byte>()
            {
                { uint.MaxValue, 0 }, // Not necessary for this application to know, but its here to remind that 0 is unavailable

                // Packs
                { 102, 52 }, // Medipack
                { 101, 53 }, // Ammo pack
                { 127, 54 }, // Tool refill pack
                { 132, 55 }, // Disinfect pack

                // Consumables
                { 114, 56 }, // Glowsticks
                { 30, 57 }, // Long range flashlight
                { 140, 58 }, // I2-LP Syringe
                { 142, 59 }, // IIX Syringe
                { 115, 60 }, // Cfoam Grenade
                { 116, 61 }, // Lock melter
                { 117, 62 }, // Fog repeller
                { 139, 63 }, // Explosive tripmine
                { 144, 64 }, // Cfoam tripmine

                // Big pickup
                { 131, 65 }, // Powercell
                { 133, 66 }, // Fog repeller
                { 137, 67 }, // Neonate
                { 141, 67 },
                { 143, 67 },
                { 170, 67 },
                { 145, 67 },
                { 175, 67 },
                { 177, 67 },
                { 164, 68 }, // Matter Wave Projector
                { 166, 68 },
                { 151, 69 }, // Data Sphere
                { 181, 69 },
                { 138, 70 }, // Cargo crate
                { 176, 70 },
                { 154, 70 },
                { 155, 70 },
                { 148, 71 }, // Cryo
                { 173, 72 }, // collection case
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

                // Nightmare Striker
                { 53, 23 }, // striker_beserk
                
                // Nightmare Shooter
                { 52, 24 }, // shooter_spread

                // Nightmare Scout
                { 54, 25 }, // scout_zoomer
            }
        };
        private static GTFOSpecification spec = defaultSpec;
    }
}
