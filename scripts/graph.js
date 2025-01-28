export {initiateGraph, updateChildGraph, updateLabGraph}
import {child, labs, } from "./inputHandler.js"

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
                },
                {//DATASETT 2 -> EXTRAPOLATION OF LAB VALUES
                    label: "Beregning",
                    data: [{5:200,6:400}],
                    spanGaps: true,
                    borderDash: [5, 5],
                    borderColor: yellowMedium,
                    backgroundColor: yellowMedium,
                    borderWidth: 3.5,
                    pointRadius: 8,
                    showLine: true,
                    fill: false,
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
        let lightInfo = child.lightLimit()
        myChart.options.plugins.title.text = lightInfo.label
        myChart.data.datasets[0].data = lightInfo.data
        myChart.options.scales.y.max = lightInfo.data[10] + 50
        chartParameters["light-slope"] = lightInfo.slope
        myChart.update()
        console.log("Child graph updated")
    } else {
        console.log("Child not established (from upadteChildGraph) - no graph updated")
    }
}

function updateLabGraph() {
    //Loop through all labs taken
    let data = []
    let maxBilli = null
    for (const lab of labs) {
        //adjust Y-axis to always be 50 over light-limit or labpoints
        if (lab.bilirubin > myChart.options.scales.y.max || lab.bilirubin > child.lightLimit().data[10]) {
            myChart.options.scales.y.max = Math.round((lab.bilirubin+50)/50) * 50
        }
        //Get relative X-value
        let timeDifference = (new Date(lab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)
        //Add lab to graph
        data.push({x: timeDifference,y: lab.bilirubin})
    }
    //Adjust Y-axis if bilirubin value is above the lightlimit
    myChart.data.datasets[1].data = data
    myChart.update()
    console.log("Lab graph updated")
}

function roundToNearest(nearest, number) {return  ; }


function extrapolationGraphing() {
    let data = {}
    if (labs.length >= 2) {
        //Get two last points from labs and calculate slope
        let lab1 = labs[sortedLabs[sortedLabs.length - 2]]
        let lab2 = labs[sortedLabs[sortedLabs.length - 1]]
        let diffx = (lab2.timeDate.getTime() - lab1.timeDate.getTime()) / (1000 * 60 * 60 * 24)
        let diffy = (lab2.bilirubin - lab1.bilirubin)
        let slope = diffy / diffx

        //ESTIMATE TIME TO CROSSING
        //let currentLightSlope -> [1,4,((150-100)/(4-1)),100, 150]
        let xToCrossing = null
        let deltaBirtdateLastPoint = ((x2 - (new Date(child.timeDate).getTime())) / (1000 * 60 * 60 * 24))
        if (deltaBirtdateLastPoint < chartStats.currentLightSlope[1] && chartStats.currentLabSlope > chartStats.currentLightSlope[2]) {
            // The graphs y value at the last lab point = graph startvalue of Y + days between graph start to Last lab point * slope of graph
            let graphY = chartStats.currentLightSlope[3] + ((deltaBirtdateLastPoint - chartStats.currentLightSlope[0]) * chartStats.currentLightSlope[2])
            let diffY = graphY - y2
            let diffSlope = chartStats.currentLabSlope - chartStats.currentLightSlope[2]
            xToCrossing = diffY / diffSlope
            if (xToCrossing < (chartStats.currentLightSlope[1] - deltaBirtdateLastPoint)) {
                xToCrossing = xToCrossing
            }
            else { //copy of platau
                let platau = currentLightSlope[4];
                let diffYtoPlatau = platau - y2
                xToCrossing = diffYtoPlatau / currentLabSlope
            }
        } else {
            let platau = currentLightSlope[4];
            let diffYtoPlatau = platau - y2
            xToCrossing = diffYtoPlatau / currentLabSlope
        }
        //Extrapolation grahing
        if (currentLabSlope > 0){
            let day0 = new Date(child.birthTimeDate)
            let xValue = (x2 - day0.getTime()) / (1000 * 60 * 60 * 24)
            chartStats.xCrossing = xValue + xToCrossing
            chartStats.yCrossing = y2 + currentLabSlope * xToCrossing
            let data = {}
            data[xValue] = y2;
            data[xCrossing] = yCrossing
            myChart.data.datasets[2].data = data
            myChart.data.datasets[2].spanGaps = true
            myChart.data.datasets[2].tension = 0
            myChart.update()
        } else {
            myChart.data.datasets[2].data = []
            myChart.update()
        }
        myChart.data.datasets[2].data = []
        myChart.update()
}}

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