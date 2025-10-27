import { TFolder } from "obsidian";
import { LEFT_PANEL_ITEMS } from "src/constants/constants";

export class LeftPanel{
  private leftPanelItems: Array<string> = LEFT_PANEL_ITEMS;
  private parentEl: HTMLElement;
  private HTMLEl: HTMLElement;
  private leftPanelElements: HTMLElement[] = [];
  public activeEl: HTMLElement;
  public otherFoldersListEl: HTMLElement; 

  constructor(mainContainer: HTMLElement){
    this.parentEl = mainContainer;
  }
  private renderNavWithUl(): HTMLElement{
    if (!this.HTMLEl){
      throw new Error("LeftPanel отсутствует HTMLEl элемент")
    }
    const container = this.HTMLEl.createEl("nav", { cls: ["left-padd", "left-panel-container"]})
    
    const itemList = container.createEl("ul")
    return itemList
  }
  public renderLeftPanel(): HTMLElement{
    const existPanel: HTMLElement | null = this.parentEl.querySelector(".left-container")
    if (existPanel){
        this.HTMLEl = existPanel;
    }
    else{
      this.HTMLEl = this.parentEl.createDiv("left-container");
    }
    
    const marginDiv = this.HTMLEl.createDiv("margin-div");
    
    const itemList = this.renderNavWithUl()

    for (let i = 0; i < this.leftPanelItems.length; i++){
        this.leftPanelElements.push(itemList.createEl("li", { text: this.leftPanelItems[i], cls: "item"}))
    }
    this.leftPanelElements[0].addClass("item-active")
    this.activeEl = this.leftPanelElements[0]
    return this.HTMLEl
  }
  public renderOtherFolderList(otherFolders: TFolder[]): void{
    this.otherFoldersListEl = this.renderNavWithUl()
    
  }
  public getLeftPanelElements(): HTMLElement[]{
    return this.leftPanelElements;
  }
}