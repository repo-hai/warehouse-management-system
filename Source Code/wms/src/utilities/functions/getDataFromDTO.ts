import { isArray, isDateString, isObject } from "class-validator";

export function getDataFromDTO(returnObject: any, dataObject: any, onlyDefinedFields?: boolean){
    if(onlyDefinedFields == true){
        Object.keys(returnObject).forEach((key) => {
            if(isDateString(dataObject[key])){
                returnObject[key] = new Date(Date.parse(dataObject[key]));
            } else if (isArray(dataObject[key])){
                const array : any[] = [];

                dataObject[key].forEach((arrayObject) => {
                    const object = {};
                    getDataFromDTO(object, arrayObject, false);

                    array.push(object);
                });

                returnObject[key] = array;
            } else if (isObject(dataObject[key])){
                const object = {};
                getDataFromDTO(object, dataObject[key], false);

                returnObject[key] = object;
            } else {
                returnObject[key] = dataObject[key];
            }
        });
    } else {
        Object.keys(dataObject).forEach((key) => {
            if(isDateString(dataObject[key])){
                returnObject[key] = new Date(Date.parse(dataObject[key]));
            } else if (isArray(dataObject[key])){
                const array : any[] = [];

                dataObject[key].forEach((arrayObject) => {
                    const object = {};
                    getDataFromDTO(object, arrayObject, false);

                    array.push(object);
                });

                returnObject[key] = array;
            } else if (isObject(dataObject[key])){
                const object = {};
                getDataFromDTO(object, dataObject[key], false);

                returnObject[key] = object;
            } else {
                returnObject[key] = dataObject[key];
            }
        });
    }

    return returnObject;
}