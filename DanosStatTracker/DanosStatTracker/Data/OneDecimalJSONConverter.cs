using System.Text.Json;
using System.Text.Json.Serialization;

namespace DanosStatTracker.Data {
    public class OneDecimalJsonConverter : JsonConverter<float> {
        public override float Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
            return (float)reader.GetDouble(); // Cast the value to float
        }

        public override void Write(Utf8JsonWriter writer, float value, JsonSerializerOptions options) {
            writer.WriteNumberValue(Math.Round(value, 1)); // Write rounded to 1 decimal place
        }
    }
}
