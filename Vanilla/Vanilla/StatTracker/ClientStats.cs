using Gear;
using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using Vanilla.Enemy;

namespace Vanilla.StatTracker {
    // Marks recordings with direct local observations, including a genuine zero.
    [ReplayData("Vanilla.StatTracker.Client", "0.0.1")]
    internal class rClientStats : ReplayHeader {
        [ReplayInit]
        private static void Init() => Replay.Trigger(new rClientStats());
        public override void Write(ByteBuffer buffer) { }
    }

    [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
    [ReplayData("Vanilla.StatTracker.EnemyDeath", "0.0.1")]
    internal class rEnemyDeath : Id {
        public rEnemyDeath(int id) : base(id) { }

        [HarmonyPrefix]
        private static void Prefix(EnemyBehaviour __instance, EB_States state, out rEnemy? __state) {
            __state = null;
            if (Replay.Active && state == EB_States.Dead && __instance.m_currentStateName != EB_States.Dead)
                Replay.TryGet<rEnemy>(__instance.m_ai.m_enemyAgent.GlobalID, out __state);
        }

        [HarmonyPostfix]
        private static void Postfix(EnemyBehaviour __instance, rEnemy? __state) {
            // Keep the tracked instance across the native call: entering Dead may
            // despawn it before the postfix. Each spawn owns its own death marker.
            if (Replay.Active && __state != null && !__state.deathRecorded && __instance.m_currentStateName == EB_States.Dead) {
                __state.deathRecorded = true;
                var enemy = __instance.m_ai.m_enemyAgent;
                Replay.Trigger(new rEnemyDeath(enemy.GlobalID));
                EnemyReplayManager.Despawn(enemy);
            }
        }
    }

    // Counts the local player's consumed pack uses, not healing effects or transfers.
    // This is recorded locally only; host Pack broadcasts cannot duplicate this metric.
    [HarmonyPatch(typeof(ResourcePackFirstPerson), nameof(ResourcePackFirstPerson.ApplyPack))]
    [ReplayData("Vanilla.StatTracker.PackConsumed", "0.0.1")]
    internal class rPackConsumed : Id {
        private readonly byte type;
        private rPackConsumed(int owner, byte type) : base(owner) => this.type = type;

        internal readonly record struct Use(int Owner, byte Type, float Ammo);

        [HarmonyPrefix]
        private static void Prefix(ResourcePackFirstPerson __instance, out Use? __state) {
            __state = null;
            if (!Replay.Active || __instance.Owner == null || !__instance.Owner.IsLocallyOwned) return;
            if (!Replay.Has<Vanilla.Player.rPlayer>(__instance.Owner.GlobalID)) return;
            byte? type = __instance.m_packType switch {
                eResourceContainerSpawnType.AmmoWeapon => 0,
                eResourceContainerSpawnType.AmmoTool => 1,
                eResourceContainerSpawnType.Health => 2,
                eResourceContainerSpawnType.Disinfection => 3,
                _ => null
            };
            if (type.HasValue) __state = new Use(__instance.Owner.GlobalID, type.Value, __instance.GetCustomData().ammo);
        }

        [HarmonyPostfix]
        private static void Postfix(ResourcePackFirstPerson __instance, Use? __state) {
            if (!Replay.Active || !__state.HasValue) return;
            var use = __state.Value;
            float remaining = __instance.GetCustomData().ammo;
            // Starting an interaction or returning early must not count as a use.
            if (float.IsFinite(use.Ammo) && float.IsFinite(remaining) && use.Ammo > 0 && remaining >= 0 && remaining < use.Ammo)
                Replay.Trigger(new rPackConsumed(use.Owner, use.Type));
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(type, buffer);
        }
    }
}
