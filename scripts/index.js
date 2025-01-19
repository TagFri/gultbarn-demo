import {masking} from './masking.js';
import {eventListeners, validateChild} from './inputHandler.js';
import {initiateGraph} from './graph.js';

masking();
eventListeners();
initiateGraph()