﻿using Agents;
using API;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace ReplayRecorder.Core {
    public class Id : ReplayEvent {
        public int id;

        public override string? Debug => $"{id}";

        public Id(int id) {
            this.id = id;
        }

        public override void Write(FileStream fs) {
            BitHelper.WriteBytes(id, fs);
        }
    }

    public struct AgentTransform : IReplayTransform {
        private Agent agent;
        public byte dimensionIndex => (byte)agent.m_dimensionIndex;
        public Vector3 position => agent.transform.position;
        public Quaternion rotation => agent.transform.rotation;

        public AgentTransform(Agent agent) {
            this.agent = agent;
        }
    }

    [ReplayData("ReplayRecorder.SpawnDynamic", "0.0.1")]
    internal class SpawnDynamic : Id {
        public SpawnDynamic(int id) : base(id) { }
    }

    [ReplayData("ReplayRecorder.SpawnDynamicAt", "0.0.1")]
    internal class SpawnDynamicAt : Id {
        public byte dimensionIndex;
        public Vector3 position;
        public Quaternion rotation;

        public override string? Debug => $"{id} - [{dimensionIndex}] ({position.x}, {position.y}, {position.z}) ({rotation.x}, {rotation.y}, {rotation.z}, {rotation.w})";

        public SpawnDynamicAt(int id, byte dimensionIndex, Vector3 position, Quaternion rotation) : base(id) {
            this.dimensionIndex = dimensionIndex;
            this.position = position;
            this.rotation = rotation;
        }

        public override void Write(FileStream fs) {
            base.Write(fs);

            BitHelper.WriteBytes((byte)(1), fs);
            BitHelper.WriteBytes(position, fs);
            if (float.IsNaN(rotation.x) || float.IsNaN(rotation.y) ||
                float.IsNaN(rotation.z) || float.IsNaN(rotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, fs);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(rotation, fs);
            BitHelper.WriteBytes(dimensionIndex, fs);
        }
    }

    [ReplayData("ReplayRecorder.DespawnDynamic", "0.0.1")]
    internal class DespawnDynamic : Id {
        public DespawnDynamic(int id) : base(id) { }
    }

    [ReplayData("ReplayRecorder.DynamicPosition", "0.0.1")]
    public class DynamicPosition : ReplayDynamic {
        private int id;
        private IReplayTransform transform;
        private Vector3 oldPosition;

        private const float threshold = 50;

        public override string? Debug => $"{id} - [{transform.dimensionIndex}] ({transform.position.x}, {transform.position.y}, {transform.position.z})";

        public override int Id => id;
        public override bool IsDirty => transform.position != oldPosition;

        public DynamicPosition(int id, IReplayTransform transform) {
            this.id = id;
            this.transform = transform;
        }

        public override void Write(FileStream fs) {
            /// Format:
            /// int => instance ID of object (not necessarily the gameobject)
            /// byte => absolute or relative position
            /// Vector3(Full/Half) => full precision / half precision based on absolute or relative position
            /// byte => Dimension of transform

            BitHelper.WriteBytes(id, fs);

            // If object has moved too far, write absolute position
            if ((transform.position - oldPosition).sqrMagnitude > threshold * threshold) {
                BitHelper.WriteBytes((byte)(1), fs);
                BitHelper.WriteBytes(transform.position, fs);
                BitHelper.WriteBytes(transform.dimensionIndex, fs);
            }
            // If object has not moved too far, write relative to last absolute position
            else {
                BitHelper.WriteBytes((byte)(0), fs);
                BitHelper.WriteHalf(transform.position - oldPosition, fs);
                BitHelper.WriteBytes(transform.dimensionIndex, fs);
            }

            oldPosition = transform.position;
        }
    }

    [ReplayData("ReplayRecorder.DynamicRotation", "0.0.1")]
    public class DynamicRotation : ReplayDynamic {
        private int id;
        private IReplayTransform transform;
        private Quaternion oldRotation;

        public override string? Debug => $"{id} - ({transform.rotation.x}, {transform.rotation.y}, {transform.rotation.z}, {transform.rotation.w})";

        public override int Id => id;
        public override bool IsDirty => transform.rotation != oldRotation;

        public DynamicRotation(int id, IReplayTransform transform) {
            this.id = id;
            this.transform = transform;
        }

        public override void Write(FileStream fs) {
            /// Format:
            /// int => instance ID of object (not necessarily the gameobject)
            /// Quaternion(Half) => rotation

            if (float.IsNaN(transform.rotation.x) || float.IsNaN(transform.rotation.y) ||
                    float.IsNaN(transform.rotation.z) || float.IsNaN(transform.rotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, fs);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(transform.rotation, fs);

            oldRotation = transform.rotation;
        }
    }

    [ReplayData("ReplayRecorder.DynamicTransform", "0.0.1")]
    public class DynamicTransform : ReplayDynamic {
        private int id;
        private IReplayTransform transform;
        private Vector3 oldPosition;
        private Quaternion oldRotation;

        private const float threshold = 50;

        public override string? Debug => $"{id} - [{transform.dimensionIndex}] ({transform.position.x}, {transform.position.y}, {transform.position.z}) ({transform.rotation.x}, {transform.rotation.y}, {transform.rotation.z}, {transform.rotation.w})";

        public override int Id => id;
        public override bool IsDirty => transform.position != oldPosition ||
                                        transform.rotation != oldRotation;

        public DynamicTransform(int id, IReplayTransform transform) {
            this.id = id;
            this.transform = transform;
        }

        public override void Write(FileStream fs) {
            /// Format:
            /// int => instance ID of object (not necessarily the gameobject)
            /// byte => absolute or relative position
            /// Vector3(Full/Half) => full precision / half precision based on absolute or relative position
            /// Quaternion(Half) => rotation
            /// byte => Dimension of transform

            // TODO(randomuserhi): If rotation doesn't change just write a single byte 0b1000
            //                     since the most significant bit doesnt matter to the quaternion.
            //                     Then in reader, just check the first byte, if the most significant is
            //                     1 (0b1000) then the rotation hasn't changed. If it is not, then its the
            //                     original first byte from the quaternion bytes: 0b00xx where xx is the number
            //                     0,1,2,3 for which component was missing.

            BitHelper.WriteBytes(id, fs);

            // If object has moved too far, write absolute position
            if ((transform.position - oldPosition).sqrMagnitude > threshold * threshold) {
                BitHelper.WriteBytes((byte)(1), fs);
                BitHelper.WriteBytes(transform.position, fs);
                if (float.IsNaN(transform.rotation.x) || float.IsNaN(transform.rotation.y) ||
                    float.IsNaN(transform.rotation.z) || float.IsNaN(transform.rotation.w)) {
                    BitHelper.WriteHalf(Quaternion.identity, fs);
                    APILogger.Warn("Dynamic rotation had NaN component.");
                } else BitHelper.WriteHalf(transform.rotation, fs);
                BitHelper.WriteBytes(transform.dimensionIndex, fs);
            }
            // If object has not moved too far, write relative to last absolute position
            else {
                BitHelper.WriteBytes((byte)(0), fs);
                BitHelper.WriteHalf(transform.position - oldPosition, fs);
                if (float.IsNaN(transform.rotation.x) || float.IsNaN(transform.rotation.y) ||
                    float.IsNaN(transform.rotation.z) || float.IsNaN(transform.rotation.w)) {
                    BitHelper.WriteHalf(Quaternion.identity, fs);
                    APILogger.Warn("Dynamic rotation had NaN component.");
                } else BitHelper.WriteHalf(transform.rotation, fs);
                BitHelper.WriteBytes(transform.dimensionIndex, fs);
            }

            oldPosition = transform.position;
            oldRotation = transform.rotation;
        }
    }
}