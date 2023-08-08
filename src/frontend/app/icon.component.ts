import {Component, Input} from '@angular/core';
import {Config} from '../../common/config/public/Config';

@Component({
  selector: 'app-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg"
         [attr.width]="width"
         [attr.height]="height"
         fill="currentcolor"
         [attr.viewBox]="Config.Server.svgIcon.viewBox || '0 0 512 512'">
      <path [attr.d]="Config.Server.svgIcon.path"/>
    </svg>`,
})
export class IconComponent {

  @Input() width: number;
  @Input() height: number;

  protected readonly Config = Config;

}
