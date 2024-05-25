using API;
using System.Text.Json;

namespace Vanilla.Specification {
    // TODO(randomuserhi): Write spec to a file so people can edit it
    //                     Load custom spec => write JS on web to also accept a custom spec sheet
    public struct GTFOSpecification {
        public Dictionary<uint, ushort> enemies { get; set; }
        public Dictionary<uint, ushort> items { get; set; }
        public Dictionary<string, ushort> gear { get; set; }

        public static GTFOSpecification LoadSpecification(string filepath) {
            string text = File.ReadAllText(filepath);
            spec = JsonSerializer.Deserialize<GTFOSpecification>(text);
            return spec;
        }

        // TODO(randomuserhi): Change to use EnemyDataID instead
        public static ushort GetEnemyType(uint type) {
            if (spec.enemies.ContainsKey(type)) {
                return spec.enemies[type];
            } else {
                APILogger.Error($"Unknown enemy type, {type}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        public static ushort GetGear(string publicGearName) {
            publicGearName = publicGearName.ToLower();
            if (spec.gear.ContainsKey(publicGearName)) {
                return spec.gear[publicGearName];
            } else {
                APILogger.Error($"Unknown gear type, {publicGearName}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        public static ushort GetItem(uint item) {
            if (spec.items.ContainsKey(item)) {
                return spec.items[item];
            } else {
                APILogger.Error($"Unknown item type, {item}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        private static GTFOSpecification defaultSpec = new GTFOSpecification() {
            gear = new Dictionary<string, ushort>() {
                { "unknown", 0 },

                // Primary
                { "shelling s49", 1 },
                { "shelling nano", 2 },
                { "bataldo 3rb", 3 },
                { "raptus treffen 2", 4 },
                { "raptus steigro", 5 },
                { "accrat golok da", 6 },
                { "van auken ltc5", 7 },
                { "accrat stb", 8 },
                { "accrat nd6", 9 },
                { "van auken cab f4", 10 },
                { "tr22 hanaway", 11 },
                { "hanaway psb", 12 },
                { "malatack lx", 13 },
                { "malatack ch 4", 14 },
                { "drekker pres mod 556", 15 },
                { "buckland sbs iii", 16 },
                { "bataldo j 300", 17 },
                { "bataldo custom k330", 18 },

                // Secondary
                { "malatack hxc", 19 },
                { "drekker clr", 20 },
                { "buckland s870", 21 },
                { "buckland af6", 22 },
                { "drekker inex drei", 23 },
                { "buckland xdist2", 24 },
                { "mastaba r66", 25 },
                { "techman arbalist v", 26 },
                { "techman veruta xii", 27 },
                { "techman klust 6", 28 },
                { "omneco exp1", 29 },
                { "shelling arid 5", 30 },
                { "drekker del p1", 31 },
                { "köning pr 11", 32 },
                { "omneco lrg", 33 },

                // Tool
                { "d-tek optron iv", 34 },
                { "stalwart flow g2", 35 },
                { "krieger o4", 36 },
                { "mechatronic sgb3", 37 },
                { "rad labs meduza", 38 },
                { "autotek 51 rsg", 39 },
                { "mechatronic b5 lfr", 40 },

                // Melee Weapon
                { "santonian hdh", 41 },
                { "omneco maul", 42 },
                { "mastaba fixed blade", 43 },
                { "wox compact", 44 },
                { "kovac peacekeeper", 45 },
                { "attroc titanium", 46 },
                { "maco drillhead", 47 },
                { "isoco stinger", 48 },
                { "kovac sledgehammer", 49 },
                { "santonian mallet", 50 },
                { "maco gavel", 51 },
                { "axe", 74 },

                // Hacking Tool
                { "hacking tool", 52 },
            },
            items = new Dictionary<uint, ushort>()
            {
                { uint.MaxValue, 0 }, // Not necessary for this application to know, but its here to remind that 0 is unavailable

                // Packs
                { 102, 53 }, // Medipack
                { 101, 54 }, // Ammo pack
                { 127, 55 }, // Tool refill pack
                { 132, 56 }, // Disinfect pack

                // Consumables
                { 114, 57 }, // Glowsticks
                { 174, 57 }, // Glowsticks
                { 30, 58 }, // Long range flashlight
                { 140, 59 }, // I2-LP Syringe
                { 142, 60 }, // IIX Syringe
                { 115, 61 }, // Cfoam Grenade
                { 116, 62 }, // Lock melter
                { 117, 63 }, // Fog repeller
                { 139, 64 }, // Explosive tripmine
                { 144, 65 }, // Cfoam tripmine

                // Big pickup
                { 131, 66 }, // Powercell
                { 133, 67 }, // Fog repeller
                { 137, 68 }, // Neonate
                { 141, 68 },
                { 143, 68 },
                { 170, 68 },
                { 145, 68 },
                { 175, 68 },
                { 177, 68 },
                { 164, 69 }, // Matter Wave Projector
                { 166, 69 },
                { 151, 70 }, // Data Sphere
                { 181, 70 },
                { 138, 71 }, // Cargo crate
                { 176, 71 },
                { 154, 72 }, // Hi sec cargo crate
                { 155, 72 },
                { 148, 73 }, // Cryo
                { 173, 74 }, // collection case
            },
            enemies = new Dictionary<uint, ushort>() {
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

                { 55, 26 }, // mega_mother
            }
        };
        private static GTFOSpecification spec = defaultSpec;
    }
}
