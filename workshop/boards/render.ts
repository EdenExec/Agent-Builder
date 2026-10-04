// One self-contained HTML file: masonry layout, embedded images, attribution on every tile,
// pin / reject with reasons, and an exportable feedback block that `board feedback` turns into memory.
import type { BoardSpec, Tile } from "./types.ts";
import { tokenCss, fontFaceCss, SITE, NAME } from "../brand/eden.ts";

export const esc = (s: string | undefined) =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Only http(s) links are rendered as links; anything else is shown as plain text. */
const safeUrl = (u: string | undefined) => (u && /^https?:\/\//i.test(u) ? esc(u) : undefined);

const shorten = (t: string, n = 90) => (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, "")}…` : t);

function tileHtml(t: Tile, i: number): string {
  const c = t.candidate;
  const src = t.dataUri ?? c.thumbUrl ?? c.imageUrl;
  const page = safeUrl(c.pageUrl);
  const creatorLink = safeUrl(c.creatorUrl);
  const ratio = c.width && c.height ? ` style="aspect-ratio:${c.width}/${c.height}"` : "";
  return `<article class="tile" data-id="${esc(t.id)}" data-query="${esc(t.query)}">
  <button class="img" type="button" data-open="${i}" aria-label="Open ${esc(c.title)}"><img src="${esc(src)}" alt="${esc(c.title)}" loading="lazy"${ratio}></button>
  <div class="body">
    ${t.note.trim() ? `<p class="note">${esc(t.note)}</p>` : ""}
    <p class="credit">${page ? `<a href="${page}" target="_blank" rel="noopener noreferrer">${esc(shorten(c.title))}</a>` : esc(shorten(c.title))}</p>
    <p class="attr">${creatorLink ? `<a href="${creatorLink}" target="_blank" rel="noopener noreferrer">${esc(c.attribution)}</a>` : esc(c.attribution)}${t.dataUri ? "" : " · <em>not embedded</em>"}</p>
    <div class="acts">
      <button type="button" class="pin" data-act="pin" aria-pressed="false">Pin</button>
      <button type="button" class="rej" data-act="reject" aria-pressed="false">Reject</button>
    </div>
    <input class="why" type="text" placeholder="Why? (teaches Marlowe your taste)" aria-label="Reason for ${esc(c.title)}" maxlength="240" hidden>
  </div>
</article>`;
}

/** Standalone file: a complete HTML document. */
export function renderBoard(spec: BoardSpec): string {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${renderBoardFragment(spec)}\n</body></html>\n`;
}

/** Page content only (title, style, markup, script), the form the Artifact tool wraps itself. */
export function renderBoardFragment(spec: BoardSpec): string {
  const queries = [...new Set(spec.tiles.map((t) => t.query))];
  const licences = [...new Set(spec.tiles.map((t) => t.candidate.license))];
  return `<title>${esc(spec.title)}</title>
<style>
${fontFaceCss()}
${tokenCss()}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:400 14px/1.55 var(--font);padding-inline:max(16px,3vw);padding-block:28px 150px}
header{max-width:1200px;margin:0 auto 20px;display:flex;flex-direction:column;gap:6px}
h1{font:700 clamp(1.5rem,4vw,2.2rem)/1.15 var(--font);letter-spacing:-.01em;margin:0;text-wrap:balance}
.org{font-weight:700;letter-spacing:.06em;font-size:.72rem;border-bottom:1px solid var(--ink);padding-bottom:8px;margin:0 0 18px}
.sub{color:var(--mute);margin:0}
.chips{max-width:1200px;margin:0 auto 20px;display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid var(--ink);background:none;color:var(--ink);padding:5px 12px;font:inherit;font-size:13px;cursor:pointer;border-radius:999px}
.chip[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.wall{max-width:1200px;margin:0 auto;columns:3 260px;column-gap:16px}
.tile{break-inside:avoid;margin:0 0 16px;background:var(--card);border:1px solid var(--line);display:flex;flex-direction:column}
.tile[hidden]{display:none}
.tile.pinned{outline:3px solid var(--pos)}
.tile.rejected{opacity:.45}
.img{border:0;padding:0;background:var(--line);cursor:zoom-in;display:block;width:100%}
.img img{display:block;width:100%;height:auto;min-height:80px}
.body{padding:12px;display:flex;flex-direction:column;gap:6px}
.body p{margin:0}
.note{font-weight:700}
.credit,.attr{font-size:12px;color:var(--mute);overflow-wrap:anywhere}
a{color:inherit}
.acts{display:flex;gap:8px;margin-top:2px}
.acts button{flex:1;padding:7px;font:inherit;font-size:13px;border:1px solid var(--line);background:none;color:var(--ink);cursor:pointer}
.acts .pin[aria-pressed="true"]{background:var(--pos);border-color:var(--pos);color:var(--accent-ink)}
.acts .rej[aria-pressed="true"]{background:var(--neg);border-color:var(--neg);color:var(--accent-ink)}
.why{width:100%;padding:7px;font:inherit;font-size:13px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
button:focus-visible,input:focus-visible,textarea:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.dock{position:fixed;inset-inline:0;bottom:0;background:var(--card);border-top:1px solid var(--ink);padding:10px max(16px,3vw) calc(10px + env(safe-area-inset-bottom,0px));display:flex;gap:12px;align-items:center;flex-wrap:wrap;z-index:5}
.dock .count{font-size:13px;color:var(--mute);flex:1;min-width:140px}
.dock button{padding:9px 16px;font:inherit;font-weight:700;border:0;background:var(--accent);color:var(--accent-ink);cursor:pointer}
.dock button.alt{background:none;color:var(--ink);border:1px solid var(--ink)}
dialog{border:1px solid var(--ink);background:var(--card);color:var(--ink);padding:16px;max-width:min(94vw,640px);width:100%}
dialog::backdrop{background:rgba(0,0,0,.55)}
dialog textarea{width:100%;min-height:160px;font:12px/1.4 ui-monospace,monospace;background:var(--bg);color:var(--ink);border:1px solid var(--line);padding:8px}
.chip.send{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:700}
dialog .row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
dialog label{font-size:13px;color:var(--mute);display:block;margin-bottom:4px}
dialog input.cm{width:100%;padding:8px;font:inherit;border:1px solid var(--line);background:var(--bg);color:var(--ink);margin-bottom:10px}
#lb img{width:100%;height:auto;display:block;max-height:78vh;object-fit:contain}
.foot{max-width:1200px;margin:28px auto 0;color:var(--mute);font-size:12px}
.foot.brand{display:flex;justify-content:space-between;margin-top:10px;border-top:1px solid var(--line);padding-top:12px;font-size:11px}
@media (prefers-reduced-motion:no-preference){.tile{transition:opacity .2s}}
</style>
<div id="board" data-slug="${esc(spec.slug)}">
<header>
  <p class="org">${NAME}</p>
  <h1>${esc(spec.title)}</h1>
  <p class="sub">${esc(spec.theme)}${spec.project ? ` · ${esc(spec.project)}` : ""} · ${spec.tiles.length} images · ${spec.audience === "public" ? "public-facing, commercially cleared" : "family"}</p>
</header>
<nav class="chips" aria-label="Filter by search">
  <button class="chip" type="button" data-q="" aria-pressed="true">All</button>
  ${queries.map((q) => `<button class="chip" type="button" data-q="${esc(q)}" aria-pressed="false">${esc(q)}</button>`).join("\n  ")}
</nav>
<main class="wall">
${spec.tiles.map(tileHtml).join("\n")}
</main>
<p class="foot">Images remain the property of their creators. Licences on this board: ${licences.map(esc).join(", ") || "none"}. Created ${esc(spec.createdAt.slice(0, 10))}.</p>
<p class="foot brand"><span>${SITE}</span><span>${NAME}</span></p>
<div class="dock"><span class="count" id="count">No pins or rejections yet</span><button class="alt" type="button" id="reset">Clear</button><button type="button" id="export">Send feedback to Marlowe</button></div>
<dialog id="lb"><img alt=""><p class="credit" id="lbc"></p><div class="row"><button class="chip" type="button" id="lbx">Close</button></div></dialog>
<dialog id="fb"><label for="fbc">Anything else about this board?</label><input class="cm" id="fbc" type="text" maxlength="400" placeholder="Optional comment">
<label for="fbt" id="fblab">Copy this and paste it to Marlowe</label><textarea id="fbt" readonly></textarea>
<div class="row"><button class="chip send" type="button" id="fbsend" hidden>Send to Marlowe</button><button class="chip" type="button" id="fbcopy">Copy instead</button><button class="chip" type="button" id="fbx">Close</button></div><p class="credit" id="fbmsg" role="status"></p></dialog>
<script>
(function(){
var slug=document.getElementById("board").dataset.slug,KEY="board:"+slug,state={};
try{state=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
var tiles=[].slice.call(document.querySelectorAll(".tile"));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function paint(){
  var p=0,r=0;
  tiles.forEach(function(t){var s=state[t.dataset.id]||{},pin=s.d==="pin",rej=s.d==="reject";
    t.classList.toggle("pinned",pin);t.classList.toggle("rejected",rej);
    t.querySelector(".pin").setAttribute("aria-pressed",pin);t.querySelector(".rej").setAttribute("aria-pressed",rej);
    var w=t.querySelector(".why");w.hidden=!(pin||rej);if(document.activeElement!==w)w.value=s.r||"";
    if(pin)p++;if(rej)r++;});
  document.getElementById("count").textContent=(p||r)?p+" pinned, "+r+" rejected":"No pins or rejections yet";
}
tiles.forEach(function(t,i){
  var id=t.dataset.id;
  t.addEventListener("click",function(e){var a=e.target.closest("[data-act]");if(!a)return;
    var d=a.dataset.act,s=state[id]||{};
    if(s.d===d){delete state[id]}else{state[id]={d:d,r:s.r||""}}
    save();paint();var w=t.querySelector(".why");if(!w.hidden)w.focus();});
  t.querySelector(".why").addEventListener("input",function(e){if(state[id]){state[id].r=e.target.value;save()}});
  t.querySelector(".img").addEventListener("click",function(){
    var lb=document.getElementById("lb"),im=t.querySelector("img");
    lb.querySelector("img").src=im.src;lb.querySelector("img").alt=im.alt;
    document.getElementById("lbc").textContent=t.querySelector(".attr").textContent;
    if(lb.showModal)lb.showModal();});
});
document.getElementById("lbx").onclick=function(){document.getElementById("lb").close()};
[].forEach.call(document.querySelectorAll(".chip[data-q]"),function(c){c.addEventListener("click",function(){
  [].forEach.call(document.querySelectorAll(".chip[data-q]"),function(x){x.setAttribute("aria-pressed",x===c)});
  tiles.forEach(function(t){t.hidden=c.dataset.q!==""&&t.dataset.query!==c.dataset.q});});});
document.getElementById("reset").onclick=function(){state={};save();paint()};
function build(){var o={board:slug,pins:[],rejects:[]};
  Object.keys(state).forEach(function(id){var s=state[id],e={id:id};if(s.r)e.reason=s.r;(s.d==="pin"?o.pins:o.rejects).push(e)});
  var c=document.getElementById("fbc").value.trim();if(c)o.comment=c;return JSON.stringify(o,null,2)}
var fb=document.getElementById("fb"),ta=document.getElementById("fbt");
document.getElementById("export").onclick=function(){ta.value=build();document.getElementById("fbmsg").textContent="";if(fb.showModal)fb.showModal()};
document.getElementById("fbc").addEventListener("input",function(){ta.value=build()});
document.getElementById("fbx").onclick=function(){fb.close()};
document.getElementById("fbcopy").onclick=function(){var m=document.getElementById("fbmsg");
  function fallback(){ta.focus();ta.select();m.textContent="Selected. Press copy on your keyboard."}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){m.textContent="Copied."},fallback)}else fallback()};
var db=null,sendBtn=document.getElementById("fbsend");
if(window.claude&&window.claude.use){window.claude.use("db").then(function(d){if(!d)return;db=d;sendBtn.hidden=false;
  document.getElementById("fblab").textContent="This goes straight to Marlowe. You can also copy it.";
  document.getElementById("fbcopy").textContent="Copy instead";},function(){})}
sendBtn.onclick=function(){var m=document.getElementById("fbmsg");if(!db)return;
  var o=JSON.parse(build());o.status="new";o.createdAt=new Date().toISOString();
  if(!o.pins.length&&!o.rejects.length&&!o.comment){m.textContent="Pin or reject something first, or add a comment.";return}
  sendBtn.disabled=true;
  db.collection("feedback").doc(slug+"-"+Date.now()).set(o).then(function(){m.textContent="Sent. Marlowe has it. You can close this page.";},
    function(){sendBtn.disabled=false;m.textContent="That did not send. Use Copy instead.";});};
paint();
})();
</script>
</div>`;
}
