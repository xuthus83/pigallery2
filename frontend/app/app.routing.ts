import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./login/login.component";
import {GalleryComponent} from "./gallery/gallery.component";
import {AdminComponent} from "./admin/admin.component";
import {ShareLoginComponent} from "./sharelogin/share-login.component";

const ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'shareLogin',
    component: ShareLoginComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'gallery/:directory',
    component: GalleryComponent
  },
  {
    path: 'gallery',
    component: GalleryComponent
  },
  {
    path: 'search/:searchText',
    component: GalleryComponent
  },
  {
    path: 'share/:sharingKey',
    component: GalleryComponent
  },
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: '**', redirectTo: '/login', pathMatch: 'full'}
];

export const appRoutes: ModuleWithProviders = RouterModule.forRoot(ROUTES);

