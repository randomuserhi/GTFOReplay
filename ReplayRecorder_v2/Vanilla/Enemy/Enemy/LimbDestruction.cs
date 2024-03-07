using Enemies;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.LimbDestruction", "0.0.1")]
    internal class rLimbDestruction : Id {
        public enum Type {
            head
        }

        private Type type;

        public rLimbDestruction(EnemyAgent agent, Type type) : base(agent.GlobalID) {
            this.type = type;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }
}
