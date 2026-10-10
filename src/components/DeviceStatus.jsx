import { useEffect, useState } from 'react';
import { Cpu, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../i18n';
export default function DeviceStatus({data,connection}) {
  const {t}=useLanguage();
  const [network,setNetwork]=useState(navigator.onLine);
  useEffect(()=>{const update=()=>setNetwork(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
  const bridge=data?.bridge_connected;
  const rows=[['Arduino UNO Q',bridge===true?'CONNECTED':bridge===false?'DISCONNECTED':'UNVERIFIED',bridge===true],['Hardware bridge',bridge===true?'CONNECTED':bridge===false?'DISCONNECTED':'UNVERIFIED',bridge===true],['FastAPI backend',connection==='connected'?'ONLINE':connection==='loading'?'CHECKING':'UNREACHABLE',connection==='connected'],['Ollama',data?.ollama_status||'NOT INTEGRATED',data?.ollama_status==='ONLINE'],['Cloud AI',data?.ai_mode==='ONLINE'?'REPORTED ONLINE':'OPTIONAL',data?.ai_mode==='ONLINE'],['Internet',network?'UNVERIFIED':'DISCONNECTED',false]];
  return <section className="panel device-panel"><div className="panel-heading"><h3>{t('System health')}</h3><Cpu size={19}/></div><div className="device-model"><div className="mini-board"><Cpu size={30}/></div><div><strong>Arduino UNO Q</strong><small>HEATSENSE / EDGE NODE 001</small></div></div><dl className="system-rows">{rows.map(([label,value,online])=><div key={label}><dt>{label}</dt><dd className={online?'mint':''}><span className={`tiny-dot ${online?'online':''}`}/>{t(value)}</dd></div>)}</dl><p className="subtle-note">Internet access is not verified by a browser network signal.</p><a className="device-system-link" href="#system">Explore the architecture <ArrowUpRight size={14}/></a></section>;
}
