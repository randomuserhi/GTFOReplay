using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class ragdoll : MonoBehaviour {
    public Transform playerRig;

    public List<GameObject> boneList = new List<GameObject>();

    public bool isLocal = true;

    public bool ragdollEnabled = false;

    public float timer;

    public float landedTimer;

    public readonly List<string> excludeBones = new List<string> { "Neck", "LeftShoulder", "RightShoulder", "Spine2", "Spine3" };

    public void Awake() {
        AddRBAndCJ("Hip/LeftUpperLeg/LeftLowerLeg/LeftFoot");
        AddRBAndCJ("Hip/RightUpperLeg/RightLowerLeg/RightFoot");
        AddRBAndCJ("Hip/Spine1/Spine2/Spine3/LeftShoulder/LeftUpperArm/LeftLowerArm");
        AddRBAndCJ("Hip/Spine1/Spine2/Spine3/RightShoulder/RightUpperArm/RightLowerArm");
        AddRBAndCJ("Hip/Spine1/Spine2/Spine3/Neck/Head");

        ToggleRagdoll(true);
    }

    public void ToggleRagdoll(bool enabled) {
        timer = 0f;
        landedTimer = 0f;
        foreach (GameObject bone in boneList) {
            Rigidbody component = bone.GetComponent<Rigidbody>();
            bone.GetComponent<SphereCollider>().radius = 0.15f;
            if (enabled) {
                ragdollEnabled = true;
                component.useGravity = true;
                component.isKinematic = false;
                component.velocity = Vector3.zero;
            } else {
                ragdollEnabled = false;
                component.useGravity = false;
                component.isKinematic = true;
                component.velocity = Vector3.zero;
            }
        }
        if (enabled) {
            playerRig.parent = null;
            return;
        }
    }

    private GameObject GetParent(GameObject go) {
        GameObject gameObject = ((Component)go.transform.parent).gameObject;
        while (excludeBones.Contains(((Object)gameObject).name) && ((Object)gameObject).name != "Root") {
            gameObject = ((Component)gameObject.transform.parent).gameObject;
        }
        return gameObject;
    }

    public void AddRBAndCJ(string boneName) {
        //IL_023b: Unknown result type (might be due to invalid IL or missing references)
        //IL_0265: Unknown result type (might be due to invalid IL or missing references)
        //IL_026a: Unknown result type (might be due to invalid IL or missing references)
        //IL_0276: Unknown result type (might be due to invalid IL or missing references)
        //IL_027b: Unknown result type (might be due to invalid IL or missing references)
        //IL_028a: Unknown result type (might be due to invalid IL or missing references)
        //IL_0292: Unknown result type (might be due to invalid IL or missing references)
        //IL_0297: Unknown result type (might be due to invalid IL or missing references)
        //IL_02a6: Unknown result type (might be due to invalid IL or missing references)
        //IL_02ae: Unknown result type (might be due to invalid IL or missing references)
        //IL_02b3: Unknown result type (might be due to invalid IL or missing references)
        //IL_02c3: Unknown result type (might be due to invalid IL or missing references)
        //IL_02cc: Unknown result type (might be due to invalid IL or missing references)
        //IL_02d1: Unknown result type (might be due to invalid IL or missing references)
        //IL_02e1: Unknown result type (might be due to invalid IL or missing references)
        GameObject bone = ((Component)playerRig.Find("Root/" + boneName)).gameObject;
        GameObject boneParent = GetParent(bone);
        while (((Object)boneParent).name != "Root") {
            if ((Object)(object)boneParent.GetComponent<Rigidbody>() == (Object)null) {
                Rigidbody val = boneParent.AddComponent<Rigidbody>();
                val.useGravity = false;
                val.isKinematic = true;
                val.mass = 15f;
                val.interpolation = (RigidbodyInterpolation)1;
                val.collisionDetectionMode = (CollisionDetectionMode)3;
                if (((Object)boneParent).name != "Hip") {
                    boneParent.AddComponent<ConfigurableJoint>();
                }
                boneParent.AddComponent<SphereCollider>();
                boneParent.layer = 18;
            }
            if ((Object)(object)bone.GetComponent<Rigidbody>() == (Object)null) {
                Rigidbody val2 = bone.AddComponent<Rigidbody>();
                val2.useGravity = false;
                val2.isKinematic = true;
                val2.mass = 15f;
                val2.interpolation = (RigidbodyInterpolation)1;
                val2.collisionDetectionMode = (CollisionDetectionMode)3;
                bone.AddComponent<ConfigurableJoint>();
                bone.AddComponent<SphereCollider>();
                bone.layer = 18;
            }
            if (!boneList.Any((GameObject b) => ((Object)b).name == ((Object)bone).name)) {
                boneList.Add(bone);
            }
            if (!boneList.Any((GameObject b) => ((Object)b).name == ((Object)boneParent).name)) {
                boneList.Add(boneParent);
            }
            ConfigurableJoint component = bone.GetComponent<ConfigurableJoint>();
            ((Joint)component).connectedBody = boneParent.GetComponent<Rigidbody>();
            component.xMotion = (ConfigurableJointMotion)0;
            component.yMotion = (ConfigurableJointMotion)0;
            component.zMotion = (ConfigurableJointMotion)0;
            component.angularXMotion = (ConfigurableJointMotion)1;
            component.angularYMotion = (ConfigurableJointMotion)1;
            component.angularZMotion = (ConfigurableJointMotion)1;
            ((Joint)component).anchor = Vector3.zero;
            ((Joint)component).autoConfigureConnectedAnchor = false;
            ((Joint)component).connectedAnchor = boneParent.transform.InverseTransformPoint(bone.transform.position);
            SoftJointLimit lowAngularXLimit = component.lowAngularXLimit;
            lowAngularXLimit.limit = -20f;
            component.lowAngularXLimit = lowAngularXLimit;
            SoftJointLimit highAngularXLimit = component.highAngularXLimit;
            highAngularXLimit.limit = 20f;
            component.highAngularXLimit = highAngularXLimit;
            SoftJointLimit angularYLimit = component.angularYLimit;
            angularYLimit.limit = 40f;
            component.angularYLimit = angularYLimit;
            SoftJointLimit angularZLimit = component.angularZLimit;
            angularZLimit.limit = 40f;
            component.angularZLimit = angularZLimit;
            bone = boneParent;
            boneParent = GetParent(bone);
        }
    }

    public void InflictKnockback(Vector3 force, float multi) {
        //IL_001f: Unknown result type (might be due to invalid IL or missing references)
        //IL_0021: Unknown result type (might be due to invalid IL or missing references)
        //IL_0052: Unknown result type (might be due to invalid IL or missing references)
        foreach (GameObject bone in boneList) {
            bone.GetComponent<Rigidbody>().AddForce(force * multi);
        }
    }

    public GameObject bruh;

    public void FixedUpdate() {
        Debug.Log(bruh.transform.localRotation.eulerAngles);
    }
}
