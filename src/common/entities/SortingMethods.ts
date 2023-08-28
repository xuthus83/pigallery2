/**
 * Order of these enums determines the order in the UI.
 * Keep spaces between the values, so new value can be added in between without changing the existing ones
 */
export enum SortingByTypes {
  Name = 10,
  Date = 20,
  Rating = 30,
  PersonCount = 40,
  random = 100 // let's keep random as the last in the UI
}

export interface SortingMethod {
  method: SortingByTypes;
  ascending: boolean;
}
