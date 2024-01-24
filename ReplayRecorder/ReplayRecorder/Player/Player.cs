using API;
using Player;
using SNetwork;
using System.Text;

namespace ReplayRecorder.Player {
    internal struct rPlayer : ISerializable {
        private byte slot;

        public rPlayer(PlayerAgent agent) {
            slot = (byte)agent.PlayerSlotIndex;
        }

        public void Serialize(FileStream fs) {
            fs.WriteByte(slot);
        }
    }

    internal class rPlayerAgent {
        public PlayerAgent agent;
        public ItemEquippable? lastEquipped;
        public SNet_Player owner;
        public int instanceID;

        public rPlayerAgent(PlayerAgent agent) {
            this.agent = agent;
            owner = agent.Owner;
            instanceID = agent.GetInstanceID();
            lastEquipped = null;
        }
    }

    internal static class Player {
        public struct PlayerJoin : ISerializable {
            rPlayerAgent player;
            byte slot;

            public PlayerJoin(rPlayerAgent player) {
                this.player = player;
                slot = (byte)player.agent.PlayerSlotIndex;
            }

            private const int SizeOf = sizeof(ulong) + sizeof(int) + 1 + sizeof(ushort);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                byte[] temp = Encoding.UTF8.GetBytes(player.owner.NickName);
                int size = SizeOf + temp.Length;
                if (buffer.Length < size) buffer = new byte[size];

                int index = 0;
                BitHelper.WriteBytes(player.owner.Lookup, buffer, ref index);
                BitHelper.WriteBytes(player.instanceID, buffer, ref index);
                BitHelper.WriteBytes(slot, buffer, ref index);
                BitHelper.WriteBytes(temp, buffer, ref index);
                fs.Write(buffer, 0, size);
            }
        }

        public struct PlayerLeave : ISerializable {
            rPlayerAgent player;

            public PlayerLeave(rPlayerAgent player) {
                this.player = player;
            }

            public const int SizeOf = sizeof(ulong) + sizeof(int);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(player.owner.Lookup, buffer, ref index);
                BitHelper.WriteBytes(player.instanceID, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public struct rPlayerRevive : ISerializable {
            private byte player;
            private byte source;

            public rPlayerRevive(PlayerAgent player, PlayerAgent source) {
                this.player = (byte)player.PlayerSlotIndex;
                this.source = (byte)source.PlayerSlotIndex;
            }

            public void Serialize(FileStream fs) {
                fs.WriteByte(player);
                fs.WriteByte(source);
            }
        }

        public static void OnPlayerDead(PlayerAgent player) {
            APILogger.Debug($"{player.Owner.NickName} has died.");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerDead, new rPlayer(player));
        }

        public static void OnPlayerRevive(PlayerAgent player, PlayerAgent source) {
            APILogger.Debug($"{player.Owner.NickName} was revived by {source.Owner.NickName}.");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerRevive, new rPlayerRevive(player, source));
        }

        public struct rPlayerWield : ISerializable {
            byte slot;
            byte item;

            public rPlayerWield(PlayerAgent player, byte item) {
                slot = (byte)player.PlayerSlotIndex;
                this.item = item;
            }

            private const int SizeOf = 2;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                fs.WriteByte(slot);
                fs.WriteByte(item);
            }
        }

        public static void CheckPlayerWield() {
            foreach (rPlayerAgent p in playerList) {
                ItemEquippable i = p.agent.Inventory.WieldedItem;
                if (i != p.lastEquipped) {
                    p.lastEquipped = i;
                    if (p.lastEquipped != null) {
                        OnPlayerWield(p.agent, p.lastEquipped);
                    }
                }
            }
        }

        public static void OnPlayerWield(PlayerAgent player, ItemEquippable item) {
            // TODO(randomuserhi): Change to use item.pItemData.itemID_gearCRC instead
            APILogger.Debug($"{player.Owner.NickName} is wielding {item.PublicName} [{item.ArchetypeID}]");
            SnapshotManager.AddEvent(GameplayEvent.Type.PlayerWield, new rPlayerWield(player, GTFOSpecification.GetItem(item.ArchetypeID)));
        }

        public static void Init() {
            APILogger.Debug($"Initializing...");

            playerList.Clear();
            players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                rPlayerAgent rPlayer = new rPlayerAgent(player);
                playerList.Add(rPlayer);
                players.Add(rPlayer.instanceID, rPlayer);
                APILogger.Debug($"{player.Owner.NickName} has joined.");

                SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, new PlayerJoin(rPlayer));
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, new SnapshotManager.rAgent(player)));
            }
        }

        // NOTE(randomuserhi): Players that join are spawned as 2 agents
        //                     the first is as an agent in the elevator and the second is as
        //                     an agent in the level. This is why the player joining algorithm is weird.

        public static void SpawnPlayer(PlayerAgent agent) {
            rPlayerAgent? old = playerList.Find(p => p.owner.Lookup == agent.Owner.Lookup);
            if (old != null) {
                // Replace old elevator agent with agent in level
                APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} was replaced by spawned agent.");
                SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, new PlayerLeave(old));
                SnapshotManager.RemoveDynamicObject(old.instanceID);

                playerList.Remove(old);
                players.Remove(old.instanceID);
            } else APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");

            rPlayerAgent player = new rPlayerAgent(agent);
            SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, new PlayerJoin(player));
            SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(player.instanceID, new SnapshotManager.rAgent(agent)));

            playerList.Add(player);
            players.Add(player.instanceID, player);
        }
        public static void DespawnPlayer(PlayerAgent agent) {
            rPlayerAgent? player = playerList.Find(p => p.owner.Lookup == agent.Owner.Lookup);
            if (player != null) {
                APILogger.Debug($"{agent.Owner.NickName} has left.");

                SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, new PlayerLeave(player));
                SnapshotManager.RemoveDynamicObject(player.instanceID);
                players.Remove(player.instanceID);

                playerList.Remove(player);
            }
        }

        // TODO(randomuserhi): Better way of detecting player joining other than checking every tick
        private static List<PlayerAgent> buffer = new List<PlayerAgent>();
        private static List<rPlayerAgent> _players = new List<rPlayerAgent>();
        private static List<rPlayerAgent> playerList = new List<rPlayerAgent>();
        public static Dictionary<int, rPlayerAgent> players = new Dictionary<int, rPlayerAgent>();
        private static void CheckPlayersJoined() {
            buffer.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                buffer.Add(player);
            }
            foreach (rPlayerAgent player in playerList) {
                SNet_Player owner = player.owner;
                if (!buffer.Any(p => p.Owner.Lookup == owner.Lookup)) {
                    APILogger.Debug($"(Tick) {owner.NickName} has left.");

                    SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, new PlayerLeave(player));
                    SnapshotManager.RemoveDynamicObject(player.instanceID);
                    players.Remove(player.instanceID);
                }
            }
            _players.Clear();
            foreach (PlayerAgent player in buffer) {
                SNet_Player owner = player.Owner;
                rPlayerAgent? rPlayer = playerList.Find(p => p.owner.Lookup == owner.Lookup);
                if (rPlayer == null) {
                    APILogger.Debug($"(Tick) {owner.NickName} has joined.");

                    rPlayer = new rPlayerAgent(player);
                    SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, new PlayerJoin(rPlayer));
                    SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, new SnapshotManager.rAgent(player)));
                    players.Add(rPlayer.instanceID, rPlayer);
                }
                _players.Add(rPlayer);
            }
            List<rPlayerAgent> temp = _players;
            _players = playerList;
            playerList = temp;
        }

        public static void OnTick() {
            CheckPlayersJoined();
            CheckPlayerWield();
            // TODO(randomuserhi): check what players have equipped => different script honestly
        }
    }
}
