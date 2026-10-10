import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BellRing, BrainCircuit, Braces, Cable, Cpu, Layers, Monitor, Radio, ShieldCheck, ScanLine, MessageSquare } from 'lucide-react';
const nodes = {
  context:{label:'System context',sub:'VERIFIED STATE / HISTORY',icon:Layers,status:'Target architecture',description:'Future assistant context should come from validated state and history. Missing data must stay explicitly missing.'},
  explanation:{label:'Explanation',sub:'WORDS / NOT ACTUATION',icon:MessageSquare,status:'Planned',description:'The assistant explains the local result. There is no control path from this explanation layer to a fan, buzzer or safety decision.'},
  sensors:{label:'Sensors',sub:'THE PHYSICAL WORLD',icon:Radio,status:'Prototype + integrating',description:'PIR occupancy is available in the prototype. BME688, BH1750, MPU6050 and DS18B20 are being integrated. Hall-sensor airflow measurement is planned.'},
  mcu:{label:'STM32 MCU',sub:'REAL-TIME CONTROL',icon:Cpu,status:'Prototype',description:'Samples the prototype inputs, reads the persona and risk buttons, and handles the OLED, green LED and active buzzer.'},
  risk:{label:'Local risk engine',sub:'DETERMINISTIC LOGIC',icon:ShieldCheck,status:'In development',description:'The current device simulates risk with a physical button. Automatic, deterministic heat-risk evaluation is in development. AI will not make safety decisions.'},
  outputs:{label:'Local outputs',sub:'OLED / LED / BUZZER / FAN',icon:BellRing,status:'Prototype + planned',description:'OLED, green LED and active buzzer are prototype capabilities. Automatic 12V fan actuation is planned. Safety outputs belong to local hardware logic.'},
  bridge:{label:'Arduino Bridge',sub:'MCU ↔ LINUX',icon:Cable,status:'Prototype',description:'Carries hardware state between the MCU and Linux. The dashboard reports the bridge_connected field separately from backend availability.'},
  linux:{label:'Linux + Python',sub:'ON-DEVICE COMPUTING',icon:Layers,status:'Prototype',description:'Python runs on the Linux side and exposes the available hardware state through FastAPI. Future edge prediction and local assistant services fit here.'},
  api:{label:'FastAPI',sub:'GET /api/status',icon:Braces,status:'Prototype',description:'The status endpoint reports occupancy, persona, risk and Arduino Bridge connectivity. This interface polls about once per second without requiring a page refresh.'},
  web:{label:'React website',sub:'THIS CONTROL ROOM',icon:Monitor,status:'Implemented',description:'Displays reported device state, records session history and distinguishes unavailable sensor data from real measurements. Persona cards are previews until a control endpoint exists.'},
  ai:{label:'Ollama / Cloud AI',sub:'EXPLANATION ONLY',icon:BrainCircuit,status:'Planned',description:'A future offline Ollama assistant and optional cloud assistant will explain conditions. POST /api/chat is prepared in the frontend and disabled by default. Neither mode controls hardware.'},
};
export default function SystemArchitecture() {
  const [selected,setSelected]=useState('bridge');
  const [path,setPath]=useState('all');
  const [xray,setXray]=useState(false);
  const paths={all:Object.keys(nodes),sensors:['sensors','mcu'],safety:['sensors','mcu','risk','outputs'],web:['mcu','bridge','linux','api','web'],ai:['context','ai','explanation']};
  const detail=nodes[selected];
  const renderNode=(id)=>{const node=nodes[id];const Icon=node.icon;return <button key={id} onClick={()=>setSelected(id)} aria-pressed={selected===id} className={`architecture-node ${selected===id?'selected':''} ${paths[path].includes(id)?'path-active':'path-muted'}`}><Icon size={22} strokeWidth={1.5}/><strong>{node.label}</strong><small>{node.sub}</small></button>;};
  const renderRow=ids=><div className="node-row">{ids.map((id,i)=><div className="node-unit" key={id}>{renderNode(id)}{i<ids.length-1&&<span className={`architecture-flow ${paths[path].includes(id)&&paths[path].includes(ids[i+1])?'flow-active':''}`}><ArrowRight size={17}/><i/></span>}</div>)}</div>;
  return <section id="system" className="architecture section-wrap">
    <div className="section-intro"><div><span className="eyebrow">OPEN BY DESIGN</span><h2>One system.<br/>Two connected worlds.</h2></div><p>Local control on one side.<br/>Understanding on the other.<br/><span className="mint">Select a path, then inspect its components.</span></p></div>
    <div className="architecture-controls"><div role="group" aria-label="Architecture path">{[['all','All paths'],['sensors','Sensors'],['safety','Safety engine'],['web','Web'],['ai','AI']].map(([id,label])=><button key={id} aria-pressed={path===id} className={path===id?'active':''} onClick={()=>{setPath(id);setSelected(paths[id][0]);}}>{label}</button>)}</div><button className={`xray-toggle ${xray?'active':''}`} aria-pressed={xray} onClick={()=>setXray(!xray)}><ScanLine size={16}/>{xray?'X-ray view':'Normal view'}</button></div>
    <div className={`architecture-shell ${xray?'xray-enabled':''}`}>
      <div className="architecture-lane"><div className="lane-label"><span>01</span> SENSE → DECIDE → ACT <small>LOCAL HARDWARE PATH / TARGET DESIGN</small></div>{renderRow(['sensors','mcu','risk','outputs'])}</div>
      <div className="architecture-connector"><span/><span><Cable size={15}/> MCU ↔ ARDUINO BRIDGE ↔ LINUX</span><span/></div>
      <div className="architecture-lane"><div className="lane-label"><span>02</span> COMMUNICATE → OBSERVE <small>LINUX + WEB SERVICES</small></div>{renderRow(['bridge','linux','api','web'])}</div>
      <div className="architecture-lane ai-architecture-lane"><div className="lane-label"><span>03</span> CONTEXT → EXPLANATION <small>PLANNED / NO ACTUATOR PATH</small></div>{renderRow(['context','ai','explanation'])}</div>
      {xray&&<div className="xray-key"><Radio size={14}/><span>ILLUSTRATIVE PACKETS / NOT LIVE TELEMETRY</span><span>Direction arrows show logical data flow.</span></div>}
      <div className="architecture-detail" aria-live="polite"><div><span className="pill">{detail.status}</span><h3>{detail.label}</h3></div><p>{detail.description}</p><ArrowUpRight size={22}/></div>
    </div>
    <div className="architecture-principle"><ShieldCheck size={18}/><p>Hardware owns the response. AI helps explain it.</p><span>SAFETY LOGIC STAYS LOCAL</span></div>
    <div className="roadmap-inline"><span className="eyebrow">WHAT COMES NEXT</span><span>Environmental sensing</span><ArrowRight size={14}/><span>Fan actuation</span><ArrowRight size={14}/><span>Edge prediction</span><ArrowRight size={14}/><span>Multilingual AI</span><ArrowRight size={14}/><span>LoRa multi-node network</span></div>
  </section>;
}
