// TODO(randomuserhi): Move settings into replay instance to support multiple replay instances

interface GTFOReplaySettings
{
    scale: number;
    tracerLingerTime: number
}

let GTFOReplaySettings: GTFOReplaySettings = {
    scale: 30,
    tracerLingerTime: 200
}