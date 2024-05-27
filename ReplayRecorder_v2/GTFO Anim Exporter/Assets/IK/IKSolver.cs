using System;
using UnityEngine;

[Serializable]
public abstract class IKSolver {
    [Serializable]
    public class Point {
        public Transform transform;

        [Range(0f, 1f)]
        public float weight = 1f;

        public Vector3 solverPosition;

        public Quaternion solverRotation = Quaternion.identity;

        public Vector3 defaultLocalPosition;

        public Quaternion defaultLocalRotation;

        public void StoreDefaultLocalState() {
            defaultLocalPosition = transform.localPosition;
            defaultLocalRotation = transform.localRotation;
        }

        public void FixTransform() {
            if (transform.localPosition != defaultLocalPosition) {
                transform.localPosition = defaultLocalPosition;
            }

            if (transform.localRotation != defaultLocalRotation) {
                transform.localRotation = defaultLocalRotation;
            }
        }

        public void UpdateSolverPosition() {
            solverPosition = transform.position;
        }

        public void UpdateSolverLocalPosition() {
            solverPosition = transform.localPosition;
        }

        public void UpdateSolverState() {
            solverPosition = transform.position;
            solverRotation = transform.rotation;
        }

        public void UpdateSolverLocalState() {
            solverPosition = transform.localPosition;
            solverRotation = transform.localRotation;
        }
    }

    [Serializable]
    public class Bone : Point {
        public float length;

        public float sqrMag;

        public Vector3 axis = -Vector3.right;

        private RotationLimit _rotationLimit;

        private bool isLimited = true;

        public RotationLimit rotationLimit {
            get {
                if (!isLimited) {
                    return null;
                }

                if (_rotationLimit == null) {
                    _rotationLimit = transform.GetComponent<RotationLimit>();
                }

                isLimited = _rotationLimit != null;
                return _rotationLimit;
            }
            set {
                _rotationLimit = value;
                isLimited = value != null;
            }
        }

        public void Swing(Vector3 swingTarget, float weight = 1f) {
            if (!(weight <= 0f)) {
                Quaternion quaternion = Quaternion.FromToRotation(transform.rotation * axis, swingTarget - transform.position);
                if (weight >= 1f) {
                    transform.rotation = quaternion * transform.rotation;
                } else {
                    transform.rotation = Quaternion.Lerp(Quaternion.identity, quaternion, weight) * transform.rotation;
                }
            }
        }

        public static void SolverSwing(Bone[] bones, int index, Vector3 swingTarget, float weight = 1f) {
            if (weight <= 0f) {
                return;
            }

            Quaternion quaternion = Quaternion.FromToRotation(bones[index].solverRotation * bones[index].axis, swingTarget - bones[index].solverPosition);
            if (weight >= 1f) {
                for (int i = index; i < bones.Length; i++) {
                    bones[i].solverRotation = quaternion * bones[i].solverRotation;
                }
            } else {
                for (int j = index; j < bones.Length; j++) {
                    bones[j].solverRotation = Quaternion.Lerp(Quaternion.identity, quaternion, weight) * bones[j].solverRotation;
                }
            }
        }

        public void Swing2D(Vector3 swingTarget, float weight = 1f) {
            if (!(weight <= 0f)) {
                Vector3 vector = transform.rotation * axis;
                Vector3 vector2 = swingTarget - transform.position;
                float current = Mathf.Atan2(vector.x, vector.y) * 57.29578f;
                float target = Mathf.Atan2(vector2.x, vector2.y) * 57.29578f;
                transform.rotation = Quaternion.AngleAxis(Mathf.DeltaAngle(current, target) * weight, Vector3.back) * transform.rotation;
            }
        }

        public void SetToSolverPosition() {
            transform.position = solverPosition;
        }

        public Bone() {
        }

        public Bone(Transform transform) {
            base.transform = transform;
        }

        public Bone(Transform transform, float weight) {
            base.transform = transform;
            base.weight = weight;
        }
    }

    [Serializable]
    public class Node : Point {
        public float length;

        public float effectorPositionWeight;

        public float effectorRotationWeight;

        public Vector3 offset;

        public Node() {
        }

        public Node(Transform transform) {
            base.transform = transform;
        }

        public Node(Transform transform, float weight) {
            base.transform = transform;
            base.weight = weight;
        }
    }

    public delegate void UpdateDelegate();

    public delegate void IterationDelegate(int i);

    [HideInInspector]
    public Vector3 IKPosition;

    [Tooltip("The positional or the master weight of the solver.")]
    [Range(0f, 1f)]
    public float IKPositionWeight = 1f;

    public UpdateDelegate OnPreInitiate;

    public UpdateDelegate OnPostInitiate;

    public UpdateDelegate OnPreUpdate;

    public UpdateDelegate OnPostUpdate;

    protected bool firstInitiation = true;

    [SerializeField]
    [HideInInspector]
    protected Transform root;

    public bool initiated { get; private set; }

    public bool IsValid() {
        string message = string.Empty;
        return IsValid(ref message);
    }

    public abstract bool IsValid(ref string message);

    public void Initiate(Transform root) {
        if (OnPreInitiate != null) {
            OnPreInitiate();
        }

        if (root == null) {
            Debug.LogError("Initiating IKSolver with null root Transform.");
        }

        this.root = root;
        initiated = false;
        string message = string.Empty;
        if (!IsValid(ref message)) {
            Debug.Log(message, root);
            return;
        }

        OnInitiate();
        StoreDefaultLocalState();
        initiated = true;
        firstInitiation = false;
        if (OnPostInitiate != null) {
            OnPostInitiate();
        }
    }

    public void Update() {
        if (OnPreUpdate != null) {
            OnPreUpdate();
        }

        if (firstInitiation) {
            Initiate(root);
        }

        if (initiated) {
            OnUpdate();
            if (OnPostUpdate != null) {
                OnPostUpdate();
            }
        }
    }

    public virtual Vector3 GetIKPosition() {
        return IKPosition;
    }

    public void SetIKPosition(Vector3 position) {
        IKPosition = position;
    }

    public float GetIKPositionWeight() {
        return IKPositionWeight;
    }

    public void SetIKPositionWeight(float weight) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
    }

    public Transform GetRoot() {
        return root;
    }

    public abstract Point[] GetPoints();

    public abstract Point GetPoint(Transform transform);

    public abstract void FixTransforms();

    public abstract void StoreDefaultLocalState();

    protected abstract void OnInitiate();

    protected abstract void OnUpdate();

    protected void LogWarning(string message) {
        Debug.LogWarning(message, root);
    }

    public static Transform ContainsDuplicateBone(Bone[] bones) {
        for (int i = 0; i < bones.Length; i++) {
            for (int j = 0; j < bones.Length; j++) {
                if (i != j && bones[i].transform == bones[j].transform) {
                    return bones[i].transform;
                }
            }
        }

        return null;
    }

    public static bool HierarchyIsValid(Bone[] bones) {
        for (int i = 1; i < bones.Length; i++) {
            if (!Hierarchy.IsAncestor(bones[i].transform, bones[i - 1].transform)) {
                return false;
            }
        }

        return true;
    }

    protected static float PreSolveBones(ref Bone[] bones) {
        float num = 0f;
        for (int i = 0; i < bones.Length; i++) {
            bones[i].solverPosition = bones[i].transform.position;
            bones[i].solverRotation = bones[i].transform.rotation;
        }

        for (int j = 0; j < bones.Length; j++) {
            if (j < bones.Length - 1) {
                bones[j].sqrMag = (bones[j + 1].solverPosition - bones[j].solverPosition).sqrMagnitude;
                bones[j].length = Mathf.Sqrt(bones[j].sqrMag);
                num += bones[j].length;
                bones[j].axis = Quaternion.Inverse(bones[j].solverRotation) * (bones[j + 1].solverPosition - bones[j].solverPosition);
            } else {
                bones[j].sqrMag = 0f;
                bones[j].length = 0f;
            }
        }

        return num;
    }
}
