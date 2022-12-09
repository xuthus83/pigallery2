import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LightboxService {
  public captionAlwaysOn = false;
  public facesAlwaysOn = false;
  public loopVideos = false;

}
