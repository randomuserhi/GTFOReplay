using UnityEngine;

[HelpURL("https://www.youtube.com/watch?v=wT8fViZpLmQ&index=3&list=PLVxSIA1OaTOu8Nos3CalXbJ2DrKnntMv6")]
[AddComponentMenu("Scripts/RootMotion.FinalIK/IK/Aim IK")]
public class AimIK : IK {
    public IKSolverAim solver = new IKSolverAim();

    [ContextMenu("User Manual")]
    protected override void OpenUserManual() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/page1.html");
    }

    [ContextMenu("Scrpt Reference")]
    protected override void OpenScriptReference() {
        Application.OpenURL("http://www.root-motion.com/finalikdox/html/class_root_motion_1_1_final_i_k_1_1_aim_i_k.html");
    }

    [ContextMenu("TUTORIAL VIDEO")]
    private void OpenSetupTutorial() {
        Application.OpenURL("https://www.youtube.com/watch?v=wT8fViZpLmQ");
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
