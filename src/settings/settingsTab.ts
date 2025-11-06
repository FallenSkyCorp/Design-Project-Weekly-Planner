import { App, ColorComponent, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import { DEFAULT_SETTINGS, KleinPluginSettings } from './default'; 
import KleinPlugin from 'src/core/main';


export class KleinSettingTab extends PluginSettingTab {
	plugin: KleinPlugin;
    // --- Добавим переменные для хранения элементов управления ---
    private colorPickers: Record<keyof KleinPluginSettings, ColorComponent | null> = {} as Record<keyof KleinPluginSettings, ColorComponent | null>;
    private textInputs: Record<keyof KleinPluginSettings, TextComponent | null> = {} as Record<keyof KleinPluginSettings, TextComponent | null>;

	constructor(app: App, plugin: KleinPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}


	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// --- Функция для обновления состояния пикеров/инпутов ---
        // Это поможет избежать перезаписи при сбросе
        const updatePickerValue = (picker: ColorComponent | TextComponent, value: string | number) => {
            if (picker && (typeof picker.setValue === 'function')) {
                picker.setValue(value.toString()); // setValue обычно ожидает строку
            }
        };
		
		for (const [keyStr, setting] of Object.entries(DEFAULT_SETTINGS)){
			const key = keyStr as keyof KleinPluginSettings;
			const setting = DEFAULT_SETTINGS[key]
			if (setting.value.includes("#")){
				new Setting(containerEl)  
    				.setName(setting.description)  
    				.addColorPicker((color) => {
                		this.colorPickers[key] = color; // Сохраняем ссылку
						color
					         .setValue(this.plugin.settings[key].value) 
					         .onChange(async (val) => {
								this.plugin.settings[key].value = val;
								await this.plugin.saveSettings()
					 		 }) 
					 
				});
			}
			else{
				new Setting(containerEl)  
    				.setName(setting.description)  
    				.addText((text) => {
                		this.textInputs[key] = text; // Сохраняем ссылку
						text
					 		.setValue(this.plugin.settings[key].value) 
					 		.onChange(async (val) => {
                        		if (val.trim().length > 0) {
                        		    this.plugin.settings[key].value = val;
                        		    await this.plugin.saveSettings()
                        		}
					 		}) 
				});
			}
		}

        // --- Кнопка сброса ---
		new Setting(containerEl)
			.setName("Сбросить настройки")
			.addButton(button => button
									   .setButtonText('Сбросить')
									   .onClick(async () => {
                                        	for (const keyStr in DEFAULT_SETTINGS) {
                  								const key = keyStr as keyof KleinPluginSettings;
                  								const defaultValue = DEFAULT_SETTINGS[key].value;
												const colorPicker = this.colorPickers[key]
												const textInput = this.textInputs[key]
                  								if (colorPicker !== null) {
                  								    updatePickerValue(colorPicker, defaultValue);
                  								} else if (textInput !== null) {
                  								    updatePickerValue(textInput, defaultValue);
                  								}
              								}

              								this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
              								await this.plugin.saveSettings();
										})
			)
	}
}