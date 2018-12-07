import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {Utils} from '../../../../common/Utils';
import {OSM_TILE_LAYER_URL} from '@yaga/leaflet-ng2';
import {Config} from '../../../../common/config/public/Config';
import {ClientConfig} from '../../../../common/config/public/ConfigClass';

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
        lat: parseFloat(elements[i].getAttribute('lat')),
        lng: parseFloat(elements[i].getAttribute('lon'))
      });
    }
    return points;
  }


  public get Attributions(): string[] {
    return ['&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'];
  }

  public get MapLayer(): string {
    if (Config.Client.Map.mapProvider === ClientConfig.MapProviders.Custom) {
      return Config.Client.Map.tileUrl;
    }
    return OSM_TILE_LAYER_URL;
  }

}


export interface MapPath {
  lat: number;
  lng: number;
}
