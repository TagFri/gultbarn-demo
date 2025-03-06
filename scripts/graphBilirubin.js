import {updateGraphDataset} from "./graph.js";
import {Bilirubin} from "./Bilirubin.js";
import {getLightSlope, getLightBreak, getLightLimit} from "./graphLightlimit.js"

export {updateBilirubinGraph}

function updateBilirubinGraph() {

    //Loop through all labs taken
    let data = []
    for (const bilirubin of Bilirubin.allBilirubins) {

        //Add lab to coordiate dataset
        data.push({x: bilirubin.relativeDays,y: bilirubin.bilirubinValue})

    }
    updateGraphDataset("bilirubinGraph", data)

    //If more than two bilirubins + slope is positive -> call extrapolation graph as well
    if (Bilirubin.numberOfBilirubins >2 && Bilirubin.lastBilirubinSlope() > 0) {

        let lastBilirubinDay = Bilirubin.lastBilirubin().relativeDays
        let lastBilirubinValue = Bilirubin.lastBilirubin().bilirubinValue
        let bilirubinSlope = Bilirubin.lastBilirubinSlope()
        let lightPlatauDay = getLightBreak()
        let lightStartValue = getLightLimit()[0][1]
        let lightPlatauValue = getLightLimit()[0][10]

        function lightCrossingPoint() {
            let lightSlope = getLightSlope()
            // Lab tatt før platå AND lab går fortere opp enn lys AND SISTE BILI VERDI + (TID TIL PLATÅ * LABSLOPE) < LYSGRENSE
            if ((lastBilirubinDay < lightPlatauDay) && (bilirubinSlope > lightSlope) && (lastBilirubinValue + ((lightPlatauDay - lastBilirubinDay) * bilirubinSlope) > lightPlatauValue)) {
                console.log("EXTRAPOLATING IN SLOPE")
                //Calculate crossing at light-slope
                let diffY = (lightStartValue + (lightSlope * (lastBilirubinDay - 1)) - lastBilirubinValue)
                let timeToCrossing = diffY / (bilirubinSlope - lightSlope)
                let xValue = lastBilirubinDay + timeToCrossing
                let yValue = lightStartValue + ((xValue - 1) * lightSlope)
                return ({x: xValue, y: yValue})
            } else if (bilirubinSlope > 0) {
                //Calculate crossing at platau
                console.log("EXTRAPOLATING TO PLATAU")
                let diffY = lightPlatauValue - lastBilirubinValue
                let timeToCrossing = diffY / bilirubinSlope
                let xValue = lastBilirubinDay + timeToCrossing
                let yValue = lightPlatauValue
                if (xValue < (lastBilirubinDay+14) && lastBilirubinValue < lightPlatauValue) {
                    console.log("UNDER 14 DAYS AND UNDER LIGHT LIMIT")
                    return ({x: xValue, y: yValue})
                } else {
                    console.log("No extrapolation is justified")
                    return null
                }
            } else {
                console.log("No extrapolation is justified")
                return null
            }
        }

        //Get last lab
        let lastLab = Lab.labs[Lab.labs.length-1]
        //Get when graph will cross the light limit
        let lightCross = lightCrossingPoint()
        //Check that there will be a light crossing + crossing is after last lab (eliminate negative slopes of extrapolation backwards in time)
        if (lightCross != null && lightCross.x > lastBilirubinDay) {
            let data = []
            data.push({x: ((new Date(lastLab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)), y: lastLab.bilirubin})
            data.push(lightCross)
            myChart.data.datasets[2].data = data
        } else {
            myChart.data.datasets[2].data = []
        }
        myChart.update()
    }
}

