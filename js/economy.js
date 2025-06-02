var economy = 
{
    waterExtractorCount:0,
    oilExtractorCount:0,
    cash:0,
    water:0,
    oil:0,
    update:function()
    {
        this.addWater();
        this.addOil();

        if(this.oil > 1000)
        {
            this.oil = this.oil - 1000;

            if(this.oil <= 0)
                this.oil = 0;

            this.cash = this.cash + 1000;
            renderer.cashText.text = "Cash: $" + this.cash;
        }

        if(this.water > 500)
        {
            this.water = this.water - 500;

            if(this.water <= 0)
                this.water = 0;

            this.cash = this.cash + 500;
            
            renderer.cashText.text = "Cash: $" + this.cash;
        }       
    },

    addWater:function()
    {
        this.water = this.water + 0.5 * this.waterExtractorCount;        
    },

    addOil:function()
    {
        this.oil = this.oil + 0.1 * this.oilExtractorCount;
    },

    reset:function()
    {
        this.waterExtractorCount = 0;
        this.oilExtractorCount = 0;
        this.cash = 0;
        this.water = 0;
    }
}