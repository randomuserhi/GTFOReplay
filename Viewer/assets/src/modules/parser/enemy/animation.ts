export namespace AnimHandles {
    export type Flags = 
        "unspecified" |
        "enemyCripple" |
        "enemyRunner" |
        "enemyFiddler" |
        "enemyLow" |
        "enemyCrawlFlip" |
        "enemyCrawl" |
        "enemyGiant" |
        "enemyBig" |
        "enemyExploder" |
        "enemyBirtherCrawlFlip" |
        "enemyPouncer";
    export const FlagMap = new Map<number, Flags>([
        [1, "unspecified"],
        [2, "enemyCripple"],
        [4, "enemyRunner"],
        [8, "enemyFiddler"],
        [0x10, "enemyLow"],
        [0x20, "enemyCrawlFlip"],
        [0x40, "enemyCrawl"],
        [0x80, "enemyGiant"],
        [0x100, "enemyBig"],
        [0x200, "enemyExploder"],
        [0x400, "enemyBirtherCrawlFlip"],
        [0x800, "enemyPouncer"]
    ]); 
    export const Unspecified = 1;
    export const EnemyCripple = 2;
    export const EnemyRunner = 4;
    export const EnemyFiddler = 8;
    export const EnemyLow = 0x10;
    export const EnemyCrawlFlip = 0x20;
    export const EnemyCrawl = 0x40;
    export const EnemyGiant = 0x80;
    export const EnemyBig = 0x100;
    export const EnemyExploder = 0x200;
    export const EnemyBirtherCrawlFlip = 0x400;
    export const EnemyPouncer = 0x800;
}