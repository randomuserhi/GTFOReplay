using DanosStatTracker.Data;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using SNetwork;
using Vanilla.Enemy;
using Vanilla.Player;
using Vanilla.StatTracker;

namespace DanosStatTracker.Hooks {
    internal class Stats {
        [ReplaySpawnHook(typeof(rPlayer))]
        private static void OnPlayerSpawn(long timestamp, rPlayer player) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            DanosStaticStore.currentRunDownDataStore.replayData.masterStats.GetPlayerStats((long)player.agent.Owner.Lookup);
        }

        [ReplayHook(typeof(rDamage))]
        private static void DamageHook(long timestamp, rDamage e) {
            if (DanosStaticStore.currentRunDownDataStore == null) return;
            if (!SNet.IsMaster) return;

            if (Replay.TryGet(e.source, out rPlayer player)) {
                var data = DanosStaticStore.currentRunDownDataStore.replayData.masterStats.GetPlayerStats((long)player.agent.Owner.Lookup);

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
