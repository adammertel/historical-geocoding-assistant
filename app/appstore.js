import { observable, action, computed } from 'mobx';
import Sheet from './sheet.js'

export default class AppStore {
    @observable mapPosition = [[49, 20], [50, 21]];
    @observable basemaps = {

    };
    @observable recordRow = 1;
    @observable recordData = [];

    constructor () {
        this.noRecords = 65;
        this.gotoRecord(1);
    }

    /*
        computed
    */
    @computed get mapPositionArray () { 
        return [this.mapPosition[0].slice(), this.mapPosition[1].slice()];
    };
    
    @computed get activeData () {
        return this.recordData.slice();
    }

    basemapById (basemapId) { 
        return this.basemaps.find( bm => bm.id === basemapid);
    };



    /* 
        actions
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
    @action changeBasemapOpacity = (bid, opacity) => {
        this.basemapById(bid).opacity = opacity;
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
        Sheet.readLine(this.recordRow, (vals) => this.recordData = vals[0]);
    }
}