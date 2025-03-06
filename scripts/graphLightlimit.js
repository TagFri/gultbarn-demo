import { updateGraphDataset } from "./graph.js"
import { currentChild } from "./Child.js"
export {updateLightLimit, getLightSlope, getLightBreak, getLightLimit}

function updateLightLimit() {

    let lightLimitInfo = getLightLimit();
    //Update graph's light limit (graphtype, coordinates, title
    updateGraphDataset("lightLimit", ...lightLimitInfo);
}

function getLightLimit() {
    let birthWeight = currentChild.birthWeight;
    let gestationWeek = currentChild.gestationWeek;

    let lightLimitInfo;
    //Get correct lightlimit for current child
    if (birthWeight < 1000) {
        lightLimitInfo = [{1: 100, 4: 150, 10: 150},"under 1000g"]
    } else if (birthWeight < 1500) {
        lightLimitInfo = [{1: 125, 4: 200, 10: 200}, "under 1500g"]
    } else if (birthWeight < 2500) {
        lightLimitInfo = [{1: 150, 4: 250, 10: 250}, "under 2500g"]
    } else if (birthWeight >= 2500 && gestationWeek < 37) {
        lightLimitInfo = [{1: 150, 3: 300, 10: 300}, "over 2500g + GA <37"]
    } else if (birthWeight >= 2500 && gestationWeek >= 37) {
        lightLimitInfo = [{1: 175, 3: 350, 10: 350},"over 2500g + GA >=37"]
    } else {
        console.log("ERROR: No lightlimit found")
    }
    return lightLimitInfo;

}

function getLightSlope () {
    let birthWeight = currentChild.birthWeight;
    let gestationWeek = currentChild.gestationWeek;

    if (birthWeight < 1000) {
        return ( 50 / 3 )
    } else if (birthWeight < 1500) {
        return ( 75 / 3 )
    } else if (birthWeight < 2500) {
        return ( 100 / 3 )
    } else if (birthWeight >= 2500 && gestationWeek < 37) {
        return ( 150 / 2 )
    } else if (birthWeight >= 2500 && gestationWeek >= 37) {
        return ( 175 / 2 )
    } else {
        console.log("ERROR: No lightslope found")
    }
}

function getLightBreak() {
    let birthWeight = currentChild.birthWeight;

    if (birthWeight < 2500) {
        return 3
    } else if (birthWeight >= 2500) {
        return 2
    }
}

