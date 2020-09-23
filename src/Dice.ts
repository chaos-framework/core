export default class Dice {
    static alwaysMinimum = false; // Always "roll" the lowest number -- good for testing

    // Roll a number of dice of a certain size, ie roll two d20s would be roll(2, 20)
    static roll(count: number, size: number) {
        if(Dice.alwaysMinimum) {
            return count;
        }
        else {
            return 1; // TODO rand with dice size
        }
    }
}