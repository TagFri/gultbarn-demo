export { displayBilirubin, removeBilirubin}

import { Bilirubin } from "./bilirubin.js"
import { daysRelativeToReferenceDate } from "./dateFunctions.js"
import { currentChild, currentBilirubins } from "./index.js";

function displayBilirubin() {
    console.log("DISPLAY BILIRUBIN STARTED")
    //REMOVE OLD LABS
    const bilirubinList = document.getElementById("bilirubin-list")
    bilirubinList.innerHTML = ""

    console.log(currentBilirubins)
    //READD ALL LABS
    for (const bilirubin of currentBilirubins) {
        console.log("LOOPING BILIRUBINS")
        console.log(bilirubin);

        ////Create each bilirubin as LI with ID of relative days
        const li = document.createElement("li")
        li.id = bilirubin.relativeDays
        li.classList.add("individual-bilirubin")

        //Create remove button with class remove-bilirubin. Listen on click event
        const button = document.createElement("button")
        button.classList.add("remove-bilirubin")
        button.addEventListener("click", function (event) {
            removeBilirubin(event.target)
        })
        const image = document.createElement("img")
        image.src = "./assets/icons/remove.svg"
        image.classList.add("individual-bilirubin-remove")
        image.alt = "delete-icon"

        //Bilirubin value
        const bilirubinValueElement = document.createElement('p')
        bilirubinValueElement.classList.add("semi-bold")
        bilirubinValueElement.innerHTML = bilirubin.bilirubinValue

        // Bilirubin date and time
        //Convert relative bilirubin date to absolute date
        let date = new Date(daysRelativeToReferenceDate(bilirubin.relativeDays, currentChild.birthDateTime))

        // Show date as dd/mm
        const bilirubinDateElement = document.createElement('p').innerHTML = date.toLocaleDateString("no-NO", {
            day: "numeric",
            month: "numeric",
        })

        //Show time as local date with 2 + 2 digits and 24h
        const bilirubinTimeElement = document.createElement('p').innerHTML = date.toLocaleTimeString("no-NO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })


        //Append elements to each other
        button.appendChild(image)
        li.appendChild(button)
        li.appendChild(bilirubinValueElement)
        li.appendChild(bilirubinDateElement)
        li.appendChild(bilirubinTimeElement)
        bilirubinList.appendChild(li)
        console.log(bilirubinList)
    }
}

function removeBilirubin(targetButton) {
    Bilirubin.numberOflabs --;

    //Remove from Bilirubins array
    for (let i = 0; i < Bilirubin.allBilirubins.length; i++) {

        //Find element on page with same relative day
        if (Bilirubin.allBilirubins[i].relativeDays == targetButton.parentElement.parentElement.id) {

            //Remove from bilirubin class
            Bilirubin.allBilirubins.splice(i, 1)
            errorMessage("bilirubin-list", false)
            displayBilirubins()
        } else {
            errorMessage("bilirubin-list", true)
        }
    }
    if (Bilirubin.getNumberOfBilirubins() == 0) {
        document.getElementById("advice-container").classList.add("opacity-container")
        document.getElementById("journal-container").classList.add("opacity-container")
    }
}