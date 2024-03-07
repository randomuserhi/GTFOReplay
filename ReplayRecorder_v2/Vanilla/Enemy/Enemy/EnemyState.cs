using Enemies;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.State", "0.0.1")]
    internal class rEnemyState : Id {
        public enum State {
            Default,
            Stagger,
            Glue
        }

        private State state;

        public rEnemyState(EnemyAgent agent, State state) : base(agent.GlobalID) {
            this.state = state;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes((byte)state, buffer);
        }
    }
}
