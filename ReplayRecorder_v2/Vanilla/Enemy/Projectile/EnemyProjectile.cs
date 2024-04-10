using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.EnemyProjectile {
    internal struct ProjectileTransform : IReplayTransform {
        private GameObject projectile;
        private byte dimension;

        public byte dimensionIndex => dimension;
        public bool active => projectile != null;
        public Vector3 position => projectile.transform.position;
        public Quaternion rotation => projectile.transform.rotation;

        public ProjectileTransform(GameObject projectile) {
            this.projectile = projectile;
            dimension = (byte)PlayerManager.GetLocalPlayerAgent().m_dimensionIndex;
        }
    }


    [ReplayData("Vanilla.Enemy.Projectile", "0.0.1")]
    internal class rEnemyProjectile : DynamicTransform {

        public rEnemyProjectile(GameObject projectile) : base(projectile.GetInstanceID(), new ProjectileTransform(projectile)) {
        }

        public override bool Active {
            get {
                if (!transform.active && Replay.Has<rEnemyProjectile>(id)) {
                    Replay.Despawn(Replay.Get<rEnemyProjectile>(id));
                }
                return base.Active;
            }
        }
    }
}
