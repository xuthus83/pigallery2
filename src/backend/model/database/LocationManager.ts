import {GPSMetadata} from '../../../common/entities/PhotoDTO';


export class LocationManager {

  async getGPSData(text: string): Promise<GPSMetadata> {
    return {
      longitude: 0,
      latitude: 0,
      altitude: 0
    };
  }

}
