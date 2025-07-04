import {makePropertyWindow} from "./propertyWindow.js";

export function addPopupMenu(graph){
    // Configures automatic expand on mouseover
    graph.popupMenuHandler.autoExpand = true;

    // Installs context menu
    graph.popupMenuHandler.factoryMethod = function(menu, cell, evt)
    {
        if (cell != null){
            componentPopupMenu(menu, cell)
        }
    }; 
}

function componentPopupMenu(menu, cell){
    menu.addItem('Edit properties', null, function() {editProperties(cell);} )
    menu.addItem('Rotate right', null, function() {rotateRight(cell);} );
    menu.addItem('Delete', null, function() {deleteCell(cell);} );
}

function rotateRight(cell){
    cell.rotate(90);
}

function editProperties(cell){
    makePropertyWindow(cell);
}

function deleteCell(cell){
    console.log("delete")
}
