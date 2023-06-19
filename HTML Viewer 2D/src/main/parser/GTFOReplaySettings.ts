// TODO(randomuserhi): Move settings into replay instance to support multiple replay instances

interface GTFOReplaySettings
{
    scale: number;
    tracerLingerTime: number;
    crossLingerTime: number;
    hitLingerTime: number;
}

let GTFOReplaySettings: GTFOReplaySettings = {
    scale: 30,
    tracerLingerTime: 200,
    crossLingerTime: 1000,
    hitLingerTime: 200
}