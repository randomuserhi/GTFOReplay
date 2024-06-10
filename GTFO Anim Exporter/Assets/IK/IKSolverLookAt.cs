using System;
using UnityEngine;

[Serializable]
public class IKSolverLookAt : IKSolver {
    [Serializable]
    public class LookAtBone : Bone {
        public Vector3 baseForwardOffsetEuler;

        public Vector3 forward => transform.rotation * axis;

        public LookAtBone() {
        }

        public LookAtBone(Transform transform) {
            base.transform = transform;
        }

        public void Initiate(Transform root) {
            if (!(transform == null)) {
                axis = Quaternion.Inverse(transform.rotation) * root.forward;
            }
        }

        public void LookAt(Vector3 direction, float weight) {
            Quaternion quaternion = Quaternion.FromToRotation(forward, direction);
            Quaternion rotation = transform.rotation;
            transform.rotation = Quaternion.Lerp(rotation, quaternion * rotation, weight);
        }
    }

    public Transform target;

    public LookAtBone[] spine = new LookAtBone[0];

    public LookAtBone head = new LookAtBone();

    public LookAtBone[] eyes = new LookAtBone[0];

    [Range(0f, 1f)]
    public float bodyWeight = 0.5f;

    [Range(0f, 1f)]
    public float headWeight = 0.5f;

    [Range(0f, 1f)]
    public float eyesWeight = 1f;

    [Range(0f, 1f)]
    public float clampWeight = 0.5f;

    [Range(0f, 1f)]
    public float clampWeightHead = 0.5f;

    [Range(0f, 1f)]
    public float clampWeightEyes = 0.5f;

    [Range(0f, 2f)]
    public int clampSmoothing = 2;

    public AnimationCurve spineWeightCurve = new AnimationCurve(new Keyframe(0f, 0.3f), new Keyframe(1f, 1f));

    public Vector3 spineTargetOffset;

    protected Vector3[] spineForwards = new Vector3[0];

    protected Vector3[] headForwards = new Vector3[1];

    protected Vector3[] eyeForward = new Vector3[1];

    protected bool spineIsValid {
        get {
            if (spine == null) {
                return false;
            }

            if (spine.Length == 0) {
                return true;
            }

            for (int i = 0; i < spine.Length; i++) {
                if (spine[i] == null || spine[i].transform == null) {
                    return false;
                }
            }

            return true;
        }
    }

    protected bool spineIsEmpty => spine.Length == 0;

    protected bool headIsValid {
        get {
            if (head == null) {
                return false;
            }

            return true;
        }
    }

    protected bool headIsEmpty => head.transform == null;

    protected bool eyesIsValid {
        get {
            if (eyes == null) {
                return false;
            }

            if (eyes.Length == 0) {
                return true;
            }

            for (int i = 0; i < eyes.Length; i++) {
                if (eyes[i] == null || eyes[i].transform == null) {
                    return false;
                }
            }

            return true;
        }
    }

    protected bool eyesIsEmpty => eyes.Length == 0;

    public void SetLookAtWeight(float weight) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
    }

    public void SetLookAtWeight(float weight, float bodyWeight) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
        this.bodyWeight = Mathf.Clamp(bodyWeight, 0f, 1f);
    }

    public void SetLookAtWeight(float weight, float bodyWeight, float headWeight) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
        this.bodyWeight = Mathf.Clamp(bodyWeight, 0f, 1f);
        this.headWeight = Mathf.Clamp(headWeight, 0f, 1f);
    }

    public void SetLookAtWeight(float weight, float bodyWeight, float headWeight, float eyesWeight) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
        this.bodyWeight = Mathf.Clamp(bodyWeight, 0f, 1f);
        this.headWeight = Mathf.Clamp(headWeight, 0f, 1f);
        this.eyesWeight = Mathf.Clamp(eyesWeight, 0f, 1f);
    }

    public void SetLookAtWeight(float weight, float bodyWeight, float headWeight, float eyesWeight, float clampWeight) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
        this.bodyWeight = Mathf.Clamp(bodyWeight, 0f, 1f);
        this.headWeight = Mathf.Clamp(headWeight, 0f, 1f);
        this.eyesWeight = Mathf.Clamp(eyesWeight, 0f, 1f);
        this.clampWeight = Mathf.Clamp(clampWeight, 0f, 1f);
        clampWeightHead = this.clampWeight;
        clampWeightEyes = this.clampWeight;
    }

    public void SetLookAtWeight(float weight, float bodyWeight = 0f, float headWeight = 1f, float eyesWeight = 0.5f, float clampWeight = 0.5f, float clampWeightHead = 0.5f, float clampWeightEyes = 0.3f) {
        IKPositionWeight = Mathf.Clamp(weight, 0f, 1f);
        this.bodyWeight = Mathf.Clamp(bodyWeight, 0f, 1f);
        this.headWeight = Mathf.Clamp(headWeight, 0f, 1f);
        this.eyesWeight = Mathf.Clamp(eyesWeight, 0f, 1f);
        this.clampWeight = Mathf.Clamp(clampWeight, 0f, 1f);
        this.clampWeightHead = Mathf.Clamp(clampWeightHead, 0f, 1f);
        this.clampWeightEyes = Mathf.Clamp(clampWeightEyes, 0f, 1f);
    }

    public override void StoreDefaultLocalState() {
        for (int i = 0; i < spine.Length; i++) {
            spine[i].StoreDefaultLocalState();
        }

        for (int j = 0; j < eyes.Length; j++) {
            eyes[j].StoreDefaultLocalState();
        }

        if (head != null && head.transform != null) {
            head.StoreDefaultLocalState();
        }
    }

    public override void FixTransforms() {
        if (base.initiated && !(IKPositionWeight <= 0f)) {
            for (int i = 0; i < spine.Length; i++) {
                spine[i].FixTransform();
            }

            for (int j = 0; j < eyes.Length; j++) {
                eyes[j].FixTransform();
            }

            if (head != null && head.transform != null) {
                head.FixTransform();
            }
        }
    }

    public override bool IsValid(ref string message) {
        if (!spineIsValid) {
            message = "IKSolverLookAt spine setup is invalid. Can't initiate solver.";
            return false;
        }

        if (!headIsValid) {
            message = "IKSolverLookAt head transform is null. Can't initiate solver.";
            return false;
        }

        if (!eyesIsValid) {
            message = "IKSolverLookAt eyes setup is invalid. Can't initiate solver.";
            return false;
        }

        if (spineIsEmpty && headIsEmpty && eyesIsEmpty) {
            message = "IKSolverLookAt eyes setup is invalid. Can't initiate solver.";
            return false;
        }

        Bone[] bones = spine;
        Transform transform = IKSolver.ContainsDuplicateBone(bones);
        if (transform != null) {
            message = transform.name + " is represented multiple times in a single IK chain. Can't initiate solver.";
            return false;
        }

        bones = eyes;
        Transform transform2 = IKSolver.ContainsDuplicateBone(bones);
        if (transform2 != null) {
            message = transform2.name + " is represented multiple times in a single IK chain. Can't initiate solver.";
            return false;
        }

        return true;
    }

    public override Point[] GetPoints() {
        Point[] array = new Point[spine.Length + eyes.Length + ((head.transform != null) ? 1 : 0)];
        for (int i = 0; i < spine.Length; i++) {
            array[i] = spine[i];
        }

        int num = 0;
        for (int j = spine.Length; j < spine.Length + eyes.Length; j++) {
            array[j] = eyes[num];
            num++;
        }

        if (head.transform != null) {
            array[array.Length - 1] = head;
        }

        return array;
    }

    public override Point GetPoint(Transform transform) {
        LookAtBone[] array = spine;
        foreach (LookAtBone lookAtBone in array) {
            if (lookAtBone.transform == transform) {
                return lookAtBone;
            }
        }

        array = eyes;
        foreach (LookAtBone lookAtBone2 in array) {
            if (lookAtBone2.transform == transform) {
                return lookAtBone2;
            }
        }

        if (head.transform == transform) {
            return head;
        }

        return null;
    }

    public bool SetChain(Transform[] spine, Transform head, Transform[] eyes, Transform root) {
        SetBones(spine, ref this.spine);
        this.head = new LookAtBone(head);
        SetBones(eyes, ref this.eyes);
        Initiate(root);
        return base.initiated;
    }

    protected override void OnInitiate() {
        if (firstInitiation || !Application.isPlaying) {
            if (spine.Length != 0) {
                IKPosition = spine[spine.Length - 1].transform.position + root.forward * 3f;
            } else if (head.transform != null) {
                IKPosition = head.transform.position + root.forward * 3f;
            } else if (eyes.Length != 0 && eyes[0].transform != null) {
                IKPosition = eyes[0].transform.position + root.forward * 3f;
            }
        }

        LookAtBone[] array = spine;
        for (int i = 0; i < array.Length; i++) {
            array[i].Initiate(root);
        }

        if (head != null) {
            head.Initiate(root);
        }

        array = eyes;
        for (int i = 0; i < array.Length; i++) {
            array[i].Initiate(root);
        }

        if (spineForwards == null || spineForwards.Length != spine.Length) {
            spineForwards = new Vector3[spine.Length];
        }

        if (headForwards == null) {
            headForwards = new Vector3[1];
        }

        if (eyeForward == null) {
            eyeForward = new Vector3[1];
        }
    }

    protected override void OnUpdate() {
        if (!(IKPositionWeight <= 0f)) {
            IKPositionWeight = Mathf.Clamp(IKPositionWeight, 0f, 1f);
            if (target != null) {
                IKPosition = target.position;
            }

            SolveSpine();
            SolveHead();
            SolveEyes();
        }
    }

    protected void SolveSpine() {
        if (!(bodyWeight <= 0f) && !spineIsEmpty) {
            Vector3 normalized = (IKPosition + spineTargetOffset - spine[spine.Length - 1].transform.position).normalized;
            GetForwards(ref spineForwards, spine[0].forward, normalized, spine.Length, clampWeight);
            for (int i = 0; i < spine.Length; i++) {
                spine[i].LookAt(spineForwards[i], bodyWeight * IKPositionWeight);
            }
        }
    }

    protected void SolveHead() {
        if (!(headWeight <= 0f) && !headIsEmpty) {
            Vector3 vector = ((spine.Length != 0 && spine[spine.Length - 1].transform != null) ? spine[spine.Length - 1].forward : head.forward);
            Vector3 normalized = Vector3.Lerp(vector, (IKPosition - head.transform.position).normalized, headWeight * IKPositionWeight).normalized;
            GetForwards(ref headForwards, vector, normalized, 1, clampWeightHead);
            head.LookAt(headForwards[0], headWeight * IKPositionWeight);
        }
    }

    protected void SolveEyes() {
        if (eyesWeight <= 0f || eyesIsEmpty) {
            return;
        }

        for (int i = 0; i < eyes.Length; i++) {
            Quaternion quaternion = ((head.transform != null) ? head.transform.rotation : ((spine.Length != 0) ? spine[spine.Length - 1].transform.rotation : root.rotation));
            Vector3 vector = ((head.transform != null) ? head.axis : ((spine.Length != 0) ? spine[spine.Length - 1].axis : root.forward));
            if (eyes[i].baseForwardOffsetEuler != Vector3.zero) {
                quaternion *= Quaternion.Euler(eyes[i].baseForwardOffsetEuler);
            }

            Vector3 baseForward = quaternion * vector;
            GetForwards(ref eyeForward, baseForward, (IKPosition - eyes[i].transform.position).normalized, 1, clampWeightEyes);
            eyes[i].LookAt(eyeForward[0], eyesWeight * IKPositionWeight);
        }
    }

    protected Vector3[] GetForwards(ref Vector3[] forwards, Vector3 baseForward, Vector3 targetForward, int bones, float clamp) {
        if (clamp >= 1f || IKPositionWeight <= 0f) {
            for (int i = 0; i < forwards.Length; i++) {
                forwards[i] = baseForward;
            }

            return forwards;
        }

        float num = Vector3.Angle(baseForward, targetForward);
        float num2 = 1f - num / 180f;
        float num3 = ((clamp > 0f) ? Mathf.Clamp(1f - (clamp - num2) / (1f - num2), 0f, 1f) : 1f);
        float num4 = ((clamp > 0f) ? Mathf.Clamp(num2 / clamp, 0f, 1f) : 1f);
        for (int j = 0; j < clampSmoothing; j++) {
            num4 = Mathf.Sin(num4 * (float)Mathf.PI * 0.5f);
        }

        if (forwards.Length == 1) {
            forwards[0] = Vector3.Slerp(baseForward, targetForward, num4 * num3);
        } else {
            float num5 = 1f / (float)(forwards.Length - 1);
            for (int k = 0; k < forwards.Length; k++) {
                forwards[k] = Vector3.Slerp(baseForward, targetForward, spineWeightCurve.Evaluate(num5 * (float)k) * num4 * num3);
            }
        }

        return forwards;
    }

    protected void SetBones(Transform[] array, ref LookAtBone[] bones) {
        if (array == null) {
            bones = new LookAtBone[0];
            return;
        }

        if (bones.Length != array.Length) {
            bones = new LookAtBone[array.Length];
        }

        for (int i = 0; i < array.Length; i++) {
            if (bones[i] == null) {
                bones[i] = new LookAtBone(array[i]);
            } else {
                bones[i].transform = array[i];
            }
        }
    }
}