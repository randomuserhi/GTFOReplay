﻿using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Enemy {
    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Animation", "0.0.1")]
    internal class rEnemyAnimation : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {

        }

        public EnemyAgent enemy;
        private Animator animator;

        private static byte compress(float value, float max) {
            value /= max;
            value = Mathf.Clamp(value, -1f, 1f);
            value = Mathf.Clamp01((value + 1.0f) / 2.0f);
            return (byte)(value * byte.MaxValue);
        }

        public override bool Active {
            get {
                if (enemy == null && Replay.Has<rEnemyAnimation>(id)) {
                    Replay.Despawn(Replay.Get<rEnemyAnimation>(id));
                }
                return enemy != null;
            }
        }
        public override bool IsDirty {
            get {
                bool vel =
                    velFwd != compress(_velFwd, 10f) ||
                    velRight != compress(_velRight, 10f);

                return
                    vel;
            }
        }

        private float _velFwd => enemy.Locomotion.PathMove.m_animFwd;
        private byte velFwd;

        private float _velRight => enemy.Locomotion.PathMove.m_animRight;
        private byte velRight;

        public rEnemyAnimation(EnemyAgent enemy) : base(enemy.GlobalID) {
            this.enemy = enemy;
            animator = enemy.Anim;
        }

        public override void Write(ByteBuffer buffer) {
            velRight = compress(_velRight, 10f);
            velFwd = compress(_velFwd, 10f);

            BitHelper.WriteBytes(velRight, buffer);
            BitHelper.WriteBytes(velFwd, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
            BitHelper.WriteHalf(enemy.SizeMultiplier, buffer);
        }
    }
}