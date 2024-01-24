// TODO(randomuserhi): Move settings into replay instance to support multiple replay instances

interface GTFOReplaySettings
{
    scale: number;
    tracerLingerTime: number;
    crossLingerTime: number;
    hitLingerTime: number;
    alertLingerTime: number;
    screamLingerTime: number;
    maxProjectileLifetime: number;
}

let GTFOReplaySettings: GTFOReplaySettings = {
    scale: 30,
    tracerLingerTime: 150,
    crossLingerTime: 1000,
    hitLingerTime: 200,
    alertLingerTime: 1500,
    screamLingerTime: 1500,
    maxProjectileLifetime: -1, // NOTE(randomuserhi): Only here to fix issue with old replays where pellets didnt remove themselves for an unknown reason
}