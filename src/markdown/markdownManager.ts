import { normalizePath, parseYaml, TFile, Vault, WorkspaceLeaf, TFolder, TAbstractFile, App, MarkdownView, FrontMatterCache, CachedMetadata } from "obsidian";

import { fromDateToSlashDate, prepareDateForFolder, prepareDateForWeekFolder } from "src/views/utilFunctions/dateUtils";
import { NoteType } from "../types/noteType";
import { NoteWithoutContent } from "../entities/noteData";
import { basePluginPath, templatesPath } from "src/constants/constants";
import { getStartOfWeek } from "src/entities/weekManager";
import { setFrontmatter } from "./templatesBuilder";
import { Frontmatter } from "src/types/frontmatter";


export async function changeIsCompleteStatus(app: App, file: TFile): Promise<boolean>{
  let isComplete = false;
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter.CHECK = !frontmatter.CHECK
    isComplete = frontmatter.CHECK
  })
  return isComplete
}

export function checkIsCompleteStatus(app: App, file: TFile): boolean{
  const metadata: CachedMetadata | null = app.metadataCache.getFileCache(file);
  if (!metadata){
    return false;
  }
  if (metadata.frontmatter?.CHECK){
    return true;
  }
  return false;
}


export async function getNoteContentTemplate(vault: Vault, noteType: NoteType, date: Date): Promise<string>{
    const templatePath: string = `${templatesPath}/${noteType}.md`
    const file: TFile | null = vault.getFileByPath(templatePath)
    if (!file){
      return "";
    }
    let template = await vault.cachedRead(file)

    const slashDate: string = fromDateToSlashDate(date)

    template = template.replace(/DATE:\s*/i, `DATE: ${slashDate}\n`)

    return template
}

function getFronmatterFromCache(app: App, file: TFile): FrontMatterCache | undefined{
  return app.metadataCache.getFileCache(file)?.frontmatter;
}

export async function getFrontmatter(app: App, file: TFile): Promise< Frontmatter | null>{
  if (!file || !(file instanceof TFile) || file.extension !== 'md') {
    console.warn("Указан недопустимый файл или файл не является markdown.");
    return null;
  }
  try {
    const content = await app.vault.read(file);
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);

    if (match) {
      const frontmatterYaml = match[1];
      const yamlObj = parseYaml(frontmatterYaml)
      const frontmatter: Frontmatter = { DATE: yamlObj.DATE, CHECK: yamlObj.CHECK}
      return frontmatter
    } else {
      //console.log("Frontmatter не найден.");
      return null;
    }
    } catch (error) {
    console.error("Ошибка при чтении файла:", error);
    return null;
  }
}

export async function removeFrontmatter(app: App, file: TFile): Promise<string>{
  const fileContent: string = await app.vault.read(file);
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const resContent: string = fileContent.replace(frontmatterRegex, "");
  return resContent;
}

export function getDateFromFrontMatterByPath(app: App, filePath: string): string | undefined{
  const file = app.vault.getFileByPath(filePath);
  if (file){
    const frontmatter = getDateFromFrontMatter(app, file);
    return frontmatter;
  }
  return undefined;
}

export function getDateFromFrontMatter(app: App, file: TFile): string | undefined{
  const frontmatter = getFronmatterFromCache(app, file);
  return frontmatter?.DATE
}

async function createNewNote(app: App, noteType: NoteType, noteName: string, date: Date): Promise<TFile | null> {
  try{
    let preparedDate: string = prepareDateForFolder(date)
    if (noteType === "week"){
      const startDate: Date = getStartOfWeek(date);
      const endDate: Date = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6)
      preparedDate = prepareDateForWeekFolder(startDate, endDate)
    }
    const folderPath: string = normalizePath(`${basePluginPath}/${noteType}/${preparedDate}`)
    let folder = app.vault.getFolderByPath(folderPath)
    if (!folder){
        folder = await app.vault.createFolder(folderPath)
    }
    let number = 0;
    if (noteName === ""){
      noteName = "Untitled"
      const maxNum = getNumberToUntitled(folder.children)
      if (isFinite(maxNum)){
        number = maxNum
      }
    }
    const template = await getNoteContentTemplate(app.vault, noteType, date)
    const filename: string = `${noteName} ${number+1}`
    const file = await app.vault.create(`${folder.path}/${filename}.md`, template)
    await setFrontmatter(app, file, date)
    return file
  }
  catch (e){
    console.error(`Ошибка при создании заметки: ${e}`, 10000)
  }
  return null;
}

function getNote(app: App, noteType: NoteType, noteName: string, date: Date): TFile | null{
  const folderName: string = prepareDateForFolder(date)
  const notePath: string = `${basePluginPath}/${noteType}/${folderName}/${noteName}.md`;
  const note: TFile | null = app.vault.getFileByPath(notePath);
  if (!note){
    return null;
  }
  const noteDate: string | undefined = getDateFromFrontMatter(app, note);
  if (noteDate === fromDateToSlashDate(date)){
    return note;
  }
  return null;
}

export async function createOrGetNote(app: App, noteType: NoteType, noteName: string, date: Date): Promise<TFile | null>{
  const existNote = getNote(app, noteType, noteName, date)

  if (existNote){
    return existNote
  }
  const newNote = await createNewNote(app, noteType, noteName, date)

  return newNote
}

async function openMarkdownFileByPath(filepath: string): Promise<void>{
  try {
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    const existingLeaf = leaves.find((leaf: WorkspaceLeaf) => {
    const view = leaf.view;

    if (view instanceof MarkdownView && view.file) {
        return view.file.path === filepath;
    }
      return false;
    });

    if (existingLeaf) {
      // Файл уже открыт — переключаемся на вкладку
      this.app.workspace.setActiveLeaf(existingLeaf);
    } 
    else {
      // Файл не открыт — открываем
      await this.app.workspace.openLinkText(filepath, '/', true);
    }
  } catch (error) {
    console.error(`Error opening file ${filepath}:`, error);
  }
}


export async function openMarkdownFile(file: TFile): Promise<void> {
  try {
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    const existingLeaf = leaves.find((leaf: WorkspaceLeaf) => {
    const view = leaf.view;
    if (view instanceof MarkdownView && view.file) {
        return view.file.path === file.path;
    }
      return false;
    });

    if (existingLeaf) {
      // Файл уже открыт — переключаемся на вкладку
      this.app.workspace.setActiveLeaf(existingLeaf);
    } 
    else {
      // Файл не открыт — открываем
      await this.app.workspace.openLinkText(file.path, '/', true);
    }
  } catch (error) {
    console.error(`Error opening file ${file.path}:`, error);
  }
}

export function getMarkdownsByType(vault: Vault, mdType: NoteType, predicate: (md: TFile) => boolean = () => true): TFile[]{
  const markdowns: TFile[] = [];

  const path: string = `${basePluginPath}/${mdType}`
  const folder: TFolder | null= vault.getFolderByPath(path)

  if (!folder){
    return []
  }
  for (const child of folder.children){
    const md = vault.getFileByPath(child.path)
    if (md){  
      markdowns.push(md);
    }
  }
  return markdowns.filter(predicate);
}

export function getMarkdownsByDate(vault: Vault, mdType: NoteType, date: Date, predicate: (md: TFile) => boolean = () => true): TFile[]{
  const markdowns: TFile[] = [];
  const folderName: string = prepareDateForFolder(date)
  const path: string = `${basePluginPath}/${mdType}/${folderName}`
  const folder: TFolder | null= vault.getFolderByPath(path)
  if (!folder){
    return []
  }
  for (const child of folder.children){
    const md = vault.getFileByPath(child.path)
    if (md){  
      markdowns.push(md);
    }
  }
  return markdowns.filter(predicate);
}

export function getWeekMarkdowns(vault: Vault, weekFolder: string, predicate: (md: TFile) => boolean = () => true){
  const mdType: NoteType = "week";
  const folderPath = `${basePluginPath}/${mdType}/${weekFolder}`
  const mardowns: TFile[] = [];
  const folder: TFolder | null= vault.getFolderByPath(folderPath)

  if (!folder){
    return []
  }
  for (const child of folder.children){
    const md = vault.getFileByPath(child.path)
    if (md){  
      mardowns.push(md);
    }
  }
  return mardowns.filter(predicate);
}

export function getMarkdownsByPath(vault: Vault, folderPath: string, predicate: (md: TFile) => boolean = () => true): TFile[]{
  const mardowns: TFile[] = [];
  const folder: TFolder | null= vault.getFolderByPath(folderPath)

  if (!folder){
    return []
  }
  for (const child of folder.children){
    const md = vault.getFileByPath(child.path)
    if (md){  
      mardowns.push(md);
    }
  }
  return mardowns.filter(predicate);
}

export function getNotesWithoutContent(vault: Vault, noteType: NoteType, predicate: (note: NoteWithoutContent) => boolean = () => true): NoteWithoutContent[] | null
{
  const folderPath: string = `${basePluginPath}/${noteType}`;
  const folder: TFolder | null = vault.getFolderByPath(folderPath);
  if (!folder){
    return null;
  }
  const markdownList: TAbstractFile[] = folder.children

  let noteList: NoteWithoutContent[] = []

  for (const markdown of markdownList){
    const md: TFile | null = vault.getFileByPath(`${folderPath}/${markdown.name}`)

    if (!md) continue;

    const noteData: NoteWithoutContent = {
      title: md.basename,
      path: md.path,
    }
    noteList.push(noteData)
  }
  return noteList.filter(predicate)
}

export function getFolders(vault: Vault, noteType: NoteType): TFolder[]{
  const targerFolders: TFolder[] = [];
  const folderPath: string = `${basePluginPath}/${noteType}`;
  const folder: TFolder | null = vault.getFolderByPath(folderPath);
  if (!folder){
    return targerFolders;
  }
  for (const f of folder.children){
    if (f instanceof TFolder){
      targerFolders.push(f);
    }
  }
  return targerFolders
}

export async function createProject(vault: Vault, name: string): Promise<TFolder>{
  const noteType: NoteType = "project"
  const folderPath: string = `${basePluginPath}/${noteType}/${name}`
  const folder: TFolder = await vault.createFolder(folderPath)
  return folder;
}

export async function createProjectPoint(vault: Vault, projectName: string, name: string): Promise<TFile>{
  const noteType: NoteType = "project"
  const pointPath: string = `${basePluginPath}/${noteType}/${projectName}/${name}.md`
  const data = ""; // todo: сделать шаблон
  const point: TFile = await vault.create(pointPath, data)
  return point;
}

export function getNumberToUntitled(filesOrFolders: TAbstractFile[]): number{
  const regExp = /\d+/g;
  const untitledNumbers: number[] = [];
        
  filesOrFolders.forEach((f: TAbstractFile) => {
    const str = f.name.match(regExp)
    if (!str){
      return
    }
    untitledNumbers.push(parseInt(str[0], 10))
  })
  
  const maxNumber = Math.max(...untitledNumbers);
  return maxNumber;
}