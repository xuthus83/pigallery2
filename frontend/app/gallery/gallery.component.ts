import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {GalleryService} from "./gallery.service";
import {GalleryGridComponent} from "./grid/grid.gallery.component";
import {GallerySearchComponent} from "./search/search.gallery.component";
import {SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {Config} from "../../../common/config/public/Config";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {SearchResultDTO} from "../../../common/entities/SearchResult";
import {ShareService} from "./share.service";

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy {

  @ViewChild(GallerySearchComponent) search: GallerySearchComponent;
  @ViewChild(GalleryGridComponent) grid: GalleryGridComponent;

  public showSearchBar: boolean = true;
  public showShare: boolean = true;
  public directories: DirectoryDTO[] = [];
  public isPhotoWithLocation = false;
  private subscription = {
    content: null,
    route: null
  };

  constructor(public _galleryService: GalleryService,
              private _authService: AuthenticationService,
              private _router: Router,
              private shareService: ShareService,
              private _route: ActivatedRoute) {

    this.showSearchBar = Config.Client.Search.searchEnabled;
    this.showShare = Config.Client.Sharing.enabled;
  }


  ngOnInit() {
    if (!this._authService.isAuthenticated() &&
      (!this.shareService.isSharing() ||
      (this.shareService.isSharing() && Config.Client.Sharing.passwordProtected == true))
    ) {
      if (this.shareService.isSharing()) {
        this._router.navigate(['shareLogin']);
      } else {
        this._router.navigate(['login']);
      }
      return;
    }

    this.subscription.content = this._galleryService.content.subscribe(this.onContentChange);
    this.subscription.route = this._route.params.subscribe(this.onRoute);

  }

  ngOnDestroy() {
    if (this.subscription.content !== null) {
      this.subscription.content.unsubscribe();
    }
    if (this.subscription.route !== null) {
      this.subscription.route.unsubscribe();
    }
  }

  private onContentChange = (content) => {
    const dirSorter = (a: DirectoryDTO, b: DirectoryDTO) => {
      return a.name.localeCompare(b.name);
    };

    const tmp = <DirectoryDTO | SearchResultDTO>(content.searchResult || content.directory || {
      directories: [],
      photos: []
    });
    this.directories = tmp.directories.sort(dirSorter);
    this.isPhotoWithLocation = false;
    for (let i = 0; i < tmp.photos.length; i++) {
      if (tmp.photos[i].metadata &&
        tmp.photos[i].metadata.positionData &&
        tmp.photos[i].metadata.positionData.GPSData &&
        tmp.photos[i].metadata.positionData.GPSData.longitude
      ) {
        this.isPhotoWithLocation = true;
        break;
      }
    }
  };

  private onRoute = async (params: Params) => {
    console.log("onRoute", params);
    const searchText = params['searchText'];
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

    if (params['sharingKey'] && params['sharingKey'] != "") {
      const sharing = await this._galleryService.getSharing(this.shareService.getSharingKey());
      this._router.navigate(['/gallery', sharing.path], {queryParams: {sk: this.shareService.getSharingKey()}});
      return;
    }

    let directoryName = params['directory'];
    directoryName = directoryName || "";

    this._galleryService.getDirectory(directoryName);

  };


  onLightboxLastElement() {
    this.grid.renderARow();
  }


}

