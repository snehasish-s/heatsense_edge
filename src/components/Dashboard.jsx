import { Activity, ArrowUpRight, Cpu, Droplets, Fan, Lightbulb, Radio, RefreshCw, ShieldCheck, Thermometer, UserRound, WifiOff } from 'lucide-react';
import { useLanguage } from '../i18n';
import HeatChart from './HeatChart';
import PersonaSelector from './PersonaSelector';
import AIChat from './AIChat';
import DeviceStatus from './DeviceStatus';
export function MetricCard({label,value,icon:Icon,detail,online}) { const {t}=useLanguage();return <div className="panel metric-card"><span className="metric-label">{t(label)}<Icon size={17}/></span><strong className={online?'mint':''}>{value?t(value):'—'}</strong><small><span className={`tiny-dot ${online?'online':''}`}/>{detail}</small></div>; }
const futureSensors=[['temperature','Temperature','°C',Thermometer],['humidity','Humidity','%',Droplets],['heat_index','Heat index','°C',Activity],['radiant_temperature','Radiant temperature','°C',Thermometer],['light','Light intensity',' lx',Lightbulb],['activity','Activity','',Activity],['fan_status','Fan status','',Fan]];
export default function Dashboard({device}) {
  const {t}=useLanguage();
  const {data,connection,history,updatedAt,retry}=device;
  const backend=connection==='connected';
  const hardware=backend&&data?.bridge_connected===true;
  const live=hardware?data:null;
  const risk=live?.risk;
  const connectionLabel=connection==='loading'?'Connecting to backend':connection==='error'?'API error':backend?'Live connection':'Backend unavailable';
  return <section id="live" className="dashboard section-wrap"><div className="dashboard-header"><div><span className="eyebrow"><span className={`tiny-dot ${hardware?'online':''}`}/> THE CONTROL ROOM</span><h2>{t('Your room. In real time.')}</h2><p>A direct line to the hardware. A clearer view of the room.</p></div><div className={`connection-badge ${hardware?'connected':''}`}><span className={`tiny-dot ${hardware?'online':''}`}/>{t(hardware?'Hardware connected':'Waiting for hardware')}<small>ARDUINO UNO Q</small></div></div>
    <div className={`connection-banner ${backend?'is-connected':''}`}><span>{backend?<Radio size={15}/>:<WifiOff size={15}/>}<strong>{t(connectionLabel)}</strong><span>{backend?(hardware?'Status received from your device.':'Backend reachable. Hardware bridge is not confirmed.'):'Start your FastAPI backend to receive device data.'}</span></span><button onClick={retry} className="inline-button" disabled={connection==='loading'}><RefreshCw size={13}/>{t('Retry connection')}</button></div>
    <div className="metrics-grid"><MetricCard label="Room occupancy" value={live?.occupancy} icon={Radio} detail={hardware?'PIR occupancy sensor':t('Awaiting device')} online={live?.occupancy==='OCCUPIED'}/><MetricCard label="Active persona" value={live?.persona} icon={UserRound} detail={hardware?'Selected on the physical device':t('Awaiting device')} online={!!live?.persona}/><MetricCard label="Device bridge" value={data?.bridge_connected===true?'CONNECTED':data?.bridge_connected===false?'DISCONNECTED':null} icon={Cpu} detail="MCU ↔ Linux / Arduino Bridge" online={hardware}/><div className={`panel risk-card ${risk?.toLowerCase()||'unknown'}`} role="status"><span className="metric-label">{t('Current risk')}<ShieldCheck size={18}/></span><div><strong>{risk?t(risk):'—'}</strong><span className="risk-orbit"><ShieldCheck size={25}/></span></div><small>{risk?'MANUAL PROTOTYPE SIMULATION':t('Awaiting device')}</small></div></div>
    <div className="dashboard-caption"><span>Prototype risk is manually simulated on the device; automatic heat assessment is in development.</span><span>{updatedAt?`Last received ${new Date(updatedAt).toLocaleTimeString()}`:'No device readings received'}</span></div>
    <div className="sensor-row">{futureSensors.map(([key,label,unit,Icon])=><div className="future-sensor" key={key}><span><Icon size={15}/>{t(label)}</span><strong>{live?.[key]!==null&&live?.[key]!==undefined?`${live[key]}${unit}`:'—'}</strong><small>{live?.[key]!==null&&live?.[key]!==undefined?'Reported by backend':t(key==='fan_status'?'Planned':'Sensor integrating')}</small></div>)}</div>
    <div className="dashboard-main"><div className="dashboard-left"><HeatChart history={history} connected={hardware}/><PersonaSelector active={live?.persona}/></div><div className="dashboard-right"><DeviceStatus data={data} connection={connection}/><div className="prediction-note"><span className="eyebrow"><Activity size={14}/> ON THE HORIZON</span><h3>The next hour,<br/>a little clearer.</h3><p>Local heat prediction is in development. Forecasts will appear when an edge model is connected.</p><span className="status-label">PLANNED <ArrowUpRight size={14}/></span></div></div></div>
    <AIChat connected={backend} aiMode={data?.ai_mode}/>
  </section>;
}
