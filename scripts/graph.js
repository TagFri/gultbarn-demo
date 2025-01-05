import {labTaken, validatedChildInputs} from "./inputHandler.js";
export {initiateGraph, updateChildGraph, updateLabGraph, extrapolationGraphing, removeChildGraph}

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
let myChart = null
let xCrossing = null
let yCrossing = null

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
                    backgroundColor: black,
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                },
                {//DATASET 1 -> LAB VALUES
                    label: "Labratorieverdier",
                    data: [],
                    spanGaps: true,
                    borderColor: yellowStrong,
                    backgroundColor: yellowStrong,
                    pointRadius: 5,
                    showLine: true,
                    fill: false,
                },
                {//DATASETT 2 -> EXTRAPOLATION OF LAB VALUES
                    label: "Beregnet fortsettelse",
                    data: [],
                    spanGaps: true,
                    borderDash: [5, 5],
                    borderColor: yellowMedium,
                    backgroundColor: yellowMedium,
                    pointRadius: 3,
                    showLine: true,
                    fill: false,
                }
            ],
        },

        options: {
            responsive: true,
            aspectRatio: 1.75,
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
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            //Y verdi label -> bilirubin verdi
                            let bilirubin = context.parsed.y
                            //X verdi -> Dato
                            return prettyDateFromX(context.parsed.x) + " - Bilirubin: " + bilirubin + " mg/dl"
                        }
                    }
                }
            },
            scales: {
                x: {
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                        stepSize: 1,
                    },
                    grid: {
                        display: false
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
                    },
                    grid: {
                        display: false
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
        myChart.data.datasets[0].label = newLightlimitLabel
        myChart.data.datasets[0].data = newLightLimit
        myChart.data.datasets[0].spanGaps = true
        myChart.data.datasets[0].tension = 0
        myChart.options.scales.y.max = currentLightLimit[10] + 50
        myChart.update()
        console.log("Child graph updated")
    } else {
        console.log("No change in child graph")
    }
    updateLabGraph()
}
function removeChildGraph() {
    myChart.data.datasets[0].data = []
    myChart.update()
}
function updateLabGraph() {
    //Get child birthdate as x-axis 0
    let day0 = new Date(validatedChildInputs["birth-time-date"])

    //Loop through all labs taken
    let data = {}
    console.log("LAbTaken at graphing....")
    console.log(labTaken)
    for (const [timestamp, labinfo] of Object.entries(labTaken)) {
        //Time difference from lab taken and birth in days
        let labTime = new Date(timestamp)
        let timeDifference = (labTime.getTime() - day0.getTime()) / (1000 * 60 * 60 * 24)
        data[timeDifference] = labinfo[2]
        //TODO implement transfusjon graph if values are high
        /*if (labinfo[2] > currentLightLimit[10]) {
            tranfusionGraph()
        }*/
    }

    if (currentLabGraph === null || data !== currentLabGraph) {
        currentLabGraph = data
        myChart.data.datasets[1].label = "Bilirubinverdier"
        myChart.data.datasets[1].data = currentLabGraph
        myChart.data.datasets[1].spanGaps = true
        myChart.data.datasets[1].tension = 0
        myChart.update()
        console.log("Lab graph updated")
    } else {
        console.log("No change in lab graph")
    }
}

function createLightLimit() {
    //Get gestaionWeek and BirthWeight
    let gestationWeek = validatedChildInputs["gestation-week"]
    let birthWeight = validatedChildInputs["birth-weight"]

    //Y-values for light-limits
    let lightValues =
        // Birthweight < 1000:
        (birthWeight < 1000)?[      "Under 1000g",          {1:100,4:150,10:150}, [1,4,((150-100)/(4-1)),100, 150]]
        // Birthweight <1500
        : (birthWeight < 1500)?[    "Under 1500g",          {1:125,4:200,10:200}, [1,4,((200-125)/(4-1)),125, 200]]
        // Birthweight <2500
        : (birthWeight < 2500)?[    "Under 2500",           {1:150,4:250,10:250}, [1,4,((250-150)/(4-1)),150, 250]]
        // Birthweight >2500 + GA <37
        : (gestationWeek < 37)?[    "Over 2500g + GA <37",  {1:150,3:300,10:300}, [1,3,((300-150)/(3-1)),150, 300]]
        // Birthweight >2500 + GA >=37
        : [                         "Over 2500g + GA >=37", {1:175,3:350,10:350}, [1,3,((350-175)/(3-1)),175, 350]]
    console.log("Light values set to: " + lightValues[0])
    console.log(lightValues[1])
    return (lightValues)
}

function extrapolationGraphing() {
    //Extract last two points of lab taken
    let extrapolationFirst = null
    let extrapolationLast = null
    for (const [timestamp, labInfo] of Object.entries(labTaken)) {
        if (extrapolationFirst == null) {
            extrapolationFirst = [timestamp, labInfo[2]]
        } else if (extrapolationLast == null) {
            extrapolationLast = [timestamp, labInfo[2]]
        } else {
            extrapolationFirst = extrapolationLast
            extrapolationLast = [timestamp, labInfo[2]]
        }
    }
    //If there are two points, extrapolate graph
    if (extrapolationFirst != null && extrapolationLast != null) {
        //Calculate X difference
        let x1 = new Date(extrapolationFirst[0]).getTime()
        let x2 = new Date(extrapolationLast[0]).getTime()
        let diffX = (x2 - x1 ) / (1000 * 60 * 60 * 24)

        //Calculate Y difference (take datetime key from last labs, estract index 2 in labTaken array = Bilirubin value)
        let y1 = extrapolationFirst[1]
        let y2 = extrapolationLast[1]
        let diffY = y2-y1

        //Calculate slope (Y per X)
        let slope = diffY / diffX

        //ESTIMATE TIME TO CROSSING
        //let currentLightSlope -> [1,4,((150-100)/(4-1)),100, 150]
        let xToCrossing = null
        let deltaBirtdateLastPoint = ((x2 - new Date(validatedChildInputs["birth-time-date"].getTime())) / (1000 * 60 * 60 * 24))
        if (deltaBirtdateLastPoint < currentLightSlope[1] && slope > currentLightSlope[2]) {
            // The graphs y value at the last lab point = graph startvalue of Y + days between graph start to Last lab point * slope of graph
            let graphY = currentLightSlope[3] + ((deltaBirtdateLastPoint - currentLightSlope[0]) * currentLightSlope[2])
            let diffY = graphY - y2
            let diffSlope = slope - currentLightSlope[2]
            xToCrossing = diffY / diffSlope
            if (xToCrossing < (currentLightSlope[1] - deltaBirtdateLastPoint)) {
                xToCrossing = xToCrossing
            }
            else { //copy of platau
                let platau = currentLightSlope[4];
                let diffYtoPlatau = platau - y2
                xToCrossing = diffYtoPlatau / slope
            }
        } else {
            let platau = currentLightSlope[4];
            let diffYtoPlatau = platau - y2
            xToCrossing = diffYtoPlatau / slope
        }
        //Extrapolation grahing
        if (slope > 0){
            let day0 = new Date(validatedChildInputs["birth-time-date"])
            let xValue = (x2 - day0.getTime()) / (1000 * 60 * 60 * 24)
            xCrossing = xValue + xToCrossing
            yCrossing = y2 + slope * xToCrossing
            let data = {}
            data[xValue] = y2;
            data[xCrossing] = yCrossing
            myChart.data.datasets[2].data = data
            myChart.data.datasets[2].spanGaps = true
            myChart.data.datasets[2].tension = 0
            myChart.update()
            console.log("Extrapolation graph updated")
            console.log("Labslope: " + slope)
            console.log("Lightslope: " + (currentLightSlope[2]))
            console.log("ETA crossing in: " + xToCrossing + " = " + prettyDateFromX(xCrossing))
        } else {
            myChart.data.datasets[2].data = []
            myChart.update()
            console.log("Extrapolation graph deleted")
        }
    }
    else {
        myChart.data.datasets[2].data = []
        myChart.update()
        console.log("Not enough datapoints for extrapolation")
    }
}

function prettyDateFromX(x) {
    let date = new Date(validatedChildInputs["birth-time-date"]).getTime()
    let time = date + (x * 1000 * 60 * 60 * 24)
    date = new Date(time)
    let minutes = date.getMinutes()
    if (minutes < 10) {minutes = "0" + minutes} else {minutes = minutes}
    let hours = date.getHours()
    if (hours < 10) {hours = "0" + hours} else {hours = hours}
    let days = date.getDate()
    if (days < 10) {days = "0" + days} else {days = days}
    let months = date.getMonth() + 1
    if (months < 10) {months = "0" + months} else {months = months}
    let years = date.getFullYear()
    years = years.toString().slice(-2)
    return (days + "/" + months + "-" + years + " kl." + hours + ":" + minutes)
}