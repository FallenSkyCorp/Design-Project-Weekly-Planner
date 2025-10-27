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
      const svgString = getDetailsString()
      this.details.innerHTML += svgString 
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