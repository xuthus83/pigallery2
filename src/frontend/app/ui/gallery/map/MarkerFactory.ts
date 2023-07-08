import {DivIcon, setOptions} from 'leaflet';

export interface SvgIconOptions {
  color?: string;
  svgPath?: string;
  viewBox?: string;
  small?: boolean;
}

const SvgIcon: { new(options?: SvgIconOptions): DivIcon } = DivIcon.extend({
  initialize: function(options: SvgIconOptions = {}) {
    options.color = options.color || 'var(--bs-primary)';
    options.svgPath = options.svgPath || 'M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512z';
    options.viewBox = options.viewBox || '0 0 512 512';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + options.viewBox + '"><path fill="' + options.color + '" d="' + options.svgPath + '"/></svg>';
    setOptions(this, {
      iconSize: options.small ? [15, 15] : [30, 30],
      iconAnchor: options.small ? [15, 28] : [15, 35],
      popupAnchor: options.small ? [0, -15] : [0, -30],
      className: 'custom-div-icon' + (options.small ? ' marker-svg-small' : ''),
      html: '<div class="marker-svg-wrapper"><div class="marker-svg-shadow"></div>' +
        '<div  class="marker-svg-pin" style="border-color: ' + options.color + '">' +
        '</div>' + svg + '</div>',
    });
  }
});

export class MarkerFactory {
  public static readonly defIcon = MarkerFactory.getSvgIcon();
  public static readonly defIconSmall = MarkerFactory.getSvgIcon({small: true});


  static getSvgIcon(options?: SvgIconOptions) {
    return new SvgIcon(options);
  }

}
