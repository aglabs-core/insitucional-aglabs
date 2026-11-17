/** Public channel feed -> cached metadata. No API key or browser player. */
import {writeFileSync,existsSync,readFileSync} from 'node:fs';
const out=new URL('../src/content/blog-videos.json',import.meta.url);
const channel='https://www.youtube.com/@aglabs-g2n2h/shorts';
try {
 const response=await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UCRKuFSwnii7yBCmirM4P9-w',{signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Feed unavailable');
 const xml=await response.text();
 const ids=[...new Set([...xml.matchAll(/<yt:videoId>([\w-]{11})<\/yt:videoId>/g)].map(m=>m[1]))].slice(0,4);
 if(!ids.length)throw Error('Empty feed');
 const videos=await Promise.all(ids.map(async id=>{
  const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(`https://www.youtube.com/watch?v=${id}`),{signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error('Metadata unavailable');const d=await r.json();
  if(!d.author_url?.includes('UCRKuFSwnii7yBCmirM4P9-w')&&d.author_name!=='AG LABS')throw Error('Unexpected owner');
  return {id,title:d.title,url:`https://www.youtube.com/watch?v=${id}`,thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`};
 }));
 writeFileSync(out,JSON.stringify({channel,checkedAt:new Date().toISOString().slice(0,10),videos},null,2)+'\n');
 console.log(`[youtube] ${videos.length} vídeos sincronizados.`);
} catch {
 const cache=existsSync(out)&&JSON.parse(readFileSync(out,'utf8'))?.videos?.length;
 if(!cache)throw Error('YouTube unavailable and no saved video metadata');
 console.warn('[youtube] Feed indisponível; mantendo a seleção verificada anterior.');
}
