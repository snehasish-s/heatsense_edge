import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { Cpu, X } from 'lucide-react';
import Board from './Board';
export const BOARD_HOTSPOTS=[
  {id:'linux',label:'Linux processor',x:44,y:48,text:'Runs Python and FastAPI on the prototype. Local prediction and Ollama fit on this computing side in the roadmap.'},
  {id:'mcu',label:'STM32 MCU',x:65,y:54,text:'Handles real-time inputs and outputs: PIR occupancy, physical buttons, OLED, green LED and active buzzer.'},
  {id:'gpio',label:'GPIO',x:50,y:22,text:'General-purpose input/output connects digital signals and local outputs. This drawing is conceptual, not a wiring guide.'},
  {id:'i2c',label:'I²C bus',x:63,y:78,text:'A shared serial bus used by compatible peripherals. Pin assignments and addresses must match the actual firmware and wiring.'},
  {id:'bridge',label:'Arduino Bridge',x:57,y:54,text:'A software communication bridge between MCU and Linux. It carries state without giving an LLM authority over actuators.'},
  {id:'usb',label:'USB',x:15,y:39,text:'Provides a physical connection for development and communication. Use the board’s documentation for supported operating modes.'},
  {id:'power',label:'Power',x:15,y:64,text:'The power connection supplies the board. External loads such as a planned 12V fan need a suitable driver and separate power design.'},
];
export default function InteractiveUnoQ({hotspots=true,xray=false,className='',active='both'}) {
  const [selected,setSelected]=useState(null);const ref=useRef(null);const reduced=useReducedMotion();
  const mx=useMotionValue(0),my=useMotionValue(0);const rotateX=useSpring(mx,{stiffness:70,damping:20}),rotateY=useSpring(my,{stiffness:70,damping:20});
  function pointer(e){if(reduced||e.pointerType==='touch')return;const r=ref.current.getBoundingClientRect();my.set(((e.clientX-r.left)/r.width-.5)*10);mx.set(-((e.clientY-r.top)/r.height-.5)*8);}
  return <div ref={ref} className={`interactive-uno ${xray?'xray':''} ${className}`} onPointerMove={pointer} onPointerLeave={()=>{mx.set(0);my.set(0);}}><motion.div className="interactive-board-plane" style={{rotateX,rotateY}}><Board active={selected?.id||active}/>{xray&&<svg className="xray-board-paths" viewBox="0 0 620 420" aria-hidden="true"><path d="M110 190H185L220 220H385L408 166V90M110 270H180L220 220M275 155V100M275 256V322"/><circle cx="275" cy="215" r="72"/><circle cx="402" cy="223" r="35"/></svg>}{hotspots&&BOARD_HOTSPOTS.map(spot=><button key={spot.id} className={`board-hotspot ${selected?.id===spot.id?'selected':''}`} style={{left:`${spot.x}%`,top:`${spot.y}%`}} aria-label={`Explore ${spot.label}`} aria-pressed={selected?.id===spot.id} onPointerEnter={e=>{if(e.pointerType!=='touch')setSelected(spot);}} onFocus={()=>setSelected(spot)} onClick={()=>setSelected(spot)}><span/><b>{spot.label}</b></button>)}</motion.div>{selected&&<div className="board-info" role="status"><Cpu size={16}/><div><strong>{selected.label}</strong><p>{selected.text}</p></div><button aria-label="Close board information" onClick={()=>setSelected(null)}><X size={14}/></button></div>}</div>;
}

