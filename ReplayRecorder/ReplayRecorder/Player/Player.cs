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
            public SNet_Player player;
            public int instanceID;

            public rPlayerAgent(PlayerAgent agent)
            {
                player = agent.Owner;
                instanceID = agent.GetInstanceID();
            }

            public const int SizeOf = sizeof(ulong) + sizeof(int);
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(player.Lookup, buffer, ref index);
                BitHelper.WriteBytes(instanceID, buffer, ref index);
                fs.Write(buffer);
            }
        }

        public static void Init()
        {
            players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                players.Add(player);
                APILogger.Debug($"{player.Owner.NickName} has joined.");

                rPlayerAgent rPlayer = new rPlayerAgent(player);
                SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, rPlayer);
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, player.gameObject));
            }
        }

        // TODO(randomuserhi): Better way of detecting player joining other than checking every tick
        private static List<PlayerAgent> _players = new List<PlayerAgent>();
        private static List<PlayerAgent> players = new List<PlayerAgent>();
        public static void OnTick()
        {
            _players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                _players.Add(player);
            }
            foreach (PlayerAgent player in players)
            {
                SNet_Player owner = player.Owner;
                if (!_players.Any(p => p.Owner.Lookup == owner.Lookup))
                {
                    APILogger.Debug($"{owner.NickName} has left.");

                    rPlayerAgent rPlayer = new rPlayerAgent(player);
                    SnapshotManager.AddEvent(GameplayEvent.Type.RemovePlayer, rPlayer);
                    SnapshotManager.RemoveDynamicObject(rPlayer.instanceID);
                }
            }
            foreach (PlayerAgent player in _players)
            {
                SNet_Player owner = player.Owner;
                if (!players.Any(p => p.Owner.Lookup == owner.Lookup))
                {
                    APILogger.Debug($"{owner.NickName} has joined.");

                    rPlayerAgent rPlayer = new rPlayerAgent(player);
                    SnapshotManager.AddEvent(GameplayEvent.Type.AddPlayer, rPlayer);
                    SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(rPlayer.instanceID, player.gameObject));
                }
            }
            List<PlayerAgent> temp = _players;
            _players = players;
            players = temp;
        }
    }
}
