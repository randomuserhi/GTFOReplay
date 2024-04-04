using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Player.Gunshots {
    [ReplayData("Vanilla.Player.Gunshots", "0.0.1")]
    internal class rGunshot : Id {
        private byte dimension;
        private float damage;
        private Vector3 start;
        private Vector3 end;
        private bool sentry;

        // NOTE(randomuserhi): For some reason this creates an exception on client for some lobbies - object null reference???
        public rGunshot(PlayerAgent source, float damage, Vector3 start, Vector3 end, bool sentry) : base(source.GlobalID) {
            dimension = (byte)source.DimensionIndex;
            this.damage = damage;
            this.start = start;
            if (!sentry && source.IsLocallyOwned && !source.Owner.IsBot) {
                ItemEquippable? wieldedItem = source.Inventory.WieldedItem;
                Animator anim = source.AnimatorBody;
                if (wieldedItem != null) {
                    Vector3 LFoot = anim.GetBoneTransform(HumanBodyBones.LeftFoot).position;
                    Vector3 RFoot = anim.GetBoneTransform(HumanBodyBones.RightFoot).position;
                    Vector3 footCenter = (LFoot + RFoot) / 2.0f;
                    footCenter.y = 0;
                    Vector3 posFlat = source.transform.position;
                    posFlat.y = 0;
                    Vector3 displacement;
                    if (source.Locomotion.m_currentStateEnum == PlayerLocomotion.PLOC_State.Crouch) {
                        displacement = Vector3.down * 0.2f;
                    } else {
                        displacement = Vector3.down * 0.45f;
                    }
                    this.start = wieldedItem.GearPartHolder.transform.position + displacement + (posFlat - footCenter);
                } else {
                    this.start += Vector3.down * 0.4f;
                }
            }
            this.end = end;
            this.sentry = sentry;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(dimension, buffer);
            BitHelper.WriteHalf(damage, buffer);
            BitHelper.WriteBytes(sentry, buffer);
            BitHelper.WriteBytes(start, buffer);
            BitHelper.WriteBytes(end, buffer);
        }
    }
}
