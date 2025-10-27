// Функция для получения первого дня недели (понедельник)
export function getStartOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 (воскресенье) - 6 (суббота)
  // Считаем, что неделя начинается с понедельника (1)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Корректируем для воскресенья
  return new Date(date.setDate(diff));
}

// Функция для получения дней недели, начиная с понедельника
export function getWeekDays(startDate: Date): Date[] {
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    weekDays.push(day);
  }
  return weekDays;
}

// Класс для управления состоянием недели
export class WeekManager {
  private currentDate: Date;

  constructor() {
    this.currentDate = new Date(); // Инициализация текущей датой
  }

  // Получить дни текущей недели
  getWeek(): Date[] {
    const startOfWeek = getStartOfWeek(new Date(this.currentDate));
    return getWeekDays(startOfWeek);
  }

  // Переключиться на предыдущую неделю
  goToPreviousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
  }
  goToCurrentDate(): void{
    this.currentDate = new Date()
  }
  // Переключиться на следующую неделю
  goToNextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
  }

  public getCurrentDate(){
    return this.currentDate
  }
}
