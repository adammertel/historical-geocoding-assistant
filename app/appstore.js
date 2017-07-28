import { observable, action, computed } from 'mobx';
import Sheet from './sheet.js'
import Base from './base.js'

export default class AppStore {
    @observable columns = {
        name: 'name',
        x: 'x',
        y: 'y'
    };

    @observable config = {
        focusZoom: 12,
        defaultZoom: 6,
        defaultCenter: [45, 10],
    };
    
    @observable recordRow = 2;
    @observable records = {};
    @observable wikiText = '';
    @observable geonames = [];
    

    @observable map = {
        center: this.config.defaultCenter,
        zoom: this.config.defaultZoom
    };
    @observable mapOpacityRatio = 0; 
    @observable map1Id = false; 
    @observable map2Id = false;

    @observable overlays = [
      {id: 'COUNTRIES_MODERN', opacity: 0.7}
    ];

    @observable geonamePoint = false;

    constructor () {
        this.noRecords = 65;
        this.updateData();
        this.map1Id = Object.keys(window['basemaps'])[1]; 
        this.map2Id = Object.keys(window['basemaps'])[0]; 
    }

    /*
        GETTERS
    */

    // map
    @computed get mapPosition () { 
        return [this.map.center[0], this.map.center[1]];
    };
    @computed get mapZoom () { 
        return this.map.zoom;
    };

    @computed get basemap1 () {
        return this.basemapById(this.map1Id);
    }

    @computed get basemap2 () {
        return this.basemapById(this.map2Id);
    }

    @computed get recordData () {
        return this.records[this.recordRow] ? 
            Object.assign(this.records[this.recordRow], {}) : {}
    }

    @computed get recordName () {
        return this.recordData[this.columns.name];
    }

    @computed get recordX () {
        return this.recordData[this.columns.x];
    }
    @computed get recordY () {
        return this.recordData[this.columns.y];
    }
    @computed get wikiTextShort () {
        if (!this.wikiText) {
            return 'not found'
        } else {
            return this.wikiText.split('</p>')[0] + '</p>' + this.wikiText.split('</p>')[1] + '</p>';
        }
    }
    @computed get geoRecords () {
        return Object.keys(this.records).map( rowNo => {
            const record = this.records[rowNo];
            return {
                x: record[this.columns.x],
                y: record[this.columns.y],
                name: record[this.columns.name],
                row: rowNo
            }
        }) 
    }
    @computed get activeGeoRecord () {
        return this.geoRecords.find(record => record.row.toString() === this.recordRow.toString());
    }


    /* 
        ACTIONS
    */

    // map
    @action mapMoved = (change) => {
        this.map.center = change.center;
        this.map.zoom = change.zoom;
    };
    @action mapCenterChange = (center) => this.map.center = center;
    @action mapZoomChange = (zoom) => this.map.zoom = zoom;

    @action defaultMapState = () => {
        this.map.zoom = this.config.defaultZoom;
        this.map.center = this.config.defaultCenter;
    }
    // pan and zoom to active record
    @action focusRecord = () => {
        if (Base.validGeo(this.activeGeoRecord)) {
            this.map.center = [
                parseFloat(this.activeGeoRecord.y),
                parseFloat(this.activeGeoRecord.x)
            ]
            this.map.zoom = this.config.focusZoom;
        } else {
            this.defaultMapState();
        }
    }

    @action locateGeoname = (geoname) => {
        if (this.geonameTimeout) {clearTimeout(this.geonameTimeout);};
        this.mapCenterChange(geoname.ll);
        this.geonamePoint = geoname.ll;
        this.geonameTimeout = setTimeout( () => {this.geonamePoint = false}, 2000 )
    }

    @action useGeoname = (geoname) => {
        this.updateRecordLocation(geoname.ll[1], geoname.ll[0])
        this.mapCenterChange(geoname.ll);
    }

    @action updateRecordLocation = (x, y) => {
        this.updateRecordValue(this.columns.y, y);
        this.updateRecordValue(this.columns.x, x);
    } 

    // wiki
    @action updateWiki = () => {
        Base.geonames(this.recordName, (response) => {
            this.geonames = response
        })
        Base.wiki(this.recordName, (response) => {
            this.wikiText = response;
        });
    }

    // map tiles
    @action changeOpacityRatio = (opacity) => {
        this.mapOpacityRatio = opacity;
    }

    @action changeOpacityRatio = (opacity) => {
        this.mapOpacityRatio = opacity;
    }

    @action changeBaseMap = (mid, bmid) => {
        this['map' + mid + 'Id'] = bmid;
    }

    // map overlays
    @action addOverlay = (overlayId) => {
      const foundOverlay = this.overlays.find( ov => ov.id === overlayId );
      if (!foundOverlay) {
        this.overlays.push(
          {
            id: overlayId,
            opacity: 1
          }
        )
      }
    }
    @action overlayChangeOpacity = (overlayId, newOpacity) => {
        const foundOverlay = this.overlays.find( ov => ov.id === overlayId );
        if (foundOverlay) {
            foundOverlay.opacity = newOpacity;
        }
    }
    @action overlayRemove = (overlayId) => {
        const clonedOverlays = this.overlays.slice();
        this.overlays = clonedOverlays.filter( ov => ov.id !== overlayId );
    }
    @action overlayMoveUp = (overlayId) => {
        const clonedOverlays = this.overlays.slice();
        
        const fromIndex = clonedOverlays.findIndex( ov => ov.id === overlayId );
        const toIndex = fromIndex - 1;
        
        if (toIndex > -1) {
            clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0] );
            this.overlays = clonedOverlays;
        }
    }
    @action overlayMoveDown = (overlayId) => {
        const clonedOverlays = this.overlays.slice();
        
        const fromIndex = clonedOverlays.findIndex( ov => ov.id === overlayId );
        const toIndex = fromIndex + 1;
        
        if (toIndex < clonedOverlays.length) {
            clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0] );
            this.overlays = clonedOverlays;
        }
    }


    // changing recordRow
    @action nextRecord = () => {
        this.recordRow = this.recordRow === this.noRecords ? 1 : this.recordRow + 1;
        this.updateData();
    }

    @action previousRecord = () => {
        this.recordRow = this.recordRow === 2 ? this.noRecords : this.recordRow - 1;
        this.updateData();
    }
    
    @action gotoRecord = (recordRow) => {
        this.recordRow = recordRow;
        this.updateData();
    }

    // new data are loaded
    @action updateData = () => {
        Sheet.readAllLines( this.noRecords, (data) => {
            this.records = data;
            this.updateWiki();
            //this.focusRecord();
        });
    }

    // locally store new values
    @action updateRecordValue = (column, value) => {
        this.records[this.recordRow][column] = value;
        if (column === this.columns.name) {
            this.updateWiki();
        }
    }

    // save local values to sheet
    @action saveRecord = () => {
        Sheet.updateLine(this.recordRow, Object.values(this.recordData), () => {
            this.updateData();
        })
    }


    /*
        METHODS
    */

    basemapById (basemapId) { 
        return window['basemaps'][basemapId];

    };
}