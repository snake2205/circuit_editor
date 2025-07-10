import {drawGrid} from "./js/grid.js";
import {addLiveDrag} from "./js/drag.js";

import {initiateConnections} from "./js/connections.js";
import {addComponents} from "./js/componentShapes.js";
import {addToolbar} from "./js/toolbar.js";
import {addPopupMenu} from "./js/popupMenu.js";

async function loadMxGraph() {
  return new Promise((resolve, reject) => {
    // Avoid double-loading
    if (window.mxClient) return resolve();

    // Set base path
    window.mxBasePath = '/src';

    const script = document.createElement('script');
    script.src = '/src/js/mxClient.js';
    script.onload = () => {
      if (window.mxClient) resolve();
      else reject(new Error("mxClient.js loaded but mxClient is undefined"));
    };
    script.onerror = () => reject(new Error("Failed to load mxClient.js"));
    console.log("here 1");
    document.head.appendChild(script);
    console.log("here 2");
  });
}

// 2. Global function your Angular component can call
window.initCircuitEditor = async function(container, options = {}) {
  if (!container) {
    throw new Error('Container element is null or undefined!');
  }
  
  console.info("initCircuitEditor starting...");

  // Ensure mxGraph is loaded before using it
  await loadMxGraph();

  // Prepare containers
  let toolBar = container.querySelector('.toolBar');
  let graphContainer = container.querySelector('.graphContainer');

  if (!toolBar) {
    console.log("not toolbar");
    toolBar = document.createElement('div');
    toolBar.className = 'toolBar';
    container.appendChild(toolBar);
  }

  if (!graphContainer) {
    graphContainer = document.createElement('div');
    graphContainer.className = 'graphContainer';
    container.appendChild(graphContainer);
  }

  // Initialize graph
  const config = mxUtils.load('js/keyhandler-commons.xml').getDocumentElement();
  const editor = new mxEditor(config);
  editor.setGraphContainer(graphContainer);

  mxEvent.disableContextMenu(document.body);

  const graph = editor.graph;
  graph.gridSize = 10;
  graph.foldingEnabled = false;
  new mxRubberband(graph);

  // Your custom enhancements
  addToolbar(graph);
  initiateConnections(graph);
  drawGrid(graph);
  addComponents();
  addPopupMenu(graph);

  // Callback
  if (typeof options.onInit === 'function') {
    options.onInit(graph);
  }

  return editor;
};