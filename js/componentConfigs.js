export const componentConfigs ={
    resistor:{
        width: 80,
        height: 20,
        shape: "resistor",
        name: "R",
        type: "resistor",
        properties: [
        { name: "R", value: 1, unit: "Ω", display: true, description: "resistance" }
        ]
    },
    capacitor: {
        width: 40,
        height: 40,
        shape: "capacitor",
        name: "C",
        type: "capacitor",
        properties: [
        { name: "C", value: 1, unit: "C", display: true, description: "capacitance" }
        ]
    },
    inductor: {
        width: 80,
        height: 20,
        shape: "inductor",
        name: "I",
        type: "inductor",
        properties: [
        { name: "I", value: 1, unit: "L", display: true, description: "inductance" }
        ]
    },
    dc_source: {
        width: 40,
        height: 40,
        shape: "dc_source",
        name: "DC",
        type: "dc source",
        properties: [
        { name: "V", value: 1, unit: "V", display: true, description: "voltage" }
        ]
    }
}


