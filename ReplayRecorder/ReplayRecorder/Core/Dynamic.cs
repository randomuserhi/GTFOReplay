﻿/// Dynamic.cs
/// 
/// Provides additional utility templates for handling majority of GTFO content.

using Agents;
using API;
using ReplayRecorder.API;
using UnityEngine;

namespace ReplayRecorder.Core {
    /// <summary>
    /// An event type that includes an id. 
    /// 
    /// Most frequently used for events that relate to a specific dynamic.
    /// </summary>
    public abstract class Id : ReplayEvent {
        public readonly int id;

        public override string? Debug => $"{id}";

        public Id(int id) {
            this.id = id;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(id, buffer);
        }
    }

    /// <summary>
    /// Represents the transform of an Agent.
    /// </summary>
    public struct AgentTransform : IReplayTransform {
        private Agent agent;
        public bool active => agent != null;
        public byte dimensionIndex => (byte)agent.m_dimensionIndex;
        public Vector3 position => agent.transform.position;
        public Quaternion rotation {
            get {
                Vector3 forward = agent.transform.rotation * Vector3.forward;
                forward.y = 0;
                return Quaternion.LookRotation(forward);
            }
        }

        public AgentTransform(Agent agent) {
            this.agent = agent;
        }
    }

    /// <summary>
    /// A dynamic type that writes positional data.
    /// </summary>
    public abstract class DynamicPosition : ReplayDynamic {
        public IReplayTransform transform;
        private Vector3 oldPosition;
        private Vector3 calculatedPosition;
        private byte oldDimensionIndex;

        private const float threshold = 50;

        public override string? Debug => $"{id} - [{transform.dimensionIndex}] ({transform.position.x}, {transform.position.y}, {transform.position.z})";

        public override bool Active => transform.active;
        public override bool IsDirty => transform.dimensionIndex != oldDimensionIndex ||
                                        transform.position != oldPosition;

        private Vector3 spawnPosition;
        private byte spawnDimensionIndex;

        public DynamicPosition(int id, IReplayTransform transform) : base(id) {
            this.transform = transform;

            spawnPosition = transform.position;
            spawnDimensionIndex = transform.dimensionIndex;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            /// Format:
            /// byte => Dimension of transform
            /// byte => absolute or relative position
            /// Vector3(Full/Half) => full precision / half precision based on absolute or relative position

            BitHelper.WriteBytes(transform.dimensionIndex, buffer);

            Vector3 diff = transform.position - oldPosition;
            diff = new Vector3(
                BitHelper.Quantize(diff.x),
                BitHelper.Quantize(diff.y),
                BitHelper.Quantize(diff.z)
                );
            calculatedPosition += diff;

            // If object has moved too far, write absolute position
            if (diff.sqrMagnitude > threshold * threshold || (transform.position - calculatedPosition).sqrMagnitude > 1) {
                BitHelper.WriteBytes((byte)(1), buffer);
                BitHelper.WriteBytes(transform.position, buffer);
                calculatedPosition = transform.position;
            }
            // If object has not moved too far, write relative to last absolute position
            else {
                BitHelper.WriteBytes((byte)(0), buffer);
                BitHelper.WriteHalf(diff, buffer);
            }

            oldDimensionIndex = transform.dimensionIndex;
            oldPosition = transform.position;
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes(spawnDimensionIndex, buffer);
            BitHelper.WriteBytes(spawnPosition, buffer);

            oldDimensionIndex = spawnDimensionIndex;
            oldPosition = spawnPosition;
            calculatedPosition = oldPosition;
        }
    }

    /// <summary>
    /// A dynamic type that writes orientation data.
    /// </summary>
    public abstract class DynamicRotation : ReplayDynamic {
        public IReplayTransform transform;
        private Quaternion oldRotation;

        public override string? Debug => $"{id} - ({transform.rotation.x}, {transform.rotation.y}, {transform.rotation.z}, {transform.rotation.w})";

        public override bool Active => transform.active;
        public override bool IsDirty => (transform.rotation != oldRotation);

        private Quaternion spawnRotation;

        public DynamicRotation(int id, IReplayTransform transform) : base(id) {
            this.transform = transform;

            spawnRotation = transform.rotation;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            /// Format:
            /// int => instance ID of object (not necessarily the gameobject)
            /// Quaternion(Half) => rotation

            if (float.IsNaN(transform.rotation.x) || float.IsNaN(transform.rotation.y) ||
                    float.IsNaN(transform.rotation.z) || float.IsNaN(transform.rotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, buffer);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(transform.rotation, buffer);

            oldRotation = transform.rotation;
        }

        public override void Spawn(ByteBuffer buffer) {
            if (float.IsNaN(spawnRotation.x) || float.IsNaN(spawnRotation.y) ||
                    float.IsNaN(spawnRotation.z) || float.IsNaN(spawnRotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, buffer);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(spawnRotation, buffer);

            oldRotation = spawnRotation;
        }
    }

    /// <summary>
    /// A dynamic type that writes transform (position + rotation) data.
    /// </summary>
    public abstract class DynamicTransform : ReplayDynamic {
        public IReplayTransform transform;
        private Vector3 oldPosition;
        private Vector3 calculatedPosition;
        private Quaternion oldRotation;
        private byte oldDimensionIndex;

        private const float threshold = 1000;

        public override string? Debug => $"{id} - [{transform.dimensionIndex}] ({transform.position.x}, {transform.position.y}, {transform.position.z}) ({transform.rotation.x}, {transform.rotation.y}, {transform.rotation.z}, {transform.rotation.w})";

        public override bool Active => transform.active;
        public override bool IsDirty => transform.dimensionIndex != oldDimensionIndex ||
                                        transform.position != oldPosition ||
                                        transform.rotation != oldRotation;

        private Vector3 spawnPosition;
        private Quaternion spawnRotation;
        private byte spawnDimensionIndex;

        public DynamicTransform(int id, IReplayTransform transform) : base(id) {
            this.transform = transform;

            spawnPosition = transform.position;
            spawnRotation = transform.rotation;
            spawnDimensionIndex = transform.dimensionIndex;
        }

        public override void Write(ByteBuffer buffer) {
            /// Format:
            /// byte => Dimension of transform
            /// byte => absolute or relative position
            /// Vector3(Full/Half) => full precision / half precision based on absolute or relative position
            /// Quaternion(Half) => rotation

            // TODO(randomuserhi): If rotation doesn't change just write a single byte 0b1000
            //                     since the most significant bit doesnt matter to the quaternion.
            //                     Then in reader, just check the first byte, if the most significant is
            //                     1 (0b1000) then the rotation hasn't changed. If it is not, then its the
            //                     original first byte from the quaternion bytes: 0b00xx where xx is the number
            //                     0,1,2,3 for which component was missing.

            BitHelper.WriteBytes(transform.dimensionIndex, buffer);

            Vector3 diff = transform.position - oldPosition;
            diff = new Vector3(
                BitHelper.Quantize(diff.x),
                BitHelper.Quantize(diff.y),
                BitHelper.Quantize(diff.z)
                );
            calculatedPosition += diff;

            // If object has moved too far, write absolute position
            if (diff.sqrMagnitude > threshold * threshold || (transform.position - calculatedPosition).sqrMagnitude > 1) {
                BitHelper.WriteBytes((byte)(1), buffer);
                BitHelper.WriteBytes(transform.position, buffer);
                calculatedPosition = transform.position;
            }
            // If object has not moved too far, write relative to last absolute position
            else {
                BitHelper.WriteBytes((byte)(0), buffer);
                BitHelper.WriteHalf(diff, buffer);
            }

            if (float.IsNaN(transform.rotation.x) || float.IsNaN(transform.rotation.y) ||
                    float.IsNaN(transform.rotation.z) || float.IsNaN(transform.rotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, buffer);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(transform.rotation, buffer);

            oldDimensionIndex = transform.dimensionIndex;
            oldPosition = transform.position;
            oldRotation = transform.rotation;
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes(spawnDimensionIndex, buffer);
            BitHelper.WriteBytes(spawnPosition, buffer);
            if (float.IsNaN(spawnRotation.x) || float.IsNaN(spawnRotation.y) ||
                    float.IsNaN(spawnRotation.z) || float.IsNaN(spawnRotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, buffer);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(spawnRotation, buffer);

            oldDimensionIndex = spawnDimensionIndex;
            oldPosition = spawnPosition;
            calculatedPosition = oldPosition;
            oldRotation = spawnRotation;
        }
    }
}
