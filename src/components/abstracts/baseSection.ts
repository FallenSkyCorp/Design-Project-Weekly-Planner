

export abstract class BaseSection<T>{
    protected _parentEl: HTMLElement;
    public HTMLEl: HTMLElement;

    public ElMap: Map<string, T> = new Map<string, T>();

    constructor (parentEl: HTMLElement){
      this._parentEl = parentEl;
    }

    public abstract render(): void | Promise<void>;
    public abstract renderElements(): Promise<void> | void;

    public abstract addElement(el: T): void | Promise<void>;
    public abstract addElemetList(elements: T[]): void | Promise<void>;
    public abstract removeElement(elName: string): void | Promise<void>;
    public abstract removeAllElements(): void | Promise<void>;
    public abstract delete(): void | Promise<void>;
}