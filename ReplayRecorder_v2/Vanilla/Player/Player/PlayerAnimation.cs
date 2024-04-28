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

        private static byte compress(float value, float max) {
            value /= max;
            value = Mathf.Clamp(value, -1f, 1f);
            value = Mathf.Clamp01((value + 1.0f) / 2.0f);
            return (byte)(value * byte.MaxValue);
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
                    velFwdLocal != compress(locomotion.VelFwdLocal, 10f) ||
                    velRightLocal != compress(locomotion.VelRightLocal, 10f);

                bool crouch = this.crouch != (byte)(locomotion.m_crouch * byte.MaxValue);

                bool aim = targetLookDir != player.TargetLookDir;

                return
                    vel ||
                    crouch ||
                    aim;
            }
        }

        public byte velFwdLocal;
        public byte velRightLocal;

        public byte crouch;

        public Vector3 targetLookDir;

        public rPlayerAnimation(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
            locomotion = player.Locomotion;
        }

        public override void Write(ByteBuffer buffer) {
            velRightLocal = compress(locomotion.VelRightLocal, 10f);
            velFwdLocal = compress(locomotion.VelFwdLocal, 10f);

            BitHelper.WriteBytes(velRightLocal, buffer);
            BitHelper.WriteBytes(velFwdLocal, buffer);

            crouch = (byte)(locomotion.m_crouch * byte.MaxValue);

            BitHelper.WriteBytes(crouch, buffer);

            targetLookDir = player.TargetLookDir;

            BitHelper.WriteHalf(targetLookDir, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
