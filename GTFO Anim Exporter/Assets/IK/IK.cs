public abstract class IK : SolverManager {
    public abstract IKSolver GetIKSolver();

    protected override void UpdateSolver() {
        if (!GetIKSolver().initiated) {
            InitiateSolver();
        }

        if (GetIKSolver().initiated) {
            GetIKSolver().Update();
        }
    }

    protected override void InitiateSolver() {
        if (!GetIKSolver().initiated) {
            GetIKSolver().Initiate(base.transform);
        }
    }

    protected override void FixTransforms() {
        if (GetIKSolver().initiated) {
            GetIKSolver().FixTransforms();
        }
    }

    protected abstract void OpenUserManual();

    protected abstract void OpenScriptReference();
}
