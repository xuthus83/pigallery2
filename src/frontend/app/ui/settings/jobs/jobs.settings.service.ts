import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {BehaviorSubject} from 'rxjs';
import {JobDTO} from '../../../../../common/entities/job/JobDTO';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';

@Injectable()
export class JobsSettingsService extends AbstractSettingsService<ServerConfig.JobConfig> {


  public availableJobs: BehaviorSubject<JobDTO[]>;

  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
    this.availableJobs = new BehaviorSubject([]);
  }

  public updateSettings(settings: ServerConfig.JobConfig): Promise<void> {
    return this._networkService.putJson('/settings/jobs', {settings: settings});
  }


  showInSimplifiedMode(): boolean {
    return false;
  }

  public isSupported(): boolean {
    return true;
  }


  public async getAvailableJobs() {
    this.availableJobs.next(await this._networkService.getJson<JobDTO[]>('/admin/jobs/available'));
  }

}
