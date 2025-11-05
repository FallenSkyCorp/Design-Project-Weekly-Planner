import { TAbstractFile } from "obsidian";

export interface IVaultEventHandler{
    vaultOnCreate(file: TAbstractFile): void | Promise<void>;
    vaultOnRename(file: TAbstractFile, oldPath: string): void | Promise<void>;
    vaultOnModify(file: TAbstractFile): void | Promise<void>;
    vaultOnDelete(file: TAbstractFile): void | Promise<void>;
}