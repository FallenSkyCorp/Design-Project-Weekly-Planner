import { App, TFile, TFolder } from "obsidian";
import { Point } from "./point";
import { createProjectPoint, getMarkdownsByPath, getNumberToUntitled, openMarkdownFile } from "src/markdown/markdownManager";
import { EventListenerTuple } from "src/types/eventListenerTuple";


export class Project{
    public folder: TFolder;
    public static cls: string[] = ["project-item", "base-item"];
    private parentEl: HTMLElement;
    private HTMLEl: HTMLElement;
    private pointContainer: HTMLElement;
    public points: Map<string, Point> = new Map<string, Point>();
    public mainPoint: TFile;
    private app: App;

    private listeners: EventListenerTuple[] = [];

    constructor(app: App, folder: TFolder, parentEl: HTMLElement){
      this.app = app;
      this.folder = folder;
      this.parentEl = parentEl; 
    }

    private renderPointList(): void{
      this.points.forEach((point: Point) => {
        point.remove();
      });
      this.pointContainer.empty()
      this.points.forEach((point: Point) => {
        point.render();
      });
    }

    public render(): void{
      this.HTMLEl = this.parentEl.createDiv({ cls: Project.cls});
      this.HTMLEl.createDiv({ text: this.folder.name, cls: "project-name"});
      this.pointContainer  = this.HTMLEl.createEl("ul", { cls: ["day-tasks-container"]});
      this.loadPoints();
      this.renderPointList();
      if (this.listeners.length){
        return
      }
      this.addEventListener("click", (ev: MouseEvent) => {
        void (async () => 
          {
            ev.preventDefault();
            await openMarkdownFile(this.mainPoint)
          }
        )();
      })
      this.addEventListener("contextmenu", (ev: MouseEvent) => {
        ev.preventDefault();
        void (async () => 
          {
            await this.createNewPoint()
          }
        )();
      });
      this.addEventListener("mousedown", (ev: MouseEvent) => {
        ev.preventDefault()
        void (async () => 
          {
            if (ev.button === 1){
              await this.delete()
            }
          }
        )();
      })
    }

    private async createNewPoint(){
      let baseName = "Untitled";
      const untitledFiles: TFile[] = getMarkdownsByPath(this.app.vault, this.folder.path, (f: TFile) => {return f.basename.contains(baseName)});
      if (untitledFiles.length < 1){
        baseName = "Untitled 1"
        const pointFile: TFile = await createProjectPoint(this.app.vault, this.folder.name, baseName)
        const point: Point = new Point(this.pointContainer, pointFile)
        this.addPoint(point)
        return;
      }
      
      const maxNumber = getNumberToUntitled(untitledFiles)

      baseName = `${baseName} ${maxNumber + 1}`
      const pointFile: TFile = await createProjectPoint(this.app.vault, this.folder.name, baseName)
      const point: Point = new Point(this.pointContainer, pointFile)
      this.addPoint(point)
    }
    public addPoint(point: Point){
      this.points.set(point.file.basename, point)
      point.render()
    }
    public addPointList(points: Point[]){
      points.forEach((p: Point) => this.points.set(p.file.basename, p))
      points.forEach((point: Point) => {
        point.render()
      });
    }
    public removePointByName(name: string): void{
      const p: Point | undefined = this.points.get(name)
      if(!p){
        return
      }
      p.remove()
      this.points.delete(name)
    }
    public removeAllPoints(): void{
      this.points.forEach((p: Point) => {
        p.remove()
      })
      this.points.clear()
    }
    public loadPoints(): void{
      const points = getMarkdownsByPath(this.app.vault, this.folder.path);
      points.map((p : TFile) => { 
        if (p.basename === this.folder.name){
          this.mainPoint = p;
        }
        else{
          return this.points.set(p.basename, new Point(this.pointContainer, p))
        }
      });
    }
    public remove(): void{
      this.removeAllEventListeners();
      this.removeAllPoints();
      this.HTMLEl.remove();
    }
    public async delete(): Promise<void>{
      await this.app.fileManager.trashFile(this.folder)
      this.remove()
    }

    public addEventListener(type: string, handler: EventListenerOrEventListenerObject): void {
        this.HTMLEl.addEventListener(type, handler);
        this.listeners.push([type, handler]);
        //console.log(`[EventManager] Подписано событие ${type} на элементе`, element);
    }

    public removeEventListener(type: string, handler: EventListenerOrEventListenerObject): void {
        const index = this.listeners.findIndex(
            ([t, h]) => t === type && h === handler
        );
        if (index !== -1) {
            const [t, h] = this.listeners[index];
            this.HTMLEl.removeEventListener(t, h);
            this.listeners.splice(index, 1);
            //console.log(`[EventManager] Отписано событие ${type} от элемента`, element);
        } else {
            console.warn(`[EventManager] Попытка отписки от несуществующего события ${type} на элементе`, this.HTMLEl);
        }
    }
    public removeAllEventListeners(): void {
        for (const [type, handler] of this.listeners) {
            try {
                this.HTMLEl.removeEventListener(type, handler);
                //console.log(`[EventManager] Отписано событие ${type} от элемента`, element);
            } catch (error) {
                console.error(`[EventManager] Ошибка при отписке события ${type} от элемента:`, error);
            }
        }
        this.listeners = []; // Очищаем список
        //console.log('[EventManager] Все события отменены.');
    }
}