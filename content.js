/* Read-only DOM overlay. Exact selectors supplied from the user's Encord editor. */
(() => {
  'use strict';
  if (window.__ESN_V043__) { window.__ESN_V043__.refresh(); return; }
  const selector = '[data-testid="vla-range-bar"][data-track-id="detailed"]';
  let prefs = {enabled:true, compact:true, highlights:true, endMode:"inclusive"}, timer, layer, previousURL = location.href;
  let result = {count:0, visible:0, reason:'Scanning exact Detailed Caption bars…'};
  function collect() {
    const groups = new Map();
    let invalid = 0;
    for (const el of document.querySelectorAll(selector)) {
      const a = el.getAttribute('data-range-start'), b = el.getAttribute('data-range-end');
      const start = Number(a), end = Number(b);
      if (a === null || b === null || !a.trim() || !b.trim() || !Number.isFinite(start) || !Number.isFinite(end) || end < start) {invalid++; continue;}
      // Hidden duplicate tracks must not contribute to the count. Off-screen bars do.
      if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
      const hash = el.getAttribute('data-classification-hash') || '';
      const key = JSON.stringify([hash,start,end]);
      if (!groups.has(key)) groups.set(key,{start,end,hash,elements:[]});
      groups.get(key).elements.push(el);
    }
    return {items:[...groups.values()].sort((a,b)=>a.start-b.start || a.end-b.end || a.hash.localeCompare(b.hash)),invalid};
  }
  function visibleRect(el) {
    const r = el.getBoundingClientRect();
    let left=Math.max(0,r.left),right=Math.min(innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);
    for(let p=el.parentElement;p && p!==document.documentElement;p=p.parentElement) {
      const s=getComputedStyle(p), pr=p.getBoundingClientRect();
      if (/hidden|clip|auto|scroll/.test(s.overflowX)) {left=Math.max(left,pr.left);right=Math.min(right,pr.right);}
      if (/hidden|clip|auto|scroll/.test(s.overflowY)) {top=Math.max(top,pr.top);bottom=Math.min(bottom,pr.bottom);}
    }
    return right>left && bottom>top ? {left,right,top,bottom} : null;
  }
  // Keep every label on one baseline. Shift crowded labels horizontally only.
  function layoutLabels(entries,width,compact) {
    if(!entries.length) return [];
    const y=Math.max(0,Math.min(...entries.map(e=>e.r.top))-(compact?17:20));
    const labels=entries.map(e=>({x:(e.r.left+e.r.right)/2,y,w:Math.max(compact?14:17,String(e.n).length*(compact?6:7)+6)}));
    const ordered=labels.map((v,i)=>({v,i})).sort((a,b)=>a.v.x-b.v.x || a.i-b.i);
    const total=labels.reduce((sum,v)=>sum+v.w,0)+2*(labels.length-1);
    if(total>width-4) return labels; // Physical space is insufficient; retain exact segment centers.
    let edge=2;
    for(const {v} of ordered) {v.x=Math.max(v.x,edge+v.w/2);edge=v.x+v.w/2+2;}
    edge=width-2;
    for(let i=ordered.length-1;i>=0;i--) {const v=ordered[i].v;v.x=Math.min(v.x,edge-v.w/2);edge=v.x-v.w/2-2;}
    return labels;
  }
  function draw() {
    timer=null;
    if (!document.body) return;
    if(previousURL!==location.href) previousURL=location.href;
    if(!layer?.isConnected) {layer=document.createElement('div');layer.id='esn-v043-overlay';layer.setAttribute('aria-hidden','true');document.body.append(layer);}
    const {items,invalid}=collect();
    const issues=globalThis.ESNIssues.inspect(items,prefs.endMode);
    const blankSet=new Set(issues.blanks);
    const fragment=document.createDocumentFragment();
    const entries=items.map((item,i)=>({item,n:i+1,r:item.elements.map(visibleRect).find(Boolean)})).filter(e=>e.r);
    const positions=layoutLabels(entries,innerWidth,prefs.compact);
    let visible=0;
    if(prefs.enabled) for(let j=0;j<entries.length;j++) {
      const {item,n,r}=entries[j], {x,y,w}=positions[j];
      const anchor=(r.left+r.right)/2;
      if(Math.abs(x-anchor)>1) {
        const line=document.createElement('span');line.className='esn-leader';
        const dx=anchor-x,dy=r.top-(y+13);
        line.style.left=`${x}px`;line.style.top=`${y+13}px`;
        line.style.width=`${Math.hypot(dx,dy)}px`;
        line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
        fragment.append(line);
      }
      const badge=document.createElement('span');
      badge.className='esn-num'+(prefs.compact?' esn-compact':'')+(prefs.highlights&&blankSet.has(n-1)?' esn-blank-num':'');
      badge.textContent=String(n);
      badge.dataset.rangeStart=String(item.start);badge.dataset.rangeEnd=String(item.end);
      badge.style.left=`${x}px`;badge.style.top='0px';
      fragment.append(badge);visible++;
    }
    // A single positioned row controls every badge's vertical position.
    const row=document.createElement('div');row.className='esn-number-row';
    const baseline=positions.length?positions[0].y:0;
    row.style.cssText=`position:absolute;left:0;right:0;top:${baseline}px;height:16px;pointer-events:none`;
    // Connector coordinates were computed relative to the overlay.
    for(const child of [...fragment.childNodes]) {
      if(child.classList.contains('esn-leader')) child.style.top=`${parseFloat(child.style.top)-baseline}px`;
      row.append(child);
    }
    const highlights=document.createDocumentFragment();
    function highlight(r,kind,text) {
      const box=document.createElement('div');box.className='esn-issue '+kind;
      box.style.cssText=`left:${r.left}px;top:${r.top}px;width:${Math.max(1,r.right-r.left)}px;height:${Math.max(1,r.bottom-r.top)}px`;
      box.setAttribute('aria-label',text);highlights.append(box);
    }
    if(prefs.highlights) {
      for(const i of issues.blanks) for(const el of items[i].elements) {
        const r=visibleRect(el);if(r)highlight(r,'esn-blank',`Segment ${i+1}: blank caption`);
      }
      for(const gap of issues.gaps) {
        const before=items[gap.before],after=items[gap.after];
        for(const a of before.elements) for(const b of after.elements) {
          // The empty interval must belong to the same rendered timeline container.
          if(a.parentElement!==b.parentElement)continue;
          const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
          if(Math.abs(ar.top-br.top)>8||br.left<=ar.right)continue;
          const parent=a.parentElement,pr=parent.getBoundingClientRect();
          const vr=visibleRect(parent);if(!vr)continue;
          const r={left:Math.max(ar.right,vr.left),right:Math.min(br.left,vr.right),top:Math.max(ar.top,br.top,vr.top),bottom:Math.min(ar.bottom,br.bottom,vr.bottom)};
          if(r.right>r.left&&r.bottom>r.top)highlight(r,'esn-gap',`Possible gap between segments ${gap.before+1} and ${gap.after+1}; review range ${gap.start}–${gap.end}`);
        }
      }
    }
    layer.replaceChildren(highlights,row);
    result={count:items.length,visible,hasTrack:items.length>0,
      blanks:issues.blanks.map(i=>i+1),gaps:issues.gaps.map(g=>({...g,before:g.before+1,after:g.after+1})),unavailable:issues.unavailable.length,
      reason:(prefs.enabled?'':'Numbering off. ')+(items.length ? `${items.length} unique Detailed Caption ranges in page; ${visible} labels visible. Ordered by start, then end. Total across unrendered ranges is unverified.` : 'No Detailed Caption bars found with the exact selector. Open the timeline and refresh.')+(invalid?` ${invalid} bars have invalid range attributes.`:'')};
  }
  function schedule(delay=60) {if(timer===undefined || timer===null) timer=setTimeout(draw,delay);}
  function status(){return {...prefs,...result,version:'0.4.3',contentActive:true,page:location.hostname};}
  function command(m={}) {
    if(m.type==='ESN_CONFIG') {for(const k of ['enabled','compact','highlights']) if(typeof m.settings?.[k]==='boolean') prefs[k]=m.settings[k];if(['inclusive','exclusive'].includes(m.settings?.endMode))prefs.endMode=m.settings.endMode;chrome.storage.local.set({esnV4Prefs:prefs});}
    if(timer!=null) {clearTimeout(timer);timer=null;}
    draw();return status();
  }
  window.__ESN_V043__={refresh:()=>schedule(0),status,command};
  chrome.runtime.onMessage.addListener((m,s,reply)=>{if(m?.type?.startsWith('ESN_')) reply(command(m));});
  chrome.storage.local.get('esnV4Prefs',v=>{prefs={...prefs,...v.esnV4Prefs};schedule(0);});
  const owned=n=>n===layer || layer?.contains(n);
  new MutationObserver(ms=>{if(ms.some(m=>!owned(m.target) && !(m.type==='childList' && [...m.addedNodes,...m.removedNodes].every(owned)))) schedule();}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-range-start','data-range-end','data-classification-hash','data-track-id','data-testid','style','class','hidden']});
  window.addEventListener('scroll',()=>schedule(0),{capture:true,passive:true});
  window.addEventListener('resize',()=>schedule(0),{passive:true});
  setInterval(()=>schedule(0),1000);
  schedule(0);
})();
