import { App, TFolder } from "obsidian";
import { Project } from "./project";
import { MockProject } from "./mockProject";
import { getNextButton, getPrevButton } from "../navigation/navigationElements";


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
  public handleNextClick(): void {
    this.startIndex = this.startIndex + this.DISPLAY_COUNT;
    this.updateDisplay();
  }

  public updateDisplay() {
    if (!this.HTMLEl) return;

    this.deleteMockProjects()
    this.projects.forEach((p) => p.removeAllEventListeners())

    // Получаем текущую страницу элементов
    const currentItems = this.projects.slice(this.startIndex, this.startIndex + this.DISPLAY_COUNT);

    // Очищаем текущую область отображения
    this.container.empty(); // Используем метод Obsidian для очистки
    // Создаем и добавляем элементы для текущей страницы
    currentItems.forEach((p: Project) => {
        p.render()
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

    this.container = this.HTMLEl.createEl("div", { cls: "base-grid"})
  }


  private renderMockProject(): void{ 
    const mockProj = new MockProject(this.container, this.app)
    this.mockProjects.push(mockProj)
    mockProj.render()
    mockProj.addEventListener("click", (ev: MouseEvent) => {
      ev.preventDefault();
      void (async () => 
        {
          const projFolder: TFolder = await mockProj.createNewProject();
          this.addNewProject(new Project(this.app, projFolder, this.container));
          this.updateDisplay();
        }
      )(); 
    })
  }
  public deleteMockProjects(): void{
    this.mockProjects?.forEach((p : MockProject) => p?.remove())
  }
  public addNewProject(proj: Project): void{
    this.projects.push(proj);
  }
  public addProjectList(projects: Project[]): void{
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