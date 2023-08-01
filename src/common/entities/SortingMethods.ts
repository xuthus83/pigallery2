/**
 * Order of these enums determines the order in the UI.
 * Keep spaces between the values, so new value can be added in between without changing the existing ones
 */
export enum SortingMethods {
  ascName = 10,
  descName = 11,
  ascDate = 20,
  descDate = 21,
  ascRating = 30,
  descRating = 31,
  ascPersonCount = 40,
  descPersonCount = 41,
  random = 100 // let's keep random as the last in the UI
}
