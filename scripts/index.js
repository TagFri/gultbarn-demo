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

///* STATISTICS *///
let apiURL = "https://i70hzn59ha.execute-api.us-east-1.amazonaws.com/startUp/gultBarnStatistics"
let apiKey = "egFZwylnMe1Sk5PBAr31Y724ppi5NMJ6aJ3vl6g9"
//todo change to enviormental variable

async function updateCount(clickID) {
    try {
        let response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //Sends the api key
                "x-api-key": apiKey
            },
            body: JSON.stringify({buttonID: clickID})
        });
        let result = await response.json();

        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

// Attach event listeners to buttons instead of using onclick in HTML
document.getElementById("save-child").addEventListener("click", () => updateCount("addedChild"));
document.getElementById("add-bilirubin").addEventListener("click", () => updateCount("addedBilirubin"));
document.getElementById("journal-copy").addEventListener("click", () => updateCount("copiedJournals"));
document.getElementById("feedback-button").addEventListener("click", () => updateCount("feedbackGiven"));


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