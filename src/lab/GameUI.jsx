import { useRef, useState } from 'react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUp, Check, GripVertical, Pause, Play, RotateCcw, ShieldCheck, Trophy, X } from 'lucide-react';
import { LEVELS, MODEL_NOTE, MODEL_RULE } from './model';

export const timeText=seconds=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
export function SimulationBadge({future=false}) {return <span className={`data-badge simulation ${future?'future':''}`}><span/>{future?'FUTURE-SCALE SIMULATION':'SIMULATION'}</span>;}
export function ModelNote(){return <details className="model-note"><summary>How this teaching model works</summary><p>{MODEL_RULE}</p><p>{MODEL_NOTE}</p></details>;}
export function MissionIntro({number,title,tagline,children,onStart,duration,controls}) {return <div className="mission-intro"><div className="mission-orb"><span>{String(number).padStart(2,'0')}</span><i/><i/></div><SimulationBadge future={number===6}/><h2>{title}</h2><p className="mission-tagline">{tagline}</p><div className="mission-brief">{children}</div><div className="mission-spec"><span>{duration}</span><span>{controls||'Mouse · touch · keyboard'}</span><span>Up to {number===0?'3000':'1000'} points</span></div><button className="button primary" onClick={onStart}>Start mission <ArrowRight size={17}/></button><p className="mission-boundary">Frontend only. No hardware commands. No live sensor readings.</p><ModelNote/></div>;}
export function MissionBar({title,seconds,progress,paused,onPause,onReset,children}){return <div className="mission-bar"><div><span className="eyebrow">{title}</span><span className="mission-clock">{timeText(seconds)}</span></div><div className="mission-progress"><div style={{width:`${Math.min(100,Math.max(0,progress))}%`}}/></div><span className="mission-bar-extra">{children}</span><button className="icon-button" aria-label={paused?'Resume mission':'Pause mission'} onClick={onPause}>{paused?<Play size={18}/>:<Pause size={18}/>}</button><button className="icon-button" aria-label="Restart mission" onClick={onReset}><RotateCcw size={17}/></button></div>;}
export function PauseOverlay({paused,onResume}){return paused?<div className="mission-paused"><Pause size={26}/><h3>Mission paused</h3><p>Your simulation clock is stopped.</p><button className="button primary" onClick={onResume}>Resume <Play size={16}/></button></div>:null;}
export function RiskMeter({risk,load}){const level=LEVELS.indexOf(risk);return <div className={`sim-risk ${risk.toLowerCase()}`}><div className="risk-dial" style={{'--dial':`${25*(level+1)}%`}}><ShieldCheck size={26}/></div><div><small>SIMULATED RISK</small><strong>{risk}</strong>{load!==undefined&&<span>Teaching load {load.toFixed(1)}</span>}</div><div className="risk-segments">{LEVELS.map((r,i)=><i key={r} className={i<=level?r.toLowerCase():''}/>)}</div></div>;}
export function ScenarioReadings({scenario}) {return <div className="scenario-readings"><div><small>TEMPERATURE</small><strong>{scenario.temperature}°<span>C</span></strong></div><div><small>HUMIDITY</small><strong>{scenario.humidity}<span>%</span></strong></div><div><small>PERSONA</small><strong className="word-value">{scenario.persona}</strong></div><div><small>ACTIVITY</small><strong className="word-value">{['LOW','MODERATE','HIGH'][scenario.activity]}</strong></div></div>;}
export function Feedback({correct,children}){return <motion.div className={`mission-feedback ${correct?'correct':'incorrect'}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><span>{correct?<Check size={20}/>:<X size={20}/>}</span><div>{children}</div></motion.div>;}
export function RoomScene({temperature=30,fan=false,ventilation=false,blinds=false,moved=false,occupied=true,variant='room'}) {
  return <div className={`room-scene ${variant} ${fan?'fan-active':''} ${ventilation?'window-open':''} ${blinds?'blinds-closed':''} ${moved?'person-moved':''}`} style={{'--heat-opacity':Math.min(.6,Math.max(.04,(temperature-25)/30))}} aria-label={`Simulated room, ${temperature.toFixed(1)} degrees, ${occupied?(moved?'person in cooler area':'person present'):'unoccupied'}`}>
    <div className="room-floor"/><div className="room-wall"/><div className="room-window"><div className="room-sun"/><div className="window-pane"/><div className="window-blind"/><div className="sunbeam"/></div><div className="room-heat"><i/><i/><i/></div><div className="room-table"><span/></div>
    {occupied&&<div className="room-person"><i/><span/><b/></div>}<div className="scene-fan"><div className="fan-cage"><div className="fan-blades"><i/><i/><i/></div></div><span/></div><div className="room-safe-zone">COOL AREA</div><div className="room-thermometer"><span style={{height:`${Math.min(100,Math.max(5,(temperature-20)/30*100))}%`}}/></div><span className="scene-label">SIMULATED ENVIRONMENT</span>
  </div>;
}

function SortableItem({id,label,index,count,onMove,disabled}){
  const controls=useDragControls();
  return <Reorder.Item value={id} dragListener={false} dragControls={controls} className="sortable-action" layout><span className="order-number">{index+1}</span><button type="button" className="drag-grip" disabled={disabled} aria-label={`Drag ${label}`} onPointerDown={e=>{if(!disabled)controls.start(e);}}><GripVertical size={17}/></button><span>{label}</span><div><button aria-label={`Move ${label} up`} disabled={disabled||index===0} onClick={()=>onMove(index,-1)}><ArrowUp size={14}/></button><button aria-label={`Move ${label} down`} disabled={disabled||index===count-1} onClick={()=>onMove(index,1)}><ArrowDown size={14}/></button></div></Reorder.Item>;
}
export function SortableActions({order,setOrder,labels,disabled=false}){
  const move=(index,delta)=>{const next=[...order];[next[index],next[index+delta]]=[next[index+delta],next[index]];setOrder(next);};
  return <Reorder.Group axis="y" values={order} onReorder={values=>{if(!disabled)setOrder(values);}} className="sortable-list">{order.map((id,index)=><SortableItem key={id} id={id} label={labels[id]} index={index} count={order.length} disabled={disabled} onMove={move}/>)}</Reorder.Group>;
}

// Pointer capture supports touch and mouse. Selecting the token and then a
// destination is an equivalent keyboard / tap interaction, not a second mode.
export function DragToken({id,label,onSelect,onDrop,selected,disabled,children}) {
  const start=useRef(null);const [ghost,setGhost]=useState(null);
  function end(e){
    if(!start.current)return;
    const moved=Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>7;
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop-id]');
    if(moved&&target)onDrop(id,target.getAttribute('data-drop-id'));else if(!moved)onSelect(id);
    start.current=null;setGhost(null);
  }
  return <><button className={`drag-token ${selected?'selected':''}`} disabled={disabled} aria-pressed={selected} aria-label={`${label}: drag or select`} onClick={e=>{if(e.detail===0)onSelect(id);}} onPointerDown={e=>{if(disabled)return;start.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(start.current&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>7)setGhost({x:e.clientX,y:e.clientY});}} onPointerUp={end} onPointerCancel={()=>{start.current=null;setGhost(null);}}>{children}<span>{label}</span><GripVertical size={12}/></button>{ghost&&<div className="drag-ghost" style={{left:ghost.x,top:ghost.y}}>{label}</div>}</>;
}

export function GameResult({result,title,unlocked,badges,onRetry,onClose,onExplore,isJudge}){
  return <motion.div className="game-result" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}><div className="result-emblem"><Trophy size={34}/><span/></div><SimulationBadge future={title==='Heatwave Commander'}/><span className="eyebrow">{isJudge?'JUDGE SCORE':result.completed?'MISSION COMPLETE':'MISSION DEBRIEF'}</span><h2>{title}</h2><div className="final-score">{result.score}<span>/ {isJudge?3000:1000}</span></div><p>{result.message||'Your strongest score is saved on this browser.'}</p><dl className="result-stats">{result.stats?.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{unlocked.length>0&&<div className="badge-unlocks" aria-live="polite">{unlocked.map(id=><motion.div key={id} initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}}><ShieldCheck size={18}/><span>BADGE UNLOCKED<strong>{badges.find(b=>b.id===id)?.name}</strong></span></motion.div>)}</div>}<div className="result-actions"><button className="button primary" onClick={onRetry}>Try again <RotateCcw size={16}/></button><button className="button outline" onClick={isJudge?onExplore:onClose}>{isJudge?'Explore full HeatSense Lab':'Return to mission control'}<ArrowRight size={16}/></button></div></motion.div>;
}
