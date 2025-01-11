import {updateChildGraph, updateLabGraph, extrapolationGraphing, removeChildGraph} from "./graph.js"
export {childInputs, labTaken}
export {eventListeners}

let childInputs = {}
let validatedLabInputs = {}
let labTaken = {}
let lastLabs = []

//Add eventlistneres on start
function eventListeners() {
    //autofocus
    document.getElementById("birth-weight").addEventListener("keydown", function() {
        let inputValid = validate("birth-weight", parseInputToInteger(document.getElementById("birth-weight").value));
        if (inputValid && (document.getElementById("birth-weight").value.length === 4 || document.getElementById("birth-weight").value.length === 5)) {
            document.getElementById("birth-date").focus()
        }
    })
    document.getElementById("birth-date").addEventListener("keydown", function() {
        let inputValid = validate("birt-date", parseInputToInteger(document.getElementById("birth-date").value));
        if (inputValid && document.getElementById("birth-date").value.trim("_").length === 5) {
            document.getElementById("birth-time").focus()
        }
    })
    document.getElementById("birth-time").addEventListener("keydown", function() {
        let inputValid = validate("birt-time", parseInputToInteger(document.getElementById("birth-time").value));
        console.log(document.getElementById("birth-time").value.replace(/_$/,''))
        console.log(document.getElementById("birth-time").value.replace(/_$/,'').length)
        console.log(inputValid)
        if (inputValid && document.getElementById("birth-time").value.replace(/_$/,'').length === 5) {
            console.log("focus")
            document.getElementById("gestation-week").focus()
        }
    })
    document.getElementById("gestation-week").addEventListener("keydown", function() {
        let inputValid = validate("gestation-week", parseInputToInteger(document.getElementById("gestation-week").value));
        if (inputValid && document.getElementById("gestation-week").value.length === 3) {
            document.getElementById("add-child").focus()
        }
    })
    document.getElementById("lab-date").addEventListener("keydown", function() {
        let inputValid = validate("lab-date", parseInputToInteger(document.getElementById("lab-date").value));
        if (inputValid && document.getElementById("lab-date").value.trim("_").length === 5) {
            document.getElementById("lab-time").focus()
        }
    })
    document.getElementById("lab-time").addEventListener("keydown", function() {
        let inputValid = validate("lab-time", parseInputToInteger(document.getElementById("lab-time").value));
        if (inputValid && document.getElementById("lab-time").value.replace(/_$/,'').length === 5) {
            document.getElementById("bilirubin-value").focus()
        }
    })
    document.getElementById("bilirubin-value").addEventListener("keydown", function() {
        console.log("bilirubin-value keydown")
        let inputValid = validate("bilirubin-value", parseInputToInteger(document.getElementById("bilirubin-value").value));
        console.log(inputValid)
        console.log(document.getElementById("bilirubin-value").value)
        if (inputValid && (document.getElementById("bilirubin-value").value.replace(/ µmol\/L$/,'') > 99)) {
            console.log("focus")
            document.getElementById("add-lab").focus()
        }
    })


    // SAVE CHILD INPUT AND CREATE GRAPH
    document.getElementById("add-child").addEventListener("click", function(event) {
        const CHILDINPUTS = ["birth-weight", "birth-date", "birth-time", "gestation-week"]
        for (const id of CHILDINPUTS) {
            //Returns inputted values as integers. Masking ensures correct input.
            let inputValue = parseInputToInteger(document.getElementById(id).value);
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
        //Checks for when child inputs is finished
        if (childInputs["birth-weight"] && childInputs["birth-date"] && childInputs["birth-time"] && childInputs["gestation-week"] ) {
            let time = childInputs["birth-time"]
            let date = childInputs["birth-date"]
            let year = checkYear(date)
            childInputs["birth-time-date"] = new Date(year, date[1]-1, date[0],time[0], time[1], 0, 0)
            showLabInputs()
            displayCompleteIcon()
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
            let inputValue = parseInputToInteger(document.getElementById(id).value);
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
    //ABOUT US ALERT BOX
    document.getElementById("about-us-info").addEventListener("click", function(){
        window.alert(
            "Lag med kjærlighet for barneavdelingen ved Sørlandet Sykehus <3 \n\n" +
            "Spørsmål/feil/annet? -> hei@sableteknisk.no\n\n" +
            "Pst. gjerne send med bilde om noe ikke fungerer som det skal :)"
        )
    })
}

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

//Add values to child / lab input associated arrays
function addValue(id, inputValue) {
    const element = document.getElementById(id)
    if (element.classList.contains("child-info-input")) {
        childInputs[id] = inputValue;
    } else if (element.classList.contains("lab-input")) {
        validatedLabInputs[id] = inputValue;
    } else {
        console.log("Couldn't save info")
        try {
            childInputs.pop(id)
            console.log(id + "removed from ValidatedChildInputs")
        } catch (error) {
            console.log("No " + id + " key in ValidatedChildInputs")
        }
    }
    console.log("ValidatedChildInputs:")
    console.log(childInputs)
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
        labDateElement.classList.add("semi-bold")
        labDateElement.innerHTML = date[0].toString().padStart(2, "0") + "/" + date[1].toString().padStart(2, "0")
        //Lab time
        const labTimeElement = document.createElement('p')
        labTimeElement.classList.add("semi-bold")
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

function displayCompleteIcon() {
    const completeIcon = document.getElementById("complete-icon")
    completeIcon.classList.remove("hidden")
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