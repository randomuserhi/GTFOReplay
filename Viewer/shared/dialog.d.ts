export interface DialogRequest {
    id: string;
    kind: 'open' | 'folder' | 'save' | 'confirm';
    path: string;
    extensions?: string[];
    title?: string;
    message?: string;
    accept?: string;
}
export interface DirectoryListing {
    path: string; parent: string;
    entries: { name: string; path: string; directory: boolean }[];
    locations: { name: string; path: string }[];
}
