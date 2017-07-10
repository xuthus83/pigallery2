export interface IRenderable {
  getDimension(): Dimension;
}

export interface Dimension {
  top: number;
  left: number;
  width: number;
  height: number;
}

export module Dimension {
  export const toString = (dim: Dimension) => {
    return {top: dim.top + "px", left: dim.left + "px", width: dim.width + "px", height: dim.height + "px"};
  }
}
