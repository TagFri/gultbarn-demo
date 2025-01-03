export {eventListeners}

let childInputs = {}
let labInputs = {}

//Listen on blur for whole page
function eventListeners() {
    document.getElementById("main").addEventListener("focusout", function(event) {
        //Returns inputted values as integers. Masking ensures correct input.
        let inputValue = parseInputToInteger(event.target.value);
        //Returns true or false if the input is valid or not
        let valid = validate(event.target.id, inputValue)
        if (valid) {addValue(event.target.id)}
        //Adds/removes error message dependent on the validity of the input
        if (!valid || valid) {errorMessages(event.target.id, valid)}
        //Graph if all inputs are validated
        (readyForChildGraph())?console.log("graphing...."):console.log("Not ready for graph, missing validated inputs")
        console.log(childInputs)
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

function addValue(id) {
    const element = document.getElementById(id)
    if (element.classList.contains("child-info-input")) {
        childInputs[id] = element.value;
    } else if (element.classList.contains("lab-input")) {
        labInputs[id] = element.value;
    } else {
        console.log("Couldn't save info")
    }
}

function readyForChildGraph() {
    return (Object.keys(childInputs).length === 5)
}