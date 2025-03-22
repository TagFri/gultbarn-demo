import {    Bilirubin       } from "./Bilirubin.js";
import {    Child           } from "./Child.js";
import {    GraphContainer  } from "./GraphContainer.js";

export {msToDays, daysToMs, daysToAbsoluteDate, daysRelativeToReferenceDate, leadingZero, between, realtiveToGraphLabel, largest, distanceToGraph}

//Converts millisecounds to relative days
function msToDays(millisecounds) {
    return millisecounds / (1000 * 60 * 60 * 24)
}

//Converts relative dats to millisecounds
function daysToMs(relativeDays) {
    return relativeDays * (1000 * 60 * 60 * 24)
}

//Converts relative days to absolute date, based on a refernce date
function daysToAbsoluteDate(referenceDate, relativeDays) {
    return new Date(referenceDate.getTime() + (relativeDays * 24 * 60 * 60 * 1000));
}

//Absolute Date as relative days (float) to Reference Date
function daysRelativeToReferenceDate(referenceDate, absoluteDate) {
    console.log(referenceDate)
    return (absoluteDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
}

//Insert leading zero for date/time <10:
function leadingZero(number) {
    return (number < 10) ? '0' + number : number;
}

//CHECK IF NUMBER IS BETWEEN MIN / MAX
function between(x, min, max) {
    return x >= min && x <= max;
}

//Make a relative day to pretty ormat (for graphing labels)
function realtiveToGraphLabel(relativeDate) {
    let date = daysToAbsoluteDate(relativeDate)
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

function largest(arr) {
    return Math.max(...arr);
}

function findClosestIndices(arr, reference) {
    let indexBeforeReference = -1; // index of the largest value < reference
    let indexAfterReference  = -1; // index of the smallest value > reference
    let closestBelow = -Infinity;
    let closestAbove = Infinity;

    // Loop over the array
    for (let i = 0; i < arr.length; i++) {
        const num = arr[i];
        // Check for a number below the reference that is higher than current candidate
        if (num < reference && num > closestBelow) {
            closestBelow = num;
            indexBeforeReference = i;
        }
        // Check for a number above the reference that is lower than current candidate
        if (num > reference && num < closestAbove) {
            closestAbove = num;
            indexAfterReference = i;
        }
    }
    return { indexBeforeReference, indexAfterReference };
}

function distanceToGraph(graph) {

    console.log("distance to graphed CALLED")
    console.log(graph)

    //Coordinates
    let coordinates

    //Set coordinates from graph
    switch (graph) {
        case "light": coordinates = Child.getInstance().childGraphInfo("lightLimit")
        break;
        case "transfusion": coordinates = Child.getInstance().childGraphInfo("transfusionLimit")
        break
    }

    //Lab parameters for last bilirubin
    let labDay = Bilirubin.lastBilirubin().relativeDays

    //Set labday to 10 if it's above as all graphs are defined at day
    if (labDay > 10) { labDay = 10 }
    let labValue = Bilirubin.lastBilirubin().bilirubinValue

    console.log(`labDay: ${labDay}`)
    console.log(`labValue: ${labValue}`)

    //Splitted coordinates
    let xCoordinates = [];
    let yCoordinates = [];

    //Loop through coordinates and split x/y
    for (const coordinate of coordinates) {
        xCoordinates.push(coordinate.x);
        yCoordinates.push(coordinate.y);
    }
    console.log(`xCoordinates: ${xCoordinates}`)
    console.log(`yCoordinates: ${yCoordinates}`)

    //If lab day in coordinates -> return difference in y value
    if (xCoordinates.includes(labDay)) {
        console.log("labDay in coordinates")
        console.log(yCoordinates[xCoordinates.indexOf(labDay)] - labValue)
        return (yCoordinates[xCoordinates.indexOf(labDay)] - labValue)
    }
    //Else if labDay is between lowest and hight coordinate
    else if ( xCoordinates.sort()[0] < labDay < xCoordinates.sort()[xCoordinates.length-1]) {
        console.log("labDay between coordinates")

        //Return indexAfterRefence, indexBeforeReference
        let closestIndex = findClosestIndices(xCoordinates, labDay)

        //Get slope of graph
        let graphSlope = (yCoordinates[closestIndex.indexAfterReference] - yCoordinates[closestIndex.indexBeforeReference]) / (xCoordinates[closestIndex.indexAfterReference] - xCoordinates[closestIndex.indexBeforeReference]);

        //Calculate current graph y value
        let currentGraphValue = yCoordinates[closestIndex.indexBeforeReference] + (graphSlope * (labDay - xCoordinates[closestIndex.indexBeforeReference]));
        console.log(currentGraphValue)

        console.log("Returning from distanceToGraph: " + (currentGraphValue - labValue))
        return (currentGraphValue - labValue)
    }

    console.log("Returning from distanceToGraph: false")
    return false
}

// LEGACY CODE:
// distanceToGraph(graphType, xValue, refY) {
//    console.log(`Starting distanceToGraph with ${graphType}, ${xValue}, ${refY}`)
//
//    let coordinates;
//    switch (graphType) {
//        case "lightLimitGraph": coordinates = this.instance.myChart.data.datasets[0].data;
//            break;
//        case "transfutionGraph": coordinates = this.instance.myChart.data.datasets[3].data;
//    }
//    console.log(coordinates)
//    console.log(typeof coordinates)
//
//    // Se if x-value is a perfect match to light graph
//    const foundObject = coordinates.find(item => item.x === xValue)
//
//    //If so, return Y-coordinates between the two points
//    console.log(foundObject)
//    if (foundObject !== undefined) {
//        return ((coordinates.find(item => item.x === xValue).y) - refY)
//    };
//
//
//    // Otherwise, split coordinates into two arrays.
//    let xCoordinates = [];
//    let yCoordinates = [];
//
//    //Loop through coordinates and split x/y
//    for (const coordinate of coordinates) {
//        xCoordinates.push(coordinate.x);
//        yCoordinates.push(coordinate.y);
//    }
//    console.log(`xCoordinates: ${xCoordinates}`)
//    console.log(`yCoordinates: ${yCoordinates}`)
//
//    // Find the index for the point just before xValue.
//    let beforeXIndex = -1;
//    for (let i = 0; i < xCoordinates.length; i++) {
//        if (xCoordinates[i] >= xValue) {
//            beforeXIndex = i - 1;
//            break;
//        } else {
//            beforeXIndex = i;
//        }
//    }
//
//    // Find the index after xValue.
//    let afterXIndex = xCoordinates.findIndex(x => x > xValue);
//
//    console.log(`beforeXIndex: ${beforeXIndex}`)
//    console.log(`afterXIndex: ${afterXIndex}`)
//
//    // Calculate the slope between the two points.
//    let slope = (yCoordinates[afterXIndex] - yCoordinates[beforeXIndex]) / (xCoordinates[afterXIndex] - xCoordinates[beforeXIndex]);
//
//    console.log(`slope: ${slope}`)
//
//    // Calculate the y value at the xValue point.
//    let yValue = yCoordinates[beforeXIndex] + (slope * (xValue - xCoordinates[beforeXIndex]));
//
//    console.log(`yValue: ${yValue}`)
//
//    // Return the difference between the graph's y-value and refY.
//    console.log(`Returning from distanceToGraph: ${parseInt(yValue - refY)}`)
//    return parseInt(yValue - refY);
//}