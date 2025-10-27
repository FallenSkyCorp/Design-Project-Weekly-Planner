export function removeElementByClassName(containerEl: HTMLElement, className: string): void{
  const classSelector = `.${className}`
  const targetEl = containerEl.querySelector(classSelector)
  targetEl?.remove()
}