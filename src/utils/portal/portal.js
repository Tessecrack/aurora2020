export default class Portal {
    constructor(x, y, effect) {
        this.x = x; 
        this.y = y;
        this.effect = effect;
        this.width = effect.width; 
        this.height = effect.height;
    }
}