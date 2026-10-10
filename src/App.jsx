import { Component, lazy, Suspense, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ArrowUpRight, ScanLine, Trophy } from 'lucide-react';
import { LanguageProvider } from './i18n';
import { useDevice } from './hooks/useDevice';
import { LabProvider } from './lab/LabContext';
import { GAMES } from './lab/catalog';
import Navbar, { Logo } from './components/Navbar';
import Hero from './components/Hero';
import UnoQExperience from './components/UnoQExperience';
import Dashboard from './components/Dashboard';
import SystemArchitecture from './components/SystemArchitecture';
import CinematicIntro, { shouldPlayIntro } from './components/CinematicIntro';
import Modal from './components/Modal';
import SignalJourney from './components/SignalJourney';
import DeferredSection from './components/DeferredSection';

const PrototypeExplorer=lazy(()=>import('./components/PrototypeExplorer'));
const DemoConsole=lazy(()=>import('./components/DemoConsole'));
const RiskEngineStory=lazy(()=>import('./components/RiskEngineStory'));
const GameHub=lazy(()=>import('./lab/GameHub'));
const GameHost=lazy(()=>import('./lab/GameHost'));
const EngineeringJourney=lazy(()=>import('./components/EngineeringJourney'));
const PrototypeVision=lazy(()=>import('./components/PrototypeVision'));
const loading=<div className="mission-loading" role="status"><span/>Preparing experience…</div>;

class ErrorBoundary extends Component {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<main className="app-error"><h1>Let’s reconnect.</h1><p>The interface encountered an unexpected error.</p><button className="button primary" onClick={()=>window.location.reload()}>Reload HeatSense</button></main>:this.props.children;}
}
function Experience() {
  // The only device poller. Explorers and simulations consume no API endpoints.
  const device=useDevice();
  const connected=device.connection==='connected'&&device.data?.bridge_connected===true;
  const [intro,setIntro]=useState(shouldPlayIntro);
  const [overlay,setOverlay]=useState(null);
  const play=id=>setOverlay({type:'game',id});
  const explore=()=>setOverlay({type:'prototype'});
  const demo=()=>setOverlay({type:'demo'});
  const close=()=>setOverlay(null);
  const exploreLab=()=>{close();window.location.hash='lab';};
  const overlayTitle=overlay?.type==='prototype'?'Explore the prototype':overlay?.type==='demo'?'Demo mode':overlay?.id==='judge'?'60-second Judge Challenge':GAMES.find(game=>game.id===overlay?.id)?.title;
  return <>
    <a className="skip-link" href="#live">Skip to live dashboard</a>
    <Navbar connected={connected} onDemo={demo}/>
    <main>
      <Hero onExplore={explore} onJudge={()=>play('judge')}/>
      <UnoQExperience connected={connected}/>
      <SignalJourney/>
      <DeferredSection id="understand" label="How HeatSense thinks"><Suspense fallback={loading}><RiskEngineStory/></Suspense></DeferredSection>
      <Dashboard device={device} onDemo={demo}/>
      <section id="prototype" className="prototype-invitation section-wrap"><div className="invitation-graphic"><ScanLine size={50} strokeWidth={1}/><span/><i/></div><div><span className="eyebrow">GET CLOSER TO THE HARDWARE</span><h2>Every component<br/>has a part to play.</h2><p>Open the workbench. Inspect ten components, explore board hotspots and switch on X-ray view.</p><button className="button primary" onClick={explore}>Explore the prototype <ArrowUpRight size={17}/></button></div><div className="invitation-spec"><span>10 COMPONENTS</span><span>07 BOARD HOTSPOTS</span><span>01 CONNECTED SYSTEM</span><small>PROTOTYPE / INTEGRATING / PLANNED</small></div></section>
      <SystemArchitecture/>
      <DeferredSection id="lab" label="HeatSense Lab"><Suspense fallback={loading}><GameHub onPlay={play}/></Suspense></DeferredSection>
      <DeferredSection id="engineering" label="How we built it"><Suspense fallback={loading}><EngineeringJourney/></Suspense></DeferredSection>
      <Suspense fallback={loading}><PrototypeVision/></Suspense>
    </main>
    <footer className="footer section-wrap"><div className="footer-top"><div><Logo/><p>Cooler rooms. Safer people. Smarter cities.</p></div><button className="footer-challenge" onClick={()=>play('judge')}><Trophy size={16}/>Take the Judge Challenge</button><a href="#overview" className="back-top">Back to the top <ArrowUpRight size={18}/></a></div><div className="footer-bottom"><span>BUILT BY <strong>TEAM BITBYBIT</strong></span><span>BPUT HACKATHON 2026 <i/> BH26PS02T015</span><span>ENGINEERED WITH PURPOSE.</span></div></footer>
    {intro&&<CinematicIntro onDone={()=>setIntro(false)}/>}
    {overlay&&<Modal title={overlayTitle} label={overlay.type==='prototype'?'HARDWARE EXPLORER':'SIMULATION / FRONTEND ONLY'} onClose={close} className={overlay.type==='game'?'game-modal':''}><Suspense fallback={loading}>{overlay.type==='prototype'?<PrototypeExplorer device={device}/>:overlay.type==='demo'?<div className="standalone-demo"><DemoConsole/><button className="button outline" onClick={close}>Return to the live experience</button></div>:<GameHost key={overlay.id} id={overlay.id} onClose={close} onExplore={exploreLab}/>}</Suspense></Modal>}
  </>;
}
export default function App(){return <ErrorBoundary><LanguageProvider><MotionConfig reducedMotion="user"><LabProvider><Experience/></LabProvider></MotionConfig></LanguageProvider></ErrorBoundary>;}
