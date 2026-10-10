// An intentionally simple, transparent teaching model. This is NOT heat index,
// WBGT, a medically validated classifier, or the physical prototype's firmware.
export const LEVELS = ['SAFE', 'MEDIUM', 'HIGH', 'EXTREME'];
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const DEMO_DEFAULTS = { temperature: 35, humidity: 70, radiant: 2, activity: 1, persona: 'GENERAL', occupied: true };
export function demoRisk(input) {
  const temperature = clamp(Number(input.temperature) || 0, 10, 55);
  const humidity = clamp(Number(input.humidity) || 0, 0, 100);
  const modifiers = {
    humidity: Math.max(0, humidity - 40) * 0.06,
    radiant: clamp(Number(input.radiant) || 0, 0, 8) * 0.5,
    activity: clamp(Number(input.activity) || 0, 0, 2) * 1.5,
    persona: ({ GENERAL: 0, WORKER: 0.5, ELDERLY: 1.5, CHILD: 1 })[input.persona] || 0,
  };
  const load = Math.round((temperature + Object.values(modifiers).reduce((a,b) => a+b, 0)) * 10) / 10;
  const level = load < 30 ? 0 : load < 35 ? 1 : load < 40 ? 2 : 3;
  return { load, level, risk: LEVELS[level], modifiers, occupied: input.occupied !== false };
}
export const MODEL_NOTE = 'SIMULATION · Fictional teaching thresholds, not medical advice or the device algorithm. SAFE is a game category, not a guarantee of safety.';
export const MODEL_RULE = 'Teaching load = temperature + max(0, humidity − 40) × 0.06 + radiant offset × 0.5 + activity × 1.5 + persona weight. Categories: <30 SAFE; <35 MEDIUM; <40 HIGH; otherwise EXTREME. Occupancy changes response context, not the room category.';

export const PERSONA_GUIDANCE = {
  GENERAL: { label: 'General', priority: 'Limit exposure', text: 'Reduce prolonged exposure and find a cooler place. Pay attention to changing conditions.' },
  WORKER: { label: 'Worker', priority: 'Reduce workload', text: 'Pause heavy activity and take a break in a cool area. A rest schedule is part of the response.' },
  ELDERLY: { label: 'Elderly', priority: 'Prioritize assistance', text: 'Help the person reach a cooler area and check in with them. Seek assistance if they feel unwell.' },
  CHILD: { label: 'Child', priority: 'Bring an adult', text: 'Move to a cooler area with adult supervision. An adult should monitor conditions and arrange breaks.' },
};

export function predictionPoints(correct, seconds, streak) {
  if (!correct) return 0;
  return Math.min(125, 95 + Math.max(0, 20 - Math.floor(seconds)) + Math.min(10, streak * 2));
}

export const ROUTES = [
  ['PIR', 'STM32 MCU'], ['BME688', 'STM32 MCU'], ['STM32 MCU', 'Risk Engine'],
  ['Risk Engine', 'OLED'], ['Risk Engine', 'Buzzer'], ['Risk Engine', 'Fan'],
  ['STM32 MCU', 'Arduino Bridge'], ['Arduino Bridge', 'Linux'], ['Linux', 'Python'],
  ['Python', 'FastAPI'], ['FastAPI', 'React Dashboard'], ['FastAPI', 'Ollama'], ['Ollama', 'Explanation'],
];
export const ROUTER_BLOCKS = [...new Set(ROUTES.flat())];
export function checkRoute(from, to, routes = []) {
  if (from === 'Ollama' && ['Fan','Buzzer','OLED','Risk Engine','STM32 MCU'].includes(to)) return 'violation';
  if (!ROUTES.some(([a,b]) => a===from && b===to)) return 'incorrect';
  return routes.some(([a,b]) => a===from && b===to) ? 'duplicate' : 'correct';
}

export function initialCooling() {
  return { minute:0, temperature:30, humidity:55, energy:100, fan:false, ventilation:false, blinds:false, breakUntil:0, reduced:false, moved:false, hydration:false, safeTicks:0, highTicks:0, actions:0 };
}
export function coolingAction(state, action) {
  if (['fan','ventilation','blinds','reduced'].includes(action)) return { ...state, [action]:!state[action], actions:state.actions+1 };
  if (action==='break') return { ...state, breakUntil:state.minute+15, actions:state.actions+1 };
  if (action==='move') return { ...state, moved:true, actions:state.actions+1 };
  if (action==='hydration') return { ...state, hydration:true, actions:state.actions+1 };
  return state;
}
export function coolingRisk(state) {
  const base = demoRisk({ temperature:state.moved?26:state.temperature, humidity:state.humidity, activity:state.reduced||state.minute<state.breakUntil?0:1, persona:'GENERAL' });
  // Fans change comfort only below 32°C in this conservative game model; they
  // never reduce the air-temperature reading. Hydration is a separate action.
  const comfort = state.fan && state.energy>0 && state.temperature<32 && !state.moved ? 1 : 0;
  const load = base.load - comfort;
  return { ...base, load, level:load<30?0:load<35?1:load<40?2:3, risk:LEVELS[load<30?0:load<35?1:load<40?2:3] };
}
export function tickCooling(state) {
  const minute = state.minute+1;
  const fan = state.fan && state.energy>0;
  const energy = Math.max(0, state.energy-(fan?1.3:0));
  const solarGain = state.blinds ? 0.018 : 0.075;
  // This scenario explicitly defines outdoors as cooler (29°C).
  const ventilation = state.ventilation ? (state.temperature-29)*0.035 : 0;
  const temperature = clamp(state.temperature+solarGain-ventilation,24,46);
  const next = { ...state, minute, temperature, energy, fan:fan&&energy>0, humidity:clamp(state.humidity + (state.ventilation?-0.12:0.07),40,85) };
  const risk = coolingRisk(next);
  return { ...next, safeTicks:state.safeTicks+(risk.level<2?1:0), highTicks:state.highTicks+(risk.level>=2?1:0) };
}
export function coolingResult(state) {
  const won = state.minute>=90 && state.highTicks===0;
  const score = clamp(Math.round(state.safeTicks/90*600 + state.energy*2 + (state.moved?70:0) + (state.hydration?60:0) + (state.reduced?40:0) + (state.blinds?30:0)),0,1000);
  return { score, completed:won, energy:Math.round(state.energy), safeMinutes:state.safeTicks, highMinutes:state.highTicks, won };
}

export const RESOURCE_LIST = [
  {id:'fan-1',label:'Fan 01',kind:'fan'}, {id:'fan-2',label:'Fan 02',kind:'fan'},
  {id:'cooler',label:'Portable cooler',kind:'cooler'},
  {id:'water-1',label:'Hydration 01',kind:'water'}, {id:'water-2',label:'Hydration 02',kind:'water'}, {id:'water-3',label:'Hydration 03',kind:'water'},
];
export function initialCommander() {
  return { second:0, energy:160, spent:0, actions:24, assignments:{}, protections:0, samples:0, extremeTicks:0, prevented:0, responseTimes:[], alerts:[], event:null, failedFan:false,
    rooms:[
      {id:'workshop',name:'Workshop',temperature:33,humidity:62,people:8,persona:'WORKER',activity:2,safeUntil:0,alarmAt:null},
      {id:'classroom',name:'Classroom',temperature:31,humidity:64,people:18,persona:'CHILD',activity:1,safeUntil:0,alarmAt:null},
      {id:'office',name:'Office',temperature:29,humidity:55,people:6,persona:'GENERAL',activity:0,safeUntil:0,alarmAt:null},
      {id:'server',name:'Server room',temperature:32,humidity:45,people:0,persona:'GENERAL',activity:0,safeUntil:0,alarmAt:null},
      {id:'waiting',name:'Waiting area',temperature:32,humidity:65,people:7,persona:'ELDERLY',activity:0,safeUntil:0,alarmAt:null},
    ] };
}
export function roomRisk(room, state) {
  const moved = room.safeUntil>state.second;
  const fans = Object.entries(state.assignments).filter(([id,target])=>target===room.id && id.startsWith('fan') && !(state.failedFan&&id==='fan-1')).length;
  const result = demoRisk({...room,temperature:moved?26:room.temperature,activity:moved?0:room.activity});
  const load = result.load - (!moved&&room.temperature<32&&state.energy>0 ? fans*0.8 : 0);
  const level = load<30?0:load<35?1:load<40?2:3;
  return { ...result, load, level, risk:LEVELS[level], moved };
}
export function assignResource(state, resource, roomId) {
  if (state.actions<=0 || !RESOURCE_LIST.some(r=>r.id===resource) || !state.rooms.some(r=>r.id===roomId) || (state.failedFan&&resource==='fan-1') || state.assignments[resource]===roomId) return state;
  return {...state, actions:state.actions-1,assignments:{...state.assignments,[resource]:roomId}};
}
export function moveOccupants(state, roomId) {
  const room=state.rooms.find(r=>r.id===roomId);
  if(state.actions<=0 || !room?.people || room.safeUntil>state.second) return state;
  return {...state,actions:state.actions-1,rooms:state.rooms.map(r=>r.id===roomId?{...r,safeUntil:state.second+25}:r)};
}
export function tickCommander(state, eventRoll=0.5) {
  const second=state.second+1;
  let assignments={...state.assignments};
  let energy=state.energy;
  let event=null;
  let failedFan=state.failedFan;
  let rooms=state.rooms.map(r=>({...r}));
  if([25,50,75,100,125].includes(second)) {
    const kind=clamp(Math.floor(eventRoll*5),0,4);
    const roomIndex=second===50?4:(Math.floor(eventRoll*rooms.length)+Math.floor(second/25))%rooms.length;
    const room=rooms[roomIndex];
    if(kind===0){energy=Math.max(0,energy-15);event='Power reduction · 15 energy credits lost';}
    if(kind===1){room.people+=5;room.temperature+=0.8;event=`Crowd enters ${room.name.toLowerCase()} · +5 people`;}
    if(kind===2){rooms=rooms.map(r=>({...r,temperature:r.temperature+1.1}));event='Outdoor heat spike · all rooms warming';}
    if(kind===3){failedFan=true;delete assignments['fan-1'];event='Fan 01 failed · reallocate your remaining resources';}
    if(kind===4){room.activity=2;room.temperature+=0.6;event=`High activity detected · ${room.name}`;}
  }
  const cost=Object.keys(assignments).reduce((sum,id)=>sum+(id==='cooler'?0.6:id.startsWith('fan')?0.15:0),0);
  const paid=Math.min(energy,cost);energy=Math.max(0,energy-cost);
  const next={...state,second,energy,spent:state.spent+paid,assignments,failedFan,event};
  let protections=0, people=0, extremes=0,prevented=0;
  const responseTimes=[...state.responseTimes];
  const alerts=event?[{time:second,text:event},...state.alerts]:[...state.alerts];
  rooms=rooms.map(room=>{
    const old=state.rooms.find(r=>r.id===room.id);
    const prior=roomRisk(old,state);
    const cooled=assignments.cooler===room.id&&energy>0;
    room.temperature=clamp(room.temperature+0.035+(room.activity===2?0.014:0)-(cooled?0.145:0),25,46);
    const risk=roomRisk(room,next);
    people+=room.people;protections+=risk.level<2?room.people:0;extremes+=risk.level===3&&room.people>0?1:0;
    if(room.people>0&&risk.level>=2&&prior.level<2){room.alarmAt=second;alerts.unshift({time:second,text:`${room.name} → ${risk.risk}${room.persona==='ELDERLY'?' · priority assistance':''}`});}
    if(room.people>0&&risk.level<2&&prior.level>=2){responseTimes.push(Math.max(0,second-(room.alarmAt??0)));room.alarmAt=null;prevented++;}
    return room;
  });
  return {...next,rooms,protections:state.protections+protections,samples:state.samples+people,extremeTicks:state.extremeTicks+extremes,prevented:state.prevented+prevented,responseTimes,alerts:alerts.slice(0,5)};
}
export function commanderResult(state) {
  const protectedPercent=state.samples?Math.round(state.protections/state.samples*100):0;
  const stations=new Set(Object.entries(state.assignments).filter(([id])=>id.startsWith('water')).map(([,r])=>r)).size;
  return {score:clamp(Math.round(protectedPercent*7+Math.min(100,state.energy)+stations*35+Math.min(95,state.prevented*15)),0,1000),completed:state.second>=150,
    protectedPercent,peopleProtected:state.rooms.reduce((n,r)=>n+(roomRisk(r,state).level<2?r.people:0),0),energyUsed:Math.round(state.spent),prevented:state.prevented,
    responseTime:state.responseTimes.length?Math.round(state.responseTimes.reduce((a,b)=>a+b,0)/state.responseTimes.length):null};
}
