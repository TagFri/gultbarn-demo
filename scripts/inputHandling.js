export {eventListeners, labTaken, validatedChildInputs}
import {updateChildGraph, updateLabGraph} from "./graph.js"

let validatedChildInputs = {}
let validatedLabInputs = {}
let labTaken = []

//Initial event listeners
function eventListeners() {
    //Listen on keyup
    document.getElementById("main").addEventListener("keyup", function(event) {
        inputHandling(event.target.id, event.target.value)
    })
    document.getElementById("birth-weight").addEventListener("blur", function(event) {
        console.log("onblur")
        let error = document.getElementById(event.target.id + "-error")
        if (event.target.classList.contains("valid-input")) {
            error.classList.add("no-error-message")
            error.classList.remove("error-message")
        } else {
        error.classList.add("error-message")
        error.classList.remove("no-error-message")
    }
    })
    document.getElementById("add-lab").addEventListener("click",function() {
        addLab()
    })
}

//VALID INPUTS -> SAVE VALIDATED INPUT FROM ARRAY+ ADD CSS CLASS
function validInputClass(id, integer){
    let element = document.getElementById(id)
    element.classList.add("class", "valid-input");
    element.classList.remove("class", "invalid-input");
    console.log(id, integer)
    if (element.classList.contains("child-info-input")) {
        validatedChildInputs[id] = integer;
    } else if (element.classList.contains("lab-input")) {
        validatedLabInputs[id] = integer;
    } else {
    }
}
//INVALID INPUTS -> DELETE VALIDATED INPUT FROM ARRAY +  CSS CLASS
function invalidInputClass(id) {
    let element = document.getElementById(id)
    element.classList.add("class", "invalid-input");
    element.classList.remove("class", "valid-input");
    (element.classList.contains("child-info-input"))?delete validatedChildInputs[id]:delete validatedLabInputs[id];
}

//CONVERT INPUT TO INTEGERS
function inputToIntegers(unformattedValue) {
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
    // Validate value
}

//VALIDATE INPUTS
function handleInput(id, integer) {
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
            ?validInputClass(id, integer):invalidInputClass(id);
    }
    //Validates all other inputs (gram/weeks/days/mikromol)
    else {
        (integer != null
            && integer >= validationCriteria[id][0]
            && integer <= validationCriteria[id][1]
        )?validInputClass(id, integer):invalidInputClass(id);
    }
    //CHECK IF ALL INPUTS FOR CHILD IS VALID
    validateChildValues()
}

// ON EVENT LISTEN KEY-UP FOR CHILD INFO:
function inputHandling(id, unformattedValue) {
    //CONVERT RAW INPUT TO INTEGERS -> VALIDATE INPUT
    handleInput(id, inputToIntegers(unformattedValue))
}

//IF ALL CHILD INPUTS ARE VALID: UPDATE GRAPHS
function validateChildValues() {
    if (Object.keys(validatedChildInputs).length === 5) {
        updateChildGraph()
    }else {
        console.log("not all child inputs validated")
    }}

//IF ALL LAB INPUTS ARE VALID: HANDLE LAB INPUT
function addLab() {
    //Check if all necessary inputs are validated
    if (Object.keys(validatedLabInputs).length === 3) {
        //Create a timedate for when the lab was taken
        let labDateTime = new Date()
        labDateTime.setMinutes(validatedLabInputs["lab-time"][1])
        labDateTime.setHours(validatedLabInputs["lab-time"][0])
        labDateTime.setDate(validatedLabInputs["lab-date"][0])
        labDateTime.setMonth(validatedLabInputs["lab-date"][1]-1)
        labDateTime.setFullYear(2025)

        //Append the lab with the key at lab taken
        labTaken[labDateTime] = validatedLabInputs["bilirubin-value"]


// Sort labTaken by labDateTime
        let sortedLabTaken = Object.fromEntries(
            Object.entries(labTaken).sort(([timeA], [timeB]) => new Date(timeA) - new Date(timeB))
        );

// Reassign sorted labTaken
        labTaken = sortedLabTaken;

        //Update graph and lablist
        updateLabGraph()
        updateLabList()

        function updateLabList() {
            let ul = document.getElementById("lab-list");
            ul.innerHTML = "";

            for (const [time, labValue] of Object.entries(labTaken)) {
                let labDate = new Date(time);

                // Create list item
                let li = document.createElement("li");
                li.classList.add("lab-list-item");

                // Create remove button
                let button = document.createElement("button");
                button.classList.add("remove-lab");
                button.id = time
                button.addEventListener("click", function () {removeLab(Event.parentElement)});
                let image = document.createElement("img");
                image.classList.add("individual-lab-remove");
                image.src = "./assets/icons/fjern.svg";
                image.alt = "delete-icon";
                button.appendChild(image);

                // Create lab value element
                let labValueElement = document.createElement("p");
                labValueElement.innerText = labValue;

                // Create date element
                let labDateElement = document.createElement("p");
                labDateElement.innerText = labDate.getDate().toString().padStart(2, "0") + "/" + (labDate.getMonth() + 1).toString().padStart(2, "0");

                // Create time element
                let labTimeElement = document.createElement("p");
                labTimeElement.innerText = labDate.getHours().toString().padStart(2, "0") + ":" + labDate.getMinutes().toString().padStart(2, "0");

                // Append all elements to the list item
                li.appendChild(button);
                li.appendChild(labValueElement);
                li.appendChild(labDateElement);
                li.appendChild(labTimeElement);

                // Append list item to the list
                ul.appendChild(li);
            }
        }



//        //Add lab to HTML
//        let ul = document.getElementById("lab-list")
//        ul.innerHTML = ""
//        let index = 0
//        for (const [time, labValue] of Object.entries(labTaken)) {
//            let labDateString = new Date(time)
//            //Lab item
//            let li = document.createElement("li")
//            li.classList.add("individual-lab")
//            //Remove button
//            let button = document.createElement("button")
//            button.classList.add("remove-lab")
//            //Remove button image
//            let image = document.createElement("img")
//            image.src = "./assets/icons/fjern.svg"
//            image.classList.add("individual-lab-remove")
//            image.alt = "delete-icon"
//            button.appendChild(image)
//            let labValueElement = document.createElement('p')
//            labValueElement.classList.add("individual-lab-value")
//            labValueElement.id = "lab-value-" + index
//            labValueElement.innerText("test")
//            let labDateElement = document.createElement('p')
//            labDateElement.innerText(labDateString.getDate() + "/" + (labDateString.getMonth() + 1))
//            let labTimeElement = document.createElement('p')
//            labTimeElement.innerText(labDateString.getHours() + ":" + labDateString.getMinutes())
//            li.appendChild(button)
//            li.appendChild(labValue)
//            li.appendChild(labDate)
//            li.appendChild(labTime)
//            ul.appendChild(li)
//        }
        //Reset input
        document.getElementById("bilirubin-value").value = ""
        document.getElementById("lab-date").value = ""
        document.getElementById("lab-time").value = ""


    } else {
        console.log("not all inputs validated")
        document.getElementById("Lab-add-error").innerText = "Feil i verdiene."
    }
}

function removeLab () {

}