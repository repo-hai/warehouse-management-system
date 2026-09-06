export function removeNullAndUndefined(o: Object){
  for(const key in o){
    if(o[key] == null || o[key] == undefined){
      delete o[key];
    } else if (typeof(o[key]) === "object"){
      removeNullAndUndefined(o[key]);
    }
  };

  return o;
}