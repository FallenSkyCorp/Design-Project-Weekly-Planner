export interface NoteData{
    title: string;
    folder: string;
    content: string;
}

export interface NoteWithoutContent{
    title: string;
    path: string;
}