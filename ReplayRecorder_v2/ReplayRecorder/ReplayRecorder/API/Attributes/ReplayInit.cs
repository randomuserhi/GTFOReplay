namespace ReplayRecorder.API.Attributes {

    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayInit : Attribute {
        public ReplayInit() {

        }
    }
}
