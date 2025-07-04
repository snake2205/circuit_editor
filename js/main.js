import {drawGrid} from "./grid.js";
import {initiateConnections} from "./connections.js";
import {addLiveDrag} from "./drag.js";
import {addComponents} from "./componentShapes.js";
import {addToolbar} from "./toolbar.js";
import {addPopupMenu} from "./popupMenu.js";

// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function main(container)
{
    var config = mxUtils.load('js/keyhandler-commons.xml').getDocumentElement();
    var editor = new mxEditor(config); // sets editor hotkeys
    editor.setGraphContainer(container); // makes graph field in container

    mxEvent.disableContextMenu(document.body); // disables chrome context menu on right click

    var graph = editor.graph;
    graph.gridSize = 10;
    graph.foldingEnabled = false;
    new mxRubberband(graph); // enables selecting multiple elements

    // my stuff
    addToolbar(graph); // adds toolbar with the components
    initiateConnections(graph); // sets up connections
    drawGrid(graph); // draws background grid
    addComponents(); // registers new component shapes
    addPopupMenu(graph); // adds a pop up menu
};

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('graphContainer');
  main(container);
});