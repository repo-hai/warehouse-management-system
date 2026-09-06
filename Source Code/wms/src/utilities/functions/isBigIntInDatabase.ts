export function isBigIntInDatabase(s: string){
    if(s.length >= 20) return false;
    for(const c of s){
        if(c < '0' || c > '9'){
            return false;
        }
    }
    return true;
}