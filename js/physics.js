var physics = 
{
    armyQuadTree:undefined,
    navalQuadTree:undefined,
    vehiclesQuadTree:undefined,
    elementsQuardTree:undefined,
    boundary:undefined,
    poly:undefined,
    skipQuadTreeUpdate:false,
    counter:0,

    init:function()
    {
        this.boundary = new QuadTree.Boundary(
            0, 0,
            game.level.mapGridWidth * game.gridSize,
            game.level.mapGridHeight * game.gridSize);

        this.poly = new QuadTree.Poly();

        this.armyQuadTree = new QuadTree(this.boundary);
        this.navalQuadTree = new QuadTree(this.boundary);
        this.vehiclesQuadTree = new QuadTree(this.boundary);
        this.elementsQuardTree = new QuadTree(this.boundary);
    },

    queryArmy:function(near)
    {
        var found = this.armyQuadTree.query(near);

        return found;
    },

    queryShips:function(near)
    {
        var found = this.navalQuadTree.query(near);

        return found;
    },

    queryVehicles:function(near)
    {
        var found = this.vehiclesQuadTree.query(near);

        return found;
    },

    queryElments:function(near)
    {
        var found = this.elementsQuardTree.query(near);

        return found;
    },

    update:function()
    {
        if(!this.armyQuadTree)
            return;

        if(!this.navalQuadTree)
            return;

        if(!this.vehiclesQuadTree)
            return;

        if(!this.elementsQuardTree)
            return;

        this.armyQuadTree.clear();
        this.navalQuadTree.clear();
        this.vehiclesQuadTree.clear();
        this.elementsQuardTree.clear();

        for(var i= 0; i < game.items.length; i++)
        {
            if(!game.items[i])
                continue;
            
            if(game.items[i].isArmy)
            {
                this.armyQuadTree.insert(
                    game.items[i].uid,
                    game.items[i].x * game.gridSize,
                    game.items[i].y * game.gridSize
                );
            }

            if(game.items[i].isNavy)
            {
                this.navalQuadTree.insert(
                    game.items[i].uid,
                    game.items[i].x * game.gridSize,
                    game.items[i].y * game.gridSize
                );
            }

            if(game.items[i].type == "vehicles")
            {
                this.vehiclesQuadTree.insert(
                    game.items[i].uid,
                    game.items[i].x * game.gridSize,
                    game.items[i].y * game.gridSize
                );
            }

            if(game.items[i].type == "elements")
            {
                this.elementsQuardTree.insert(
                    game.items[i].uid,
                    game.items[i].x * game.gridSize,
                    game.items[i].y * game.gridSize
                );
            }
        }
    },

    // avoidance:function(item, nearBy, grid, offset, collisionType, otherCollisionType)
    // {
    //     for(var i= 0; i < nearBy.length; i++)
    //     {
    //         if(nearBy[i].isArmy)
    //         {
    //             var other = nearBy[i];

    //             if(other.orders.type == "stand" && item.orders.to != other.orders.to)
    //                 continue;                

    //             //if(other.orders.type == "firing" || other.orders.type == "fire")
    //             //    continue;

    //             if(other != item)
    //             {
    //                 collisionResult = boxOverlap(item[collisionType], other[otherCollisionType]);
                    
    //                 if(collisionResult > 0.0)
    //                 {   
    //                     var dx = item.sprite.x - other.sprite.x;
    //                     var dy = item.sprite.y - other.sprite.y;

    //                     var s = Math.sqrt(dx * dx + dy * dy);
                        
    //                     item.sprite.x = item.sprite.x + (collisionResult * dx / s) * offset;
    //                     item.sprite.y = item.sprite.y + (collisionResult * dy / s) * offset;

    //                     if(grid[Math.floor(item.y)][Math.floor(item.x)] == flags.CELL_COLLISION_MODE_FULL ||
    //                         grid[Math.ceil(item.y)][Math.ceil(item.x)] == flags.CELL_COLLISION_MODE_FULL)
    //                     {
    //                         item.sprite.x = item.sprite.x - (collisionResult * dx / s) * offset;
    //                         item.sprite.y = item.sprite.y - (collisionResult * dy / s) * offset;
    //                     }

    //                     item.sprite.x = Math.floor(item.sprite.x * 1000000) / 1000000;
    //                     item.sprite.y = Math.floor(item.sprite.y * 1000000) / 1000000;

    //                     //logs.silentLog("line 244: avoidance, " + "pre item.x: " + item.x + ", item.y: " + this.y);

    //                     item.x = (item.sprite.x / game.gridSize) + (game.offsetX / game.gridSize);
    //                     item.y = (item.sprite.y / game.gridSize) + (game.offsetY / game.gridSize) - (display.maininterface.mapImageYOffset / game.gridSize);

    //                     //logs.silentLog("line 249: avoidance, " + "post item.x: " + item.x + ", item.y: " + this.y);

    //                     return other;
    //                 }
    //             }
    //         }
    //     }

    //     return undefined;
    // },

    // avoid:function(item, nearByItems, stength, directions)
    // {
    //     var newDirection = undefined;
    //     var force = {x:0, y:0};

    //     for(var i = 0; i < nearByItems.length; i++)
    //     {
    //         var angle = findAngle(nearByItems[i], item, directions);
    //         console.log(nearByItems[i].x + " " + nearByItems[i].y);
    //         console.log(item.x + " " + item.y);
    //         console.log(directions);
    //         console.log(angle);
            
    //         var radians = -(angle / directions) * 2 * Math.PI;
    //         var magnitude = stength;
    //         console.log(radians);
    //         console.log(Math.sin(radians));

    //         force.x = force.x + (magnitude * Math.sin(radians));
    //         force.y = force.y + (magnitude * Math.cos(radians));
    //     }

    //     newDirection = findDirectionFromZeroVector(force,this.directions);

    //     return newDirection;
    // },

    detect:function(item, nearBy, collisionType, otherCollisionType)
    {
        var collidedItems = [];
        
        for(var i= 0; i < nearBy.length; i++)
        {
            if(nearBy[i])
            {
                var other = nearBy[i];

                if(other != item)
                {
                    if(!other[otherCollisionType])
                        continue;

                    collisionResult = boxOverlap(item[collisionType], other[otherCollisionType]);
                    
                    if(collisionResult > 0.0)
                    {
                        collidedItems.push(other);
                    }
                }
            }
        }

        return collidedItems;
    },

    checkForCollidingRadius(item, ...types)
    {
        var others = [];
        
        for(var t = 0; t < types.length; t++)
        {
            for(var i= 0; i < game.items.length; i++)
            {
                if(game.items[i] && game.items[i].type == types[t])
                {
                    var other = game.items[i];

                    if(item.orders.to != other.orders.to)
                        continue;
                        
                    if(item.uid != other.uid)
                    {
                        if(doCirclesOverlap(
                            item.sprite.x,
                            item.sprite.y,
                            item.radius * 2,
                            other.sprite.x,
                            other.sprite.y,
                            other.radius * 2))
                        {
                            //console.log("%ccircles overlap",
							//'background: #000; color: #ff0033');
                            
                            others.push(other);
                        }                        
                    }
                }
            }    
        }

        //console.log(other);

        return others;
    }

    /*detectAndStop:function(item, nearBy, collisionType, otherCollisionType)
    {
        for(var i= 0; i < nearBy.length; i++)
        {
            if(nearBy[i].isArmy)
            {
                var other = nearBy[i];

                if(other != item)
                {
                    collisionResult = boxOverlap(item[collisionType], other[otherCollisionType]);
                    
                    if(collisionResult > 0.0)
                    {   
                        if(other.orders.type == "stand" ||
                           other.orders.type == "standing" &&
                           item.orders.to == other.orders.to)
                        {
                            item.orders.type = "standing";
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    },

    */
}