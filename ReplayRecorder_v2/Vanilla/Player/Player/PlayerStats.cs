using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Stats", "0.0.1")]
    internal class rPlayerStats : ReplayDynamic {
        public PlayerAgent agent;

        int id;
        public override int Id => id;

        public override bool Active {
            get {
                if (agent == null && Replay.Has<rPlayerStats>(Id)) {
                    Replay.Despawn(Replay.Get<rPlayerStats>(Id));
                }
                return agent != null;
            }
        }
        public override bool IsDirty => true;

        public rPlayerStats(PlayerAgent player) {
            id = player.GlobalID;
            this.agent = player;
        }

        public override void Write(ByteBuffer buffer) {
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
