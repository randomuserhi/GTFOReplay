using API;
using System.Text.Json;

namespace ReplayRecorder
{
    // TODO(randomuserhi): Write spec to a file so people can edit it
    //                     Load custom spec => write JS on web to also accept a custom spec sheet
    internal struct GTFOSpecification
    {
        public Dictionary<string, byte> enemies { get; set; }

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

        private static GTFOSpecification defaultSpec = new GTFOSpecification()
        {
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
