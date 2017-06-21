import {Injectable, NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AgmCoreModule} from "@agm/core";
import {AppComponent} from "./app.component";
import {appRoutes} from "./app.routing";
import {UserService} from "./model/network/user.service";
import {GalleryService} from "./gallery/gallery.service";
import {NetworkService} from "./model/network/network.service";
import {ThumbnailLoaderService} from "./gallery/thumnailLoader.service";
import {GalleryCacheService} from "./gallery/cache.gallery.service";
import {FullScreenService} from "./gallery/fullscreen.service";
import {AuthenticationService} from "./model/network/authentication.service";
import {UserMangerSettingsComponent} from "./settings/usermanager/usermanager.settings.component";
import {FrameComponent} from "./frame/frame.component";
import {GalleryLightboxPhotoComponent} from "./gallery/lightbox/photo/photo.lightbox.gallery.component";
import {GalleryPhotoLoadingComponent} from "./gallery/grid/photo/loading/loading.photo.grid.gallery.component";
import {GalleryNavigatorComponent} from "./gallery/navigator/navigator.gallery.component";
import {GallerySearchComponent} from "./gallery/search/search.gallery.component";
import {GalleryLightboxComponent} from "./gallery/lightbox/lightbox.gallery.component";
import {GalleryDirectoryComponent} from "./gallery/directory/directory.gallery.component";
import {GalleryGridComponent} from "./gallery/grid/grid.gallery.component";
import {GalleryPhotoComponent} from "./gallery/grid/photo/photo.grid.gallery.component";
import {LoginComponent} from "./login/login.component";
import {AdminComponent} from "./admin/admin.component";
import {GalleryComponent} from "./gallery/gallery.component";
import {StringifyRole} from "./pipes/StringifyRolePipe";
import {GalleryMapComponent} from "./gallery/map/map.gallery.component";
import {GalleryMapLightboxComponent} from "./gallery/map/lightbox/lightbox.map.gallery.component";
import {ThumbnailManagerService} from "./gallery/thumnailManager.service";
import {OverlayService} from "./gallery/overlay.service";
import {Config} from "../../common/config/public/Config";
import {LAZY_MAPS_API_CONFIG} from "@agm/core/services";
import {SlimLoadingBarModule} from "ng2-slim-loading-bar";


@Injectable()
export class GoogleMapsConfig {
  apiKey: string;

  constructor() {
    this.apiKey = Config.Client.googleApiKey;
  }
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    appRoutes,
    AgmCoreModule.forRoot(),
    SlimLoadingBarModule.forRoot()
  ],
  declarations: [AppComponent,
    LoginComponent,
    AdminComponent,
    GalleryComponent,
    FrameComponent,
    UserMangerSettingsComponent,
    GalleryLightboxPhotoComponent,
    GalleryPhotoLoadingComponent,
    GalleryGridComponent,
    GalleryDirectoryComponent,
    GalleryLightboxComponent,
    GalleryMapComponent,
    GalleryMapLightboxComponent,
    FrameComponent,
    GallerySearchComponent,
    GalleryNavigatorComponent,
    GalleryPhotoComponent,
    FrameComponent,
    StringifyRole],
  providers: [
    {provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsConfig},
    NetworkService,
    UserService,
    GalleryCacheService,
    GalleryService,
    AuthenticationService,
    ThumbnailLoaderService,
    ThumbnailManagerService,
    FullScreenService,
    OverlayService],

  bootstrap: [AppComponent]
})
export class AppModule {
}
