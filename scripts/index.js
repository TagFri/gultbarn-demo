import {masking} from "./masking.js";
import {validateInputs, errorMessages} from './validation.js';
import {Child} from "./Child.js";
import {Bilirubin, saveBilirubin} from "./Bilirubin.js";
import {displayBilirubin} from "./displayBilirubin.js";
import {bilirubinOpacity } from "./opacityFilters.js";

export { currentChild, bilirubinOpacity}

//** CUSTOM INPUT MASKING
masking()


//** HANDLE CHILD SAVE BUTTON
//Event listener
document.querySelectorAll(".save-btn").forEach(button => button.addEventListener("click", (event) => {
    //Get container ID -> child-container || bilirubin-container
    const containerID = event.target.parentElement.parentElement.id

    //Get all inputs elements, including selct for birthweight
    let selectInpID = [...document.querySelectorAll(`#${containerID} select`), ...document.querySelectorAll(`#${containerID} input`)]

    //Create a shallow JSON from all elements
    let unvalidatedInp = {}
    for (let i=0; i < selectInpID.length; i++) {
        unvalidatedInp[selectInpID[i].id] = selectInpID[i].value;
    }

    //Validate input
    let validatedInputs = validateInputs(unvalidatedInp)
    if(validatedInputs) {
        containerID == "child-container"? saveChild(validatedInputs) : saveBilirubin(validatedInputs)
        console.log(`${containerID} VALIDATED`)
    } else {
        console.log(`${containerID} NOT VALIDATED`)
    }
}
)
);

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