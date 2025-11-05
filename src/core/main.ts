import { Plugin, TAbstractFile, TFile, WorkspaceLeaf } from 'obsidian';

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
	
	  this.addRibbonIcon('dice', 'Open main page', () => {
		void (async () => {
			await this.activateView(MAIN_PAGE_VIEW_TYPE);
		})();
      });
    
      // Добавление команды для открытия
      this.addCommand({
        id: 'open-homepage',
        name: 'Открыть главную страницу',
        callback: () => {
			void (async () => {
				await this.activateView(MAIN_PAGE_VIEW_TYPE);
			})();
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
		await workspace.revealLeaf(leaf);
		
		return leaf;
	}

	public setView(viewType: string, view: IVaultEventHandler): void{
		this.activeViews.set(viewType, view)
	}
	public deleteView(viewType: string){
		this.activeViews.delete(viewType)
	}
	toKebabCase(str: string): string {
  		const newStr = str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
		return `--${newStr}`
	}
    applySettings() {
	  let key: keyof typeof this.settings
	  for (key in this.settings){
		const val = this.settings[key]
		const cssStyleName = this.toKebabCase(key)
		document.documentElement.style.setProperty(cssStyleName, val.value)
	  }
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
        this.activeViews.forEach((view) => {
			void (async () => {
				await view.vaultOnCreate(file);
			})();
		})
      }));

      this.registerEvent(this.app.vault.on("rename", async (file: TAbstractFile, oldPath: string) => {
          this.activeViews.forEach((view) => {
			void (async () => {
				await view.vaultOnRename(file, oldPath);
			})();
		})
      }));

      this.registerEvent(this.app.vault.on("modify", async (file: TAbstractFile) => {
          this.activeViews.forEach((view) => {
			void (async () => {
				await view.vaultOnModify(file);
			})();
		})
      }));

      this.registerEvent(this.app.vault.on("delete", async (file: TAbstractFile) => {
		this.activeViews.forEach((view) => {
			void (async () => {
				await view.vaultOnDelete(file);
			})();
		});
		if (!(file instanceof TFile) || file.path.includes("project")) return;
			
		const folders = this.app.vault.getAllFolders()
		folders.forEach((folder) => {
			void (async () => {
				if (!folder.children.length){
					await this.app.vault.delete(folder)
				}
			})();
		})
      }));
    }
}