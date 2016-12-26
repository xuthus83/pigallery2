import {Component, Input} from "@angular/core";
import {Directory} from "../../../../common/entities/Directory";
import {RouterLink} from "@angular/router";
import {Utils} from "../../../../common/Utils";

@Component({
    selector: 'gallery-directory',
    templateUrl: 'app/gallery/directory/directory.gallery.component.html',
    providers: [RouterLink],
})
export class GalleryDirectoryComponent {
    @Input() directory:Directory;

    constructor() {
    }

    getDirectoryPath() {
        return Utils.concatUrls(this.directory.path, this.directory.name);
    }


}

