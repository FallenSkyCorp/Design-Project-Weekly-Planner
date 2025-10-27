import { App, Modal, Setting, TFolder } from 'obsidian';
import { NoteData } from '../../entities/noteData';

export class advancedCalendarAddTaskModal extends Modal {

  private dailyTask: string;
  private noteData: NoteData;
  private onSubmit: Function;

  constructor(app: App,  onSubmit: (result: string) => void) {
    super(app);
	  //this.setTitle(`Add new task on ${currentDate}:`);
    this.onSubmit = onSubmit
  }

  onOpen(): void {
    new Setting(this.contentEl)
      .setName('Daily task')
      .setDesc('Запись для дневной таски')
      .addTextArea((text) =>
        text  
            .setPlaceholder('Ваша запись здесь')  
            .onChange(async (value) => {  
              this.dailyTask = value;
            })
      );

    new Setting(this.contentEl)
      .setName("Folder")
      .setDesc("Select folder to save the note")
      .addDropdown(dropdown => {
        // Получаем все папки в хранилище
        const folders = this.app.vault.getAllLoadedFiles()
          .filter(file => file instanceof TFolder)
          .map(folder => folder.path);
        
        folders.forEach(folder => {
          dropdown.addOption(folder, folder || "/");
        });
        
        dropdown.setValue(this.noteData.folder || "/");
        dropdown.onChange(value => {
          this.noteData.folder = value;
        });
      });

    new Setting(this.contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Создать таску')
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.dailyTask);
          }));
  }

  onClose(): void {
    
  }
}