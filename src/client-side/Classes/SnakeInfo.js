class SnakeInfo{
    #index
    #occupant

    constructor(i, occ){
        this.#index = i;
        this.#occupant = occ;
    }

    setIndex(i){
        this.#index = i;
    }

    setOccupant(occ){
        this.#occupant = occ;
    }

    getIndex(){
        return this.#index;
    }

    getOccupant(){
        return this.#occupant;
    }
}

export default SnakeInfo;