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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
