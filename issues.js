/* Pure checks over page-rendered ranges; no network or annotation edits. */
(() => {
  'use strict';
  if(globalThis.ESNIssues)return;
  function inspect(items,mode='inclusive') {
    const blanks=[],unavailable=[];
    for(let i=0;i<items.length;i++) {
      const texts=items[i].elements.map(el=>el.querySelector('[data-testid="vla-range-text"]')).filter(Boolean);
      if(!texts.length) unavailable.push(i);
      else if(texts.every(el=>!el.textContent.replace(/[\s\u200B-\u200D\uFEFF]/g,''))) blanks.push(i);
    }
    const ordered=items.map((item,i)=>({item,i})).sort((a,b)=>a.item.start-b.item.start||a.item.end-b.item.end);
    const gaps=[];let covered=null;
    for(const next of ordered) {
      if(covered) {
        const discrete=mode==='inclusive' && Number.isInteger(covered.item.end) && Number.isInteger(next.item.start);
        const padding=discrete?1:0;
        if(next.item.start>covered.item.end+padding) gaps.push({before:covered.i,after:next.i,
          start:covered.item.end+padding,end:next.item.start-padding,
          size:next.item.start-covered.item.end-padding,mode:discrete?'inclusive':'exclusive'});
      }
      if(!covered||next.item.end>covered.item.end)covered=next;
    }
    return {blanks,gaps,unavailable};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={inspect};
  else globalThis.ESNIssues={inspect};
})();
