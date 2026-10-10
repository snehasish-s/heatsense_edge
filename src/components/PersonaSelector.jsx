import { useState } from 'react';
import { Accessibility, Baby, HardHat, UserRound, Check } from 'lucide-react';
import { useLanguage } from '../i18n';
const personas=[['GENERAL','General',UserRound,'Everyday indoor conditions, with general room context.'],['WORKER','Worker',HardHat,'Activity and workload can add context to future heat guidance.'],['ELDERLY','Elderly',Accessibility,'Age-related sensitivity is a planned input for personalized explanations.'],['CHILD','Child',Baby,'Age-appropriate context is planned for future explanations.']];
export default function PersonaSelector({active}) {
  const [preview,setPreview]=useState(null);
  const {t}=useLanguage();
  const selected=preview||active||'GENERAL';
  return <section className="panel persona-panel"><div className="panel-heading"><div><span className="eyebrow">PEOPLE FIRST</span><h3>{t('Choose a perspective')}</h3></div><span className="pill">PREVIEW</span></div><div className="persona-options">{personas.map(([id,label,Icon])=><button key={id} aria-pressed={selected===id} onClick={()=>setPreview(id)} className={selected===id?'selected':''}><Icon size={23} strokeWidth={1.5}/><span>{t(label)}</span>{active===id&&<small><Check size={10}/>DEVICE</small>}</button>)}</div><p>{personas.find(([id])=>id===selected)[3]}</p><div className="subtle-note">{t('Preview only · use the device button to change the active persona.')}{preview&&<button className="inline-button" onClick={()=>setPreview(null)}>Reset preview</button>}</div></section>;
}
