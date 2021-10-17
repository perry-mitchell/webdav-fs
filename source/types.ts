import type { CreateReadStreamOptions } from "webdav";

export type CallbackType<T> = (error: Error | null, obj?: T) => any;

export interface ExtCreateReadStreamOptions extends CreateReadStreamOptions {
    start?: number;
    end?: number;
}

export interface FsStat {
    isDirectory: () => boolean;
    isFile: () => boolean;
    mtime: number;
    name: string;
    size: number;
}

export type PathLike = string;
