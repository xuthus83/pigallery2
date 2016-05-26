///<reference path="./browser.d.ts"/>

import {bootstrap} from "@angular/platform-browser-dynamic";
import {AppComponent} from "./app/app.component.ts";

bootstrap(AppComponent)
    .catch(err => console.error(err));

