import {Component, Input, OnChanges} from "@angular/core";
import {DirectoryDTO} from "../../../../common/entities/DirectoryDTO";
import {RouterLink} from "@angular/router";
import {UserUtil} from "../../../../common/entities/UserDTO";
import {AuthenticationService} from "../../model/network/authentication.service";
import {ShareService} from "../share.service";

@Component({
  selector: 'gallery-navbar',
  templateUrl: './navigator.gallery.component.html',
  providers: [RouterLink],
})
export class GalleryNavigatorComponent implements OnChanges {
  @Input() directory: DirectoryDTO;

  routes: Array<NavigatorPath> = [];

  constructor(private _authService: AuthenticationService,
              public _shareService: ShareService) {
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

    const user = this._authService.user.value;
    let arr: NavigatorPath[] = [];

    //create root link
    if (dirs.length == 0) {
      arr.push({name: "Images", route: null});
    } else {
      arr.push({name: "Images", route: UserUtil.isPathAvailable("/", user.permissions) ? "/" : null});

    }

    //create rest navigation
    dirs.forEach((name, index) => {
      const route = dirs.slice(0, dirs.indexOf(name) + 1).join("/");
      if (dirs.length - 1 == index) {
        arr.push({name: name, route: null});
      } else {
        arr.push({name: name, route: UserUtil.isPathAvailable(route, user.permissions) ? route : null});
      }
    });


    this.routes = arr;


  }


}

interface NavigatorPath {
  name: string;
  route: string;
}

