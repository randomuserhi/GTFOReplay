using System;
using UnityEngine;

public static class QuaTools {
    public static Quaternion Lerp(Quaternion fromRotation, Quaternion toRotation, float weight) {
        if (weight <= 0f) {
            return fromRotation;
        }

        if (weight >= 1f) {
            return toRotation;
        }

        return Quaternion.Lerp(fromRotation, toRotation, weight);
    }

    public static Quaternion Slerp(Quaternion fromRotation, Quaternion toRotation, float weight) {
        if (weight <= 0f) {
            return fromRotation;
        }

        if (weight >= 1f) {
            return toRotation;
        }

        return Quaternion.Slerp(fromRotation, toRotation, weight);
    }

    public static Quaternion LinearBlend(Quaternion q, float weight) {
        if (weight <= 0f) {
            return Quaternion.identity;
        }

        if (weight >= 1f) {
            return q;
        }

        return Quaternion.Lerp(Quaternion.identity, q, weight);
    }

    public static Quaternion SphericalBlend(Quaternion q, float weight) {
        if (weight <= 0f) {
            return Quaternion.identity;
        }

        if (weight >= 1f) {
            return q;
        }

        return Quaternion.Slerp(Quaternion.identity, q, weight);
    }

    public static Quaternion FromToAroundAxis(Vector3 fromDirection, Vector3 toDirection, Vector3 axis) {
        Quaternion quaternion = Quaternion.FromToRotation(fromDirection, toDirection);
        float angle = 0f;
        Vector3 axis2 = Vector3.zero;
        quaternion.ToAngleAxis(out angle, out axis2);
        if (Vector3.Dot(axis2, axis) < 0f) {
            angle = 0f - angle;
        }

        return Quaternion.AngleAxis(angle, axis);
    }

    public static Quaternion RotationToLocalSpace(Quaternion space, Quaternion rotation) {
        return Quaternion.Inverse(Quaternion.Inverse(space) * rotation);
    }

    public static Quaternion FromToRotation(Quaternion from, Quaternion to) {
        if (to == from) {
            return Quaternion.identity;
        }

        return to * Quaternion.Inverse(from);
    }

    public static Vector3 GetAxis(Vector3 v) {
        Vector3 vector = Vector3.right;
        bool flag = false;
        float num = Vector3.Dot(v, Vector3.right);
        float num2 = Mathf.Abs(num);
        if (num < 0f) {
            flag = true;
        }

        float num3 = Vector3.Dot(v, Vector3.up);
        float num4 = Mathf.Abs(num3);
        if (num4 > num2) {
            num2 = num4;
            vector = Vector3.up;
            flag = num3 < 0f;
        }

        float num5 = Vector3.Dot(v, Vector3.forward);
        num4 = Mathf.Abs(num5);
        if (num4 > num2) {
            vector = Vector3.forward;
            flag = num5 < 0f;
        }

        if (flag) {
            vector = -vector;
        }

        return vector;
    }

    public static Quaternion ClampRotation(Quaternion rotation, float clampWeight, int clampSmoothing) {
        if (clampWeight >= 1f) {
            return Quaternion.identity;
        }

        if (clampWeight <= 0f) {
            return rotation;
        }

        float num = Quaternion.Angle(Quaternion.identity, rotation);
        float num2 = 1f - num / 180f;
        float num3 = Mathf.Clamp(1f - (clampWeight - num2) / (1f - num2), 0f, 1f);
        float num4 = Mathf.Clamp(num2 / clampWeight, 0f, 1f);
        for (int i = 0; i < clampSmoothing; i++) {
            num4 = Mathf.Sin(num4 * (float)Math.PI * 0.5f);
        }

        return Quaternion.Slerp(Quaternion.identity, rotation, num4 * num3);
    }

    public static float ClampAngle(float angle, float clampWeight, int clampSmoothing) {
        if (clampWeight >= 1f) {
            return 0f;
        }

        if (clampWeight <= 0f) {
            return angle;
        }

        float num = 1f - Mathf.Abs(angle) / 180f;
        float num2 = Mathf.Clamp(1f - (clampWeight - num) / (1f - num), 0f, 1f);
        float num3 = Mathf.Clamp(num / clampWeight, 0f, 1f);
        for (int i = 0; i < clampSmoothing; i++) {
            num3 = Mathf.Sin(num3 * (float)Math.PI * 0.5f);
        }

        return Mathf.Lerp(0f, angle, num3 * num2);
    }

    public static Quaternion MatchRotation(Quaternion targetRotation, Vector3 targetforwardAxis, Vector3 targetUpAxis, Vector3 forwardAxis, Vector3 upAxis) {
        Quaternion rotation = Quaternion.LookRotation(forwardAxis, upAxis);
        Quaternion quaternion = Quaternion.LookRotation(targetforwardAxis, targetUpAxis);
        return targetRotation * quaternion * Quaternion.Inverse(rotation);
    }

    public static Vector3 ToBiPolar(Vector3 euler) {
        return new Vector3(ToBiPolar(euler.x), ToBiPolar(euler.y), ToBiPolar(euler.z));
    }

    public static float ToBiPolar(float angle) {
        angle %= 360f;
        if (angle >= 180f) {
            return angle - 360f;
        }

        if (angle <= -180f) {
            return angle + 360f;
        }

        return angle;
    }
}