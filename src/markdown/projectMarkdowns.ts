
export function getLinksFromContent(content: string): string[]{
    const regExp = /\[\[([^\]]+)\]\]/g; // все ссылки на другие файлы в MD
    const matches = content.matchAll(regExp); // [0] это найдено, [1] это само название(путь) к файлу
    const links: string[] = Array.from(matches, m => m[1].toString());
    const preparedLinks = links.map((l: string) => {
        const slashIndex: number = l.lastIndexOf('/');
        return l.substring(slashIndex + 1);
    });
    return preparedLinks;
}