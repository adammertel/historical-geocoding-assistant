/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

import { observable, action, computed } from 'mobx';
import Sheet from './sheet.js';
import React from 'react';

export default class AppStore extends React.Component {
  @observable config = {};

  @observable loadingStatus = '';
  @observable changingLoadingStatus = false;
  @observable openedSettings = false;
  @observable shouldRenderApp = false;

  @observable recordRow = 4;
  @observable records = {};
  @observable recordBeforeChanges = {};
  @observable wikis = [];
  @observable geonames = [];

  @observable map = {};
  @observable mapOpacityRatio = 0.4;
  @observable map1Id = false;
  @observable map2Id = false;

  @observable overlays;

  @observable hlPoint = false;

  constructor() {
    super();
  }

  @action
  loadConfig() {
    this.config = config.storeConfig;
    this.map = {
      center: this.config.defaultCenter,
      zoom: this.config.defaultZoom
    };
    this.overlays = config.defaultOverlays;
  }

  @action
  init() {
    this.noRecords = Sheet.noLines;
    this.map1Id = config.defaultBasemaps[0];
    this.map2Id = config.defaultBasemaps[1];
    this.firstRecordRow = 2;
    this.recordRow = this.firstRecordRow;
    this.shouldRenderApp = true;
    this.updateData(() => {
      this.findDefaultColumnNames();
      // this.loadApplication();
    });
  }

  @action
  findDefaultColumnNames() {
    const keywordsDictionary = {
      name: ['name'],
      localisation: ['localisation'],
      x: ['coordinate', 'geo', 'x'],
      y: ['coordinate', 'geo', 'y'],
      certainty: ['certainty'],
      note: ['note', 'notes']
    };

    Object.keys(keywordsDictionary).map(id => {
      const keywords = keywordsDictionary[id];

      let bestMatch = '';
      let bestMatchOccurences = 0;
      Object.keys(this.recordData).map(column => {
        const columnLowerCase = column.toLowerCase();
        let occurences = 0;
        keywords.map(keyword => {
          if (columnLowerCase.includes(keyword)) {
            occurences += 1;
          }
        });

        if (occurences > bestMatchOccurences) {
          bestMatchOccurences = occurences;
          bestMatch = column;
        }
      });

      this.config.columns[id] = bestMatch;
    });
  }

  /*
        GETTERS
    */
  // map
  @computed
  get mapPosition() {
    return [this.map.center[0], this.map.center[1]];
  }
  @computed
  get mapZoom() {
    return this.map.zoom;
  }

  @computed
  get basemap1() {
    return this.basemapById(this.map1Id);
  }

  @computed
  get basemap2() {
    return this.basemapById(this.map2Id);
  }

  @computed
  get configMaxGeoExtent() {
    const geoExtent = this.config.maxGeoExtent;
    return [
      [geoExtent[0][0], geoExtent[0][1]],
      [geoExtent[1][0], geoExtent[1][1]]
    ];
  }

  @computed
  get recordData() {
    return this.records[this.recordRow]
      ? Object.assign(this.records[this.recordRow], {})
      : {};
  }

  @computed
  get recordName() {
    return this.recordData[this.config.columns.name];
  }

  @computed
  get recordCertainty() {
    return this.recordData[this.config.columns.certainty];
  }

  @computed
  get recordLocalisation() {
    return this.recordData[this.config.columns.localisation];
  }

  @computed
  get recordNote() {
    return this.recordData[this.config.columns.note];
  }

  @computed
  get recordX() {
    return this.recordData[this.config.columns.x];
  }

  @computed
  get recordY() {
    return this.recordData[this.config.columns.y];
  }

  @computed
  get recordGeo() {
    return [parseFloat(this.recordY), parseFloat(this.recordX)];
  }

  @computed
  get geoRecords() {
    return Object.keys(this.records).map(rowNo => {
      const record = this.records[rowNo];
      return {
        x: record[this.config.columns.x],
        y: record[this.config.columns.y],
        name: record[this.config.columns.name],
        row: rowNo
      };
    });
  }

  @computed
  get validRecordCoordinates() {
    return Base.validGeo(this.recordGeo);
  }

  @computed
  get recordNames() {
    return Object.keys(this.records).map(rowNo => {
      const record = this.records[rowNo];
      return {
        name: record[this.config.columns.name],
        row: rowNo
      };
    });
  }

  @computed
  get isLoaded() {
    return this.loadingStatus === 'loaded';
  }

  @computed
  get loadingMessage() {
    return config.loadingMessages[this.loadingStatus];
  }

  /* ACTIONS */

  // loading status
  @action
  changeLoadingStatus = newStatus => {
    this.changingLoadingStatus = false;
    this.loadingStatus = newStatus;
  };

  @action
  loadApplication = () => {
    this.changingLoadingStatus = true;
    setTimeout(() => {
      this.changeLoadingStatus('loaded');
    }, config.messageLoadingTime);
  };

  // map
  @action
  mapMoved = change => {
    this.map.center = change.center;
    this.map.zoom = change.zoom;
  };
  @action mapCenterChange = center => (this.map.center = center);
  @action mapZoomChange = zoom => (this.map.zoom = zoom);

  @action
  defaultMapState = () => {
    this.map.zoom = this.config.defaultZoom;
    this.map.center = this.config.defaultCenter;
  };
  // pan and zoom to active record
  @action
  focusRecord = () => {
    if (this.validRecordCoordinates) {
      this.map.center = this.recordGeo;
      this.map.zoom = this.config.focusZoom;
    } else {
      this.defaultMapState();
    }
  };

  @action
  mapFocus = ll => {
    this.mapCenterChange(ll);
    this.mapZoomChange(this.config.focusZoom);
  };

  @action
  locateGeoname = geoname => {
    this.mapFocus(geoname.ll);
    this.hlLocality(geoname.ll);
  };

  @action
  hlLocality = ll => {
    if (this.hlTimeout) {
      clearTimeout(this.hlTimeout);
    }
    this.hlPoint = ll;
    this.hlTimeout = setTimeout(() => {
      this.hlPoint = false;
    }, 2000);
  };

  @action
  useGeoname = geoname => {
    this.updateRecordLocation(geoname.ll[1], geoname.ll[0]);
    if (!map.getBounds().contains(L.latLng(geoname.ll[0], geoname.ll[1]))) {
      this.mapCenterChange(geoname.ll);
    }
  };

  @action
  updateRecordLocation = (x, y) => {
    this.updateRecordValue(this.config.columns.y, this.roundCoordinate(y));
    this.updateRecordValue(this.config.columns.x, this.roundCoordinate(x));
  };

  // wiki
  @action
  updateSearch = () => {
    Base.geonames(
      this.recordLocalisation,
      this.config.maxResults,
      this.config.maxGeoExtent,
      response => {
        this.geonames = response;
      }
    );
    Base.wiki(
      this.recordName,
      this.config.maxResults,
      this.config.maxGeoExtent,
      response => {
        this.wikis = response;
      }
    );
  };

  // map tiles
  @action
  changeOpacityRatio = opacity => {
    this.mapOpacityRatio = opacity;
  };

  @action
  changeOpacityRatio = opacity => {
    this.mapOpacityRatio = opacity;
  };

  @action
  changeBaseMap = (mid, bmid) => {
    this['map' + mid + 'Id'] = bmid;
  };

  // map overlayrow
  @action
  addOverlay = overlayId => {
    const foundOverlay = this.overlays.find(ov => ov.id === overlayId);
    if (!foundOverlay) {
      this.overlays.push({
        id: overlayId,
        opacity: 1
      });
    }
  };

  @action
  overlayChangeOpacity = (overlayId, newOpacity) => {
    const foundOverlay = this.overlays.find(ov => ov.id === overlayId);
    if (foundOverlay) {
      foundOverlay.opacity = newOpacity;
    }
  };

  @action
  overlayRemove = overlayId => {
    const clonedOverlays = this.overlays.slice();
    this.overlays = clonedOverlays.filter(ov => ov.id !== overlayId);
  };

  @action
  overlayMoveUp = overlayId => {
    const clonedOverlays = this.overlays.slice();

    const fromIndex = clonedOverlays.findIndex(ov => ov.id === overlayId);
    const toIndex = fromIndex - 1;

    if (toIndex > -1) {
      clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0]);
      this.overlays = clonedOverlays;
    }
  };
  @action
  overlayMoveDown = overlayId => {
    const clonedOverlays = this.overlays.slice();

    const fromIndex = clonedOverlays.findIndex(ov => ov.id === overlayId);
    const toIndex = fromIndex + 1;

    if (toIndex < clonedOverlays.length) {
      clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0]);
      this.overlays = clonedOverlays;
    }
  };

  // changing recordRow
  @action
  nextRecord = () => {
    this.recordRow =
      this.recordRow === this.noRecords
        ? this.firstRecordRow
        : this.recordRow + 1;
    this.updateData();
  };

  @action
  previousRecord = () => {
    this.recordRow =
      this.recordRow === this.firstRecordRow
        ? this.noRecords
        : this.recordRow - 1;
    this.updateData();
  };

  @action
  gotoRecord = recordRow => {
    this.recordRow = parseInt(recordRow, 10);
    this.updateData();
  };

  // new data are loaded
  @action
  updateData = (next = function() {}) => {
    this.changeLoadingStatus('record');
    Sheet.readAllLines(data => {
      this.records = data;
      this.recordBeforeChanges = Object.assign({}, data[this.recordRow]);
      this.updateSearch();

      if (this.config.focusOnRecordChange) {
        this.focusRecord();
      }
      next();
      this.loadApplication();
    });
  };

  @action
  revertChangesCoordinates = () => {
    this.updateRecordLocation(
      this.recordBeforeChanges[this.config.columns.x],
      this.recordBeforeChanges[this.config.columns.y]
    );
  };
  @action
  removetChangesCoordinates = () => {
    this.updateRecordLocation('', '');
  };

  @action
  revertChangesRecord = () => {
    this.records[this.recordRow] = Object.assign({}, this.recordBeforeChanges);
  };

  // locally store new values
  @action
  updateRecordValue = (column, value) => {
    const config = this.config;
    if ((column === config.columns.x || column === config.columns.y) && value) {
      value = parseFloat(value);
    }
    this.records[this.recordRow][column] = value;

    if (
      column === config.columns.name ||
      column === config.columns.localisation
    ) {
      this.updateSearch();
    }
  };

  @action
  changeCertainty = newCertaintyValue => {
    this.updateRecordValue(this.config.columns.certainty, newCertaintyValue);
  };

  // save local values to sheet
  @action
  saveRecord = () => {
    this.changeLoadingStatus('save');
    const cols = this.config.columns;
    this.recordData[cols.x] = parseFloat(this.recordData[cols.x]);
    this.recordData[cols.y] = parseFloat(this.recordData[cols.y]);

    Sheet.updateLine(this.recordRow, Object.values(this.recordData), () =>
      this.updateData()
    );
  };

  // settings
  @action
  openSettings = () => {
    this.openedSettings = true;
  };
  @action
  closeSettings = () => {
    this.openedSettings = false;
  };

  @action
  saveSettings = settings => {
    this.config = Object.assign(this.config, settings);
    this.updateSearch();
  };

  @action
  toggleDisplayGeonames = () => {
    const newConfig = {
      displayGeonames: !this.config.displayGeonames
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleDisplayWikis = () => {
    const newConfig = {
      displayWikis: !this.config.displayWikis
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleDisplayOtherRecords = () => {
    const newConfig = {
      displayOtherRecords: !this.config.displayOtherRecords
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleFocusChange = () => {
    const newConfig = {
      focusOnRecordChange: !this.config.focusOnRecordChange
    };
    this.saveSettings(newConfig);
  };

  /*
        METHODS
    */
  basemapById(basemapId) {
    return window['basemaps'][basemapId];
  }

  roundCoordinate(coord) {
    if (!coord) {
      return coord;
    } else {
      const floatCoef = 1000;
      return Math.round(coord * floatCoef) / floatCoef;
    }
  }
}
