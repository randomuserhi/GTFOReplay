using API;
using System.Text.Json;
using static UnityEngine.GridBrushBase;
using UnityEngine;

namespace ReplayRecorder
{
    // TODO(randomuserhi): Write spec to a file so people can edit it
    //                     Load custom spec => write JS on web to also accept a custom spec sheet
    internal struct GTFOSpecification
    {
        public Dictionary<string, byte> enemies { get; set; }
        public Dictionary<string, byte> items { get; set; }

        public static GTFOSpecification LoadSpecification(string filepath)
        {
            string text = File.ReadAllText(filepath);
            spec = JsonSerializer.Deserialize<GTFOSpecification>(text);
            return spec;
        }

        public static byte GetEnemyType(string type)
        {
            if (spec.enemies.ContainsKey(type))
            {
                return spec.enemies[type];
            }
            else
            {
                APILogger.Error($"Unknown enemy type, {type}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        public static byte GetItem(string item)
        {
            if (spec.items.ContainsKey(item))
            {
                return spec.items[item];
            }
            else
            {
                APILogger.Error($"Unknown item type, {item}, found. Please create a custom specification and add it.");
                return 0;
            }
        }

        private static GTFOSpecification defaultSpec = new GTFOSpecification()
        {
            items = new Dictionary<string, byte>()
            {
                { "unknown", 0 }, // Not necessary for this application to know, but its here to remind that 0 is unavailable
                
                { "Shelling S49", 1 },
                { "Bataldo 3RB", 2 },
                { "Raptus Treffen 2", 3 },
                { "Raptus Steigro", 4 },
                { "Accrat Golok DA", 5 },
                { "Van Auken LTC5", 6 },
                { "Accrat STB", 7 },
                { "Van Auken CAB F4", 8 },
                { "TR22 Hanaway", 9 },
                { "Malatack LX", 10 },
                { "Malatack CH 4", 11 },
                { "Drekker Pres MOD 556", 12 },
                { "Bataldo J 300", 13 },
                { "Accrat ND6", 14 },

                { "Malatack HXC", 15 },
                { "Buckland s870", 16 },
                { "Buckland AF6", 17 },
                { "Buckland XDist2", 18 },
                { "Mastaba R66", 19 },
                { "TechMan Arbalist V", 20 },
                { "TechMan Veruta XII", 21 },
                { "TechMan Klust 6", 22 },
                { "Omneco EXP1", 23 },
                { "Shelling Arid 5", 24 },
                { "Drekker Del P1", 25 },
                { "Köning PR 11", 26 },
                { "Omneco LRG", 27 },

                { "Santonian HDH", 28 },
                { "Mastaba Fixed Blade", 29 },
                { "Kovac Peacekeeper", 30 },
                { "MACO Drillhead", 31 },

                { "Mechatronic SGB3", 32 },
                { "Mechatronic B5 LFR", 33 },
                { "Autotek 51 RSG", 34 },
                { "utotek 51 RSG", 34 }, // Not sure where this one comes from
                { "Rad Labs Meduza", 35 },
                { "D-tek Optron IV", 36 },

                { "Stalwart Flow G2", 37 },
                { "Krieger O4", 38 },

                { "Ammo Pack", 39 },
                { "Tool Refill Pack", 40 },
                { "MediPack", 41 },

                { "Hacking Tool", 42 },

                { "Long Range Flashlight", 43 },
                { "Lock Melter", 44 },
                { "Glow Stick", 45 },
            },
            enemies = new Dictionary<string, byte>() {
                { "unknown", 0 }, // Not necessary for this application to know, but its here to remind that 0 is unavailable
                
                { "Scout", 1 },
                { "Scout_Shadow", 2 },
                { "Scout_Bullrush", 3 },

                { "Shadow", 4 },
                { "Striker_Big_Shadow", 5 },

                { "Striker_Child", 6 },
                { "Striker_Wave", 7 },
                { "Striker_Hibernate", 7 },
                { "Striker_Big_Wave", 8 },
                { "Striker_Big_Hibernate", 8 },

                { "Shooter_Wave", 9 },
                { "Shooter_Hibernate", 9 },
                { "Shooter_Big", 10 },

                { "Shooter_Big_RapidFire", 11 },

                { "Striker_Bullrush", 12 },
                { "Striker_Big_Bullrush", 13 },

                { "Tank", 14 },
                { "Birther_Boss", 15 },
                { "Pouncer", 16 }
            }
        };
        private static GTFOSpecification spec = defaultSpec;
    }
}
