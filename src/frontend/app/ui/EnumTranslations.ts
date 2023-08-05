import {UserRoles} from '../../../common/entities/UserDTO';
import {ConfigPriority, MapProviders, NavigationLinkTypes} from '../../../common/config/public/ClientConfig';
import {ReIndexingSensitivity} from '../../../common/config/private/PrivateConfig';
import {SortingMethods} from '../../../common/entities/SortingMethods';
import {SearchQueryTypes} from '../../../common/entities/SearchQueryDTO';
import {ConfigStyle} from './settings/settings.service';

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


EnumTranslations[ConfigStyle[ConfigStyle.full]] = $localize`Full`;
EnumTranslations[ConfigStyle[ConfigStyle.compact]] = $localize`Compact`;

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
EnumTranslations[SortingMethods[SortingMethods.ascPersonCount]] = $localize`ascending persons`;
EnumTranslations[SortingMethods[SortingMethods.descPersonCount]] = $localize`descending persons`;


EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.url]] = $localize`Url`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.search]] = $localize`Search`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.gallery]] = $localize`Gallery`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.albums]] = $localize`Albums`;
EnumTranslations[NavigationLinkTypes[NavigationLinkTypes.faces]] = $localize`Faces`;


EnumTranslations[SearchQueryTypes[SearchQueryTypes.AND]] = $localize`And`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.OR]] = $localize`Or`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.SOME_OF]] = $localize`Some of`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.any_text]] = $localize`Any text`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.from_date]] = $localize`From`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.to_date]] = $localize`Until`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.distance]] = $localize`Distance`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.min_rating]] = $localize`Min rating`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.max_rating]] = $localize`Max rating`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.min_person_count]] = $localize`Min persons`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.max_person_count]] = $localize`Max persons`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.min_resolution]] = $localize`Min resolution`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.max_resolution]] = $localize`Max resolution`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.directory]] = $localize`Directory`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.file_name]] = $localize`File name`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.caption]] = $localize`Caption`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.orientation]] = $localize`Orientation`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.date_pattern]] = $localize`Date pattern`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.position]] = $localize`Position`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.person]] = $localize`Person`;
EnumTranslations[SearchQueryTypes[SearchQueryTypes.keyword]] = $localize`Keyword`;

