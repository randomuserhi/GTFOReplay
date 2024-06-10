using UnityEngine;

public class SolverManager : MonoBehaviour {
    [Tooltip("If true, will fix all the Transforms used by the solver to their initial state in each Update. This prevents potential problems with unanimated bones and animator culling with a small cost of performance. Not recommended for CCD and FABRIK solvers.")]
    public bool fixTransforms = true;

    private Animator animator;

    private Animation legacy;

    private bool updateFrame;

    private bool componentInitiated;

    private bool skipSolverUpdate;

    private bool animatePhysics {
        get {
            if (animator != null) {
                return animator.updateMode == AnimatorUpdateMode.AnimatePhysics;
            }

            if (legacy != null) {
                return legacy.animatePhysics;
            }

            return false;
        }
    }

    private bool isAnimated {
        get {
            if (!(animator != null)) {
                return legacy != null;
            }

            return true;
        }
    }

    public void Disable() {
        Debug.Log("IK.Disable() is deprecated. Use enabled = false instead", base.transform);
        base.enabled = false;
    }

    protected virtual void InitiateSolver() {
    }

    protected virtual void UpdateSolver() {
    }

    protected virtual void FixTransforms() {
    }

    private void OnDisable() {
        if (Application.isPlaying) {
            Initiate();
        }
    }

    private void Start() {
        Initiate();
    }

    private void Initiate() {
        if (!componentInitiated) {
            FindAnimatorRecursive(base.transform, findInChildren: true);
            InitiateSolver();
            componentInitiated = true;
        }
    }

    private void Update() {
        if (!skipSolverUpdate && !animatePhysics && fixTransforms) {
            FixTransforms();
        }
    }

    private void FindAnimatorRecursive(Transform t, bool findInChildren) {
        if (isAnimated) {
            return;
        }

        animator = t.GetComponent<Animator>();
        legacy = t.GetComponent<Animation>();
        if (!isAnimated) {
            if (animator == null && findInChildren) {
                animator = t.GetComponentInChildren<Animator>();
            }

            if (legacy == null && findInChildren) {
                legacy = t.GetComponentInChildren<Animation>();
            }

            if (!isAnimated && t.parent != null) {
                FindAnimatorRecursive(t.parent, findInChildren: false);
            }
        }
    }

    private void FixedUpdate() {
        if (skipSolverUpdate) {
            skipSolverUpdate = false;
        }

        updateFrame = true;
        if (animatePhysics && fixTransforms) {
            FixTransforms();
        }
    }

    private void LateUpdate() {
        if (!skipSolverUpdate) {
            if (!animatePhysics) {
                updateFrame = true;
            }

            if (updateFrame) {
                updateFrame = false;
                UpdateSolver();
            }
        }
    }

    public void UpdateSolverExternal() {
        if (base.enabled) {
            skipSolverUpdate = true;
            UpdateSolver();
        }
    }
}