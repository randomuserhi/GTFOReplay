using System;
using UnityEngine;

[Serializable]
public class IKSolverHeuristic : IKSolver {
    public Transform target;

    public float tolerance;

    public int maxIterations = 4;

    public bool useRotationLimits = true;

    public bool XY;

    public Bone[] bones = new Bone[0];

    protected Vector3 lastLocalDirection;

    protected float chainLength;

    protected virtual int minBones => 2;

    protected virtual bool boneLengthCanBeZero => true;

    protected virtual bool allowCommonParent => false;

    protected virtual Vector3 localDirection => bones[0].transform.InverseTransformDirection(bones[bones.Length - 1].transform.position - bones[0].transform.position);

    protected float positionOffset => Vector3.SqrMagnitude(localDirection - lastLocalDirection);

    public bool SetChain(Transform[] hierarchy, Transform root) {
        if (bones == null || bones.Length != hierarchy.Length) {
            bones = new Bone[hierarchy.Length];
        }

        for (int i = 0; i < hierarchy.Length; i++) {
            if (bones[i] == null) {
                bones[i] = new Bone();
            }

            bones[i].transform = hierarchy[i];
        }

        Initiate(root);
        return base.initiated;
    }

    public void AddBone(Transform bone) {
        Transform[] array = new Transform[bones.Length + 1];
        for (int i = 0; i < bones.Length; i++) {
            array[i] = bones[i].transform;
        }

        array[array.Length - 1] = bone;
        SetChain(array, root);
    }

    public override void StoreDefaultLocalState() {
        for (int i = 0; i < bones.Length; i++) {
            bones[i].StoreDefaultLocalState();
        }
    }

    public override void FixTransforms() {
        if (base.initiated && !(IKPositionWeight <= 0f)) {
            for (int i = 0; i < bones.Length; i++) {
                bones[i].FixTransform();
            }
        }
    }

    public override bool IsValid(ref string message) {
        if (bones.Length == 0) {
            message = "IK chain has no Bones.";
            return false;
        }

        if (bones.Length < minBones) {
            message = "IK chain has less than " + minBones + " Bones.";
            return false;
        }

        Bone[] array = bones;
        for (int i = 0; i < array.Length; i++) {
            if (array[i].transform == null) {
                message = "One of the Bones is null.";
                return false;
            }
        }

        Transform transform = IKSolver.ContainsDuplicateBone(bones);
        if (transform != null) {
            message = transform.name + " is represented multiple times in the Bones.";
            return false;
        }

        if (!allowCommonParent && !IKSolver.HierarchyIsValid(bones)) {
            message = "Invalid bone hierarchy detected. IK requires for it's bones to be parented to each other in descending order.";
            return false;
        }

        if (!boneLengthCanBeZero) {
            for (int j = 0; j < bones.Length - 1; j++) {
                if ((bones[j].transform.position - bones[j + 1].transform.position).magnitude == 0f) {
                    message = "Bone " + j + " length is zero.";
                    return false;
                }
            }
        }

        return true;
    }

    public override Point[] GetPoints() {
        return bones;
    }

    public override Point GetPoint(Transform transform) {
        for (int i = 0; i < bones.Length; i++) {
            if (bones[i].transform == transform) {
                return bones[i];
            }
        }

        return null;
    }

    protected override void OnInitiate() {
    }

    protected override void OnUpdate() {
    }

    protected void InitiateBones() {
        chainLength = 0f;
        for (int i = 0; i < bones.Length; i++) {
            if (i < bones.Length - 1) {
                bones[i].length = (bones[i].transform.position - bones[i + 1].transform.position).magnitude;
                chainLength += bones[i].length;
                Vector3 position = bones[i + 1].transform.position;
                bones[i].axis = Quaternion.Inverse(bones[i].transform.rotation) * (position - bones[i].transform.position);
                if (bones[i].rotationLimit != null) {
                    if (XY && !(bones[i].rotationLimit is RotationLimitHinge)) {
                        Debug.Log("Only Hinge Rotation Limits should be used on 2D IK solvers.", bones[i].transform);
                    }

                    bones[i].rotationLimit.Disable();
                }
            } else {
                bones[i].axis = Quaternion.Inverse(bones[i].transform.rotation) * (bones[bones.Length - 1].transform.position - bones[0].transform.position);
            }
        }
    }

    protected Vector3 GetSingularityOffset() {
        if (!SingularityDetected()) {
            return Vector3.zero;
        }

        Vector3 normalized = (IKPosition - bones[0].transform.position).normalized;
        Vector3 rhs = new Vector3(normalized.y, normalized.z, normalized.x);
        if (useRotationLimits && bones[bones.Length - 2].rotationLimit != null && bones[bones.Length - 2].rotationLimit is RotationLimitHinge) {
            rhs = bones[bones.Length - 2].transform.rotation * bones[bones.Length - 2].rotationLimit.axis;
        }

        return Vector3.Cross(normalized, rhs) * bones[bones.Length - 2].length * 0.5f;
    }

    private bool SingularityDetected() {
        if (!base.initiated) {
            return false;
        }

        Vector3 vector = bones[bones.Length - 1].transform.position - bones[0].transform.position;
        Vector3 vector2 = IKPosition - bones[0].transform.position;
        float magnitude = vector.magnitude;
        float magnitude2 = vector2.magnitude;
        if (magnitude < magnitude2) {
            return false;
        }

        if (magnitude < chainLength - bones[bones.Length - 2].length * 0.1f) {
            return false;
        }

        if (magnitude == 0f) {
            return false;
        }

        if (magnitude2 == 0f) {
            return false;
        }

        if (magnitude2 > magnitude) {
            return false;
        }

        if (Vector3.Dot(vector / magnitude, vector2 / magnitude2) < 0.999f) {
            return false;
        }

        return true;
    }
}