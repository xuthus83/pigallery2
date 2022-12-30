import {Directive, Input, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {UserRoles} from '../../../../../common/entities/UserDTO';
import {Utils} from '../../../../../common/Utils';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {NotificationService} from '../../../model/notification.service';
import {NavigationService} from '../../../model/navigation.service';
import {AbstractSettingsService} from './abstract.settings.service';
import {Subscription} from 'rxjs';
import {ISettingsComponent} from './ISettingsComponent';
import {WebConfig} from '../../../../../common/config/private/WebConfig';
import {FormControl} from '@angular/forms';
import {ConfigPriority, TAGS} from '../../../../../common/config/public/ClientConfig';
import {SettingsService} from '../settings.service';
import {IWebConfigClassPrivate} from '../../../../../../node_modules/typeconfig/src/decorators/class/IWebConfigClass';
import {WebConfigClassBuilder} from '../../../../../../node_modules/typeconfig/src/decorators/builders/WebConfigClassBuilder';

interface ConfigState<T = unknown> {
  value: T;
  original: T;
  default: T;
  readonly: boolean;
  tags: TAGS;
  onChange: () => unknown;
  isEnumType: boolean;
  isConfigType: boolean;
  isConfigArrayType: boolean;
  toJSON: () => T;
}

export interface RecursiveState extends ConfigState {
  shouldHide: any;
  volatile: any;
  tags: any;
  isConfigType: any;
  isConfigArrayType: any;
  onChange: any;
  isEnumType: any;
  value: any;
  original: any;
  default: any;
  readonly: any;
  toJSON: any;

  [key: string]: RecursiveState;
}


@Directive()
export abstract class SettingsComponentDirective<
  T extends RecursiveState> implements OnInit, OnDestroy, ISettingsComponent {
  public icon: string;
  @Input() ConfigPath: string;

  @ViewChild('settingsForm', {static: true})
  form: FormControl;


  public inProgress = false;
  public error: string = null;
  public changed = false;
  public states: RecursiveState = {} as RecursiveState;
  protected name: string;

  private subscription: Subscription = null;
  private settingsSubscription: Subscription = null;
  protected sliceFN?: (s: WebConfig) => T;

  protected constructor(
    protected authService: AuthenticationService,
    private navigation: NavigationService,
    public settingsService: AbstractSettingsService,
    protected notification: NotificationService,
    public globalSettingsService: SettingsService,
    sliceFN?: (s: IWebConfigClassPrivate<TAGS> & WebConfig) => T
  ) {
    this.setSliceFN(sliceFN);
  }

  setSliceFN(sliceFN?: (s: IWebConfigClassPrivate<TAGS> & WebConfig) => T) {
    if (sliceFN) {
      this.sliceFN = sliceFN;
      this.settingsSubscription = this.settingsService.Settings.subscribe(
        this.onNewSettings
      );
      this.onNewSettings(this.settingsService.settingsService.settings.value);
    }
  }

  get Name(): string {
    return this.changed ? this.name + '*' : this.name;
  }

  get Changed(): boolean {
    return this.changed;
  }

  get HasAvailableSettings(): boolean {
    return !this.states?.shouldHide || !this.states?.shouldHide();
  }

  onNewSettings = (s: WebConfig) => {
    this.states = this.sliceFN(s.clone()) as RecursiveState;
    const instrument = (st: RecursiveState, parent: RecursiveState) => {
      const shouldHide = (state: RecursiveState) => {
        return () => {
          if (state.volatile) {
            return true;
          }

          if (state.tags &&
            ((state.tags.relevant && !state.tags.relevant(parent.value))
              || state.tags.secret)) {
            return true;
          }

          // if all sub elements are hidden, hide the parent too.
          if (state.isConfigType) {
            if (state.value.__state &&
              Object.keys(state.value.__state).findIndex(k => !st.value.__state[k].shouldHide()) === -1) {
              return true;
            }
          }


          if (state.isConfigArrayType) {
            for (let i = 0; i < state.value?.length; ++i) {
              if (state.value[i].__state &&
                Object.keys(state.value[i].__state).findIndex(k => !(st.value[i].__state[k].shouldHide && st.value[i].__state[k].shouldHide())) === -1) {
                return true;
              }
            }
            return false;
          }
          return (
            (state.tags?.priority > this.globalSettingsService.configPriority ||
              (this.globalSettingsService.configPriority === ConfigPriority.basic &&
                state.tags?.dockerSensitive && this.globalSettingsService.settings.value.Environment.isDocker)) && //if this value should not change in Docker, lets hide it
            Utils.equalsFilter(state.value, state.default,
              ['__propPath', '__created', '__prototype', '__rootConfig']) &&
            Utils.equalsFilter(state.original, state.default,
              ['__propPath', '__created', '__prototype', '__rootConfig']));
        };
      };

      st.shouldHide = shouldHide(st);
      st.onChange = this.onOptionChange;
      st.rootConfig = parent?.value;
      if (typeof st.value !== 'undefined') {
        st.original = Utils.clone(st.value);
      }
      if (st.isConfigType) {
        for (const k of Object.keys(st.value.__state)) {
          instrument(st.value.__state[k], st);
        }
      }
      if (st.isConfigArrayType) {
        for (let i = 0; i < st.value?.length; ++i) {
          for (const k of Object.keys(st.value[i].__state)) {
            instrument(st.value[i].__state[k], st);
          }
        }
      }
    };
    instrument(this.states, null);
    this.icon = this.states.tags?.uiIcon;
  };

  onOptionChange = () => {
    setTimeout(() => {
      const settingsSame = (state: RecursiveState): boolean => {
        if (typeof state === 'undefined') {
          return true;
        }
        if (typeof state.original === 'object') {
          return Utils.equalsFilter(state.value, state.original,
            ['__propPath', '__created', '__prototype', '__rootConfig', '__state']);
        }
        if (typeof state.original !== 'undefined') {
          return state.value === state.original;
        }

        const keys = Object.keys(state);

        for (const key of keys) {
          if (settingsSame(state[key]) === false) {
            return false;
          }
        }

        return true;
      };

      this.changed = !settingsSame(this.states);
    }, 0);
  };

  ngOnInit(): void {
    if (
      !this.authService.isAuthenticated() ||
      this.authService.user.value.role < UserRoles.Admin
    ) {
      this.navigation.toLogin();
      return;
    }
    this.getSettings();

    // TODO: fix after this issue is fixed: https://github.com/angular/angular/issues/24818
    this.subscription = this.form.valueChanges.subscribe(() => {
      this.onOptionChange();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
    if (this.settingsSubscription != null) {
      this.settingsSubscription.unsubscribe();
    }
  }

  public reset(): void {
    this.getSettings();
  }

  stateToSettings(): T {
    return WebConfigClassBuilder.attachInterface(this.states.value).toJSON();
  }

  public async save(): Promise<boolean> {
    this.inProgress = true;
    this.error = '';
    try {
      await this.settingsService.updateSettings(this.stateToSettings(), this.ConfigPath);
      await this.getSettings();
      this.notification.success(
        this.Name + ' ' + $localize`settings saved`,
        $localize`Success`
      );
      this.inProgress = false;
      return true;
    } catch (err) {
      console.error(err);
      if (err.message) {
        this.error = (err as ErrorDTO).message;
      }
    }

    this.inProgress = false;
    return false;
  }

  private async getSettings(): Promise<void> {
    await this.settingsService.getSettings();
    this.changed = false;
  }
}



