export function getDataFromEntity(returnObject, dataObject){
    Object.keys(dataObject).forEach((key) => {
        returnObject[key] = dataObject[key];
    });

    return returnObject;
}