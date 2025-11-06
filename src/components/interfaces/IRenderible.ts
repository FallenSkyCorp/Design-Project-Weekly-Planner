export interface IRenderible{
    render: () => void | Promise<void>;
}