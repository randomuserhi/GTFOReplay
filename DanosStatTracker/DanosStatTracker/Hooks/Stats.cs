using DanosStatTracker.Data;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using SNetwork;
using Vanilla.Enemy;
using Vanilla.Mines;
using Vanilla.Player;
using Vanilla.StatTracker;
using Vanilla.StatTracker.Consumable;

namespace DanosStatTracker.Hooks {
    internal class Stats {
        [ReplayHook(typeof(rDowned))]
        private static void DownedHook(long timestamp, rDowned e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            if (Replay.TryGet<rPlayer>(e.id, out rPlayer player)) {
                DanosStaticStore.currentRunDownDataStore.AddPlayerDownData((long)player.agent.Owner.Lookup);
            }
        }

        [ReplayHook(typeof(rPlayerAnimation))]
        private static void AnimationHook(long timestamp, rPlayerAnimation e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            if (e.wasReloading == false && e.isReloading == true) {
                if (Replay.TryGet<rPlayer>(e.id, out rPlayer player)) {
                    DanosStaticStore.currentRunDownDataStore.AddPlayerReloadData((long)player.agent.Owner.Lookup);
                }
            }
        }

        [ReplayHook(typeof(rPack))]
        private static void PackHook(long timestamp, rPack e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            if (Replay.TryGet<rPlayer>(e.target, out rPlayer player)) {
                switch (e.type) {
                case rPack.Type.Ammo: {
                    DanosStaticStore.currentRunDownDataStore.AddPlayerAmmoPackUsed((long)player.agent.Owner.Lookup);
                }
                break;
                case rPack.Type.HealingItem: {
                    DanosStaticStore.currentRunDownDataStore.AddPlayerHealthPackUsed((long)player.agent.Owner.Lookup);
                }
                break;
                case rPack.Type.Disinfect: {
                    DanosStaticStore.currentRunDownDataStore.AddPlayerDisinfectionUsed((long)player.agent.Owner.Lookup);
                }
                break;
                }
            }
        }

        [ReplaySpawnHook(typeof(rMine))]
        private static void MineHook(long timestamp, rMine e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            DanosStaticStore.currentRunDownDataStore.AddPlayerTripMinePlaced((long)e.owner.Owner.Lookup);
        }

        [ReplayDespawnHook(typeof(rEnemy))]
        private static void EnemyHook(long timestamp, rEnemy e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            DanosStaticStore.currentRunDownDataStore.IncrementEnemiesDead();
        }

        [ReplayHook(typeof(rDamage))]
        private static void DamageHook(long timestamp, rDamage e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;
            if (!SNet.IsMaster) return;

            if (Replay.TryGet(e.source, out rPlayer player)) {
                var data = DanosStaticStore.currentRunDownDataStore.GetReplayData((long)player.agent.Owner.Lookup);

                if (Replay.TryGet(e.target, out rPlayer other)) {
                    if (e.sentry) {
                        data.playerSentryDamage += e.damage;
                    } else {
                        switch (e.type) {
                        case rDamage.Type.Bullet: {
                            data.playerBulletDamage += e.damage;
                        }
                        break;
                        case rDamage.Type.Explosive: {
                            data.playerExplosiveDamage += e.damage;
                        }
                        break;
                        }
                    }
                } else if (Replay.TryGet(e.target, out rEnemy enemy)) {
                    if (e.sentry) {
                        data.sentryDamage += e.damage;
                        data.sentryStaggerDamage += e.staggerDamage;
                    } else {
                        switch (e.type) {
                        case rDamage.Type.Bullet: {
                            data.bulletDamage += e.damage;
                        }
                        break;
                        case rDamage.Type.Melee: {
                            data.meleeDamage += e.damage;
                        }
                        break;
                        case rDamage.Type.Explosive: {
                            data.explosiveDamage += e.damage;
                        }
                        break;
                        }
                        data.staggerDamage += e.staggerDamage;

                        if (enemy.agent.Damage.Health <= e.damage) {
                            switch (e.type) {
                            case rDamage.Type.Bullet: {
                                if (e.sentry) {
                                    data.sentryKills += 1;
                                } else {
                                    data.kills += 1;
                                }
                            }
                            break;
                            case rDamage.Type.Melee: {
                                data.kills += 1;
                            }
                            break;
                            case rDamage.Type.Explosive: {
                                data.mineKills += 1;
                            }
                            break;
                            }
                        }
                    }
                }
            }
        }
    }
}
