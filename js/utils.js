export function getStyleValue(style, name, defaultValue){
    var entries = style.split(";")
    var value = defaultValue;

    entries.forEach((entry)=>{
        var [n, v] = entry.split("=")
        if (n == name){
            value = v
        }
    });
    return value;
}