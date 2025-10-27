import { App, TFile, TFolder, Vault } from "obsidian";
import { Project } from "./project";
import { createOrGetNote, createProject, createProjectPoint, getFolders, getNumberToUntitled } from "src/markdown/markdownManager";
import { EventListenerTuple } from "src/types/eventListenerTuple";

export class MockProject{
    private parentEl: HTMLElement;
    public HTMLEl: HTMLElement;
    private app: App;
    private listeners: EventListenerTuple[] = [];

    constructor (parentEl: HTMLElement, app: App){
        this.parentEl = parentEl;
        this.app = app;
    }

    public async createNewProject(): Promise<TFolder>{
      let baseName = "Untitled";
      const untitledFolders: TFolder[] = getFolders(this.app.vault, "project").filter((f: TFolder) => {return f.name.contains(baseName)});
      if (untitledFolders.length < 1){
        baseName = "Untitled 1"
        const projFolder: TFolder = await createProject(this.app.vault,  baseName);
        const mainFile: TFile | null = await createProjectPoint(this.app.vault, baseName, baseName); 
        return projFolder;
      }
      const maxNumber = getNumberToUntitled(untitledFolders)
       
      baseName = `${baseName} ${maxNumber + 1}`
      const projFolder: TFolder = await createProject(this.app.vault,  baseName);
      const mainFile: TFile | null = await createProjectPoint(this.app.vault, baseName, baseName); 
      return projFolder;
    }

    public render(): void{
        this.HTMLEl = this.parentEl.createDiv({ cls: Project.cls});
        this.HTMLEl.createDiv({ text: "+", cls: "mock-project-item"})
    }
    public remove(): void{
        this.removeAllEventListeners()
        this.HTMLEl.remove()
    }

    public addEventListener(type: string, handler: EventListenerOrEventListenerObject): void {
        this.HTMLEl.addEventListener(type, handler);
        this.listeners.push([type, handler]);
    }

    public removeEventListener(type: string, handler: EventListenerOrEventListenerObject): void {
        const index = this.listeners.findIndex(
            ([t, h]) => t === type && h === handler
        );
        if (index !== -1) {
            const [t, h] = this.listeners[index];
            this.HTMLEl.removeEventListener(t, h);
            this.listeners.splice(index, 1);
        } else {
            console.warn(`Попытка отписки от несуществующего события ${type} на элементе`, this.HTMLEl);
        }
    }
    public removeAllEventListeners(): void {
        for (const [type, handler] of this.listeners) {
            try {
                this.HTMLEl.removeEventListener(type, handler);
            } catch (error) {
                console.error(`Ошибка при отписке события ${type} от элемента:`, error);
            }
        }
        this.listeners = []; 
    }
}