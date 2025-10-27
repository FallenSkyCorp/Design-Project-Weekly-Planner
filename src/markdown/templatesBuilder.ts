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
        await app.vault.createFolder(path);
    }
    catch (e){

    }
  }
  for (const md of nesessaryMarkdowns){
    try{
        const file = await app.vault.create(md.path, md.content)
        //await setFrontmatter(app, file)
    }
    catch (e){

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