using Enemies;
using Gear;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;

namespace Vanilla {
    /// <summary>
    /// Used to identify a Type within the game (e.g Item / Gear / Enemy type)
    /// Abstracts away from persistent Id or other types of identification the game uses (such as Gear Public Name),
    /// providing compressed aliases to save storage space for large types (Gear public name + construction json)
    /// </summary>
    public struct Identifier : BufferWriteable, IEquatable<Identifier> {
        private static Dictionary<int, string> GearCache = new Dictionary<int, string>();
        private static Dictionary<string, ushort> GearTable = new Dictionary<string, ushort>();
        private static HashSet<ushort> WrittenGears = new HashSet<ushort>();
        [ReplayInit]
        private static void Init() {
            _id = 0;
            GearTable.Clear();
            GearCache.Clear();
            WrittenGears.Clear();
        }

        public static Identifier unknown = new Identifier() { type = Type.Unknown };

        /// <summary>
        /// Describes the format of the identifier.
        /// 
        /// `Alias_` types use an alias rather than the original identifier (often done to reduce storage space).
        /// - E.g Gear uses the gear builder string as an identifier which is very large. Thus after defining the gear once,
        ///   an alias is then used from that point after.
        /// </summary>
        private enum Type {
            Unknown,
            Gear,
            Alias_Gear,
            Item,
            Enemy,
        }

        private static ushort _id = 0;
        private static ushort AssignId() {
            return _id++;
        }

        private string stringKey;
        private ushort id;
        private Type type;

        public void Write(ByteBuffer buffer) {
            switch (type) {
            case Type.Gear: throw new Exception("GearKey is an internal type that gets written when a new Gear Alias is created. Should not be written directly.");
            case Type.Alias_Gear: {
                if (WrittenGears.Contains(id)) {
                    BitHelper.WriteBytes((byte)Type.Alias_Gear, buffer);
                    BitHelper.WriteBytes(id, buffer);
                } else {
                    WrittenGears.Add(id);
                    BitHelper.WriteBytes((byte)Type.Gear, buffer);
                    BitHelper.WriteBytes(stringKey, buffer);
                    BitHelper.WriteBytes(id, buffer);
                }
            }
            break;
            case Type.Enemy:
            case Type.Item: {
                BitHelper.WriteBytes((byte)type, buffer);
                BitHelper.WriteBytes(id, buffer);
            }
            break;
            case Type.Unknown: BitHelper.WriteBytes((byte)Type.Unknown, buffer); break;
            default: throw new NotImplementedException();
            }
        }

        public static bool operator ==(Identifier lhs, Identifier rhs) => lhs.Equals(rhs);
        public static bool operator !=(Identifier lhs, Identifier rhs) => !(lhs == rhs);

        public override bool Equals(object? obj) => obj != null && obj is Identifier && Equals(obj);
        public bool Equals(Identifier other) {
            switch (type) {
            case Type.Unknown:
                return other.type == Type.Unknown;
            case Type.Gear: {
                if (other.type == Type.Gear) {
                    return stringKey == other.stringKey;
                }
                return stringKey != null && GearTable.ContainsKey(stringKey) && other.id == GearTable[stringKey];
            }
            case Type.Alias_Gear: {
                if (other.type == Type.Alias_Gear) {
                    return id == other.id;
                }
                return other.stringKey != null && GearTable.ContainsKey(other.stringKey) && id == GearTable[other.stringKey];
            }
            case Type.Enemy:
            case Type.Item: return type == other.type && id == other.id;
            default: throw new NotImplementedException();
            }
        }

        public override int GetHashCode() {
            if (type == Type.Unknown) {
                return type.GetHashCode();
            }

            return type.GetHashCode() ^ stringKey.GetHashCode() ^ id.GetHashCode();
        }

        private static void From(GearIDRange gear, ref Identifier identifier) {
            int hash = gear.GetHashCode();
            if (GearCache.ContainsKey(hash)) {
                identifier.stringKey = GearCache[hash];
            } else {
                identifier.stringKey = gear.ToJSON();
                GearCache.Add(hash, identifier.stringKey);
            }
            identifier.type = Type.Alias_Gear;
            if (GearTable.ContainsKey(identifier.stringKey)) {
                identifier.id = GearTable[identifier.stringKey];
            } else {
                identifier.id = AssignId();
                GearTable.Add(identifier.stringKey, identifier.id);
            }
        }

        public static Identifier From(ItemEquippable? item) {
            Identifier identifier = new Identifier();
            identifier.type = Type.Unknown;

            if (item != null) {
                if (item.GearIDRange != null) {
                    GearIDRange gear = item.GearIDRange;
                    From(gear, ref identifier);
                } else if (item.ItemDataBlock != null) {
                    identifier.type = Type.Item;
                    identifier.id = (ushort)item.ItemDataBlock.persistentID;
                }
            }
            return identifier;
        }

        public static Identifier From(BackpackItem? item) {
            Identifier identifier = new Identifier();
            identifier.type = Type.Unknown;

            if (item != null) {
                if (item.GearIDRange != null) {
                    GearIDRange gear = item.GearIDRange;
                    From(gear, ref identifier);
                }
            }

            return identifier;
        }

        public static Identifier From(Item? item) {
            Identifier identifier = new Identifier();
            identifier.type = Type.Unknown;

            if (item != null) {
                if (item.ItemDataBlock != null) {
                    identifier.type = Type.Item;
                    identifier.id = (ushort)item.ItemDataBlock.persistentID;
                }
            }

            return identifier;
        }

        public static Identifier From(EnemyAgent enemy) {
            Identifier identifier = new Identifier();
            identifier.type = Type.Enemy;
            identifier.id = (ushort)enemy.EnemyData.persistentID;

            return identifier;
        }
    }
}
