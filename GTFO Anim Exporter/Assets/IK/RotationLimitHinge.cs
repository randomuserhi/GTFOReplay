using UnityEngine;

[HelpURL("http://www.root-motion.com/finalikdox/html/page14.html")]
[AddComponentMenu("Scripts/RootMotion.FinalIK/Rotation Limits/Rotation Limit Hinge")]
public class RotationLimitHinge : RotationLimit {
    public bool useLimits = true;

    public float min = -45f;

    public float max = 90f;

    [HideInInspector]
    public float zeroAxisDisplayOffset;

    private Quaternion lastRotation = Quaternion.identity;

    private float lastAngle;

    [ContextMenu("User Manual")]
    private void OpenUserManual() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/page14.html");
    }

    [ContextMenu("Scrpt Reference")]
    private void OpenScriptReference() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/class_root_motion_1_1_final_i_k_1_1_rotation_limit_hinge.html");
    }

    [ContextMenu("Support Group")]
    private void SupportGroup() {
        Application.OpenURL("https://groups.google.com/forum/#!forum/final-ik");
    }

    [ContextMenu("Asset Store Thread")]
    private void ASThread() {
        Application.OpenURL("http://forum.unity3d.com/threads/final-ik-full-body-ik-aim-look-at-fabrik-ccd-ik-1-0-released.222685/");
    }

    protected override Quaternion LimitRotation(Quaternion rotation) {
        lastRotation = LimitHinge(rotation);
        return lastRotation;
    }

    private Quaternion LimitHinge(Quaternion rotation) {
        if (min == 0f && max == 0f && useLimits) {
            return Quaternion.AngleAxis(0f, axis);
        }

        Quaternion quaternion = RotationLimit.Limit1DOF(rotation, axis);
        if (!useLimits) {
            return quaternion;
        }

        Quaternion quaternion2 = quaternion * Quaternion.Inverse(lastRotation);
        float num = Quaternion.Angle(Quaternion.identity, quaternion2);
        Vector3 vector = new Vector3(axis.z, axis.x, axis.y);
        Vector3 rhs = Vector3.Cross(vector, axis);
        if (Vector3.Dot(quaternion2 * vector, rhs) > 0f) {
            num = 0f - num;
        }

        lastAngle = Mathf.Clamp(lastAngle + num, min, max);
        return Quaternion.AngleAxis(lastAngle, axis);
    }
}