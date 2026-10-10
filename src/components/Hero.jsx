import { ArrowDown, ArrowUpRight, Cpu, Radio, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Board from './Board';
import { useLanguage } from '../i18n';

export default function Hero() {
  const { t } = useLanguage();
  return <section id="overview" className="hero">
    <div className="hero-grid" aria-hidden="true"/>
    <div className="hero-topline"><span><span className="tiny-dot online"/> BUILT AT THE EDGE. DESIGNED FOR PEOPLE.</span><span className="hero-edition">BPUT HACKATHON <b>2026</b></span></div>
    <div className="hero-layout">
      <motion.div className="hero-copy" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8}}>
        <div className="eyebrow"><span className="short-line"/> HEATSENSE EDGE</div>
        <h1>{t('Cooler rooms.')}<br/>{t('Safer people.')}<br/><span>{t('Smarter cities.')}</span></h1>
        <p>An intelligent, multilingual, personalized heat-safety system. Powered by Arduino UNO Q. Built to act locally.</p>
        <div className="hero-actions"><a className="button primary" href="#experience">{t('Explore the system')}<ArrowDown size={17}/></a><a className="text-link" href="#live">{t('View live dashboard')}<ArrowUpRight size={17}/></a></div>
        <div className="hero-team"><span className="team-icon">B<span>×</span>B</span><span>TEAM <strong>BITBYBIT</strong><small>BH26PS02T015 · BPUT HACKATHON 2026</small></span></div>
      </motion.div>
      <motion.div className="hero-device" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:1,delay:.15}}>
        <div className="device-orbit orbit-one"/><div className="device-orbit orbit-two"/>
        <div className="device-coordinate coordinate-top">LOCAL COMPUTE <span>EDGE NODE / 001</span></div>
        <div className="hero-board-wrap"><Board /></div>
        <div className="device-callout callout-linux"><span className="callout-line"/><span className="tiny-dot online"/><div>LINUX + REAL-TIME MCU<small>Two worlds. One board.</small></div></div>
        <div className="device-callout callout-local"><ShieldCheck size={17}/><div>LOCAL BY DESIGN<small>Core logic stays in the room.</small></div></div>
        <div className="device-name"><span>01 / THE HEART OF HEATSENSE</span><strong>Arduino UNO Q <ArrowUpRight size={18}/></strong><small>Conceptual hardware visualization</small></div>
        <div className="technical-cross cross-one">+</div><div className="technical-cross cross-two">+</div>
      </motion.div>
    </div>
    <div className="hero-bottom"><a href="#experience" className="scroll-cue"><span><ArrowDown size={16}/></span>SCROLL TO DISCOVER</a><div className="hero-capabilities"><span><Radio size={15}/> Sense in real time</span><span><Cpu size={15}/> Decide at the edge</span><span><ShieldCheck size={15}/> Respond locally</span></div><span className="hero-index">01 — 08</span></div>
    <div className="prototype-strip"><span className="pill">WORKING PROTOTYPE</span><p>Real hardware. Local intelligence. A more human response to heat.</p><span>ENGINEERED BY BITBYBIT <ArrowUpRight size={14}/></span></div>
  </section>;
}
