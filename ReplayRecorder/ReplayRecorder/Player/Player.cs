using API;
using Player;
using SNetwork;

namespace ReplayRecorder.Player
{
    public static class Player
    {
        public static void Init()
        {
            players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                players.Add(player.Owner);
                APILogger.Debug($"{player.Owner.NickName} has joined.");
            }
        }

        // TODO(randomuserhi): Better way of detecting player joining other than checking every tick
        private static List<SNet_Player> _players = new List<SNet_Player>();
        private static List<SNet_Player> players = new List<SNet_Player>();
        public static void OnTick()
        {
            _players.Clear();
            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel)
            {
                _players.Add(player.Owner);
            }
            foreach (SNet_Player player in players)
            {
                if (!_players.Any(p => p.Lookup == player.Lookup))
                {
                    APILogger.Debug($"{player.NickName} has left.");
                }
            }
            foreach (SNet_Player player in _players)
            {
                if (!players.Any(p => p.Lookup == player.Lookup))
                {
                    APILogger.Debug($"{player.NickName} has joined.");
                }
            }
            List<SNet_Player> temp = _players;
            _players = players;
            players = temp;
        }
    }
}
