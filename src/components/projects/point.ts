import { TFile } from "obsidian";
import { EventListenerTuple } from "src/types/eventListenerTuple";
import { openMarkdownFile } from "src/markdown/markdownManager";
import { BasePoint } from "../abstracts/basePoint";


export class Point extends BasePoint{
    private static cls: string[] = ["point-item", "base-item"];

    constructor (parentEl: HTMLElement, file: TFile){
      super(parentEl, file)
    }

    public async render(): Promise<void>{
      this.HTMLEl = this._parentEl.createEl("li", { text: this.file.basename, cls: Point.cls})
      this.addEventListener("click", async (ev: MouseEvent) => {
            ev.stopPropagation()
            ev.preventDefault();
            await openMarkdownFile(this.file)
      })
      this.addEventListener("mousedown", async (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()
        await this.handleDelete(ev);
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

    public remove(): void{
      this.removeAllEventListeners()
      this.HTMLEl?.remove()
    }

    public updateTitle(text: string): void {
        this.HTMLEl.setText(text)
    }
}