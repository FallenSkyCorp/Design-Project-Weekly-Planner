export function prepareDateFormat(date: number, month: number): [date: string, month: string]{
  const newDate = date < 10 ? `0${date}` : date.toString();
  const newMonth = month < 10 ? `0${month}` : month.toString();
  return [newDate, newMonth]
}

export function fromDateToSlashDate(date: Date): string{
    const ISODate: string =  date.toISOString().split('T')[0];
    return ISODate.split('-').reverse().join('/')
}

export function fromSlashDateToISODate(ISODate: string): string{
    return ISODate.split('/').reverse().join('-');
}

export function prepareDateForFolder(date: Date): string{
  const dateParts: string[] = date.toISOString().split("T")[0].split("-");
  const folderName: string = dateParts.reverse().join("-")
  return folderName;
}

export function prepareDateForWeekFolder(startDate: Date, endDate: Date): string{
  const start: string[] = startDate.toISOString().split("T")[0].split("-").reverse();
  const end: string[] = endDate.toISOString().split("T")[0].split("-").reverse();
  const weekFolderName: string = start.join(".") + "-" + end.join(".");
  return weekFolderName;
}