export {setValidationListener, validate}

//--RUNNING VALIDATION AND ERROR ON ALL INPUTS

function setValidationListener() {
    //Get all inputs on page
    const inputs = document.querySelectorAll("input");

    //Event listen on all inputs (CHANGE)
    for (let input of inputs) {

        //Sends HTML ID of input field to validation function
        document.getElementById(input.id).addEventListener("change", (event) => {validate(input.id, input.dataset.validation)});
    }
}

//Validation of input
function validate(htmlID, validationType) {

    //Debugging:
    console.log("Started validating: " + htmlID + " with dataset: " + validationType)

    //Validation library -> accepted min-max values for each input
    const validationLibrary = {

        //All values with min/max except date which is according to month e.g. {1:31, 2:30...}
        birthWeight: {
            min: 500,
            max: 7500
        },
        date: {
            1: 31, // January
            2: 29, // February (inc. leap years)
            3: 31, // March
            4: 30, // April
            5: 31, // May
            6: 30, //June
            7: 31, //July
            8: 31, //August
            9: 30, //September
            10: 31, //Oktober
            11: 30, //November
            12: 31, //Desember
        },
        month: {
            min: 1,
            max: 12
        },
        hour: {
            min: 0,
            max: 23
        },
        minutes: {
            min: 0,
            max: 59
        },
        gestationWeek: {
            min: 22, // Before gestation week 22 is late abortion. No chance of surival
            max: 45  // After gestation week 45, the child would be relased mechanicaly
        },
        gestationDay: {
            min: 0,
            max: 6
        },
        bilirubinValue: {
            min: 0,
            max: 1000
        }
    }

    //Validate depending on input
    let inputValue = document.getElementById(htmlID).value();
    console.log(inputValue);
    switch (validationType) {
        case "birthWeight": {
            inputValue = parseInt(inputValue.replace("g", ""));
            //Check that birth weight is within validation
            if (inputValue >= validationLibrary.birthWeight.min && inputValue <= validationLibrary.birthWeight.max) {
                console.log("Valid input");
            } else {
                console.log("Invalid input");
            }
            break;
        }
        case "date": {

            break;
        }
        case "time": {

            break;
        }
        case "gestation": {

            break;
        }
        case "bilirubin-value": {

            break;
        }
        default: {
            console.log("No validation library for input: " + htmlID)
            break;
        }
    }

    //Check what type we are dealing with:
    const type = htmlID.includes("time") ? "time" : "date";

    //Decide on split character. Time = ":" Date = "/"
    const splitCharacter = type == "time" ? ":" : "/"

    //Split input from DD/MM or HH/MM to seperat variables
    const input = document.getElementById(htmlID).value.split(splitCharacter);

    //Debugging:
    console.log("Finished validating: " + inputId + ". Result: ");

}

//SAVE CHILD

// SAVE LAB


//LEGACY CODE
//export {validateInputGroup, timeDate, errorMessages, inputToInteger, inputValidation}
//
//function validateInputGroup(classSelector) {
//    let errorCounter = 0;
//    let inputs = document.querySelectorAll(classSelector)
//    let validatedInputs = []
//    //Loop through all inputs
//    for (const input of inputs) {
//        //Get value and ID
//        let inputID = input.id
//        let inputValue = inputToInteger(input.value);
//        //VALIDATION OF INPUT.
//        if (inputValidation(inputID, inputValue)) {
//            //Remove error message
//            errorMessages(inputID, true)
//            //Add validated input
//            validatedInputs.push(inputValue)
//        } else {
//            //Add error message + error counter
//            errorMessages(inputID, false)
//            errorCounter +=1;
//        }
//    }
//    return [validatedInputs, errorCounter]
//}
//
//
////CREATE TIMEDATE FROM LOCAL DATE + TIME
//function timeDate(date, time) {
//    //Create current time
//    const currentTime = new Date()
//    //Set actural time as current year + date info
//    let actualtime = new Date(currentTime.getFullYear(),date[1] - 1, date[0], time[0], time[1])
//    //If date info + current year is in the future, subtract one year from the year
//    if (actualtime > currentTime) {
//        actualtime = new Date(actualtime.setFullYear(actualtime.getFullYear() -1))
//    }
//    return actualtime
//
//
//}
//
////CONVERT INPUT TO INTEGERS
//function inputToInteger(input) {
//    //Format values: remove masking and split minutes/hours & months/days
//    let integerOutput = null
//    if (/[gud]/.test(input)) {
//        integerOutput = parseInt(input.substring(0, input.length - 1))
//    } else if ((/µmol\/L/).test(input)) {
//        integerOutput = parseInt(input.substring(0, input.length - 6))
//    } else if (/[:/]/.test(input)) {
//        let ddhh = parseInt(input.substring(0, 2)) // days or hours
//        let mmmm = parseInt(input.substring(3, 5)) // months or minutes
//        integerOutput = [ddhh, mmmm]
//    }
//    return (integerOutput)
//}
//
////VALIDATE INPUTS
//function inputValidation(htmlID, intValue) {
//    //If time/date, remove id before (eg. birth-time -> time)
//    let validationID = htmlID
//    if (validationID.includes("time") || validationID.includes("date")) {
//        validationID = validationID.substring(validationID.indexOf("-") + 1)
//    }
//    let validation = null
//    //Valid input ranges for each HTML ID
//    const validationCriteria = {
//        "birth-weight": [500, 7500],
//        "date": [[1, 31], [1, 12]],
//        "time": [[0, 23], [0, 59]],
//        "gestation-week": [22, 45],
//        "bilirubin-value": [0, 1000],
//    }
//    //Validate time/date input
//    let sorting = validationID.includes("time") ? "time" : "date";
//    if (validationID.includes("time") || validationID.includes("date")) {
//        (intValue != null
//            && intValue[0] >= validationCriteria[sorting][0][0]
//            && intValue[0] <= validationCriteria[sorting][0][1]
//            && intValue[1] >= validationCriteria[sorting][1][0]
//            && intValue[1] <= validationCriteria[sorting][1][1])
//            ? validation = true : validation = false;
//    }
//    //Validates all other inputs (gram/weeks/days/mikromol)
//    else {
//        (intValue != null
//            && intValue >= validationCriteria[validationID][0]
//            && intValue <= validationCriteria[validationID][1]
//        ) ? validation = true : validation = false;
//    }
//    return (validation)
//}
//
////ADD ERROR MESSAGE
//function errorMessages(id, valid) {
//    //Add class dependent on valid input or not (true/false)
//    let addCss = valid ? "no-error-message" : "error-message"
//    let removeCss = valid ? "error-message" : "no-error-message"
//    //Target element
//    let errorId = id + "-error"
//    document.getElementById(errorId).classList.add(addCss)
//    document.getElementById(errorId).classList.remove(removeCss)
//}