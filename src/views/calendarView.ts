import { ItemView, WorkspaceLeaf, TFile, TAbstractFile } from "obsidian";

import { DAY_NAMES } from "src/constants/constants"
import { NavigationHeader } from "src/components/navigation/navigationHeader";
import KleinPlugin from "main";
import { MonthSection } from "src/components/monthSection/monthSection";
import { IVaultEventHandler } from "./interfaces/IVaultEventHandler";
import { DayTaskContainer } from "src/components/dayTasks/dayTaskContainer";
import { DayTask } from "src/components/dayTasks/dayTask";
import { checkIsCompleteStatus, getFrontmatter } from "src/markdown/markdownManager";
import { MAIN_PAGE_VIEW_TYPE } from "./mainPageView";

export const CALENDAR_VIEW_TYPE = "calendar-view";

export class CalendarView extends ItemView implements IVaultEventHandler{
  private plugin: KleinPlugin
  private date: Date;
  private monthSection: MonthSection;
  private header: NavigationHeader;
  

  constructor(leaf: WorkspaceLeaf, plugin: KleinPlugin) {
    super(leaf);
    this.plugin = plugin
    this.date = new Date();
  }

  getViewType(): string {
    return CALENDAR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Calendar";
  }

  async onOpen(): Promise<void> {
    this.plugin.setView(this.getViewType(), this)

    this.contentEl.empty();
    this.contentEl.addClasses(["calendar-container", "workspace-background"]);

    const calendar = this.contentEl.createDiv("calendar");
    
    // Заголовок с навигацией

    this.header = new NavigationHeader(calendar, "month", true)
    this.header.render()

    const weekDaysContainer = calendar.createDiv("days-grid")
    DAY_NAMES.forEach((dayName: string) => {
      const dayContainer = weekDaysContainer.createDiv({cls: ["date-week-container"]})
      dayContainer.createDiv({ text: dayName })
    })
    
    this.monthSection = new MonthSection(this.app, calendar)
    this.monthSection.render()
    this.monthSection.renderMonth(this.date)
    
    this.registerDomEvent(this.header.prevButton, "click", (ev: MouseEvent) => {
      ev.preventDefault()
      this.date.setMonth(this.date.getMonth() - 1);
      this.onMonthChange(this.date)
      this.header.editMonthDate(this.date)
    })
      this.registerDomEvent(this.header.todayButton, "click", (ev: MouseEvent) => {
      ev.preventDefault()
      this.date = new Date()
      this.onMonthChange(this.date)
    })
    this.registerDomEvent(this.header.nextButton, "click", (ev: MouseEvent) => {
      ev.preventDefault()
      this.date.setMonth(this.date.getMonth() + 1);
      this.onMonthChange(this.date)
      this.header.editMonthDate(this.date)
    })
    this.registerDomEvent(this.header.details, "click", async (ev: MouseEvent) => {
        ev.preventDefault();
        await this.plugin.activateView(MAIN_PAGE_VIEW_TYPE)
    });
  }
  async onClose(): Promise<void> {
    this.plugin.deleteView(this.getViewType());
  }

  private onMonthChange(date: Date): void{
    this.monthSection.renderMonth(date);
  }


  public vaultOnCreate(file: TAbstractFile): void {
    if (!(file instanceof TFile) || file.extension !== "md"){
      return
    }
    if (file.path.contains("day")){
      for (const [k, dayTaskContainer] of this.monthSection.ElMap){
        if(file.path.contains(dayTaskContainer.date.toISOString().split("T")[0].split("-").reverse().join("-"))){
          if(!dayTaskContainer.ElMap.get(file.basename)){
            dayTaskContainer.addElement(new DayTask(this.app, checkIsCompleteStatus(this.app, file), dayTaskContainer.dayTasksContainer, file))
          }
        }
      }
    }
  }
  public vaultOnRename(file: TAbstractFile, oldPath: string): void {
    if (file instanceof TFile){
      this.monthSection.ElMap.forEach((container: DayTaskContainer) => {
      container.ElMap.forEach((t: DayTask) => {
      if (t.file.stat.ctime === file.stat.ctime){
          t.updateTitle(file.basename)
      }
    })
    })}
  }
  public async vaultOnModify(file: TAbstractFile): Promise<void> {
    if (!file || !(file instanceof TFile) || file.extension !== 'md') {
       console.warn("Указан недопустимый файл или файл не является markdown.");
       return;
    }
    const frontmatter = await getFrontmatter(this.app, file)
    if (!frontmatter){
      return
    }
    
    this.monthSection.ElMap.forEach((container: DayTaskContainer) => {
      container.ElMap.forEach((task) => {
        if (task?.file.stat.ctime === file.stat.ctime){
        if (frontmatter.CHECK){
          if (task.HTMLEl.classList.contains("is-complete")){
            return
          }
          else{
            task.HTMLEl.addClass("is-complete")
          }
        }
        else if (!frontmatter.CHECK){
          if (task.HTMLEl.classList.contains("is-complete")){
            task.HTMLEl.removeClass("is-complete")
          }
          else{
            return
          }
        }
      }
      })
    })
  }
  public vaultOnDelete(file: TAbstractFile): void {
    if (!(file instanceof TFile)){
      return
    }
    this.monthSection.ElMap.forEach((container) => {
      const task = container.ElMap.get(file.basename)
      if(task && task.file.stat.ctime === file.stat.ctime){
        container.removeElement(task.file.basename)
      }
    })
  }
}