import {ElComponent} from "./ElectricComponent.js";
import {componentConfigs} from "./componentConfigs.js";

export function addToolbar(graph){

    var tbContainer = document.getElementById("toolBar")

    // Creates new toolbar without event processing
    var toolbar = new mxToolbar(tbContainer);
    toolbar.enabled = false
    addToolbarItem(graph, toolbar, './js/icons/resistor.svg', componentConfigs.resistor);
    addToolbarItem(graph, toolbar, './js/icons/inductor.svg', componentConfigs.inductor);
    addToolbarItem(graph, toolbar, './js/icons/capacitor.svg', componentConfigs.capacitor);
    addToolbarItem(graph, toolbar, './js/icons/dc_source.svg', componentConfigs.dc_source);
    toolbar.addLine();
}

function addToolbarItem(graph, toolbar, image, componentConfig)
{
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function(graph, evt, cell)
    {
        graph.stopEditing(false);

        var pt = graph.getPointForEvent(evt);
        var increment = getIncrement(graph, componentConfig)
        
        var vertex = new ElComponent(pt.x, pt.y, increment, graph, componentConfig);
        graph.addCell(vertex);

    }

    // Creates the image which is used as the drag icon (preview)
    var img = toolbar.addMode(null, image, funct);
    mxUtils.makeDraggable(img, graph, funct);
}

// returns all components on graph
function getAllComponents(graph){
    const model = graph.getModel();
    const parent = graph.getDefaultParent();

    console.log(model.getChildren(parent))

    return(model.getChildren(parent))
}

// returns th next increment for specific type of component
function getIncrement(graph, component){
    var allComponents = getAllComponents(graph);
    if (allComponents != null){

        var relevantComponents = allComponents.filter(obj => obj.type == component.type);
        var increment = Math.max(...(relevantComponents.map(obj => obj.increment).concat(0)))
        return increment+1;

    } else {
        return 1;
    }

}