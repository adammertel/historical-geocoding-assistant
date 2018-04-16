/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

import { observable, action, computed } from 'mobx';
import Sheet from './sheet.js';
import mobx from 'mobx';
import React from 'react';

export default class AppStore extends React.Component {
  @observable opts = {};

  @observable loadingStatus = '';
  @observable changingLoadingStatus = false;

  @observable openedSettings = false;
  @observable shouldRenderApp = false;

  @observable records = {};
  @observable recordBeforeChanges = {};
  @observable wikis = [];
  @observable geonames = [];
  @observable hlPoint = false;

  constructor() {
    super();
  }

  @action
  loadConfig(config) {
    this.opts = config.storeOpts;
  }

  @action
  init() {
    this.noRecords = Sheet.noLines;
    this.openedSettings = config.defaultSettingsOpen ? false : 'columns';
    this.loadTable(() => {
      this.row = this.opts.defaultRow;
      this.findDefaultColumnNames();
      this.updateData();
      this.shouldRenderApp = true;
    });
  }

  @action
  findDefaultColumnNames() {
    const keywordsDictionary = {
      name: ['name'],
      placeName: ['place name', 'localisation'],
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

      this.opts.columns[id] = bestMatch;
    });
  }

  /*
        GETTERS
    */
  // map
  @computed
  get mapPosition() {
    return this.opts.mapCenter
      ? [this.opts.mapCenter[0], this.opts.mapCenter[1]]
      : [0, 0];
  }

  @computed
  get basemap1() {
    return this.basemapById(this.opts.basemaps.map1);
  }

  @computed
  get basemap2() {
    return this.basemapById(this.opts.basemaps.map2);
  }

  @computed
  get configMaxGeoExtent() {
    const geoExtent = this.opts.maxGeoExtent;
    return [
      [geoExtent[0][0], geoExtent[0][1]],
      [geoExtent[1][0], geoExtent[1][1]]
    ];
  }

  @computed
  get recordData() {
    return this.records[this.row]
      ? Object.assign(this.records[this.row], {})
      : {};
  }

  @computed
  get recordName() {
    return this.recordData[this.opts.columns.name];
  }

  @computed
  get recordCertainty() {
    return this.recordData[this.opts.columns.certainty];
  }

  @computed
  get recordPlaceName() {
    return this.recordData[this.opts.columns.placeName];
  }

  @computed
  get recordNote() {
    return this.recordData[this.opts.columns.note];
  }

  @computed
  get recordX() {
    return this.recordData[this.opts.columns.x];
  }

  @computed
  get recordY() {
    return this.recordData[this.opts.columns.y];
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
        x: record[this.opts.columns.x],
        y: record[this.opts.columns.y],
        name: record[this.opts.columns.name],
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
        name: record[this.opts.columns.name],
        row: rowNo
      };
    });
  }

  @computed
  get isLoaded() {
    return this.loadingStatus === 'loaded';
  }

  @computed
  get tablePrompt() {
    return this.loadingStatus === 'prompting table';
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
    this.opts.mapCenter = change.center;
    this.opts.mapZoom = change.zoom;
  };
  @action mapCenterChange = center => (this.opts.mapCenter = center);
  @action mapZoomChange = zoom => (this.opts.mapZoom = zoom);

  // pan and zoom to active record
  @action
  focusRecord = () => {
    if (this.validRecordCoordinates) {
      this.opts.mapCenter = this.recordGeo;
      this.opts.mapZoom = this.opts.focusZoom;
    }
  };

  @action
  mapFocus = ll => {
    this.mapCenterChange(ll);
    this.mapZoomChange(this.opts.focusZoom);
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
    this.updateRecordValue(this.opts.columns.y, this.roundCoordinate(y));
    this.updateRecordValue(this.opts.columns.x, this.roundCoordinate(x));
  };

  @action
  updateSearch = () => {
    Base.geonames(this.recordPlaceName, this.opts.maxGeoExtent, response => {
      this.geonames = response;
    });
    Base.wiki(this.recordName, this.opts.maxGeoExtent, response => {
      this.wikis = response;
    });
  };

  // map tiles
  @action
  changeOpacityRatio = opacity => {
    this.opts.basemaps.opacity = opacity;
  };

  @action
  changeBaseMap = (mid, bmid) => {
    this.opts.basemaps['map' + mid] = bmid;
  };

  // map overlayrow
  @action
  addOverlay = overlayId => {
    const foundOverlay = this.opts.overlays.find(ov => ov.id === overlayId);
    if (!foundOverlay) {
      this.opts.overlays.push({
        id: overlayId,
        opacity: 1
      });
    }
  };

  @action
  overlayChangeOpacity = (overlayId, newOpacity) => {
    const foundOverlay = this.opts.overlays.find(ov => ov.id === overlayId);
    if (foundOverlay) {
      foundOverlay.opacity = newOpacity;
    }
  };

  @action
  overlayRemove = overlayId => {
    const clonedOverlays = mobx.toJS(this.opts.overlays);
    this.opts.overlays = clonedOverlays.filter(ov => ov.id !== overlayId);
  };

  @action
  overlayMoveUp = overlayId => {
    const clonedOverlays = this.opts.overlays.slice();

    const fromIndex = clonedOverlays.findIndex(ov => ov.id === overlayId);
    const toIndex = fromIndex - 1;

    if (toIndex > -1) {
      clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0]);
      this.opts.overlays = clonedOverlays;
    }
  };
  @action
  overlayMoveDown = overlayId => {
    const clonedOverlays = this.opts.overlays.slice();

    const fromIndex = clonedOverlays.findIndex(ov => ov.id === overlayId);
    const toIndex = fromIndex + 1;

    if (toIndex < clonedOverlays.length) {
      clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0]);
      this.opts.overlays = clonedOverlays;
    }
  };

  // changing recordRow
  @action
  nextRecord = () => {
    this.row = this.row === this.noRecords ? this.firstRecordRow : this.row + 1;
    this.updateData();
  };

  @action
  previousRecord = () => {
    this.row = this.row === this.firstRecordRow ? this.noRecords : this.row - 1;
    this.updateData();
  };

  @action
  gotoRecord = recordRow => {
    this.row = parseInt(recordRow, 10);
    this.updateData();
  };

  // new data are loaded
  @action
  updateData = (next = function() {}) => {
    this.changeLoadingStatus('record');
    Sheet.readAllLines(data => {
      this.records = data;
      this.recordBeforeChanges = Object.assign({}, data[this.row]);
      this.updateSearch();

      if (this.opts.focusOnRecordChange) {
        this.focusRecord();
      }
      next();
      this.loadApplication();
    });
  };

  @action
  loadTable = next => {
    Sheet.readAllLines(data => {
      console.log(data);
      this.records = data;
      next();
    });
  };

  @action
  revertChangesCoordinates = () => {
    this.updateRecordLocation(
      this.recordBeforeChanges[this.opts.columns.x],
      this.recordBeforeChanges[this.opts.columns.y]
    );
  };
  @action
  removeChangesCoordinates = () => {
    this.updateRecordLocation(0, 0);
  };

  @action
  revertChangesRecord = () => {
    this.records[this.row] = Object.assign({}, this.recordBeforeChanges);
  };

  // locally store new values
  @action
  updateRecordValue = (column, value) => {
    const config = this.opts;
    console.log('new value', value);

    if (column === config.columns.x || column === config.columns.y) {
      if (value || value === 0) {
        value = parseFloat(value);
      }
    } else {
      if (
        column === config.columns.name ||
        column === config.columns.placeName
      ) {
        this.updateSearch();
      }
    }
    this.records[this.row][column] = value;
  };

  @action
  changeCertainty = newCertaintyValue => {
    this.updateRecordValue(this.opts.columns.certainty, newCertaintyValue);
  };

  // save local values to sheet
  @action
  saveRecord = () => {
    this.changeLoadingStatus('save');
    const cols = this.opts.columns;
    this.recordData[cols.x] = parseFloat(this.recordData[cols.x]);
    this.recordData[cols.y] = parseFloat(this.recordData[cols.y]);

    Sheet.updateLine(this.row, Object.values(this.recordData), () =>
      this.updateData()
    );
  };

  // settings
  @action
  openSettings = mode => {
    this.openedSettings = mode;
  };
  @action
  closeSettings = () => {
    this.openedSettings = false;
  };

  @action
  saveSettings = settings => {
    this.opts = Object.assign(this.opts, settings);
    this.updateSearch();
  };

  @action
  toggleDisplayGeonames = () => {
    const newConfig = {
      displayGeonames: !this.opts.displayGeonames
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleDisplayWikis = () => {
    const newConfig = {
      displayWikis: !this.opts.displayWikis
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleDisplayOtherRecords = () => {
    const newConfig = {
      displayOtherRecords: !this.opts.displayOtherRecords
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleMapClusters = () => {
    const newConfig = {
      mapClusters: !this.opts.mapClusters
    };
    this.saveSettings(newConfig);
  };
  @action
  handleChangeSelect = e => {
    console.log(e.target.value);
    const newConfig = {
      focusZoom: parseInt(e.target.value, 10)
    };
    this.saveSettings(newConfig);
  };
  @action
  toggleFocusChange = () => {
    const newConfig = {
      focusOnRecordChange: !this.opts.focusOnRecordChange
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
