import moment from "moment";

export function insertCharacter(value: string):string{
  const split = value.split("");
  let counter = 0;
  for(let i = split.length;i>0;i--){
    if(counter == 3){
      split.splice(i,0," ");
      counter = 0;
    }
    counter++;
  }
  return split.join("");
}

export function printDate(d:string):string{
  return moment(d).format('YYYY-MM-DD')
}
