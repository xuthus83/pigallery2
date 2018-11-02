import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../model/network/authentication.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {GalleryService} from './gallery.service';
import {GalleryGridComponent} from './grid/grid.gallery.component';
import {GallerySearchComponent} from './search/search.gallery.component';
import {SearchTypes} from '../../../common/entities/AutoCompleteItem';
import {Config} from '../../../common/config/public/Config';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {SearchResultDTO} from '../../../common/entities/SearchResultDTO';
import {ShareService} from './share.service';
import {NavigationService} from '../model/navigation.service';
import {UserRoles} from '../../../common/entities/UserDTO';
import {interval} from 'rxjs';
import {ContentWrapper} from '../../../common/entities/ConentWrapper';
import {PageHelper} from '../model/page.helper';
import {SortingMethods} from '../../../common/entities/SortingMethods';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy {

  @ViewChild(GallerySearchComponent) search: GallerySearchComponent;
  @ViewChild(GalleryGridComponent) grid: GalleryGridComponent;

  public showSearchBar = false;
  public showShare = false;
  public showRandomPhotoBuilder = false;

  public directories: DirectoryDTO[] = [];
  public isPhotoWithLocation = false;
  private $counter;
  private subscription = {
    content: null,
    route: null,
    timer: null,
    sorting: null
  };
  public countDown = null;
  public mapEnabled = true;
  SearchTypes: any = [];

  constructor(public _galleryService: GalleryService,
              private _authService: AuthenticationService,
              private _router: Router,
              private shareService: ShareService,
              private _route: ActivatedRoute,
              private _navigation: NavigationService) {
    this.mapEnabled = Config.Client.Map.enabled;
    this.SearchTypes = SearchTypes;

    PageHelper.showScrollY();
  }

  updateTimer(t: number) {
    if (this.shareService.sharing.value == null) {
      return;
    }
    t = Math.floor((this.shareService.sharing.value.expires - Date.now()) / 1000);
    this.countDown = {};
    this.countDown.day = Math.floor(t / 86400);
    t -= this.countDown.day * 86400;
    this.countDown.hour = Math.floor(t / 3600) % 24;
    t -= this.countDown.hour * 3600;
    this.countDown.minute = Math.floor(t / 60) % 60;
    t -= this.countDown.minute * 60;
    this.countDown.second = t % 60;
  }

  private onRoute = async (params: Params) => {
    const searchText = params['searchText'];
    if (searchText && searchText !== '') {
      const typeString = params['type'];

      if (typeString && typeString !== '') {
        const type: SearchTypes = <any>SearchTypes[typeString];
        this._galleryService.search(searchText, type);
        return;
      }

      this._galleryService.search(searchText);
      return;
    }

    if (params['sharingKey'] && params['sharingKey'] !== '') {
      const sharing = await this.shareService.getSharing();
      this._router.navigate(['/gallery', sharing.path], {queryParams: {sk: this.shareService.getSharingKey()}});
      return;
    }

    let directoryName = params['directory'];
    directoryName = directoryName || '';

    this._galleryService.loadDirectory(directoryName);


  };

  ngOnDestroy() {
    if (this.subscription.content !== null) {
      this.subscription.content.unsubscribe();
    }
    if (this.subscription.route !== null) {
      this.subscription.route.unsubscribe();
    }
    if (this.subscription.timer !== null) {
      this.subscription.timer.unsubscribe();
    }
    if (this.subscription.sorting !== null) {
      this.subscription.sorting.unsubscribe();
    }
  }

  private onContentChange = (content: ContentWrapper) => {
    const ascdirSorter = (a: DirectoryDTO, b: DirectoryDTO) => {
      return a.name.localeCompare(b.name);
    };

    const tmp = <DirectoryDTO | SearchResultDTO>(content.searchResult || content.directory || {
      directories: [],
      photos: []
    });
    this.directories = tmp.directories;
    this.sortDirectories();
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

  private sortDirectories() {
    switch (this._galleryService.sorting.value) {
      case SortingMethods.ascName:
      case SortingMethods.ascDate:
        this.directories.sort((a: DirectoryDTO, b: DirectoryDTO) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });
        break;
      case SortingMethods.descName:
      case SortingMethods.descDate:
        this.directories.sort((a: DirectoryDTO, b: DirectoryDTO) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return 1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return -1;
          }
          return 0;
        });
        break;
    }

  }

  async ngOnInit() {
    await this.shareService.wait();
    if (!this._authService.isAuthenticated() &&
      (!this.shareService.isSharing() ||
        (this.shareService.isSharing() && Config.Client.Sharing.passwordProtected === true))) {

      return this._navigation.toLogin();
    }
    this.showSearchBar = Config.Client.Search.enabled && this._authService.isAuthorized(UserRoles.Guest);
    this.showShare = Config.Client.Sharing.enabled && this._authService.isAuthorized(UserRoles.User);
    this.showRandomPhotoBuilder = Config.Client.RandomPhoto.enabled && this._authService.isAuthorized(UserRoles.Guest);
    this.subscription.content = this._galleryService.content.subscribe(this.onContentChange);
    this.subscription.route = this._route.params.subscribe(this.onRoute);

    if (this.shareService.isSharing()) {
      this.$counter = interval(1000);
      this.subscription.timer = this.$counter.subscribe((x) => this.updateTimer(x));
    }

    this.subscription.sorting = this._galleryService.sorting.subscribe(() => {
      this.sortDirectories();
    });

  }

}

