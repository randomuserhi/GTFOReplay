using API;
using Player;
using SNetwork;
using static UnityEngine.UI.GridLayoutGroup;

namespace ReplayRecorder.Player
{
    public static class Player
    {
        public class rPlayerAgent : ISerializable
        {
            public SNet_Player owner;
            public int instanceID;

            public rPlayerAgent(PlayerAgent agent)
            {
                owner = agent.Owner;
                instanceID = agent.GetInstanceID();
            }

            public const int SizeOf = sizeof(ulong) + sizeof(int);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(owner.Lookup, buffer, ref index);
                BitHelper.WriteBytes(instanceID, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void Init()
        {
            players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                rPlayerAgent rPlayer = new rPlayerAgent(player);
                players.Add(rPlayer);
                APILogger.Debug($"{player.Owner.NickName} has joined.");

                SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, rPlayer);
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, player.gameObject));
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
                    APILogger.Debug($"{owner.NickName} has left.");

                    SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, player);
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
                    APILogger.Debug($"{owner.NickName} has joined.");

                    rPlayer = new rPlayerAgent(player);
                    SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, rPlayer);
                    SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, player.gameObject));
                }
                _players.Add(rPlayer);
            }
            List<rPlayerAgent> temp = _players;
            _players = players;
            players = temp;
        }
    }
}
