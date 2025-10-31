import { fromDateToSlashDate } from "src/views/utilFunctions/dateUtils";
import { IEventListener } from "../interfaces/IEventListener";
import { TargetEventListenerTuple } from "src/types/targetEventListenerTuple";
import { getStartOfWeek, getWeekDays } from "src/entities/weekManager";
import { getDetailsString, getNextButton, getPrevButton, getTodayButton, } from "./navigationElements";
import { HeaderType, } from "./types";
import { MONTH_NAMES } from "src/constants/constants";

export class NavigationHeader implements IEventListener{
    private parentElement: HTMLElement;
    private headerType: HeaderType;
    private isTodayBtn: boolean;

    public HTMLEl: HTMLElement;
    public listeners: TargetEventListenerTuple[] = [];
    public dateEl: HTMLInputElement;
    public actionsMenu: HTMLElement;
    public prevButton: HTMLElement;
    public todayButton: HTMLElement;
    public nextButton: HTMLElement;
    public details: HTMLElement;
    
    public monthEl: HTMLElement;
    public yearEl: HTMLElement;

    public readonly MAX_DATE_LENGTH = 10;
    public readonly DATA_REGEXP = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    constructor(parentlement: HTMLElement, headerType: HeaderType, isTodayBtn: boolean){
        this.parentElement = parentlement;
        this.headerType = headerType;
        this.isTodayBtn = isTodayBtn;
    } 

    private renderWeekHeader(currentDateContainer: HTMLElement, currDate: Date): void {
      currentDateContainer.createEl("div", { text: "DAY", cls: "current-date"})
      const slashDate: string = fromDateToSlashDate(currDate)
      this.dateEl = currentDateContainer.createEl("input", { value: `${slashDate}`, cls: "current-date", type:"text"})

      this.addTargetEventListener(this.dateEl, 'change', (e: InputEvent) => {
        const target = e.target as HTMLInputElement;
        let value = target.value;

        // 1. Удаляем все, кроме цифр
        let digits = value.replace(/\D/g, '');

        // 2. Ограничиваем длину до 8 цифр
        if (digits.length > 8) {
          digits = digits.slice(0, 8);
        }

        // 3. Форматируем строку с разделителями
        let formattedValue = '';
        for (let i = 0; i < digits.length; i++) {
          if (i === 2 || i === 4) { // После 2-й и 4-й цифры добавляем слэш
            formattedValue += '/';
          }
          formattedValue += digits[i];
        }

        // 4. Обновляем значение input
        target.value = formattedValue;
      });
    }

    private renderMonthHeader(currentDateContainer: HTMLElement, currDate: Date): void{
      const monthIndex = currDate.getMonth()
      this.monthEl = currentDateContainer.createEl("div", { text: MONTH_NAMES[monthIndex], cls: "current-date"})
      this.yearEl = currentDateContainer.createEl("div", { text: currDate.getFullYear().toString(), cls: "current-date"})
    }

    public editMonthDate(date: Date): void{
      this.monthEl.setText(MONTH_NAMES[date.getMonth()])
      this.yearEl.setText(date.getFullYear().toString())
    }

    addEventListener(type: string, handler: EventListenerOrEventListenerObject): void{
      return
    }
    addTargetEventListener(el: HTMLElement, type: string, handler: EventListenerOrEventListenerObject): void{
      if (this.listeners.contains([el, type, handler])){
          return
        }
        el.addEventListener(type, handler);
        this.listeners.push([el, type, handler]);
    }
    removeAllEventListeners(): void {
      for (const [targetEl, type, handler] of this.listeners) {
          try {
              targetEl.removeEventListener(type, handler);
          } catch (error) {
              console.error(`Ошибка при отписке события ${type} от элемента:`, error);
          }
      }
      this.listeners = []; 
    }

    private renderNavigationHeader(parentEl: HTMLElement): HTMLElement{
      const currDate = new Date()
      this.HTMLEl = parentEl.createDiv("calendar-header");
      const currentDateContainer = this.HTMLEl.createDiv("current-date-container")
      this.HTMLEl.addClass("workspace-background")
      if (this.headerType === "week"){
        this.renderWeekHeader(currentDateContainer, currDate)
      }
      else if (this.headerType === "month"){
        this.renderMonthHeader(currentDateContainer, currDate)
      }
      return this.HTMLEl
    }

  public onBlur(e: Event){
    const event = e as any;
    const content = event.target.value as string
    const dateObj = this.isValidDate(content)
    if (!dateObj){
      return
    }
    const startDate = getStartOfWeek(dateObj as Date)
    const week: Date[] = getWeekDays(startDate)
    return week
  }

  private isValidDate(dateString: string): boolean | Date{
    // 1. Проверить формат строки (опционально, но рекомендуется)
    // Регулярное выражение для DD/MM/YYYY (допускает 01-31 для дня, 01-12 для месяца, 0000-9999 для года)
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);
  
    if (!match) {
      console.log(`[isValidDate] Неверный формат: ${dateString}`);
      return false; // Строка не соответствует формату DD/MM/YYYY
    }
  
    // 2. Извлечь день, месяц, год
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // Месяц в строке (1-12)
    const year = parseInt(match[3], 10);
  
    // 3. Проверить диапазоны (дополнительная проверка)
    if (day < 1 || day > 31) {
      console.log(`[isValidDate] Неверный день: ${day}`);
      return false;
    }
    if (month < 1 || month > 12) {
      console.log(`[isValidDate] Неверный месяц: ${month}`);
      return false;
    }
    if (year < 1000 || year > 9999) {
      console.log(`[isValidDate] Неверный год: ${year}`);
      return false;
    }
  
    // 4. Создать объект Date (месяцы считаются с 0!)
    const dateObject = new Date(year, month - 1, day); // month - 1, потому что январь = 0
  
    // 5. Сравнить компоненты
    const isValid =
      dateObject.getFullYear() === year &&
      dateObject.getMonth() === month - 1 && // month - 1, потому что.getMonth() возвращает 0-11
      dateObject.getDate() === day;
  
    if (!isValid) {
      console.log(`[isValidDate] Неверная дата: ${dateString} (Date object: ${dateObject})`);
      return isValid
    } else {
      console.log(`[isValidDate] Валидная дата: ${dateString}`);
      return dateObject
    }
  }

    private renderHeaderActionMenu(header: HTMLElement): HTMLElement{
      this.actionsMenu = header.createDiv("actions-menu")
      const btnContainer = this.actionsMenu.createDiv("btn-container")
      this.prevButton = getPrevButton(btnContainer)
      if (this.isTodayBtn){
        this.todayButton = getTodayButton(btnContainer)
      }
      this.nextButton = getNextButton(btnContainer)
      return this.actionsMenu
    }

    private renderDotsActionMenu(): void{
      this.details = this.actionsMenu.createDiv("dots-btn-container")
      const svgElement = this.details.createSvg("svg", "dots-btn")
      svgElement.setAttribute('class', 'dots-btn');
      svgElement.setAttribute('viewBox', '0 0 35 35');
      svgElement.setAttribute('fill', 'none');
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const pathsData = [
          'M3.48727 30.3797C2.33373 30.3797 1.5178 30.1405 1.0395 29.6622C0.58934 29.1839 0.364258 28.579 0.364258 27.8475V27.0878C0.364258 26.3563 0.58934 25.7514 1.0395 25.2731C1.5178 24.7948 2.33373 24.5557 3.48727 24.5557C4.64082 24.5557 5.44267 24.7948 5.89284 25.2731C6.37114 25.7514 6.61029 26.3563 6.61029 27.0878V27.8475C6.61029 28.579 6.37114 29.1839 5.89284 29.6622C5.44267 30.1405 4.64082 30.3797 3.48727 30.3797Z',
          'M16.5537 30.3797C15.4001 30.3797 14.5842 30.1405 14.1059 29.6622C13.6558 29.1839 13.4307 28.579 13.4307 27.8475V27.0878C13.4307 26.3563 13.6558 25.7514 14.1059 25.2731C14.5842 24.7948 15.4001 24.5557 16.5537 24.5557C17.7072 24.5557 18.5091 24.7948 18.9593 25.2731C19.4376 25.7514 19.6767 26.3563 19.6767 27.0878V27.8475C19.6767 28.579 19.4376 29.1839 18.9593 29.6622C18.5091 30.1405 17.7072 30.3797 16.5537 30.3797Z',
          'M29.6201 30.3797C28.4666 30.3797 27.6506 30.1405 27.1723 29.6622C26.7222 29.1839 26.4971 28.579 26.4971 27.8475V27.0878C26.4971 26.3563 26.7222 25.7514 27.1723 25.2731C27.6506 24.7948 28.4666 24.5557 29.6201 24.5557C30.7736 24.5557 31.5755 24.7948 32.0257 25.2731C32.504 25.7514 32.7431 26.3563 32.7431 27.0878V27.8475C32.7431 28.579 32.504 29.1839 32.0257 29.6622C31.5755 30.1405 30.7736 30.3797 29.6201 30.3797Z',
          'M3.48727 18.3797C2.33373 18.3797 1.5178 18.1405 1.0395 17.6622C0.58934 17.1839 0.364258 16.579 0.364258 15.8475V15.0878C0.364258 14.3563 0.58934 13.7514 1.0395 13.2731C1.5178 12.7948 2.33373 12.5557 3.48727 12.5557C4.64082 12.5557 5.44267 12.7948 5.89284 13.2731C6.37114 13.7514 6.61029 14.3563 6.61029 15.0878V15.8475C6.61029 16.579 6.37114 17.1839 5.89284 17.6622C5.44267 18.1405 4.64082 18.3797 3.48727 18.3797Z',
          'M16.5537 18.3797C15.4001 18.3797 14.5842 18.1405 14.1059 17.6622C13.6558 17.1839 13.4307 16.579 13.4307 15.8475V15.0878C13.4307 14.3563 13.6558 13.7514 14.1059 13.2731C14.5842 12.7948 15.4001 12.5557 16.5537 12.5557C17.7072 12.5557 18.5091 12.7948 18.9593 13.2731C19.4376 13.7514 19.6767 14.3563 19.6767 15.0878V15.8475C19.6767 16.579 19.4376 17.1839 18.9593 17.6622C18.5091 18.1405 17.7072 18.3797 16.5537 18.3797Z',
          'M29.6201 18.3797C28.4666 18.3797 27.6506 18.1405 27.1723 17.6622C26.7222 17.1839 26.4971 16.579 26.4971 15.8475V15.0878C26.4971 14.3563 26.7222 13.7514 27.1723 13.2731C27.6506 12.7948 28.4666 12.5557 29.6201 12.5557C30.7736 12.5557 31.5755 12.7948 32.0257 13.2731C32.504 13.7514 32.7431 14.3563 32.7431 15.0878V15.8475C32.7431 16.579 32.504 17.1839 32.0257 17.6622C31.5755 18.1405 30.7736 18.3797 29.6201 18.3797Z',
          'M3.48727 6.37966C2.33373 6.37966 1.5178 6.14051 1.0395 5.66222C0.58934 5.18392 0.364258 4.57901 0.364258 3.84749V3.08784C0.364258 2.35632 0.58934 1.75141 1.0395 1.27311C1.5178 0.794814 2.33373 0.555664 3.48727 0.555664C4.64082 0.555664 5.44267 0.794814 5.89284 1.27311C6.37114 1.75141 6.61029 2.35632 6.61029 3.08784V3.84749C6.61029 4.57901 6.37114 5.18392 5.89284 5.66222C5.44267 6.14051 4.64082 6.37966 3.48727 6.37966Z',
          'M16.5537 6.37966C15.4001 6.37966 14.5842 6.14051 14.1059 5.66222C13.6558 5.18392 13.4307 4.57901 13.4307 3.84749V3.08784C13.4307 2.35632 13.6558 1.75141 14.1059 1.27311C14.5842 0.794814 15.4001 0.555664 16.5537 0.555664C17.7072 0.555664 18.5091 0.794814 18.9593 1.27311C19.4376 1.75141 19.6767 2.35632 19.6767 3.08784V3.84749C19.6767 4.57901 19.4376 5.18392 18.9593 5.66222C18.5091 6.14051 17.7072 6.37966 16.5537 6.37966Z',
          'M29.6201 6.37966C28.4666 6.37966 27.6506 6.14051 27.1723 5.66222C26.7222 5.18392 26.4971 4.57901 26.4971 3.84749V3.08784C26.4971 2.35632 26.7222 1.75141 27.1723 1.27311C27.6506 0.794814 28.4666 0.555664 29.6201 0.555664C30.7736 0.555664 31.5755 0.794814 32.0257 1.27311C32.504 1.75141 32.7431 2.35632 32.7431 3.08784V3.84749C32.7431 4.57901 32.504 5.18392 32.0257 5.66222C31.5755 6.14051 30.7736 6.37966 29.6201 6.37966Z'
      ];

      // Создаем и добавляем path элементы
      pathsData.forEach(pathData => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathData);
          path.setAttribute('fill', 'currentColor');
          svgElement.appendChild(path);
      });
      //this.details.innerHTML += svgString 
    }

    // Вспомогательная функция для форматирования даты из строки цифр
    private formatDate(digits: string): string {
      if (digits.length < 3) return digits; // Если меньше 3х цифр, просто возвращаем как есть
      let formatted = '';
      for (let i = 0; i < digits.length; i++) {
        if (i === 2 || i === 4) {
          formatted += '/';
        }
        formatted += digits[i];
      }
      return formatted;
    }

    public render(): void{
      const header = this.renderNavigationHeader(this.parentElement);
      const actionMenu = this.renderHeaderActionMenu(header);
      this.renderDotsActionMenu()
    }
    public editDate(newDate: Date): void{
      const slashDate: string = fromDateToSlashDate(newDate);
      this.dateEl.value = slashDate;
    }

    public remove():void {
      this.removeAllEventListeners()
      this.HTMLEl.remove()
    }
}