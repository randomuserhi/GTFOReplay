import { StatTracker } from "@asl/vanilla/parser/stattracker/stattracker.js";
import { MedalDatablock, MedalRequirement } from "@asl/vanilla/ui/medals.js";
import { html } from "@esm/@/rhu/html.js";
import { signal } from "@esm/@/rhu/signal.js";

void html;
void signal;
void StatTracker;

const customMedals: MedalRequirement[] = [];
for (const medal of customMedals) {
    MedalDatablock.set(medal.name, medal);
}