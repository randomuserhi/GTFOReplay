﻿using Enemies;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.EnemyTongue {
    internal static class EnemyTongueReplayManager {
        public static Dictionary<int, HashSet<rEnemyTongue>> tongueOwners = new Dictionary<int, HashSet<rEnemyTongue>>();

        [ReplayInit]
        private static void Init() {
            tongueOwners.Clear();
        }

        public static void Spawn(MovingEnemyTentacleBase tongue) {
            if (!Replay.Ready) return;

            rEnemyTongue rTongue = new rEnemyTongue(tongue);
            int owner = tongue.m_owner.GlobalID;
            if (!tongueOwners.ContainsKey(owner)) {
                tongueOwners.Add(owner, new HashSet<rEnemyTongue>());
            }
            tongueOwners[owner].Add(rTongue);
            Replay.Spawn(rTongue);
        }

        public static void Despawn(MovingEnemyTentacleBase tongue) {
            if (!Replay.Ready) return;

            int owner = tongue.m_owner.GlobalID;
            if (!tongueOwners.ContainsKey(owner)) return;
            rEnemyTongue rTongue = new rEnemyTongue(tongue);
            if (tongueOwners[owner].Remove(rTongue)) {
                Replay.Despawn(rTongue);
            }
        }

        public static void Despawn(EnemyAgent enemy) {
            int owner = enemy.GlobalID;
            if (!tongueOwners.ContainsKey(owner)) return;
            foreach (rEnemyTongue tongue in tongueOwners[owner]) {
                Replay.Despawn(tongue);
            }
            tongueOwners.Remove(owner);
        }
    }

    public class TongueTooLong : Exception {
        public TongueTooLong(string message) : base(message) { }
    }

    [ReplayData("Vanilla.Enemy.Tongue", "0.0.1")]
    internal class rEnemyTongue : ReplayDynamic {
        private MovingEnemyTentacleBase tongue;

        private int id;
        public override int Id => id;
        public override bool Active => tongue != null && tongue.m_owner != null;
        public override bool IsDirty => tongue.m_GPUSplineSegments.Length > 0;

        public rEnemyTongue(MovingEnemyTentacleBase tongue) {
            id = tongue.GetInstanceID();
            this.tongue = tongue;
        }

        public override void Write(ByteBuffer buffer) {
            if (tongue.m_GPUSplineSegments.Length > byte.MaxValue) {
                throw new TongueTooLong($"Tongue has too many segments: {tongue.m_GPUSplineSegments.Length}.");
            }

            BitHelper.WriteBytes((byte)tongue.m_owner.DimensionIndex, buffer);
            BitHelper.WriteBytes((byte)(Mathf.Clamp01(tongue.TentacleRelLen) * byte.MaxValue), buffer);
            BitHelper.WriteBytes((byte)tongue.m_GPUSplineSegments.Length, buffer);
            BitHelper.WriteBytes(tongue.m_GPUSplineSegments[0].pos, buffer);
            for (int i = 1; i < tongue.m_GPUSplineSegments.Length; ++i) {
                Vector3 diff = tongue.m_GPUSplineSegments[i].pos - tongue.m_GPUSplineSegments[i - 1].pos;
                BitHelper.WriteHalf(diff, buffer);
            }
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}