export interface IRenderable {
    getDimension():Dimension;
}

export interface Dimension {
    top: number;
    left: number;
    width: number;
    height: number;
}
