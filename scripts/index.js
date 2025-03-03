import {masking} from "./masking.js";
import {validateInputs} from './validation.js';
import {Child} from "./Child.js";
import {Bilirubin, SerumBilirubin, TranscutanousBilirubin} from "./Bilirubin.js";
import {daysRelativeToReferenceDate} from "./dateFunctions.js";
import {displayBilirubin} from "./displayBilirubin.js";

export { currentChild , currentBilirubins}


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
        saveChild(validatedInputs);
        //Remove opacity and enable bilirubin inputs
        enableOpacity(false)
    } else {
        // If not validated, turn on opacity again
        enableOpacity(true)
        console.log("Invalid inputs")
}});

function enableOpacity(boolean) {
    document.getElementById("bilirubinDate").disabled = boolean;
    document.getElementById("bilirubinTime").disabled = boolean;
    document.getElementById("bilirubinValue").disabled = boolean;
    document.getElementById("add-bilirubin").disabled = boolean;

    if (boolean) {
        document.getElementById("bilirubin-container").classList.add("opacity-container");
        document.getElementById("graph-container").classList.add("opacity-container");
        document.getElementById("advice-container").classList.add("opacity-container");
        document.getElementById("journal-container").classList.add("opacity-container");
    } else {
        document.getElementById("bilirubin-container").classList.remove("opacity-container");
        document.getElementById("bilirubinDate").focus()
        document.getElementById("graph-container").classList.remove("opacity-container");
        document.getElementById("advice-container").classList.remove("opacity-container");
        document.getElementById("journal-container").classList.remove("opacity-container");
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
        saveBilirubin(validatedInputs);
        displayBilirubin()
    } else {
        console.log("Invalid inputs")
    }});


//**
//**** VARIABLE STORAGE
//**

let currentChild;
let currentBilirubins = []
let currentGraph;
let currentAdvice;
let currentJournal;

//**
//**** CREATE OR UPDATE CHILD
//**

function saveChild(validatedInputs) {
    if(currentChild === undefined) {
        currentChild = new Child(validatedInputs);
    } else {
        currentChild.update(validatedInputs);
    }
}

//**
//**** CREATE OR UPDATE BILIRUBINS
//**

function saveBilirubin(validatedInputs) {
    let relativeDays = daysRelativeToReferenceDate(currentChild.birthDateTime, validatedInputs.dateTime);
    currentBilirubins.push(new SerumBilirubin(validatedInputs.bilirubinValue, relativeDays));
    console.log("BILIRUBIN SAVING")
}

//**
//**** GRAPHING
//**

//If save is sucessfull -> run business logic

//- Advice

//- Graph


//- Journal