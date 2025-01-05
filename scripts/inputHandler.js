import {updateChildGraph, updateLabGraph, extrapolationGraphing} from "./graph.js"
export {validatedChildInputs, labTaken}
export {eventListeners}

let validatedChildInputs = {}
let validatedLabInputs = {}
let labTaken = {}
let lastLabs = []

//Add eventlistneres on start
function eventListeners() {
    //EVENT LISTEN ON MAIN PAGE
    document.getElementById("main").addEventListener("focusout", function(event) {
        //Returns inputted values as integers. Masking ensures correct input.
        let inputValue = parseInputToInteger(event.target.value);
        //Returns true or false if the input is valid or not
        let valid = validate(event.target.id, inputValue)
        if (valid) {addValue(event.target.id, inputValue)}
        //Adds/removes error message dependent on the validity of the input
        if (!valid || valid) {errorMessages(event.target.id, valid)}
        //Graph if all inputs are validated
        (readyForChildGraph())?updateChildGraph():console.log("waiting child graph")
    })
    //EVENT LISTEN ON ADD LAB BUTTON
    document.getElementById("add-lab").addEventListener("click", function(){
        saveLab();
        clearLabinput();
    })
}

//Listen on click for addLab button

//CONVERT INPUT TO INTEGERS
function parseInputToInteger(unformattedValue) {
    //Format values: remove masking and split minutes/hours & months/days
    let formattedValue = null
    if (/[gud]/.test(unformattedValue)) {
        formattedValue =  parseInt(unformattedValue.substring(0, unformattedValue.length - 1))
    } else if ((/µmol\/L/).test(unformattedValue)) {
        formattedValue =  parseInt(unformattedValue.substring(0, unformattedValue.length - 6))
    } else if (/[:/]/.test(unformattedValue)) {
        let ddhh = parseInt(unformattedValue.substring(0, 2)) // days or hours
        let mmmm = parseInt(unformattedValue.substring(3, 5)) // months or minutes
        formattedValue = [ddhh, mmmm]
    }
    return(formattedValue)
}

//VALIDATE INPUTS
function validate(id, integer) {
    let validation = null
    //Valid input ranges for each HTML ID
    const validationCriteria = {
        "birth-weight": [500, 7500],
        "date": [[1, 31],[1,12]],
        "time": [[0, 23],[0, 59]],
        "gestation-week": [22, 45],
        "gestation-day": [0, 6],
        "bilirubin-value": [0, 1000],
    }
    //Validate time/date input
    let sorting = id.includes("time")?"time":"date";
    if (id.includes("time")||id.includes("date")) {
        (integer != null
            &&  integer[0] >= validationCriteria[sorting][0][0]
            && integer[0] <= validationCriteria[sorting][0][1]
            && integer[1] >= validationCriteria[sorting][1][0]
            && integer[1] <= validationCriteria[sorting][1][1])
            ?validation=true:validation=false;
    }

    //Validates all other inputs (gram/weeks/days/mikromol)
    else {
        (integer != null
            && integer >= validationCriteria[id][0]
            && integer <= validationCriteria[id][1]
        )?validation=true:validation=false;
    }

    return(validation)
}

//ADD ERROR MESSAGE CLASS
function errorMessages(id, valid) {
    //Add class dependent on valid input or not (true/false)
    let addCss = valid? "no-error-message": "error-message"
    let removeCss = valid? "error-message": "no-error-message"
    //Target element
    const targetEleemnet = document.getElementById(id)
    //Add addCss to full inputs
    if (targetEleemnet.classList.contains("full-input")) {
        targetEleemnet.nextElementSibling.classList.add(addCss)
        targetEleemnet.nextElementSibling.classList.remove(removeCss)
    //Add addCss to half inputs
    } else if (targetEleemnet.classList.contains("half-input" || "lab-input")) {
        targetEleemnet.parentElement.nextElementSibling.classList.add(addCss)
        targetEleemnet.parentElement.nextElementSibling.classList.remove(removeCss)
    }
}

//Add values to child / lab input associated arrays
function addValue(id, inputValue) {
    const element = document.getElementById(id)
    if (element.classList.contains("child-info-input")) {
        validatedChildInputs[id] = inputValue;
    } else if (element.classList.contains("lab-input")) {
        validatedLabInputs[id] = inputValue;
    } else {
        console.log("Couldn't save info")
    }
}
function checkYear(date) {
    let year = new Date().getFullYear()
    if (new Date(year, date[1]-1, date[0],0, 0, 0, 0) > new Date()) {
        year += -1
    } else { year = year}
    return year
}

function readyForChildGraph() {
    if ((Object.keys(validatedChildInputs).length === 5)) {
        let time = validatedChildInputs["birth-time"]
        let date = validatedChildInputs["birth-date"]
        let year = checkYear(date)
        validatedChildInputs["birth-time-date"] = new Date(year, date[1]-1, date[0],time[0], time[1], 0, 0)
        delete validatedChildInputs["birth-date"]
        delete validatedChildInputs["birth-time"]
        console.log(validatedChildInputs)
        return true
    }
    return (Object.keys(validatedChildInputs).length === 5)
}

function saveLab() {
    let bilirubin = validatedLabInputs["bilirubin-value"]
    let time = validatedLabInputs["lab-time"]
    let date = validatedLabInputs["lab-date"]
    let year = checkYear(date)
    let labTimeDate = new Date(year, date[1]-1, date[0],time[0], time[1], 0, 0)
    labTaken[labTimeDate]=[time, date, bilirubin]

    //Make array with only datestamps
    let oldArray = labTaken
    let timeArray = []
    for (var timestamp in labTaken) {
        timeArray.push(new Date(timestamp))
    }

    //Sort array with datestamps according to time
    timeArray = timeArray.sort(function(a, b) {
        return a - b
    })

    //Update LabTaken in sorted order
    let sortedLabTaken = {}
    for (const [key, value] of Object.entries(timeArray)) {
        sortedLabTaken[value] = labTaken[value]
    }
    labTaken = sortedLabTaken

    //Update HTML + UPDATE GRAPH
    displayLabs();
    updateLabGraph();
    extrapolationGraphing();
}

function clearLabinput() {
    //Clear input fields
    document.getElementById("bilirubin-value").value = ""
    document.getElementById("lab-date").value = ""
    document.getElementById("lab-time").value = ""
}

function displayLabs() {
    //Display info on page
    //UL element for all lab <li> items
    const labList = document.getElementById("lab-list")
    //Remove old instance
    labList.innerHTML = ""
    //Loop through all labs:
    for (var key in labTaken) {
        //Decomposistion of values:
        let time = labTaken[key][0]
        let date = labTaken[key][1]
        let bilirubin = labTaken[key][2]

        //Create each lab as LI
        const li = document.createElement("li")
        li.id = key
        li.classList.add("individual-lab")
        const button = document.createElement("button")
        button.classList.add("remove-lab")
        button.addEventListener("click", function(event) {
          removeLab(event.target)
        })
        const image = document.createElement("img")
        image.src = "./assets/icons/fjern.svg"
        image.classList.add("individual-lab-remove")
        image.alt = "delete-icon"
        //Lab value
        const labValueElement = document.createElement('p')
        labValueElement.innerHTML = bilirubin
        //Lab date
        const labDateElement = document.createElement('p')
        labDateElement.innerHTML = date[0].toString().padStart(2, "0") + "/" + date[1].toString().padStart(2, "0")
        //Lab time
        const labTimeElement = document.createElement('p')
        labTimeElement.innerHTML = time[0].toString().padStart(2, "0") + ":" + time[1].toString().padStart(2, "0")

        //Append elements to each other
        button.appendChild(image)
        li.appendChild(button)
        li.appendChild(labValueElement)
        li.appendChild(labDateElement)
        li.appendChild(labTimeElement)
        labList.appendChild(li)
    }
}
function removeLab (targetButton) {
    //Remove from LabTaken array
    delete labTaken[targetButton.parentElement.parentElement.id]
    //Update HTML
    displayLabs()
    //Update Graph
    updateLabGraph()
    //Update extrapolation
    extrapolationGraphing()
}