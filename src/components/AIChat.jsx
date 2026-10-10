import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, MessageSquare, Sparkles } from 'lucide-react';
import { CHAT_ENABLED, sendChat } from '../services/api';
import { speakHeatSense } from '../services/speech';
import { useLanguage } from '../i18n';

const questions = ['Why is the risk high?', 'What is the current HeatSense status?', 'Explain how HeatSense works.', 'Why do you use Arduino UNO Q?', 'What does the Worker persona mean?'];

export default function AIChat({ connected, aiMode }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null);
  const [provider, setProvider] = useState(null);
  const controller = useRef(null);
  const messageList = useRef(null);
  const enabled = CHAT_ENABLED && connected;

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight; }, [messages, busy]);

  const badgeLabel = mode === 'local_system' ? 'Live HeatSense System' : mode === 'offline_ai' ? 'Local AI • Ollama' : aiMode === 'ONLINE' ? 'Cloud AI' : 'AI / PLANNED';

  async function sendMessage(message) {
    setMessages(m => [...m, { role: 'user', text: message }]);
    setInput('');
    setError('');
    setBusy(true);
    controller.current = new AbortController();

    try {
      const result = await sendChat(message, controller.current.signal);
      const assistantText = result.response;
      setMessages(m => [...m, { role: 'assistant', text: assistantText }]);
      speakHeatSense(assistantText);
      setMode(result.mode || null);
      setProvider(result.provider || null);
    } catch (err) {
      if (!controller.current.signal.aborted) {
        console.error('HeatSense chat failed:', err);
        setError('HeatSense AI is temporarily unavailable. The local safety system continues to operate independently.');
        setInput(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    const message = input.trim();
    if (!message || busy || !enabled) return;
    await sendMessage(message);
  }

  const buttonAction = question => {
    if (!enabled || busy) return;
    sendMessage(question);
  };

  return <section id="ask" className="panel chat-panel"><div className="panel-heading"><div><span className="eyebrow">A HUMAN WAY TO UNDERSTAND</span><h3><Sparkles size={21}/>{t('Ask HeatSense')}</h3></div><span className="pill">{badgeLabel}</span></div>
    <div className="chat-content" ref={messageList} aria-live="polite">{messages.length === 0 ? <div className="chat-welcome"><div className="chat-symbol"><MessageSquare size={23} strokeWidth={1.5}/><span className="tiny-dot"/></div><h4>{enabled ? 'What would you like to understand?' : t('Assistant in development')}</h4><p>{enabled ? 'Ask the connected assistant about your room.' : 'Clear explanations, in your language. The assistant will become available when its backend is integrated.'}</p><span>ENGLISH <i/> हिंदी <i/> ଓଡ଼ିଆ</span></div> : messages.map((m, i) => <div key={i} className={`chat-message ${m.role}`}><small>{m.role === 'user' ? 'YOU' : 'HEATSENSE'}</small><p>{m.text}</p></div>)}{busy && <p className="chat-thinking">HeatSense is thinking locally...</p>}</div>
    <div className="suggested-questions">{questions.map(question => <button key={question} onClick={() => buttonAction(question)} title="Use this question">{t(question)}<ArrowRight size={13}/></button>)}</div>
    {error && <p className="chat-error" role="alert">{error}</p>}
    <form onSubmit={submit} className="chat-form"><input aria-label={t('Ask about the current room conditions…')} placeholder={t('Ask about the current room conditions…')} value={input} onChange={e => setInput(e.target.value)} maxLength={2000}/><button type="submit" disabled={!enabled || busy || !input.trim()} aria-label={t('Send message')}><ArrowUp size={18}/></button></form><div className="chat-disclaimer">{!enabled ? 'Sending is disabled until the assistant is connected.' : 'AI explains conditions; local logic controls safety.'} <span>No AI control of hardware.</span></div>
  </section>;
}

