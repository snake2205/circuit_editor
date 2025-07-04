
export function makePropertyWindow(cell){
    var content = document.createElement('div');
    var cellProperties = cell.getProperties()

    content.innerHTML = htmlTemplate;


    content.querySelector("#type").textContent = cellProperties.type;
    content.querySelector("#nameInput").value = cellProperties.name;
    content.querySelector("#nameDisplayInput").checked = cellProperties.displayName;
    content.querySelector("#saveButton").onclick = function(){saveProperties(content, cellProperties, cell); closeWindow(wnd);};
    content.querySelector("#cancelButton").onclick = function(){closeWindow(wnd);};

    insertRows(cellProperties, content);
    
    var wnd = new mxWindow('Edit component properties', content, 50, 50, 330, 250, true, true);
    wnd.setVisible(true);
    wnd.setClosable(true);
    
    wnd.setResizable(true);
    wnd.minimumSize = new mxRectangle(0, 0, 330, 250);
}

function readNewProperties(properties, html){
    properties.name = html.querySelector("#nameInput").value;
    properties.displayName = html.querySelector("#nameDisplayInput").checked;

    var rows = html.querySelectorAll("#propertyRow");
    
    for(var i=0; i<rows.length;i++){
        properties.properties[i].value = rows[i].querySelector("#valueInput").value;
        properties.properties[i].display = rows[i].querySelector("#propertyDisplayInput").checked;
        console.log(properties.properties[i]);
    }

    return properties;
}

function insertRows(properties, html){
    var body = html.querySelector("tbody");

    properties.properties.forEach((property)=>{
        var row = document.createElement("tr");
        row.id = "propertyRow";
        row.innerHTML = rowTemplate;
        
        row.querySelector("#nameCell").textContent = properties.properties[0].name;
        row.querySelector("#valueInput").value = properties.properties[0].value;
        row.querySelector("#unitCell").textContent = properties.properties[0].unit;
        row.querySelector("#propertyDisplayInput").checked = properties.properties[0].display;
        row.querySelector("#descriptionCell").textContent = properties.properties[0].description;

        body.appendChild(row);
    });
}

function saveProperties(content, oldProperties, cell){
    var newProperties = readNewProperties(oldProperties, content);
    console.log(newProperties)
    cell.setProperties(newProperties);
    }

function closeWindow(wnd){
    wnd.destroy();
}

var rowTemplate=`
    <td id="nameCell">C</td>
    <td class="inputColumn">
        <input id="valueInput" type="text" value="1">
    </td>
    <td id="unitCell">R</td>
    <td class="displayColumn">
        <input id="propertyDisplayInput" type="checkbox" checked>
    </td>
    <td id="descriptionCell">capacitance in Farad</td>
`;

var htmlTemplate=`
<div class="propertyWindow">
    <h3 id="type"></h3>
    <label for="name">Name:
        <input type="text" id="nameInput" value="C1">
        <label>
            <input type="checkbox" id="nameDisplayInput">
            Display
        </label>
    </label>

    <h3>Properties</h3>

    <div class="propertyContainer">
        <table style="width: 100%; border-collapse: collapse;" class="propertyTable">
            <colgroup>
            <col style="width: 40px;">
            <col style="width: 90px;">
            <col style="width: 40px;">
            <col style="width: 50px;">
            <col> <!-- flexible last column -->

            <thead>
            <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Display</th>
                <th>Description</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
    <div class="buttonContainer">
        <button id="saveButton" type="button">Save</button>
        <button id="cancelButton" type="button">Cancel</button>
    </div>
</div>
`;