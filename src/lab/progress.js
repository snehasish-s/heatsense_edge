export const PROGRESS_KEY = 'heatsense-lab-v1';
export const GAME_IDS = ['predictor','cooling','persona','detective','router','commander'];
export const BADGES = [
  {id:'first',name:'First signal',description:'Complete your first mission.'},
  {id:'reader',name:'Risk reader',description:'Make 5 correct predictions in one mission.'},
  {id:'sleuth',name:'Sensor sleuth',description:'Diagnose all 5 sensor faults correctly.'},
  {id:'strategist',name:'Cooling strategist',description:'Complete cooling with more than 30 energy credits.'},
  {id:'architect',name:'System architect',description:'Complete Signal Router without a mistake.'},
  {id:'guardian',name:'HeatSense guardian',description:'Complete Heatwave Commander.'},
  {id:'master',name:'Master of the edge',description:'Complete all six missions.'},
];
export const emptyProgress = () => ({version:1,games:{},badges:[],judgeBest:0,sound:false});
const integer=(v,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.round(v))):0;
export function sanitizeProgress(raw) {
  const clean=emptyProgress();
  if(!raw || raw.version!==1) return clean;
  for(const id of GAME_IDS){const game=raw.games?.[id];if(game&&typeof game==='object')clean.games[id]={best:integer(game.best,1000),bestTime:typeof game.bestTime==='number'&&Number.isFinite(game.bestTime)&&game.bestTime>=0?integer(game.bestTime,86400):null,completed:game.completed===true,attempts:integer(game.attempts,100000)};}
  clean.badges=Array.isArray(raw.badges)?[...new Set(raw.badges.filter(id=>BADGES.some(b=>b.id===id)))]:[];
  clean.judgeBest=integer(raw.judgeBest,3000);clean.sound=raw.sound===true;return clean;
}
export function readProgress(storage) {try{return sanitizeProgress(JSON.parse(storage.getItem(PROGRESS_KEY)));}catch{return emptyProgress();}}
export const totalScore=progress=>GAME_IDS.reduce((n,id)=>n+(progress.games[id]?.best||0),0);
export function rankFor(score) {return score>=5500?'HeatSense Master':score>=4000?'HeatSense Guardian':score>=2500?'HeatSense Engineer':score>=1000?'HeatSense Explorer':'HeatSense Rookie';}
export function recordResult(previous,id,result) {
  const progress=sanitizeProgress(previous);
  if(id==='judge'){progress.judgeBest=Math.max(progress.judgeBest,integer(result.score,3000));return {progress,unlocked:[]};}
  if(!GAME_IDS.includes(id))return {progress,unlocked:[]};
  const old=progress.games[id]||{best:0,bestTime:null,completed:false,attempts:0};
  const seconds=integer(result.seconds,86400);
  progress.games[id]={best:Math.max(old.best,integer(result.score,1000)),bestTime:result.completed?(old.bestTime===null?seconds:Math.min(old.bestTime,seconds)):old.bestTime,completed:old.completed||result.completed===true,attempts:old.attempts+1};
  const earned=[];
  if(result.completed)earned.push('first');
  if(id==='predictor'&&result.correct>=5)earned.push('reader');
  if(id==='detective'&&result.correct===5)earned.push('sleuth');
  if(id==='cooling'&&result.completed&&result.energy>30)earned.push('strategist');
  if(id==='router'&&result.completed&&result.mistakes===0)earned.push('architect');
  if(id==='commander'&&result.completed)earned.push('guardian');
  if(GAME_IDS.every(key=>progress.games[key]?.completed))earned.push('master');
  const unlocked=earned.filter(key=>!progress.badges.includes(key));progress.badges=[...progress.badges,...unlocked];
  return {progress,unlocked};
}
