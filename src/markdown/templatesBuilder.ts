import { App, TFile } from "obsidian";
import { basePluginPath } from "src/constants/constants";
import { fromDateToSlashDate } from "src/views/utilFunctions/dateUtils";

export const pluginFolderPath: string = basePluginPath
export const resourcesPath = "_resources"
const templ = "templates"
const nesessaryFoldersPathArray = [
                                   pluginFolderPath, 
                                   `${pluginFolderPath}/${resourcesPath}`, 
                                   `${pluginFolderPath}/${resourcesPath}/${templ}`,
                                   `${pluginFolderPath}/day`,
                                   `${pluginFolderPath}/week`,
                                   `${pluginFolderPath}/project`
                                  ]

const nesessaryMarkdowns = [
                            { path: `${pluginFolderPath}/${resourcesPath}/${templ}/day.md`, content: ""},
                            { path: `${pluginFolderPath}/${resourcesPath}/${templ}/week.md`, content: ""},
                            { path: `${pluginFolderPath}/${resourcesPath}/${templ}/project.md`, content: ""}
                           ]

export async function createPluginFoldersAndFiles(app: App): Promise<void>{
  for (const path of nesessaryFoldersPathArray){
    try{
        const existFolder = app.vault.getFolderByPath(path)
        if (!existFolder){
          await app.vault.createFolder(path);
        }
    }
    catch (e){
      console.error("Error when creating plugins folders")
    }
  }
  for (const md of nesessaryMarkdowns){
    try{
      const existFile = app.vault.getFileByPath(md.path)
      if (!existFile){
        await app.vault.create(md.path, md.content)
      }
    }
    catch (e){
      console.error("Error when creating plugins templates files")
    }
  }
}

export async function setFrontmatter(app: App, file: TFile, date: Date): Promise<void>{
    const slashDate = fromDateToSlashDate(date)
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter["DATE"] = slashDate;
      frontmatter["CHECK"] = false;
    })
}