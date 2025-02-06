using GameData;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Events {
    [ReplayData("Vanilla.WardenEvents.Survival", "0.0.1")]
    internal class rWardenEventSurvival : ReplayDynamic {
        [ReplayOnGameplayStart]
        private static void Init() {
            _id = 0;
            SpawnSurvivalEventsForLayer(LG_LayerType.MainLayer);
            SpawnSurvivalEventsForLayer(LG_LayerType.SecondaryLayer);
            SpawnSurvivalEventsForLayer(LG_LayerType.ThirdLayer);
        }

        private static int _id = 0;

        private static void SpawnSurvivalEventsForLayer(LG_LayerType layer) {
            for (int i = 0; i < WardenObjectiveManager.GetWardenObjectiveCountForLayer(layer); ++i) {
                if (!WardenObjectiveManager.TryGetWardenObjectiveDataForLayer(layer, i, out var data)) {
                    continue;
                }

                if (data.Type != eWardenObjectiveType.Survival) continue;

                Replay.Spawn(new rWardenEventSurvival(_id++, data, layer, i));
            }
        }

        public override bool IsDirty {
            get {
                var currentState = WardenObjectiveManager.CurrentState;
                var status = currentState.GetLayerStatus(layer);

                float extraTime = WardenObjectiveManager.GetExtraTime();

                float start = WardenObjectiveManager.CurrentState.GetStartTimeFromLayer(layer) + data.Survival_TimeToActivate;
                if (data.Survival_TimeToActivate > 0) {
                    start += extraTime;
                }

                float end = start + data.Survival_TimeToSurvive;
                if (data.Survival_TimeToSurvive > 0) {
                    end += extraTime;
                }


                float timeLeft;
                State state;
                int currentChainIndex = 0;

                switch (layer) {
                case LG_LayerType.MainLayer: {
                    currentChainIndex = currentState.main_chainIndex;
                }
                break;
                case LG_LayerType.SecondaryLayer: {
                    currentChainIndex = currentState.second_chainIndex;
                }
                break;
                case LG_LayerType.ThirdLayer: {
                    currentChainIndex = currentState.third_chainIndex;
                }
                break;
                }

                if (chainIndex != currentChainIndex) {
                    timeLeft = 0;
                    state = chainIndex < currentChainIndex ? State.Inactive : State.Completed;
                } else {
                    if (Clock.ExpeditionProgressionTime > end) {
                        timeLeft = 0;
                        state = State.Completed;
                    } else if (Clock.ExpeditionProgressionTime > start) {
                        timeLeft = end - Clock.ExpeditionProgressionTime;
                        state = State.Survival;
                    } else {
                        timeLeft = start - Clock.ExpeditionProgressionTime;
                        state = State.TimeToActivate;
                    }
                }

                bool result = this.timeLeft != timeLeft || this.state != state;

                this.timeLeft = timeLeft;
                this.state = state;

                return result;
            }
        }

        public override bool Active => true;

        private WardenObjectiveDataBlock data;

        private enum State {
            Inactive,
            TimeToActivate,
            Survival,
            Completed
        }

        private State state = State.Inactive;
        private float timeLeft = 0;

        private LG_LayerType layer;

        private int chainIndex;

        public rWardenEventSurvival(int id, WardenObjectiveDataBlock data, LG_LayerType layer, int chainIndex) : base(id) {
            this.data = data;
            this.chainIndex = chainIndex;
            this.layer = layer;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)state, buffer);
            BitHelper.WriteHalf(timeLeft, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes(data.Survival_TimerTitle, buffer);
            BitHelper.WriteBytes(data.Survival_TimerToActivateTitle, buffer);
        }
    }
}
