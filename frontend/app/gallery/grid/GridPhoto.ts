import {PhotoDTO} from "../../../../common/entities/PhotoDTO";
import {Photo} from "../Photo";
export class GridPhoto extends Photo {


    constructor(photo: PhotoDTO, renderWidth: number, renderHeight: number, public rowId: number) {
        super(photo, renderWidth, renderHeight);
    }


}