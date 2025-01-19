import {updateChildGraph, updateLabGraph, extrapolationGraphing, removeChildGraph} from "./graph.js"
export {childInputs, labTaken}
export {eventListeners, validateChild}

let childInputs = {}
let validatedLabInputs = {}
let labTaken = {}

//Add eventlistneres on start
function eventListeners() {
    //VALIDATION AND AUTONEXT ON KEYSTROKE AT INPUTS
    document.getElementById("all-input-container").addEventListener("keyup", function(target) {
        autoNextInput(target)

    // SAVE CHILD INPUT AND CREATE GRAPH
    document.getElementById("add-child").addEventListener("click", function(event) {
        const CHILDINPUTS = ["birth-weight", "birth-date", "birth-time", "gestation-week"]
        for (const id of CHILDINPUTS) {
            //Returns inputted values as integers. Masking ensures correct input.
            let inputValue = inputToInteger(document.getElementById(id).value);
            //Returns true or false if the input is valid or not
            let valid = validate(id, inputValue)
            //Valid inputs are added to the list
            if (valid) {
                errorMessages(id, false)
            //Invalid inputs are displayed as error
            } else {
                errorMessages(id, true)
            }
        }
        //Checks for when child inputs is finished
        if (childInputs["birth-weight"] && childInputs["birth-date"] && childInputs["birth-time"] && childInputs["gestation-week"] ) {
            let time = childInputs["birth-time"]
            let date = childInputs["birth-date"]
            let year = checkYear(date)
            childInputs["birth-time-date"] = new Date(year, date[1]-1, date[0],time[0], time[1], 0, 0)
            showLabInputs()
            showFormCompletion(true)
            updateChildGraph()
            document.getElementById("lab-date").focus()
        } else {
        console.log("Not ready for labs")
    }})
    //SAVE LAB INPUTS AND CREATE GRAPH
    document.getElementById("add-lab").addEventListener("click", function(){
        const LABINPUTS = ["lab-date", "lab-time", "bilirubin-value"]
        for (const id of LABINPUTS) {
            //Returns inputted values as integers. Masking ensures correct input.
            let inputValue = inputToInteger(document.getElementById(id).value);
            //Returns true or false if the input is valid or not
            let valid = validate(id, inputValue)
            //Valid inputs are added to the list
            if (valid) {
                errorMessages(id, false)
                addValue(id, inputValue)
                //Invalid inputs are displayed as error
            } else {
                errorMessages(id, true)
            }
        }
        saveLab();
    })
})}

function autoNextInput(target) {
    //Get ID for input element
    let inputID = target.target.id
    let inputValue = target.target.value;
    //Chooce next focus when validated
    let inputFields = ["birth-weight", "birth-date", "birth-time", "gestation-week", "add-child" ,"lab-date", "lab-time", "bilirubin-value", "add-lab"]
    let nextInput = (inputFields[inputFields.indexOf(inputID) +1])
    //If time/date, remove id before (eg. birth-time -> time)
    let validationID = inputID
    if (validationID.includes("time") || validationID.includes("date")) {
        validationID = validationID.substring(validationID.indexOf("-")+1)
    }
    //AUTOFOCUS PARAMETERS
    const VALID_LENGTH = {
        "birth-weight": 5,
        "date": 5,
        "time": 5,
        "gestation-week": 3,
        "bilirubin-value": 10
    }
    //Validate input (correct range + format) -> go to next input
    let inputValid = validate(inputID, inputToInteger(inputValue));
    if (inputValid && inputValue.replaceAll('_','').length === VALID_LENGTH[validationID])
    {
        document.getElementById(nextInput).focus()
    }
}

//CONVERT INPUT TO INTEGERS
function inputToInteger(input) {
    console.log("INPUT: " + input)
    //Format values: remove masking and split minutes/hours & months/days
    let integerOutput = null
    if (/[gud]/.test(input)) {
        integerOutput =  parseInt(input.substring(0, input.length - 1))
    } else if ((/µmol\/L/).test(input)) {
        integerOutput =  parseInt(input.substring(0, input.length - 6))
    } else if (/[:/]/.test(input)) {
        let ddhh = parseInt(input.substring(0, 2)) // days or hours
        let mmmm = parseInt(input.substring(3, 5)) // months or minutes
        integerOutput = [ddhh, mmmm]
    }
    return(integerOutput)
}

//VALIDATE INPUTS
function validate(id, integer) {
    let validation = null
    //Valid input ranges for each HTML ID
    const validationCriteria = {
        "birth-weight": [500, 4999],
        "date": [[1, 31],[1,12]],
        "time": [[0, 23],[0, 59]],
        "gestation-week": [22, 45],
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
function validateChild() {
    console.log("VALIDATE CHILD")
    //todo validate whole container
    //
}


function validateForm(formElement) {
    for (const input of formElement.elements) {
        if (input.type === 'text') {
            console.log(input.id)
        }
    }
}

//ADD ERROR MESSAGE CLASS
function errorMessages(id, valid) {
    //Add class dependent on valid input or not (true/false)
    let addCss = valid? "error-message": "no-error-message"
    let removeCss = valid? "no-error-message": "error-message"
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

function showFormCompletion(boolean) {
    const COMPLETE_ICON = document.getElementById("complete-icon")
    if (boolean) {
        COMPLETE_ICON.classList.remove("hidden")
    } else {
        COMPLETE_ICON.classList.add("hidden")
    }
}

function checkYear(date) {
    let year = new Date().getFullYear()
    //Check if date is larger then today (hence subtract one year
    if (new Date(year, date[1]-1, date[0],0, 0, 0, 0) > new Date()) {
        year += -1
    } else { year = year}
    return year
}

function saveLab() { //addlab
    let bilirubin = validatedLabInputs["bilirubin-value"]
    let time = validatedLabInputs["lab-time"]
    let date = validatedLabInputs["lab-date"]
    let year = checkYear(date)
    let labTimeDate = new Date(year, date[1]-1, date[0],time[0], time[1], 0, 0)
    //If lab is before birth -> Create errror message. Includes future values
    if (labTimeDate < childInputs["birth-time-date"]) {
        errorMessages("lab-date", true)
    //Else update labvalues
    }else {
        labTaken[labTimeDate] = [time, date, bilirubin]

        //Make array with only datestamps
        let oldArray = labTaken
        let timeArray = []
        for (var timestamp in labTaken) {
            timeArray.push(new Date(timestamp))
        }

        //Sort array with datestamps according to time
        timeArray = timeArray.sort(function (a, b) {
            return a - b
        })

        //Update LabTaken in sorted order
        let sortedLabTaken = {}
        for (const [key, value] of Object.entries(timeArray)) {
            sortedLabTaken[value] = labTaken[value]
        }
        labTaken = sortedLabTaken

        //Update HTML + UPDATE GRAPH
        clearLabinput()
        displayLabs();
        updateLabGraph();
        extrapolationGraphing();
        document.getElementById("lab-date").focus()
    }
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
        labValueElement.classList.add("semi-bold")
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

function showLabInputs() {
    //Fetch all inputs that need to be activated:
    const labDate = document.getElementById("lab-date")
    const labTime = document.getElementById("lab-time")
    const bilirubinValue = document.getElementById("bilirubin-value")
    const addLab = document.getElementById("add-lab")
    const labInputs = [labDate, labTime, bilirubinValue, addLab]
    for (const input of labInputs) {
        input.disabled = false
    }
    //Remove opacity on lab container
    const labContainer = document.getElementById("lab-container")
    labContainer.classList.remove("opacity-container")

    const graphContainer = document.getElementById("graph-container")
    graphContainer.classList.remove("opacity-container")

}





//Reorganize form to values
function getFormValues(form) {
    let values = {}
    for (input of form.elements) {
        if (input.type === 'text') {
            if (input.id === 'birth-weight') {
                values["birthWeight"] = input.value;
            } else if (input.id === 'birth-date') {
                values["birthDate"] = input.value;
            } else if (input.id === 'birth-time') {
                values["birthTime"] = input.value;
            } else if (input.id === 'gestation-week') {
                values["gestationWeek"] = input.value;
            }
        }
    }
    return(values)
}


//create objects from Form
class ChildInfo {
    constructor([birthWeight, birthDate, birthTime, gestationWeek]) {
        this.birthWeight = birthWeight;
        this.birthDate = birthDate;
        this.birthTime = birthTime;
        this.gestationWeek = gestationWeek;
    }
}