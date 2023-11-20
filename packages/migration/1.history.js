/**
 * From extracted browser history (from takeout.google.com), build a single JSON
 * file
 */

import fs from 'node:fs';
import { url } from 'node:inspector';
import { title } from 'node:process';

/*
const path = '/Users/maxpatiiuk/Downloads/Google';
const files = `BrowserHistory.json
BrowserHistory2.json
BrowserHistory3.json
BrowserHistory4.json
BrowserHistory5.json
BrowserHistory6.json
BrowserHistory7.json
BrowserHistory8.json`.split('\n');
const history = files.map(file=>fs.readFileSync(`${path}/${file}`).toString()).map(r=>JSON.parse(r)).flatMap(h=>h['Browser History'].map(r=>({url:r.url,title:r.title,time:r.time_usec})));
fs.writeFileSync('history.json',JSON.stringify(history));
*/

/*
const history = JSON.parse(fs.readFileSync('history.json').toString());
const topHosts = history.map(r=>{
  try {
  const url = new URL(r.url);
  return url.host;
  }
  catch {return undefined;}
}).filter(Boolean);
fs.writeFileSync('hostnames.json',JSON.stringify(
  Object.fromEntries(Object.entries(topHosts.reduce((t,v)=>{
    t[v]??=0;
    t[v]+=1;
    return t;
  },{})).sort((a,b)=>b[1]-a[1]))
  ,null,2)
)
*/

const history = JSON.parse(fs.readFileSync('history.json').toString());
const titles = new Set(history.map(r=>
  r.title
).filter(Boolean));
fs.writeFileSync('titles.txt',Array.from(titles).join('\n'));