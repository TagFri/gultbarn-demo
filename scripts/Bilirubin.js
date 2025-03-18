import { daysToAbsoluteDate, leadingZero} from './generalFunctions.js';
import { Child } from "./Child.js";
import { errorMessages } from "./inputValidation.js";
import {GraphContainer} from "./GraphContainer.js";
import {Advice} from "./Advice.js";

export {Bilirubin, SerumBilirubin, TranscutanousBilirubin}

class Bilirubin {

    //**** STATICS
    //List of all labs
    static allBilirubins = [];
    static numberOfBilirubins = 0;
    static maxX = 0
    static maxY = 0

    //Update time of all labs (used when child time is updated)
    static updateAllBilirubinDates(oldDateTime, newDateTime) {
        const changeInDays = (oldDateTime - newDateTime) / (1000 * 60 * 60 * 24);

        //Loop thrugh all labs
        for (const bilirubin of Bilirubin.allBilirubins) {

            //Update relative days
            bilirubin.relativeDays = bilirubin.relativeDays + changeInDays;
        }

        //Delete labs before new birth date
        const remaining = Bilirubin.allBilirubins.filter(bilirubin => bilirubin.relativeDays >= 0);
        if (remaining.length != Bilirubin.allBilirubins.length) {
            Bilirubin.allBilirubins = remaining;
            errorMessages("bilirubinBeforeRemoved", true, true)
        }
        this.displayBilirubin()

        GraphContainer.updateBilirubinGraph()

        GraphContainer.updateExtrapolationGraph()

        return true;
    }

    //Get last bilirubin object
    static lastBilirubin() {
        return Bilirubin.allBilirubins.slice().reverse()[0]
    }

    //Get bilirubin slope of two last bilirubins (used for graph and advice measurments)
    static bilirubinSlope() {
        if (Bilirubin.allBilirubins.length < 2) {
            return false
        }
        let reverseBillibinArray = Bilirubin.allBilirubins.slice().reverse()
        let diffY = reverseBillibinArray[0].bilirubinValue - reverseBillibinArray[1].bilirubinValue
        let diffX = reverseBillibinArray[0].relativeDays - reverseBillibinArray[1].relativeDays
        return diffY / diffX
    }

    //Get extrapolation point
    static extrapolationPoint() {
        if (Bilirubin.allBilirubins.length < 2) {
            return false
        }
        const extrapolationGraph = GraphContainer.getInstance().extrapolationGraph;
        const lastCoordinate = extrapolationGraph[extrapolationGraph.length - 1];
        return lastCoordinate;
    }

    //Bilirubin overview for mail
    static printBilirubinOverview() {
        let labOverview = "";
        for (const bilirubin of Bilirubin.allBilirubins) {
            labOverview += `Dag: ${bilirubin.relativeDays}: ${bilirubin.bilirubinValue} µmol/L\n`;
        }
        return labOverview
    }

    //Display bilirubin values on webpage
    static displayBilirubin() {
        //REMOVE OLD LABS
        const bilirubinList = document.getElementById("bilirubin-list")
        bilirubinList.innerHTML = ""

        //SORT ALL LABS CHORNOLOGICALLY

        //READD ALL LABS
        for (const bilirubin of Bilirubin.allBilirubins) {

            ////Create each bilirubin as LI with ID of relative days
            const li = document.createElement("li")
            li.id = bilirubin.relativeDays
            li.classList.add("individual-bilirubin")

            //Create remove button with class remove-bilirubin. Listen on click event
            const button = document.createElement("button")
            button.classList.add("remove-bilirubin")
            button.addEventListener("click", function (event) {

                //Remove current element
                const sucessfullDeltion = Bilirubin.removeBilirubin(event.target)

                //REDISPLAY BILIRUBINS IF SUCCESSFULL
                if (sucessfullDeltion) {

                    //TURN ON OPACITY IF ALL BILIRUBINS ARE REMOVED
                    if (Bilirubin.allBilirubins.length == 0) {
                        document.getElementById("advice-container").classList.add("opacity-container")
                        document.getElementById("journal-container").classList.add("opacity-container")
                        GraphContainer.toggleTransfusionGraph(false)
                        GraphContainer.getInstance().myChart.update();
                    }

                    //REDISPLAY ALL BILIRUBINS
                    else {
                        //Update bilirubin display
                        Bilirubin.displayBilirubin()
                    }
                }

            })
            const image = document.createElement("img")
            image.src = "./assets/icons/remove.svg"
            image.classList.add("individual-bilirubin-remove")
            image.alt = "delete-icon"

            //Bilirubin value
            const bilirubinValueElement = document.createElement('p')
            bilirubinValueElement.classList.add("semi-bold")
            bilirubinValueElement.innerHTML = bilirubin.bilirubinValue


            // Bilirubin date and time
            //Convert relative bilirubin date to absolute date
            let date = new Date(daysToAbsoluteDate(Child.getInstance().birthDateTime, bilirubin.relativeDays))

            // CREATE DATE AND TIME ELEMENT
            const bilirubinDateElement = document.createElement('p')
            const bilirubinTimeElement = document.createElement('p')

            //MAKE VALUES FOR DATE AND TIME
            const month = leadingZero(date.getMonth() + 1)
            const day = leadingZero(date.getDate())
            const hour = leadingZero(date.getHours())
            const minute = leadingZero(date.getMinutes())

            //ADD VALUES TO HTML ELEMENTS
            bilirubinDateElement.innerHTML = `${day}/${month}`
            bilirubinTimeElement.innerHTML = `${hour}:${minute}`

            //Append elements to each other
            button.appendChild(image)
            li.appendChild(button)
            li.appendChild(bilirubinValueElement)
            li.appendChild(bilirubinDateElement)
            li.appendChild(bilirubinTimeElement)
            bilirubinList.appendChild(li)

        }

        //Turn off opacity of advice and journal container
        document.getElementById("advice-container").classList.remove("opacity-container")
        document.getElementById("journal-container").classList.remove("opacity-container")
    }

    static removeBilirubin(targetButton) {

        //Setup loop for all bilirubin labs
        for (let i = 0; i < Bilirubin.numberOfBilirubins; i++) {


            //FIND ELEMENT IN BILIRUBIN ARRAY FROM PUSHED BUTTON ON WEBAPGE
            if (Bilirubin.allBilirubins[i].relativeDays == targetButton.parentElement.parentElement.id) {

                //Remove matching bilirubin object
                Bilirubin.allBilirubins.splice(i, 1);

                //Update bilirubin counter
                Bilirubin.numberOfBilirubins --;

                //Redisplay remaining bilirubins
                Bilirubin.displayBilirubin();

                //Update Bilirubin graph
                GraphContainer.updateBilirubinGraph()

                //Update extrapolation graph
                GraphContainer.updateExtrapolationGraph()

                //Update X-values
                GraphContainer.updateAxises()

                //Update advices
                Advice.setCurrentAdvice(Child.getInstance())
                Advice.displayAdvice(Child.getInstance())

                return true;
            }
        }
        //Show error msg and return false
        errorMessages("bilirubin-list", true)
        return false;
    }

    //CLASS VARIABLES
    #bilirubinValueVal;
    #relativeDaysVal;

    //CONSTRUCTORS
    constructor(bilirubinValue, relativeDays) {
        this.#bilirubinValueVal = bilirubinValue;
        this.#relativeDaysVal = relativeDays;

        //Push itself to static array for superclass
        Bilirubin.allBilirubins.push(this);

        //Add total number of bilirubin tests
        Bilirubin.numberOfBilirubins += 1;

        //Sort bilirubin array according to date
        Bilirubin.allBilirubins.sort((a, b) => a.relativeDays - b.relativeDays);

        //Update static max variables
        if (Bilirubin.maxX < this.relativeDays) {
            Bilirubin.maxX = this.relativeDays;
        }
        if (Bilirubin.maxY < this.bilirubinValue) {
            Bilirubin.maxY = this.bilirubinValue;
        }

        return true;
    }

    //GETTERS
    get bilirubinValue() {
        return this.#bilirubinValueVal;
    }
    get relativeDays() {
        return this.#relativeDaysVal;
    }

    //SETTERS
    set bilirubinValue(bilirubinValue) {
        this.#bilirubinValueVal = bilirubinValue;
    }
    set relativeDays(relativeDays) {
        this.#relativeDaysVal = relativeDays;
    }

}

class SerumBilirubin extends Bilirubin {

    constructor(bilirubinValue, relativeDays) {
        super(bilirubinValue, relativeDays);
    }
}

class TranscutanousBilirubin extends Bilirubin {
    constructor(bilirubinValue, relativeDays) {
        //Call Bilirubin class constructor
        super(bilirubinValue, relativeDays);
    }
}