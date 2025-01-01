using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Enemy {
    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Tendril", "0.0.1")]
    public class rEnemyTendril : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ScoutAntenna), nameof(ScoutAntenna.DetailUpdate))]
            [HarmonyPostfix]
            private static void Postfix_Update(ScoutAntenna __instance) {
                int id = __instance.GetInstanceID();
                if (Replay.Has<rEnemyTendril>(id)) return;

                if (__instance.m_detection != null && __instance.m_detection.State != eDetectionState.Idle) {
                    Replay.Spawn(new rEnemyTendril(__instance));
                }
            }

            [HarmonyPatch(typeof(ScoutAntenna), nameof(ScoutAntenna.Remove))]
            [HarmonyPostfix]
            private static void Postfix_Remove(ScoutAntenna __instance) {
                int id = __instance.GetInstanceID();
                if (Replay.Has<rEnemyTendril>(id)) {
                    Replay.Despawn(Replay.Get<rEnemyTendril>(id));
                }
            }
        }

        private ScoutAntenna tendril;
        private EnemyAgent owner;
        private Vector3 relPos => tendril.m_currentPos - owner.transform.position;
        private Vector3 _relPos;

        private Vector3 sourcePos => tendril.m_sourcePos - owner.transform.position;
        private Vector3 _sourcePos;

        private bool detect => tendril.m_state == ScoutAntenna.eTendrilState.MovingInDetect;
        private bool _detect = false;

        public override bool Active => tendril != null;

        public override bool IsDirty {
            get {
                return _relPos != relPos || _sourcePos != sourcePos;
            }
        }

        public rEnemyTendril(ScoutAntenna tendril) : base(tendril.GetInstanceID()) {
            owner = tendril.m_detection.m_owner;
            this.tendril = tendril;
        }

        public override void Write(ByteBuffer buffer) {
            _sourcePos = sourcePos;

            BitHelper.WriteHalf(_sourcePos, buffer);

            _relPos = relPos;

            BitHelper.WriteHalf(_relPos, buffer);

            _detect = detect;

            BitHelper.WriteBytes(_detect, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
            BitHelper.WriteBytes(owner.GlobalID, buffer);
        }
    }
}
