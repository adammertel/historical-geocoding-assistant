import { observable, action, computed } from 'mobx';

export default class AppStore {
    @observable mapPosition = config.map.initialExtent;
    @observable mapTileActive = '1';

    /*
        computed
    */
    @computed get mapPositionArray(){ 
        return [this.mapPosition[0].slice(), this.mapPosition[1].slice()];
    };
    
    @computed get activeMapTile(){ 
        return config.map.tiles[this.mapTileActive];
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
    @action toggleMapTiles = () => {
        this.mapTileActive = this.mapTileActive === '1' ? '2' : '1';
    }
}