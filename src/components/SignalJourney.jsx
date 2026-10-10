import { useEffect, useState } from 'react';
import { ArrowRight, Braces, Cable, Cpu, Monitor, Play, Radio, RotateCcw, UserRound } from 'lucide-react';
import { SimulationBadge } from '../lab/GameUI';
const steps=[
  ['Person enters',UserRound,'A person walks into the room. This is a browser-only playback, separate from the real PIR.'],
  ['PIR detects',Radio,'The PIR produces a motion signal. Occupancy is inferred by the firmware’s handling of that signal.'],
  ['STM32 receives',Cpu,'The MCU samples the input and updates the occupancy state.'],
  ['State changes',Cpu,'The state becomes OCCUPIED in this illustration. Real dashboard changes only come from GET /api/status.'],
  ['Arduino Bridge',Cable,'The MCU communicates state to Linux over the Arduino Bridge.'],
  ['Python',Braces,'The Python service reads the shared hardware state.'],
  ['FastAPI',Braces,'GET /api/status exposes occupancy, persona, risk and bridge_connected as JSON.'],
  ['React dashboard',Monitor,'The single frontend poller receives the response and React updates the view without a page refresh.'],
];
export default function SignalJourney(){
  const [step,setStep]=useState(-1),[running,setRunning]=useState(false),[inspect,setInspect]=useState(0);
  useEffect(()=>{if(!running)return;const timer=setInterval(()=>setStep(value=>Math.min(7,value+1)),850);return()=>clearInterval(timer);},[running]);
  useEffect(()=>{if(step>=0)setInspect(step);if(step===7)setRunning(false);},[step]);
  const Icon=steps[inspect][1];
  function start(){setStep(0);setInspect(0);setRunning(true);}
  return <section id="how-it-works" className="signal-journey section-wrap"><div className="section-intro"><div><span className="eyebrow">FOLLOW ONE SIGNAL</span><h2>A person enters.<br/>A system understands.</h2></div><div className="journey-start"><SimulationBadge/><button className="button primary" onClick={start} disabled={running}>{step===7?<RotateCcw size={16}/>:<Play size={16}/>}Person walks into room</button></div></div><div className="signal-track">{steps.map(([title,StepIcon],i)=><div key={title} className={`signal-stop ${step>=i?'reached':''} ${inspect===i?'selected':''}`}><button aria-pressed={inspect===i} onClick={()=>setInspect(i)}><span className="signal-node"><StepIcon size={24}/>{step===i&&running&&<i/>}</span><small>0{i+1}</small><strong>{title}</strong></button>{i<7&&<span className="signal-connector"><i/></span>}</div>)}</div><div className="signal-detail" aria-live="polite"><Icon size={23}/><div><span className="eyebrow">STEP {inspect+1} / 8</span><h3>{steps[inspect][0]}</h3><p>{steps[inspect][2]}</p></div><div className={`signal-result ${step===7?'complete':''}`}><span>SIMULATION OUTPUT</span><strong>{step===7?'OCCUPANCY: OCCUPIED':'AWAITING SIGNAL'}</strong><small>Never copied into the live dashboard</small></div></div></section>;
}
