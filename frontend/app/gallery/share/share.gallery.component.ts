import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Utils} from "../../../../common/Utils";
import {ShareService} from "../share.service";
import {GalleryService} from "../gallery.service";
import {ContentWrapper} from "../../../../common/entities/ConentWrapper";
import {SharingDTO} from "../../../../common/entities/SharingDTO";
import {ModalDirective} from "ngx-bootstrap/modal";
import {Config} from "../../../../common/config/public/Config";
import {NotificationService} from "../../model/notification.service";


@Component({
  selector: 'gallery-share',
  templateUrl: './share.gallery.component.html',
  styleUrls: ['./share.gallery.component.css'],
})
export class GalleryShareComponent implements OnInit, OnDestroy {
  @ViewChild('shareModal') public childModal: ModalDirective;

  enabled: boolean = true;
  url: string = "";

  input = {
    includeSubfolders: true,
    valid: {
      amount: 30,
      type: ValidityTypes.Days
    }
  };
  validityTypes = [];
  currentDir: string = "";
  sharing: SharingDTO;
  contentSubscription = null;
  passwordProtection = false;

  constructor(private _sharingService: ShareService,
              public _galleryService: GalleryService,
              private  _notification: NotificationService) {
    this.validityTypes = Utils.enumToArray(ValidityTypes);


  }


  ngOnInit() {
    this.contentSubscription = this._galleryService.content.subscribe((content: ContentWrapper) => {
      this.enabled = !!content.directory;
      if (!this.enabled) {
        return;
      }
      this.currentDir = Utils.concatUrls(content.directory.path, content.directory.name);
    });
    this.passwordProtection = Config.Client.Sharing.passwordProtected;
  }

  ngOnDestroy() {
    if (this.contentSubscription !== null) {
      this.contentSubscription.unsubscribe();
    }
  }

  calcValidity() {
    switch (parseInt(this.input.valid.type.toString())) {
      case ValidityTypes.Minutes:
        return this.input.valid.amount * 1000 * 60;
      case ValidityTypes.Hours:
        return this.input.valid.amount * 1000 * 60 * 60;
      case ValidityTypes.Days:
        return this.input.valid.amount * 1000 * 60 * 60 * 24;
      case ValidityTypes.Months:
        return this.input.valid.amount * 1000 * 60 * 60 * 24 * 30;
    }
    throw "unknown type: " + this.input.valid.type;
  }

  async update() {
    this.url = "loading..";
    this.sharing = await this._sharingService.updateSharing(this.currentDir, this.sharing.id, this.input.includeSubfolders, this.calcValidity());
    console.log(this.sharing);
    this.url = Config.Client.publicUrl + "/share/" + this.sharing.sharingKey
  }

  async get() {
    this.url = "loading..";
    this.sharing = await this._sharingService.createSharing(this.currentDir, this.input.includeSubfolders, this.calcValidity());
    console.log(this.sharing);
    this.url = Config.Client.publicUrl + "/share/" + this.sharing.sharingKey
  }

  async showModal() {
    await this.get();
    this.childModal.show();
  }

  onCopy() {
    this._notification.success("Url has been copied to clipboard");
  }

}


export enum ValidityTypes{
  Minutes = 0, Hours = 1, Days = 2, Months = 3
}
