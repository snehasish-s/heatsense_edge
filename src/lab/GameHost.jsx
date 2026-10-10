import { Component, lazy, Suspense, useCallback, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLab } from './LabContext';
import { GAMES } from './catalog';
import { BADGES } from './progress';
import { GameResult } from './GameUI';
const games={
  predictor:lazy(()=>import('./games/RiskPredictor')),
  cooling:lazy(()=>import('./games/CoolTheRoom')),
  persona:lazy(()=>import('./games/PersonaProtector')),
  detective:lazy(()=>import('./games/SensorDetective')),
  router:lazy(()=>import('./games/SignalRouter')),
  commander:lazy(()=>import('./games/HeatwaveCommander')),
  judge:lazy(()=>import('./games/JudgeChallenge')),
};
class MissionBoundary extends Component{
  state={error:false};static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<div className="mission-load-error"><h2>This mission could not load.</h2><p>Your saved scores and live dashboard are unaffected. If this is your first visit, reconnect long enough to load the app files.</p><button className="button primary" onClick={this.props.onReset}>Try again</button></div>:this.props.children;}
}
export default function GameHost({id,onClose,onExplore}) {
  const {progress,report,toggleSound,sound,storageNotice}=useLab();
  const [attempt,setAttempt]=useState(0),[result,setResult]=useState(null),[unlocked,setUnlocked]=useState([]);
  const title=id==='judge'?'Judge Challenge':GAMES.find(game=>game.id===id)?.title;
  const finish=useCallback(value=>{const clean={...value,score:Math.max(0,Math.min(id==='judge'?3000:1000,Math.round(value.score)))};setUnlocked(report(id,clean));setResult(clean);sound('success');},[id,report,sound]);
  const reset=()=>{setResult(null);setUnlocked([]);setAttempt(n=>n+1);};
  const Game=games[id];
  return <><div className="lab-session-toolbar"><span><i/> FRONTEND ONLY / HARDWARE IS READ-ONLY</span><button className="sound-toggle" aria-pressed={progress.sound} onClick={toggleSound}>{progress.sound?<Volume2 size={15}/>:<VolumeX size={15}/>}Sound {progress.sound?'on':'off'}</button></div>{storageNotice&&<p className="storage-notice" role="status">{storageNotice}</p>}{result?<GameResult result={result} title={title} badges={BADGES} unlocked={unlocked} onRetry={reset} onClose={onClose} onExplore={onExplore} isJudge={id==='judge'}/>:<MissionBoundary key={attempt} onReset={reset}><Suspense fallback={<div className="mission-loading" role="status"><span/>Loading mission…</div>}><Game key={`${id}-${attempt}`} onFinish={finish} onReset={reset} sound={sound}/></Suspense></MissionBoundary>}</>;
}
