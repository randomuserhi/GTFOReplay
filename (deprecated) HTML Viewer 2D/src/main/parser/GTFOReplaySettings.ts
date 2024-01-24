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
    // NOTE(randomuserhi): Only here to fix issue with old replays where pellets didnt trigger despawn event, 
    //                     so the replay viewer has to forcibly add them in for pellets that live longer than 
    //                     this value
    maxProjectileLifetime: -1,
}