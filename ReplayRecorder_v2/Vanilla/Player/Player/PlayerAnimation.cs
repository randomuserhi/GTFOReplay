using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Animation", "0.0.1")]
    internal class rPlayerAnimation : ReplayDynamic {
        public PlayerAgent player;

        public override bool Active {
            get {
                if (player == null && Replay.Has<rPlayerAnimation>(id)) {
                    Replay.Despawn(Replay.Get<rPlayerAnimation>(id));
                }
                return player != null;
            }
        }
        public override bool IsDirty => true;

        public rPlayerAnimation(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
        }
    }
}
