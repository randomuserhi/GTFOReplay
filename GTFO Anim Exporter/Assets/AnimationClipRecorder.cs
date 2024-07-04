using System.IO;
using System.Text;
using UnityEngine;

[RequireComponent(typeof(Animator))]
public class AnimationClipRecorder : MonoBehaviour {
    public AnimationClip[] clips;

    private Animator animator;
    private AnimatorOverrideController overrideController;

    private string filePath = "E:\\Git\\GTFOReplay\\animations";

    public Transform hip;

    public Transform leftUpperLeg;
    public Transform leftLowerLeg;
    public Transform leftFoot;

    public Transform rightUpperLeg;
    public Transform rightLowerLeg;
    public Transform rightFoot;

    public Transform spine0;
    public Transform spine1;
    public Transform spine2;

    public Transform leftShoulder;
    public Transform leftUpperArm;
    public Transform leftLowerArm;
    public Transform leftHand;

    public Transform rightShoulder;
    public Transform rightUpperArm;
    public Transform rightLowerArm;
    public Transform rightHand;

    public Transform neck;
    public Transform head;

    // Start is called before the first frame update
    private void Start() {
        foreach (var clip in clips) {
            SaveClip(clip);
        }
    }

    private void SaveClip(AnimationClip clip) {
        animator = GetComponent<Animator>();
        animator.applyRootMotion = false;

        overrideController = animator.runtimeAnimatorController as AnimatorOverrideController;
        overrideController["clip"] = clip;

        animator.speed = 0f;

        float duration = clip.length;
        const float rate = 1f / 20f;
        int captures = Mathf.CeilToInt(duration / rate) + 1;

        string fullpath = Path.Combine(filePath, $"{clip.name}.json");
        StreamWriter fs = new StreamWriter(fullpath, false, Encoding.UTF8);
        StringBuilder sb = new StringBuilder();

        /*SaveStructure(sb);
        fs.Write(sb.ToString());
        fs.Dispose();
        return;*/

        fs.WriteLine($"{{ \"rate\": {rate}, \"duration\": {duration}, \"frames\": [");

        float current = 0;
        for (int i = 0; i < captures; ++i) {
            animator.Play("Clip", 0, Mathf.Clamp01(current / duration));
            animator.Update(0.0f);

            sb.Clear();
            SaveCurrentFrame(sb);
            sb.Append(",");
            fs.WriteLine(sb.ToString());
            current += rate;
        }

        fs.Write("] }");

        fs.Dispose();

        animator.speed = 1f;
    }

    private void GetTransformString(StringBuilder sb, string name, Transform transform) {
        sb.Append($"\"{name}\":{{\"position\":{{\"x\":{-transform.localPosition.x},\"y\":{transform.localPosition.y},\"z\":{transform.localPosition.z}}},\"rotation\":{{\"x\":{transform.localRotation.x},\"y\":{transform.localRotation.y},\"z\":{transform.localRotation.z},\"w\":{transform.localRotation.w}}}}}");
    }

    private void GetPositionString(StringBuilder sb, string name, Transform transform) {
        Vector3 localPosition = transform.localPosition;
        localPosition = transform.rotation * localPosition;
        sb.Append($"\"{name}\":{{\"x\":{-localPosition.x},\"y\":{localPosition.y},\"z\":{localPosition.z}}}");
    }

    private void GetRotationString(StringBuilder sb, string name, Transform transform) {
        Quaternion rot = transform.localRotation;
        rot.Normalize();
        sb.Append($"\"{name}\":{{\"x\":{rot.x},\"y\":{-rot.y},\"z\":{-rot.z},\"w\":{rot.w}}}");
    }

    private StringBuilder SaveCurrentFrame(StringBuilder sb) {
        sb.Append("    {");

        GetPositionString(sb, "root", hip); sb.Append(",");

        sb.Append("\"joints\":{");
        GetRotationString(sb, "hip", hip); sb.Append(",");

        GetRotationString(sb, "leftUpperLeg", leftUpperLeg); sb.Append(",");
        GetRotationString(sb, "leftLowerLeg", leftLowerLeg); sb.Append(",");
        GetRotationString(sb, "leftFoot", leftFoot); sb.Append(",");

        GetRotationString(sb, "rightUpperLeg", rightUpperLeg); sb.Append(",");
        GetRotationString(sb, "rightLowerLeg", rightLowerLeg); sb.Append(",");
        GetRotationString(sb, "rightFoot", rightFoot); sb.Append(",");

        GetRotationString(sb, "spine0", spine0); sb.Append(",");
        GetRotationString(sb, "spine1", spine1); sb.Append(",");
        GetRotationString(sb, "spine2", spine2); sb.Append(",");

        GetRotationString(sb, "leftShoulder", leftShoulder); sb.Append(",");
        GetRotationString(sb, "leftUpperArm", leftUpperArm); sb.Append(",");
        GetRotationString(sb, "leftLowerArm", leftLowerArm); sb.Append(",");
        GetRotationString(sb, "leftHand", leftHand); sb.Append(",");

        GetRotationString(sb, "rightShoulder", rightShoulder); sb.Append(",");
        GetRotationString(sb, "rightUpperArm", rightUpperArm); sb.Append(",");
        GetRotationString(sb, "rightLowerArm", rightLowerArm); sb.Append(",");
        GetRotationString(sb, "rightHand", rightHand); sb.Append(",");

        GetRotationString(sb, "neck", neck); sb.Append(",");
        GetRotationString(sb, "head", head);

        sb.Append("}}");

        return sb;
    }

    private StringBuilder SaveStructure(StringBuilder sb) {
        sb.Append("    {");

        GetPositionString(sb, "hip", hip); sb.Append(",");

        GetPositionString(sb, "leftUpperLeg", leftUpperLeg); sb.Append(",");
        GetPositionString(sb, "leftLowerLeg", leftLowerLeg); sb.Append(",");
        GetPositionString(sb, "leftFoot", leftFoot); sb.Append(",");

        GetPositionString(sb, "rightUpperLeg", rightUpperLeg); sb.Append(",");
        GetPositionString(sb, "rightLowerLeg", rightLowerLeg); sb.Append(",");
        GetPositionString(sb, "rightFoot", rightFoot); sb.Append(",");

        GetPositionString(sb, "spine0", spine0); sb.Append(",");
        GetPositionString(sb, "spine1", spine0); sb.Append(",");
        GetPositionString(sb, "spine2", spine0); sb.Append(",");

        GetPositionString(sb, "leftShoulder", leftShoulder); sb.Append(",");
        GetPositionString(sb, "leftUpperArm", leftUpperArm); sb.Append(",");
        GetPositionString(sb, "leftLowerArm", leftLowerArm); sb.Append(",");
        GetPositionString(sb, "leftHand", leftHand); sb.Append(",");

        GetPositionString(sb, "rightShoulder", rightShoulder); sb.Append(",");
        GetPositionString(sb, "rightUpperArm", rightUpperArm); sb.Append(",");
        GetPositionString(sb, "rightLowerArm", rightLowerArm); sb.Append(",");
        GetPositionString(sb, "rightHand", rightHand); sb.Append(",");

        GetPositionString(sb, "neck", neck); sb.Append(",");
        GetPositionString(sb, "head", head);

        sb.Append("}");

        return sb;
    }
}
