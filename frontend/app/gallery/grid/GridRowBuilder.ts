import {Photo} from "../../../../common/entities/Photo";

export class GridRowBuilder {

    private photoRow:Array<Photo> = [];

    private photoIndex:number = 0; //index of the last pushed photo to the photoRow


    constructor(private photos:Array<Photo>, private startIndex:number, private photoMargin:number, private containerWidth:number) {
        this.photoIndex = startIndex;
    }

    public addPhotos(number:number) {
        for (let i = 0; i < number; i++) {
            this.addPhoto();
        }
    }

    public addPhoto():boolean {
        if (this.photoIndex + 1 > this.photos.length) {
            return false;
        }
        this.photoRow.push(this.photos[this.photoIndex]);
        this.photoIndex++;
        return true;
    }

    public removePhoto():boolean {
        if (this.photoIndex - 1 < this.startIndex) {
            return false;
        }
        this.photoIndex--;
        this.photoRow.pop();
        return true;
    }

    public getPhotoRow():Array<Photo> {
        return this.photoRow;
    }

    public adjustRowHeightBetween(minHeight:number, maxHeight:number) {
        while (this.calcRowHeight() > maxHeight && this.addPhoto() === true) { //row too high -> add more images               
        }

        while (this.calcRowHeight() < minHeight && this.removePhoto() === true) { //roo too small -> remove images
        }

        //keep at least one photo int thr row
        if (this.photoRow.length <= 0) {
            this.addPhoto();
        }
    }

    public calcRowHeight():number {
        let width = 0;
        for (let i = 0; i < this.photoRow.length; i++) {
            width += ((this.photoRow[i].metadata.size.width) / (this.photoRow[i].metadata.size.height)); //summing up aspect ratios
        }
        let height = (this.containerWidth - this.photoRow.length * (this.photoMargin * 2) - 1) / width; //cant be equal -> width-1

        return height + (this.photoMargin * 2);
    };
}