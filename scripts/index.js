//Import functions
import {masking} from './masking.js';
import {initiateGraph} from './graph.js';
import {child, saveChild} from './child.js';
import {Lab, saveLab} from './lab.js';
import {copyContent} from './journal.js';
//Export general functions
export {msToDay, relativeDate2absoluteDate, absolute2relativeDate, currentLightLimitFromLastLab}

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