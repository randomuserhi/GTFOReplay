const { StatTracker } = await require("@asl/vanilla/parser/stattracker/stattracker.js", "asl");
const { MedalDatablock } = await require("@asl/vanilla/ui/medals.js", "asl");
const { html } = await require("@/rhu/html.js", "esm");
const { signal } = await require("@/rhu/signal.js", "esm");
void html;
void signal;
void StatTracker;
const customMedals = [];
for (const medal of customMedals) {
  MedalDatablock.set(medal.name, medal);
}