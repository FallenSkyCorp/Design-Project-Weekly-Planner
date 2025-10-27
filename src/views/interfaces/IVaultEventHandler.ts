import { TAbstractFile } from "obsidian";

export interface IVaultEventHandler{
    vaultOnCreate(file: TAbstractFile): Promise<void>;
    vaultOnRename(file: TAbstractFile, oldPath: string): Promise<void>;
    vaultOnModify(file: TAbstractFile): Promise<void>;
    vaultOnDelete(file: TAbstractFile): Promise<void>;
}