using System.Text;
using API;
using Player;
using SNetwork;

namespace ReplayRecorder.Player
{
    public static class Player
    {
        public struct PlayerJoin : ISerializable
        {
            rPlayerAgent player;

            public PlayerJoin(rPlayerAgent player)
            {
                this.player = player;
            }

            private const int SizeOf = sizeof(ulong) + sizeof(int) + sizeof(ushort);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                byte[] temp = Encoding.UTF8.GetBytes(player.owner.NickName);
                int size = SizeOf + temp.Length;
                if (buffer.Length < size) buffer = new byte[size];

                int index = 0;
                BitHelper.WriteBytes(player.owner.Lookup, buffer, ref index);
                BitHelper.WriteBytes(player.instanceID, buffer, ref index);
                BitHelper.WriteBytes(temp, buffer, ref index);
                fs.Write(buffer, 0, size);
            }
        }

        public struct PlayerLeave : ISerializable
        {
            rPlayerAgent player;

            public PlayerLeave(rPlayerAgent player)
            {
                this.player = player;
            }

            public const int SizeOf = sizeof(ulong) + sizeof(int);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(player.owner.Lookup, buffer, ref index);
                BitHelper.WriteBytes(player.instanceID, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public class rPlayerAgent
        {
            public PlayerAgent agent;
            public SNet_Player owner;
            public int instanceID;

            public rPlayerAgent(PlayerAgent agent)
            {
                this.agent = agent;
                owner = agent.Owner;
                instanceID = agent.GetInstanceID();
            }
        }

        public static void Init()
        {
            APILogger.Debug($"Initializing...");

            players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                rPlayerAgent rPlayer = new rPlayerAgent(player);
                players.Add(rPlayer);
                APILogger.Debug($"{player.Owner.NickName} has joined.");

                SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, new PlayerJoin(rPlayer));
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, new SnapshotManager.rObject(player.gameObject)));
            }
        }

        // NOTE(randomuserhi): Players that join are spawned as 2 agents
        //                     the first is as an agent in the elevator and the second is as
        //                     an agent in the level. This is why the player joining algorithm is weird.

        public static void SpawnPlayer(PlayerAgent agent)
        {
            rPlayerAgent? old = players.Find(p => p.owner.Lookup == agent.Owner.Lookup);
            if (old != null)
            {
                // Replace old elevator agent with agent in level
                APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} was replaced by spawned agent.");
                SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, new PlayerLeave(old));
                SnapshotManager.RemoveDynamicObject(old.instanceID);

                players.Remove(old);
            }
            else APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");

            rPlayerAgent player = new rPlayerAgent(agent);
            SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, new PlayerJoin(player));
            SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(player.instanceID, new SnapshotManager.rObject(agent.gameObject)));
            players.Add(player);
        }
        public static void DespawnPlayer(PlayerAgent agent)
        {
            rPlayerAgent? player = players.Find(p => p.owner.Lookup == agent.Owner.Lookup);
            if (player != null)
            {
                APILogger.Debug($"{agent.Owner.NickName} has left.");

                SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, new PlayerLeave(player));
                SnapshotManager.RemoveDynamicObject(player.instanceID);

                players.Remove(player);
            }
        }

        // TODO(randomuserhi): Better way of detecting player joining other than checking every tick
        private static List<PlayerAgent> buffer = new List<PlayerAgent>();
        private static List<rPlayerAgent> _players = new List<rPlayerAgent>();
        private static List<rPlayerAgent> players = new List<rPlayerAgent>();
        public static void OnTick()
        {
            buffer.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                buffer.Add(player);
            }
            foreach (rPlayerAgent player in players)
            {
                SNet_Player owner = player.owner;
                if (!buffer.Any(p => p.Owner.Lookup == owner.Lookup))
                {
                    APILogger.Debug($"(Tick) {owner.NickName} has left.");

                    SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, new PlayerLeave(player));
                    SnapshotManager.RemoveDynamicObject(player.instanceID);
                }
            }
            _players.Clear();
            foreach (PlayerAgent player in buffer)
            {
                SNet_Player owner = player.Owner;
                rPlayerAgent? rPlayer = players.Find(p => p.owner.Lookup == owner.Lookup);
                if (rPlayer == null)
                {
                    APILogger.Debug($"(Tick) {owner.NickName} has joined.");

                    rPlayer = new rPlayerAgent(player);
                    SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, new PlayerJoin(rPlayer));
                    SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, new SnapshotManager.rObject(player.gameObject)));
                }
                _players.Add(rPlayer);
            }
            List<rPlayerAgent> temp = _players;
            _players = players;
            players = temp;
        }
    }
}
