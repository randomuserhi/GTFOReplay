﻿using API;
using EWC.CustomWeapon.Properties.Traits.CustomProjectile.Components;
using LevelGeneration;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using System.Runtime.CompilerServices;
using UnityEngine;

namespace ReplayRecorder.EWC {
    internal struct ProjectileTransform : IReplayTransform {
        private EWCProjectileComponentBase projectile;
        private byte dimension;

        public byte dimensionIndex => dimension;
        public bool active => projectile != null;
        public Vector3 position => projectile.transform.position;
        public Quaternion rotation => projectile.transform.rotation;

        public ProjectileTransform(EWCProjectileComponentBase projectile) {
            this.projectile = projectile;
            dimension = (byte)Dimension.GetDimensionFromPos(projectile.transform.position).DimensionIndex;
        }
    }

    [ReplayData("EWC.Projectile", "0.0.1")]
    internal class rEWCProjectile : DynamicTransform {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static int GetUniqueId(EWCProjectileComponentBase projectile) {
            // NOTE(randomuserhi): projectile.SyncID is only unique per player
            return projectile.SyncID + (projectile.PlayerIndex << 16);
        }

        internal static class Hooks {
            public static void OnSpawn(EWCProjectileComponentBase projectile) {
                try {
                    Replay.Spawn(new rEWCProjectile(projectile));
                } catch (Exception e) {
                    APILogger.Error($"Failed to spawn EWC projectile: {e}");
                }
            }

            public static void OnDespawn(EWCProjectileComponentBase projectile) {
                Replay.TryDespawn<rEWCProjectile>(GetUniqueId(projectile));
            }
        }

        EWCProjectileComponentBase projectile;

        public rEWCProjectile(EWCProjectileComponentBase projectile) : base(GetUniqueId(projectile), new ProjectileTransform(projectile)) {
            this.projectile = projectile;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes((byte)projectile.PlayerIndex, buffer);
            BitHelper.WriteHalf(projectile.Settings.ModelScale, buffer);
        }
    }
}
