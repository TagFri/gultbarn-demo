import {validatedLabInputs, validatedChildInputs} from "./inputHandling.js";
export {initiateGraph, updateGraph}
import Chart from 'chart.js/auto';

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
        type: 'line',
        data: {
            //Dates (0 = birthdate, each consequently +1day until 10(14?) days of age)
            labels: [0,1,2,3,4,5,6,7,8,9,10],
            //One dataset = one line
            datasets: [
                {//DATASET 1 -> CHILD LIGHT LIMIT
                    label: "Lysgrense",
                    data: [-10],
                    spanGaps: true,
                    borderColor: black, //Yellow colour
                    pointRadius: 0,
                },
                {//DATASET 2 -> LAB VALUES
                    label: "Laboratorieverdier",
                    data: [-10],
                    spanGaps: true,
                    borderColor: yellowStrong,
                    pointRadius: 5
                }
            ],
        },

        options: {
            //Turn on/off animation on initilizing
            animation: true,
            grid: {
                display: false
            },
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
                    enabled: false
                }
            },
            scales: {
                x: {
                    time: {
                        unit: 'day'
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

function updateGraph() {
    //Check if child graph needs an update
    let newLightLimitInfo = createLightLimit()
    let newLightlimitLabel = newLightLimitInfo[0]
    let newLightLimit = newLightLimitInfo.splice(1)
    if (currentLightLimit === null || newLightLimit !== currentLightLimit) {
        currentLightLimit = newLightLimit
        myChart.data.datasets[1].label = newLightlimitLabel
        myChart.data.datasets[1].data = currentLightLimit
        myChart.data.datasets[1].spanGaps = true
        myChart.update()
    } else {
        console.log("no change in child graph")
    }
    //todo -> update lab-graph
}

function createLightLimit() {
    //Get gestaionWeek and BirthWeight
    let gestationWeek = validatedChildInputs["gestation-week"]
    let birthWeight = validatedChildInputs["birth-weight"]

    //Y-values for light-limits
    let lightValues =
        // Birthweight < 1000:
        (birthWeight < 1000)?["Under 1000g", "Nan",100,"Nan","Nan",150,"Nan","Nan","Nan","Nan","Nan",150]
            // Birthweight <1500
            : (birthWeight < 1500)?["Under 1500", "Nan",125,"Nan","Nan",200,"Nan","Nan","Nan","Nan","Nan",200]
                // Birthweight <2500
                : (birthWeight < 2500)?["Under 2500", "Nan",150,"Nan","Nan",250,"Nan","Nan","Nan","Nan","Nan",250]
                    // Birthweight >2500 + GA <37
                    : (gestationWeek < 37)?["Over 2500g + GA <37", "Nan",150,"Nan",300,"Nan","Nan","Nan","Nan","Nan","Nan",300]
                        // Birthweight >2500 + GA >=37
                        : ["Over 2500g + GA >=37", "Nan",175,"Nan",350,"Nan","Nan","Nan","Nan","Nan","Nan",350]
    return (lightValues)
}


// CREATION OF TIME_DATE X_AXIS FROM BIRTHWEIGHT
//function createXaxis() {
//    //ESTABLISH X-AXIS FROM BIRTH DATETIME
//    //Get date and time for child
//    let childTime = validatedChildInputs["birth-time"]
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