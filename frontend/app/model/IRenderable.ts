export interface IRenderable {
    getDimension():Dimension;
}

export class Dimension {
    public top:number;
    public left:number;
    public width:number;
    public height:number;


    constructor(top:number, left:number, width:number, height:number) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }

    public toStyle() {
        return {height: this.height + "px", width: this.width + "px", top: this.top + "px", left: this.left + "px"}
    }
}
