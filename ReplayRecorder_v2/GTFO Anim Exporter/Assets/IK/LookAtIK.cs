using UnityEngine;

[HelpURL("http://www.root-motion.com/finalikdox/html/page13.html")]
[AddComponentMenu("Scripts/RootMotion.FinalIK/IK/Look At IK")]
public class LookAtIK : IK {
    public IKSolverLookAt solver = new IKSolverLookAt();

    [ContextMenu("User Manual")]
    protected override void OpenUserManual() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/page13.html");
    }

    [ContextMenu("Scrpt Reference")]
    protected override void OpenScriptReference() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/class_root_motion_1_1_final_i_k_1_1_look_at_i_k.html");
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