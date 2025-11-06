export interface IDeletable{
    delete: () => void | Promise<void>;
}