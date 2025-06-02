var keyboard =
{
    testItem1:undefined,
    testItem2:undefined,

    testItem1Selected:false,
    testItem2Selected:false,

    textInput:undefined,
    textInputAdded:false,

    collisionDebug:false,

    singleton:false,

    pan:-1,

    init:function(mode)
    {
        if(this.singleton)
            return;

        this.singleton = true;
        this.secretMessage = "";

        //Capture the keyboard arrow keys
        window.addEventListener("keydown", (e) => {
            
            if(e.key == 'F1')
            {
                e.preventDefault(); // Prevent the default behavior
                //renderer.toggleCommandAndControl();
            }

            if(e.key == 'F3')
            {
                e.preventDefault(); // Prevent the default behavior
                var item = game.items[lookup.get(666)];
                    console.log(item.x, item.y);

                if(debug.logKeyboard)
                { 
                    var item = game.items[lookup.get(6)];
                    console.log(item.x, item.y);
                }
            }

            if (e.key === 'F10')
            {
                renderer.pause = !renderer.pause;
                renderer.toggleDesktop();
            }

            if(renderer.pause)
                return;

            // if(e.key == 82)
            // {
            //     mouse.repair = !mouse.repair;
            //     mouse.sell = false;
            // }
                
            // if(e.key == 83)
            // {
            //     mouse.sell = !mouse.sell;
            //     mouse.repair = false;
            // }

            if(e.key == 'ArrowUp')
            {
                this.pan = flags.PAN_UP;
            }

            if(e.key == 'ArrowDown')
            {
                this.pan = flags.PAN_DOWN;
            }

            if(e.key == 'ArrowLeft')
            {
                this.pan = flags.PAN_LEFT;
            }

            if(e.key == 'ArrowRight')
            {
                this.pan = flags.PAN_RIGHT;
            }

            if(e.key == 'Shift')
            {
                if(debug.logKeyboard)
                { 
                    game.multiSelect = true;
                }
            }

            if(e.key == 'Control')
            {
                if(debug.logKeyboard)
                { 
                    game.multiAttackSelect = true;
                }
            }

            if(e.key == 'Enter' && renderer.inputTextBoxDisplayed)
            {
                renderer.removeTextInput();
            }

            if(e.key == 'm')
            {   
                console.log("mute volume");
                music.muteVolume();
            }

            if(e.key == 'l')
            {
                if(debug.logKeyboard)
                {    
                    for(var i = 0; i < game.items.length; i++)
                    {
                        if(game.items[i].skin)
                        {
                            for(var j = 0; j < game.items[i].skin.length; j++)
                            {
                                console.log(game.items[i].skin[j]);
                            }
                        }
                    }
                }
            }

            if(e.key == 'k')
            {
                if(debug.logKeyboard)
                {   
                    for(var i = 0; i < collisionLog.length; i++)
                    {
                        
                        console.log(collisionLog[i]);
                    }
                }
            }

            if(e.key == 'p')
            {   
                renderer.pause = !renderer.pause;
                renderer.skip = !renderer.skip;
                //music.pauseTrack();
            }

            if(e.key == 'n')
            {   
                music.nextTrack();
            }

            if(e.key == 'c')
            {
                if(debug.logKeyboard)
                {
                    this.collisionDebug = !this.collisionDebug;
                }
            }

            if(e.key == 'o')
            {
                if(debug.logKeyboard)
                {   
                    renderer.toggleMeasurements();
                }
            }

            if(e.key == 's')
            {
                if(debug.logKeyboard)
                { 
                    persistence.save();
                }
            }

            if(e.key == 'g') // Show Debug Grid
            {   
                if(debug.logKeyboard)
                {             
                    if(!this.textInputAdded)
                        renderer.toggleDebugGrid();
                }
            }

            if(e.key == 'i') // Show Debug Grid
            {
                if(debug.logKeyboard)
                {                  
                    if(!this.textInputAdded)
                        renderer.toggleDebugIsleGrid();
                }
            }

            if(e.key == 'u') // Show Debug Grid
            {
                if(debug.logKeyboard)
                {          
                    if(!this.textInputAdded)
                        renderer.toggleDebugLookupGrid();
                }
            }

            if(e.key == 'w') // Show Debug Waypoints
            {
                if(debug.logKeyboard)
                {                
                    if(!this.textInputAdded)
                        renderer.toggleDebugWaypoints();
                }
            }

            if(e.key == 'q') // Show Debug Waypoints
            {   
                if(debug.logKeyboard)
                {             
                    if(!this.textInputAdded)
                        renderer.toggleDebugMarkers();
                }
            }

            if(e.key == 't') // Show Debug Grid
            {   
                if(debug.logKeyboard)
                {
                    if(!this.textInputAdded)
                    {
                        debug.drawTiles = !debug.drawTiles;
                        if(!debug.drawTiles)
                        {
                            renderer.debugContainer.visible = false;
    
                            for(var i = 0; i < game.items.length; i++)
                            {
                                if(game.items[i].pathLine)
                                {
                                    game.items[i].pathLine.visible = renderer.debugContainer.visible;
                                    game.items[i].endLine.visible = renderer.debugContainer.visible;
                                }
                            }
                        }
                    }
                }    
            }

            if(e.key == 'u') // Print Silent Log
            {
                if(debug.logKeyboard)
                {                
                    if(!this.textInputAdded)
                        logs.printAll();
                }
            }

            if(e.key == 'd') // Print Silent Log
            {
                if(debug.logKeyboard)
                {                
                    renderer.toggleDarkVision();
                }
            }

            if(e.key == 'n') // Print Silent Log
            {
                if(!debug.logKeyboard)
                {
                    renderer.gameOver();
                    // renderer.pause = !renderer.pause;
                    // narration.stop();
                    // narration.clear();
                    // music.stop();
                    // renderer.hideCharacter();
                    // renderer.showMessageText.text = "";
                    // renderer.toggleBlackAndWhite();
                }
            }

            if(e.key == 'x') // Print Silent Log
            {
                if(debug.logKeyboard)
                {                
                    cloud.send();
                }
            }

            if(e.key == 'r') // Print Silent Log
            {
                if(debug.logKeyboard)
                {                
                    renderer.toggleInfraredVision();
                }
            }

            if(e.key == 'v') // Print Silent Log
            {
                if(debug.logKeyboard)
                {                
                    renderer.toggleUltravioletVision();
                }
            }

            if(e.key == 'f') // Print Silent Log
            {
                if(debug.logKeyboard)
                {                
                    debug.fogOfWar = !debug.fogOfWar;
                }
            }

            // if(e.keyCode == 32 /*&& mode == "multiplayer"*/)
            // {
            //     renderer.showTextInput();
            // }

            if(e.keyCode == 13 && mode == "multiplayer")
            {
                if(this.textInputAdded)
                {
                    this.textInputAdded = false;
                    console.log(this.textInput.text);
                    multiplayer.sendChat(this.textInput.text);
                    renderer.container.removeChild(this.textInput);
                }
            }
        });

        window.addEventListener("keyup", (e) => {
            this.pan = -1;

            if(e.key == 'Shift')
            {
                game.multiSelect = false;
            }

            if(e.key == 'Control')
            {
                game.multiAttackSelect = false;
            }
        });
    },

    setTestItem1:function(testItemUID)
    {
        if(this.testItem1 == undefined)
        {
            for(var i =0; i < game.items.length; i++)
            {
                if(game.items[i].uid == -168)
                {
                    this.testItem1 = game.items[i];                            
                    break;
                }
            }
        }
    },

    setTestItem2:function(testItemUID)
    {
        if(this.testItem2 == undefined)
        {
            for(var i =0; i < game.items.length; i++)
            {
                if(game.items[i].uid == -167)
                {
                    this.testItem2 = game.items[i];                            
                    break;
                }
            }
        }
    },
}