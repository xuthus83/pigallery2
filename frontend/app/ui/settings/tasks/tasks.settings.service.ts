import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {TaskConfig} from '../../../../../common/config/private/IPrivateConfig';
import {BehaviorSubject} from 'rxjs';
import {TaskDTO} from '../../../../../common/entities/task/TaskDTO';

@Injectable()
export class TasksSettingsService extends AbstractSettingsService<TaskConfig> {


  public availableTasks: BehaviorSubject<TaskDTO[]>;

  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
    this.availableTasks = new BehaviorSubject([]);
  }

  public updateSettings(settings: TaskConfig): Promise<void> {
    return this._networkService.putJson('/settings/tasks', {settings: settings});
  }

  public isSupported(): boolean {
    return true;
  }


  public async getAvailableTasks() {
    this.availableTasks.next(await this._networkService.getJson<TaskDTO[]>('/admin/tasks/available'));
  }

}
