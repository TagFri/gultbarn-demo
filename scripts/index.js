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

//* Dark mode

inputMasking()

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
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal_yellow.svg')"
    document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
    setTimeout(function() {
            document.getElementById("journal-container").style.animation = "";
        },400
    )
})
document.getElementById("journal-copy").addEventListener("mouseleave", function () {
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal_grey.svg')"
    document.getElementById("journal-container").style.animation = "";
})

//** Flag dynamics
//Mouseenter/leave -> Fill / unfill
document.getElementById("feedback-button").addEventListener("mouseenter", function () {
    document.getElementById("feedback-image").src = "./assets/icons/flag_filled.svg"
})
document.getElementById("feedback-button").addEventListener("mouseleave", function () {
    document.getElementById("feedback-image").src = "./assets/icons/flag.svg"
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

    }

    //UPDATING CURRENT CHILD TO NEW VALUES
    else {
        //Update current child
        Child.getInstance().updateChild(validatedInputs)
    }

    //UPDATE CASCADING DEPENDENCIES WHEN CHILD IS UPDATED
    if(Child.getInstance()) {

        //SHOW COMPLETE ICON + REMOVE BILIRUBIN OPACITY
        Child.getInstance().completeChild()

        //UPDATE LIGHT-LIMIT GRAPH TRANSFUSION GRAPH AND TITLE
        document.getElementById("graph-label").innerHTML = "Lysgrense for barn " + Child.getInstance().childGraphInfo("title")
        GraphContainer.updateLightLimitGraph()
        GraphContainer.updateExtrapolationGraph()
        GraphContainer.updateTransfusionGraph()

        //UPDATE BILIRUBIN GRAPH
        if (Bilirubin.allBilirubins.length > 0) {
            GraphContainer.updateBilirubinGraph()
        }

        //Update axis
        GraphContainer.updateAxises()

        //Update advice
        Advice.setCurrentAdvice(Child.getInstance())
        Advice.displayAdvice(Child.getInstance())
    }
}

//** SAVE AND UPDATE BILIRUBINS
function saveBilirubin(validatedInputs) {
    //Convert absolute date to relative days
    let relativeDays = daysRelativeToReferenceDate(Child.getInstance().birthDateTime, validatedInputs.dateTime);

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

        //Remove error message
        errorMessages("bilirubinExists", false)

        //Display updated bilirubins
        Bilirubin.displayBilirubin()

        //Update bilirubin + extrapolation graph
        GraphContainer.updateBilirubinGraph()
        GraphContainer.updateExtrapolationGraph()

        //Update transfusion graph
        if (GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) <= 0) {
            GraphContainer.toggleTransfusionGraph(true)
            GraphContainer.getInstance().myChart.update();
        }

        //Extend graph if needed
        GraphContainer.updateAxises()

        //Update advice
        Advice.setCurrentAdvice(Child.getInstance())
        Advice.displayAdvice(Child.getInstance())

    }

    //Remove bilirubin inputs, and focuis back on date to add a new one
    document.getElementById("bilirubinDate").value = "";
    document.getElementById("bilirubinTime").value = "";
    document.getElementById("bilirubinValue").value = "";
    document.getElementById("bilirubinDate").focus()
}


//* Dark mode
//let darkMode = false;
//var now = new Date().getHours();
//if (now >= 20 || now <= 6) {
//    darkMode = true;//
//    document.body.classList.toggle('dark_mode');
//}