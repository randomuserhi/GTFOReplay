using API;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.Core;

namespace Vanilla.PlayerTest {
    internal class Test {
        [ReplayOnHeaderCompletion]
        public static void Init() {
            APILogger.Debug($"Test for players...");

            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                Replay.Spawn(new DynamicTransform(player.GlobalID, new AgentTransform(player)));
            }
        }
    }
}
