var maps =
{
    "singleplayer":[
    {
        "name":"university",
        "mapImages":"images/maps/university/",
        "miniMapImage":"images/minimaps/university/",        
        "numberOfHorizontalTiles":10,
        "numberOfVerticalTiles":8,
        "backgroundWidth":6400,
        "backgroundHeight":4800,
        "startX":40,
        "startY":40,
        "mapGridWidth":320,
        "mapGridHeight":240,
        "additional_requirements":[
            {"type":"students","name":"student","team":"characters"},
        ],
        "items": [
            {"type":"player","name":"player","x":60,"y":60,"direction":0,"team":"characters","uid":-1},
        ],
        "lights" : [
            // {"type":"lights","name":"temporary_post","x":21,"y":95,"on":true,"uid":-282},
        ],
        "thresholds":[
            //{"type":"thresholds","name":"auto_door","x":117,"y":53,"direction":0,"uid":-151}
        ],
        "clock":
        {
            "timer":5
        },
        "triggers" : [
        {
        }
        ]
    },
    {
        "name":"university",
        "mapImages":"images/maps/university/",
        "miniMapImage":"images/minimaps/university/",        
        "numberOfHorizontalTiles":10,
        "numberOfVerticalTiles":8,
        "backgroundWidth":6400,
        "backgroundHeight":4800,
        "startX":40,
        "startY":40,
        "mapGridWidth":320,
        "mapGridHeight":240,
        "additional_requirements":[
            {"type":"students","name":"student","team":"characters"},
        ],
        "items": [
            {"type":"player","name":"player","x":60,"y":60,"direction":0,"team":"characters","uid":-1},
            {"type":"students","name":"student","x":80,"y":80,"direction":0,"team":"characters","uid":-2},
            {"type":"students","name":"student","x":90,"y":90,"direction":4,"team":"characters","uid":-3},
        ],
        "lights" : [
            // {"type":"lights","name":"temporary_post","x":21,"y":95,"on":true,"uid":-282},
        ],
        "thresholds":[
            //{"type":"thresholds","name":"auto_door","x":117,"y":53,"direction":0,"uid":-151}
        ],
        "clock":
        {
            "timer":10
        },
        
        "triggers" : [
        {
            "type":"conditional",
            "condition":() => {
                return true;
            },     
		    "action":() => {
                game.items[1].orders.type = "search";
                game.items[2].orders.type = "search";
                //renderer.setOrder(game.items[1], {"order":{"type":"search"}});
                //renderer.setOrder(game.items[2], {"order":{"type":"search"}});
		    } 
        }
        ]
    }      
]}