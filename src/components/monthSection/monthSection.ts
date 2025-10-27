import { EventListenerTuple } from "src/types/eventListenerTuple";
import { TargetEventListenerTuple } from "src/types/targetEventListenerTuple";
import { BaseSection } from "../abstracts/baseSection";
import { DayTask } from "../dayTasks/dayTask";
import { IEventListener } from "../interfaces/IEventListener";
import { DayTaskContainer } from "../dayTasks/dayTaskContainer";
import { checkIsCompleteStatus, getDateFromFrontMatter, getMarkdownsByDate, getMarkdownsByType } from "src/markdown/markdownManager";
import { App, TFile } from "obsidian";


export class MonthSection extends BaseSection<DayTaskContainer> implements IEventListener{
    private app: App;
    private selectedDay: HTMLElement;
    listeners: TargetEventListenerTuple[] = [];

    constructor (app: App, parentEl: HTMLElement) {
        super(parentEl)
        this.app = app;
    }

    private setDayStyles(dayEl: HTMLElement, dayDate: Date){
      const today = new Date();

      if (dayDate.getMonth() !== today.getMonth()){
        dayEl.addClass("calendar-other-month")
      }
      if (dayDate.getDate() === today.getDate() &&
          dayDate.getMonth() === today.getMonth()&&
          dayDate.getFullYear() === today.getFullYear()
          ){
        dayEl.addClass("calendar-today")
        dayEl.addClass("selected-day")
        this.selectedDay = dayEl
      }
    }

    private async getCurrentDateMarkdowns(day: Date): Promise<TFile[]>{
      const currentDateMarkdowns: TFile[] | [] = await getMarkdownsByDate(this.app.vault, "day", day)
      return currentDateMarkdowns;
    }

    private selectDayHandler(el: DayTaskContainer){
      this.selectedDay.removeClass("selected-day");
      this.selectedDay = el.HTMLEl;
      this.selectedDay.addClass("selected-day")
    }

    addEventListener(type: string, handler: EventListenerOrEventListenerObject): void{
      return
    }
    addTargetEventListener(el: HTMLElement, type: string, handler: EventListenerOrEventListenerObject): void{
      if (this.listeners.contains([el, type, handler])){
          return
        }
        el.addEventListener(type, handler);
        this.listeners.push([el, type, handler]);
    }
    removeAllEventListeners(): void {
      for (const [targetEl, type, handler] of this.listeners) {
          try {
              targetEl.removeEventListener(type, handler);
          } catch (error) {
              console.error(`Ошибка при отписке события ${type} от элемента:`, error);
          }
      }
      this.listeners = []; 
    }

    public render(): void {
        if (!this.HTMLEl){
            this.HTMLEl = this._parentEl.createEl("div", { cls: ["base-grid", "calendar-grid"] });
        }
    }

    public async renderMonth(date: Date): Promise<void>{
        this.removeAllElements()
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth(); // 0-11

        // Получаем первый день месяца и количество дней
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0-6 (воскресенье-суббота)

        const startDayOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); // Сколько дней отступить от 1-го
        const startDate = new Date(currentYear, currentMonth, 1 - startDayOffset);

        const allDays = 35;

        for (let i = 0; i < allDays; i++) { // 35 итераций
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i); // Прибавляем i дней

          const dayContainer: DayTaskContainer = new DayTaskContainer(this.app, this.HTMLEl, currentDate.getTime().toString(), currentDate, () => this.selectDayHandler(dayContainer))

          
          dayContainer.dateWeekContainer.createDiv({ text: currentDate.getDate().toString()})

          this.setDayStyles(dayContainer.dayContainer, currentDate)
          
          currentDate.setDate(currentDate.getDate() + 1);
          const files: TFile[] = await this.getCurrentDateMarkdowns(currentDate)

          const tasks = files.map((f) => {
            return new DayTask(this.app, checkIsCompleteStatus(this.app, f), dayContainer.dayTasksContainer, f)
          })
          dayContainer.addElemetList(tasks)
          dayContainer.renderElements()
          this.addElement(dayContainer)
      }
    }


    public empty(){
        this.removeAllElements()
        this.removeAllEventListeners()
        this.HTMLEl.empty()
    }
    public renderElements(): void {
      return
    }
    public addElement(el: DayTaskContainer): void {
        this.ElMap.set(el.dayOfWeek, el);
        el.render()
    }
    public addElemetList(elements: DayTaskContainer[]): void {
        for (const t of elements){
          this.ElMap.set(t.dayOfWeek, t);
        }
    }
    public removeElement(elName: string): void {
        const el = this.ElMap.get(elName)
        el?.remove()
        this.ElMap.delete(elName);
    }
    public removeAllElements(): void {
        this.ElMap.forEach((t: DayTaskContainer) => {
          t.remove()
        })
        this.ElMap.clear()
        this.HTMLEl.empty()
    }
    public delete(): void {
      this.removeAllEventListeners()
      this.removeAllElements()
      this.HTMLEl.remove()
    }
}