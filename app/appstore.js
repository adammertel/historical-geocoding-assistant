import { observable, action, computed } from 'mobx';
import Sheet from './sheet.js'

export default class AppStore {
    @observable mapPosition = [[49, 20], [50, 21]];

    @observable recordRow = 2;
    @observable recordData = [];

    @observable mapOpacityRatio = 0; 
    @observable map1Id = false; 
    @observable map2Id = false;

    @observable columns = {

    }

    constructor () {
        this.noRecords = 65;
        this.updateData();
        this.map1Id = Object.keys(window['basemaps'])[0]; 
        this.map2Id = Object.keys(window['basemaps'])[1]; 
    }

    /*
        GETTERS
    */
    @computed get mapPositionArray () { 
        return [this.mapPosition[0].slice(), this.mapPosition[1].slice()];
    };
    
    @computed get activeData () {
        return Object.assign(this.recordData, {});
    }

    @computed get basemap1 () {
        return this.basemapById(this.map1Id);
    }

    @computed get basemap2 () {
        return this.basemapById(this.map2Id);
    }



    /* 
        ACTIONS
    */

    // map position
    @action setMapPosition = (position) => this.mapPosition = position;
    @action mapMoved = () => {
        if (map) {
            const newBounds = map.getBounds();
            const sw = newBounds.getSouthWest();
            const ne = newBounds.getNorthEast();
            this.mapPosition = [[sw.lat, sw.lng], [ne.lat, ne.lng]];
        }
    };

    // map tiles
    @action changeOpacityRatio = (opacity) => {
        this.mapOpacityRatio = opacity;
    }

    @action changeBaseMap = (mid, bmid) => {
        this['map' + mid + 'Id'] = bmid;
    }

    // active record
    @action nextRecord = () => {
        this.recordRow = this.recordRow === this.noRecords ? 1 : this.recordRow + 1;
        this.updateData();
    }

    @action previousRecord = () => {
        this.recordRow = this.recordRow === 1 ? this.recordRow - 1 : this.noRecords;
        this.updateData();
    }
    
    @action gotoRecord = (recordRow) => {
        this.recordRow = recordRow;
        this.updateData();
    }

    @action updateData = () => {
        Sheet.readLine(this.recordRow, false, (vals) => this.recordData = vals);
    }


    /*
        METHODS
    */

    basemapById (basemapId) { 
        return window['basemaps'][basemapId];
    };
}