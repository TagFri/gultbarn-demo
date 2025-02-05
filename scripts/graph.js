import {absolute2relativeDate} from "./index.js";

export {initiateGraph, updateChildGraph, updateLabGraph, myChart, updateChildLightLimit}
import {child} from "./child.js"
import {Lab} from "./lab.js"

const yellowStrong =    'rgb(245, 162, 1)'
const yellowMedium =    'rgb(251, 193, 105)'
const yellowLight =     'rgb(255, 226, 177)'
const yellowLighter =   'rgb(255, 250, 242)'
const black =           'rgb(11, 30, 51)'
const grey =            'rgb(195, 199, 203)'
const red =             'rgb(251, 65, 65)'

let myChart = null;
let chartParameters = {
    "y-limit": null, //max y-value
    "x-limit": null, //max x-value
    "light-slope": null //light-graph slope
}

function initiateGraph() {
    const ctx = document.getElementById('graph');
    ctx.innerHTML = "";
    //Chart font size
    Chart.defaults.font.size = 14;
    Chart.defaults.font.family = "Poppins"
    //todo Include change on resize window
    //Chart font family
    Chart.defaults.font.family = 'Poppins';
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            //Dates (0 = birthdate, each consequently +1day until 10(14?) days of age)
            //One dataset = one line
            datasets: [
                {//DATASET 0 -> CHILD LIGHT LIMIT
                    label: "Lysgrense",
                    data: [],
                    //Line properties
                    spanGaps: true,     //Make line between data
                    tension: 0,
                    borderColor: black, //Line color
                    borderWidth: 3.5,   //Line thickness
                    pointRadius: 0,     //Datapoint radis. 0 = not show
                    showLine: true,     //Show line on scatter plot
                    fill: false,        //Remove fill under graph
                    order: 4,
                },
                {//DATASET 1 -> LAB VALUES
                    label: "Lab",
                    data: [],
                    spanGaps: true,
                    tension: 0,
                    borderColor: yellowStrong,
                    backgroundColor: yellowStrong,
                    borderWidth: 3.5,
                    pointRadius: 8,
                    showLine: true,
                    fill: false,
                    order: 1,
                },
                {//DATASETT 2 -> EXTRAPOLATION OF LAB VALUES
                    label: "Beregning",
                    data: [],
                    spanGaps: true,
                    tension: 0,
                    borderDash: [5, 5],
                    borderColor: yellowMedium,
                    backgroundColor: yellowMedium,
                    borderWidth: 3.5,
                    pointRadius: 8,
                    showLine: true,
                    fill: false,
                    order: 2,
                },
                {//DATASETT 3 -> Transfusion
                    label: "Transfusjon",
                    data: [],
                    spanGaps: true,
                    borderColor: black,
                    backgroundColor: black,
                    borderWidth: 3.5,
                    pointRadius: 8,
                    showLine: true,
                    fill: false,
                    order: 3,
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
                title: {
                  display: true,
                },
                legend: {
                    //Turn on/off top-description for each graph
                    display: false,
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 10,
                        font: {
                            weight: 'normal'
                        }
                    }
                },
                tooltip: {
                    //Turn on/off hover box on each datapoint
                    enabled: true,
                    callbacks: {
                        title: function(context) {
                            return ""
                        },
                        label: function(context) {
                            //X verdi -> Dato
                            return prettyDateFromX(context.parsed.x) + " - Bilirubin: " + context.parsed.y + " mg/dl"
                        }
                    }
                },
            },
            scales: {
                x: {
                    type: 'linear',
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                        stepSize: 2,
                        callback: function(value, index, values) {
                            return "Dag " + value;
                        }
                    },
                    grid: {
                        display: false,
                    },
                    //X-axis linewidth
                    border: {
                        width: 2,
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
                        display: false,
                    },
                    //X-axis linewidth
                    border: {
                        width: 2,
                    }
                }
            }
        },
    });
}

function updateChildGraph() {
    if (child != null) {
        let lightInfo = child.getLightLimit()
        document.getElementById("graph-label").innerHTML = "Lysgrense for barn " + lightInfo["label"]
        //Oppdater child label graf
        //myChart.options.plugins.title.text = "Lysgrense for barn " + lightInfo["label"]
        myChart.data.datasets[0].data = lightInfo.data
        myChart.options.scales.y.max = lightInfo.data[10] + 50
        chartParameters["light-slope"] = lightInfo.slope
        myChart.update()
        if (myChart.data.datasets[1].data.length > 0) {
            updateLabGraph()
        }
        console.log("Child graph updated")
    } else {
        console.log("Child not established (from upadteChildGraph) - no graph updated")
    }
}

function updateChildLightLimit() {
    let labDate = absolute2relativeDate(new Date(Lab.labs[Lab.getNumberOfLabs()-1].timeDate))
    //If lab is after 10 days
    if (labDate >= 8) {
        //Create new point in light graph that matche lab objects
        myChart.data.datasets[0].data[labDate+4] = (Object.values(myChart.data.datasets[0].data)[2])
    }
    console.log(myChart.data.datasets[0].data)
    myChart.update()
}

function updateLabGraph() {
    //Loop through all labs taken
    let data = []
    let maxBilli = null
    for (const lab of Lab.labs) {
        //adjust Y-axis to always be 50 over light-limit or labpoints
        if (lab.bilirubin > myChart.options.scales.y.max || lab.bilirubin > child.getLightLimit().data[10]) {
            myChart.options.scales.y.max = Math.round((lab.bilirubin+50)/50) * 50
        }
        //Get relative X-value
        let timeDifference = (new Date(lab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)
        //Add lab to graph
        data.push({x: timeDifference,y: lab.bilirubin})
        let lightKeys = Object.keys(child.getLightLimit().data)
        lightKeys.forEach(key => {
            if ((key != 1 && key != 3 && key != 4) && (timeDifference > key)) {
                //TODO ADD DATAPOINT TO LIGHT GRAPH
            }
        })
    }
    //Adjust Y-axis if bilirubin value is above the lightlimit
    myChart.data.datasets[1].data = data
    console.log("Lab graph updated")
    if (Lab.labs.length >= 2) {
        extrapolationGraphing()
    } else {
        myChart.data.datasets[2].data = []
    }
    myChart.update()
}
function roundToNearest(nearest, number) {return  ; }

function extrapolationGraphing() {
    let lastLab = Lab.labs[Lab.labs.length-1]
    let lightCross = lightCrossingPoint()
    if (lightCross != null) {
        let data = []
        data.push({x: ((new Date(lastLab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)), y: lastLab.bilirubin})
        data.push(lightCross)
        myChart.data.datasets[2].data = data
    } else {
        myChart.data.datasets[2].data = []
    }
    myChart.update()
}

function labSlopeCalculator() {
    //From last two lab points:
    let diffX = (Lab.labs[Lab.labs.length -1].timeDate.getTime()-Lab.labs[Lab.labs.length -2].timeDate.getTime()) / (1000 * 60 * 60 * 24)
    let diffY = (Lab.labs[Lab.labs.length -1].bilirubin - Lab.labs[Lab.labs.length -2].bilirubin)
    return(diffY / diffX)
}

function lightCrossingPoint() {
    /*last lab date < lightPlatauDate && lab slope > lightslope*/
    //Parameters
    let lastLabDate = new Date(Lab.labs[Lab.labs.length - 1].timeDate.getTime())
    let lastLabRelativeDate = (lastLabDate - new Date(child.timeDate)) / (1000 * 60 * 60 * 24)
    let lastLabBilirubin = Lab.labs[Lab.labs.length - 1].bilirubin
    let lightBreak = (Object.keys(child.getLightLimit().data).includes('3')) ? 3 : 4;
    let lightPlatauDate = new Date(child.timeDate.getTime() + (1000 * 60 * 60 * 24 * lightBreak))
    let labSlope = labSlopeCalculator()
    console.log("EXTRAPOLATING IN SLOPE")
    let lightSlope = child.getLightLimit().slope
    // Lab tatt før platå AND lab går fortere opp enn lys AND SISTE BILI VERDI + (TID TIL PLATÅ * LABSLOPE) < LYSGRENSE
    if ((lastLabDate < lightPlatauDate) && (labSlope > lightSlope) && (lastLabBilirubin + ((lightBreak - lastLabRelativeDate)* labSlope) > child.getLightLimit().data[10])) {
        //Calculate crossing at light-slope
        let diffY = (child.getLightLimit().data[1] + (lightSlope * (lastLabRelativeDate - 1)) - lastLabBilirubin)
        let timeToCrossing = diffY / (labSlope - lightSlope)
        let xValue = lastLabRelativeDate + timeToCrossing
        let yValue = child.getLightLimit().data[1] + ((xValue - 1) * lightSlope)
        return ({x: xValue, y: yValue})
    } else if (labSlope > 0) {
        //Calculate crossing at platau
        console.log("EXTRAPOLATING TO PLATAU")
        let diffY = child.getLightLimit().data[10] - lastLabBilirubin
        let timeToCrossing = diffY / labSlope
        let xValue = lastLabRelativeDate + timeToCrossing
        let yValue = child.getLightLimit().data[10]
        if (xValue < 14 && lastLabBilirubin < child.getLightLimit().data[10]) {
            console.log("UNDER 14 DAYS AND UNDER LIGHT LIMIT")
            return ({x: xValue, y: yValue})
        } else {
            console.log("No extrapolation is justified")
            return null
        }
    }
}

function prettyDateFromX(x) {
    let date = new Date(child.timeDate.getTime())
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