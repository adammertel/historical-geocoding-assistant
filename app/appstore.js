import { observable, action, computed } from 'mobx';
import Sheet from './sheet.js'
import Base from './base.js'

export default class AppStore {

    @observable config = {
      focusZoom: 12,
      defaultZoom: 6,
      focusOnRecordChange: 0,
      defaultCenter: [45, 10],
      maxGeoExtent: [[-180, -90], [180, 90]],
      wikiNoColumns: 2,
      geonameMaxResults: 10,
      columns: {
        name: '',
        localisation: '',
        x: '',
        y: ''
      }
    };

    @observable openedSettings = true;
    
    @observable recordRow = 2;
    @observable records = {};
    @observable recordBeforeChanges = {};
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

    @observable hlPoint = false;


    constructor () {
      this.noRecords = Sheet.noLines;
      this.map1Id = Object.keys(window['basemaps'])[1]; 
      this.map2Id = Object.keys(window['basemaps'])[0]; 
    }
    
    init (next) {
      this.updateData( () => {
        this.findDefaultColumnNames();
        next();
      });
    }

    @action findDefaultColumnNames() {
      const keywordsDictionary = {
        'name': ['name'],
        'localisation': ['localisation'],
        'x': ['coordinate', 'geo', 'x'],
        'y': ['coordinate', 'geo', 'y']
      }

      Object.keys(keywordsDictionary).map(id => {
        const keywords = keywordsDictionary[id];

        let bestMatch = '';
        let bestMatchOccurences = 0;
        Object.keys(this.recordData).map( column => {
          const columnLowerCase = column.toLowerCase();
          let occurences = 0;
          keywords.map( keyword => {
            if (columnLowerCase.includes(keyword)) {
              occurences += 1;
            }
          });

          if (occurences > bestMatchOccurences) {
            bestMatchOccurences = occurences;
            bestMatch = column;
          }
        })

        this.config.columns[id] = bestMatch;
      })
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

    @computed get configMaxGeoExtent () {
        const geoExtent = this.config.maxGeoExtent;
        return [[geoExtent[0][0], geoExtent[0][1]], [geoExtent[1][0], geoExtent[1][1]]]
    }

    @computed get recordData () {
        return this.records[this.recordRow] ? 
            Object.assign(this.records[this.recordRow], {}) : {}
    }

    @computed get recordName () {
      return this.recordData[this.config.columns.name];
    }

    @computed get recordLocalisation () {
      return this.recordData[this.config.columns.localisation];
    }

    @computed get recordX () {
      return this.recordData[this.config.columns.x];
    }
    @computed get recordY () {
      return this.recordData[this.config.columns.y];
    }
    @computed get recordGeo () {
      return [parseFloat(this.recordY), parseFloat(this.recordX)];
    }
    @computed get wikiTextShort () {
      if (!this.wikiText) {
        return 'not found'
      } else {
        const wikiColumns = this.wikiText.split('</p>');
        let shortenedText = '';
        wikiColumns.map((column, ci) => {
          if (ci < this.config.wikiNoColumns) {
            shortenedText += column + '</p>'
          }
        })
        return shortenedText;
      }
    }
    @computed get geoRecords () {
      return Object.keys(this.records).map( rowNo => {
        const record = this.records[rowNo];
        return {
          x: record[this.config.columns.x],
          y: record[this.config.columns.y],
          name: record[this.config.columns.name],
          row: rowNo
        }
      }) 
    }
    @computed get recordNames () {
      return Object.keys(this.records).map( rowNo => {
        const record = this.records[rowNo];
        return {
          name: record[this.config.columns.name],
          row: rowNo
        }
      }) 
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
      const activeGeoRecord = this.recordGeo;
      if (Base.validGeo(activeGeoRecord)) {
        this.map.center = activeGeoRecord;
        this.map.zoom = this.config.focusZoom;
      } else {
        this.defaultMapState();
      }
    }

    @action mapFocus = (ll) => {
        this.mapCenterChange(ll);
        this.mapZoomChange(this.config.focusZoom);
    }

    @action locateGeoname = (geoname) => {
      this.mapFocus(geoname.ll);
      this.hlLocality(geoname.ll)
    }

    @action hlLocality = (ll) => {
      if (this.hlTimeout) {clearTimeout(this.hlTimeout);};
      this.hlPoint = ll;
      this.hlTimeout = setTimeout( () => {this.hlPoint = false}, 2000 );
    }

    @action useGeoname = (geoname) => {
      this.updateRecordLocation(
        geoname.ll[1], 
        geoname.ll[0]
      );
      this.mapCenterChange(geoname.ll);
    }

    @action updateRecordLocation = (x, y) => {
      this.updateRecordValue(this.config.columns.y, this.roundCoordinate(y));
      this.updateRecordValue(this.config.columns.x, this.roundCoordinate(x));
    } 

    // wiki
    @action updateWiki = () => {
      Base.geonames(this.recordName, this.config.geonameMaxResults, this.config.maxGeoExtent, (response) => {
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

    // map overlayrow
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
      this.recordRow = parseInt(recordRow, 10);
      this.updateData();
    }

    // new data are loaded
    @action updateData = (next = function () {}) => {
      Sheet.readAllLines( (data) => {
        this.records = data;
        this.recordBeforeChanges = Object.assign({}, data[this.recordRow]);
        this.updateWiki();
        
        if (this.config.focusOnRecordChange === 1) {
          this.focusRecord();
        }
        next()
      });
    }

    @action revertChangesCoordinates = () => {
      this.updateRecordLocation(
        this.recordBeforeChanges[this.config.columns.x],
        this.recordBeforeChanges[this.config.columns.y]
      );
    }

    @action revertChangesRecord = () => {
      this.records[this.recordRow] = Object.assign({}, this.recordBeforeChanges);
    }

    // locally store new values
    @action updateRecordValue = (column, value) => {
        this.records[this.recordRow][column] = value;
        if (column === this.config.columns.name) {
            this.updateWiki();
        }
    }

    // save local values to sheet
    @action saveRecord = () => {
        Sheet.updateLine(this.recordRow, Object.values(this.recordData), () => {
            this.updateData();
        })
    }


    // settings
    @action openSettings = () => {
        this.openedSettings = true;
    }
    @action closeSettings = () => {
        this.openedSettings = false;
    }

    @action saveSettings = (settings) => {
        this.config = Object.assign( this.config, settings);
        console.log(this.config);
        this.updateWiki();
    }

    /*
        METHODS
    */

    basemapById (basemapId) { 
        return window['basemaps'][basemapId];
    };

    roundCoordinate (coord) {
        const floatCoef = 1000;
        return Math.round(coord * floatCoef) / floatCoef;
    }
}