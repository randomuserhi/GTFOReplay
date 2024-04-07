using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;
using UnityEngine;

namespace Vanilla.StatTracker.Dodges {
    [HarmonyPatch]
    internal class Patches {
        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.OnAttackIsOut))]
        [HarmonyPrefix]
        public static void OnAttackIsOut(MovingEnemyTentacleBase __instance) {
            if (!SNet.IsMaster) return;

            PlayerAgent? target = __instance.PlayerTarget;

            bool flag = __instance.CheckTargetInAttackTunnel();
            if (target != null && target.Damage.IsSetup) {
                bool flag2;
                if (__instance.m_owner.EnemyBalancingData.UseTentacleTunnelCheck) {
                    flag2 = flag;
                } else {
                    Vector3 tipPos = __instance.GetTipPos();
                    flag2 = (target.TentacleTarget.position - tipPos).magnitude < __instance.m_owner.EnemyBalancingData.TentacleAttackDamageRadiusIfNoTunnelCheck;
                }
                if (!flag2) {
                    Replay.Trigger(new rTongueDodge(__instance.m_owner, target));
                }
            }
        }
    }

    [ReplayData("Vanilla.StatTracker.TongueDodge", "0.0.1")]
    internal class rTongueDodge : ReplayEvent {
        private ushort source;
        private ushort target;

        public rTongueDodge(EnemyAgent source, PlayerAgent target) {
            this.source = source.GlobalID;
            this.target = target.GlobalID;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
        }
    }
}
