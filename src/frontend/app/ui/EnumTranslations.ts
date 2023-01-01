import {UserRoles} from '../../../common/entities/UserDTO';
import {ConfigPriority, MapProviders, NavigationLinkTypes} from '../../../common/config/public/ClientConfig';
import {ReIndexingSensitivity} from '../../../common/config/private/PrivateConfig';
import {SortingMethods} from '../../../common/entities/SortingMethods';

export const EnumTranslations: Record<string, string> = {};
export const enumToTranslatedArray = (EnumType: any): { key: number; value: string }[] => {
  const arr: Array<{ key: number; value: string }> = [];
  for (const enumMember in EnumType) {
    const key = parseInt(enumMember, 10);
    if (key >= 0) {
      arr.push({key, value: EnumTranslations[EnumType[enumMember]] || EnumType[enumMember]});
    }
  }
  return arr;
};
EnumTranslations[UserRoles[UserRoles.Developer]] = $localize`Developer`;
EnumTranslations[UserRoles[UserRoles.Admin]] = $localize`Admin`;
EnumTranslations[UserRoles[UserRoles.User]] = $localize`User`;
EnumTranslations[UserRoles[UserRoles.Guest]] = $localize`Guest`;
EnumTranslations[UserRoles[UserRoles.LimitedGuest]] = $localize`LimitedGuest`;


EnumTranslations[ConfigPriority[ConfigPriority.basic]] = $localize`Basic`;
EnumTranslations[ConfigPriority[ConfigPriority.advanced]] = $localize`Advanced`;
EnumTranslations[ConfigPriority[ConfigPriority.underTheHood]] = $localize`Under the hood`;

EnumTranslations[MapProviders[MapProviders.Custom]] = $localize`Custom`;
EnumTranslations[MapProviders[MapProviders.OpenStreetMap]] = $localize`OpenStreetMap`;
EnumTranslations[MapProviders[MapProviders.Mapbox]] = $localize`Mapbox`;


EnumTranslations[ReIndexingSensitivity[ReIndexingSensitivity.low]] = $localize`low`;
EnumTranslations[ReIndexingSensitivity[ReIndexingSensitivity.high]] = $localize`high`;
EnumTranslations[ReIndexingSensitivity[ReIndexingSensitivity.medium]] = $localize`medium`;


EnumTranslations[SortingMethods[SortingMethods.descDate]] = $localize`descending date`;
EnumTranslations[SortingMethods[SortingMethods.ascDate]] = $localize`ascending date`;
EnumTranslations[SortingMethods[SortingMethods.descName]] = $localize`descending name`;
EnumTranslations[SortingMethods[SortingMethods.ascName]] = $localize`ascending name`;
EnumTranslations[SortingMethods[SortingMethods.descRating]] = $localize`descending rating`;
EnumTranslations[SortingMethods[SortingMethods.ascRating]] = $localize`ascending rating`;
EnumTranslations[SortingMethods[SortingMethods.random]] = $localize`random`;


EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.url]] = $localize`Url`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.search]] = $localize`Search`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.gallery]] = $localize`Gallery`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.albums]] = $localize`Albums`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.faces]] = $localize`Faces`;
