export interface ISettingsService<T> {
  getSettings(): Promise<T>;
  updateSettings(settings: T): Promise<void>;
  testSettings(settings: T): Promise<void> ;
}
