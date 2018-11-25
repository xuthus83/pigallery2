import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {Utils} from '../../../../common/Utils';

@Injectable()
export class MapService {


  constructor(private networkService: NetworkService) {
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
