import { TFile } from "obsidian";
import { IRenderible } from "../interfaces/IRenderible";
import { IRemovable } from "../interfaces/IRemovable";
import { IDeletable } from "../interfaces/IDeletable";
import { EventListenerTuple } from "src/types/eventListenerTuple";

export abstract class BasePoint implements IRenderible, IRemovable, IDeletable{
    protected _parentEl: HTMLElement;
    public HTMLEl: HTMLElement;
    public file: TFile;

    protected listeners: EventListenerTuple[] = [];

    constructor (parentEl: HTMLElement, file: TFile,){
      this._parentEl = parentEl;
      this.file = file;
    }

    abstract render(): Promise<void> | void;
    public abstract updateTitle(text: string): Promise<void> | void;
    public abstract delete(): Promise<void> | void;
    public remove(): void{
        this.removeAllEventListeners();
        this.HTMLEl?.remove();
    };

    public addEventListener(type: string, handler: EventListenerOrEventListenerObject): void {
        this.HTMLEl.addEventListener(type, handler);
        this.listeners.push([type, handler]);
    }

    public removeEventListener(type: string, handler: EventListenerOrEventListenerObject): void {
        const index = this.listeners.findIndex(
            ([t, h]) => t === type && h === handler
        );
        if (index !== -1) {
            const [t, h] = this.listeners[index];
            this.HTMLEl.removeEventListener(t, h);
            this.listeners.splice(index, 1);
        } 
    }
    public removeAllEventListeners(): void {
        for (const [type, handler] of this.listeners) {
            try {
                this.HTMLEl.removeEventListener(type, handler);
            } catch (error) {
                console.error(`Ошибка при отписке события ${type} от элемента:`, error);
            }
        }
        this.listeners = []; 
    }
}