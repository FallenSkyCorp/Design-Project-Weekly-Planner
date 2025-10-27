import { EventListenerTuple } from "src/types/eventListenerTuple";
import { TargetEventListenerTuple } from "src/types/targetEventListenerTuple";

export interface IEventListener{
    listeners: EventListenerTuple[] | TargetEventListenerTuple[];
    addEventListener(type: string, handler: EventListenerOrEventListenerObject): void;
    addTargetEventListener(el: HTMLElement, type: string, handler: EventListenerOrEventListenerObject): void
    removeAllEventListeners(): void;
}