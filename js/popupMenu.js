import {makePropertyWindow} from "./propertyWindow.js";
import {ElComponent} from "./ElectricComponent.js";

export function addPopupMenu(graph){
    // Configures automatic expand on mouseover
    graph.popupMenuHandler.autoExpand = true;

    // Installs context menu
    graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
    {
        if (cell != null && cell instanceof ElComponent){
            componentPopupMenu(menu, cell);
        } 
        else if (cell != null && cell.edge){
            edgePopupMenu(menu, cell, graph);
        } 
    }; 
}

//===========================

function componentPopupMenu(menu, cell, graph){
    menu.addItem('Edit properties', null, function() {editProperties(cell);} )
    menu.addItem('Rotate right', null, function() {rotateRight(cell);} );
    menu.addItem("Flip horizontal", null, function(){flipHorizontal(cell);});
    menu.addItem("Flip vertical", null, function(){flipVertical(cell);});
    menu.addItem('Delete', null, function() {deleteCell(cell);} );
}

function rotateRight(cell){
    cell.rotate(90);
}

function flipHorizontal(cell){
    cell.flip("horizontal");
}

function flipVertical(cell){
    cell.flip("vertical");
}

function editProperties(cell){
    makePropertyWindow(cell);
}

function deleteCell(cell){
    cell.delete();
}

// ===========================


function edgePopupMenu(menu, cell, graph){
    menu.addItem('Delete', null, function() {deleteEdge(cell, graph);} );
}

function deleteEdge(cell, graph){
    graph.removeCells([cell]);
}
