import { app } from "electron";
import Program from "./main.cjs";
import Updater from "./updater.cjs";
// NOTE(randomuserhi): fixing webgl context loss 
app.commandLine.appendSwitch('--disable-gpu-process-crash-limit');
app.disableDomainBlockingFor3DAPIs();

if (process.argv.includes('--skip-launcher')) {
    Program.main(app);
} else {
    Updater.main(app);
}