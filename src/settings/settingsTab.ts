import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from '../core/main'
import { DEFAULT_SETTINGS, KleinPluginSettings } from './default'; 


export class KleinSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
    // --- Добавим переменные для хранения элементов управления ---
    private colorPickers: Record<keyof KleinPluginSettings, any | null> = {} as Record<keyof KleinPluginSettings, any | null>;
    private textInputs: Record<keyof KleinPluginSettings, any | null> = {} as Record<keyof KleinPluginSettings, any | null>;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// --- Функция для обновления состояния пикеров/инпутов ---
        // Это поможет избежать перезаписи при сбросе
        const updatePickerValue = (picker: any, value: string | number) => {
            if (picker && typeof picker.setValue === 'function') {
                picker.setValue(value.toString()); // setValue обычно ожидает строку
            }
        };

		// --- Цветовые пикеры ---
		new Setting(containerEl)  
    		.setName('Цвет фона')  
    		.addColorPicker((color) => {
                this.colorPickers.primaryBackground = color; // Сохраняем ссылку
				color
					 .setValue(this.plugin.settings.primaryBackground) 
					 .onChange(async (val) => {
						this.plugin.settings.primaryBackground = val;
						await this.plugin.saveSettings()
					 }) 
					 
			});

		new Setting(containerEl)  
    		.setName('Цвет добавочного фона')  
    		.addColorPicker((color) => {
                this.colorPickers.secondaryBackground = color;
				color
					 .setValue(this.plugin.settings.secondaryBackground) 
					 .onChange(async (val) => {
						this.plugin.settings.secondaryBackground = val;
						await this.plugin.saveSettings()
					 }) });

		new Setting(containerEl)  
    		.setName('Цвет фона другого месяца')  
    		.addColorPicker((color) => {
                this.colorPickers.otherMonthBackground = color;
				color
					 .setValue(this.plugin.settings.otherMonthBackground) 
					 .onChange(async (val) => {
						this.plugin.settings.otherMonthBackground = val;
						await this.plugin.saveSettings()
					 }) });

		new Setting(containerEl)  
    		.setName('Цвет фона текущего дня')  
    		.addColorPicker((color) => {
                this.colorPickers.currDayBackground = color;
				color
					 .setValue(this.plugin.settings.currDayBackground) 
					 .onChange(async (val) => {
						this.plugin.settings.currDayBackground = val;
						await this.plugin.saveSettings()
					 }) });

		new Setting(containerEl)  
    		.setName('Цвет обводки текущего дня')  
    		.addColorPicker((color) => {
                this.colorPickers.selectedDayBorderColor = color;
				color
					 .setValue(this.plugin.settings.selectedDayBorderColor) 
					 .onChange(async (val) => {
						this.plugin.settings.selectedDayBorderColor = val;
						await this.plugin.saveSettings()
					 }) });
		
		new Setting(containerEl)  
    		.setName('Цвет фона активной вкладки')  
    		.addColorPicker((color) => {
                this.colorPickers.tabBackgroundActive = color;
				color
					 .setValue(this.plugin.settings.tabBackgroundActive) 
					 .onChange(async (val) => {
						this.plugin.settings.tabBackgroundActive = val;
						await this.plugin.saveSettings()
					 }) });
			

		
		new Setting(containerEl)  
    		.setName('Цвет текста')  
    		.addColorPicker((color) => {
                this.colorPickers.textColor = color;
				color
					 .setValue(this.plugin.settings.textColor) 
					 .onChange(async (val) => {
						this.plugin.settings.textColor = val;
						await this.plugin.saveSettings()
					 }) });
		

		new Setting(containerEl)  
    		.setName('Цвет приглушенного текста (описание week task)')  
    		.addColorPicker((color) => {
                this.colorPickers.descriptionTextColor = color;
				color
					 .setValue(this.plugin.settings.descriptionTextColor) 
					 .onChange(async (val) => {
						this.plugin.settings.descriptionTextColor = val;
						await this.plugin.saveSettings()
					 }) });
		
	    new Setting(containerEl)  
    		.setName('Цвет мигающего курсора')  
    		.addColorPicker((color) => {
                this.colorPickers.caretColor = color;
				color
					 .setValue(this.plugin.settings.caretColor) 
					 .onChange(async (val) => {
						this.plugin.settings.caretColor = val;
						await this.plugin.saveSettings()
					 }) });

		new Setting(containerEl)  
    		.setName('Цвет иконок')  
    		.addColorPicker((color) => {
                this.colorPickers.iconColor = color;
				color
					 .setValue(this.plugin.settings.iconColor) 
					 .onChange(async (val) => {
						this.plugin.settings.iconColor = val;
						await this.plugin.saveSettings()
					 }) });

		new Setting(containerEl)  
    		.setName('Цвет чекбокса')  
    		.addColorPicker((color) => {
                this.colorPickers.checkboxColor = color;
				color
					 .setValue(this.plugin.settings.checkboxColor) 
					 .onChange(async (val) => {
						this.plugin.settings.checkboxColor = val;
						await this.plugin.saveSettings()
					 }) });

		new Setting(containerEl)  
    		.setName('Цвет скроллбара')  
    		.addColorPicker((color) => {
                this.colorPickers.scrollbarColor = color;
				color
					 .setValue(this.plugin.settings.scrollbarColor) 
					 .onChange(async (val) => {
						this.plugin.settings.scrollbarColor = val;
						await this.plugin.saveSettings()
					 }) });
					
        // --- Текстовые поля ---
        new Setting(containerEl)  
    		.setName('Размер шрифта заголовков')  
    		.addText((size) => {
                this.textInputs.headerTextSize = size; // Сохраняем ссылку
				size
					 .setValue(this.plugin.settings.headerTextSize.toString()) 
					 .onChange(async (val) => {
						const parsedVal = parseInt(val, 10);
                        // Проверим, является ли значение числом
                        if (!isNaN(parsedVal)) {
                            this.plugin.settings.headerTextSize = parsedVal;
                            await this.plugin.saveSettings()
                        }
					 }) });

		new Setting(containerEl)  
    		.setName('Размер шрифта обычного текста')  
    		.addText((size) => {
                this.textInputs.taskTextSize = size;
				size
					 .setValue(this.plugin.settings.taskTextSize.toString()) 
					 .onChange(async (val) => {
						const parsedVal = parseInt(val, 10);
                        if (!isNaN(parsedVal)) {
                            this.plugin.settings.taskTextSize = parsedVal;
                            await this.plugin.saveSettings()
                        }
					 }) });

        // --- Кнопка сброса ---
		new Setting(containerEl)
			.setName("Сбросить настройки")
			.addButton(button => button
									   .setButtonText('Сбросить')
									   .onClick(async () => {
                                        // --- 1. Обновляем UI элементы на значения по умолчанию ---
                                        // Это предотвращает срабатывание onChange после сброса
                                        for (const key in DEFAULT_SETTINGS) {
                                            const settingKey = key as keyof KleinPluginSettings;
                                            const defaultValue = DEFAULT_SETTINGS[settingKey];
                                            // Проверяем, есть ли пикер для этого ключа
                                            if (this.colorPickers[settingKey]) {
                                                updatePickerValue(this.colorPickers[settingKey], defaultValue);
                                            } else if (this.textInputs[settingKey]) {
                                                updatePickerValue(this.textInputs[settingKey], defaultValue);
                                            }
                                        }

                                        // --- 2. Присваиваем значения по умолчанию и сохраняем ---
										this.plugin.settings = { ...DEFAULT_SETTINGS }; // Создаем новый объект, чтобы избежать ссылок
										await this.plugin.saveSettings();
									   })
			)
	}
}