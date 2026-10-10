import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, BellRing, BrainCircuit, Check, Cpu, Fan, Lightbulb, Monitor, Radio, ShieldCheck, Sparkles, Thermometer, UserRound, Waves, WifiOff } from 'lucide-react';
import InteractiveUnoQ from './InteractiveUnoQ';

gsap.registerPlugin(ScrollTrigger);
const stages = [
  { tag:'THE HARDWARE', title:<>Small board.<br/>Big possibilities.</>, text:'Meet the brain of HeatSense Edge. Arduino UNO Q brings real-time hardware control and Linux computing together, so sensing, decisions and communication can happen locally.', detail:'MCU ↔ Linux · Arduino Bridge', status:'Prototype', icon:Cpu },
  { tag:'SENSE THE ROOM', title:<>Every signal tells<br/>part of the story.</>, text:'Temperature is only the beginning. A connected sensor network is being integrated to understand humidity, radiant heat, light, movement and airflow.', detail:'PIR is active in the prototype. Environmental sensors are integrating.', status:'Integrating', icon:Thermometer },
  { tag:'UNDERSTAND THE PERSON', title:<>Same room.<br/>Different needs.</>, text:'One environment can affect different people differently. PIR detects occupancy; a physical button selects a persona to add context to the experience.', detail:'General · Worker · Elderly · Child', status:'Prototype', icon:UserRound },
  { tag:'DECIDE AT THE EDGE', title:<>Safety needs logic.<br/>Not a conversation.</>, text:'The target design uses a deterministic, local risk engine to evaluate heat conditions. AI explains the result; it never makes safety decisions or controls outputs.', detail:'Current prototype: manual risk simulation. Automatic evaluation is under development.', status:'In development', icon:ShieldCheck },
  { tag:'TURN INSIGHT INTO ACTION', title:<>A local response.<br/>When it matters.</>, text:'The prototype demonstrates risk states with an OLED, a green LED and an active buzzer. Automatic 12V fan actuation is planned as the next local response.', detail:'LOCAL / OFFLINE / RESILIENT', status:'Prototype + planned', icon:Fan },
  { tag:'LOOK A LITTLE AHEAD', title:<>Understand now.<br/>Anticipate next.</>, text:'HeatSense aims to understand not only how hot the room is now, but where conditions are heading. Future edge models will learn from sensor history.', detail:'Prediction is planned. This illustration is not a measured forecast.', status:'Planned', icon:Activity },
  { tag:'MAKE THE DATA HUMAN', title:<>Complex conditions.<br/>Clear explanations.</>, text:'An assistant is planned to explain room conditions in English, Hindi and Odia. Ollama will support local conversation; cloud AI will be an optional enhancement.', detail:'Core safety decisions remain local in either mode.', status:'Planned', icon:Sparkles },
];

function StageVisual({ stage }) {
  if (stage === 0) return <div className="dual-compute"><div><Cpu size={16}/><b>REAL-TIME MCU</b><p>Sampling · GPIO · OLED<br/>Buzzer · fan control*</p></div><span className="bridge-label">↔<small>ARDUINO BRIDGE</small></span><div><BrainCircuit size={16}/><b>LINUX / AI</b><p>Python · FastAPI<br/>Edge AI · Ollama*</p></div><small className="visual-footnote">* Fan control and AI are planned</small></div>;
  if (stage === 1) return <div className="sensor-cluster">{[['BME688','Temperature / humidity','Integrating',Thermometer],['DS18B20','Radiant temperature','Integrating',Thermometer],['BH1750','Light / solar proxy','Integrating',Lightbulb],['PIR','Occupancy detection','Prototype',Radio],['MPU6050','Activity sensing','Integrating',Activity],['Hall sensor','Airflow measurement','Planned',Waves]].map(([name,desc,status,Icon],i)=><motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*.13}} className="sensor-chip" key={name}><Icon size={15}/><span><b>{name}</b><small>{desc}</small></span><i className={status==='Prototype'?'mint':''}>{status}</i></motion.div>)}</div>;
  if (stage === 2) return <div className="occupancy-visual"><div className="motion-event"><Radio size={18}/><span>Motion detected <ArrowRight size={13}/> Occupancy: YES</span><small>ILLUSTRATIVE</small></div><div className="story-personas">{['General','Worker','Elderly','Child'].map(name=><div key={name} className={name==='Worker'?'selected':''}><UserRound size={20}/>{name}{name==='Worker'&&<Check size={12}/>}</div>)}</div></div>;
  if (stage === 3) return <div className="engine-visual"><div className="engine-inputs">Temperature <span>+</span> Humidity <span>+</span> Radiant heat <span>+</span> Activity <span>+</span> Persona</div><ArrowDown size={18}/><div className="engine-core"><ShieldCheck size={20}/> LOCAL RISK ENGINE</div><div className="risk-scale">{['SAFE','MEDIUM','HIGH','EXTREME'].map(r=><span className={r.toLowerCase()} key={r}>{r}</span>)}</div></div>;
  if (stage === 4) return <div className="outputs-visual"><div className="oled-display"><span>HEATSENSE / EXAMPLE</span><b>HIGH HEAT RISK</b><small>LOCAL RESPONSE</small></div><div className="output-items"><span><Lightbulb/><small>Green LED<br/><b>Prototype</b></small></span><span><BellRing/><small>Buzzer<br/><b>Prototype</b></small></span><span><Fan className="fan-spin"/><small>12V fan<br/><b>Planned</b></small></span></div></div>;
  if (stage === 5) return <div className="forecast-visual"><div><span>ILLUSTRATIVE FORECAST</span><span className="pill">PLANNED</span></div><svg viewBox="0 0 420 100" aria-label="Illustrative rising temperature forecast, not live data"><path d="M0 85H420M0 45H420M0 5H420" stroke="#ffffff12" fill="none"/><path d="M0 78C35 75 45 86 70 65S125 80 155 54 190 64 218 42" stroke="#91dfc4" fill="none" strokeWidth="2"/><path d="M218 42C260 48 290 28 325 25S390 15 418 6" stroke="#e6b271" fill="none" strokeWidth="2" strokeDasharray="5 5"/><circle cx="218" cy="42" r="4" fill="#91dfc4"/></svg><div><span>NOW <b>34.8°C</b></span><ArrowRight size={17}/><span>+1 HOUR <b>36.2°C</b></span></div></div>;
  return <div className="assistant-visual"><div className="example-label">CONVERSATION CONCEPT · PLANNED</div><p className="example-question">Why is the room unsafe?</p><p className="example-answer"><Sparkles size={15}/>The current heat-risk level is high. Temperature and humidity are elevated, and cooling action is recommended.</p><div className="ai-paths"><span><WifiOff size={14}/> OFFLINE / Ollama</span><span>ONLINE / Cloud AI</span></div></div>;
}

export default function UnoQExperience({ connected }) {
  const root = useRef(null);
  const [stage, setStage] = useState(0);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
      const canvas = root.current.querySelector('.story-canvas');
      const board = root.current.querySelector('.story-board');
      const timeline = gsap.timeline({ scrollTrigger: { trigger:root.current, start:'top 95px', end:'bottom bottom', pin:canvas, pinSpacing:false, scrub:1.5, invalidateOnRefresh:true } });
      timeline.fromTo(board, { rotateY:-12, rotateX:18, rotateZ:-8, scale:.96 }, { rotateY:12, rotateX:8, rotateZ:7, scale:1.06, duration:3 }).to(board, { rotateY:-4, rotateX:15, rotateZ:-3, scale:1, duration:3 }).to(board, { scale:.72, y:-35, duration:.7 });
      return () => timeline.kill();
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry=> { if(entry.isIntersecting) setStage(Number(entry.target.dataset.stage)); }), {rootMargin:'-25% 0px -35% 0px'});
    root.current.querySelectorAll('.story-stage').forEach(el=>observer.observe(el));
    return () => { mm.revert(); observer.disconnect(); };
  }, []);
  return <>
    <section id="experience" className="experience section-wrap">
      <div className="section-intro"><div><div className="eyebrow">THE SYSTEM, UNFOLDED</div><h2>From a signal.<br/>To something meaningful.</h2></div><p>Follow the journey from the room<br/>to the person inside it.</p></div>
      <div className="story-body" ref={root}>
        <div className="story-canvas"><div className="canvas-label"><span>ARDUINO UNO Q</span><span>0{stage+1} / 07</span></div><div className="story-orbit"/><div className="story-board"><InteractiveUnoQ active={stage<5?'mcu':'linux'} xray={stage>=1&&stage<=4}/></div><AnimatePresence mode="wait"><motion.div className="stage-visual" key={stage} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.3}}><StageVisual stage={stage}/></motion.div></AnimatePresence><div className="story-progress">{stages.map((s,i)=><a key={s.tag} href={`#stage-${i}`} aria-label={`Stage ${i+1}: ${s.tag}`} className={i===stage?'active':''}/>)}</div></div>
        <div className="story-copy">{stages.map(({tag,title,text,detail,status,icon:Icon},i)=><article id={`stage-${i}`} data-stage={i} key={tag} className={`story-stage ${stage===i?'current':''}`}><span className="stage-number">0{i+1}<span> / 07</span></span><div className="eyebrow"><Icon size={14}/>{tag}</div><h3>{title}</h3><p>{text}</p><div className="stage-detail">{detail}</div><span className={`status-label ${status==='Prototype'?'mint':''}`}><span className="tiny-dot"/>{status}</span><div className="mobile-stage-visual"><StageVisual stage={i}/></div></article>)}</div>
      </div>
    </section>
    <section className="enter-section"><div className="enter-device"><Cpu size={23}/><span className={`tiny-dot ${connected?'online':''}`}/></div><div className="eyebrow">THE STORY BECOMES THE SYSTEM</div><h2>Enter HeatSense<span>.</span></h2><p>Your room. Your hardware. One clear view.</p><a className="button primary" href="#live">Open the control room <ArrowUpRight size={17}/></a><span className="enter-status">{connected?'Hardware connected':'Ready to connect to your UNO Q'}</span></section>
  </>;
}
