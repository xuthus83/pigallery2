import {Component, Input, OnChanges} from "@angular/core";
import {Directory} from "../../../../common/entities/Directory";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'gallery-navbar',
    templateUrl: 'app/gallery/navigator/navigator.gallery.component.html',
    providers: [RouterLink],
})
export class GalleryNavigatorComponent implements OnChanges {
    @Input() directory: Directory;

    routes: Array<any> = [];

    constructor() {
    }


    ngOnChanges() {
        this.getPath();
    }

    getPath(): any {
        if (!this.directory) {
            return [];
        }

        let path = this.directory.path.replace(new RegExp("\\\\", 'g'), "/");

        let dirs = path.split("/");
        dirs.push(this.directory.name);

        //removing empty strings
        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i] || 0 === dirs[i].length || "." === dirs[i]) {
                dirs.splice(i, 1);
                i--;
            }
        }


        let arr: any = [];

        //create root link
        if (dirs.length == 0) {
            arr.push({name: "Images", route: null});
        } else {
            arr.push({name: "Images", route: "/"});

        }

        //create rest navigation
        dirs.forEach((name, index) => {
            let route = dirs.slice(0, dirs.indexOf(name) + 1).join("/");
            if (dirs.length - 1 == index) {
                arr.push({name: name, route: null});
            } else {
                arr.push({name: name, route: route});
            }
        });


        this.routes = arr;


    }


}

