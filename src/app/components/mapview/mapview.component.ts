import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

import * as L from 'leaflet';
import {icon, Marker} from 'leaflet';
import {Feature, Geometry, FeatureCollection} from 'geojson';
import osmtogeojson from 'osmtogeojson';

import {HttpClient} from '@angular/common/http';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {FeatureDetailComponent} from '../feature-detail/feature-detail.component';

@Component({
  selector: 'app-mapview',
  templateUrl: './mapview.component.html',
  styleUrls: ['./mapview.component.scss']
})
export class MapviewComponent implements AfterViewInit {

  public loading = false;

  private map: L.Map;

  @ViewChild('map')
  private mapContainer: ElementRef<HTMLElement>;

  constructor(private http: HttpClient,
              private featureDetail: MatBottomSheet) {
    const iconRetinaUrl = 'assets/img/marker-icon-2x.png';
    const iconUrl = 'assets/img/marker-icon.png';
    const shadowUrl = 'assets/img/marker-shadow.png';
    const iconDefault = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    Marker.prototype.options.icon = iconDefault;
  }

  private buildOverpassApiUrl(overpassQuery): string {
    const bounds = this.map.getBounds().getSouth()
      + ','
      + this.map.getBounds().getWest()
      + ','
      + this.map.getBounds().getNorth()
      + ','
      + this.map.getBounds().getEast();

    const nodeQuery = 'node[' + overpassQuery + '](' + bounds + ');';
    const wayQuery = 'way[' + overpassQuery + '](' + bounds + ');';
    const relationQuery = 'relation[' + overpassQuery + '](' + bounds + ');';
    const query = '?data=[out:json][timeout:15];(' + nodeQuery + wayQuery + relationQuery + ');out body geom;';
    const baseUrl = 'https://overpass-api.de/api/interpreter';
    const resultUrl = baseUrl + query;
    return resultUrl;
  }

  ngAfterViewInit(): void {
    this.map = new L.Map(this.mapContainer.nativeElement);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors</a>'
    }).addTo(this.map);

    this.map.attributionControl
      .setPrefix('')
      .addAttribution(
        'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap <a href="https://www.openstreetthis.map.org/copyright" target="_blank">contributors</a>'
      );

    this.map.invalidateSize();
    this.map.locate({setView: true, maxZoom: 16, watch: false});
    L.control.scale().addTo(this.map);
  }

  private showDetails(feature: any): void {
    this.featureDetail.open(FeatureDetailComponent, {data: feature});
  }

  public onEachFeature(feature, layer): void {
    layer.on('click', () => {
      this.showDetails(feature);
    });
  }

  public showPlaygrounds(): void {
    this.loading = true;
    const url = this.buildOverpassApiUrl('leisure=playground');
    this.http.get(url)
      .subscribe(data => {
        L.geoJSON(osmtogeojson(data) as FeatureCollection, {
          style(): any {
            return {
              color: '#ff0000'
            };
          },
          filter(feature: Feature<Geometry, any>): boolean {
            if ((feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === 'Polygon')) {
              (feature.geometry as any).type = 'Point';
              const polygonCenter = L.latLngBounds((feature.geometry as any).coordinates[0]).getCenter();
              (feature.geometry as any).coordinates = [polygonCenter.lat, polygonCenter.lng];
            }
            return true;
          },
          onEachFeature: this.onEachFeature.bind(this)
        }).addTo(this.map);

        this.loading = false;
      });
  }
}
