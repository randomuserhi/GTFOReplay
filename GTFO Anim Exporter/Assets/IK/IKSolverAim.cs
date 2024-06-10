using System;
using UnityEngine;

[Serializable]
public class IKSolverAim : IKSolverHeuristic {
    public Transform transform;

    public Vector3 axis = Vector3.forward;

    public Vector3 poleAxis = Vector3.up;

    public Vector3 polePosition;

    [Range(0f, 1f)]
    public float poleWeight;

    public Transform poleTarget;

    [Range(0f, 1f)]
    public float clampWeight = 0.1f;

    [Range(0f, 2f)]
    public int clampSmoothing = 2;

    public IterationDelegate OnPreIteration;

    private float step;

    private Vector3 clampedIKPosition;

    private RotationLimit transformLimit;

    private Transform lastTransform;

    public Vector3 transformAxis => transform.rotation * axis;

    public Vector3 transformPoleAxis => transform.rotation * poleAxis;

    protected override int minBones => 1;

    protected override Vector3 localDirection => bones[0].transform.InverseTransformDirection(bones[bones.Length - 1].transform.forward);

    public float GetAngle() {
        return Vector3.Angle(transformAxis, IKPosition - transform.position);
    }

    protected override void OnInitiate() {
        if ((firstInitiation || !Application.isPlaying) && transform != null) {
            IKPosition = transform.position + transformAxis * 3f;
            polePosition = transform.position + transformPoleAxis * 3f;
        }

        for (int i = 0; i < bones.Length; i++) {
            if (bones[i].rotationLimit != null) {
                bones[i].rotationLimit.Disable();
            }
        }

        step = 1f / (float)bones.Length;
        if (Application.isPlaying) {
            axis = axis.normalized;
        }
    }

    protected override void OnUpdate() {
        if (axis == Vector3.zero) {
            return;
        }

        if (poleAxis == Vector3.zero && poleWeight > 0f) {
            return;
        }

        if (target != null) {
            IKPosition = target.position;
        }

        if (poleTarget != null) {
            polePosition = poleTarget.position;
        }

        if (XY) {
            IKPosition.z = bones[0].transform.position.z;
        }

        if (IKPositionWeight <= 0f) {
            return;
        }

        IKPositionWeight = Mathf.Clamp(IKPositionWeight, 0f, 1f);
        if (transform != lastTransform) {
            transformLimit = transform.GetComponent<RotationLimit>();
            if (transformLimit != null) {
                transformLimit.enabled = false;
            }

            lastTransform = transform;
        }

        if (transformLimit != null) {
            transformLimit.Apply();
        }

        if (transform == null) {
            return;
        }

        clampWeight = Mathf.Clamp(clampWeight, 0f, 1f);
        clampedIKPosition = GetClampedIKPosition();
        Vector3 b = clampedIKPosition - transform.position;
        b = Vector3.Slerp(transformAxis * b.magnitude, b, IKPositionWeight);
        clampedIKPosition = transform.position + b;
        for (int i = 0; i < maxIterations && (i < 1 || !(tolerance > 0f) || !(GetAngle() < tolerance)); i++) {
            lastLocalDirection = localDirection;
            if (OnPreIteration != null) {
                OnPreIteration(i);
            }

            Solve();
        }

        lastLocalDirection = localDirection;
    }

    private void Solve() {
        for (int i = 0; i < bones.Length - 1; i++) {
            RotateToTarget(clampedIKPosition, bones[i], step * (float)(i + 1) * IKPositionWeight * bones[i].weight);
        }

        RotateToTarget(clampedIKPosition, bones[bones.Length - 1], IKPositionWeight * bones[bones.Length - 1].weight);
    }

    private Vector3 GetClampedIKPosition() {
        if (clampWeight <= 0f) {
            return IKPosition;
        }

        if (clampWeight >= 1f) {
            return transform.position + transformAxis * (IKPosition - transform.position).magnitude;
        }

        float num = Vector3.Angle(transformAxis, IKPosition - transform.position);
        float num2 = 1f - num / 180f;
        float num3 = ((clampWeight > 0f) ? Mathf.Clamp(1f - (clampWeight - num2) / (1f - num2), 0f, 1f) : 1f);
        float num4 = ((clampWeight > 0f) ? Mathf.Clamp(num2 / clampWeight, 0f, 1f) : 1f);
        for (int i = 0; i < clampSmoothing; i++) {
            num4 = Mathf.Sin(num4 * (float)Math.PI * 0.5f);
        }

        return transform.position + Vector3.Slerp(transformAxis * 10f, IKPosition - transform.position, num4 * num3);
    }

    private void RotateToTarget(Vector3 targetPosition, Bone bone, float weight) {
        if (XY) {
            if (weight >= 0f) {
                Vector3 vector = transformAxis;
                Vector3 vector2 = targetPosition - transform.position;
                float current = Mathf.Atan2(vector.x, vector.y) * 57.29578f;
                float num = Mathf.Atan2(vector2.x, vector2.y) * 57.29578f;
                bone.transform.rotation = Quaternion.AngleAxis(Mathf.DeltaAngle(current, num), Vector3.back) * bone.transform.rotation;
            }
        } else {
            if (weight >= 0f) {
                Quaternion quaternion = Quaternion.FromToRotation(transformAxis, targetPosition - transform.position);
                if (weight >= 1f) {
                    bone.transform.rotation = quaternion * bone.transform.rotation;
                    //bone.transform.localRotation *= quaternion;
                } else {
                    //bone.transform.localRotation *= Quaternion.Lerp(Quaternion.identity, quaternion, weight);
                    bone.transform.rotation = Quaternion.Lerp(Quaternion.identity, quaternion, weight) * bone.transform.rotation;
                }
            }

            if (poleWeight > 0f) {
                Vector3 tangent = polePosition - transform.position;
                Vector3 normal = transformAxis;
                Vector3.OrthoNormalize(ref normal, ref tangent);
                Quaternion b = Quaternion.FromToRotation(transformPoleAxis, tangent);
                bone.transform.rotation = Quaternion.Lerp(Quaternion.identity, b, weight * poleWeight) * bone.transform.rotation;
            }
        }

        if (useRotationLimits && bone.rotationLimit != null) {
            bone.rotationLimit.Apply();
        }
    }
}
