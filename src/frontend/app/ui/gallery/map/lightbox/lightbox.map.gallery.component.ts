import {Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, ViewChild,} from '@angular/core';
import {PhotoDTO} from '../../../../../../common/entities/PhotoDTO';
import {Dimension} from '../../../../model/IRenderable';
import {FullScreenService} from '../../fullscreen.service';
import {IconThumbnail, Thumbnail, ThumbnailBase, ThumbnailManagerService,} from '../../thumbnailManager.service';
import {MediaIcon} from '../../MediaIcon';
import {Media} from '../../Media';
import {PageHelper} from '../../../../model/page.helper';
import {FileDTO} from '../../../../../../common/entities/FileDTO';
import {Utils} from '../../../../../../common/Utils';
import {Config} from '../../../../../../common/config/public/Config';
import {MapService} from '../map.service';
import {
  control,
  Control,
  divIcon,
  DivIcon,
  icon,
  latLng,
  latLngBounds,
  layerGroup,
  LayerGroup,
  Map,
  MapOptions,
  Marker,
  marker,
  markerClusterGroup,
  MarkerClusterGroup,
  Point,
  polyline,
  tileLayer,
  TileLayer
} from 'leaflet';
import {LeafletControlLayersConfig} from '@asymmetrik/ngx-leaflet';
import {ThemeService} from '../../../../model/theme.service';
import {Subscription} from 'rxjs';
import {MarkerFactory} from '../MarkerFactory';


@Component({
  selector: 'app-gallery-map-lightbox',
  styleUrls: ['./lightbox.map.gallery.component.css'],
  templateUrl: './lightbox.map.gallery.component.html',
})
export class GalleryMapLightboxComponent implements OnChanges, OnDestroy {
  @Input() photos: PhotoDTO[];
  @Input() gpxFiles: FileDTO[];
  public lightboxDimension: Dimension = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  } as Dimension;
  public mapDimension: Dimension = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  } as Dimension;
  public visible = false;
  public controllersVisible = false;
  public opacity = 1.0;
  @ViewChild('root', {static: true}) elementRef: ElementRef;
  public mapOptions: MapOptions = {
    zoom: 2,
    // setting max zoom is needed to MarkerCluster https://github.com/Leaflet/Leaflet.markercluster/issues/611
    maxZoom: 2,
    center: latLng(0, 0),
  };
  defLayer: TileLayer;
  darkLayer: TileLayer;
  private smallIconSize = new Point(
    Config.Media.Thumbnail.iconSize * 0.75,
    Config.Media.Thumbnail.iconSize * 0.75
  );
  private iconSize = new Point(
    Config.Media.Thumbnail.iconSize,
    Config.Media.Thumbnail.iconSize
  );
  private usedIconSize = this.iconSize;
  private mapLayersControlOption: LeafletControlLayersConfig & {
    overlays: {
      Photos: MarkerClusterGroup;
      [name: string]: LayerGroup;
    };
  } = {
    baseLayers: {},
    overlays: {
      Photos: markerClusterGroup({
        maxClusterRadius: 20,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          let size: number;
          let c = ' marker-cluster-';
          if (childCount < 10) {
            c += 'small';
            size = 30;
          } else if (childCount < 100) {
            c += 'medium';
            size = 40;
          } else {
            c += 'large';
            size = 50;
          }

          return divIcon({
            html: '<div><span>' + childCount + '</span></div>',
            className: 'marker-cluster' + c,
            iconSize: new Point(size, size),
          });
        },
      }),
    },
  };
  // ordered list
  private pathLayersConfigOrdered = [
    {
      name: $localize`Transportation`,
      matchers: [/flight/i, /flying/i, /drive/i, /driving/i] as RegExp[],
      layer: layerGroup([]),
      theme: {color: 'var(--bs-orange)', dashArray: '4 8'},
      icon: null as DivIcon,
      svgIcon: {
        width: 567,
        path: 'M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z'
      }
    },
    {
      name: $localize`Sport`,
      matchers: [/run/i, /walk/i, /hike/i, /hiking/i, /bike/i, /biking/i, /cycling/i] as RegExp[],
      layer: layerGroup([]),
      theme: {color: 'var(--bs-primary)'},
      svgIcon: {
        width: 417,
        path: 'M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H362.7c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h69.6c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z'
      }
    },
    {
      name: $localize`Other paths`,
      matchers: null as RegExp[], layer: layerGroup([]), theme: {color: 'var(--bs-secondary)'}
    }
  ];
  mapLayerControl: Control.Layers;
  private thumbnailsOnLoad: ThumbnailBase[] = [];
  private startPosition: Dimension = null;
  private leafletMap: Map;
  darkModeSubscription: Subscription;

  constructor(
    public fullScreenService: FullScreenService,
    private thumbnailService: ThumbnailManagerService,
    public mapService: MapService,
    private themeService: ThemeService
  ) {
    this.setUpPathLayers();
    this.mapOptions.layers = [this.mapLayersControlOption.overlays.Photos];
    this.pathLayersConfigOrdered.forEach(pl => this.mapOptions.layers.push(pl.layer));
    for (let i = 0; i < mapService.Layers.length; ++i) {
      const l = mapService.Layers[i];
      const tl = tileLayer(l.url, {attribution: mapService.Attributions});
      if (l.url === mapService.MapLayer.url) {
        this.defLayer = tl;
      }
      if (l.url === mapService.DarkMapLayer.url) {
        this.darkLayer = tl;
      }
      this.mapLayersControlOption.baseLayers[l.name] = tl;
    }
    if (!this.defLayer || !this.darkLayer) {
      throw new Error('Cant find default or dark layer');
    }
    this.mapOptions.layers.push(this.themeService.darkMode.value ? this.darkLayer : this.defLayer);

    this.mapLayerControl = control.layers(
      this.mapLayersControlOption.baseLayers,
      this.mapLayersControlOption.overlays,
      {position: 'bottomright'}
    );

    // update map theme on dark theme
    this.darkModeSubscription = this.themeService.darkMode.subscribe(this.selectBaseLayer);
  }

  setUpPathLayers() {
    this.pathLayersConfigOrdered.forEach(pl => {
      pl.icon = MarkerFactory.getSvgIcon({color: pl.theme.color, svgPath: pl.svgIcon?.path, width: pl.svgIcon?.width});
      this.mapLayersControlOption.overlays[pl.name] = pl.layer;
    });
  }

  ngOnDestroy(): void {
    this.darkModeSubscription.unsubscribe();
  }

  private selectBaseLayer = () => {
    if (!this.leafletMap) {
      return;
    }
    if (this.leafletMap.hasLayer(this.defLayer) && this.themeService.darkMode.value) {
      this.leafletMap.removeLayer(this.defLayer);
      this.leafletMap.addLayer(this.darkLayer);
    }
    if (this.leafletMap.hasLayer(this.darkLayer) && !this.themeService.darkMode.value) {
      this.leafletMap.removeLayer(this.darkLayer);
      this.leafletMap.addLayer(this.defLayer);
    }
  };

  private static getScreenWidth(): number {
    return window.innerWidth;
  }

  private static getScreenHeight(): number {
    return window.innerHeight;
  }

  ngOnChanges(): void {
    if (this.visible === false) {
      return;
    }
    this.showImages();
  }

  @HostListener('window:resize', ['$event'])
  async onResize(): Promise<void> {
    this.lightboxDimension = {
      top: 0,
      left: 0,
      width: GalleryMapLightboxComponent.getScreenWidth(),
      height: GalleryMapLightboxComponent.getScreenHeight(),
    } as Dimension;
    this.mapDimension = {
      top: 0,
      left: 0,
      width: GalleryMapLightboxComponent.getScreenWidth(),
      height: GalleryMapLightboxComponent.getScreenHeight(),
    } as Dimension;
    await Utils.wait(0);
    this.leafletMap.invalidateSize();
  }

  public async show(position: Dimension): Promise<void> {
    this.clearMap();
    this.visible = true;
    this.opacity = 1.0;
    this.startPosition = position;
    this.lightboxDimension = Utils.clone(position);
    this.lightboxDimension.top -= PageHelper.ScrollY;
    this.mapDimension = {
      top: 0,
      left: 0,
      width: GalleryMapLightboxComponent.getScreenWidth(),
      height: GalleryMapLightboxComponent.getScreenHeight(),
    } as Dimension;
    this.showImages();
    //  this.centerMap();
    PageHelper.hideScrollY();
    await Utils.wait(0);
    this.lightboxDimension = {
      top: 0,
      left: 0,
      width: GalleryMapLightboxComponent.getScreenWidth(),
      height: GalleryMapLightboxComponent.getScreenHeight(),
    } as Dimension;
    await Utils.wait(350);
    this.leafletMap.invalidateSize();
    this.centerMap();
    this.controllersVisible = true;
  }

  public hide(): void {
    this.fullScreenService.exitFullScreen();
    this.controllersVisible = false;
    const to = this.startPosition;

    // if target image out of screen -> scroll to there
    if (
      PageHelper.ScrollY > to.top ||
      PageHelper.ScrollY + GalleryMapLightboxComponent.getScreenHeight() <
      to.top
    ) {
      PageHelper.ScrollY = to.top;
    }

    this.lightboxDimension = this.startPosition;
    this.lightboxDimension.top -= PageHelper.ScrollY;
    PageHelper.showScrollY();
    this.opacity = 0.0;
    setTimeout((): void => {
      this.visible = false;
      this.clearMap();
      this.leafletMap.setZoom(2);
    }, 500);
  }

  showImages(): void {
    this.clearImages();

    // make sure to enable photos layers when opening map
    if (
      this.leafletMap &&
      !this.leafletMap.hasLayer(this.mapLayersControlOption.overlays.Photos)
    ) {
      this.leafletMap.addLayer(this.mapLayersControlOption.overlays.Photos);
    }
    this.thumbnailsOnLoad = [];
    this.photos
      .filter((p): number => {
        return (
          p.metadata &&
          p.metadata.positionData &&
          p.metadata.positionData.GPSData &&
          p.metadata.positionData.GPSData.latitude &&
          p.metadata.positionData.GPSData.longitude
        );
      })
      .forEach((p): void => {
        const mkr = marker({
          lat: p.metadata.positionData.GPSData.latitude,
          lng: p.metadata.positionData.GPSData.longitude,
        });
        this.mapLayersControlOption.overlays.Photos.addLayer(mkr);
        let width = 500;
        let height = 500;
        const size = p.metadata.size;
        if (size.width > size.height) {
          height = width * (size.height / size.width);
        } else {
          width = height * (size.width / size.height);
        }
        const photoTh = this.thumbnailService.getLazyThumbnail(
          new Media(p, width, height)
        );
        this.thumbnailsOnLoad.push(photoTh);

        // Setting popup photo
        const setPopUpPhoto = () => {
          const photoPopup =
            `<img style="width: ${width}px; height: ${height}px" ` +
            `src="${photoTh.Src}" alt="preview">`;
          if (!mkr.getPopup()) {
            mkr.bindPopup(photoPopup, {minWidth: width});
          } else {
            mkr.setPopupContent(photoPopup);
          }
        };

        if (photoTh.Available) {
          setPopUpPhoto();
        } else {
          const noPhotoPopup = `<div class="lightbox-map-gallery-component-preview-loading"
                                 style="width: ${width}px; height: ${height}px">
                  <span class="oi ${photoTh.Error ? 'oi-warning' : 'oi-image'}"
                        aria-hidden="true">
                  </span>
                  </div>`;

          mkr.bindPopup(noPhotoPopup, {minWidth: width});
          mkr.on('popupopen', () => {
            photoTh.load();
            photoTh.CurrentlyWaiting = true;
          });
          photoTh.OnLoad = setPopUpPhoto;
        }

        mkr.setIcon(MarkerFactory.defIcon);
        // Setting photo icon
        if (Config.Map.useImageMarkers === true) {
          mkr.on('add', () => {
            mkr.off('add');
            const iconTh = this.thumbnailService.getIcon(new MediaIcon(p));
            this.thumbnailsOnLoad.push(iconTh);
            iconTh.Visible = true;
            const setIcon = () => {
              mkr.setIcon(
                icon({
                  iconUrl: iconTh.Src,
                  iconSize: this.usedIconSize, // size of the icon
                  className: 'photo-icon',
                })
              );
              mkr.options.alt = p.name;
              mkr.on('mouseover', () => {
                mkr.getIcon().options.iconSize = [
                  this.usedIconSize.x * 1.5,
                  this.usedIconSize.y * 1.5,
                ];
                mkr.setIcon(mkr.getIcon());
              });
              mkr.on('mouseout', () => {
                mkr.getIcon().options.iconSize = this.usedIconSize;
                mkr.setIcon(mkr.getIcon());
              });
            };
            if (iconTh.Available === true) {
              setIcon();
            } else {
              iconTh.OnLoad = setIcon;
            }
          });
        }
      });
    if (this.gpxFiles) {
      this.loadGPXFiles().catch(console.error);
    }
  }

  public loadPreview(mp: MapPhoto): void {
    mp.preview.thumbnail.load();
    mp.preview.thumbnail.CurrentlyWaiting = true;
  }

  clearMap() {
    this.clearImages();
    this.clearPath();
  }

  clearImages(): void {
    this.thumbnailsOnLoad.forEach((th): void => {
      th.destroy();
    });
    this.thumbnailsOnLoad = [];

    this.mapLayersControlOption.overlays.Photos.clearLayers();
  }

  clearPath(): void {
    this.pathLayersConfigOrdered.forEach(p => p.layer.clearLayers());

  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (this.visible !== true) {
      return;
    }
    switch (event.key) {
      case 'f':
      case 'F':
        if (this.fullScreenService.isFullScreenEnabled()) {
          this.fullScreenService.exitFullScreen();
        } else {
          this.fullScreenService.showFullScreen(this.elementRef.nativeElement);
        }
        break;
      case 'Escape':
        this.hide();
        break;
    }
  }

  onMapReady(map: Map): void {
    this.leafletMap = map;
    this.leafletMap.setMaxZoom(undefined);
    this.leafletMap.zoomControl.setPosition('bottomright');
    this.mapLayerControl.addTo(this.leafletMap);
  }

  onLeafletZoom(): void {
    if (Config.Map.useImageMarkers === false) {
      return;
    }
    if (
      (this.leafletMap.getZoom() < 15 &&
        this.usedIconSize === this.smallIconSize) ||
      (this.leafletMap.getZoom() >= 15 && this.usedIconSize === this.iconSize)
    ) {
      // all set no change needed
      return;
    }
    this.usedIconSize =
      this.leafletMap.getZoom() < 15 ? this.smallIconSize : this.iconSize;
    (
      this.mapLayersControlOption.overlays.Photos.getLayers() as Marker[]
    ).forEach((mkr) => {
      // if alt is not present icon is not yet set, so do not change the size
      if (!mkr.options.alt) {
        return;
      }
      mkr.getIcon().options.iconSize = this.usedIconSize;
      mkr.setIcon(mkr.getIcon());
    });
  }

  private centerMap(): void {
    if (this.mapLayersControlOption.overlays.Photos.getLayers().length === 0) {
      return;
    }
    this.leafletMap.fitBounds(
      latLngBounds(
        (
          this.mapLayersControlOption.overlays.Photos.getLayers() as Marker[]
        ).map((m) => m.getLatLng())
      )
    );
  }

  private async loadGPXFiles(): Promise<void> {
    this.clearPath();
    if (this.gpxFiles.length === 0) {

      this.pathLayersConfigOrdered.forEach(p => {
        // remove from controls
        this.mapLayerControl.removeLayer(p.layer);
        // remove from map
        if (this.leafletMap) {
          this.leafletMap.removeLayer(p.layer);
        }

      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.gpxFiles.length; i++) {
      const file = this.gpxFiles[i];
      const parsedGPX = await this.mapService.getMapCoordinates(file);
      if (file !== this.gpxFiles[i]) {
        // check race condition
        return;
      }
      const pathLayer = this.pathLayersConfigOrdered.find((pl) => {
        console.log(pl.matchers,pl?.matchers?.findIndex(m => m.test(parsedGPX.name)) );
        return pl.matchers === null || // null matchers match everything
          (parsedGPX.name &&
            pl.matchers.findIndex(m => m.test(parsedGPX.name)) !== -1);
      }) || this.pathLayersConfigOrdered[0];

      console.log(parsedGPX.name, pathLayer.theme.color);
      if (parsedGPX.path.length !== 0) {
        // render the beginning of the path with a marker
        const mkr = marker(parsedGPX.path[0]);
        pathLayer.layer.addLayer(mkr);

        mkr.setIcon(pathLayer.icon);

        // Setting popup photo
        mkr.bindPopup(file.name + ': ' + parsedGPX.name);

        pathLayer.layer.addLayer(
          polyline(parsedGPX.path, {
            smoothFactor: 3,
            interactive: false,
            color: pathLayer?.theme?.color,
            dashArray: pathLayer?.theme?.dashArray
          })
        );
      }
      parsedGPX.markers.forEach((mc) => {
        const mkr = marker(mc);
        mkr.setIcon(pathLayer.icon);
        pathLayer.layer.addLayer(mkr);
        mkr.bindPopup($localize`Latitude` + ': ' + mc.lat + ', ' + $localize`longitude` + ': ' + mc.lng);
      });
    }

    // Add layer to the map
    this.pathLayersConfigOrdered.filter(pl => pl.layer.getLayers().length > 0).forEach((pl) => {
      // make sure it does not appear twice
      this.mapLayerControl.removeLayer(
        pl.layer
      );
      this.mapLayerControl.addOverlay(
        pl.layer,
        pl.name
      );
      if (
        this.leafletMap &&
        !this.leafletMap.hasLayer(pl.layer)
      ) {
        this.leafletMap.addLayer(pl.layer);
      }
    });

  }
}

export interface MapPhoto {
  name: string;
  lat: number;
  lng: number;
  iconUrl?: string;
  iconThumbnail: IconThumbnail;
  preview: {
    width: number;
    height: number;
    thumbnail: Thumbnail;
  };
}

