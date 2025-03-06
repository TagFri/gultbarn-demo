import { daysToAbsoluteDate } from "./generalFunctions.js"
import {currentChild} from "./Child.js";
export { initiateGraph, updateGraphDataset, displayTransfusionGraph, toggleTransfusionGraph, distanceToGraph, updateGraphAxis}

// COLOURS
const yellowStrong =    'rgb(245, 162, 1)'
const yellowMedium =    'rgb(251, 193, 105)'
const yellowLight =     'rgb(255, 226, 177)'
const yellowLighter =   'rgb(255, 250, 242)'
const black =           'rgb(11, 30, 51)'
const grey =            'rgb(195, 199, 203)'
const red =             'rgb(251, 65, 65)'
const lightRed =               'rgb(255, 232, 233)'

//Iniate chartvariable
let myChart = null;
let displayTransfusionGraph = false;

function toggleTransfusionGraph(){
    displayTransfusionGraph = !displayTransfusionGraph;
}

function distanceToGraph(graphType, xValue, refY) {
    //Get coordinates
    let coordinates
    if (graphType == "lightLimit") {
        coordinates = myChart.data.datasets[0].data;
    } else if (graphType == "bilirubinGraph") {
        coordinates = myChart.data.datasets[1].data;
    } else if (graphType == "extrapolationGraph") {
        coordinates = myChart.data.datasets[2].data;
    } else if (graphType == "transfusionLimit") {
        coordinates = myChart.data.datasets[3].data;
    }

    let yValue;
    //If x-value is exactly the same as any coordinates, measure directly
    if (xValue in coordinates) {
        yValue = coordinates[xValue];
        return yValue - refY
    }

    //Else need to get coordinate before and after, calculate slope and find y-value at relative day
    else {
        //Split coordinates into two arrays
        let xCoordinates = []
        let yCoordinates = []

        //Populate arrays from coordinates
        for (const [key, value] of Object.entries(coordinates)) {
            xCoordinates.push(key);
            yCoordinates.push(value);
        }

        //Find X-coordinates index before current xValue
        let beforeIndex = -1;
        for (let i = 0; i < xCoordinates.length; i++) {
            if (xCoordinates[i] >= xValue) {
                beforeIndex = i - 1;
                break; // Exit the loop once the condition is met
            } else {
                beforeIndex = i
            }
        }

        //Find X-coordinate index after current xValue
        let afterIndex = xCoordinates.findIndex(x => x > xValue);

        //Find corresponding
        let beforeX = xCoordinates[beforeIndex];
        let afterX = xCoordinates[afterIndex];
        let beforeY = yCoordinates[beforeIndex];
        let afterY = yCoordinates[afterIndex];


        //Calculate slope
        let slope = (afterY - beforeY) / (afterX - beforeX);

        //get grap Y value at xValue point
        yValue = beforeY + (slope * (xValue - beforeX));
    }

    //Return distance between graph point and given point
    return parseInt(yValue - refY);
}

function updateGraphDataset(graphType, coordinates, title){
    console.log("Updating graph dataset");
    console.log(graphType);
    console.log(coordinates);
    console.log(title);
    //Set dataset coordinates depending on graph type
    if (graphType == "lightLimit") {
        myChart.data.datasets[0].data = coordinates;
    } else if (graphType == "bilirubinGraph") {
        myChart.data.datasets[1].data = coordinates;
    } else if (graphType == "extrapolationGraph") {
        myChart.data.datasets[2].data = coordinates;
    } else if (graphType == "transfusionGraph") {
        myChart.data.datasets[3].data = coordinates;
    }

    //If title is specified, update title
    if (title != null) {
        document.getElementById("graph-label").innerHTML = "Lysgrense for barn " + title
    }

    console.log(myChart.data.datasets[3].data);
    console.log(myChart.data.datasets[0].data);

    myChart.update();
    console.log("Graph updated");
}

function updateGraphAxis(){

    myChart.update();
}

function initiateGraph() {

    //Set Aspectratio from clientWidth
    let startAspect = (document.documentElement.clientWidth >= 600)?2.2:1;

    //Get graph DIV in DOM
    const ctx = document.getElementById('graph');
    ctx.innerHTML = "";

    //Chart fonts
    Chart.defaults.font.size = 14;
    //todo Include fontchange on resize window
    Chart.defaults.font.family = 'Poppins';

    //Chart line configuration
    Chart.defaults.spanGaps = true;     //Make line between data
    Chart.defaults.tension = 0;         //??
    Chart.defaults.borderWidth = 3.5;   //Line thickness
    Chart.defaults.pointRadius = 0;     //Datapoint radis. 0 = not show
    Chart.defaults.showLine = true;     //Show line on scatter plot
    Chart.defaults.fill = false;        //Remove fill under graph

    myChart = new Chart(ctx, {
        type: 'line',
        data: {

            //One dataset = one line
            datasets: [

                {//DATASET 0 -> CHILD LIGHT LIMIT
                    data: [],
                    borderColor: black,             //Line color
                    order: 4,                       //Placed all the way back
                },

                {//DATASET 1 -> Bilirubin values
                    data: [],
                    borderColor: yellowStrong,
                    backgroundColor: yellowStrong,
                    pointRadius: 8,                 //Show dots for each bilirubin value
                    order: 1,                       //Placed all the way to front
                },

                {//DATASETT 2 -> EXTRAPOLATION OF LAB VALUES
                    data: [],
                    borderDash: [5, 5],                 //Show dashed line
                    borderColor: yellowMedium,
                    backgroundColor: yellowMedium,
                    pointRadius: 8,                     //Show dot for the extrapolated point
                    order: 2,                           //Placed under bilirubin values
                },

                {//DATASETT 3 -> Transfusion
                    data: [],
                    borderColor: lightRed,
                    order: 3,
                }
            ],
        },

        options: {

            //Responsiveness to resizing
            responsive: true,
            aspectRatio: startAspect,

            //Parsing not needed when data is sorted and in correct format
            /*
            parsing: {
                xAxisKey: 'x',
                yAxisKey: 'y'
            },
            */

            //Turn on/off animation on initilizing
            animation: true,

            plugins: {

                //Show title of diagram
                title: {
                    display: true,
                },

                //Show title for each graph
                legend: {
                    display: false,

                    //Show labels ??
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 10,
                        font: {
                            weight: 'normal'
                        }
                    }
                },

                //Show info on datapoint on hover
                tooltip: {
                    enabled: true,

                    //Format content of info
                    callbacks: {
                        title: function(context) {
                            return ""
                        },
                        label: function(context) {
                            //X verdi -> Dato
                            return daysToAbsoluteDate(currentChild.birthDateTime, context.parsed.x).toLocaleString("da-DK", {month: 'long', day: 'numeric', year: 'numeric', hour: "2-digit", minute: "2-digit", hour12: false}) + " - Bilirubin: " + context.parsed.y + " mg/dl"
                        }
                    }
                },
            },

            //Set scales and limits for X / Y axis
            scales: {

                //X-axis
                x: {
                    type: 'linear',

                    //Initial start, overwritten if datapoints are outside
                    suggestedMin: 0,
                    suggestedMax: 10,

                    //Set how often the x-label should be showed
                    ticks: {

                        //Every secound day E.G. 0,2,4, etc.
                        stepSize: 2,
                        callback: function(value, index, values) {
                            return "Dag " + value;
                        }
                    },

                    //Remove grid lines
                    grid: {
                        display: false,
                    },

                    //X-axis linewidth
                    border: {
                        width: 2,
                    }
                },

                //y-axis
                y: {
                    //Starts at zero, starts at max200 unless points exceed
                    beginAtZero: true,
                    min: 0,
                    suggestedMax: 500,

                    //Mark every 50 point
                    ticks: {
                        stepSize: 50
                    },

                    //remove all grid lines
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
