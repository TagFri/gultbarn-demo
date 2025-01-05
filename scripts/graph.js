import {labTaken, lastLabs, validatedChildInputs} from "./inputHandler.js";
export {initiateGraph, updateChildGraph, updateLabGraph}

const yellowStrong =    'rgb(245, 162, 1)'
const yellowMedium =    'rgb(251, 193, 105)'
const yellowLight =     'rgb(255, 226, 177)'
const yellowLighter =   'rgb(255, 250, 242)'
const black =           'rgb(11, 30, 51)'
const grey =            'rgb(195, 199, 203)'
const red =             'rgb(251, 65, 65)'

let currentLightLimit = null
let currentLightSlope = null
let currentLabGraph = null
let extrapolation = null
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
                {//DATASET 0 -> CHILD LIGHT LIMIT
                    label: "Lysgrense",
                    data: [],
                    spanGaps: true,
                    borderColor: black, //Yellow colour
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                },
                {//DATASET 1 -> LAB VALUES
                    label: "Labratorieverdier",
                    data: [],
                    spanGaps: true,
                    borderColor: yellowStrong,
                    pointRadius: 5,
                    showLine: true,
                    fill: false,
                },
                {//DATASETT 2 -> EXTRAPOLATION OF LAB VALUES
                    label: "Beregnet fortsettelse",
                    data: [],
                    spanGaps: true,
                    borderDash: [5, 5],
                    borderColor: yellowStrong,
                    pointRadius: 0,
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
    if (currentLightLimit === null || newLightLimit !== currentLightLimit) {
        currentLightLimit = newLightLimit
        currentLightSlope = newLightLimitInfo[2]
        console.log("SLOPY")
        console.log(currentLightSlope)
        myChart.data.datasets[0].label = newLightlimitLabel
        myChart.data.datasets[0].data = newLightLimit
        myChart.data.datasets[0].spanGaps = true
        myChart.data.datasets[0].tension = 0
        myChart.update()
    } else {
        console.log("no change in child graph")
    }
    updateLabGraph()
}

function updateLabGraph() {
    //Get child birthdate as x-axis 0
    let day0 = new Date(validatedChildInputs["birth-time-date"])

    //Loop through all labs taken
    let data = {}
    for (const [timestamp, labinfo] of Object.entries(labTaken)) {
        //Time difference from lab taken and birth in days
        let labTime = new Date(timestamp)
        let timeDifference = (labTime.getTime() - day0.getTime()) / (1000 * 60 * 60 * 24)
        data[timeDifference] = labinfo[2] }

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

function createLightLimit() {
    //Get gestaionWeek and BirthWeight
    let gestationWeek = validatedChildInputs["gestation-week"]
    let birthWeight = validatedChildInputs["birth-weight"]

    //Y-values for light-limits
    let lightValues =
        // Birthweight < 1000:
        (birthWeight < 1000)?[      "Under 1000g",          {1:100,4:150,10:150}, [((150-100)/(4-1)),150]]
        // Birthweight <1500
        : (birthWeight < 1500)?[    "Under 1500g",          {1:125,4:200,10:200}, [((200-125)/(4-1)),200]]
        // Birthweight <2500
        : (birthWeight < 2500)?[    "Under 2500",           {1:150,4:250,10:250}, [((250-150)/(4-1)),250]]
        // Birthweight >2500 + GA <37
        : (gestationWeek < 37)?[    "Over 2500g + GA <37",  {1:150,3:300,10:300}, [((300-150)/(3-1)),300]]
        // Birthweight >2500 + GA >=37
        : [                         "Over 2500g + GA >=37", {1:175,3:350,10:350}, [((350-175)/(3-1)),350]]
    return (lightValues)
}

/*function extrapolationGraphing() {
    console.log("TEST")
    console.log(lastLabs)
    if (Object.keys(lastLabs).length >=2) {
        //Calculate X difference
        let x1 = new Date(lastLabs[0]).getTime()
        let x2 = new Date(lastLabs[1]).getTime()
        let diffX = (x2 - x1 ) / (1000 * 60 * 60 * 24)

        //Calculate Y difference (take datetime key from last labs, estract index 2 in labTaken array = Bilirubin value)
        let y1 = labTaken[lastLabs[0]][2]
        let y2 = labTaken[lastLabs[1]][2]
        let diffY = y2-y1

        //Calculate slope (Y per X)
        let slope = diffY / diffX

        //Test {1:100,4:150,10:150}]
        let day0 = new Date(validatedChildInputs["birth-time-date"])
        let xValue = (x2 - day0.getTime()) / (1000 * 60 * 60 * 24)
        extrapolation[xValue] = y2
        extrapolation[xValue+2] = slope *2
        myChart.data.datasets[2].data = extrapolation
        myChart.data.datasets[2].spanGaps = true
        myChart.data.datasets[2].tension = 0
        myChart.update()
    }
    else {
        console.log("Not enough datapoints for extrapolation")
    }
} */