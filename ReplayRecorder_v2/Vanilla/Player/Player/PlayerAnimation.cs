using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Animation", "0.0.1")]
    internal class rPlayerAnimation : ReplayDynamic {
        public PlayerAgent player;
        private Animator animator;

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
                    velFwd != compress(_velFwd, 10f) ||
                    velRight != compress(_velRight, 10f);

                bool crouch = this.crouch != (byte)(_crouch * byte.MaxValue);

                bool aim = targetLookDir != player.TargetLookDir;

                return
                    vel ||
                    crouch ||
                    aim ||
                    state != (byte)player.Locomotion.m_currentStateEnum;
            }
        }

        public float _velFwd => animator.GetFloat("MoveBackwardForward");
        public byte velFwd;

        public float _velRight => animator.GetFloat("MoveLeftRight");
        public byte velRight;

        public float _crouch => animator.GetFloat("Crouch");
        public byte crouch;

        public Vector3 targetLookDir;

        private const long landAnimDuration = 867;
        private const long landAnimShortDuration = 150;
        private long landTriggered;
        private byte _state;
        public byte state;

        public rPlayerAnimation(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
            animator = player.AnimatorBody;
        }

        public override void Write(ByteBuffer buffer) {
            velRight = compress(_velRight, 10f);
            velFwd = compress(_velFwd, 10f);

            BitHelper.WriteBytes(velRight, buffer);
            BitHelper.WriteBytes(velFwd, buffer);

            crouch = (byte)(_crouch * byte.MaxValue);

            BitHelper.WriteBytes(crouch, buffer);

            targetLookDir = player.TargetLookDir;

            BitHelper.WriteHalf(targetLookDir, buffer);

            if ((Raudy.Now - landTriggered > landAnimDuration) ||
                state != (byte)PlayerLocomotion.PLOC_State.Land ||
                player.Locomotion.m_currentStateEnum == PlayerLocomotion.PLOC_State.Jump ||
                player.Locomotion.m_currentStateEnum == PlayerLocomotion.PLOC_State.Fall) {
                state = (byte)player.Locomotion.m_currentStateEnum;
                if ((_state == (byte)PlayerLocomotion.PLOC_State.Jump || _state == (byte)PlayerLocomotion.PLOC_State.Fall) &&
                    state != (byte)PlayerLocomotion.PLOC_State.Jump && state != (byte)PlayerLocomotion.PLOC_State.Fall) {
                    landTriggered = Raudy.Now;
                    state = (byte)PlayerLocomotion.PLOC_State.Land;
                }
            }
            _state = state;

            BitHelper.WriteBytes(state, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
