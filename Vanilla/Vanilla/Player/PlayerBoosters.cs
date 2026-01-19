using BoosterImplants;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Boosters", "0.0.1")]
    internal class rPlayerBoosters : ReplayDynamic {
        PlayerBoosterImplantState state;

        public rPlayerBoosters(PlayerBoosterImplantState state) : base(state.m_playerAgent.GlobalID) {
            this.state = state;
        }

        public override bool Active => state != null && state.m_playerAgent != null;
        public override bool IsDirty {
            get {
                if (conditionsMet == null) return false;

                for (int i = 0; i < conditionsMet.Length; ++i) {
                    bool value = i < state.m_boosterImplants.Count ? state.m_boosterImplants[i].ConditionsMet : false;
                    if (value != conditionsMet[i]) return true;
                }

                return false;
            }
        }

        public bool[]? conditionsMet;

        public override void Write(ByteBuffer buffer) {
            for (int i = 0; i < conditionsMet!.Length; ++i) {
                bool value = i < state.m_boosterImplants.Count ? state.m_boosterImplants[i].ConditionsMet : false;
                conditionsMet[i] = value;
                BitHelper.WriteBytes(value, buffer);
            }
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)state.m_boosterImplants.Count, buffer);
            foreach (var implant in state.m_boosterImplants) {
                BitHelper.WriteBytes((ushort)implant.BoosterImplantID, buffer);
                BitHelper.WriteBytes((byte)implant.BoosterEffects.Count, buffer);
                foreach (var effect in implant.BoosterEffects) {
                    BitHelper.WriteBytes((byte)effect.Effect, buffer);
                    BitHelper.WriteHalf(effect.Value, buffer);
                }
                BitHelper.WriteBytes((byte)implant.BoosterConditions.Count, buffer);
                foreach (var condition in implant.BoosterConditions) {
                    BitHelper.WriteBytes((byte)condition, buffer);
                }
            }

            conditionsMet = new bool[state.m_boosterImplants.Count];
            for (int i = 0; i < conditionsMet.Length; i++) {
                conditionsMet[i] = false;
            }
        }
    }
}
