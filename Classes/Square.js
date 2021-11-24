import ParticleEffect from "./ParticleEffect.js";

class Square{
    #xPos
    #yPos
    #width
    #occupant
    #context
    #fruitValue
    #fruitColor
    #isAnimating
    #particleEffects

    constructor(x, y, w, occ, context){
        this.#xPos = x;
        this.#yPos = y;
        this.#width = w;
        this.#occupant = occ || null;
        this.#context = context;
        this.#fruitColor = 'blue';
        this.#fruitValue = 1;
        this.#isAnimating = false;
        this.#particleEffects = [];
    }

    drawSelf(){
        switch(this.#occupant){
            case 'head' : this.#context.fillStyle = 'orange';
                break;
            case 'tail' : this.#context.fillStyle = 'green';
                break;
            case 'fruit' : this.#context.fillStyle = this.#fruitColor;
                break;
            case 'wall' : this.#context.fillStyle = 'red';
                break;
            default: this.#context.fillStyle = 'rgb(15, 15, 15)';
        }
        this.#context.fillRect(this.#xPos, this.#yPos, this.#width, this.#width);


        /* this.#gridContext.strokeStyle = 'white';
        this.#gridContext.strokeRect(this.#xPos, this.#yPos, this.#width, this.#width); */
    }

    drawAnimation(){

        if(this.#particleEffects && this.#particleEffects.length > 0){
            this.#particleEffects = this.#particleEffects.filter((effect, index)=>{
                if(effect.update()){
                    effect.draw();
                    return true;
                }else{
                    return false;
                }
            });
        }else{
            this.#isAnimating = false;
        }
        
        
    }

    isAnimating(){
        return this.#isAnimating
    }

    startAnimation(aniType){
        if(aniType == 'fruitCreation'){
            this.#isAnimating = true;
            this.#particleEffects.push(new ParticleEffect('boxticks', this.#xPos, this.#yPos, this.#context, this.#width));
        }else if (aniType == 'fruitConsumed'){
            this.#isAnimating = true;
            this.#particleEffects.push(new ParticleEffect('circleShrinking', this.#xPos + (this.#width * .5), this.#yPos + (this.#width * .5), this.#context));
        }
    }

    setFruitValue(value){
        switch(value){
            case 1: this.#fruitColor = 'blue';
                this.#fruitValue = 5;
                break;
            case 2: this.#fruitColor = 'turquoise';
                this.#fruitValue = 15;
                break;
            case 3: this.#fruitColor = 'white';
                this.#fruitValue = 50;
                break;
            case 4: this.#fruitColor = 'purple';
                this.#fruitValue = 100;
                break;
            default: this.#fruitColor = 'blue'
        }
        this.setOccupant('fruit');
    }

    setOccupant(occupant){
        this.#occupant = occupant;
    }

    getOccupant(){
        return this.#occupant;
    }

    resize(x, y, width){
        this.#xPos = x;
        this.#yPos = y;
        this.#width = width;
    }

    getPosition(){
        return `${this.#xPos}, ${this.#yPos}`;
    }

    getFruitValue(){
        return this.#fruitValue;
    }

}

export default Square;