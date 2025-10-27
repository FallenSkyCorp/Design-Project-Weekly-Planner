import { App, TFile } from "obsidian";
import { checkIsCompleteStatus, getMarkdownsByDate, getMarkdownsByPath, getWeekMarkdowns } from "src/markdown/markdownManager";
import { prepareDateForFolder, prepareDateForWeekFolder } from "src/views/utilFunctions/dateUtils";
import { WeekTask } from "./weekTask";
import { BaseSection } from "../abstracts/baseSection";


export class WeekTasksSection extends BaseSection<WeekTask>{
  public weekTasksContainer: HTMLElement;
  private app: App;

  public prevButton: HTMLElement; 
  public nextButton: HTMLElement;

  public addWeekTaskBtn: HTMLElement;

  constructor(app: App, parentEl: HTMLElement) {
      super(parentEl)
      this.app = app
      this.renderWeekTasksContainer()
      this.renderAddWeekTaskBtn()
  }

  public async render(): Promise<void>{
    this.renderWeekTasksContainer()
    await this.renderElements();
    this.renderAddWeekTaskBtn();
  }
  
  public renderWeekTasksContainer(): void{
    if (!this.HTMLEl){
      this.HTMLEl= this._parentEl.createDiv({ cls: "base-container"});
    }
    else{
      this.HTMLEl.empty()
    }
    const weekTasksTextContainer = this.HTMLEl.createDiv({ cls: "week-task-text-container"})
    const weekTaskText = weekTasksTextContainer.createDiv({ text: "WEEK TASKS", cls: "week-task-text"})
    this.weekTasksContainer = this.HTMLEl.createEl("ul")
  }


  public async renderElements(): Promise<void>{
    for (const [k, task] of this.ElMap){
      await task.render();
    }
  }
  
  private renderAddWeekTaskBtn(): HTMLElement{
    this.addWeekTaskBtn = this.HTMLEl.createEl("button", { text: "+", cls: "add-week-task-btn"});
    return this.addWeekTaskBtn;
  }

  public async addElement(task: WeekTask): Promise<void>{
    this.ElMap.set(task.file.basename, task);
    await task.render();
  }
  public async addElemetList(tasks: WeekTask[]): Promise<void>{
    for (const t of tasks){
      this.ElMap.set(t.file.basename, t);
      await t.render()
    }
  }
  public removeElement(taskName: string): void{
    const t: WeekTask | undefined = this.ElMap.get(taskName);
    t?.remove()
    this.ElMap.delete(taskName);
  }
  public removeAllElements(): void{
    this.ElMap.forEach((t: WeekTask) => t.remove())
    this.ElMap.clear();
  }

  public async loadWeekTasks(startDay: Date, endDay: Date): Promise<void>{
    if(!this.addWeekTaskBtn){
      await this.render()
    }
    this.removeAllElements();
    this.weekTasksContainer.empty()
    const weekFolderPath:string = prepareDateForWeekFolder(startDay, endDay);
    const weekTaskMd: TFile[] = await getWeekMarkdowns(this.app.vault, weekFolderPath)
    const weekTaskArray: WeekTask[]  = weekTaskMd.map((md: TFile) => {
      const t = new WeekTask(this.app, checkIsCompleteStatus(this.app, md), this.weekTasksContainer, md)
      return t;
    });
          
    await this.addElemetList(weekTaskArray)
  }
  public delete(): void {
    this.removeAllElements()
    this.HTMLEl.remove()
  }
}