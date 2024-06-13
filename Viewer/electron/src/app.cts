import { app } from "electron";
import Program from "./main.cjs";

// NOTE(randomuserhi): fixing webgl context loss 
app.commandLine.appendSwitch('--disable-gpu-process-crash-limit');
app.disableDomainBlockingFor3DAPIs();
Program.main(app);