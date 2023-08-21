// TODO(randomuserhi): Move settings into replay instance to support multiple replay instances

interface GTFOReplaySettings
{
    scale: number;
    tracerLingerTime: number;
    crossLingerTime: number;
    hitLingerTime: number;
    alertLingerTime: number;
    screamLingerTime: number;
}

let GTFOReplaySettings: GTFOReplaySettings = {
    scale: 30,
    tracerLingerTime: 150,
    crossLingerTime: 1000,
    hitLingerTime: 200,
    alertLingerTime: 1500,
    screamLingerTime: 2000
}