var maps =
{
    "singleplayer":[{
        "name":"university",
        "mapImages":"images/maps/university/",
        "miniMapImage":"images/minimaps/university/",        
        "numberOfHorizontalTiles":10,
        "numberOfVerticalTiles":8,
        "backgroundWidth":6400,
        "backgroundHeight":4800,
        "startX":0,
        "startY":0,
        "mapGridWidth":320,
        "mapGridHeight":240,
        "additional_requirements":[
            {"type":"students","name":"student","team":"characters"},
        ],
        "items": [
            {"type":"player","name":"player","x":60,"y":60,"direction":0,"team":"characters","uid":-1},
            {"type":"students","name":"student","x":80,"y":80,"direction":0,"team":"characters","uid":-2}
        ],
        "lights" : [
            // {"type":"lights","name":"temporary_post","x":21,"y":95,"on":true,"uid":-282},
        ],
        "thresholds":[
            //{"type":"thresholds","name":"auto_door","x":117,"y":53,"direction":0,"uid":-151}
        ],
        
        "triggers" : [
        {
            "type":"conditional",
            "condition":() => {
                return true;
            },     
		    "action":() => {
                renderer.setOrder(game.items[1], {"order":{"type":"move", "toX": 60, "toY": 60}});
		    } 
        }
        ]
    }      
]}