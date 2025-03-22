import { inputMasking                   } from "./inputMasking.js";
import { errorMessages, validateInputs  } from './inputValidation.js';
import { daysRelativeToReferenceDate    } from "./generalFunctions.js";
import { Child                          } from "./Child.js";
import { Bilirubin, SerumBilirubin      } from "./Bilirubin.js";
import { GraphContainer                 } from "./GraphContainer.js";
import { Advice                         } from "./Advice.js";
import { copyContent                    } from "./Journal.js";

//**
//** INIT PAGE
//**
inputMasking()

///* DARK MODE *///
//Updates icons
function updateIcons(newTheme) {
    console.log("test")
    document.querySelectorAll('.icon').forEach(icon => {
        (newTheme === 'dark')?icon.src= icon.getAttribute('data-dark'):icon.src= icon.getAttribute('data-light');
    });
}

// Listen for changes in the dark mode setting
let lastToggle = 0
const darkModeToggle = document.querySelector('.dark-theme-toggle');
darkModeToggle.addEventListener('click', function(event) {

    if (Date.now() - lastToggle > 40) {
        lastToggle = Date.now();

        // Get current theme from body attribute
        const currentTheme = document.body.getAttribute('data-theme');

        // Determine the new theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Update the body's data attribute
        document.body.setAttribute('data-theme', newTheme);

        updateIcons(newTheme)
    }
});

// Get the single instance (creates it if it doesn’t exist)
const graph = GraphContainer.getInstance();

// Initialize the graph container (creates a new Chart instance)
graph.initiateGraph();


//**
//** EVENT LISTENERES:
//**

//** SAVE BUTTONS
document.querySelectorAll(".save-btn").forEach(button => button.addEventListener("click", (event) => {
    validateAndSave(event)
}));

//** JOURNAL DYNAMICS
//Click -> Colur change
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
    })
//Mouseenter/leave -> jump and colour change
document.getElementById("journal-copy").addEventListener("mouseenter", function () {
    let iconMode = document.body.getAttribute('data-theme') == "-dark"?"dark":""
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-yellow"+iconMode+".svg')"
    document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
    setTimeout(function() {
            document.getElementById("journal-container").style.animation = "";
        },400
    )
})
document.getElementById("journal-copy").addEventListener("mouseleave", function () {
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-grey.svg')"
    document.getElementById("journal-container").style.animation = "";
})

//** Flag dynamics
//Mouseenter/leave -> Fill / unfill
document.getElementById("feedback-button").addEventListener("mouseenter", function () {
    let iconMode = document.body.getAttribute('data-theme') == "dark"?"-dark":""
    console.log(iconMode)
    document.getElementById("feedback-image").src = "./assets/icons/flag-filled" +iconMode+ ".svg"
})
document.getElementById("feedback-button").addEventListener("mouseleave", function () {
    let iconMode = document.body.getAttribute('data-theme') == "dark"?"-dark":""
    document.getElementById("feedback-image").src = "./assets/icons/flag" +iconMode+ ".svg"
})

//**
//** PAGE FUNCTIONS
//**

//* VALIDATE INPUT AND SAVE
function validateAndSave(event) {
    //Get container ID -> child-container || bilirubin-container
    const containerID = event.target.parentElement.parentElement.id
    const container = document.getElementById(containerID);

    //Get all inputs elements, including selct for birthweight
    let selectInpID = Array.from(container.querySelectorAll('select, input'));

    //Create a shallow object of all elements
    let unvalidatedInp = {}
    for (let i=0; i < selectInpID.length; i++) {
        unvalidatedInp[selectInpID[i].id] = selectInpID[i].value;
    }

    //Validate input
    let validatedInputs = validateInputs(unvalidatedInp)

    //If inputs are validated
    if(validatedInputs) {

        //Save inputs to bilirubin or child
        containerID == "child-container" ? saveChild(validatedInputs) : saveBilirubin(validatedInputs)
    }
}

//** SAVE AND UPDATE CHILD
function saveChild(validatedInputs) {

    //FIRST TIME CREATION
    if(!Child.getInstance()) {
        console.log("First saved child")
        new Child(validatedInputs);

        //CHANGE USER INTERFACE IF USER TRIES TO UPDATE CHILD AGAIN
        for (let input of document.querySelector("#child-container").querySelectorAll("input")) {
            input.addEventListener("keydown", () => {
                Child.getInstance().incompleteChild()
            })
        }
        document.querySelector("#birthWeight").addEventListener("change", () => {
            Child.getInstance().incompleteChild()
        })
        console.log("Finished saveing")
        console.log(Child.getInstance())
        updateCascade("child")

    }

    //UPDATING CURRENT CHILD TO NEW VALUES
    else {
        console.log("Secound saved child")
        //Update current child
        Child.getInstance().updateChild(validatedInputs)
        updateCascade("child")
    }
}

//** SAVE AND UPDATE BILIRUBINS
function saveBilirubin(validatedInputs) {
    console.log("BILIRUBIN SAVE FUNCTION STARTED")

    //Convert absolute date to relative days
    let relativeDays = daysRelativeToReferenceDate(Child.getInstance().birthDateTime, validatedInputs.dateTime);

    console.log(`Relative days: ${relativeDays}`)

    //Check if the bilirubin dateTime exists from before:
    let exists = false;
    for (const bilirubin of Bilirubin.allBilirubins) {
        if (bilirubin.relativeDays == relativeDays) {
            exists = true;

            //display error msg
            errorMessages("bilirubinExists", true)
            break
        }
    }

    //If lab doesnt exists
    if (!exists) {

        //Create new bilirubin object (Now only serum, transcutanous not implemented)
        new SerumBilirubin(validatedInputs.bilirubinValue, relativeDays);

        console.log("BILIRUBIN OBJECT CREATED")

        //Remove bilirubin inputs,
        document.getElementById("bilirubinDate").value = "";
        document.getElementById("bilirubinTime").value = "";
        document.getElementById("bilirubinValue").value = "";

        //Remove error message
        errorMessages("bilirubinExists", false)

        //Upadte all dependencies
        updateCascade("bilirubin")
    }

    // Focuis back on date to add a new one
    document.getElementById("bilirubinDate").focus()
}

function updateCascade(type) {
    if (type == "child") {
        //SHOW COMPLETE ICON + REMOVE BILIRUBIN OPACITY
        Child.getInstance().completeChild()

        //UPDATE LIGHT-LIMIT GRAPH TRANSFUSION GRAPH AND TITLE
        document.getElementById("graph-label").innerHTML = "Lysgrense for barn " + Child.getInstance().childGraphInfo("title")
        GraphContainer.updateLightLimitGraph()
        GraphContainer.updateTransfusionGraph()
    }

    if (type == "bilirubin") {

        //Uppdate bilirubin graph
        GraphContainer.updateBilirubinGraph()

        //Update distance to graphs
        Bilirubin.setDistanceToGraphs()

        //Update extrapolation graph
        GraphContainer.updateExtrapolationGraph()

        //Update transfusion graph
        console.log("updateTransfusionGraph called ->")
        if (Bilirubin.distanceToLightGraph <= 0) {
            GraphContainer.toggleTransfusionGraph(true)
        }
    }
    if ( ( type == "child" && Bilirubin.numberOfBilirubins > 0 ) || type =="bilirubin") {
        //Display correct bilirubin values
        Bilirubin.displayBilirubin()

        //Adjust axis:
        GraphContainer.updateAxises()

        //Update graph display
        GraphContainer.getInstance().myChart.update();

        //New advices:
        Advice.setCurrentAdvice(Child.getInstance())
        Advice.displayAdvice(Child.getInstance())
    }
}