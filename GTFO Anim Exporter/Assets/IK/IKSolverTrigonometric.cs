using System;
using UnityEngine;

[Serializable]
public class IKSolverTrigonometric : IKSolver {
    [Serializable]
    public class TrigonometricBone : Bone {
        private Quaternion targetToLocalSpace;

        private Vector3 defaultLocalBendNormal;

        public void Initiate(Vector3 childPosition, Vector3 bendNormal) {
            Quaternion rotation = Quaternion.LookRotation(childPosition - transform.position, bendNormal);
            targetToLocalSpace = QuaTools.RotationToLocalSpace(transform.rotation, rotation);
            defaultLocalBendNormal = Quaternion.Inverse(transform.rotation) * bendNormal;
        }

        public Quaternion GetRotation(Vector3 direction, Vector3 bendNormal) {
            return Quaternion.LookRotation(direction, bendNormal) * targetToLocalSpace;
        }

        public Vector3 GetBendNormalFromCurrentRotation() {
            return transform.rotation * defaultLocalBendNormal;
        }
    }

    public Transform target;

    [Range(0f, 1f)]
    public float IKRotationWeight = 1f;

    public Quaternion IKRotation = Quaternion.identity;

    public Vector3 bendNormal = Vector3.right;

    public TrigonometricBone bone1 = new TrigonometricBone();

    public TrigonometricBone bone2 = new TrigonometricBone();

    public TrigonometricBone bone3 = new TrigonometricBone();

    protected Vector3 weightIKPosition;

    protected bool directHierarchy = true;

    public void SetBendGoalPosition(Vector3 goalPosition, float weight) {
        if (!base.initiated || weight <= 0f) {
            return;
        }

        Vector3 vector = Vector3.Cross(goalPosition - bone1.transform.position, IKPosition - bone1.transform.position);
        if (vector != Vector3.zero) {
            if (weight >= 1f) {
                bendNormal = vector;
            } else {
                bendNormal = Vector3.Lerp(bendNormal, vector, weight);
            }
        }
    }

    public void SetBendPlaneToCurrent() {
        if (base.initiated) {
            Vector3 vector = Vector3.Cross(bone2.transform.position - bone1.transform.position, bone3.transform.position - bone2.transform.position);
            if (vector != Vector3.zero) {
                bendNormal = vector;
            }
        }
    }

    public void SetIKRotation(Quaternion rotation) {
        IKRotation = rotation;
    }

    public void SetIKRotationWeight(float weight) {
        IKRotationWeight = Mathf.Clamp(weight, 0f, 1f);
    }

    public Quaternion GetIKRotation() {
        return IKRotation;
    }

    public float GetIKRotationWeight() {
        return IKRotationWeight;
    }

    public override Point[] GetPoints() {
        return new Point[3] { bone1, bone2, bone3 };
    }

    public override Point GetPoint(Transform transform) {
        if (bone1.transform == transform) {
            return bone1;
        }

        if (bone2.transform == transform) {
            return bone2;
        }

        if (bone3.transform == transform) {
            return bone3;
        }

        return null;
    }

    public override void StoreDefaultLocalState() {
        bone1.StoreDefaultLocalState();
        bone2.StoreDefaultLocalState();
        bone3.StoreDefaultLocalState();
    }

    public override void FixTransforms() {
        if (base.initiated) {
            bone1.FixTransform();
            bone2.FixTransform();
            bone3.FixTransform();
        }
    }

    public override bool IsValid(ref string message) {
        if (bone1.transform == null || bone2.transform == null || bone3.transform == null) {
            message = "Please assign all Bones to the IK solver.";
            return false;
        }

        UnityEngine.Object[] objects = new Transform[3] { bone1.transform, bone2.transform, bone3.transform };
        Transform transform = (Transform)Hierarchy.ContainsDuplicate(objects);
        if (transform != null) {
            message = transform.name + " is represented multiple times in the Bones.";
            return false;
        }

        if (bone1.transform.position == bone2.transform.position) {
            message = "first bone position is the same as second bone position.";
            return false;
        }

        if (bone2.transform.position == bone3.transform.position) {
            message = "second bone position is the same as third bone position.";
            return false;
        }

        return true;
    }

    public bool SetChain(Transform bone1, Transform bone2, Transform bone3, Transform root) {
        this.bone1.transform = bone1;
        this.bone2.transform = bone2;
        this.bone3.transform = bone3;
        Initiate(root);
        return base.initiated;
    }

    public static void Solve(Transform bone1, Transform bone2, Transform bone3, Vector3 targetPosition, Vector3 bendNormal, float weight) {
        if (weight <= 0f) {
            return;
        }

        targetPosition = Vector3.Lerp(bone3.position, targetPosition, weight);
        Vector3 vector = targetPosition - bone1.position;
        float magnitude = vector.magnitude;
        if (magnitude != 0f) {
            float sqrMagnitude = (bone2.position - bone1.position).sqrMagnitude;
            float sqrMagnitude2 = (bone3.position - bone2.position).sqrMagnitude;
            Vector3 bendDirection = Vector3.Cross(vector, bendNormal);
            Vector3 directionToBendPoint = GetDirectionToBendPoint(vector, magnitude, bendDirection, sqrMagnitude, sqrMagnitude2);
            Quaternion quaternion = Quaternion.FromToRotation(bone2.position - bone1.position, directionToBendPoint);
            if (weight < 1f) {
                quaternion = Quaternion.Lerp(Quaternion.identity, quaternion, weight);
            }

            bone1.rotation = quaternion * bone1.rotation;
            Quaternion quaternion2 = Quaternion.FromToRotation(bone3.position - bone2.position, targetPosition - bone2.position);
            if (weight < 1f) {
                quaternion2 = Quaternion.Lerp(Quaternion.identity, quaternion2, weight);
            }

            bone2.rotation = quaternion2 * bone2.rotation;
        }
    }

    private static Vector3 GetDirectionToBendPoint(Vector3 direction, float directionMag, Vector3 bendDirection, float sqrMag1, float sqrMag2) {
        float num = (directionMag * directionMag + (sqrMag1 - sqrMag2)) / 2f / directionMag;
        float y = (float)Math.Sqrt(Mathf.Clamp(sqrMag1 - num * num, 0f, float.PositiveInfinity));
        if (direction == Vector3.zero) {
            return Vector3.zero;
        }

        return Quaternion.LookRotation(direction, bendDirection) * new Vector3(0f, y, num);
    }

    protected override void OnInitiate() {
        if (bendNormal == Vector3.zero) {
            bendNormal = Vector3.right;
        }

        OnInitiateVirtual();
        IKPosition = bone3.transform.position;
        IKRotation = bone3.transform.rotation;
        InitiateBones();
        directHierarchy = IsDirectHierarchy();
    }

    private bool IsDirectHierarchy() {
        if (bone3.transform.parent != bone2.transform) {
            return false;
        }

        if (bone2.transform.parent != bone1.transform) {
            return false;
        }

        return true;
    }

    private void InitiateBones() {
        bone1.Initiate(bone2.transform.position, bendNormal);
        bone2.Initiate(bone3.transform.position, bendNormal);
        SetBendPlaneToCurrent();
    }

    protected override void OnUpdate() {
        IKPositionWeight = Mathf.Clamp(IKPositionWeight, 0f, 1f);
        IKRotationWeight = Mathf.Clamp(IKRotationWeight, 0f, 1f);
        if (target != null) {
            IKPosition = target.position;
            IKRotation = target.rotation;
        }

        Debug.Log(IKPositionWeight);
        Debug.Log(IKRotationWeight);

        OnUpdateVirtual();

        Debug.Log(bendNormal);

        if (IKPositionWeight > 0f) {
            if (!directHierarchy) {
                bone1.Initiate(bone2.transform.position, bendNormal);
                bone2.Initiate(bone3.transform.position, bendNormal);
            }

            bone1.sqrMag = (bone2.transform.position - bone1.transform.position).sqrMagnitude;
            bone2.sqrMag = (bone3.transform.position - bone2.transform.position).sqrMagnitude;
            Debug.Log(bone1.sqrMag);
            Debug.Log(bone2.sqrMag);

            weightIKPosition = Vector3.Lerp(bone3.transform.position, IKPosition, IKPositionWeight);
            Debug.Log(weightIKPosition);
            Vector3 vector = Vector3.Lerp(bone1.GetBendNormalFromCurrentRotation(), bendNormal, IKPositionWeight);
            Debug.Log(vector);
            Vector3 vector2 = Vector3.Lerp(bone2.transform.position - bone1.transform.position, GetBendDirection(weightIKPosition, vector), IKPositionWeight);
            Debug.Log(vector2);
            if (vector2 == Vector3.zero) {
                vector2 = bone2.transform.position - bone1.transform.position;
            }
            Debug.Log(vector2);

            bone1.transform.rotation = bone1.GetRotation(vector2, vector);
            Debug.Log(bone1.transform.rotation);
            bone2.transform.rotation = bone2.GetRotation(weightIKPosition - bone2.transform.position, bone2.GetBendNormalFromCurrentRotation());
            Debug.Log(bone2.transform.rotation);
        }

        if (IKRotationWeight > 0f) {
            bone3.transform.rotation = Quaternion.Slerp(bone3.transform.rotation, IKRotation, IKRotationWeight);
        }

        OnPostSolveVirtual();

        Debug.Break();
    }

    protected virtual void OnInitiateVirtual() {
    }

    protected virtual void OnUpdateVirtual() {
    }

    protected virtual void OnPostSolveVirtual() {
    }

    protected Vector3 GetBendDirection(Vector3 IKPosition, Vector3 bendNormal) {
        Debug.Log("---");
        Vector3 vector = IKPosition - bone1.transform.position;
        if (vector == Vector3.zero) {
            return Vector3.zero;
        }
        Debug.Log(vector);

        float sqrMagnitude = vector.sqrMagnitude;
        Debug.Log(sqrMagnitude);
        float num = (float)Math.Sqrt(sqrMagnitude);
        Debug.Log(num);
        float num2 = (sqrMagnitude + bone1.sqrMag - bone2.sqrMag) / 2f / num;
        Debug.Log(num2);
        float y = (float)Math.Sqrt(Mathf.Clamp(bone1.sqrMag - num2 * num2, 0f, float.PositiveInfinity));
        Debug.Log(y);
        Vector3 upwards = Vector3.Cross(vector / num, bendNormal);
        Debug.Log(upwards);
        Quaternion look = Quaternion.LookRotation(vector, upwards);
        Debug.Log($"{look.w} {look.x} {look.y} {look.z}");
        Vector3 v = new Vector3(0f, y, num2);
        Debug.Log(v);
        Debug.Log(look * v);
        Debug.Log("---");
        return look * v;
    }
}