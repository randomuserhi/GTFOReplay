using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Animation", "0.0.1")]
    internal class rPlayerAnimation : ReplayDynamic {
        public PlayerAgent player;
        private PlayerLocomotion locomotion;

        private static float zero(float value) {
            if (Mathf.Abs(value) < 0.01f) {
                value = 0;
            }
            return value;
        }

        public override bool Active {
            get {
                if (player == null && Replay.Has<rPlayerAnimation>(id)) {
                    Replay.Despawn(Replay.Get<rPlayerAnimation>(id));
                }
                return player != null;
            }
        }
        public override bool IsDirty {
            get {
                bool vel =
                    velFwdLocal != zero(locomotion.VelFwdLocal) ||
                    velRightLocal != zero(locomotion.VelRightLocal);

                bool crouch = this.crouch != zero(locomotion.m_crouch);

                return
                    vel ||
                    crouch;
            }
        }

        public float velFwdLocal;
        public float velRightLocal;

        public float crouch;

        public rPlayerAnimation(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
            locomotion = player.Locomotion;
        }

        public override void Write(ByteBuffer buffer) {
            velRightLocal = zero(locomotion.VelRightLocal);
            velFwdLocal = zero(locomotion.VelFwdLocal);

            BitHelper.WriteHalf(velRightLocal, buffer);
            BitHelper.WriteHalf(velFwdLocal, buffer);

            crouch = zero(locomotion.m_crouch);

            BitHelper.WriteHalf(crouch, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
