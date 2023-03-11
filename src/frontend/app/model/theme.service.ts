import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Config} from '../../../common/config/public/Config';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  mode: ThemeMode = ThemeMode.light;
  public readonly darkMode: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly matcher = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.darkMode.subscribe((darkMode: boolean) => {
        this.applyMode(darkMode);
      }
    );
  }

  listenToModePreference() {
    if (this.mode !== ThemeMode.auto) {
      return;
    }
    this.darkMode.next(window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.matcher.addEventListener('change', event => {
      this.darkMode.next(event.matches);
    });
  }

  stopListening() {
    this.matcher.removeAllListeners();
  }

  applyMode(darkMode: boolean) {
    if (!Config.Gallery.Themes.enabled) {
      return;
    }
    if (!darkMode) {
      document.documentElement.removeAttribute('data-bs-theme');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
  }

  setMode(mode: ThemeMode) {
    this.mode = mode;
    if (this.mode === ThemeMode.light) {
      this.darkMode.next(false);
      this.stopListening();
    } else if (this.mode === ThemeMode.dark) {
      this.darkMode.next(true);
      this.stopListening();
    } else if (this.mode === ThemeMode.auto) {
      this.listenToModePreference();
    }
  }


  toggleMode() {
    switch (this.mode) {
      case ThemeMode.light:
        this.setMode(ThemeMode.dark);
        break;
      case ThemeMode.dark:
        this.setMode(ThemeMode.auto);
        break;
      case ThemeMode.auto:
        this.setMode(ThemeMode.light);
        break;
    }
  }
}

export enum ThemeMode {
  light = 1, dark, auto
}

export enum AppliedThemeMode {
  light = 1, dark
}
