export interface ISettingsService<T> {
  getSettings(): Promise<T>;
  updateSettings(settings: T): Promise<void>;
}
