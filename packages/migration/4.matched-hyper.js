/**
 * Misc post-processing for matched.txt or history.json
 */

import fs from "node:fs";
import { join } from "node:path";

  const urls = fs
    .readFileSync('../matched.txt')
    .toString()
    .split("\n\n")
    .map((part) => {
      const [articleTitle, jsons] = part.split('\n');
      const json = JSON.parse(jsons);
      const url = new URL(json.url);
      return {
        articleTitle,
        ...json,
        url: url.protocol === 'chrome-distiller:' ? url.searchParams.get('url') : url.href,
      };
    })
fs.writeFileSync('./urlss.json',
JSON.stringify(urls,null,1)
// JSON.stringify(Object.fromEntries(Object.entries(urls.reduce((t,v)=>{ t[v]??=0; t[v]+=1; return t; },{})).sort((a,b)=>b[1]-a[1])),null,1)

// Array.from(new Set(urls)).join('\n')
);



// fs.writeFileSync('./history.f.json',JSON.stringify(JSON.parse(fs.readFileSync('./history.json').toString()),null,1));