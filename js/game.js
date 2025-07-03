window.addEventListener('load', function() {
    const myText = "Bootcamp Simulator";
    const paddingSize = 0; // Number of spaces for padding
    
    // Create the padding by repeating spaces
    const padding = " ".repeat(paddingSize);

    console.log("\n%c" + padding + myText + padding + "\n\n", "background: linear-gradient(to bottom, #C0C0C0, #1a1a1a); color: #AFEEEE; font-size: 20px;\n\n");

    console.log("start game");
    conversations.init();
    renderer.init();    
    game.init();

    if(debug.network)
    {
        console.log("client init");
        client.init();
    }

    document.body.style.backgroundColor = 'black';
    
    framerate.getRefreshRate(function(FPS) {
        // Do something with FPS if needed
    });
});

collisionLog = [];

var game = {
    // Start preloading assets
    mode:undefined,
    campaignMode:false,
    inGame:false,
    isFullScreen:false,
    handleUpdate:true,
    incrementTheCampaignLevel:false,
    elapsedTime:0,   
    tick:0, 
    delay:0,
    offsetX:0,	// X & Y panning offsets for the map
    offsetY:0,
    offsetXIndex:0,
    offsetYIndex:0,
    removalCount:0,
    removalLimit:5,
    gridSize:20,
    bigNumber:99999999,
    animationTimeout:100,
    speedAdjustmentFactor:(1/96),
    deltaAdjustmentFactor:(1/64),      
    turnFastAdjustmentFactor:1/16,
    turnSpeedAdjustmentFactor:1/8,
    turnSlowSpeedAdjustmentFactor:1/32,
    turnSlowestSpeedAdjustmentFactor:1/64,
    panningThreshold:12, // Distance from edge of canvas at which panning starts
    panningSpeed:10, // Pixels to pan every drawing loop
    panningTimeIndex:0,
	panningTimeThreshold:16,
    lifeBarSmallHeight:12,
    lifeBarHeight:25,
    lifeBarLargeHeight:40,
    level:undefined,
    intro:undefined,
    currentInfantryProducerId:0,
    currentVehicleProducerId:0,
    items:[],
    emitters:[],
    thresholds:[],
    bullets:[],
    characters:[],
    lasers:[],
    sidebarButtons:[],
    selectedItems:[],
    selectedItemIndexes:[],
    selectedAttackItems:[],
    deleteStack:[],
    deathRegistery:undefined,    
    deployBuilding:undefined,
    deployBuildingProduce:undefined,
    powerUsage:0,
    powerTotal:0,
    radarTotal:0,
    barracksTotal:0,
    factoryTotal:0,
    primaryBarrack:undefined,
    primaryFactory:undefined,
    primaryAirport:undefined,
    showMessages:[],
    showTransitions:[],
    multiSelect:false,
    multiAttackSelect:false,
    sortSelect:false,
    onlyInfantry:false,
    currentMapTerrainGrid:undefined, // 2D array
    currentMapIsleGrid:undefined, // 2D array
    currentFogGrid:undefined, // 2D array
    currentMapBuildableGrid:undefined, // A copy of currentMapTerrainGrid, but changes via buildings
    currentTerrainMapPassableGrid:undefined,
    currentIsleMapPassableGrid:undefined,
    debugTileCount:0,
    debugTileLimit:10,
    
    init: function()
    {
        console.log("init game");  
        
        if(debug.production)
        {            
            this.setFullScreen();
        }

        narration.init();

        renderer.start();
    },

    startSinglePlayer:function(savedData = undefined)
    {
        console.log("startSinglePlayer");
        cells.init();    
        target.init();
        lookup.init();
        sidebar.init();
        singleplayer.start(savedData);

        fog.init();  

        mouse.init();
        keyboard.init("singleplayer");
    },

    initMultiplayer:function()
    {
        multiplayer.init();
    },

    startMultiplayer:function()
    {
        cells.init();
        target.init();
        lookup.init();
        mouse.init();
        fog.init(); 
        keyboard.init("multiplayer");
        //physics.init();
    },

    update: function()
    {
        game.handlePanning();
        renderer.clock.update();

        if(renderer.clock.expired())
        {
            game.endLevel();
            game.nextLevel();
            return;
        }

        economy.update();
        mouse.update();
        sidebar.update();

        if(game.level.ai)
            ai.update();

        var t0 = performance.now()

        this.removalCount = 0;

        for(var i=0; i < game.items.length; i++)
        {   
            if(!game.items[i])
            {
                this.removalCount++;
                continue;
            }

            if(game.items[i].processOrders)
                game.items[i].processOrders();

            if(game.items[i] && game.items[i].update)
                game.items[i].update();
        }

        for(var i=0; i < game.emitters.length; i++)
        {
            game.emitters[i].update();
        }

        var totalTime = performance.now() - t0;
        nav.deleteAllMarkers(game.currentTerrainMapPassableGrid);
        game.delay = true;

        if(this.removalCount == this.removalLimit)
        {
            this.resetItems();
        }
    },

    draw:function()
    {    
        mouse.draw();
        
        for(var i=0; i < this.items.length; i++)
        {
            if(this.items[i] && this.items[i].draw)
                this.items[i].draw();
        }

        if(debug.drawTiles)
            game.drawDebugTiles();

        this.handleUpdate = false;
    },

    sendCommand:function(uids,orders)
    {
        if(game.mode == "singleplayer")
            singleplayer.sendCommand(uids,orders);
        else if(game.mode == "multiplayer")
            multiplayer.sendCommand(uids,orders,orders.from);            
    },

    processCommand:function(uids,orders)
    {
        if(orders.construct)
        {
            renderer.constructItem(uids, orders);
        }
        else
        {
            for (var i in uids)
            {                
                var uid = uids[i];
                var item = game.getItemByUid(uid);
    
                //if uid is a valid item, set the order for the item
                
                if(item)
                {
                    item.orders = JSON.parse(JSON.stringify(orders));
                }
            }
        }
    },

    getItemByUid:function(uid)
	{
		for (var i = 0; i < game.items.length; i++)
		{
			if(game.items[i] && game.items[i].uid == uid)
			{
				return game.items[i];
			}
		}
	},

    handlePanning:function()
    {
        if(mouse.velocity > 0.1)
            return;

        // do not pan if mouse leaves the canvas
        if(mouse.y * productionInverseRatio > productionHeight)
            return;

        if(mouse.y * productionInverseRatio < display.maininterface.mapImageYOffset)
            return;

        if(mouse.x * productionInverseRatioX <=game.panningThreshold || keyboard.pan == flags.PAN_LEFT)
        {
            this.handleLeftPanning();
        }
        else if ((mouse.x * productionInverseRatioX >= (productionWidth - game.panningThreshold) - display.maininterface.mapImageXOffset) &&
                  (mouse.x * productionInverseRatioX <= (productionWidth - display.maininterface.mapImageXOffset)) ||
                  keyboard.pan == flags.PAN_RIGHT)
        {
            this.handleRightPanning();			
		}

        if(mouse.y * productionInverseRatio <= game.panningThreshold + display.maininterface.mapImageYOffset ||
            keyboard.pan == flags.PAN_UP)
        {               
            this.handleUpPanning();
        }
        else if (mouse.y * productionInverseRatio >= (productionHeight + nearFullScreenHeight) - game.panningThreshold ||
            keyboard.pan == flags.PAN_DOWN)
        {
            this.handleDownPanning();
        }
    },

    handleLeftPanning:function()
    {
        if (game.offsetX>=game.panningSpeed)
        {
            console.log("handle Left Panning");
            
            this.handleUpdate = true;

            //background.moveLeftX();
            
            game.offsetX -= (game.panningSpeed);
            game.offsetXIndex = Math.floor(game.offsetX / game.gridSize);
            renderer.backgroundContainer.x = renderer.backgroundContainer.x + game.panningSpeed;
            
            if(minimap.zoomOut)
            {
                renderer.miniMapZoomInX = renderer.miniMapZoomInX + game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.width);
            }
            else
            {
                if(renderer.miniMapBackground)
                    renderer.miniMapBackground.x = renderer.miniMapBackground.x + game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.width);
            }

            if(renderer.renderTextureSprite)
                renderer.renderTextureSprite.x = renderer.renderTextureSprite.x + game.panningSpeed;                
            
            for(var i=0; i < game.items.length; i++)
            {
                if(!game.items[i])
                    continue;
                
                game.items[i].sprite.x = game.items[i].sprite.x + game.panningSpeed;

                if(game.items[i].bullet && game.items[i].bullet.sprite)
                    game.items[i].bullet.sprite.x = game.items[i].bullet.sprite.x + game.panningSpeed;

                if(game.items[i].sprites)
                {
                    for(var j = 0; j < game.items[i].sprites.length; j++)
                        game.items[i].sprites[j].x = game.items[i].sprites[j].x + game.panningSpeed;
                }
            }

            renderer.emittersContainer.x = renderer.emittersContainer.x + game.panningSpeed;

            for(var i=0; i < renderer.wayPoints.length; i++)
            {
                renderer.wayPoints[i].x = 
                    renderer.wayPoints[i].x + game.panningSpeed;
            }
        }
    },

    handleRightPanning:function()
    {
        if (game.offsetX + (productionWidth - display.maininterface.mapImageXOffset) + game.panningSpeed <= background.width/*24640*/)
        {
            this.handleUpdate = true;
                    
            game.offsetX += game.panningSpeed;
            game.offsetXIndex = Math.floor(game.offsetX / game.gridSize);
            renderer.backgroundContainer.x = renderer.backgroundContainer.x - game.panningSpeed;
            
            if(minimap.zoomOut)
            {
                renderer.miniMapZoomInX = renderer.miniMapZoomInX - game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.width);
            }
            else
            {
                if(renderer.miniMapBackground)
                    renderer.miniMapBackground.x = renderer.miniMapBackground.x - game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.width);
            }

            if(renderer.renderTextureSprite)
                renderer.renderTextureSprite.x = renderer.renderTextureSprite.x - game.panningSpeed;
            
            //background.moveRightX();

            for(var i=0; i < game.items.length; i++)
            {
                if(!game.items[i])
                    continue;

                game.items[i].sprite.x = game.items[i].sprite.x - game.panningSpeed;

                if(game.items[i].bullet && game.items[i].bullet.sprite)
                    game.items[i].bullet.sprite.x = game.items[i].bullet.sprite.x - game.panningSpeed;

                if(game.items[i].sprites)
                {
                    for(var j = 0; j < game.items[i].sprites.length; j++)
                        game.items[i].sprites[j].x = game.items[i].sprites[j].x - game.panningSpeed;
                }
            }

            renderer.emittersContainer.x = renderer.emittersContainer.x - game.panningSpeed;

            for(var i=0; i < renderer.wayPoints.length; i++)
            {
                renderer.wayPoints[i].x = 
                    renderer.wayPoints[i].x - game.panningSpeed;
            }
        }
    },

    handleUpPanning:function()
    {
        if (game.offsetY>=game.panningSpeed)
        {
            this.handleUpdate = true;
            //background.moveUpY();

            game.offsetY -= game.panningSpeed;
            game.offsetYIndex = Math.floor(game.offsetY / game.gridSize);
            renderer.backgroundContainer.y = renderer.backgroundContainer.y + game.panningSpeed;
            
            if(minimap.zoomOut)
            {
                renderer.miniMapZoomInY = renderer.miniMapZoomInY + game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.height);
            }
            else
            {
                if(renderer.miniMapBackground)
                    renderer.miniMapBackground.y = renderer.miniMapBackground.y + game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.height);
            }

            if(renderer.renderTextureSprite)
                renderer.renderTextureSprite.y = renderer.renderTextureSprite.y + game.panningSpeed;
           
            for(var i=0; i < game.items.length; i++)
            {
                if(!game.items[i])
                    continue;

                game.items[i].sprite.y = game.items[i].sprite.y + game.panningSpeed;

                if(game.items[i].bullet && game.items[i].bullet.sprite)
                    game.items[i].bullet.sprite.y = game.items[i].bullet.sprite.y + game.panningSpeed;

                if(game.items[i].sprites)
                {
                    for(var j = 0; j < game.items[i].sprites.length; j++)
                        game.items[i].sprites[j].y = game.items[i].sprites[j].y + game.panningSpeed;
                }
            }

            renderer.emittersContainer.y = renderer.emittersContainer.y + game.panningSpeed;

            for(var i=0; i < renderer.wayPoints.length; i++)
            {
                renderer.wayPoints[i].y = 
                    renderer.wayPoints[i].y + game.panningSpeed;
            }
        }
    },

    handleDownPanning:function()
    {
        if (game.offsetY + (productionHeight + nearFullScreenHeight - display.maininterface.mapImageYOffset) + game.panningSpeed <= background.height/*14000*/)
        {
            this.handleUpdate = true;

            game.offsetY += game.panningSpeed;
            game.offsetYIndex = Math.floor(game.offsetY / game.gridSize);

            renderer.backgroundContainer.y = renderer.backgroundContainer.y - game.panningSpeed;
            
            if(minimap.zoomOut)
            {
                renderer.miniMapZoomInY = renderer.miniMapZoomInY - game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.height);
            }
            else
            {
                if(renderer.miniMapBackground)
                    renderer.miniMapBackground.y = renderer.miniMapBackground.y - game.panningSpeed * (display.minimapScreen.dimension/display.gameplayScreen.height);
            }

            if(renderer.renderTextureSprite)
                renderer.renderTextureSprite.y = renderer.renderTextureSprite.y - game.panningSpeed;

            //background.moveDownY();
            
            for(var i=0; i < game.items.length; i++)
            {
                if(!game.items[i])
                    continue;

                game.items[i].sprite.y = game.items[i].sprite.y - game.panningSpeed;

                if(game.items[i].bullet && game.items[i].bullet.sprite)
                    game.items[i].bullet.sprite.y = game.items[i].bullet.sprite.y - game.panningSpeed;

                if(game.items[i].sprites)
                {
                    for(var j = 0; j < game.items[i].sprites.length; j++)
                        game.items[i].sprites[j].y = game.items[i].sprites[j].y - game.panningSpeed;
                }
            }

            renderer.emittersContainer.y = renderer.emittersContainer.y - game.panningSpeed;

            for(var i=0; i < renderer.wayPoints.length; i++)
            {
                renderer.wayPoints[i].y = 
                    renderer.wayPoints[i].y - game.panningSpeed;
            }
        }
    },

    selectItem:function(item,shiftPressed)
    {
        // Pressing shift and clicking on a selected item will deselect it
        if (item.selectable && !item.selected)
        {
            //if (item.team == game.team)
            //{

                item.selected = true;
                item.select();

                this.selectedItems.push(item);
            //}
		}
	},

    selectAttackItem:function(item)
    {
        if (item.selectable)
        {
            if (item.team != game.team)
            {
                this.selectedAttackItems.push(item);
            }
        }
    },

    clearSelection:function()
    {
        while(game.selectedItems.length>0)
		{
			game.selectedItems.pop().unselect();
        }
        
        sidebar.deactiveAllButtons();
        mouse.placement = false;
    },

    setFullScreen:function()
    {
        document.querySelector("body").requestFullscreen()
        .then(function() {
            // element has entered fullscreen mode successfully
            display.splashscreen.windowedOffsetY = 0;
        })
        .catch(function(error) {
            // element could not enter fullscreen mode
        });

        window.onresize = resize
        function resize() 
        {   
            screenWidth = screen.width * window.devicePixelRatio;
            screenHeight = screen.height * window.devicePixelRatio;

            screenRatio = screen.height / screenHeight;

            /**
             * Compute scaling factors to adjust from the
             * original production resolution to the current screen size
             **/ 

            productionRatioX = screen.width / productionWidth;
            productionRatio = screen.height / productionHeight;

            /**
             * Compute inverse scaling factors to convert from screen space
             * back to production resolution
             **/ 

            productionInverseRatioX = productionWidth / screen.width;
            productionInverseRatio = productionHeight / screen.height;

            canvasWidthOffset = screenWidth - canvasWidth;
            canvasHeightOffset = screenHeight - canvasHeight;

            if(window.devicePixelRatio == 1 && screenHeight != 1080)
            {
                isNonNativeResolution = true;
                canvasWidthOffset = canvasWidthOffset * productionRatioX;
                canvasHeightOffset = canvasHeightOffset * productionRatio;
            }

            if(window.devicePixelRatio != 1.0)
            {
                isDisplayScale = true;
                canvasWidthOffset = canvasWidthOffset * productionRatioX;
                canvasHeightOffset = canvasHeightOffset * productionRatio;
            }

            tileWidthOffset = Math.ceil((screen.width - productionWidth) / game.gridSize);
            tileHeightOffset = Math.ceil((screen.height - productionHeight) / game.gridSize);

            game.isFullScreen = !game.isFullScreen;
            nearFullScreenHeight = 0;

            if(debug.scale)
            {
                const scaleFactorX = window.innerWidth / productionWidth;
                const scaleFactorY = window.innerHeight / productionHeight;

                //alert(window.innerWidth + " " + productionWidth + " " + window.innerHeight + " " + productionHeight)

                renderer.app.stage.scale.set(scaleFactorX, scaleFactorY);
            }
        }

        tileWidthOffset = Math.ceil((screen.width - productionWidth) / game.gridSize);
        tileHeightOffset = Math.ceil((screen.height - productionHeight) / game.gridSize);
    },

    sortForInfantryFirst:function(uids,orders)
    {
        if(orders.type != "move")
            return;
        
        if(Array.isArray(uids))
        {
            for (var i = 0; i < uids.length; i++)
            {
                var item = game.items[lookup.get(uids[i])];

                if(!item)
                    return;

                if(item.type == "infantry")
                {
                    var temp = game.items[i];
                    game.items[i] = game.items[0];
                    game.items[0] = temp;

                    return;
                }
            }
        }

        //return uids;
    },

    setSelectedItemIndexes:function(uids,orders)
    {
        game.selectedItemIndexes.length = 0;

        if(orders.type != "attack")
            return;

        if(Array.isArray(uids))
        {
            for (var i of uids)
            {
                var position = lookup.get(i);

                if(!position)
                    continue;

                game.selectedItemIndexes.unshift(position);
    
                var item = game.items[game.selectedItemIndexes[0]];
    
                if(item.determineDistanceFromTarget)
                    item.determineDistanceFromTarget(orders.to.x, orders.to.y);
            }
        }
    },

    sortSelectedItems:function(selectedItemIndexes)
    {
        if(selectedItemIndexes.length <= 1)
            return;

        for(var i = 0; i < selectedItemIndexes.length - 1; i++)
        {
            var minIndex = i;
            var item = game.items[selectedItemIndexes[i]];

            var min = item.distanceFromTargetSquared;

            for(var j = i + 1; j < selectedItemIndexes.length; j++)
            {
                if(game.items[selectedItemIndexes[j]].distanceFromTargetSquared < min)
                {
                    min = game.items[selectedItemIndexes[j]].distanceFromTargetSquared;
                    minIndex = j;
                }
            }

            if(minIndex !== i)
            {
                var temp = game.items[selectedItemIndexes[i]];
                game.items[selectedItemIndexes[i]] = game.items[selectedItemIndexes[minIndex]];
                game.items[selectedItemIndexes[minIndex]] = temp;
            }
        }

        // for(var i = 1; i < selectedItemIndexes.length; i++)
        // {
        //     var item = game.items[selectedItemIndexes[i]];

        //     if(item.type == "infantry")
        //     {
                
        //     }
        // }
    },

    addDialogue:function(message, character)
    {
        narration.add(game.level.name, message);       
        this.showMessages.push({"message":message, "character":character});
    },

    showBlockedDialogue:function()
    {
        triggers.setBlockActiveTrigger(true);
        
        renderer.showDialogue(this.showMessages[0].message);
        renderer.hideCharacter();
        renderer.showCharacter(this.showMessages[0].character);
        narration.play(this.showMessages[0].message);
        this.showMessages.splice(0, 1);
    },

    showDialogue:function()
    {       
        renderer.showDialogue(this.showMessages[0].message);
        renderer.hideCharacter();
        renderer.showCharacter(this.showMessages[0].character);
        narration.play(this.showMessages[0].message);
        this.showMessages.splice(0, 1);
    },

    clearDialogue:function()
    {
        narration.stop();
        triggers.setBlockActiveTrigger(false);
        narration.clear();
    },

    addTransition:function(texture, displayTime = 10, fadeIn = 1, fadeOut = 1)
    {        
        this.showTransitions.push({"texture":texture, "displayTime": displayTime, "fadeIn": fadeIn, "fadeOut": fadeOut});
    },

    showTransition:function()
    {
        let timerId;
        const steps = 60;

        function showingTransition()
        {
            console.log('showingTransition');

            let duration = this.showTransitions[0].fadeIn;
            let alpha = 0;
            let stepAlpha = 16.67;

            const fadeInTransition = setInterval(() => {
                alpha += stepAlpha;
                renderer.addAlphaSplashScreen(0.067 / duration);

                if (alpha >= duration * 1000)
                {
                    clearInterval(fadeInTransition);
                    alpha = 0;
                    duration = this.showTransitions[0].displayTime;
                    stepAlpha = 16.67;

                    const display = setInterval(() => {
                        clearInterval(display);
                        alpha = 0;

                        duration = this.showTransitions[0].fadeOut;
                        stepAlpha = 16.67;

                        const fadeOutTransition = setInterval(() => {
                            alpha += stepAlpha;
                            renderer.subAlphaSplashScreen(0.067 / duration);

                            if (alpha >= duration * 1000) {
                                clearInterval(fadeOutTransition);

                                alpha = 0;
                                this.showTransitions.splice(0, 1);

                                if(this.showTransitions.length == 0)
                                {
                                    renderer.intro();
                                    return;
                                }

                                renderer.setSplashScreen(this.showTransitions[0].texture);
                                console.log(this.showTransitions[0].filename);
                                let delayTime = this.showTransitions[0].displayTime * 1000;
                                
                                //timerId = setInterval(showTransition.bind(this), delayTime);
                                showingTransition.call(this, 0);
                            }
                        }, 16.67);
                    }, duration * 1000);
                }
            }, 16.67);
        }

        renderer.setSplashScreen(this.showTransitions[0].texture);
        // Call the showTransition function to start the transitions
        showingTransition.call(this);
    },

    canAdd:function(powerUsage)
    {   
        if(powerUsage)
        {
            if(powerUsage + game.powerUsage > game.powerTotal)
            {
                game.showMessage("Insufficient Power");
                return false;
            }
        }

        return true;
    },

    buy:function(cost, team)
    {
        if(team == game.team)
        {
            economy.cash = economy.cash - cost;
            renderer.cashText.text = "Cash: $" + economy.cash;
        }
    },

    canBuy:function(cost)
    {   
        if(cost)
        {
            if(cost > economy.cash)
            {
                game.showMessage("Insufficient Cash");
                return false;
            }
        }

        return true;
    },

    buildPassableGrid:function()
	{
        game.currentTerrainMapPassableGrid = [];
        game.currentIsleMapPassableGrid = [];
        game.currentFogGrid = [];

        if(!game.currentMapIsleGrid)
        {   
            // alert()
            // for (var y=0; y < game.level.mapGridHeight; y++)
            // {
            //     game.currentTerrainMapPassableGrid[y] = [];
            //     game.currentFogGrid[y] = [];
    
            //     for (var x=0; x< game.level.mapGridWidth; x++)
            //     {
            //         if(game.currentMapTerrainGrid[y][x] == 1)
            //             game.currentTerrainMapPassableGrid[y][x] = flags.CELL_COLLISION_MODE_FULL;
            //         else
            //             game.currentTerrainMapPassableGrid[y][x] = flags.CELL_COLLISION_MODE_OFF;

            //         game.currentFogGrid[y][x] = flags.FOG_X;     
            //     }
            // }
    
            // for (var i = 0; i < game.items.length; i++)
            // {
            //     var item = game.items[i];
                
            //     if(item.type == "buildings" || item.type == "turrets")
            //     {
            //         for (var y = 0; y < item.passableGrid.length; y++)
            //         {
            //             for (var x = 0; x < item.passableGrid[y].length; x++)
            //             {
            //                 if(item.passableGrid[y][x])
            //                 {
            //                     console.log(item.y + " " + item.x);
            //                     game.currentMapTerrainGrid[item.y][item.x] = flags.CELL_COLLISION_MODE_HARD;

            //                     game.currentTerrainMapPassableGrid[item.y][item.x] = flags.CELL_COLLISION_MODE_HARD;
            //                 }
            //             }
            //         }
            //     }
            //     else if(item.type == "infantry")
            //     {
            //         // Mark all squares under or near the vehicle or infantry as blocked
            //         cells.add(
            //             item.uid, item.x, item.y, item.radius / game.gridSize,
            //             game.currentTerrainMapPassableGrid,
            //             flags.CELL_COLLISION_MODE_SOFT);
            //     }
            //     else if(item.type == "vehicles")
            //     {
            //         // Mark all squares under or near the vehicle or infantry as blocked
            //         cells.add(
            //             item.uid, item.x, item.y, item.radius / game.gridSize,
            //             game.currentTerrainMapPassableGrid,
            //             flags.CELL_COLLISION_MODE_MEDIUM);
            //     }
            // }
        }
        else
        {
            for (var y=0; y < game.level.mapGridHeight; y++)
            {
                game.currentTerrainMapPassableGrid[y] = [];
                game.currentIsleMapPassableGrid[y] = [];
                game.currentFogGrid[y] = [];
    
                for (var x=0; x< game.level.mapGridWidth; x++)
                {
                    if(game.currentMapTerrainGrid[y][x] == 1)
                    {
                        game.currentTerrainMapPassableGrid[y][x] = flags.CELL_COLLISION_MODE_FULL;
                    }                        
                    else
                    {
                        game.currentTerrainMapPassableGrid[y][x] = 0;
                    }
                    
                    if(game.currentMapIsleGrid[y][x] == 1)
                    {
                        game.currentIsleMapPassableGrid[y][x] = flags.CELL_COLLISION_MODE_MEDIUM;
                    }                        
                    else
                    {
                        game.currentIsleMapPassableGrid[y][x] = 0;
                    }
                    
                    game.currentFogGrid[y][x] = flags.FOG_X;
                }
            }
    
            for (var i = 0; i < game.items.length; i++)
            {
                var item = game.items[i];
                
                if(item.type == "buildings" || item.type == "turrets")
                {
                    for (var y = 0; y < item.passableGrid.length; y++)
                    {
                        for (var x = 0; x < item.passableGrid[y].length; x++)
                        {
                            if(item.passableGrid[y][x])
                            {
                                var gridY = Math.floor(item.y - item.passableGrid.length / 2)+y;
                                var gridX = Math.round(item.x - item.passableGrid[y].length / 2)+x;

                                game.currentMapTerrainGrid[gridY][gridX] = flags.CELL_COLLISION_MODE_HARD;

                                game.currentTerrainMapPassableGrid[gridY][gridX] = flags.CELL_COLLISION_MODE_HARD;

                                // if(game.currentMapIsleGrid.length != 0)
                                //     game.currentMapIsleGrid[gridY][gridX] = flags.CELL_COLLISION_MODE_HARD;
                                
                                // if(game.currentIsleMapPassableGrid.length != 0)
                                //     game.currentIsleMapPassableGrid[gridY][gridX] = flags.CELL_COLLISION_MODE_HARD;
                            }
                        }
                    }
                }
                else if(item.type == "infantry")
                {
                    // Mark all squares under or near the vehicle or infantry as blocked
                    cells.add(
                        item.uid, item.x, item.y, item.radius / game.gridSize,
                        game.currentTerrainMapPassableGrid,
                        flags.CELL_COLLISION_MODE_SOFT);
                }
                else if(item.type == "vehicles")
                {
                    // Mark all squares under or near the vehicle or infantry as blocked
                    cells.add(
                        item.uid, item.x, item.y, item.radius / game.gridSize,
                        game.currentTerrainMapPassableGrid,
                        flags.CELL_COLLISION_MODE_MEDIUM);
                }
            }

            nav.createWayPoints(game.currentIsleMapPassableGrid);
        }
    },

    addBuildingToPassableGrid:function(item)
    {
        if(!game.currentMapIsleGrid)
        {
            for (var y = 0; y < item.passableGrid.length; y++)
            {
                for (var x = 0; x < item.passableGrid[y].length; x++)
                {
                    if(item.passableGrid[y][x])
                    {
                        var gridY = Math.floor(item.y - item.passableGrid.length / 2)+y;
                        var gridX = Math.floor(item.x - item.passableGrid[y].length / 2)+x;

                        if(debug.logGame)
                        {
                            console.log("addBuildingToPassableGrid");
                            console.log(item.baseHeight + item.pixelOffsetY);
                            console.log(item.y - (item.baseHeight + item.pixelOffsetY));
                            console.log("gridX: " + gridX + ", gridY: " + gridY);
                        }

                        if(gridY < 0)
                        {
                            console.log("%Error: GridY is negative: " + gridY,
                                'background: #000; color: #ff0000');
                        }

                        if(gridX < 0)
                        {
                            console.log("%Error: GridX is negative: " + gridX,
                                'background: #000; color: #ff0000');
                        }
                        
                        game.currentMapTerrainGrid[gridY][gridX] = flags.CELL_COLLISION_MODE_HARD;

                        game.currentTerrainMapPassableGrid[gridY][gridX] = flags.CELL_COLLISION_MODE_HARD;
                    }
                }
            }
        }
        else
        {   
            for (var y = 0; y < item.passableGrid.length; y++)
            {
                for (var x = 0; x < item.passableGrid[y].length; x++)
                {
                    if(item.passableGrid[y][x])
                    {
                        game.currentMapTerrainGrid
                            [Math.floor(item.y - item.passableGrid.length / 2)+y]
                            [Math.floor(item.x - item.passableGrid[y].length / 2)+x] = 
                                flags.CELL_COLLISION_MODE_HARD;

                        game.currentTerrainMapPassableGrid
                            [Math.floor(item.y - item.passableGrid.length / 2)+y]
                            [Math.floor(item.x - item.passableGrid[y].length / 2)+x] = 
                                flags.CELL_COLLISION_MODE_HARD;

                        if(debug.logGame)
                        {
                            console.log("addBuildingToPassableGrid");
                            console.log(Math.floor(item.y - item.passableGrid.length / 2)+y);
                            console.log(Math.floor(item.x - item.passableGrid[y].length / 2)+x);
                        }

                        if(game.currentMapIsleGrid.length != 0)
                            game.currentMapIsleGrid
                                [Math.floor(item.y - item.passableGrid.length / 2)+y]
                                [Math.floor(item.x - item.passableGrid[y].length / 2)+x] = 
                                    flags.CELL_COLLISION_MODE_HARD;

                        if(game.currentIsleMapPassableGrid.length != 0)
                            game.currentIsleMapPassableGrid
                                [Math.floor(item.y - item.passableGrid.length / 2)+y]
                                [Math.floor(item.x - item.passableGrid[y].length / 2)+x] = 
                                    flags.CELL_COLLISION_MODE_HARD;
                    }
                }
            }            
        }
    },

    fillGridWithFullTiles:function(mapObstructedTerrain, mapObstructedIsle, mapLookup)
    {
        this.setFullTileToGrid(mapObstructedTerrain, game.currentMapTerrainGrid);
        this.setFullTileToGrid(mapObstructedIsle, game.currentMapIsleGrid);
        this.setFullTileToGrid(mapLookup, game.currentTerrainMapLookupTable);
    },

    setFullTileToGrid:function(mapObstructed, currentMapGrid)
    {
        if(!mapObstructed)
            return;

        for (var i = 0; i < mapObstructed.length; i++)
        {
            // selects the game.currentMapTerrainGrid obstracle element
            // and then changes it from a one to a zero
            // one means that obstruction
            var obstruction = mapObstructed[i];
            
            var t = -1;
            var x = 0;
            var y = 0;
            var n = 0;

            if(mapObstructed[0].length == 3)
            {
                var obstruction = mapObstructed[i];
                
                y = obstruction[0];
                x = obstruction[1];
                n = obstruction[2];

                do
                {
                    n--;
                    currentMapGrid[y][x] = 1;

                    x++;

                    if(x == game.level.mapGridWidth)
                    {
                        x = 0;
                        y++;
                    }
                }
                while(n != 0);
            }
            else if(mapObstructed[0].length == 4)
            {
                var obstruction = mapObstructed[i];

                t = obstruction[0];
                y = obstruction[1];
                x = obstruction[2];
                n = obstruction[3];

                do
                {
                    n--;
                    game.currentTerrainMapLookupTable[y][x] = t;

                    x++;

                    if(x == game.level.mapGridWidth)
                    {
                        x = 0;
                        y++;
                    }
                }
                while(n != 0);
            }
            else
            {
                if(mapObstructed[0].length != 0)
                {
                    alert("Obstruction is not correct");
                    alert("mapObstructedTerrain length is " + mapObstructed[0].length);
                    break;
                }
            }
        }
    },

    /**
     * Once a land ground item enters to stand, the its present and 
     * surrounding cells should be blocked to other game items.
     * 
     * A map keeps track of which cell is block or not.
     * 
     * Importantly, the map stacks the cells, that is
     * when multiple ground items near each and the same
     * cell is occupied by the multiple ground items, a
     * counter within the map is increase by the number
     * of ground items, in other words the cells become stacked!  
     *
     */ 
    enterGridCell:function(item)
    {
        console.log("enterGridCell");        
    },

    /**
     * Once a land ground item leaves the cell, the cell
     * has the opportunity to be free.
     * 
     * However, if other ground game item is also 
     * that particular then it needs to be blocked.
     * 
     * Once the groud item is ready to leave, the stacked
     * cell is remove by 1, reducing the size of the stacked
     * cell. 
     * 
     * Once the stacked cell is a size of zero, the cell
     * is finally free.
     * 
     */
    leaveGridCell:function(item)
    {
        
    },

    hasPlayerWon:function()
    {
        var win = true;
    
        for(var i = 0; i < game.items.length; i++)
        {
            if(game.items[i].team == undefined)
                continue;

            if(game.items[i].team != game.team)
            {
                win = false;
                break;
            }
        }

        return win;
    },

    hasPlayerLost:function()
    {
        var lost = true;
    
        for(var i = 0; i < game.items.length; i++)
        {
            if(game.items[i].team == undefined)
                continue;

            if(game.items[i].team == game.team)
            {
                lost = false;
                break;
            }
        }

        return lost;
    },

    hasObserverExit:function()
    {
        if(multiplayer.mode != "observer")
            return false;

        var exit = true;
        var team = game.items[0].team;

        for(var i = 1; i < game.items.length; i++)
        {

            if(game.items[i].team == undefined)
                continue;

            if(game.items[i].team != team)
            {
                exit = false;
                break;
            }
        }

        console.log("observer exit:" + exit);

        return exit;
    },

    resetItems:function()
    {
        game.items = game.items.filter(item => item !== null && item !== undefined);
    },

    nextLevel:function()
    {
        singleplayer.currentLevel++;

        if(singleplayer.currentLevel == maps.singleplayer.length)
            singleplayer.currentLevel = 0;

        this.level = maps.singleplayer[singleplayer.currentLevel];
        renderer.setCamera();
        renderer.level();
    },
    
    endLevel:function()
    {
        console.log(debug.skipUI);
        game.endTheLevel = false;
        game.inGame = false;
        game.currentTerrainMapPassableGrid = undefined;

        economy.reset();

        triggers.clearAll();

        this.clearSelection();
        this.clearDialogue();
        
        if(game.level.ai)
            ai.end();

        renderer.removeAllItems();
        renderer.removeClock();
        renderer.removeTerrain();
        renderer.removeThreshold();
        renderer.removeLights();
        renderer.removeEmitters();
        renderer.removeDebug();

        game.offsetX = 0;
        game.offsetY = 0;

        game.offsetXIndex = 0;
        game.offsetYIndex = 0;

        renderer.removePixiImage();
        renderer.removePixiButtonImage();

        renderer.hideMenu();

        renderer.pause = false;

        renderer.reset();
        renderer.resetCamera();

        renderer.app.ticker.remove(renderer.app.tickerCallback);
    },
    
    nextCampaignLevel:function()
    {
        if(this.incrementTheCampaignLevel)
        {
            this.incrementTheCampaignLevel = false;

            this.endLevel();
            singleplayer.nextLevel();

            if(flags.CEF_ACCESS)
            {
                cloud.sendNextLevel();
            }
        }
    },

    endMultiplayerLevel:function()
    {
        game.currentTerrainMapPassableGrid = undefined;

        triggers.clearAll();

        game.clearSelection();

        music.stop();

        renderer.removeAllItems();
        renderer.removeAllBullet();
        renderer.removeThreshold();
        renderer.removeTerrain();
        renderer.removeFogOfWar();
        renderer.removeSidebar();
        renderer.removeLights();
        renderer.removeEmitters();
        renderer.removeBackground();

        game.offsetX = 0;
        game.offsetY = 0;

        game.offsetXIndex = 0;
        game.offsetYIndex = 0;

        renderer.removePixiImage();
        renderer.removePixiButtonImage();

        multiplayer.endGame();

        renderer.gameTextList.length = 0;

        renderer.loadLobbyScreen();

        game.initMultiplayer();

        renderer.resetCamera();

        renderer.app.ticker.remove(renderer.app.tickerCallback);
    },

    drawDebugTiles:function()
    {
        if(this.debugTileCount == this.debugTileLimit)
        {
            this.debugTileCount = 0;

            if(!this.handleUpdate)
            {
                if(renderer.debugContainer.visible)
                {
                    renderer.toggleItemCells();
                    renderer.toggleItemCells();
                }
                else
                {
                    renderer.toggleItemCells();
                }
            }
            else
            {
                renderer.debugContainer.visible = false;
            }
        }

        this.debugTileCount++;
    }
};