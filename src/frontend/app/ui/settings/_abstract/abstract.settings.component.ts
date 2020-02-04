import {Input, OnChanges, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {UserRoles} from '../../../../../common/entities/UserDTO';
import {Utils} from '../../../../../common/Utils';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {NotificationService} from '../../../model/notification.service';
import {NavigationService} from '../../../model/navigation.service';
import {AbstractSettingsService} from './abstract.settings.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {Subscription} from 'rxjs';
import {ISettingsComponent} from './ISettingsComponent';
import {WebConfig} from '../../../../../common/config/private/WebConfig';
import {FormControl} from '@angular/forms';

interface ConfigState {
  value: any;
  original: any;
  default: any;
  readonly: any;
  onChange: any;
  isEnumType: boolean;
  isConfigType: boolean;
}

interface RecursiveState extends ConfigState {
  value: any;
  original: any;
  default: any;
  readonly: any;
  onChange: any;
  isEnumType: any;
  isConfigType: any;

  [key: string]: RecursiveState;
}

export abstract class SettingsComponent<T extends { [key: string]: any }, S extends AbstractSettingsService<T> = AbstractSettingsService<T>>
  implements OnInit, OnDestroy, OnChanges, ISettingsComponent {

  @Input()
  public simplifiedMode = true;

  @ViewChild('settingsForm', {static: true})
  form: FormControl;


  @Output()
  hasAvailableSettings = true;

  public inProgress = false;
  public error: string = null;
  public changed = false;
  public states: RecursiveState = <any>{};


  private _subscription: Subscription = null;
  private readonly _settingsSubscription: Subscription = null;

  protected constructor(private name: string,
                        protected _authService: AuthenticationService,
                        private _navigation: NavigationService,
                        public _settingsService: S,
                        protected notification: NotificationService,
                        public i18n: I18n,
                        private sliceFN?: (s: WebConfig) => T) {
    if (this.sliceFN) {
      this._settingsSubscription = this._settingsService.Settings.subscribe(this.onNewSettings);
      this.onNewSettings(this._settingsService._settingsService.settings.value);
    }
  }


  get Name(): string {
    return this.changed ? this.name + '*' : this.name;
  }

  get Changed(): boolean {
    return this.changed;
  }

  get HasAvailableSettings(): boolean {
    return this.hasAvailableSettings;
  }

  onNewSettings = (s: WebConfig) => {

    this.states = Utils.clone(<any>this.sliceFN(s.State));
    const addOriginal = (obj: any) => {
      for (const k of Object.keys(obj)) {
        if (typeof obj[k].value === 'undefined') {
          if (typeof obj[k] === 'object') {
            addOriginal(obj[k]);
          }
          continue;
        }

        obj[k].original = Utils.clone(obj[k].value);
        obj[k].onChange = this.onOptionChange;
      }
    };
    addOriginal(this.states);
    this.ngOnChanges();
  };

  settingsSame(newSettings: T, original: T): boolean {
    if (typeof original !== 'object' || original == null) {
      return newSettings === original;
    }
    if (!newSettings) {
      return false;
    }
    if (Array.isArray(original) && original.length !== newSettings.length) {
      return false;
    }
    const keys = Object.keys(newSettings);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof original[key] === 'undefined') {
        console.warn('unknown settings: ' + key);
        return false;
      }
      if (typeof original[key] === 'object') {
        if (this.settingsSame(newSettings[key], original[key]) === false) {
          return false;
        }
      } else if (newSettings[key] !== original[key]) {
        return false;
      }
    }

    return true;
  }

  onOptionChange = () => {
    setTimeout(() => {
      const settingsSame = (state: RecursiveState): boolean => {
        if (typeof state === 'undefined') {
          return true;
        }
        if (typeof state.original === 'object') {
          return Utils.equalsFilter(state.original, state.value);
        }
        if (typeof state.original !== 'undefined') {
          return state.value === state.original;
        }
        const keys = Object.keys(state);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (settingsSame(state[key]) === false) {
            return false;
          }
        }

        return true;
      };

      this.changed = !settingsSame(this.states);
    }, 0);
  };

  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.getSettings();

    // TODO: fix after this issue is fixed: https://github.com/angular/angular/issues/24818
    this._subscription = this.form.valueChanges.subscribe(() => {
      this.onOptionChange();
    });
  }

  ngOnChanges(): void {
    this.hasAvailableSettings = ((this._settingsService.isSupported() &&
      this._settingsService.showInSimplifiedMode())
      || !this.simplifiedMode);
  }


  ngOnDestroy() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }
    if (this._settingsSubscription != null) {
      this._settingsSubscription.unsubscribe();
    }
  }

  public reset() {
    this.getSettings();
  }

  stateToSettings(): T {
    const ret: T = <any>{};

    const add = (obj: any, to: any): void => {
      for (const key of Object.keys(obj)) {
        to[key] = {};
        if (obj[key].isConfigType) {
          return add(obj[key], to[key]);
        }
        to[key] = obj[key].value;
      }
    };
    add(this.states, ret);
    return ret;

  }

  public async save() {
    this.inProgress = true;
    this.error = '';
    try {
      await this._settingsService.updateSettings(this.stateToSettings());
      await this.getSettings();
      this.notification.success(this.Name + ' ' + this.i18n('settings saved'), this.i18n('Success'));
      this.inProgress = false;
      return true;
    } catch (err) {
      console.error(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    }

    this.inProgress = false;
    return false;
  }


  private async getSettings() {
    await this._settingsService.getSettings();
    this.changed = false;
  }
}



