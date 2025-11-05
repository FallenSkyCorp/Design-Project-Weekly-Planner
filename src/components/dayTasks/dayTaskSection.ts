import { BaseSection } from "../abstracts/baseSection";
import { DayTaskContainer } from "./dayTaskContainer";


export class DayTaskSection extends BaseSection<DayTaskContainer>{

    constructor (parentEl: HTMLElement){
      super(parentEl);
    }

    public render(): void {
        if (!this.HTMLEl){
            this.HTMLEl = this._parentEl.createEl("div", { cls: "base-grid" })
        }
    }
    public empty(){
        this.removeAllElements()
        this.HTMLEl.empty()
    }
    public async renderElements(): Promise<void> {
      if (!this.HTMLEl){
        this.HTMLEl = this._parentEl.createEl("ul", "day-tasks-container")
      }
      for (const [key, value] of this.ElMap){
        value.render()
      }
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
    public delete(): void{
      this.removeAllElements()
      this.HTMLEl.remove()
    }
}