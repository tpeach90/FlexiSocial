

/*        
    SELECT 
        Name, 
        Description, 
        CreatorId,
        Location, 
        ST_X(Point), 
        ST_Y(Point), 
        Time, 
        extract(epoch from duration),
        Capacity,
        CreatedTimestamp
    FROM Events 
    WHERE id=$1 
*/
export const EVENT = `

`