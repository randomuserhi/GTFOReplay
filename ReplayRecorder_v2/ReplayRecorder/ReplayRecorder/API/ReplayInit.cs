namespace ReplayRecorder.API {

    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayInit : Attribute {
        public ReplayInit() {

        }
    }
}
