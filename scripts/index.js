import {masking} from "./masking.js";
import {validateInputs, errorMessages} from './validation.js';
import {Child} from "./Child.js";
import {Bilirubin, saveBilirubin} from "./Bilirubin.js";
import {displayBilirubin} from "./displayBilirubin.js";

export { currentChild, bilirubinOpacity}

document.getElementById("test-btn").addEventListener("click", (event) => {
    console.log(Bilirubin.allBilirubins)
    console.log(Bilirubin.numberOfBilirubins)
})

//** CUSTOM INPUT MASKING
masking()

//** SAVE CHILD INFO

//Event listener
document.getElementById("save-child").addEventListener("click", (event) => {

    //Validate child inputs -> returns false || {validated inputs}
    let validatedInputs = validateInputs({
            birthDate: document.getElementById("birthDate").value,
            birthTime: document.getElementById("birthTime").value,
            gestationWeek: document.getElementById("gestationWeek").value,
    });

    //If validated -> saveChild
    if(validatedInputs) {

        //Add birthWeight
        validatedInputs["birthWeight"] = parseInt(document.getElementById("birthWeight").value);

        //Save child
        saveChild(validatedInputs);

    } else {
        // If not validated, turn on opacity again
        bilirubinOpacity(true)
        console.log("Invalid inputs")
}});

function bilirubinOpacity(boolean) {
    document.getElementById("bilirubinDate").disabled = boolean;
    document.getElementById("bilirubinTime").disabled = boolean;
    document.getElementById("bilirubinValue").disabled = boolean;
    document.getElementById("add-bilirubin").disabled = boolean;

    if (boolean) {
        document.getElementById("bilirubin-container").classList.add("opacity-container");
        document.getElementById("graph-container").classList.add("opacity-container");
    } else {
        document.getElementById("bilirubin-container").classList.remove("opacity-container");
        document.getElementById("bilirubinDate").focus()
        document.getElementById("graph-container").classList.remove("opacity-container");
    }
}


//Listen on save bilirubin button -> Validate -> Create bilirubin from JSON
document.getElementById("add-bilirubin").addEventListener("click", (event) => {
    //Validate child inputs -> returns false / {validated inputs}
    let validatedInputs = validateInputs({
        bilirubinDate: document.getElementById("bilirubinDate").value,
        bilirubinTime: document.getElementById("bilirubinTime").value,
        bilirubinValue: document.getElementById("bilirubinValue").value,
    });
    //If validated -> saveChild
    if(validatedInputs) {
        console.log("BILIRUBIN VALIDATED")
        saveBilirubin(validatedInputs)
    } else {
        console.log("Invalid inputs")
    }});


//**
//**** VARIABLE STORAGE
//**

let currentChild;

let currentGraph;
let currentAdvice;
let currentJournal;

//**
//**** CREATE OR UPDATE CHILD
//**

function saveChild(validatedInputs) {
    if(currentChild === undefined) {
        currentChild = new Child(validatedInputs);
    }
    //Update child object
    else {

        //Save previpus child state
        let previousChild = {
            birthWeight: currentChild.birthWeight,
            gestationWeek: currentChild.gestationWeek,
            birthDateTime: currentChild.birthDateTime
        }

        //Update current child
        currentChild.update(validatedInputs)

        //Change in time
        if (previousChild.birthDateTime != currentChild.birthDateTime) {

            //UPDATE BILIRUBIN RELATIVE DAYS
            Bilirubin.updateAllBilirubinDates(previousChild.birthDateTime, currentChild.birthDateTime)

            //DISPLAY UPDATES updates
            displayBilirubin()

            // Redraw graphs
            // Rerun advíces

            //UPDATE LIGHT GRAPHS

            //UPDATE TRANSDUSION GRAPHS


        }
    }
}

function rerunGraphsAdvice() {

}