using UnityEngine;

public class PlayerAnimationEvents : MonoBehaviour {

    public void Footstepsneak() {
    }

    public void FootstepSneak() {
    }

    public void Footstepwalk() {
    }

    public void FootstepWalk() {
    }

    public void Footsteprun() {
    }

    public void FootstepRun() {
    }

    private void TriggerFootstepSneak() {
    }

    private void TriggerFootstepWalk() {
    }

    private void TriggerFootstepRun() {
    }

    public GameObject target;

    private Animator animator;
    private void Start() {
        animator = GetComponent<Animator>();
    }

    private void Update() {
        if (target == null) return;

        Vector3 targetLookDir = (target.transform.position - transform.position).normalized;
        Vector2 vector3 = new Vector2(targetLookDir.x, targetLookDir.z);
        vector3.Normalize();
        Vector3 right = base.transform.right;
        Vector2 rhs = new Vector2(right.x, right.z);
        rhs.Normalize();
        Vector3 forward = base.transform.forward;
        Vector2 vector4 = new Vector2(forward.x, forward.z);
        vector4.Normalize();
        float num4 = 1.2217305f;
        float num5 = Mathf.Asin(targetLookDir.y);
        num5 /= num4;
        float num6 = Vector2.Dot(vector3, rhs);
        float num7 = Vector2.Dot(vector3, vector4);
        float value = ((num6 < 0f) ? ((!(num7 < 0f)) ? ((0f - Mathf.Asin(0f - num6)) / num4) : (-1f)) : ((!(num7 < 0f)) ? (Mathf.Asin(num6) / num4) : 1f));
        animator.SetFloat("AimDownUp", num5);
        animator.SetFloat("AimLeftRight", value);
    }
}
