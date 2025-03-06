export {validateInputs, errorMessages}
import { between } from "./generalFunctions.js";
import { currentChild } from "./Child.js";

//--RUNNING VALIDATION AND ERROR ON ALL INPUTS

function validateInputs(inputData) {
    //Start variables
    let errorCounter = 0
    let dateComponents = {}
    let validatedInputs = {}

    //** VALIDATION LIBRARY FOR DAYS IN RELATIONSHIP TO MONTH:
    const dateValidation = {
            0: 31, // January
            1: 29, // February (inc. leap years)
            2: 31, // March
            3: 30, // April
            4: 31, // May
            5: 30, //June
            6: 31, //July
            7: 31, //August
            8: 30, //September
            9: 31, //Oktober
            10: 30, //November
            11: 31, //Desember
    }

    //** LOOP THROUGH ALL VALUES
    for (const [key, value] of Object.entries(inputData)) {

        //MAKE LOCAL VARIABLES FOR READABILITY
        let inputValue = value
        let htmlID = key

        //* TRIM TO PURE INTEGER VALUES
        if (htmlID == "birthDate" || htmlID == "bilirubinDate") {
            //Converts dd/mm -> [dd:int,mm:int]
            inputValue = {
                date: parseInt(inputValue.substring(0, 2)),
                month: parseInt(inputValue.substring(3, 5))-1
            }

        } else if (htmlID == "birthTime" || htmlID == "bilirubinTime") {
            //Converts hh/mm -> [dd:int,mm:int]
            inputValue = {
                hour: parseInt(inputValue.substring(0, 2)),
                minute: parseInt(inputValue.substring(3, 5))
            }
        } else {
            //Converts 39u / 100 µmol/L to pure integers
            inputValue = parseInt(inputValue
                .replace("u", "") //For gestationWeek
                .replace(" µmol/L", "")) //For bilirubinValues
        }

        //**VALIDATION
        switch (htmlID) {
            case "bilirubinDate":
            case "birthDate": {
                //If month or date is not within librabry specifications
                if(between(inputValue.month, 0, 11) && between(inputValue.date, 1, dateValidation[inputValue.month])) {
                    console.log(`Validateing date: ${inputValue.date} between: 1 and ${dateValidation[inputValue.month]} }`)
                    dateComponents["month"] = inputValue.month
                    dateComponents["date"] = inputValue.date
                    errorMessages(htmlID, true)
                } else {
                    errorCounter += 1
                    errorMessages(htmlID, false)
                }
                break;
            }
            case "bilirubinTime":
            case "birthTime": {
                //If month or date is not within librabry specifications
                if (between(inputValue.hour, 0, 23) && between(inputValue.minute, 0, 59)) {
                    dateComponents["hour"] = inputValue.hour
                    dateComponents["minute"] = inputValue.minute
                    errorMessages(htmlID, true)
                } else {
                    errorCounter += 1
                    errorMessages(htmlID, false)
                }
                break;
            }
            case "gestationWeek": {
                if (between(inputValue, 22, 45)) {
                    validatedInputs["gestationWeek"] = inputValue,
                        errorMessages(htmlID, true)
                } else {
                    errorCounter += 1
                    errorMessages(htmlID, false)
                }
                break;
            }
            case "bilirubinValue": {
                if (between(inputValue, 0, 1000) ) {
                    validatedInputs["bilirubinValue"] = inputValue,
                    errorMessages(htmlID, true)
                } else {
                    errorCounter += 1
                    errorMessages(htmlID, false)
                }
                break;
            }
            case "birthWeight": {
                validatedInputs["birthWeight"] = inputValue
            }
        }
    }

    //If all inputs are validated
    if (errorCounter == 0) {

        //** If date is in the future, subtract one year
        const now = new Date();
        let year = now.getFullYear();
        //If date is in the future, subtract one year
        if (dateComponents.month > now.getMonth()) {
            year = now.getFullYear() - 1;
        } else if (dateComponents.month == now.getMonth()) {
            if (dateComponents.date > now.getDate()) {
                year = now.getFullYear() - 1;
            } else if (dateComponents.date == now.getDate()) {
                if (dateComponents.hour > now.getHours()) {
                    year = now.getFullYear() - 1;
                } else if (dateComponents.hour == now.getHours()) {
                    if (dateComponents.minute > now.getMinutes()) {
                        year = now.getFullYear() - 1;
                    } else if (dateComponents.minute == now.getMinutes()) {
                        year = now.getFullYear() - 1;
                    }
                }
            }
        }

        //Set child birthdate
        if (inputData.birthDate) {
            validatedInputs["dateTime"] = new Date(year, dateComponents.month, dateComponents.date, dateComponents.hour, dateComponents.minute);
            return validatedInputs
        }

        //Set bilirubin date
        else if (inputData.bilirubinDate) {
            console.log("BILIRUBIN DATE")
            let childDateTime = currentChild.birthDateTime;
            let childDateTimePlussThreeMonths
            if (childDateTime.getMonth() <= 8) {
                let tempDate = new Date(childDateTime)
                tempDate.setMonth(tempDate.getMonth() + 3)
                childDateTimePlussThreeMonths = tempDate
            } else {
                let tempDate = new Date(childDateTime)
                tempDate.setFullYear(tempDate.getFullYear() + 1)
                tempDate.setMonth(tempDate.getMonth() -11 +3)
                childDateTimePlussThreeMonths = tempDate
            }

            let bilirubinDateTime = new Date(year, dateComponents.month, dateComponents.date, dateComponents.hour, dateComponents.minute);
            if (bilirubinDateTime < childDateTime) {
                console.log("bilirubin date is before child birthdate")
                errorMessages("early-bilirubin", false)
                return false
            } else if (childDateTimePlussThreeMonths < bilirubinDateTime) {
                errorMessages("late-bilirubin", false)
                console.log("bilirubin date is more then 3 months after child birthdate")
                return false
            } else {
                errorMessages("early-bilirubin", true)
                errorMessages("late-bilirubin", true)
                validatedInputs["dateTime"] = bilirubinDateTime;
            }
        }
        return validatedInputs
    } else {
        return false
    }
    //Debugging:
    console.log("Finished validating");

}

function errorMessages(htmlID, show, timeout) {
        if (document.getElementById(htmlID + "-error")) {
            document.getElementById(htmlID + "-error").classList.add(show ? "hidden" : "error-message")
            document.getElementById(htmlID + "-error").classList.remove(show ? "error-message" : "hidden")
        } else {
            console.log("No error message for " + htmlID + " found")
        }

        if (timeout) {
            setTimeout(() => {
                document.getElementById(htmlID + "-error").classList.add("hidden")
            }, 7500)
        }

}