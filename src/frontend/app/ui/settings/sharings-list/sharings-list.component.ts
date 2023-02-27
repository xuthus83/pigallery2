import {Component, OnInit} from '@angular/core';
import {SharingDTO} from '../../../../../common/entities/SharingDTO';
import {SharingListService} from './sharing-list.service';
import {SettingsService} from '../settings.service';
import {Config} from '../../../../../common/config/public/Config';
import {Utils} from '../../../../../common/Utils';

@Component({
  selector: 'app-settigns-sharings-list',
  templateUrl: './sharings-list.component.html',
  styleUrls: ['./sharings-list.component.css']
})
export class SharingsListComponent implements OnInit {

  public shares: SharingDTO[] = [];

  constructor(public sharingList: SharingListService,
              private settingsService: SettingsService) {
  }

  sharingUrl = Utils.concatUrls(Config.Server.publicUrl, '/share/');

  ngOnInit(): void {
    this.getSharingList();
  }

  get Enabled(): boolean {
    return this.settingsService.settings.value.Sharing.enabled;
  }

  async deleteSharing(sharing: SharingDTO): Promise<void> {
    await this.sharingList.deleteSharing(sharing);
    await this.getSharingList();
  }

  private async getSharingList(): Promise<void> {
    try {
      this.shares = await this.sharingList.getSharingList();
    } catch (err) {
      this.shares = [];
      throw err;
    }
  }

}
