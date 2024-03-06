using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Player {
    [ReplayData("Vanilla.Player.MeleeShove", "0.0.1")]
    internal class rPlayerMeleeShove : Id {
        public rPlayerMeleeShove(PlayerAgent player) : base(player.GlobalID) {
        }
    }

    [ReplayData("Vanilla.Player.Melee", "0.0.1")]
    internal class rPlayerMelee : Id {
        public enum Mode {
            Idle,
            Charge
        }

        private Mode mode;

        public rPlayerMelee(PlayerAgent player, Mode mode) : base(player.GlobalID) {
            this.mode = mode;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes((byte)mode, buffer);
        }
    }

    [ReplayData("Vanilla.Player.MeleeSwing", "0.0.1")]
    internal class rPlayerMeleeSwing : Id {
        public rPlayerMeleeSwing(PlayerAgent player) : base(player.GlobalID) {
        }
    }
}
