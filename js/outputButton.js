import {ElComponent} from "./ElectricComponent.js";

export function addOutputButtonFunctionality(graph){
    var outputButton = document.getElementById("outputButton")
    outputButton.onclick = function (){
        printOutput(graph);
    } 
}

function printOutput(graph){
    const model = graph.getModel();
    const parent = graph.getDefaultParent();
    const children = model.getChildren(parent) || [];

    const edges = children.filter(cell => !(cell instanceof ElComponent));
    var edgeGroups = groupEdges(edges);

    const components = children.filter(cell => (cell instanceof ElComponent));
    var componentData = [];

    // virziens netiek ņemts vērā pagaidām
    for (let i=0; i<components.length; i++){
        var d = components[i].getProperties();

        d.start = getEdgeGroupIndex(components[i].edges[0], edgeGroups);
        d.end = getEdgeGroupIndex(components[i].edges[1], edgeGroups);
        componentData.push(d);
    }
    console.log(componentData);
    


}


function getEdgeGroupIndex(edge, group){
    for (let i=0; i<group.length; i++){
        if (group[i].includes(edge)){
            return i;
        }
    }
    return null;
}

function groupEdges(edges){
    var groups = []
    while (edges.length > 0){
        groups.push(getConnectedEdges(edges, edges[0], []))
        edges = edges.filter(el => !groups.flat().includes(el));    
    }

    return groups
    
} 

function getConnectedEdges(allEdges, edge, groupedEdges){
    groupedEdges.push(edge);

    for(let i=0; i<allEdges.length; i++){
        if (!groupedEdges.includes(allEdges[i])){
            if (allEdges[i].source == edge || allEdges[i].target == edge){
                getConnectedEdges(allEdges, allEdges[i], groupedEdges);
            }
        }
    }

    if(edge.source != null && !(edge.source instanceof ElComponent) &&!(groupedEdges.includes(edge.source))){
        getConnectedEdges(allEdges, edge.source, groupedEdges);
    }
    if(edge.target != null && !(edge.target instanceof ElComponent)&&!(groupedEdges.includes(edge.target))){
        getConnectedEdges(allEdges, edge.target, groupedEdges);
    }
    return groupedEdges;
}