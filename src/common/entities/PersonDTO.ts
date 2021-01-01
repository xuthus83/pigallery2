import {FaceRegionEntry} from '../../backend/model/database/sql/enitites/FaceRegionEntry';

export interface PersonWithSampleRegion extends PersonDTO {
  sampleRegion: FaceRegionEntry;
}

export interface PersonDTO {
  id: number;
  name: string;
  count: number;
  readyThumbnail?: boolean;
  isFavourite: boolean;
}


export class Person implements PersonDTO {
  isFavourite: boolean;
  count: number;
  id: number;
  name: string;


  constructor() {
  }

  public static getThumbnailUrl(that: PersonDTO): string {
    return '/api/person/' + that.name + '/thumbnail';
  }
}
