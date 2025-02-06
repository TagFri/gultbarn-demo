//Import functions
import {masking} from './masking.js';
import {initiateGraph, myChart, getTransfusionLimit} from './graph.js';
import {child, saveChild} from './child.js';
import {Lab, saveLab} from './lab.js';
import {copyContent} from './journal.js';
//Export general functions
export {msToDay, relativeDate2absoluteDate, absolute2relativeDate, currentLightLimitFromLastLab, printLabOverview, currentTransfusionLimitFromLastLab,absoluteDateToPrintFormat}

masking();
initiateGraph()

///* EVENT LISTENERES *////
//Save child input info
document.getElementById("add-child").addEventListener("click", saveChild)
//Save lab input info
document.getElementById("add-lab").addEventListener("click", saveLab)
//Copy journal note to clipboard + show confirmation
document.getElementById("journal-copy").addEventListener("click", function() {
        copyContent();
        document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
        document.getElementById("myTooltip").style.visibility = "visible";
        document.getElementById("myTooltip").style.opacity = 1;
        setTimeout(function(){
            document.getElementById("myTooltip").style.visibility = "hidden";
            document.getElementById("myTooltip").style.opacity = 0;
            document.getElementById("journal-container").style.animation = "";
        }, 750);
    }
)
//Change journal icon if mouseocer
document.getElementById("journal-copy").addEventListener("mouseover", function () {
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal_yellow.svg')"
    document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
    setTimeout(function() {
        document.getElementById("journal-container").style.animation = "";
    },400
    )
})
document.getElementById("journal-copy").addEventListener("mouseout", function () {
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal_grey.svg')"
    document.getElementById("journal-container").style.animation = "";
})

//Warning before leaving site
//window.onbeforeunload = function() {
//    return "All data vil bli slettet, vil du fortsatt fortsette?";
//};

//GENERAL FUNCTIONS
function msToDay(millisecounds) {
    return millisecounds / (1000 * 60 * 60 * 24)
}

function relativeDate2absoluteDate(realtiveDate) {
    let date = new Date(child.timeDate.getTime() + (realtiveDate * 24 * 60 * 60 * 1000));
    return date;
}

function absolute2relativeDate(absoluteDate) {
    let date = (new Date(absoluteDate.getTime()) - new Date(child.timeDate.getTime())) / (1000 * 60 * 60 * 24);
    return date;
}

function currentLightLimitFromLastLab() {
    //Get light limit assigned by child values
    let lightLimitRelative = child.getLightLimit().data
    let lightLimitAbsolute = JSON.stringify(lightLimitRelative)
    lightLimitAbsolute = JSON.parse(lightLimitAbsolute)
    let lightLimitSlope = child.getLightLimit().slope
    //Make current light limit in absolute dates
    for (const [key, value] of Object.entries(lightLimitAbsolute)) {
        let date = relativeDate2absoluteDate(key)
        lightLimitAbsolute[date] = value
        delete lightLimitAbsolute[key]
    }
    //Check if last lab is in slope or in the
    let lastLab = Lab.labs[Lab.labs.length - 1]
    let lightTimes = Object.keys(lightLimitAbsolute)
    //Convert
    lightTimes = lightTimes.map(d => new Date(d))

    if (lastLab.timeDate < lightTimes[1] && lastLab.timeDate >= new Date(child.timeDate.getTime() + 1000*60*60*24)) {
        let timeInSlope = (lastLab.timeDate - lightTimes[0])/(1000*60*60*24)
        //Start of light limit + time in slope * slope - bilirubin verdi
        return (child.getLightLimit().data[1] + (lightLimitSlope * timeInSlope) - lastLab.bilirubin)
    } else if ((lastLab.timeDate-child.timeDate) / (1000*60*60*24) >= (lightTimes[1]-child.timeDate) / (1000*60*60*24)) {
        if (lightLimitRelative.hasOwnProperty(3)) {
            return (lightLimitRelative[3] - lastLab.bilirubin);
        } else if (lightLimitRelative.hasOwnProperty(4)) {
            return (lightLimitRelative[4] - lastLab.bilirubin);
        } else {
            return null;
        }
    } else {
        console.log("LAST LAB IS NOT UNDER LIGHT LIMIT")
    }

}

function currentTransfusionLimitFromLastLab() {
    console.log("CURRENT TRANSFUSSION LIMIT CALLED")
    let lastLab = Lab.labs[Lab.labs.length - 1]
    let lastLabDate = absolute2relativeDate(lastLab.timeDate)
    // todo -> beregn antall knekk også avstand
    let transfusionLimit = getTransfusionLimit()
    console.log(transfusionLimit)
    let transfusionsKeys = []
    for (const coordinate of transfusionLimit) {
        console.log(coordinate)
        let transfusionKey = coordinate.x
        if (lastLabDate == transfusionKey) {
            console.log("DISTANCE TO TRANSFUSION GRAPH:")
            console.log(coordinate.y - lastLab.bilirubin)
            return (coordinate.y - lastLab.bilirubin)
        }
        transfusionsKeys.push(transfusionKey)
    }
    console.log(`Transfusionskeys: ${transfusionsKeys}`)
    let transfusionKeyUpstream = transfusionsKeys.find((day) => day > lastLabDate)
    let transfusionKeyDownstream = transfusionsKeys.filter((day) => day < lastLabDate)
    transfusionKeyDownstream = transfusionKeyDownstream[transfusionKeyDownstream.length - 1]
    let slopeCoordinates = []
    for (const coordinates of transfusionLimit) {
        if (transfusionKeyUpstream == coordinates.x) {
            slopeCoordinates.push(coordinates)
        } else if (transfusionKeyDownstream == coordinates.x) {
            slopeCoordinates.push(coordinates)
        }
    }
    console.log(slopeCoordinates)
    let slope = (slopeCoordinates[1].y - slopeCoordinates[0].y) / (slopeCoordinates[1].x - slopeCoordinates[0].x)
    let currentTransfusionLimit = slope * (lastLabDate - transfusionKeyDownstream) + slopeCoordinates[0].y
    console.log("DISTANCE TO TRANSFUSION GRAPH:")
    console.log(currentTransfusionLimit - lastLab.bilirubin)
    return (currentTransfusionLimit - lastLab.bilirubin)
}

function printLabOverview() {
    let labOverview = "";
    for (const lab of Lab.labs) {
        let { time, date, bilirubin } = lab;
        let [hour, minute] = time;
        let [dateDay, dateMonth] = date;
        dateDay = dateDay.toString().padStart(2, "0");
        dateMonth = dateMonth.toString().padStart(2, "0");
        hour = hour.toString().padStart(2, "0");
        minute = minute.toString().padStart(2, "0");

        labOverview += `${dateDay}/${dateMonth} kl. ${hour}:${minute}: ${bilirubin} µmol/L\n`;
    }
    return labOverview
}

function absoluteDateToPrintFormat(date) {
    let minutes = date.getMinutes().toString().padStart(2, "0")
    let hours = date.getHours().toString().padStart(2, "0")
    let dato = date.getDate().toString().padStart(2, "0")
    let month = (date.getMonth()+1).toString().padStart(2, "0")
    console.log(`Måned: ${month} og dateMonth: ${date.getMonth()}`)
    return `${dato}/${month} kl. ${hours}:${minutes}`
}