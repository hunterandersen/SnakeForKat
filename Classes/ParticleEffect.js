class ParticleEffect{
    constructor(effectType, x, y, drawingContext, width){
        this.effectType = effectType;
        this.x = x;
        this.y = y;
        this.radius = -1;
        this.width = -1;
        this.radiusSpeed = 0;
        this.context = drawingContext;
        this.animationLength = 0;
        this.animationCount = 0;
        switch(this.effectType){
            case 'circleShrinking':
                this.radius = 40;
                this.radiusSpeed = -10;
                this.animationLength = 10;
                break;
            case 'boxticks':
                this.animationLength = 5;
                this.width = width;
            case 'snaketrail':
                this.animationLength = 10;
                
        }
    }
    update(){
        if(this.animationCount < this.animationLength){
            this.animationCount++;
            if (this.effectType == 'circleShrinking' && this.animationCount%2==0){
                this.radius += this.radiusSpeed;
                if(this.radius < 0){
                    this.radius = 0;
                }
            } else if (this.effectType == 'boxticks'){
                //This doesn't really "animate" so to say. Nothing changes it just hovers statically
            }
        }else{
            return false;
        }
        return true;
    }
    draw(){
        if (this.effectType == 'circleShrinking'){
            this.context.beginPath();
            this.context.strokeStyle = 'white';
            this.context.strokeWidth = 1.5;
            this.context.arc(this.x, this.y, this.radius, 0, Math.PI *2);
            this.context.stroke();
            this.context.closePath();
        }else if (this.effectType == 'boxticks'){
            this.context.strokeStyle = 'white';
            this.context.beginPath();
            this.context.lineWidth = 1.5;
            for(let i = 0; i <= 1; i+=.5){
                for (let j = 0; j <= 1; j+=.5){
                    //the starting x - .5 gets the ending x
                    /* this.context.moveTo(this.x + (this.width * i), this.y + (this.width * j));
                    this.context.lineTo(this.x + (this.width * i) + (this.width * (i-.5)), this.y + (this.width * j) + (this.width * (j-.5))); */
                    this.context.moveTo(this.x + (this.width * i), this.y + (this.width * j));
                    this.context.lineTo(this.x + (this.width * i) + (this.width * (i-.5)), this.y + (this.width * j) + (this.width * (j-.5)));
                }
            }
            this.context.stroke();
            this.context.lineWidth = 1;
            this.context.closePath();
        }
    }
}

export default ParticleEffect;