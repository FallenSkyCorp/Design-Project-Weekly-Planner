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
    this.addEventListener("mousedown", (ev: MouseEvent) => { 
      ev.preventDefault()
      void (async () => 
        {
          await this.handleDelete(ev)
        }
      )();
    });
    this.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      void (async () => 
        {
          await openMarkdownFile(this.file)
        }
      )();
    })
    this.addEventListener("contextmenu", (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      void (async () => 
        {
          const isComplete: boolean = await changeIsCompleteStatus(this.app, this.file)
          this.setIsComplete(isComplete);
        }
      )();
      
    })
  }

  private async handleDelete(ev: MouseEvent){
    if (ev.button === 1){
      await this.delete()
    }
  }

  public async delete(): Promise<void> {
    await this.app.fileManager.trashFile(this.file)
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

  public updateTitle(newText: string): void{
    this.HTMLEl.setText(newText)
  }
}