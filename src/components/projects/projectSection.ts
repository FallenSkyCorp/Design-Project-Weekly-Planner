import { App, Component, TFolder, Vault } from "obsidian";
import { Project } from "./project";
import { MockProject } from "./mockProject";
import { getFolders } from "src/markdown/markdownManager";
import { getNextButton, getPrevButton } from "../navigation/navigationElements";
import { NavigationHeader } from "../navigation/navigationHeader";


export class ProjectSection{
  private readonly DISPLAY_COUNT: number;
  private startIndex: number = 0;
  private parentEl: HTMLElement;
  private HTMLEl: HTMLElement;
  public container: HTMLElement;
  private app: App;

  public projects: Project[] = [];
  private mockProjects: MockProject[] = [];

  public prevButton: HTMLElement; 
  public nextButton: HTMLElement;

  public addProjectBtn: HTMLElement;

  constructor(app: App, parentEl: HTMLElement, displayCount: number) {
    this.app = app
    this.parentEl = parentEl;
    this.DISPLAY_COUNT = displayCount;
    this.render()
  }
  public handlePrevClick(): void{
    if (this.startIndex > 0) {
      this.startIndex = Math.max(0, this.startIndex - this.DISPLAY_COUNT);
      this.updateDisplay();
    }
  }
  public handleNextClick() {
    this.startIndex = this.startIndex + this.DISPLAY_COUNT;
    this.updateDisplay();
  }

  public async updateDisplay() {
    if (!this.HTMLEl) return;

    this.deleteMockProjects()
    this.projects.forEach((p) => p.removeAllEventListeners())

    // Получаем текущую страницу элементов
    const currentItems = this.projects.slice(this.startIndex, this.startIndex + this.DISPLAY_COUNT);

    // Очищаем текущую область отображения
    this.container.empty(); // Используем метод Obsidian для очистки
    // Создаем и добавляем элементы для текущей страницы
    currentItems.forEach(async (p: Project) => {
      await p.render()
    });
    let mockProjectToDisplay = this.DISPLAY_COUNT - currentItems.length;
  
    for (let i = 0; i < mockProjectToDisplay; i++){
      this.renderMockProject()
    }
  }

  private render(): void{
    this.HTMLEl = this.parentEl.createDiv({ cls: "base-container"})
    const ProjectTextContainer = this.HTMLEl.createDiv("week-task-text-container")
    const projectText = ProjectTextContainer.createDiv({ text: "PROJECT", cls: "week-task-text"})

    const actionsMenu = ProjectTextContainer.createDiv("actions-menu")
    actionsMenu.createDiv()
    const btnContainer = actionsMenu.createDiv("btn-container")


    this.prevButton = getPrevButton(btnContainer)
    this.nextButton = getNextButton(btnContainer)
    this.prevButton.style.marginRight = "1vw"

    this.container = this.HTMLEl.createEl("div", { cls: "base-grid"})
  }


  private async renderMockProject(): Promise<void>{ 
    const mockProj = new MockProject(this.container, this.app)
    this.mockProjects.push(mockProj)
    mockProj.render()
    mockProj.addEventListener("click", async (ev: MouseEvent) => {
      ev.preventDefault();
      const projFolder: TFolder = await mockProj.createNewProject();
      await this.addNewProject(new Project(this.app, projFolder, this.container));
      await this.updateDisplay();
    })
  }
  public deleteMockProjects(): void{
    this.mockProjects?.forEach((p : MockProject) => p?.remove())
  }
  public async addNewProject(proj: Project): Promise<void>{
    this.projects.push(proj);
  }
  public async addProjectList(projects: Project[]): Promise<void>{
    for (const p of projects){
      this.projects.push(p);
    }
  }
  public removeProject(proj: Project): void{
    const index: number = this.projects.findIndex((p: Project) => p === proj)
    if (index === -1){
      return
    }
    this.projects[index].remove()
    this.projects.splice(index, 1)
  }
  public removeAllProject(): void{
    this.projects.forEach((p: Project) => {
      p.remove()
    })
  }
  public clearProjects(): void{
    this.HTMLEl.empty();
    this.projects = []
  }
  public delete(): void{
    this.deleteMockProjects()
    this.removeAllProject()
    this.HTMLEl.remove()
  }
}