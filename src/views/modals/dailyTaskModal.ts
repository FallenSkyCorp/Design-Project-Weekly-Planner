import { App, Modal, Setting, TFile, TFolder, Vault } from 'obsidian';
import { NoteType } from '../../types/noteType';
import { openMarkdownFile } from 'src/markdown/markdownManager';
import { fromDateToSlashDate } from 'src/views/utilFunctions/dateUtils';

export class DailyTaskModal extends Modal {
  private taskName: string;
  private date: Date;
  private createTask: (app: App, noteType: NoteType, noteName: string, date: Date) => Promise<TFile | null>;
  private noteType: NoteType = "day";
  private onCreatedCallback: (md: TFile) => Promise<void>;

  constructor(app: App, 
              date: Date, 
              createTaskFunc: (app: App, noteType: NoteType, noteName: string, date: Date) => Promise<TFile | null>,
              onCreatedCallback: (md: TFile) => Promise<void>) 
  {
    super(app);
      this.setTitle(`Add new task on ${fromDateToSlashDate(date)}:`);
      this.date = date;
      this.createTask = createTaskFunc;
      this.onCreatedCallback = onCreatedCallback;
  }

  onOpen(): void {
    new Setting(this.contentEl)
      .setName('Название таски')
      .setDesc('Название для markdown файла')
      .addText((text) =>
        text.setPlaceholder('Название таски тут')  
            .onChange(async (value) => {  
              this.taskName = value;
            }));

    new Setting(this.contentEl).addButton(async (btn) => 
        {
          btn.setButtonText('Создать таску')
           .setCta()
           .onClick(async () => {
             const task: TFile | null = await this.createTask(this.app, this.noteType, this.taskName, this.date);
             if (task){
              await this.onCreatedCallback(task);
              await openMarkdownFile(task);
             }
             this.close();
           })
        });
  }

  onClose(): void {
    
  }
}