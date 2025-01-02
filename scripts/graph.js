import {labTaken, validatedChildInputs} from "./inputHandling.js";
export {initiateGraph, updateChildGraph, updateLabGraph}

const yellowStrong =    'rgb(245, 162, 1)'
const yellowMedium =    'rgb(251, 193, 105)'
const yellowLight =     'rgb(255, 226, 177)'
const yellowLighter =   'rgb(255, 250, 242)'
const black =           'rgb(11, 30, 51)'
const grey =            'rgb(195, 199, 203)'
const red =             'rgb(251, 65, 65)'

let currentLightLimit = null
let currentLabGraph = null
let myChart = null
function initiateGraph() {
    const ctx = document.getElementById('graph');
    ctx.innerHTML = "";
    myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            //Dates (0 = birthdate, each consequently +1day until 10(14?) days of age)
            //One dataset = one line
            datasets: [
                {//DATASET 1 -> CHILD LIGHT LIMIT
                    label: "Lysgrense",
                    data: [],
                    spanGaps: true,
                    borderColor: black, //Yellow colour
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                },
                {//DATASET 2 -> LAB VALUES
                    label: "Labratorieverdier",
                    data: [],
                    spanGaps: true,
                    borderColor: yellowStrong,
                    pointRadius: 5,
                    showLine: true,
                    fill: false,
                }
            ],
        },

        options: {
            parsing: {
                xAxisKey: 'x',
                yAxisKey: 'y'
            },
            //Turn on/off animation on initilizing
            animation: true,
            plugins: {
                legend: {
                    //Turn on/off top-description for each graph
                    display: true,
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 10,
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    //Turn on/off hover box on each datapoint
                    enabled: true
                }
            },
            scales: {
                x: {
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                        stepSize: 1,
                    }
                },
                y: {
                    //Starter Y-akse på 0
                    beginAtZero: true,
                    min: 0,
                    suggestedMax: 200,
                    //Markering hvert 50 på y-akse
                    ticks: {
                        stepSize: 50
                    }
                }
            }
        },
    });
}

function updateChildGraph() {
    //Check if child graph needs an update
    let newLightLimitInfo = createLightLimit()
    let newLightlimitLabel = newLightLimitInfo[0]
    let newLightLimit = newLightLimitInfo[1]
    console.log(newLightLimit)
    if (currentLightLimit === null || newLightLimit !== currentLightLimit) {
        currentLightLimit = newLightLimit
        myChart.data.datasets[0].label = newLightlimitLabel
        myChart.data.datasets[0].data = newLightLimit
        myChart.data.datasets[0].spanGaps = true
        myChart.data.datasets[0].tension = 0
        console.log("Oppdater barnegraf")
        myChart.update()
    } else {
        console.log("no change in child graph")
    }
}

function updateLabGraph() {
    let day0 = new Date()
    day0.setHours(validatedChildInputs["birthtime-time"][0])
    day0.setMinutes(validatedChildInputs["birthtime-time"][1])
    day0.setDate(validatedChildInputs["birthtime-date"][0])
    day0.setMonth(validatedChildInputs["birthtime-date"][1] - 1)
    let data = {}
    for (const [time, labValue] of Object.entries(labTaken)) {
        //Time difference from lab taken and birth in days
        let labTime = new Date(time)
        let timeDifference = (labTime.getTime() - day0.getTime()) / (1000 * 60 * 60 * 24)
        console.log("Labtime:" + labTime + " = " + labTime.getTime())
        console.log("Day0" + day0 + " = " + day0.getTime())
        console.log(timeDifference)
        data[timeDifference] = labValue
        if (currentLabGraph === null || data !== currentLabGraph) {
            currentLabGraph = data
            myChart.data.datasets[1].label = "Bilirubinverdier"
            myChart.data.datasets[1].data = currentLabGraph
            myChart.data.datasets[1].spanGaps = true
            myChart.data.datasets[1].tension = 0
            myChart.update()
        } else {
            console.log("no change in lab graph")
        }
    }
}

function createLightLimit() {
    //Get gestaionWeek and BirthWeight
    let gestationWeek = validatedChildInputs["gestation-week"]
    let birthWeight = validatedChildInputs["birth-weight"]

    //Y-values for light-limits
    let lightValues =
        // Birthweight < 1000:
        (birthWeight < 1000)?["Under 1000g", {1:100,4:150,10:150}]
            // Birthweight <1500

            : (birthWeight < 1500)?["Under 1500g", {1:125,4:200,10:200}]
                // Birthweight <2500
                : (birthWeight < 2500)?["Under 2500",{1:150,4:250,10:250}]
                    // Birthweight >2500 + GA <37
                    : (gestationWeek < 37)?["Over 2500g + GA <37",{1:150,4:300,10:300}]
                        // Birthweight >2500 + GA >=37
                        : ["Over 2500g + GA >=37",{1:175,4:350,10:350}]
    return (lightValues)
}


// CREATION OF TIME_DATE X_AXIS FROM BIRTHWEIGHT
//function createXaxis() {
//    //ESTABLISH X-AXIS FROM BIRTH DATETIME
//    //Get date and time for child
//    let childTime = validatedChildInputs
//    let childDate = validatedChildInputs["birth-date"]
//    //Create DATE-TIME VARIABLE
//    let time0 = new Date(); // Original birthdate
//    console.log("time: " + childTime);
//    console.log("date: " + childDate);
//    time0.setMinutes(childTime[1]);
//    time0.setHours(childTime[0]);
//    time0.setDate(childDate[0]);
//    time0.setMonth(childDate[1]-1);
//    time0.setFullYear(2024);
//    //CREATE 10 days values
//    let daysX = [time0] //Birthdate until 10 days post-partum
//    for (let i = 1; i < 11; i++) {
//        let nextDay = new Date(time0); // Create a new date object based on time0
//        nextDay.setDate(time0.getDate() + i); // Add i days to the original date
//        daysX.push(nextDay); // Push the new datetime to the array
//    }
//    return daysX // Array
//}



//    //BIRTHDATE AS START X-COORDINATE
//     let time0 = new Date();
//     time0.setMinutes(childGraphedValues["birthtime-time"][1]);
//     time0.setHours(childGraphedValues["birthtime-time"][0]);
//     time0.setDate(childGraphedValues["birthtime-date"][0]);
//     time0.setMonth(childGraphedValues["birthtime-date"][1]);
//     time0.setFullYear(2024);
//     //X-COORDINATES FROM BIRTHDAY (10 days)
//     let dayX = []
//     for (let i = 0; i < 10; i++) {
//         dayX.push(time0.setDate(time0.getDate() + i))
//     }


///TRANSFUSJON
//   {//DATASET 0 -> TRANSFUSJON LIMIT
//       label: "Transfusjonsgrense",
//           data: [200,"Nan","Nan",400,"Nan","Nan","Nan","Nan","Nan","Nan",400],
//       spanGaps: true,
//       borderColor: 'rgb(0, 0, 0)', //Black colour
//       pointRadius: 0
//   },