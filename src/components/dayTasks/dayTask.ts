import { App, TFile } from "obsidian";
import { BasePoint } from "../abstracts/basePoint";
import { changeIsCompleteStatus, openMarkdownFile } from "src/markdown/markdownManager";

export class DayTask extends BasePoint{
  private static cls: string[] = ["day-task", "base-item"];
  private app;
  public isComplete: boolean = false;
  

  constructor(app: App, isComplete: boolean, parentEl: HTMLElement, file: TFile) {
    super(parentEl, file);
    this.app = app;
    this.isComplete = isComplete;
  }

  public async render(): Promise<void>{
    if (this.HTMLEl){
      return
    }
    this.HTMLEl = this._parentEl.createEl("li", { text: this.file.basename, cls: DayTask.cls})
    if (this.isComplete){
      this.HTMLEl?.addClass("is-complete")
    }
    this.addEventListener("mousedown", async (ev: MouseEvent) => { 
      ev.preventDefault()
      await this.handleDelete(ev)
    })
    this.addEventListener("click", async (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      openMarkdownFile(this.file)
    })
    this.addEventListener("contextmenu", async (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      const isComplete: boolean = await changeIsCompleteStatus(this.app, this.file)
      this.setIsComplete(isComplete);
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

  public async updateTitle(newText: string): Promise<HTMLElement>{
    this.HTMLEl.setText(newText)
    return this.HTMLEl
  }
}