import {updateGraphDataset} from "./graph.js";
export {updateTransfusionGraph}


function updateTransfusionGraph(birthWeight) {
    let transfusionLimitInfo;

    if (birthWeight < 1000) {
        transfusionLimitInfo = [{1: 175, 2: 200, 3: 250, 10: 250}]
    } else if (birthWeight < 1500) {
        transfusionLimitInfo = [{1: 200, 3: 250, 10: 250}]
    } else if (birthWeight < 2500) {
        transfusionLimitInfo = [{1: 250, 3: 350, 10: 350}]
    } else {
        transfusionLimitInfo = [{0: 200, 3: 400, 10: 400}]
    }

    //Update graph's light limit (graphtype, coordinates, title
    updateGraphDataset("transfusionGraph", ...transfusionLimitInfo);
}