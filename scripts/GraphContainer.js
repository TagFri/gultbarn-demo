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

        //Quit if number of bilirubins are not sufficient
        if (Bilirubin.numberOfBilirubins < 2) {
            this.instance.myChart.data.datasets[2].data = [];
            this.instance.myChart.update();
            return;
        }

        //Temp variables needed for the process:
        let lightPlatauDay = Child.getInstance().childGraphInfo("lightBreakDay")
        let lightPlatauValue = Child.getInstance().childGraphInfo("lightLimit").find(item => item.x === lightPlatauDay).y;
        let lightStartValue = Child.getInstance().childGraphInfo("lightLimit")[0].y;
        let lightSlope = Child.getInstance().childGraphInfo("lightSlope")
        let lastBilirubinDay = Bilirubin.lastBilirubin().relativeDays
        let lastBilirubinValue = Bilirubin.lastBilirubin().bilirubinValue
        let bilirubinSlope = Bilirubin.bilirubinSlope()
        let lightCross;

        //Requirment: positiv slope + under light curve
        if (Bilirubin.bilirubinSlope() > 0 && GraphContainer.getInstance().distanceToGraph("lightLimitGraph", Bilirubin.lastBilirubin().relativeDays, Bilirubin.lastBilirubin().bilirubinValue) > 0) {

            // Bilirubin taken before light platau, and bilirubin slope crossing light slope before platau
            if ((lastBilirubinDay < lightPlatauDay) && (bilirubinSlope > lightSlope) && (lastBilirubinValue + ((lightPlatauDay - lastBilirubinDay) * bilirubinSlope) > lightPlatauValue)) {

                //Start difference between bilirubin and light limit
                let diffY = (lightStartValue + (lightSlope * (lastBilirubinDay - 1)) - lastBilirubinValue)

                //Calculate time to crossing
                let timeToCrossing = diffY / (bilirubinSlope - lightSlope)

                //Get coordinates at crossing;
                let xValue = lastBilirubinDay + timeToCrossing
                let yValue = lightStartValue + ((xValue - 1) * lightSlope)

                //End function
                lightCross = {x: xValue, y: yValue}

                //Handles crossing at platau for positive slopes
            } else if ((bilirubinSlope > 0) && (lightStartValue + (lightSlope * (lastBilirubinDay - 1)) - lastBilirubinValue > 0) ) {

                //Start difference between bilirubin and light limit
                let diffY = lightPlatauValue - lastBilirubinValue

                //Calculate time to crossing
                let timeToCrossing = diffY / bilirubinSlope

                //Get coordinates at crossing;
                let xValue = lastBilirubinDay + timeToCrossing
                let yValue = lightPlatauValue
                //If crossing is within 14 days from last bilirbubin:
                if (xValue < (lastBilirubinDay+14) && lastBilirubinValue < lightPlatauValue) {
                    lightCross = {x: xValue, y: yValue}
                } else {
                    lightCross = false
                }
            }
            //Else no need for extrapolation
            else {
                lightCross = false
            }

            //If there are valid lightcrossing coordinate and its in tfuture
            if (lightCross && lightCross.x > lastBilirubinDay) {
                let data = [
                    {x: lastBilirubinDay, y: lastBilirubinValue},
                    lightCross,
                ];
                this.instance.myChart.data.datasets[2].data = data;
            } else {
                this.instance.myChart.data.datasets[2].data = [];
            }
        } else {
            this.instance.myChart.data.datasets[2].data = [];
        }
        this.instance.myChart.update();
    }

    static updateAxises() {
        this.updateXvalue()
        this.updateGraphYLimit()
    }

    static updateXvalue() {
        console.log("Update X value")
        const datasets = this.instance.myChart.data.datasets;
        const bilirubinLastX = datasets[1].data.length > 0 ? datasets[1].data[datasets[1].data.length - 1].x : 0;
        const extrapolationLastX = datasets[2].data.length > 0 ? datasets[2].data[datasets[2].data.length - 1].x : 0;
        const maxX = Math.max(bilirubinLastX, extrapolationLastX);
        const minX = datasets[1].data.length > 0 ? Math.min(...datasets[1].data.map(d => d.x)) : 0;
        const suggestedMaxX = maxX > 10 ? Math.ceil(maxX) + 2 : 10;
        console.log(maxX, suggestedMaxX);

        // If last X value exceeds 10, extend lightLimit and transfusion graphs
        if (maxX > 10) {
            // Update the last X value of lightLimitGraph
            const lightLimitData = datasets[0].data;
            if (lightLimitData.length > 0) {
                const lastLightLimitCoordinate = lightLimitData[lightLimitData.length - 1];
                lightLimitData[lightLimitData.length - 1] = {...lastLightLimitCoordinate, x: suggestedMaxX};
                this.instance.myChart.data.datasets[0].data = lightLimitData;
            }

            // Update the last X value of transfusionGraph
            const transfusionData = datasets[3].data;
            if (transfusionData.length > 0) {
                const lastTransfusionCoordinate = transfusionData[transfusionData.length - 1];
                transfusionData[transfusionData.length - 1] = {...lastTransfusionCoordinate, x: suggestedMaxX};
                this.instance.myChart.data.datasets[3].data = transfusionData;
            }
        }

        // If all values are removed or maxX compresses below 10, reset to default range
        if (maxX <= 10) {
            // Remove extended X values for lightLimitGraph
            const lightLimitData = datasets[0].data;
            if (lightLimitData.length > 0) {
                lightLimitData[lightLimitData.length - 1] = {...lightLimitData[lightLimitData.length - 1], x: 10};
                this.instance.myChart.data.datasets[0].data = lightLimitData;
            }

            // Remove extended X values for transfusionGraph
            const transfusionData = datasets[3].data;
            if (transfusionData.length > 0) {
                transfusionData[transfusionData.length - 1] = {...transfusionData[transfusionData.length - 1], x: 10};
                this.instance.myChart.data.datasets[3].data = transfusionData;
            }
        }

        // Update graph's suggested max X range
        this.instance.myChart.options.scales.x.max = suggestedMaxX;
        this.instance.myChart.update();
    }

    static updateGraphYLimit() {

        let maxYValue = 0;

// Determine the largest y-value from bilirubinGraph
        const bilirubinData = this.instance.myChart.data.datasets[1].data;
        if (bilirubinData.length > 0) {
            const bilirubinMaxY = Math.max(...bilirubinData.map(d => d.y)) + 25;
            maxYValue = Math.max(maxYValue, bilirubinMaxY);
        }

        // Determine the largest y-value from lightLimitGraph
        const lightLimitData = this.instance.myChart.data.datasets[0].data;
        if (lightLimitData.length > 0) {
            const lightLimitMaxY = Math.max(...lightLimitData.map(d => d.y)) + 50;
            maxYValue = Math.max(maxYValue, lightLimitMaxY);
        }

        // Determine the largest y-value from transfusionGraph if it's not hidden
        const transfusionGraphHidden = this.instance.myChart.data.datasets[3].hidden;
        if (!transfusionGraphHidden) {
            const transfusionData = this.instance.myChart.data.datasets[3].data;
            if (transfusionData.length > 0) {
                const transfusionMaxY = Math.max(...transfusionData.map(d => d.y)) + 50;
                maxYValue = Math.max(maxYValue, transfusionMaxY);
            }
        }

        // Round up maxYValue to the nearest increment of 50
        maxYValue = Math.ceil(maxYValue / 50) * 50;

        // Set the chart's Y-axis maximum limit
        this.instance.myChart.options.scales.y.max = maxYValue;
        this.instance.myChart.update();
    }

    static updateTransfusionGraph() {

        this.instance.myChart.data.datasets[3].data = Child.getInstance().childGraphInfo("transfusionLimit")
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
        if (showGraph) {
            this.instance.myChart.data.datasets[3].hidden = false;
            console.log("Show transfusion graph")
        } else {
            this.instance.myChart.data.datasets[3].hidden = true;
            console.log("Hide transfusion graph")
        }
    }

    distanceToGraph(graphType, xValue, refY) {
        let coordinates = this[graphType]

        // Se if x-value is a perfect match to light graph
        const foundObject = coordinates.find(item => item.x === xValue)

        //If so, return Y-coordinates between the two points
        if (foundObject) {
            return ((coordinates.find(item => item.x === xValue).y) - refY)
        };


        // Otherwise, split coordinates into two arrays.
        let xCoordinates = [];
        let yCoordinates = [];

       //Loop through coordinates and split x/y
        for (const coordinate of coordinates) {
            xCoordinates.push(coordinate.x);
            yCoordinates.push(coordinate.y);
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

        // Calculate the slope between the two points.
        let slope = (yCoordinates[afterIndex] - yCoordinates[beforeIndex]) / (xCoordinates[afterIndex] - xCoordinates[beforeIndex]);


        // Calculate the y value at the xValue point.
        let yValue = yCoordinates[beforeIndex] + (slope * (xValue - xCoordinates[beforeIndex]));


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
