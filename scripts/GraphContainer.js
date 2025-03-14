import {daysToAbsoluteDate} from "./generalFunctions.js";
import {Child} from "./Child.js";
import {Bilirubin} from "./Bilirubin.js";

export {GraphContainer};

class GraphContainer {
    // Hold the singleton instance
    static instance = null;

    constructor() {
        // If an instance already exists, return it
        if (GraphContainer.instance) {
            return GraphContainer.instance;
        }

        // COLOURS
        this.yellowStrong = 'rgb(245, 162, 1)';
        this.yellowMedium = 'rgb(251, 193, 105)';
        this.yellowLight = 'rgb(255, 226, 177)';
        this.yellowLighter = 'rgb(255, 250, 242)';
        this.black = 'rgb(11, 30, 51)';
        this.grey = 'rgb(195, 199, 203)';
        this.red = 'rgb(251, 65, 65)';
        this.lightRed = 'rgb(255, 232, 233)';

        // Graph container and axis settings
        this.myChart = null;
        this.graphAxisMaxX = 10;
        this.graphAxisMaxY = 400;

        // Cache the instance
        GraphContainer.instance = this;
    }

    // Static method to get the singleton instance
    static getInstance() {
        if (!GraphContainer.instance) {
            GraphContainer.instance = new GraphContainer();
        }
        return GraphContainer.instance;
    }

    //Update graphs
    static updateLightLimitGraph() {
        //Update chart data field
        this.instance.myChart.data.datasets[0].data = Child.getInstance().childGraphInfo("lightLimit")
        this.instance.myChart.update();
    }
    static updateBilirubinGraph() {

        //Loop through all labs taken
        let data = []
        for (const bilirubin of Bilirubin.allBilirubins) {
            data.push({x: bilirubin.relativeDays, y: bilirubin.bilirubinValue});
            }

        //Update chart data field
        this.instance.myChart.data.datasets[1].data = data
        this.instance.myChart.update();
    }
    static updateExtrapolationGraph() {

        console.log("Update extrapolation graph")
        console.log(GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue))

        //Requirment: >= 2 bilirubins + positiv slope + under light curve
        if (Bilirubin.numberOfBilirubins >2 && Bilirubin.bilirubinSlope() > 0 && GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) < 0) {

            console.log("Requirment: >= 2 bilirubins + positiv slope + under light curve")

            let graphYValue = Child.getInstance().childGraphInfo("lightLimit").find(item => item.x === Child.getInstance().childGraphInfo("lightBreakDay")).y;
            console.log(graphYValue)

            //Find the light crossing point
            function lightCrossingPoint() {

                // Bilirubin taken before light platau, and bilirubin slope crossing light slope before platau
                if ((lastBilirubinDay < lightPlatauDay) && (bilirubinSlope > lightSlope) && (lastBilirubinValue + ((lightPlatauDay - lastBilirubinDay) * bilirubinSlope) > lightPlatauValue)) {
                    console.log("Bilirubin taken before light platau, and bilirubin slope crossing light slope before platau")
                    //Start difference between bilirubin and light limit
                    let diffY = (lightStartValue + (lightSlope * (lastBilirubinDay - 1)) - lastBilirubinValue)
                    console.log(diffY)

                    //Calculate time to crossing
                    let timeToCrossing = diffY / (bilirubinSlope - lightSlope)

                    //Get coordinates at crossing;
                    let xValue = lastBilirubinDay + timeToCrossing
                    let yValue = lightStartValue + ((xValue - 1) * lightSlope)

                    //End function
                    return ({x: xValue, y: yValue})

                    //Handles crossing at platau for positive slopes
                } else if ((bilirubinSlope > 0) && (lightStartValue + (lightSlope * (lastBilirubinDay - 1)) - lastBilirubinValue > 0) ) {
                    console.log("Bilirubin slope crossing light slope before platau")

                    //Start difference between bilirubin and light limit
                    let diffY = lightPlatauValue - lastBilirubinValue
                    console.log(diffY)

                    //Calculate time to crossing
                    let timeToCrossing = diffY / bilirubinSlope
                    console.log(timeToCrossing)

                    //Get coordinates at crossing;
                    let xValue = lastBilirubinDay + timeToCrossing
                    console.log(xValue)
                    let yValue = lightPlatauValue
                    console.log(yValue)
                    //IF crossing is within 14 days from last bilirbubin:
                    if (xValue < (lastBilirubinDay+14) && lastBilirubinValue < lightPlatauValue) {
                        console.log("Crossing is within 14 days from last bilirbubin")
                        return ({x: xValue, y: yValue})
                    }

                    //Else no need for extrapolation
                    else {
                        console.log("No extrapolation is justified")
                        return false
                    }
                }
                //Else no need for extrapolation
                else {
                    console.log("No extrapolation is justified")
                    return false
                }
            }

            //Get coordinates for when extrapolation will cross current light limit
            const lightCross = lightCrossingPoint()

            //If there are valid lightcrossing coordinate and its in tfuture
            if (lightCross && lightCross.x > lastBilirubinDay) {
                const data = [
                    {x: lastBilirubinDay, y: lastBilirubinValue},
                    {x: lightCross.x, y: lightCross.y},
                ]
                if (lightCross.x > graphAxisMax("x")) {
                    updateGraphAxis("x", Math.round(lightCross.x / 2) * 2)
                }
                updateGraphDataset("extrapolationGraph", data)
            }
        } else {
            this.instance.myChart.data.datasets[2].data = []
        }

        this.instance.myChart.update();
    }
    static updateTransfusionGraph() {

        this.instance.myChart.update();
    }

    //Update graphTitle
    static updateGraphTitle() {
        this.instance.myChart.options.plugins.title.text = Child.getInstance().childGraphInfo("title")
        this.instance.myChart.update();
    }

    // GET COORDINATES
    get lightLimitGraph() {
        return this.myChart.data.datasets[0].data;}
    get bilirubinGraph() {
        return this.myChart.data.datasets[1].data;}
    get extrapolationGraph() {
        return this.myChart.data.datasets[2].data;}
    get transfusionGraph() {
        return this.myChart.data.datasets[3].data;}

    //FUNCTIONS
    static toggleTransfusionGraph(showGraph) {
        if (this.myChart) {
            if (showGraph) {
                this.myChart.data.datasets[3].hidden = false;
            } else {
                this.myChart.data.datasets[3].hidden = !this.myChart.data.datasets[3].hidden;
            }
            this.myChart.update();
        }
    }

    distanceToGraph(graphType, xValue, refY) {
        let coordinates = this[graphType]

        //CORRECT UNTIL HERE
        //todo fix rest

        let yValue;
        // If the x-value exactly matches a coordinate key, measure directly.
        if (xValue in coordinates) {
            yValue = coordinates[xValue];
            return yValue - refY;
        } else {
            // Otherwise, split coordinates into two arrays.
            let xCoordinates = [];
            let yCoordinates = [];
            for (const [key, value] of Object.entries(coordinates)) {
                xCoordinates.push(Number(key));
                yCoordinates.push(value);
            }

            // Find the index for the point just before xValue.
            let beforeIndex = -1;
            for (let i = 0; i < xCoordinates.length; i++) {
                if (xCoordinates[i] >= xValue) {
                    beforeIndex = i - 1;
                    break;
                } else {
                    beforeIndex = i;
                }
            }

            // Find the index after xValue.
            let afterIndex = xCoordinates.findIndex(x => x > xValue);

            let beforeX = xCoordinates[beforeIndex];
            let afterX = xCoordinates[afterIndex];
            let beforeY = yCoordinates[beforeIndex];
            let afterY = yCoordinates[afterIndex];

            // Calculate the slope between the two points.
            let slope = (afterY - beforeY) / (afterX - beforeX);
            // Calculate the y value at the xValue point.
            yValue = beforeY + (slope * (xValue - beforeX));
        }

        // Return the difference between the graph's y-value and refY.
        return parseInt(yValue - refY);
    }

    initiateGraph() {
        // Set aspect ratio based on client width.
        let startAspect = (document.documentElement.clientWidth >= 600) ? 2.2 : 1;

        // Get the graph container DIV.
        const ctx = document.getElementById('graph');
        ctx.innerHTML = "";

        // Set global chart defaults.
        Chart.defaults.font.size = 14;
        Chart.defaults.font.family = 'Poppins';
        Chart.defaults.spanGaps = true;
        Chart.defaults.tension = 0;
        Chart.defaults.borderWidth = 3.5;
        Chart.defaults.pointRadius = 0;
        Chart.defaults.showLine = true;
        Chart.defaults.fill = false;

        this.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    { // DATASET 0 -> CHILD LIGHT LIMIT
                        data: [],
                        borderColor: this.black,
                        order: 4,
                    },
                    { // DATASET 1 -> Bilirubin values
                        data: [],
                        borderColor: this.yellowStrong,
                        backgroundColor: this.yellowStrong,
                        pointRadius: 8,
                        order: 1,
                    },
                    { // DATASET 2 -> EXTRAPOLATION OF LAB VALUES
                        data: [],
                        borderDash: [5, 5],
                        borderColor: this.yellowMedium,
                        backgroundColor: this.yellowMedium,
                        pointRadius: 8,
                        order: 2,
                    },
                    { // DATASET 3 -> Transfusion
                        data: [],
                        borderColor: this.red,
                        order: 3,
                        hidden: true,
                    }
                ],
            },
            options: {
                responsive: true,
                aspectRatio: startAspect,
                animation: true,
                plugins: {
                    title: {
                        display: true,
                    },
                    legend: {
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
                        enabled: true,
                        filter: function (tooltipItem) {
                            if (tooltipItem.datasetIndex === 1 || tooltipItem.datasetIndex === 2) {
                                return tooltipItem.datasetIndex;
                            }
                        },
                        callbacks: {
                            title: function (context) {
                                return "";
                            },
                            label: function (context) {
                                return daysToAbsoluteDate(
                                    Child.getInstance().birthDateTime,
                                    context.parsed.x
                                ).toLocaleString("da-DK", {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false
                                }) + " - Bilirubin: " + context.parsed.y + " mg/dl";
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
                            callback: function (value) {
                                return "Dag " + value;
                            }
                        },
                        grid: {
                            display: false,
                        },
                        border: {
                            width: 2,
                        }
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 400,
                        ticks: {
                            stepSize: 50
                        },
                        grid: {
                            display: false,
                        },
                        border: {
                            width: 2,
                        }
                    }
                }
            },
        });
    }
}
