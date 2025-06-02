var emitters =
{
    add:function(emitter)
    {
        var the_emitter = {};

        window["particles"].list[emitter.name].emitterLifetime = this.adjustTime(emitter.lifetime);

        the_emitter.particles = new PIXI.particles.Emitter(
            renderer.emittersContainer,
            window["particles"].list[emitter.name]
        );

        the_emitter.x = emitter.x || 0;
        the_emitter.y = emitter.y || 0;

        the_emitter.particles.ownerPos.x = the_emitter.x * game.gridSize - renderer.cameraOffsetX;
        the_emitter.particles.ownerPos.y = the_emitter.y * game.gridSize - renderer.cameraOffsetY;

        console.log(renderer.cameraOffsetX, renderer.cameraOffsetY);
        
        the_emitter.particles.updatetime = emitter.updatetime;

        the_emitter.visionGridX = emitter.visionX || 0;
        the_emitter.visionGridY = emitter.visionY || 0;

        the_emitter.update = () => {
            the_emitter.particles.update(the_emitter.particles.updatetime);

            if(debug.fogOfWar)
				fog.setSubGrid(
                    the_emitter.x, 
                    the_emitter.y - display.maininterface.mapImageYGridOffset,
                    the_emitter.visionGrid,
                    game.team,
                    "emitter");
        };

        game.emitters.push(the_emitter);
    },

    adjustTime(time)
    {
        return time * (0.004 / framerate.elapsedTime);
    },

    clear:function()
    {
        for (var i = 0; i < game.emitters.length; i++)
        {
            var e = game.emitters[i];
            
            if (e && e.particles)
            {
                e.particles.cleanup();
                e.particles.destroy();
            }
        }

        game.emitters.length = 0;
        console.log("All emitters cleared.");
    }
}