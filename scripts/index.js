import {inputMasking} from "./inputMasking.js";
import {validateInputs, errorMessages} from './inputValidation.js';
import {saveChild, currentChild} from "./Child.js";
import {saveBilirubin} from "./Bilirubin.js";
import {bilirubinOpacity } from "./inpustOpacityFilter.js";
import {initiateGraph } from "./graph.js";

export {bilirubinOpacity}

//**
//**** VARIABLE STORAGE
//**

let currentLightGraph;
let currentTransfusionGraph;
let currentBilirubinGraph;
let currentExtrapolationGraph;
let currentAdvice;
let currentJournal;


//** CUSTOM INPUT MASKING
inputMasking()

//** GRAPH
initiateGraph()

//** HANDLE SAVE BUTTON
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
}));
