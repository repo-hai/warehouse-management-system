const a = [1,2,3,4,5];
a.forEach((number) => {
    if(number == 3){
        return false;
    }
    console.log(number);
})
console.log("done");