import { App, ItemView, Plugin, TAbstractFile, TFile, TFolder, WorkspaceLeaf } from 'obsidian';

import { CalendarView, CALENDAR_VIEW_TYPE } from '../views/calendarView';
import { MainPageView, MAIN_PAGE_VIEW_TYPE } from 'src/views/mainPageView';
import { KleinSettingTab } from "../settings/settingsTab"
import { DEFAULT_SETTINGS, KleinPluginSettings } from 'src/settings/default';
import { LeftPanel } from 'src/views/leftPanel';
import { IVaultEventHandler } from 'src/views/interfaces/IVaultEventHandler';


export default class KleinPlugin extends Plugin {
	public activeViews: Map<string, IVaultEventHandler> = new Map<string, IVaultEventHandler>();

	public settings: KleinPluginSettings;
	public leftPanel: LeftPanel;


    async onload() {
		await this.loadSettings()

        // Регистрация вью
      this.registerView(
        MAIN_PAGE_VIEW_TYPE,
        (leaf) => new MainPageView(leaf, this)
      );
	  this.registerView(
		CALENDAR_VIEW_TYPE,
		(leaf) => new CalendarView(leaf, this)
	  );
	
	  this.addRibbonIcon('dice', 'Open Klein Homepage', () => {
      	this.activateView(MAIN_PAGE_VIEW_TYPE);
      });
    
      // Добавление команды для открытия
      this.addCommand({
        id: 'open-homepage',
        name: 'Открыть домашнюю страницу',
        callback: () => {
          this.activateView(MAIN_PAGE_VIEW_TYPE);
        }
      });

	  this.addSettingTab(new KleinSettingTab(this.app, this));

	  this.registerEvent(
      	this.app.workspace.on('active-leaf-change', this.handleActiveLeafChange.bind(this))
      );
	  this.applySettings()

	  this.registerVaultEvents()

	  setTimeout(() => {
		this.getWorkspace();
		this.registerLeftPanelElementOnClickHandler();
	  }, 500)
	}

  	getLeafOfType(viewType: string): WorkspaceLeaf | null {
		const { workspace } = this.app;
		const leaves = workspace.getLeavesOfType(viewType);
		// Find the first leaf with an actually loaded view (not deferred)
		for (const leaf of leaves) {
			if (leaf.view && leaf.view.getViewType() === viewType) {
				return leaf;
			}
		}
		// If no loaded view found, return the first leaf (might be deferred)
		return leaves.length > 0 ? leaves[0] : null;
	}

  // Helper method to create or activate a view of specific type
	async activateView(viewType: string) {
		const { workspace } = this.app;
		
		// Use existing view if it exists
		let leaf = this.getLeafOfType(viewType);
		
		if (!leaf) {
			// Simple approach - create a new tab
			// This is more reliable for tab behavior
			leaf = workspace.getLeaf('tab');
			
			// Set the view state for this leaf
			await leaf.setViewState({
				type: viewType,
				active: true,
			});
		}
		
		// Make this leaf active and ensure it's visible
		workspace.setActiveLeaf(leaf, { focus: true });
		workspace.revealLeaf(leaf);
		
		return leaf;
	}

	public setView(viewType: string, view: IVaultEventHandler): void{
		this.activeViews.set(viewType, view)
	}
	public deleteView(viewType: string){
		this.activeViews.delete(viewType)
	}

	// Метод для применения настроек через CSS-переменные
    applySettings() {
      // Найдем или создадим элемент стиля для наших переменных
      let styleEl = document.getElementById('my-dynamic-css-plugin-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'my-dynamic-css-plugin-styles';
        document.head.appendChild(styleEl);
      }

      // Сформируем CSS с переопределением переменных
      const css = `
        :root {
	      --bg-main: ${this.settings.primaryBackground};
	  	--bg-secondary: ${this.settings.secondaryBackground};
	  	--tab-bg-active: ${this.settings.tabBackgroundActive};
		--selected-day-border-color: ${this.settings.selectedDayBorderColor};
  
	  	--other-month-background: ${this.settings.otherMonthBackground};
      	--current-day-background: ${this.settings.currDayBackground};
	  	--text-color: ${this.settings.textColor};
	  	--description-text: ${this.settings.descriptionTextColor};

	  	--caret-color-1: ${this.settings.caretColor};

	  	--svg-color: ${this.settings.iconColor};
	  	--icon-color-hover: ${this.settings.iconColor};

	  	--checkbox-marker-color-1: ${this.settings.checkboxColor};
	  	--checkbox-color-1: ${this.settings.checkboxColor};
	  	--checkbox-color-hover-1: ${this.settings.checkboxColor};
	  	--checkbox-border-color-1: ${this.settings.checkboxColor};
	  	--checkbox-border-color-hover-1: ${this.settings.checkboxColor};

		--scrollbar-thumb-bg-1: ${this.settings.scrollbarColor};
		--scrollbar-active-thumb-bg-1: ${this.settings.scrollbarColor};

		--header-text-size: ${this.settings.headerTextSize}px; 
    	--task-text-size: ${this.settings.taskTextSize}px;
        }
      `;

    // Обновим содержимое элемента стиля
    styleEl.textContent = css;
  }
	async loadSettings() {  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());  }
  	async saveSettings() { 
		 await this.saveData(this.settings);  
		 this.applySettings()
	}

	getAppContainer(): HTMLElement | null | undefined{ return this.app.workspace.containerEl.parentElement?.parentElement; }

	getWorkspace(): void{
	  const appContainer = this.getAppContainer()
	  if (!appContainer){
		return
	  }
	  const workspace: HTMLElement | null = appContainer.querySelector(".workspace")
	  if (!workspace){
		return
	  }
	  const fileManager: HTMLElement | null = appContainer.querySelector(".mod-root") 
	  if (!fileManager){
		return
	  }
	  this.leftPanel = new LeftPanel(appContainer)
	  fileManager.insertAdjacentElement('beforebegin', this.leftPanel.renderLeftPanel())
	  return
	}

	hideStatusBar() {
		const statusBarParentEl: HTMLElement | null | undefined = this.getAppContainer();
		const statusBarEl: HTMLElement | null | undefined = statusBarParentEl?.querySelector(".status-bar")
		if (statusBarEl){
			statusBarEl.addClass("hidden")
		}
	}

	showStatusBar() {
		const statusBarParentEl: HTMLElement | null | undefined = this.getAppContainer()
		const statusBarEl: HTMLElement | null | undefined = statusBarParentEl?.querySelector(".status-bar")
		if (statusBarEl){
			statusBarEl.removeClass("hidden")
		}
	}

	// Обработчик события изменения активной вкладки
  	handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
    	if (leaf?.view instanceof MainPageView || leaf?.view instanceof CalendarView) {
    	  this.hideStatusBar()
    	} else {
    	  this.showStatusBar();
    	}
    }

	registerLeftPanelElementOnClickHandler(): void{
		const elements: HTMLElement[] = this.leftPanel.getLeftPanelElements();
		if (!elements){
			return
		}
		elements.map((el: HTMLElement) => {
			this.registerDomEvent(el, "click", (ev: MouseEvent) => {
				ev.preventDefault();
				this.leftPanel.activeEl.removeClass("item-active");
				this.leftPanel.activeEl = el;
				this.leftPanel.activeEl.addClass("item-active");
			})
		});
	}

	private registerVaultEvents(): void{
      this.registerEvent(this.app.vault.on("create", async (file: TAbstractFile) => {
        this.activeViews.forEach(async (view) => {
			await view.vaultOnCreate(file);
		})
      }));

      this.registerEvent(this.app.vault.on("rename", async (file: TAbstractFile, oldPath: string) => {
          this.activeViews.forEach(async (view) => {
			await view.vaultOnRename(file, oldPath);
		})
      }));

      this.registerEvent(this.app.vault.on("modify", async (file: TAbstractFile) => {
          this.activeViews.forEach(async (view) => {
			await view.vaultOnModify(file);
		})
      }));

      this.registerEvent(this.app.vault.on("delete", async (file: TAbstractFile) => {
		this.activeViews.forEach(async (view) => {
			await view.vaultOnDelete(file);
		});
		if (!(file instanceof TFile) || file.path.includes("project")) return;
			
		const folders = this.app.vault.getAllFolders()
		folders.forEach(async (folder) => {
			if (!folder.children.length){
				await this.app.vault.delete(folder)
			}
		})
      }));
    }
}