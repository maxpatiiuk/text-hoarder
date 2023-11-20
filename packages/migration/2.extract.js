/*
 * Extract content from each tts-history file and try to find a matching URL and
 * time for it based on the web page history. For unmatched posts, use the
 * average date of neighboring matched posts
 */

import fs from "node:fs";
import { join } from "node:path";

const directory =
  "/Users/maxpatiiuk/site/git/private-dotfiles/notes/tts-history";
const files = fs
  .readdirSync(directory)
  .filter((file) => file.endsWith(".txt"))
  .map((fileName) => join(directory, fileName));

const allPosts = files.flatMap((file) =>
  fs
    .readFileSync(file)
    .toString()
    .split("\n...\n")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map(part=>[file.split('/').at(-1)?.split('.')[0]??file,part])
);

const history = JSON.parse(fs.readFileSync("history.json").toString())
  .map((r) => ({
    ...r,
    fullTitle: r.title,
    title: r.title.slice(0, 40),
    url: r.url.startsWith('chrome-distiller:') ? new URL(r.url).searchParams.get('url') : r.url,
  }))
  .filter((t) => t.title.length >= 5);

const matched = allPosts//.slice(0,100)
  .map(([tag,post]) => {
    const postTitle = post.split("\n")[0];
    const title = history.find(
      ({ title }) =>
        (postTitle.startsWith(title) || title.startsWith(postTitle)) &&
        (Math.min(title.length, postTitle.length) > 20 ||
          Math.abs(title.length - postTitle.length) < Math.min(title.length, postTitle.length)),
    );
    return [tag,post,title];});

    const inferred = matched.map(([tag,post,title],index)=>{
      const nextClosestTime = matched.slice(index+1).find(r=>r[2])?.[2]?.time;
      const previousClosestTime = matched.slice(0,index+1).findLast(r=>r[2])?.[2]?.time ?? nextClosestTime;
      const time = title?.time ?? (previousClosestTime === undefined ? undefined : Math.round(((nextClosestTime??previousClosestTime)+previousClosestTime)/2));
    return `...\nurl: ${title?.url ?? ''}\ntitle: ${title?.fullTitle??''}\ntime: ${time ??''}\ntag: ${tag}\n${post}\n\n\n`
});
fs.writeFileSync("../matched.txt", inferred.join(''));

// console.log(allPosts.filter(r=>r.length > 200).join('\n\n\n'))

// TODO: find very long titles - likely not titles

// make text hoarder use oldest file date, not newest, to support fixing old files
// try resolving URL for each article, but don't spend too much time
// convert all to .txt (using URLs if possible, and if not, trimmed title) files and make text-hoarder support txt
