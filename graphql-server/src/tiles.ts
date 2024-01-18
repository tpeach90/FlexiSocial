/**
 * 
 * Functions for converting to and from, and generally dealing with, tiles.
 *
 * 
 * The current tiling system involves converting the coords into 0.25° x 0.25° tiles from lat/lon coordinates.
 * tiles are numbered west to east, south to north, (in the order that pixels are drawn on a screen, but flipped vertically)
 */

export const TILES_E_W = 360*2;
export const TILES_S_N = 180*2; 


export function tileToBBox(tile: number) {

    const sn = Math.floor(tile / TILES_E_W);
    const ew = tile % TILES_E_W;

    return {
        west: -180 + 360 * (ew / TILES_E_W),
        east: -180 + 360 * ((ew+1) / TILES_E_W),
        south: -90 + 180 * (sn / TILES_S_N),
        north: -90 + 180 * ((sn+1) / TILES_S_N),
    }
}

export const latitudeToVerticalTileCoord = (latitude: number) =>
    Math.floor((latitude + 90) / 180 * TILES_S_N);


export const longitudeToHorizontalTileCoord = (longitude:number) =>
    Math.floor((longitude + 180) / 360 * TILES_E_W);


export const titleCoordsToTile = (tileCoords: {SN:number, EW:number}) =>
    tileCoords.SN*TILES_E_W + tileCoords.EW;

export const pointToTileCoords = (point:{latitude:number, longitude:number}) => ({
    SN: latitudeToVerticalTileCoord(point.latitude),
    EW: longitudeToHorizontalTileCoord(point.longitude)
})


export function bboxToIntersectedTiles(bbox: {west: number, east: number, south: number, north: number}) {

    const ewTileRange = [longitudeToHorizontalTileCoord(bbox.west), longitudeToHorizontalTileCoord(bbox.east)];
    const snTileRange = [latitudeToVerticalTileCoord(bbox.south), latitudeToVerticalTileCoord(bbox.north)];

    // because the bounding box might cross the +180° to -180° line
    // we first find what the size of grid needed for the tiles is
    // then "move" that grid into place
    const numEwTiles = (ewTileRange[1] - ewTileRange[0]) % TILES_E_W + 1;

    // generate array 0 to num_ew_tiles, then modulo add the starting tile num to each.
    const ewCoords = [...Array(numEwTiles).keys()].map((EW) => (EW + ewTileRange[0]) % TILES_E_W);

    // same for north south except don't need to worry about it crossing the poles
    const numSnTiles = (snTileRange[1] - snTileRange[0]) + 1;
    const snCoords = [...Array(numSnTiles).keys()].map((SN) => (SN + snTileRange[0]));

    // calculate tile num for each coordinate
    return snCoords.flatMap((SN) =>
        ewCoords.map((EW) =>
            titleCoordsToTile({SN, EW})
        )
    );

}