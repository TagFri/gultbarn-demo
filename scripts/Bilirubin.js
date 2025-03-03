import {daysToMs, msToDays} from './dateFunctions.js'
export {Bilirubin, SerumBilirubin, TranscutanousBilirubin }

class Bilirubin {

    //STATICS VARIABLES

    //List of all labs
    static allBilirubins = [];
    static numberOflabs = 0;

    //STATIC METHODSs
    static get getNumberOfLabs(){return this.numberOflabs}
    static get getLabs(){return this.allBilirubins}

    //Update time of all labs
    static updateAllDates(diffInMs) {
        //Loop thrugh all labs
        for (let bilirubin of this.allBilirubins) {
            //Add difference to current lab

            lab.relativeDays(msToDays(daysToMs(lab.relativeDays) + diffInMs));msToDays
        }
    }

    //Variables
    #bilirubinValue;
    #relativeDays;

    constructor(bilirubinValue, relativeDays) {
        this.#bilirubinValue = bilirubinValue;
        this.#relativeDays = relativeDays;

        Bilirubin.numberOflabs += 1;
    }

    //GETTERS
    get bilirubinValue() {
        return this.#bilirubinValue;
    }
    get relativeDays() {
        return this.#relativeDays;
    }

    //SETTERS
    set bilirubinValue(bilirubinValue) {
        this.#bilirubinValue = bilirubinValue;
    }
    set relativeDats(relativeDays) {
        this.#relativeDays = relativeDays;
    }
    set relativeDays(relativeDays) {}
}

class SerumBilirubin extends Bilirubin {

    constructor(bilirubinValue, relativeDays) {
        super(bilirubinValue, relativeDays);
        Bilirubin.allBilirubins.push(this)
    }
}

class TranscutanousBilirubin extends Bilirubin {
    constructor(bilirubinValue, relativeDays) {
        super(bilirubinValue, relativeDays);
        Bilirubin.allBilirubins.push(this)
    }
}