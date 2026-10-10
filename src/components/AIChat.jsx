import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, MessageSquare, Sparkles } from 'lucide-react';
import { CHAT_ENABLED, sendChat } from '../services/api';
import { useLanguage } from '../i18n';
const questions=['Why is the risk high?','Is this room safe for an elderly person?','Should I take a cooling break?','Why did the fan turn on?','What could the room be like in one hour?'];
export default function AIChat({connected, aiMode}) {
  const {t,language}=useLanguage();
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [mode,setMode]=useState(null);
  const controller=useRef(null);
  const messageList=useRef(null);
  const enabled=CHAT_ENABLED&&connected;
  useEffect(()=>()=>controller.current?.abort(),[]);
  useEffect(()=> { if(messageList.current) messageList.current.scrollTop=messageList.current.scrollHeight; },[messages,busy]);
  async function submit(e) {
    e.preventDefault(); if(!input.trim()||busy||!enabled)return;
    const message=input.trim();setMessages(m=>[...m,{role:'user',text:message}]);setInput('');setError('');setBusy(true);
    controller.current=new AbortController();
    try { const result=await sendChat(message,language,controller.current.signal);setMessages(m=>[...m,{role:'assistant',text:result.response}]);setMode(result.mode?.toUpperCase()||null); }
    catch(err) { if(!controller.current.signal.aborted) {setError(`Assistant unavailable. ${err.message} Your question has not received a response.`);setInput(message);} }
    finally {setBusy(false);}
  }
  const reportedMode=connected?(mode||aiMode):null;
  return <section id="ask" className="panel chat-panel"><div className="panel-heading"><div><span className="eyebrow">A HUMAN WAY TO UNDERSTAND</span><h3><Sparkles size={21}/>{t('Ask HeatSense')}</h3></div><span className="pill">{reportedMode?`${reportedMode} / ${reportedMode==='OFFLINE'?'Ollama':'Cloud'}`:'AI / PLANNED'}</span></div>
    <div className="chat-content" ref={messageList} aria-live="polite">{messages.length===0?<div className="chat-welcome"><div className="chat-symbol"><MessageSquare size={23} strokeWidth={1.5}/><span className="tiny-dot"/></div><h4>{enabled?'What would you like to understand?':t('Assistant in development')}</h4><p>{enabled?'Ask the connected assistant about your room.':'Clear explanations, in your language. The assistant will become available when its backend is integrated.'}</p><span>ENGLISH <i/> हिंदी <i/> ଓଡ଼ିଆ</span></div>:messages.map((m,i)=><div key={i} className={`chat-message ${m.role}`}><small>{m.role==='user'?'YOU':'HEATSENSE'}</small><p>{m.text}</p></div>)}{busy&&<p className="chat-thinking">Waiting for the assistant…</p>}</div>
    <div className="suggested-questions">{questions.map(question=><button key={question} onClick={()=>setInput(t(question))} title="Use this question">{t(question)}<ArrowRight size={13}/></button>)}</div>
    {error&&<p className="chat-error" role="alert">{error}</p>}
    <form onSubmit={submit} className="chat-form"><input aria-label={t('Ask about the current room conditions…')} placeholder={t('Ask about the current room conditions…')} value={input} onChange={e=>setInput(e.target.value)} maxLength={2000}/><button type="submit" disabled={!enabled||busy||!input.trim()} aria-label={t('Send message')}><ArrowUp size={18}/></button></form><div className="chat-disclaimer">{!enabled?'Sending is disabled until the assistant is connected.':'AI explains conditions; local logic controls safety.'} <span>No AI control of hardware.</span></div>
  </section>;
}
