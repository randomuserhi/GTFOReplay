using System.IO;
using System.Text;
using UnityEngine;

[RequireComponent(typeof(Animator))]
public class FoldAnimationClipRecorder : MonoBehaviour {
    public AnimationClip[] clips;

    private Animator animator;
    private AnimatorOverrideController overrideController;

    private string filePath = "E:\\Git\\GTFOReplay\\Viewer\\assets\\js3party\\animations";

    public Transform fold;
    public Transform leftHand;
    public Transform mag;

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

        fs.WriteLine($"{{ \"rate\": {rate}, \"duration\": {duration}, \"frames\": [");

        float current = 0;
        for (int i = 0; i < captures; ++i) {
            animator.Play("Clip", 0, Mathf.Clamp01(current / duration));
            animator.Update(0.0f);

            sb.Clear();
            SaveCurrentFrame(sb);
            if (i < captures - 1) sb.Append(",");
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
        Vector3 localPosition = transform.position;
        sb.Append($"\"{name}\":{{\"x\":{-localPosition.x},\"y\":{localPosition.y},\"z\":{localPosition.z}}}");
    }

    private void GetRotationString(StringBuilder sb, string name, Transform transform) {
        Quaternion rot = transform.localRotation;
        rot.Normalize();
        sb.Append($"\"{name}\":{{\"rot\":{{\"x\":{rot.x},\"y\":{-rot.y},\"z\":{-rot.z},\"w\":{rot.w}}}}}");
    }

    private void GetJointString(StringBuilder sb, string name, Transform transform) {
        Vector3 localPosition = transform.position;
        Quaternion rot = transform.rotation;
        rot.Normalize();
        sb.Append($"\"{name}\":{{\"pos\":{{\"x\":{-localPosition.x},\"y\":{localPosition.y},\"z\":{localPosition.z}}},\"rot\":{{\"x\":{rot.x},\"y\":{-rot.y},\"z\":{-rot.z},\"w\":{rot.w}}}}}");
    }

    private StringBuilder SaveCurrentFrame(StringBuilder sb) {
        sb.Append("    {");

        sb.Append("\"joints\":{");
        GetRotationString(sb, "fold", fold); sb.Append(",");
        GetJointString(sb, "mag", mag); sb.Append(",");
        GetJointString(sb, "leftHand", leftHand);

        sb.Append("}}");

        return sb;
    }
}
