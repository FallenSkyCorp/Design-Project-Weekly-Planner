import { TargetEventListenerTuple } from "src/types/targetEventListenerTuple";
import { BaseSection } from "../abstracts/baseSection";
import { DayTask } from "./dayTask";
import { App, TFile } from "obsidian";
import { createOrGetNote } from "src/markdown/markdownManager";

export class DayTaskContainer extends BaseSection<DayTask>{
  public app: App;
  public dayOfWeek: string;
  public date: Date;
  private listeners: TargetEventListenerTuple[] = [];
  public dayContainer: HTMLElement;
  public dateWeekContainer: HTMLElement;
  public dayTasksContainer: HTMLElement;

  public selectedDateCallback: () => void;

  constructor(app: App, parentEl: HTMLElement, dayOfWeek: string, date: Date, selectedDateCallback: () => void) {
    super(parentEl)
    this.app = app
    this.dayOfWeek = dayOfWeek;
    this.selectedDateCallback = selectedDateCallback;
    this.date = date;

    this.render()
  }

  public render(): void{
    if (!this.HTMLEl){
      this.HTMLEl = this._parentEl.createEl("div", "cell")
      this.dayContainer = this.HTMLEl.createDiv("day")
      this.dateWeekContainer = this.dayContainer.createDiv("date-week-container")
      this.dayTasksContainer = this.dayContainer.createEl("ul", "day-tasks-container")
    }
    this.addEventListener(this.HTMLEl, "click", (ev: MouseEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      this.selectedDateCallback()
    })

    this.addEventListener(this.dayContainer, "contextmenu", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      void (async () => 
        {
          const task: TFile | null = await createOrGetNote(this.app, "day", "", this.date)
          if (!task){
            return
          }
        }
      )();
    })
  }

  public renderElements(): void{
    if (!this.HTMLEl){
      this.render()
    }

    for (const [key, value] of this.ElMap){
      value.render()
    }
  }

  public addElement(task: DayTask): void{
    this.ElMap.set(task.file.basename, task);
    task.render()
  }
  public addElemetList(tasks: DayTask[]): void{
    for (const t of tasks){
      this.ElMap.set(t.file.basename, t);
    }
  }
  public removeElement(taskName: string): void{
    const el = this.ElMap.get(taskName)
    el?.remove()
    this.ElMap.delete(taskName);
  }
  public removeAllElements(): void{
    this.HTMLEl.empty()
    this.ElMap.forEach((t: DayTask) => {
      t.remove()
    })
    this.ElMap.clear()
  }
  public remove(): void{
    this.removeAllElements()
    this.removeAllEventListeners()
    this.HTMLEl.remove()
  }
  public delete(): void {
    this.remove()
  }

  public addEventListener(targetEl: HTMLElement, type: string, handler: EventListenerOrEventListenerObject): void {
    if(this.listeners.find((listener: TargetEventListenerTuple) => {
      return listener[1] === type
    }))
    targetEl.addEventListener(type, handler);
    this.listeners.push([targetEl, type, handler]);
  }
  public removeAllEventListeners(): void {
      for (const [targetEl, type, handler] of this.listeners) {
          try {
              targetEl.removeEventListener(type, handler);
          } catch (error) {
              console.error(`Ошибка при отписке события ${type} от элемента:`, error);
          }
      }
      this.listeners = []; 
  }
}