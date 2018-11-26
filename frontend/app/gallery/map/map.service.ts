import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {Utils} from '../../../../common/Utils';

@Injectable()
export class MapService {


  constructor(private networkService: NetworkService) {
  }


  public calcDistance(loc: MapPath, loc2: MapPath): number {
    const radlat1 = Math.PI * loc.latitude / 180;
    const radlat2 = Math.PI * loc2.latitude / 180;
    const theta = loc.longitude - loc2.longitude;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist * 1.609344;
  }

  public async getMapPath(file: FileDTO): Promise<MapPath[]> {
    const filePath = Utils.concatUrls(file.directory.path, file.directory.name, file.name);
    const gpx = await this.networkService.getXML('/gallery/content/' + filePath);
    const elements = gpx.getElementsByTagName('trkpt');
    const points: MapPath[] = [];
    for (let i = 0; i < elements.length; i++) {
      points.push({
        latitude: parseFloat(elements[i].getAttribute('lat')),
        longitude: parseFloat(elements[i].getAttribute('lon'))
      });
    }
    return points;
  }

}


export interface MapPath {
  latitude: number;
  longitude: number;
}
