export { displayBilirubin}

import { currentChild } from "./Child.js"
import { Bilirubin, removeBilirubin } from "./Bilirubin.js"
import { daysToAbsoluteDate, leadingZero } from "./generalFunctions.js"

function displayBilirubin() {
    //REMOVE OLD LABS
    const bilirubinList = document.getElementById("bilirubin-list")
    bilirubinList.innerHTML = ""

    //SORT ALL LABS CHORNOLOGICALLY

    //READD ALL LABS
    for (const bilirubin of Bilirubin.allBilirubins) {

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
        let date = new Date(daysToAbsoluteDate(currentChild.birthDateTime, bilirubin.relativeDays))

        // CREATE DATE AND TIME ELEMENT
        const bilirubinDateElement = document.createElement('p')
        const bilirubinTimeElement = document.createElement('p')

        //MAKE VALUES FOR DATE AND TIME
        const month = leadingZero(date.getMonth() + 1)
        const day = leadingZero(date.getDate())
        const hour = leadingZero(date.getHours())
        const minute = leadingZero(date.getMinutes())

        //ADD VALUES TO HTML ELEMENTS
        bilirubinDateElement.innerHTML = `${day}/${month}`
        bilirubinTimeElement.innerHTML = `${hour}:${minute}`

        //Append elements to each other
        button.appendChild(image)
        li.appendChild(button)
        li.appendChild(bilirubinValueElement)
        li.appendChild(bilirubinDateElement)
        li.appendChild(bilirubinTimeElement)
        bilirubinList.appendChild(li)

    }

    //Turn off opacity of advice and journal container
    document.getElementById("advice-container").classList.remove("opacity-container")
    document.getElementById("journal-container").classList.remove("opacity-container")
}