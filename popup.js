'use strict';
const $ = id => document.getElementById(id);
let tabId = null;
let busy = false;
const allow = url => /^https:\/\/([a-z0-9-]+\.)?encord\.com\//i.test(url || '');
function showError(err) {
  const raw = err && (err.message || String(err)) || 'Unknown error';
  $('connection').textContent = 'Not connected';
  $('connection').classList.add('error');
  $('count').textContent = '—';
  $('status').textContent = raw + '  Check Chrome → Extensions → Encord Segment Numbers → Site access. Allow access to app.encord.com, then reconnect.';
}
function show(state) {
  $('connection').textContent = 'Connected to Encord';
  $('connection').classList.remove('error');
  $('count').textContent = String(state.count ?? 0);
  $('status').textContent = state.reason || 'Connected, scanning timeline';
  $('enabled').checked = !!state.enabled;
  $('compact').checked = !!state.compact;

}
async function script(options) {
  try {
    return await chrome.scripting.executeScript({target:{tabId,allFrames:true},...options});
  } catch (originalError) {
    // Some tabs embed cross-origin frames that aren't accessible to this extension.
    try {
      return await chrome.scripting.executeScript({target:{tabId},...options});
    } catch { throw originalError; }
  }
}
async function css() {
  try {
    await chrome.scripting.insertCSS({target:{tabId,allFrames:true},files:['overlay.css']});
  } catch (originalError) {
    try {await chrome.scripting.insertCSS({target:{tabId},files:['overlay.css']});}
    catch { throw originalError; }
  }
}
// Use direct injection instead of tabs.sendMessage: this also repairs already-open tabs
// when the automatic content script did not start after installation or site changes.
async function connect() {
  const tabs = await chrome.tabs.query({active:true,currentWindow:true});
  const tab = tabs?.[0];
  if (tab?.id == null) throw new Error('No active browser tab found.');
  if (tab.url && !allow(tab.url)) throw new Error('Open an https://app.encord.com label-editor task, then click Connect.');
  tabId = tab.id;
  await css();
  await script({files:['content.js']});
  return state('ESN_REFRESH');
}
async function state(type, settings = {}) {
  if (tabId === null) return connect();
  const frames = await script({func: ({type,settings}) => {
    const app = window.__ESN_V042__;
    if (!app) return null;
    return app.command({type,settings});
  },args:[{type,settings}]});
  const results = frames.map(f => f.result).filter(Boolean);
  if (!results.length) throw new Error('The page script was not injected. Try Connect to this Encord tab.');
  results.sort((a,b) => (b.count||0)-(a.count||0) || (b.hasTrack?1:0)-(a.hasTrack?1:0));
  return results[0];
}
async function action(fn) {
  if (busy) return;
  busy = true;
  try {show(await fn());} catch (err) {showError(err);} finally {busy = false;}
}
$('connect').addEventListener('click',()=>action(connect));
$('refresh').addEventListener('click',()=>action(()=>state('ESN_REFRESH')));
$('enabled').addEventListener('change',()=>action(()=>state('ESN_CONFIG',{enabled:$('enabled').checked})));
$('compact').addEventListener('change',()=>action(()=>state('ESN_CONFIG',{compact:$('compact').checked})));
action(connect);
