import {masking} from './masking.js';
import {eventListeners} from './inputHandler.js';
import {initiateGraph} from './graph.js';

masking();
eventListeners();
initiateGraph()

//Warning before leaving site
window.onbeforeunload = function() {
    return "All data vil bli slettet, vil du fortsatt fortsette?";
};