

export abstract class BaseSection<T>{
    protected _parentEl: HTMLElement;
    public HTMLEl: HTMLElement;

    public ElMap: Map<string, T> = new Map<string, T>();

    constructor (parentEl: HTMLElement){
      this._parentEl = parentEl;
    }

    public abstract render(): void;
    public abstract renderElements(): void;

    public abstract addElement(el: T): void;
    public abstract addElemetList(elements: T[]): void;
    public abstract removeElement(elName: string): void;
    public abstract removeAllElements(): void;
    public abstract delete(): void;
}