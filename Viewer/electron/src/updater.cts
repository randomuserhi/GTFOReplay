import { BrowserWindow, ipcMain, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as yauzl from "yauzl";
import { __git_tag__ } from "./git.cjs";
import Program from "./main.cjs";

const packagePath = path.join(__dirname, `/package.zip`);

export default class Updater {
    static win: Electron.BrowserWindow | null;
    static app: Electron.App;

    private static onWindowAllClosed(): void {
        Updater.dispose();

        // Start main program
        Program.main(Updater.app);
    }

    private static onClose(): void {
        // Dereference the window object. 
        Updater.win = null;
    }

    private static onReady(): void {
        Updater.setupIPC();

        Updater.win = new BrowserWindow({
            frame: false, // remove the window frame
            show: false, // hide the window,
            backgroundColor: "#000", // always set a bg color to enable font antialiasing
            webPreferences: {
                nodeIntegration: false, // is default value after Electron v5 - is disabled as per security (https://www.electronjs.org/docs/latest/tutorial/security)
                contextIsolation: true, // protect against prototype pollution - (https://www.electronjs.org/docs/latest/tutorial/context-isolation)
                preload: path.join(__dirname, "updater_preload.cjs") // use a preload script
            },
            resizable: false,
            fullscreen: false,
            maximizable: false,
            width: 200,
            height: 300
        });
        Updater.win.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url);
            return { action: "deny" };
        });
        Updater.win.on("closed", Updater.onClose);
        Updater.win.loadFile(path.join(__dirname, "assets/updater/main.html")); // load the main page
        Updater.win.show();
    }

    private static setupIPC(): void {
        ipcMain.on("close", (e) => {
            if (e.senderFrame === null) return;
            if (!Updater.isTrustedFrame(e.senderFrame)) return;
            if (Updater.win === null) return;
            
            Updater.win.close();
        });
        ipcMain.handle("download-package", async () => {
            // Fetch release list
            const req = await fetch(new URL(`https://api.github.com/repos/randomuserhi/GTFOReplay/releases`), { signal: AbortSignal.timeout(5000) });
            if (req.status !== 200) return undefined;

            const releases = await req.json();
            const release = releases[0];

            try {
                // Check matches with local version tag
                if (release.tag_name === __git_tag__) return undefined;

                // Find update package
                Updater.post("text", `Found '${release.tag_name}' ...`);
                const pckgName = "package.zip";
                let pckg: any = undefined;
                for (const asset of release.assets) {
                    if (asset.name === pckgName) {
                        pckg = asset;
                        break;
                    }
                }
                if (pckg === undefined) {
                    // If no package exists, then use must download from github
                    return release;
                }

                // Download package zip
                Updater.post("text", `Downloading package ...`);

                {
                    if (fs.existsSync(packagePath)) {
                        fs.unlinkSync(packagePath);
                    }

                    const resp = await fetch(pckg.browser_download_url);
                    if (resp.status !== 200) return release;
            
                    const totalSize = Number(resp.headers.get("content-length"));
                    if (totalSize <= 0) throw new Error("Total size should not be <= 0.");

                    const fileStream = fs.createWriteStream(packagePath);
                    const reader = resp.body!.getReader();
                
                    let downloaded = 0;
                    let result;
                    while (!(result = await reader.read()).done) {
                        downloaded += result.value.length;
                        fileStream.write(result.value);

                        Updater.post("progress", downloaded / totalSize);
                    }

                    fileStream.end();
                }

                // Extract package zip
                Updater.post("text", "Extracting package ...");
                Updater.post("progress", 0);
                
                {
                    const totalSize = await new Promise<number>((resolve, reject) => {
                        let totalSize = 0;
                        
                        yauzl.open(packagePath, { lazyEntries: true }, (err, zipFile) => {
                            if (err) {
                                reject(err);
                            } else {
                                zipFile.on("entry", (entry) => {
                                    totalSize += entry.uncompressedSize;
                                    zipFile.readEntry();
                                });
                            
                                zipFile.on("close", () => {
                                    resolve(totalSize);
                                });
                            
                                zipFile.on("error", (err) => {
                                    reject(err);
                                });
                            
                                zipFile.readEntry();
                            }
                        });
                    });

                    const success = await new Promise<boolean>((resolve) => {
                        let totalExtractedSize = 0;

                        yauzl.open(packagePath, { lazyEntries: true }, (err, zipFile) => {
                            zipFile.on("entry", (entry) => {
                                if (!entry.fileName.endsWith('/')) {
                                    const outputPath = path.join(__dirname, entry.fileName);
                                    const outputInfo = path.parse(outputPath);
                                    const outputDir = outputInfo.dir;

                                    if (!fs.existsSync(outputDir)){
                                        fs.mkdirSync(outputDir, { recursive: true });
                                    }

                                    zipFile.openReadStream(entry, (err, readStream) => {
                                        if (err) {
                                            console.error(err);
                                            resolve(false);
                                            zipFile.close();
                                            return;
                                        }
                                                                
                                        const writeStream = fs.createWriteStream(outputPath);

                                        writeStream.on('drain', () => {
                                            readStream.resume();
                                        });

                                        readStream.on("data", async (chunk) => {
                                            if (!writeStream.write(chunk, () => {
                                                totalExtractedSize += chunk.length;
                                                Updater.post("progress", totalExtractedSize / totalSize);
                                            })) readStream.pause();
                                        });

                                        readStream.on("end", () => {
                                            readStream.destroy();
                                            
                                            writeStream.end();
                                        });
                                        
                                        // Handle the 'finish' event to confirm the write is completed
                                        writeStream.on('finish', () => {
                                            writeStream.destroy();

                                            zipFile.readEntry();
                                        });
                                    });
                                } else zipFile.readEntry();
                            });

                            zipFile.on("close", () => {
                                resolve(true);
                            });

                            zipFile.on("error", (err) => {
                                console.error(err);
                                resolve(false);
                            });

                            zipFile.readEntry();
                        });
                    });

                    if (!success) return release;
                }

                // Delete package zip
                Updater.post("text", "Cleaning up ...");
                fs.unlinkSync(packagePath);

                // Relaunch
                Updater.app.relaunch({ args: process.argv.slice(1).concat(["--skip-launcher"]) });
                Updater.app.exit();

                return undefined;
            } catch (e) {
                console.error(e);
                Updater.post("console.error", `${e}`);
                return release;
            }
        });
    }

    // TODO(randomuserhi): Typescript template events - Front End as well
    static post(event: string, ...args: any[]): void {
        if (Updater.win === null) return;
        Updater.win.webContents.send(event, ...args);
    }

    private static isTrustedFrame(frame: Electron.WebFrameMain): boolean {
        if (Updater.win === null) return false;
        // NOTE(randomuserhi): This simply checks if the frame making the call is the same
        //                     as the loaded frame of the browser window.
        //                     This is potentially an issue if the main browser window loads 
        //                     an external unsafe URL since then this check doesn't work.
        //
        //                     For the use case of this application, the browser window should never
        //                     load an external URL so this check is fine.
        return frame === Updater.win.webContents.mainFrame;
    }

    static dispose() {
        // Clean up left over folders
        if (fs.existsSync(packagePath)) {
            fs.unlinkSync(packagePath);
        }

        // Clean up app events
        Updater.app.off("window-all-closed", Updater.onWindowAllClosed);
        Updater.app.off("ready", Updater.onReady);
    }

    static main(app: Electron.App): void {
        Updater.app = app;
        Updater.app.on("window-all-closed", Updater.onWindowAllClosed);
        if (Updater.app.isReady()) {
            Updater.onReady();
        } else {
            Updater.app.on("ready", Updater.onReady);
        }
    }
}