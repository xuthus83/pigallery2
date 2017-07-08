import {Injectable, ViewContainerRef} from "@angular/core";
import {ToastsManager} from "ng2-toastr/ng2-toastr";

@Injectable()
export class NotificationService {

  options = {
    positionClass: "toast-top-center",
    animate: "flyLeft"
  };

  constructor(private _toastr: ToastsManager) {

  }

  setRootViewContainerRef(vcr: ViewContainerRef) {
    this._toastr.setRootViewContainerRef(vcr);
  }

  success(text, title = null) {
    this._toastr.success(text, title, this.options);
  }

  error(text, title?) {
    this._toastr.error(text, title, this.options);
  }

  warning(text, title?) {
    this._toastr.warning(text, title, this.options);
  }

  info(text, title = null) {
    this._toastr.info(text, title, this.options);
  }


  get Toastr(): ToastsManager {
    return this._toastr;
  }
}
