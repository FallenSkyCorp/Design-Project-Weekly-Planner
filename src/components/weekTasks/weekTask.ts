
import { App, TFile } from "obsidian";
import { changeIsCompleteStatus, openMarkdownFile, removeFrontmatter } from "src/markdown/markdownManager";
import { BasePoint } from "../abstracts/basePoint";


export class WeekTask extends BasePoint{
  private static cls: string[] = ["week-task-item", "base-item"];
  private app: App;

  public isComplete: boolean = false;

  private taskDesc: HTMLElement;
  private taskName: HTMLElement;

  constructor(app: App, isComplete: boolean, parentEl: HTMLElement, file: TFile) {
    super(parentEl, file);
    this.app = app
    this.isComplete = isComplete
  }

  public async render(): Promise<void>{
    const addButton = this._parentEl.lastElementChild
    this.HTMLEl?.remove()
    this.HTMLEl = this._parentEl.createEl("li", { cls: WeekTask.cls});
    if (this.isComplete){
      this.HTMLEl.addClass("is-complete")
    }
    this.taskName = this.HTMLEl.createDiv({ text: `${this.file.basename}`, cls: "task-name"});
    this.taskDesc = this.HTMLEl.createDiv({ text: await removeFrontmatter(this.app, this.file), cls: "task-description"});
    this._parentEl.insertBefore(this.HTMLEl, addButton)
    this.addEventListener("mousedown", async (ev: MouseEvent) => {
      ev.preventDefault();
      await this.handleDelete(ev);
    })
    this.addEventListener("click", async (ev: MouseEvent) => {
      ev.preventDefault();
      await openMarkdownFile(this.file);
    });
    this.addEventListener("contextmenu", async (ev: MouseEvent) => {
      ev.preventDefault();
      const isComplete: boolean = await changeIsCompleteStatus(this.app, this.file)
      const taskEl: HTMLElement = this.HTMLEl
      if (isComplete) {
        taskEl.addClass("is-complete")
      }
      else{
        taskEl.removeClass("is-complete")
      }
    })
  }

  private async handleDelete(ev: MouseEvent){
    if (ev.button === 1){
      await this.delete()
    }
  }

  public async delete(): Promise<void> {
    await this.file.vault.delete(this.file, true);
    this.remove()
  }

  public setIsComplete(newVal: boolean){
    this.isComplete = newVal;
    if (this.isComplete){
      this.HTMLEl?.addClass("is-complete")
    }
    else{
      this.HTMLEl?.removeClass("is-complete")
    }
  }

  public async updateTitle(newFileName: string): Promise<void>{
    this.taskName.textContent = newFileName;
  }
  public async updateDescription(): Promise<void>{
    const taskText: string = await removeFrontmatter(this.app, this.file);
    this.taskDesc.textContent = taskText;
  }
}