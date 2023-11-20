/**
 * After manually going over each matched.*.txt file and finding and attaching
 * missing URLs and adding other issues, finally migrate all of the to a
 * repository in a format as accepted by the Text Hoarder
 * (https://github.com/maxxxxxdlp/text-hoarder)
 */

import fs from "node:fs";
import { join, dirname } from "node:path";
import { encoding } from "./encoding.copy.js";
import { execSync } from 'node:child_process';

// Join all files
const directory =
  "/Users/maxpatiiuk/site/git/private-dotfiles/notes";
const files = fs
  .readdirSync(directory)
  .filter((file) => file.match(/^matched\.\d+\.txt$/))
  .sort((a,b)=>parseInt(a.split('.')[1])-parseInt(b.split('.')[1]))
  .map((fileName) => join(directory, fileName));

// Read browser history
const history = JSON.parse(fs.readFileSync("history.json").toString())
  .map((r) => ({
    ...r,
    fullTitle: r.title,
    title: r.title.slice(0, 30),
    url: r.url.startsWith('chrome-distiller:') ? new URL(r.url).searchParams.get('url') : r.url,
  }))
  .filter((t) => t.title.length >= 5);

const usedUrls = new Set();
const queryStrings = {};


const excludeIncludesNames = [
  'utm',
  'affiliate',
  'amp',
  'token',
  'subscriber',
  'impression',
  'campaign',
  'candidate',
  'click',
  'ref',
  'trk',
  '_url',
  'data',
  'date',
  'hash',
  'redirect',
  'user',
  'email',
  'offer',
  'lead',
  'image',
  'option',
  'provider',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ' '
];
const excludeStartsNames = [
  '_',
  'at_',
  'pk_',
  'mc_',
  'ad',
];
// Exclude irrelevant query string arguments
function filterQueryString(rawName,value) {
  const name = rawName.toLowerCase();
  const allowedName = excludeIncludesNames.every(exclude=>!name.includes(exclude)) &&
  excludeStartsNames.every(exclude=>!name.startsWith(exclude));
  if(!allowedName) return false;

  if(value.length > 100) return false;

  return true;
}

const allPosts = files.flatMap((file) =>
  fs
    .readFileSync(file)
    .toString()
    .split("\n\n...\nurl: ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map(part=>{
      const lines = part.split('\n');
      const url = lines[0];
      const title = lines[1].split('title: ')[1];
      const time = Number.parseInt(lines[2].split('time: ')[1]);
      const tag = lines[3].split('tag: ')[1];
      const content = lines.slice(4).join('\n').trim();
      if( url === undefined || title === undefined || time === undefined || tag === undefined) {
        debugger;
        console.error(part);
        throw new Error('Parsing failed');
      }
      if(url.startsWith('chrome-extension')) {
        const trimmedTitle = title.replace(' :: Reader View','').slice(0,30);
        const entry = history.find(({url, title})=>
          !url.startsWith('chrome-extension') &&
          (trimmedTitle.startsWith(title) || title.startsWith(trimmedTitle)) &&
          (Math.min(title.length, trimmedTitle.length) > 20 ||
            Math.abs(title.length - trimmedTitle.length) < Math.min(title.length, trimmedTitle.length)),
          );
        if(entry === undefined) debugger;
        else return ({lines,url: entry.url,title,time,tag,content});
      }
      return ({lines,url,title,time,tag,content});
    }).map(post=>{
      const url = new URL(post.url);

      /**
       * For some URLs, query string is significant and thus shouldn't be removed
       * 
       * If after removing likely-insignificant query string arguments, a single
       * query string argument remains, and the URL path is short (defined as
       * containing fewer than 3 of / _ - or space characters), then preserve
       * the query string.
       * 
       * Examples:
       * - https://nightsky.jpl.nasa.gov/news-display.cfm?News_ID=573
       * - https://www.urbandictionary.com/define.php?term=omega%20male%2F
       * - https://arstechnica.com/civis/viewtopic.php?t=200746
       * - http://wiki.c2.com/?WhyWikiWorks
       * - https://models.com/oftheminute/?p=54874
       * - https://news.ycombinator.com/item?id=8532261
       * - https://queue.acm.org/detail.cfm?id=3595878
       * - https://www.youtube.com/watch?v=SybEhNc_VhI
       * - https://mymetlifevision.com/article.html?article=foods-to-keep-your-eyes-and-body-healthy
       * 
       * And some harder examples:
       * - https://mymetlifevision.com/article.html?article=gaining-on-glaucoma-detection-and-treatment&vision-conditions-diseases
       * - https://www.youtube.com/watch?v=UuYqH6M6nmQ&list=WL&index=7
       * - https://us11.campaign-archive.com/?e=01d2b095a0&u=9d7ced8c4bbd6c2f238673f0f&id=6e71bb1932
       */
      const queryString = Array.from(url.searchParams.entries()).filter(([key,value])=>{
        const keep = filterQueryString(key, value);
        if(keep)
          queryStrings[key] = value;
        else
          url.searchParams.delete(key);
        return keep;
      });
      const keepQueryString = queryString.length > 0 &&
        queryString.length <= 4 &&
        url.pathname.split(/[\/_ -]/m).length < 4;

      url.hash = '';
      if(keepQueryString) {
        // console.log(url.href);
      }
      else url.search = '';

      if(usedUrls.has(url.href)){
        debugger;
        console.log(post.url, post.title);
      }
      usedUrls.add(url.href);
      /*const parameters = url.searchParams.entries();
      if(url.protocol !== 'chrome-extension:' &&
      !['www.scientificamerican.com','www.wired.com','www.oreilly.com','theconversation.com'].includes(url.host) &&
      (
        url.hash !== '' || Array.from(parameters).some(([key])=>key !== ':~:text')
      ))
      console.log(Array.from(url.searchParams.keys()), post.url, post.title);*/
      return {...post,url:url.href};
    })
);


/*console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(queryStrings)
      .sort(([a],[b])=>a.localeCompare(b)
    )
  ),null,2)
)*/

/*
fs.writeFileSync('../matched.final.txt',
allPosts.map(post=>`\n\n\n...\nurl: ${post.url}\ntitle: ${post.title}\ntime: ${post.time}\ntag: ${post.tag}\n${post.content}`).join(''));*/

const taggedPosts = allPosts.reduce((all,post)=>{
  all[post.tag]??=[];
  all[post.tag].push(post);
  return all;
},{});
const tags = Object.keys(taggedPosts).sort();

tags.forEach(tag=>{
  // fs.writeFileSync(`../final-test/${tag}.json`,JSON.stringify(sorted,null,2));

  const basePath = '/Users/maxpatiiuk/site/javascript/text-hoarder-store/';
  const sorted = taggedPosts[tag].map(({
    lines:_,
    ...post})=>{
      const time = new Date(post.time/1000);
      return {
      fileName:encoding.urlToPath.encode(time.getFullYear(), post.url),
      ...post,
      content: post.content.split('\n').map(line=>line.trimEnd()).join('\n'),
      time:time.toISOString(),
    }})
    .sort((a,b)=>a.time === b.time ? 0 : a.time < b.time ? -1 : 1)

    sorted.forEach(post=>{
      const path = `${basePath}${post.fileName}`;
      const parent = dirname(path);
      fs.mkdirSync(parent,{recursive:true});
      fs.writeFileSync(path,post.content);
      const message = post.fileName.split('/').slice(1).join('/').replace(/&?\.txt$/,'').replace('&','?');
      execSync(`git add "${post.fileName}"`,{cwd:basePath});
      execSync(`git commit --all --author "text-hoarder[bot] <408553+text-hoarder[bot]@users.noreply.github.com>" --date="${post.time}" -m "${message}"`,{cwd:basePath});
    });
    execSync(`git tag -a ${tag} -m "${tag}"`,{cwd:basePath});
})