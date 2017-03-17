import {Component, Input, OnChanges} from "@angular/core";
import {DirectoryDTO} from "../../../../common/entities/DirectoryDTO";
import {RouterLink} from "@angular/router";
import {Utils} from "../../../../common/Utils";
import {Photo} from "../Photo";

@Component({
    selector: 'gallery-directory',
    templateUrl: 'app/gallery/directory/directory.gallery.component.html',
    styleUrls: ['app/gallery/directory/directory.gallery.component.css'],
    providers: [RouterLink],
})
export class GalleryDirectoryComponent implements OnChanges {
    @Input() directory: DirectoryDTO;
    photo: Photo = null;

    constructor() {
    }

    ngOnChanges() {
        setImmediate(() => {
            if (this.directory.photos.length > 0) {
                this.photo = new Photo(this.directory.photos[0], 100, 100);
                console.log(this.photo);
            }
        });
    }

    getDirectoryPath() {
        return Utils.concatUrls(this.directory.path, this.directory.name);
    }


}

