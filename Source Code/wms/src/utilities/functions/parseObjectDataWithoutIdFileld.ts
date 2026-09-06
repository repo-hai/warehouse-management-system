export function parseObjectDataWithoutIdField(resultObject, dataObject){
    Object.keys(dataObject).forEach((key) => {
        if(!key.includes("Id") && !key.includes("ID") && !key.includes("id")){
            resultObject[key] = dataObject[key];
        }
    });

    return resultObject;
}