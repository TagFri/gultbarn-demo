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

/* Custom masking */
inputMasking()

// Get the single instance (creates it if it doesn’t exist)
const graph = GraphContainer.getInstance();

/* Dark mode on init */
const startTime = new Date();
if (startTime.getHours() >= 22 || startTime.getHours() < 7) {

    document.getElementById("darkMode").innerText = "Nattevaktsmodus";

    //Set theme for page
    document.body.setAttribute('data-theme', 'dark');

    //Change icon src
    updateIcons('dark')

    //Set graph colours
    GraphContainer.getInstance().black = 'rgb(255, 255, 255)';
    GraphContainer.getInstance().red = 'rgb(251, 65, 65)';

    //Set jounal picture
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-grey-dark.svg')"

    document.querySelector(".toggle-thumb").classList.add("dark-mode")
    document.querySelector(".toggle-thumb-icon").classList.add("dark-mode")
    document.querySelector(".toggle-wrapper").classList.add("dark-mode")

}

// Initialize the graph container (creates a new Chart instance)
graph.initiateGraph();


///* DARK MODE  *///

// Listen for changes in the dark mode setting
document.querySelector('.toggle-wrapper').addEventListener('click', function(event) {
    const currentTheme = document.body.getAttribute('data-theme');

    if (currentTheme === 'light') {
        document.getElementById("darkMode").innerText = "Nattevaktsmodus";
        document.querySelector(".toggle-thumb").classList.add("dark-mode")
        document.querySelector(".toggle-thumb-icon").classList.add("dark-mode")
        document.querySelector(".toggle-wrapper").classList.add("dark-mode")
    } else {
        document.getElementById("darkMode").innerText = "Dagvaktsmodus";
        document.querySelector(".toggle-thumb").classList.remove("dark-mode")
        document.querySelector(".toggle-thumb-icon").classList.remove("dark-mode")
        document.querySelector(".toggle-wrapper").classList.remove("dark-mode")
    }


    toggleDarkMode();
});

//Change between dark and light mode
function toggleDarkMode() {
    // Get current theme from body attribute
    const currentTheme = document.body.getAttribute('data-theme');

    // Determine the new theme
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';


    // Update the body's data attribute
    document.body.setAttribute('data-theme', newTheme);

    //Update all icons to new icons
    updateIcons(newTheme)

    //Update graph colours
    if (newTheme === 'dark') {
        GraphContainer.getInstance().myChart.data.datasets[0].borderColor = 'rgb(216, 215, 214)';
        GraphContainer.getInstance().myChart.data.datasets[3].borderColor = 'rgb(153, 27, 30)';
    } else if (newTheme === 'light') {
        GraphContainer.getInstance().myChart.data.datasets[0].borderColor = 'rgb(11, 30, 51)'
        GraphContainer.getInstance().myChart.data.datasets[3].borderColor = 'rgb(255, 232, 233)';
    }

    GraphContainer.getInstance().myChart.update()

    //Update jounal picture
    if (newTheme === 'dark') {
        document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-grey-dark.svg')"
    } else {document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-grey.svg')"}


};

//Updates icons to dark mode / light mode
function updateIcons(newTheme) {
    document.querySelectorAll('.icon').forEach(icon => {
        (newTheme === 'dark')?icon.src= icon.getAttribute('data-dark'):icon.src= icon.getAttribute('data-light');
    });

    let oldAdviceBackground = document.getElementById("advice-container").style.backgroundImage
    let newAdviceBackground
    if (newTheme === 'dark') {
        newAdviceBackground = oldAdviceBackground.replace(".svg", "-dark.svg")
    } else if (newTheme === 'light') {
        newAdviceBackground = oldAdviceBackground.replace("-dark.svg", ".svg")
    }

    document.getElementById("advice-container").style.backgroundImage = newAdviceBackground
}

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
    let iconMode = document.body.getAttribute('data-theme') == "dark"?"-dark":""

    console.log(iconMode)

    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-yellow" + iconMode + ".svg')"
    document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
    setTimeout(function() {
            document.getElementById("journal-container").style.animation = "";
        },400
    )
})

document.getElementById("journal-copy").addEventListener("mouseleave", function () {
    let iconMode = document.body.getAttribute('data-theme') == "dark"?"-dark":""
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal-grey" + iconMode + ".svg')"
    document.getElementById("journal-container").style.animation = "";
})

//** Flag dynamics
//Mouseenter/leave -> Fill / unfill
document.getElementById("feedback-button").addEventListener("mouseenter", function () {
    let iconMode = document.body.getAttribute('data-theme') == "dark"?"-dark":""
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
        console.log("Finished child")
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

//Update dependent functions

function updateCascade(type) {

    //If child is changed:
    if (type == "child") {
        //SHOW COMPLETE ICON + REMOVE BILIRUBIN OPACITY
        Child.getInstance().completeChild()

        //UPDATE LIGHT-LIMIT GRAPH TRANSFUSION GRAPH AND TITLE
        document.getElementById("graph-label").innerHTML = "Lysgrense <span id=\"graph-fil\">for barn</span> " + Child.getInstance().childGraphInfo("title")
        GraphContainer.updateLightLimitGraph()
        GraphContainer.updateTransfusionGraph()
    }
    //If child or bilirubin is changed
    if ( ( type == "child" && Bilirubin.numberOfBilirubins > 0 ) || type =="bilirubin") {
        //Uppdate bilirubin graph
        GraphContainer.updateBilirubinGraph()

        //Update distance to graphs
        Bilirubin.setDistanceToGraphs()

        //Update extrapolation graph
        GraphContainer.updateExtrapolationGraph()

        //Update transfusion graph
        if (Bilirubin.distanceToLightGraph <= 0 || Bilirubin.distanceToTransfusionGraph <= 50) {
            GraphContainer.toggleTransfusionGraph(true)
        }

        //Display correct bilirubin values
        Bilirubin.displayBilirubin()

        //Adjust axis:
        GraphContainer.updateAxises()

        //New advices:
        Advice.setCurrentAdvice(Child.getInstance())
        Advice.displayAdvice(Child.getInstance())
    }

    GraphContainer.getInstance().myChart.update();
}