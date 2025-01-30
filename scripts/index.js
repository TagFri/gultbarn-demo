//Import functions
import {masking} from './masking.js';
import {initiateGraph} from './graph.js';
import {child, saveChild} from './child.js';
import {saveLab} from './lab.js';
import {copyContent} from './journal.js';
//Export general functions
export {msToDay, relativeDate2absoluteDate, absolute2relativeDate}

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