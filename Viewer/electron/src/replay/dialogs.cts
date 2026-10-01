import { app, type IpcMain, type WebContents } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DialogRequest, DirectoryListing } from '../../../shared/dialog.js';

export class AppDialogs {
    private pending = new Map<string, { sender: WebContents; request: DialogRequest; resolve: (value: string | undefined) => void }>();
    constructor(ipc: IpcMain) {
        const owned = (sender: WebContents, id: string) => {
            const task = this.pending.get(id);
            if (!task || task.sender !== sender) throw new Error('This dialog is no longer active.');
            return task;
        };
        ipc.handle('browseAppDialog', async (event, id: string, directory: string): Promise<DirectoryListing> => {
            const { request } = owned(event.sender, id);
            if (request.kind === 'confirm') throw new Error('This dialog does not browse files.');
            if (typeof directory !== 'string' || !path.isAbsolute(directory)) throw new Error('Enter an absolute folder path.');
            directory = await fs.realpath(directory);
            const entries = (await fs.readdir(directory, { withFileTypes: true }))
                .filter(item => item.isDirectory() || (request.kind !== 'folder' && item.isFile() && request.extensions?.includes(path.extname(item.name).slice(1).toLowerCase())))
                .map(item => ({ name: item.name, path: path.join(directory, item.name), directory: item.isDirectory() }))
                .sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name));
            const locations = [{ name: 'home', path: app.getPath('home') }, { name: 'downloads', path: app.getPath('downloads') }];
            if (process.platform === 'win32') {
                const drives = await Promise.all('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(async letter => {
                    const drive = `${letter}:\\`;
                    try { await fs.access(drive); return { name: drive, path: drive }; } catch { return undefined; }
                }));
                locations.push(...drives.filter((drive): drive is { name: string; path: string } => !!drive));
            }
            return { path: directory, parent: path.dirname(directory), entries, locations };
        });
        ipc.handle('completeAppDialog', async (event, id: string, selected?: string, overwrite = false) => {
            const task = owned(event.sender, id);
            if (selected !== undefined) {
                if (task.request.kind === 'confirm') {
                    if (selected !== 'confirm') throw new Error('Invalid confirmation.');
                } else {
                    if (typeof selected !== 'string' || !path.isAbsolute(selected)) throw new Error('Choose an absolute path.');
                    selected = path.resolve(selected);
                    if (task.request.kind !== 'folder' && !task.request.extensions?.includes(path.extname(selected).slice(1).toLowerCase())) throw new Error('Choose a file with the requested extension.');
                    if (task.request.kind === 'save') {
                        await fs.access(path.dirname(selected));
                        const exists = await fs.stat(selected).catch(error => { if (error.code !== 'ENOENT') throw error; return undefined; });
                        if (exists?.isDirectory()) throw new Error('Choose a file name, not a folder.');
                        if (exists && !overwrite) return { overwrite: true };
                    } else {
                        const stat = await fs.stat(selected);
                        if (task.request.kind === 'folder' ? !stat.isDirectory() : !stat.isFile()) throw new Error('The selected path is not the expected file type.');
                    }
                }
            }
            this.pending.delete(id); task.resolve(selected); return { overwrite: false };
        });
    }
    async request(sender: WebContents, input: Omit<DialogRequest, 'id' | 'path'> & { path?: string }): Promise<string | undefined> {
        if ([...this.pending.values()].some(task => task.sender === sender)) throw new Error('Finish the current dialog first.');
        let initial = input.path ?? app.getPath('downloads');
        if (!path.isAbsolute(initial)) initial = path.join(app.getPath('downloads'), initial);
        const request = { ...input, path: initial, id: randomUUID() };
        return new Promise(resolve => {
            const cancel = () => { this.pending.delete(request.id); sender.removeListener("destroyed", cancel); sender.removeListener("did-start-navigation", cancel); resolve(undefined); };
            this.pending.set(request.id, { sender, request, resolve: value => { sender.removeListener('destroyed', cancel); sender.removeListener('did-start-navigation', cancel); resolve(value); } });
            sender.once('destroyed', cancel); sender.once('did-start-navigation', cancel);
            sender.send('appDialog', request);
        });
    }
}
