import {Component, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {GalleryService} from "./gallery.service";
import {GalleryGridComponent} from "./grid/grid.gallery.component";
import {GallerySearchComponent} from "./search/search.gallery.component";
import {SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {Config} from "../../../common/config/public/Config";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  @ViewChild(GallerySearchComponent) search: GallerySearchComponent;
  @ViewChild(GalleryGridComponent) grid: GalleryGridComponent;

  public showSearchBar: boolean = true;
  public directories: DirectoryDTO[] = [];

  constructor(public _galleryService: GalleryService,
              private _authService: AuthenticationService,
              private _router: Router,
              private _route: ActivatedRoute) {

    this.showSearchBar = Config.Client.Search.searchEnabled;
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated()) {
      this._router.navigate(['login']);
      return;
    }

    this._galleryService.content.subscribe((content) => {
      const dirSorter = (a: DirectoryDTO, b: DirectoryDTO) => {
        return a.name.localeCompare(b.name);
      };
      const dirs = <DirectoryDTO[]>(content.searchResult || content.directory || {directories: []}).directories;
      this.directories = dirs.sort(dirSorter);
    });

    this._route.params
      .subscribe((params: Params) => {
        let searchText = params['searchText'];
        if (searchText && searchText != "") {
          console.log("searching");
          let typeString = params['type'];

          if (typeString && typeString != "") {
            console.log("with type");
            let type: SearchTypes = <any>SearchTypes[typeString];
            this._galleryService.search(searchText, type);
            return;
          }

          this._galleryService.search(searchText);
          return;
        }


        let directoryName = params['directory'];
        directoryName = directoryName ? directoryName : "";

        this._galleryService.getDirectory(directoryName);

      });


  }

  onLightboxLastElement() {
    this.grid.renderARow();
  }


}

