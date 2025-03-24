/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

import { action, computed, makeObservable, observable, toJS } from "mobx";
import React from "react";
import Base from "./base";
import Sheet from "./sheet";
import SuggestionSources from "./suggestions";
import {
  GeoExtent,
  GeoRecord,
  LatLng,
  LeafletMap,
  RecordData,
  RecordName,
  StoreOptions,
  SuggestionRecord,
  SuggestionSource,
} from "@types";

// Interface for what we need from the AppStore in global scope
interface GlobalAppStore {
  userEmail: string;
  setAuth: (status: string) => void;
  loadApplication: () => void;
}

// Extend window interface without redefining global vars
declare global {
  interface Window {
    map: any;
    basemaps: Record<string, any>;
    // @ts-ignore
    config: any; // Use any to avoid conflicts with other declarations
    // @ts-ignore
    store: AppStore;
    overlaymaps: Record<string, any>;
    SuggestionSources: SuggestionSource[];
    Base: typeof Base;
    username: string;
  }
}

// Declare these as separate globals to avoid redeclaration errors
declare var map: LeafletMap;
declare var config: any;
declare var L: any;

export default class AppStore {
  opts: StoreOptions = {} as StoreOptions;

  loadingStatus: string = "";
  changingLoadingStatus: boolean = false;

  // false | extent | columns
  openedSettings: false | string = false;
  shouldRenderApp: boolean = false;

  _loadingSuggestions: Map<string, boolean> = new Map();
  _problemSuggestions: Map<string, boolean> = new Map();

  records: Record<string, RecordData> = {};
  recordBeforeChanges: RecordData = {};

  _suggestions: Map<string, SuggestionRecord[]> = new Map();
  _displaySuggestions: Map<string, boolean> = new Map();

  hlPoint: LatLng | false = false;

  userEmail: string = "";
  auth: string = "";

  hlTimeout: ReturnType<typeof setTimeout> | null = null;
  row: number = 0;

  constructor() {
    makeObservable(this, {
      opts: observable,
      loadingStatus: observable,
      changingLoadingStatus: observable,
      openedSettings: observable,
      shouldRenderApp: observable,
      _loadingSuggestions: observable,
      _problemSuggestions: observable,
      records: observable,
      recordBeforeChanges: observable,
      _suggestions: observable,
      _displaySuggestions: observable,
      hlPoint: observable,
      userEmail: observable,
      auth: observable,

      saveEmail: action,
      setAuth: action,
      loadConfig: action,
      init: action,
      findDefaultColumnNames: action,
      changeLoadingStatus: action,
      loadApplication: action,
      mapMoved: action,
      mapCenterChange: action,
      mapZoomChange: action,
      focusRecord: action,
      mapFocus: action,
      hlLocality: action,
      useSuggestion: action,
      updateRecordLocation: action,
      updateAllSuggestionSources: action,
      updateSuggestionSource: action,
      changeOpacityRatio: action,
      changeBaseMap: action,
      addOverlay: action,
      overlayChangeOpacity: action,
      overlayRemove: action,
      overlayMoveUp: action,
      overlayMoveDown: action,
      nextRecord: action,
      previousRecord: action,
      gotoRecord: action,
      updateData: action,
      loadTable: action,
      revertChangesCoordinates: action,
      removeChangesCoordinates: action,
      revertChangesRecord: action,
      updateRecordValue: action,
      changeCertainty: action,
      saveRecord: action,
      openSettings: action,
      closeSettings: action,
      saveSettings: action,
      toggleDisplaySuggestion: action,
      toggleDisplayOtherRecords: action,
      toggleMapClusters: action,
      handleChangeSelect: action,
      toggleFocusChange: action,

      mapPosition: computed,
      basemap1: computed,
      basemap2: computed,
      configMaxGeoExtent: computed,
      recordData: computed,
      recordName: computed,
      recordX: computed,
      recordY: computed,
      recordCertainty: computed,
      recordPlacename: computed,
      recordNotes: computed,
      editor: computed,
      recordGeo: computed,
      geoRecords: computed,
      validRecordCoordinates: computed,
      recordNames: computed,
      isLoaded: computed,
      tablePrompt: computed,
      loadingMessage: computed,
      suggestions: computed,
      displaySuggestions: computed,
      loadingSuggestions: computed,
      problemSuggestions: computed,
      wasChanged: computed,
      noRecords: computed,
      firstRecordRow: computed,
    });

    SuggestionSources.forEach((source) => {
      this._displaySuggestions.set(source.id, true);
    });
  }

  saveEmail(email: string): void {
    this.userEmail = email;
  }

  setAuth(auth: string): void {
    this.auth = auth;
  }

  /* INITIALIZE */
  loadConfig(config: any): void {
    this.opts = config.storeOpts;
  }

  init(): void {
    // parse URL and set default row
    const hash = Base.parseSheetFromHash();

    if (hash && hash.row) {
      this.row = parseInt(hash.row, 10);
    } else {
      this.row = this.opts.defaultRow;
    }
  }

  findDefaultColumnNames(): void {
    // automatic column header recognition
    const appConfig = window.config;
    if (
      !this.opts.columns.x ||
      !this.opts.columns.y ||
      !this.opts.columns.name
    ) {
      const cols = this.opts.columns;
      // @ts-ignore - config structure is dynamic and known at runtime
      if (Sheet.header && appConfig.columnNames) {
        Sheet.header.forEach((header) => {
          // @ts-ignore - config structure is dynamic and known at runtime
          Object.keys(appConfig.columnNames).forEach((nameType) => {
            // @ts-ignore - config structure is dynamic and known at runtime
            const colSearch = appConfig.columnNames[nameType];
            if (
              colSearch &&
              colSearch.include &&
              colSearch.include.length &&
              colSearch.exclude &&
              !cols[nameType]
            ) {
              const simScore = Base.simScoreBi(
                header,
                colSearch.include,
                colSearch.exclude
              );
              if (simScore > 0.5) {
                cols[nameType] = header;
              }
            }
          });
        });
      }
    }
  }

  get noRecords(): number {
    return Object.keys(this.records).length
      ? Math.max(...Object.keys(this.records).map((k) => parseInt(k, 10)))
      : 0;
  }

  get firstRecordRow(): number {
    return Object.keys(this.records).length
      ? Math.min(...Object.keys(this.records).map((k) => parseInt(k, 10)))
      : 0;
  }

  /* COMPUTED */
  get mapPosition(): LatLng {
    return this.opts.mapCenter;
  }

  get basemap1() {
    return this.basemapById(this.opts.basemaps.map1);
  }

  get basemap2() {
    return this.basemapById(this.opts.basemaps.map2);
  }

  get configMaxGeoExtent(): GeoExtent | null {
    return this.opts.maxGeoExtent || null;
  }

  get recordData(): RecordData {
    return this.records[this.row] || ({} as RecordData);
  }

  get recordName(): string {
    return this.recordData[this.opts.columns.name] || "";
  }

  get recordX(): string {
    return this.recordData[this.opts.columns.x] || "";
  }

  get recordY(): string {
    return this.recordData[this.opts.columns.y] || "";
  }

  get recordCertainty(): string {
    return this.recordData[this.opts.columns.certainty] || "";
  }

  get recordPlacename(): string {
    return this.recordData[this.opts.columns.placeName] || "";
  }

  get recordNotes(): string {
    return this.recordData[this.opts.columns.note] || "";
  }

  get editor(): string {
    return this.recordData[this.opts.columns.editor] || "";
  }

  get recordGeo(): LatLng {
    return [parseFloat(this.recordY), parseFloat(this.recordX)];
  }

  get geoRecords(): GeoRecord[] {
    return Object.keys(this.records).map((rowNo) => {
      const record = this.records[rowNo];
      return {
        x: record[this.opts.columns.x],
        y: record[this.opts.columns.y],
        name: record[this.opts.columns.name],
        row: rowNo,
      };
    });
  }

  get validRecordCoordinates(): boolean {
    return Base.validGeo(this.recordGeo);
  }

  get recordNames(): RecordName[] {
    return Object.keys(this.records).map((rowNo) => {
      const record = this.records[rowNo];
      return {
        name: record[this.opts.columns.name],
        row: rowNo,
      };
    });
  }

  get isLoaded(): boolean {
    return this.loadingStatus === "loaded";
  }

  get tablePrompt(): boolean {
    return this.loadingStatus === "prompting table";
  }

  get loadingMessage(): string {
    return config.loadingMessages[this.loadingStatus];
  }

  get suggestions(): Record<string, SuggestionRecord[]> {
    // Convert Map to Record object
    const result: Record<string, SuggestionRecord[]> = {};
    this._suggestions.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  get displaySuggestions(): Record<string, boolean> {
    // Convert Map to Record object
    const result: Record<string, boolean> = {};
    this._displaySuggestions.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  get loadingSuggestions(): Record<string, boolean> {
    // Convert Map to Record object
    const result: Record<string, boolean> = {};
    this._loadingSuggestions.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  get problemSuggestions(): Record<string, boolean> {
    // Convert Map to Record object
    const result: Record<string, boolean> = {};
    this._problemSuggestions.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // check whether the records were changed
  get wasChanged(): boolean {
    const cols = this.opts.columns;

    return !!Object.keys(cols).find((col) => {
      const colName = this.opts.columns[col];
      const before = this.recordBeforeChanges[colName];
      const now = this.records[this.row][colName];
      return (before || now) && before != now;
    });
  }

  /* ACTIONS */

  // loading status
  changeLoadingStatus(newStatus: string): void {
    this.changingLoadingStatus = false;
    this.loadingStatus = newStatus;
  }

  loadApplication(): void {
    this.changingLoadingStatus = true;
    setTimeout(() => {
      this.changeLoadingStatus("loaded");
    }, config.messageLoadingTime);
  }

  // map
  mapMoved(change: { center: LatLng; zoom: number }): void {
    this.opts.mapCenter = change.center;
    this.opts.mapZoom = change.zoom;
  }

  mapCenterChange(center: LatLng): void {
    this.opts.mapCenter = center;
  }

  mapZoomChange(zoom: number): void {
    this.opts.mapZoom = zoom;
  }

  // pan and zoom to active record
  focusRecord(): void {
    if (this.validRecordCoordinates) {
      this.opts.mapCenter = this.recordGeo;
      this.opts.mapZoom = this.opts.focusZoom;
    }
  }

  mapFocus(ll: LatLng): void {
    //console.log(ll, this.mapPosition, distance);
    this.hlLocality(ll);

    this.mapCenterChange(ll);
    this.mapZoomChange(this.opts.focusZoom);
  }

  hlLocality(ll: LatLng): void {
    const distance = Base.geoDistance(ll, this.mapPosition);
    const distanceTimeout = distance / 100;

    // wait with the highlighting based on the distance from the point of interest
    if (this.hlTimeout) {
      clearTimeout(this.hlTimeout);
    }
    setTimeout(() => {
      this.hlPoint = ll;
      this.hlTimeout = setTimeout(() => {
        this.hlPoint = false;
      }, 3000);
    }, distanceTimeout);
  }

  useSuggestion(geoname: { ll: LatLng }): void {
    this.updateRecordLocation(geoname.ll[1], geoname.ll[0]);
    if (!map.getBounds().contains(L.latLng(geoname.ll[0], geoname.ll[1]))) {
      this.mapCenterChange(geoname.ll);
    }
  }

  updateRecordLocation(
    x: number | string | false,
    y: number | string | false
  ): void {
    // @ts-ignore - We allow false values to clear coordinates
    this.updateRecordValue(this.opts.columns.y, this.roundCoordinate(y));
    // @ts-ignore - We allow false values to clear coordinates
    this.updateRecordValue(this.opts.columns.x, this.roundCoordinate(x));
  }

  updateAllSuggestionSources(): void {
    SuggestionSources.forEach((source) => {
      this.updateSuggestionSource(source.id);
    });
  }

  updateSuggestionSource(sourceId: string): void {
    const source = SuggestionSources.find((s) => s.id === sourceId);
    if (source) {
      if (this.displaySuggestions[source.id] && this.recordName) {
        this._loadingSuggestions.set(source.id, true);
        this._problemSuggestions.set(source.id, false);

        /*
          get records from all suggestion systems and set them to observables
          TODO: problem list 
        */
        source.getRecords(
          source,
          this.recordName,
          this.opts,
          (suggestions, problem) => {
            suggestions.forEach(
              (s) => (s.inExtent = Base.inExtent(s.ll, this.opts.maxGeoExtent))
            );

            const orderedSuggestions = suggestions.sort((a, b) =>
              a.inExtent ? 1 : -1
            );

            if (this.displaySuggestions[source.id]) {
              this._suggestions.set(source.id, orderedSuggestions);
              this._loadingSuggestions.set(source.id, false);
              this._problemSuggestions.set(source.id, problem);
            }
          }
        );
      } else {
        this._suggestions.set(source.id, []);
      }
    }
  }

  // map tiles
  changeOpacityRatio(opacity: number): void {
    this.opts.basemaps.opacity = opacity;
  }

  changeBaseMap(mid: string, bmid: string): void {
    // Type-safe way to set basemap properties
    if (mid === "1") {
      this.opts.basemaps.map1 = bmid;
    } else if (mid === "2") {
      this.opts.basemaps.map2 = bmid;
    }
  }

  // map overlayrow
  addOverlay(overlayId: string): void {
    const foundOverlay = this.opts.overlays.find(
      (ov: any) => ov.id === overlayId
    );
    if (!foundOverlay) {
      this.opts.overlays.push({
        id: overlayId,
        opacity: 1,
      });
    }
  }

  overlayChangeOpacity(overlayId: string, newOpacity: number): void {
    const foundOverlay = this.opts.overlays.find(
      (ov: any) => ov.id === overlayId
    );
    if (foundOverlay) {
      foundOverlay.opacity = newOpacity;
    }
  }

  overlayRemove(overlayId: string): void {
    const clonedOverlays = toJS(this.opts.overlays);
    this.opts.overlays = clonedOverlays.filter(
      (ov: any) => ov.id !== overlayId
    );
  }

  overlayMoveUp(overlayId: string): void {
    const clonedOverlays = this.opts.overlays.slice();

    const fromIndex = clonedOverlays.findIndex(
      (ov: any) => ov.id === overlayId
    );
    const toIndex = fromIndex - 1;

    if (toIndex > -1) {
      clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0]);
      this.opts.overlays = clonedOverlays;
    }
  }

  overlayMoveDown(overlayId: string): void {
    const clonedOverlays = this.opts.overlays.slice();

    const fromIndex = clonedOverlays.findIndex(
      (ov: any) => ov.id === overlayId
    );
    const toIndex = fromIndex + 1;

    if (toIndex < clonedOverlays.length) {
      clonedOverlays.splice(toIndex, 0, clonedOverlays.splice(fromIndex, 1)[0]);
      this.opts.overlays = clonedOverlays;
    }
  }

  // changing recordRow
  nextRecord(): void {
    this.saveRecord();
    this.row = this.row === this.noRecords ? this.firstRecordRow : this.row + 1;
    this.updateData();
  }

  previousRecord(): void {
    this.saveRecord();
    this.row = this.row === this.firstRecordRow ? this.noRecords : this.row - 1;
    this.updateData();
  }

  gotoRecord(recordRow: string | number): void {
    this.row = parseInt(recordRow.toString(), 10);
    this.updateData();
  }

  // new data are loaded
  updateData(next: () => void = () => {}): void {
    this.changeLoadingStatus("record");
    Sheet.readAllLines((data) => {
      this.records = data;

      this.recordBeforeChanges = Object.assign({}, data[this.row]);
      Object.keys(this.recordBeforeChanges).forEach((recordKey) => {
        if (this.recordBeforeChanges[recordKey] === undefined) {
          this.records[this.row][recordKey] = "";
        }
      });
      this.updateAllSuggestionSources();

      if (this.opts.focusOnRecordChange) {
        this.focusRecord();
      }
      next();
      this.loadApplication();
    });
  }

  loadTable(next: () => void): void {
    Sheet.readAllLines((data) => {
      this.records = data;
      next();
    });
  }

  revertChangesCoordinates(): void {
    this.updateRecordLocation(
      this.recordBeforeChanges[this.opts.columns.x],
      this.recordBeforeChanges[this.opts.columns.y]
    );
  }

  removeChangesCoordinates(): void {
    this.updateRecordLocation(false, false);
  }

  revertChangesRecord(): void {
    this.records[this.row] = Object.assign({}, this.recordBeforeChanges);
  }

  // locally store new values
  updateRecordValue(column: string, value: any): void {
    const config = this.opts;

    if (column === config.columns.x || column === config.columns.y) {
      if (value && value != 0) {
        value = parseFloat(value);
      }
    }

    this.records[this.row][column] = value;
    if (column === config.columns.name || column === config.columns.placeName) {
      this.updateAllSuggestionSources();
    }
  }

  changeCertainty(newCertaintyValue: string): void {
    this.updateRecordValue(this.opts.columns.certainty, newCertaintyValue);
  }

  // save local values to sheet
  saveRecord(): void {
    this.changeLoadingStatus("save");
    const cols = this.opts.columns;

    // Handle x coordinate - convert to the appropriate type for the spreadsheet
    const xValue = parseFloat(this.recordData[cols.x]);
    // @ts-ignore - this is correct handling for the value
    this.recordData[cols.x] =
      !isNaN(xValue) || xValue === 0 ? String(xValue) : "";

    // Handle y coordinate - convert to the appropriate type for the spreadsheet
    const yValue = parseFloat(this.recordData[cols.y]);
    // @ts-ignore - this is correct handling for the value
    this.recordData[cols.y] =
      !isNaN(yValue) || yValue === 0 ? String(yValue) : "";

    if (this.wasChanged) {
      this.recordData[cols.editor] = this.userEmail;
    }

    Sheet.updateLine(this.row, Object.values(this.recordData), () =>
      this.updateData()
    );
  }

  // settings
  openSettings(mode: string): void {
    this.openedSettings = mode;
  }

  closeSettings(): void {
    this.openedSettings = false;
  }

  saveSettings(
    settings: Partial<StoreOptions>,
    loadNewSuggestions: boolean = true
  ): void {
    this.opts = Object.assign(this.opts, settings);
    if (loadNewSuggestions) {
      this.updateAllSuggestionSources();
    }
  }

  toggleDisplaySuggestion(suggestionId: string): void {
    this._displaySuggestions.set(
      suggestionId,
      !this._displaySuggestions.get(suggestionId)
    );
    this.updateSuggestionSource(suggestionId);
  }

  toggleDisplayOtherRecords(): void {
    const newConfig = {
      displayOtherRecords: !this.opts.displayOtherRecords,
    };
    this.saveSettings(newConfig, false);
  }

  toggleMapClusters(): void {
    const newConfig = {
      mapClusters: !this.opts.mapClusters,
    };
    this.saveSettings(newConfig, false);
  }

  handleChangeSelect(e: React.ChangeEvent<HTMLSelectElement>): void {
    const newConfig = {
      focusZoom: parseInt(e.target.value, 10),
    };
    this.saveSettings(newConfig);
  }

  toggleFocusChange(): void {
    const newConfig = {
      focusOnRecordChange: !this.opts.focusOnRecordChange,
    };
    this.saveSettings(newConfig, false);
  }

  /*
    METHODS
  */
  basemapById(basemapId: string): any {
    return window["basemaps"][basemapId];
  }

  roundCoordinate(coord: number | string | false): number | string | false {
    if (!coord) {
      return coord;
    } else {
      const floatCoef = config.coordinatesPrecision;
      return Math.round(parseFloat(coord.toString()) * floatCoef) / floatCoef;
    }
  }
}
