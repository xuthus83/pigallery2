import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import {LoginComponent} from "./login/login.component";
import {GalleryComponent} from "./gallery/gallery.component";
import {AdminComponent} from "./admin/admin.component";

const ROUTES: Routes = [
    {
        path: 'login',
        component: LoginComponent
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
    {path: '', redirectTo: '/login', pathMatch: 'full'}
];

export const appRoutes: ModuleWithProviders = RouterModule.forRoot(ROUTES);

