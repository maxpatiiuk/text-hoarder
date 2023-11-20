import fs from 'node:fs';

// Show the diff between the dates of each pair of posts
/*
const matched = fs.readFileSync('../matched.txt').toString()
.split('\n\n\n...\nurl:')
.map(part=>new Date(Number.parseInt(part.slice(
  part.indexOf('time: ')+'time: '.length,part.indexOf('\ntag: ')
  ))/1000));
  fs.writeFileSync('deltas.json',matched.map((date,index)=>
  [date.getTime()*1000 + date.getMilliseconds(),
  Math.round(
    (date.getTime() - (matched[index-1]?.getTime()??date.getTime()))
    /1000/864)/100].join('    ')).join('\n'));
*/

// Split the file into 20 parts
const separator = '\n\n\n...\nurl:'
const matched = fs.readFileSync('../matched.txt').toString()
.split(separator)
const parts = 20;
const length = Math.ceil(matched.length/parts);
Array.from({length:parts},(_,index)=>
  fs.writeFileSync(`../matched.${index}.txt`,`${separator}${matched.slice(index*length,(index+1)*length)
  .join(separator)}`)
)