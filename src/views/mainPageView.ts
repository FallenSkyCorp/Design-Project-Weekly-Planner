import { ItemView,  TAbstractFile, TFile, TFolder,  WorkspaceLeaf } from "obsidian";

import { basePluginPath, DAY_NAMES,  } from "../constants/constants";
import { removeElementByClassName } from "src/views/utilFunctions/removeElementsUtilities"
import { changeIsCompleteStatus, checkIsCompleteStatus, createOrGetNote, getDateFromFrontMatter, getFolders, getFrontmatter, getMarkdownsByDate,  openMarkdownFile } from "../markdown/markdownManager";
import { NavigationHeader } from "src/components/navigation/navigationHeader";
import { WeekManager } from "../entities/weekManager";
import { WeekTasksSection } from "src/components/weekTasks/weekTaskSection";
import { DayTaskContainer } from "src/components/dayTasks/dayTaskContainer";
import { DayTask } from "src/components/dayTasks/dayTask";
import { fromDateToSlashDate } from "./utilFunctions/dateUtils";
import { WeekTask } from "src/components/weekTasks/weekTask";
import { ProjectSection } from "src/components/projects/projectSection";
import { Project } from "src/components/projects/project";
import { DayTaskSection } from "src/components/dayTasks/dayTaskSection";
import { createPluginFoldersAndFiles } from "src/markdown/templatesBuilder";
import { getLinksFromContent } from "src/markdown/projectMarkdowns";
import { symmetricDifference } from "./utilFunctions/arrayUtils";
import KleinPlugin from "main";
import { CALENDAR_VIEW_TYPE } from "./calendarView";
import { IVaultEventHandler } from "./interfaces/IVaultEventHandler";

//const log = console.log

export const MAIN_PAGE_VIEW_TYPE = "main-page-view"

export class MainPageView extends ItemView implements IVaultEventHandler {
    private plugin: KleinPlugin;

    private currentYear: number;
    private currentMonth: number;
    private weekManager: WeekManager;
    private selectedDay: HTMLElement;
    private header: NavigationHeader;
    private dayTaskSection: DayTaskSection;
    private weekTasksSection: WeekTasksSection;
    private projectSection: ProjectSection;

    constructor(leaf: WorkspaceLeaf, plugin: KleinPlugin) {
        super(leaf);
        this.plugin = plugin;
        const today = new Date();
        this.currentYear = today.getFullYear();
        this.currentMonth = today.getMonth();
    }

    getViewType(): string {  return MAIN_PAGE_VIEW_TYPE;  }
    getDisplayText(): string {  return "Main page";  }

    async onOpen(): Promise<void> {
      this.plugin.setView(this.getViewType(), this)

      await createPluginFoldersAndFiles(this.app)
      this.contentEl.empty();
      this.contentEl.addClasses(["calendar-container", "main"]);

      removeElementByClassName(this.containerEl, "view-header")

      const calendar = this.contentEl.createDiv("calendar")

      // Заголовок с навигацией
      this.header = new NavigationHeader(calendar, "week", true)
      this.header.render()

      // Текущая неделя
      this.weekManager = new WeekManager();

      this.registerDomEvent(this.header.prevButton, "click", async (ev: MouseEvent) => {
        ev.preventDefault()
        this.weekManager.goToPreviousWeek()
        const week: Date[] = this.weekManager.getWeek()
        this.renderWeek(week)
        await this.weekTasksSection.loadWeekTasks(week[0], week[6])
      })
      this.registerDomEvent(this.header.todayButton, "click", async (ev: MouseEvent) => {
        ev.preventDefault()
        this.weekManager.goToCurrentDate()
        const week = this.weekManager.getWeek()
        this.renderWeek(week)
        await this.weekTasksSection.loadWeekTasks(week[0], week[6])
      })
      this.registerDomEvent(this.header.nextButton, "click", async (ev: MouseEvent) => {
        ev.preventDefault()
        this.weekManager.goToNextWeek()
        const week: Date[] = this.weekManager.getWeek()
        this.renderWeek(week)
        await this.weekTasksSection.loadWeekTasks(week[0], week[6])
      })
      this.registerDomEvent(this.header.details, "click", async (ev: MouseEvent) => {
        ev.preventDefault();
        await this.plugin.activateView(CALENDAR_VIEW_TYPE)
      });
      
      const calendarGridContainer = calendar.createDiv("base-container")

      this.dayTaskSection = new DayTaskSection(calendarGridContainer);
      this.dayTaskSection.render()

      const currWeek = this.renderWeek(this.weekManager.getWeek())

      // WEEK TASK
      this.weekTasksSection = new WeekTasksSection(this.app, calendar)
      await this.weekTasksSection.loadWeekTasks(this.weekManager.getWeek()[0], this.weekManager.getWeek()[6])


      for (const [k, t] of this.weekTasksSection.ElMap){
        const tHTML: HTMLElement = t.HTMLEl;
        this.registerDomEvent(tHTML, "click", async (ev: MouseEvent) => {
          ev.preventDefault();
          await openMarkdownFile(t.file);
        });
        this.registerDomEvent(t.HTMLEl, "contextmenu", async (ev: MouseEvent) => {
          ev.preventDefault();
          const isComplete: boolean = await changeIsCompleteStatus(this.app, t.file)
          const taskEl: HTMLElement = t.HTMLEl
          if (isComplete) {
            taskEl.addClass("is-complete")
          }
          else{
            taskEl.removeClass("is-complete")
          }
        })
      }

      this.registerDomEvent(this.weekTasksSection.addWeekTaskBtn, "click", async (ev: MouseEvent) => {
        ev.stopPropagation();
        const weekTask: TFile | null = await createOrGetNote(this.app, "week", "", this.weekManager.getCurrentDate())
        if (!weekTask){
          return
        }
        const t: WeekTask = new WeekTask(this.app, checkIsCompleteStatus(this.app, weekTask), this.weekTasksSection.weekTasksContainer, weekTask)
        await this.weekTasksSection.addElement(t)
      })


      this.projectSection = new ProjectSection(this.app, calendar, 7);
      const projectFolders: TFolder[] = getFolders(this.app.vault, "project")
      for (const f of projectFolders){
        const project: Project = new Project(this.app, f, this.projectSection.container);
        this.projectSection.addNewProject(project)
      }
      this.projectSection.updateDisplay()
      this.registerDomEvent(this.projectSection.prevButton, "click", (ev: MouseEvent) =>{
        ev.preventDefault();
        this.projectSection.handlePrevClick()
      });
      this.registerDomEvent(this.projectSection.nextButton, "click", (ev: MouseEvent) =>{
        ev.preventDefault();
        this.projectSection.handleNextClick()
      })
    }

    protected async onClose(): Promise<void> {
        this.plugin.deleteView(this.getViewType())  
        this.header?.remove()
        this.dayTaskSection?.delete()
        this.weekTasksSection?.delete()
        this.projectSection?.delete()
    }

    public async vaultOnCreate(file: TAbstractFile): Promise<void>{
        if (!(file instanceof TFile) || file.extension !== 'md') {
          return; // Пропускаем, если это не .md файл
        }
        if (file.path.contains("day")){
          this.dayTaskSection.ElMap.forEach((dayTaskContainer: DayTaskContainer) => {
            if(file.path.contains(dayTaskContainer.date.toISOString().split("T")[0].split("-").reverse().join("-"))){
              if(!dayTaskContainer.ElMap.get(file.basename)){
                dayTaskContainer.addElement(new DayTask(this.app, checkIsCompleteStatus(this.app, file), dayTaskContainer.dayTasksContainer, file))
              }
            }
          })
        }
        const projectFolders = file.parent?.parent;
        const parentFolder = file.parent;
        if (!projectFolders || !(projectFolders instanceof TFolder)) {
          return; // Файл не в папке или в корне хранилища
        }
        // --- Вариант A: Строгое совпадение имени папки ---
        if (projectFolders.name !== "project") {
          return; // Файл не в целевой папке
        }
        if (file.basename === parentFolder?.name){
          return;
        }
        const writeFile = parentFolder?.children.filter((f: TAbstractFile) => {
          if (f instanceof TFile){
            return f.basename === parentFolder.name
          }
          return false
        })[0];
        if (!writeFile || !(writeFile instanceof TFile)){
          return;
        }
        const link = `- [[${file.basename}]]`
        const targetContent = await this.app.vault.read(writeFile)
        if (targetContent.includes(link)) {
            return; // Пропускаем, если ссылка уже есть
        }
        const newContent = targetContent + (targetContent ? '\n' : '') + link; // Может искать последнюю ссылку

        // 10. Записываем обновленное содержимое обратно
        try {
            await this.app.vault.modify(writeFile, newContent);
        } catch (error) {
            console.error(`[AutoLinkNewFile] Ошибка при записи в целевой файл "${writeFile.path}":`, error);
        }
    }

    public async vaultOnRename(file: TAbstractFile, oldPath: string): Promise<void> {
          if (!file ) {
            return;
          }
          if (file instanceof TFile) {
            await this.handleFileRename(file, oldPath);
            const proj = this.projectSection.projects.find((p: Project) => {
              return p.folder.path === this.getParentPath(oldPath);
            })
            if (proj) {
              proj.folder = file.parent ? file.parent : proj.folder;
              const pointBaseName = this.getBasename(oldPath);
              const point = proj.points.get(pointBaseName);
              if (point){
                proj.points.delete(pointBaseName)
                proj.points.set(file.basename, point)
              }
            }
            this.projectSection.updateDisplay()

            this.dayTaskSection.ElMap.forEach((container: DayTaskContainer) => {
              container.ElMap.forEach((t: DayTask) => {
                if (t.file.stat.ctime === file.stat.ctime){
                    t.updateTitle(file.basename)
                }
              })
            })
            this.weekTasksSection.ElMap.forEach((weekTask: WeekTask) => {
              if (weekTask.file.stat.ctime === file.stat.ctime){
                    weekTask.updateTitle(file.basename)
                }
            })
          }
          else if (file instanceof TFolder) {
            await this.handleFolderRename(file, oldPath);
            const proj = this.projectSection.projects.find((p: Project) => {
              return p.folder.path === this.getParentPath(oldPath);
            })
            if (proj) {
              proj.folder = file.parent ? file.parent : proj.folder;
            }
            this.projectSection.updateDisplay()
          }
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

          this.dayTaskSection.ElMap.forEach((container: DayTaskContainer) => {
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

          this.weekTasksSection.ElMap.forEach((task) => {
            if (task?.file.stat.ctime === file.stat.ctime){
              void (async () => {
                await task.updateDescription()
              })();
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
        });
        if (file.path.contains(`${basePluginPath}/project/`)){
          if (file.parent?.name !== file.basename){
            return
          }

          const fileContent = await this.app.vault.read(file);
          const links: string[] = getLinksFromContent(fileContent);
          const projFolder = file.parent;
          const files: string[] = [];
          projFolder?.children.forEach((f: TAbstractFile) => {
            if (f instanceof TFile){
              files.push(f.basename);
            }
          });
          files.remove(file.basename)
          const diff: string[] = symmetricDifference(links, files); // разница между файлами в папке и ссылками в этом файле
          if (diff.length < 1){
            return
          }
          projFolder.children.forEach((f: TAbstractFile) => {
            if (f instanceof TFile){
              if (diff.contains(f.basename)){
                void (async () => {
                  await this.app.vault.delete(f, true);
                })();
              }
            }
          })
        }
    }
    public vaultOnDelete(file: TAbstractFile): void {
      if (!file) {
            return;
          }
          if (file instanceof TFolder){
            const project = this.projectSection.projects.find((p: Project) => p.folder.name === file.name);
            if (project){
              this.projectSection.removeProject(project);
              this.projectSection.updateDisplay()
            }
          }
          if (file instanceof TFile){
            const weekTask = this.weekTasksSection.ElMap.get(file.basename)
            if(weekTask && weekTask.file.stat.ctime === file.stat.ctime){
              this.weekTasksSection.removeElement(weekTask.file.basename)
            }
            
            this.dayTaskSection.ElMap.forEach((container) => {
              const task = container.ElMap.get(file.basename)
              if(task && task.file.stat.ctime === file.stat.ctime){
                container.removeElement(task.file.basename)
              }
            })
            const project = this.projectSection.projects.find((p: Project) => {
              return file.path.contains(p.folder.path);
            });
            if (project){
              project.folder.children.forEach((f: TAbstractFile) => {
                if (f instanceof TFile){
                  if (f.basename === project.folder.name){
                    void (async () => {
                      const fileContent = await this.app.vault.cachedRead(f);
                      //log(fileContent)
                      //log(`File: basename: ${file.basename}`)
                      const newContent = fileContent.replace(`- [[${file.basename}]]`, "")
                      //log(newContent)
                      await this.app.vault.modify(f, newContent);
                      //log(project.points)
                      project.removePointByName(file.basename)
                    })(); 
                  }
                }
              });
            }
          }
    }

    private renderDateAndDayOfWeek(elContainer: HTMLElement, currDate: string, dayOfWeekIndex: number): [HTMLElement, HTMLElement]{
      const dayOfWeek = elContainer.createEl("div", { text: DAY_NAMES[dayOfWeekIndex]})
      const date = elContainer.createEl("div", { text: currDate.toString()})
      return [dayOfWeek, date]
    }

    private getCurrentDateMarkdowns(day: Date): TFile[]{
      const markdowns: TFile[] | [] = getMarkdownsByDate(this.app.vault, "day", day)
      const currentDateMarkdowns: TFile[] = [];
      for (const md of markdowns){
          const currDate: string = fromDateToSlashDate(day);
          const mdDate: string | undefined = getDateFromFrontMatter(this.app, md);
          if (currDate === mdDate){
            currentDateMarkdowns.push(md);
          }
      }
      return currentDateMarkdowns;
    }

    private renderWeek(weekDays: Date[]): void {
      this.dayTaskSection.empty()

      for (let i = 0; i < weekDays.length; i++){
        const day = weekDays[i];

        const currentDateMarkdowns: TFile[] = this.getCurrentDateMarkdowns(day);

        const dayTaskContainer: DayTaskContainer = new DayTaskContainer(this.app, this.dayTaskSection.HTMLEl, day.getDay().toString(), day, () => this.selectDayHandler(dayTaskContainer))

        const dayTasks: DayTask[] = currentDateMarkdowns.map((md: TFile) => {
          return new DayTask(this.app, checkIsCompleteStatus(this.app, md), dayTaskContainer.dayTasksContainer, md)
        })

        dayTaskContainer.addElemetList(dayTasks)
        dayTaskContainer.renderElements()

        if (day.getMonth() !== this.currentMonth){
          this.renderDateAndDayOfWeek(dayTaskContainer.dateWeekContainer, day.getDate().toString(), i)
          dayTaskContainer.dayContainer.addClass("calendar-other-month");
        }
        else{
          this.renderDateAndDayOfWeek(dayTaskContainer.dateWeekContainer, day.getDate().toString(), i)
          dayTaskContainer.HTMLEl.addClass("this-month")

          const today = new Date();
          if (day.toDateString() === today.toDateString() && 
              this.currentMonth === today.getMonth() && 
              this.currentYear === today.getFullYear()) {
            dayTaskContainer.dayContainer.addClass("calendar-today");
            this.selectedDay = dayTaskContainer.dayContainer
            this.selectedDay.addClass("selected-day")
            this.header.editDate(today)
          }
        }
        this.dayTaskSection.addElement(dayTaskContainer)
      }
  }

  private selectDayHandler(el: DayTaskContainer){
    this.selectedDay.removeClass("selected-day");
    this.selectedDay = el.HTMLEl;
    this.selectedDay.addClass("selected-day")
    this.header.editDate(el.date)
  }

  private async handleFileRename(file: TFile, oldPath: string) {
    if (file.extension !== 'md') return;

    const oldParentPath = this.getParentPath(oldPath);
    const newParentPath = file.parent?.path;

    // Проверяем, изменилась ли родительская папка (файл был перемещен)
    if (oldParentPath !== newParentPath) {
      //console.log(`[AutoRenameFolder] Файл ${file.path} был перемещен. Пропускаем.`);
      return;
    }

    const oldBasename = this.getBasename(oldPath);
    const newBasename = file.basename;

    // Проверяем, совпадало ли старое имя файла с именем папки?
    const parentFolder = this.app.vault.getAbstractFileByPath(oldParentPath);
    if (parentFolder instanceof TFolder && parentFolder.name === oldBasename) {
      // Да, старое имя файла совпадало с именем папки.
      // Переименовываем папку в соответствии с новым именем файла.
      const newFolderPath = this.buildNewFolderPath(parentFolder.path, newBasename);
      await this.renameFolderSafely(parentFolder, newFolderPath);
    }
  }

  // Обработка переименования папки
  private async handleFolderRename(folder: TFolder, oldPath: string) {
    // Получаем имя старой папки (до переименования)
    const oldFolderName = this.getBasename(oldPath);
    // Проверяем, существует ли в старой папке файл с именем, совпадающим со старым именем папки?
    // Используем старый путь, так как folder.path уже обновлен
    const oldFolderPath = oldPath;
    const expectedFileName = oldFolderName;
    const expectedFilePath = `${oldPath}/${expectedFileName}.md`;

    const existingFile = this.app.vault.getAbstractFileByPath(expectedFilePath);
    if (existingFile instanceof TFile && existingFile.extension === "md") {
      // Да, файл с именем, совпадающим со старым именем папки, существует в старой папке.
      // Переименовываем файл в соответствии с новым именем папки.
      const newFileName = folder.name; // Новое имя папки становится именем файла
      const newFilePath = `${folder.path}/${newFileName}.md`
      await this.renameFileSafely(existingFile, newFilePath);
    }
    // Если файл не существует, ничего не делаем.
  }

  // Безопасное переименование папки
  private async renameFolderSafely(folder: TFolder, newFolderPath: string) {
    try {
      await this.app.fileManager.renameFile(folder, newFolderPath);
    } catch (error) {
      console.error("Error in file renaming")
    } 
  }

  // Безопасное переименование файла
  private async renameFileSafely(file: TFile, newFilePath: string) {
    try {
      await this.app.fileManager.renameFile(file, newFilePath);
    } catch (error) {
      console.error(`Ошибка при переименовании файла "${file.path}":`, error);
    } 
  }

  // Вспомогательная функция для получения пути родителя
  private getParentPath(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : '';
  }

  // Вспомогательная функция для получения basename (имени без расширения)
  private getBasename(path: string): string {
    const lastSlashIndex = path.lastIndexOf('/');
    const fileName = path.substring(lastSlashIndex + 1);
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return fileName.substring(0, lastDotIndex);
    }
    return fileName;
  }

  // Вспомогательная функция для построения нового пути папки
  private buildNewFolderPath(currentFolderPath: string, newFolderName: string): string {
    const parentPath = this.getParentPath(currentFolderPath);
    return parentPath ? `${parentPath}/${newFolderName}` : newFolderName;
  }
}

