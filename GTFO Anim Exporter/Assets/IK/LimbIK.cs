using UnityEngine;

[HelpURL("http://www.root-motion.com/finalikdox/html/page12.html")]
[AddComponentMenu("Scripts/RootMotion.FinalIK/IK/Limb IK")]
public class LimbIK : IK {
    public IKSolverLimb solver = new IKSolverLimb();

    [ContextMenu("User Manual")]
    protected override void OpenUserManual() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/page12.html");
    }

    [ContextMenu("Scrpt Reference")]
    protected override void OpenScriptReference() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/class_root_motion_1_1_final_i_k_1_1_limb_i_k.html");
    }

    [ContextMenu("Support Group")]
    private void SupportGroup() {
        Application.OpenURL("https://groups.google.com/forum/#!forum/final-ik");
    }

    [ContextMenu("Asset Store Thread")]
    private void ASThread() {
        Application.OpenURL("http://forum.unity3d.com/threads/final-ik-full-body-ik-aim-look-at-fabrik-ccd-ik-1-0-released.222685/");
    }

    public override IKSolver GetIKSolver() {
        return solver;
    }
}