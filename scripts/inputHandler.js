export {eventListeners, child, labs}
import {updateChildGraph, updateLabGraph    } from "./graph.js"

//**
//**** INPUT OBJECTS
//**

//Child-info for export
let child = null
class Child {
    constructor(birthWeight, date, time, gestationWeek) {
        this.birthWeight = birthWeight
        this.date = date
        this.time = time
        this.gestationWeek = gestationWeek
        this.timeDate = timeDate(date, time)
    }
    lightLimit() {
        let lightlimit = null
        if (this.birthWeight < 1000) {
            lightlimit = {
                "label": "Under 1000g",
                "data": {1: 100, 4: 150, 10: 150},
                "slope": (150 - 100) / (4 - 1)
            }
        } else if (this.birthWeight < 1500) {
            lightlimit = {
                "label": "Under 1500g",
                "data": {1: 125, 4: 200, 10: 200},
                "slope": (200 - 125) / (4 - 1)
            }
        } else if (this.birthWeight < 2500) {
            lightlimit = {
                "label": "Under 2500g",
                "data": {1: 150, 4: 250, 10: 250},
                "slope": (250 - 150) / (4 - 1)
            }
        } else if (this.birthWeight > 2500 && this.gestationWeek < 37) {
            lightlimit = {
                "label": "Over 2500g + GA <37",
                "data": {1: 150, 3: 300, 10: 300},
                "slope": (300 - 150) / (3 - 1)
            }
        } else if (this.birthWeight > 2500 && this.gestationWeek >= 37) {
            lightlimit = {
                "label": "Over 2500g + GA >=37",
                "data": {1: 175, 3: 350, 10: 350},
                "slope": (350 - 175) / (3 - 1)
            }
        } else {
            console.log("ERROR: No lightlimit found")
        }
        return(lightlimit)
    }
}

//Labs for export
let labs = []
class Lab {
    constructor(bilirubin, time, date) {
        this.bilirubin = bilirubin
        this.time = time
        this.date = date
        this.timeDate = timeDate(date, time)
    }}



//**
//**** EVENT LISTENERES
//**

//ADD EVENT LISTENERES ON START
function eventListeners() {
    document.getElementById("add-child").addEventListener("click", saveChild)
    document.getElementById("add-lab").addEventListener("click", saveLab)
    document.getElementById("journal-container").addEventListener("click", function (event) {
        target.backgroundImage = "url('./assets/icons/journal_grey.svg\')"
    })
}

//**
//**** GENERAL FUNCTIONS
//**

//CREATE TIMEDATE FROM LOCAL DATE + TIME
function timeDate(date, time) {
    let year = checkYear(date)
    return(new Date(year, date[1] - 1, date[0], time[0], time[1], 0, 0))
}

//CONVERT INPUT TO INTEGERS
function inputToInteger(input) {
    //Format values: remove masking and split minutes/hours & months/days
    let integerOutput = null
    if (/[gud]/.test(input)) {
        integerOutput = parseInt(input.substring(0, input.length - 1))
    } else if ((/µmol\/L/).test(input)) {
        integerOutput = parseInt(input.substring(0, input.length - 6))
    } else if (/[:/]/.test(input)) {
        let ddhh = parseInt(input.substring(0, 2)) // days or hours
        let mmmm = parseInt(input.substring(3, 5)) // months or minutes
        integerOutput = [ddhh, mmmm]
    }
    return (integerOutput)
}

//VALIDATE INPUTS
function inputValidation(htmlID, intValue) {
    //If time/date, remove id before (eg. birth-time -> time)
    let validationID = htmlID
    if (validationID.includes("time") || validationID.includes("date")) {
        validationID = validationID.substring(validationID.indexOf("-") + 1)
    }
    let validation = null
    //Valid input ranges for each HTML ID
    const validationCriteria = {
        "birth-weight": [500, 7500],
        "date": [[1, 31], [1, 12]],
        "time": [[0, 23], [0, 59]],
        "gestation-week": [22, 45],
        "bilirubin-value": [0, 1000],
    }
    //Validate time/date input
    let sorting = validationID.includes("time") ? "time" : "date";
    if (validationID.includes("time") || validationID.includes("date")) {
        (intValue != null
            && intValue[0] >= validationCriteria[sorting][0][0]
            && intValue[0] <= validationCriteria[sorting][0][1]
            && intValue[1] >= validationCriteria[sorting][1][0]
            && intValue[1] <= validationCriteria[sorting][1][1])
            ? validation = true : validation = false;
    }
    //Validates all other inputs (gram/weeks/days/mikromol)
    else {
        (intValue != null
            && intValue >= validationCriteria[validationID][0]
            && intValue <= validationCriteria[validationID][1]
        ) ? validation = true : validation = false;
    }
    return (validation)
}

function checkYear(date) {
    let year = new Date().getFullYear()
    //Check if date is larger then today (hence subtract one year
    if (new Date(new Date().getFullYear(), date[1] - 1, date[0], 0, 0, 0, 0) > new Date()) {
        year += -1
    }
    return year
}

//TOGGLE OPACITY
function toggleOpacity(boolean) {
    //True = enable opacity. False = disable opacity
    //Toggle inputs disabled
    const labInputs = [
        document.getElementById("lab-date"),
        document.getElementById("lab-time"),
        document.getElementById("bilirubin-value"),
        document.getElementById("add-lab")]
    for (const input of labInputs) {
        boolean? input.disabled = true : input.disabled = false
    }
    //Toggle container opacity
    if (boolean) {
        document.getElementById("lab-container").classList.add("opacity-container")
        document.getElementById("graph-container").classList.add("opacity-container")
    } else {
        document.getElementById("lab-container").classList.remove("opacity-container")
        document.getElementById("graph-container").classList.remove("opacity-container")
    }
}

//ADD ERROR MESSAGE
function errorMessages(id, valid) {
    //Add class dependent on valid input or not (true/false)
    let addCss = valid ? "no-error-message" : "error-message"
    let removeCss = valid ? "error-message" : "no-error-message"
    //Target element
    let errorId = id + "-error"
    document.getElementById(errorId).classList.add(addCss)
    document.getElementById(errorId).classList.remove(removeCss)
}

//**
//**** CHILD/LAB BOX VALIDATION
//**
function validateInputGroup(classSelector) {
    let errorCounter = 0;
    let inputs = document.querySelectorAll(classSelector)
    let validatedInputs = []
    //Loop through all inputs
    for (const input of inputs) {
        //Get value and ID
        let inputID = input.id
        let inputValue = inputToInteger(input.value);
        //VALIDATION OF INPUT.
        if (inputValidation(inputID, inputValue)) {
            //Remove error message
            errorMessages(inputID, true)
            //Add validated input
            validatedInputs.push(inputValue)
        } else {
            //Add error message + error counter
            errorMessages(inputID, false)
            errorCounter +=1;
        }
    }
    return [validatedInputs, errorCounter]
}

//**
//**** CHILD HANDLING
//**
function saveChild() {

    let validation = validateInputGroup(".child-info-input")
    let validatedInputs = validation[0]
    let errorCounter = validation[1]

    //Check if child as whole is valid
    if (errorCounter == 0) {
        //Create child object
        child = new Child(validatedInputs[0], validatedInputs[1], validatedInputs[2], validatedInputs[3])
        //Show complete icon on box
        document.getElementById("complete-icon").classList.remove("hidden")
        //Remove opacity on labs + graph
        toggleOpacity(false)
        //Create child graph
        updateChildGraph()
        //Focus on lab-date
        document.getElementById("lab-date").focus()
    //If not valid = remove complete icon, turn on opacity, auto-focus on error input and remove graph
    } else {
        document.getElementById("complete-icon").classList.add("hidden") //Remove complete icon on box
        toggleOpacity(true) // Add opacity and disable lab inputs
        //todo focus on error-input
        //todo remove graphs
    }
}

//**
//**** LAB HANDLING
//**

function saveLab() {
    //Validation function and variables
    let validation = validateInputGroup(".lab-input")
    let validatedInputs = validation[0]
    let errorCounter = validation[1]

    //Check if lab is complete
    if (errorCounter == 0) {
        let birthMonth = child.timeDate.getMonth() + 1
        let labMonth = validatedInputs[0][1]
        //Om lab er før fødsel

        // Om lab er mer enn 3 mnd etter

        // Om lab er innenfor

        //Calculate timedate variable
        let year = checkYear(validatedInputs[0])
        let timeDate = new Date(year, validatedInputs[0][1] - 1, validatedInputs[0][0], validatedInputs[1][0], validatedInputs[1][1], 0, 0)
        //Check that lab is taken after child is born
        if (timeDate < child.timeDate) {
            errorMessages("early-lab", false)
            console.log("ERROR: Lab is taken before child is born")
            console.log(`Timedate ${timeDate}`)
            console.log(`ChildTime ${child.timeDate}`)
        } else {
        //Save lab in labs
            let lab = new Lab(
                //Bilirubin
                validatedInputs[2],
                //Date
                validatedInputs[1],
                //Time
                validatedInputs[0])
            //Add lab object to lab collection
            labs.push(lab)
            labs = labs.sort((a, b) => a.timeDate - b.timeDate)
            //Sort collection on time taken
            //Remove error message, clear inputs, display labs and focus on lab date.
            errorMessages("early-lab", true)
            clearLabinput()
            displayLabs();
            updateLabGraph()
            //extrapolationGraphing()
            document.getElementById("lab-date").focus()
        }
    //Lab is incomplete
    } else {
        //todo focus on error-input
    }
}

function clearLabinput() {
    //Clear input fields
    document.getElementById("bilirubin-value").value = ""
    document.getElementById("lab-date").value = ""
    document.getElementById("lab-time").value = ""
}

function displayLabs() {
    //REMOVE OLD LABS
    const labList = document.getElementById("lab-list")
    labList.innerHTML = ""
    //READD LABS
    for (const lab of labs) {
        ////Create each lab as LI
        const li = document.createElement("li")
        li.id = lab.timeDate
        li.classList.add("individual-lab")
        const button = document.createElement("button")
        button.classList.add("remove-lab")
        button.addEventListener("click", function (event) {
            removeLab(event.target)
        })
        const image = document.createElement("img")
        image.src = "./assets/icons/remove.svg"
        image.classList.add("individual-lab-remove")
        image.alt = "delete-icon"
        //Lab value
        const labValueElement = document.createElement('p')
        labValueElement.classList.add("semi-bold")
        labValueElement.innerHTML = lab.bilirubin
        //Lab date
        const labDateElement = document.createElement('p')
        labDateElement.innerHTML = lab.date[0].toString().padStart(2, "0") + "/" + lab.date[1].toString().padStart(2, "0")
        //Lab time
        const labTimeElement = document.createElement('p')
        labTimeElement.innerHTML = lab.time[0].toString().padStart(2, "0") + ":" + lab.time[1].toString().padStart(2, "0")

        //Append elements to each other
        button.appendChild(image)
        li.appendChild(button)
        li.appendChild(labValueElement)
        li.appendChild(labDateElement)
        li.appendChild(labTimeElement)
        labList.appendChild(li)
    }

}

function removeLab(targetButton) {
    //Remove from Labs array
    for (let i = 0; i < labs.length; i++) {
        //
        if (labs[i].timeDate == targetButton.parentElement.parentElement.id) {
            labs.splice(i, 1)
            break
        }
    }
    //Update HTML
    displayLabs()
    //Update Graph
    updateLabGraph()
    //Update extrapolation
    //extrapolationGraphing()
}