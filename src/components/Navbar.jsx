import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLanguage } from '../i18n';

export function Logo() { return <span className="logo"><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span><span>heatsense<span className="logo-edge"> / edge</span></span></span>; }
export default function Navbar({ connected }) {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('overview');
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-15% 0px -65% 0px' });
    ['overview','live','intelligence','ask','system'].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);
  return <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
    <a href="#overview" aria-label="HeatSense Edge home" onClick={() => setOpen(false)}><Logo /></a>
    <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">{[['overview','Overview'],['live','Live'],['intelligence','Intelligence'],['ask','Ask HeatSense'],['system','System']].map(([id,label])=><a className={active===id?'active':''} key={id} href={`#${id}`} onClick={()=>setOpen(false)}>{t(label)}{id==='live' && <span className={`tiny-dot ${connected ? 'online' : ''}`}/>}</a>)}</nav>
    <div className="nav-end"><select aria-label="Interface language" value={language} onChange={e=>setLanguage(e.target.value)}><option value="en">EN</option><option value="hi">HI</option><option value="od">OD</option></select><a href="#live" className="nav-launch">Launch app <ArrowUpRight size={14}/></a><button className="menu-toggle icon-button" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>
  </header>;
}
