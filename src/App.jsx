import { Component } from 'react';
import { MotionConfig } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { LanguageProvider } from './i18n';
import { useDevice } from './hooks/useDevice';
import Navbar, { Logo } from './components/Navbar';
import Hero from './components/Hero';
import UnoQExperience from './components/UnoQExperience';
import Dashboard from './components/Dashboard';
import SystemArchitecture from './components/SystemArchitecture';

class ErrorBoundary extends Component {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<main className="app-error"><h1>Let’s reconnect.</h1><p>The interface encountered an unexpected error.</p><button className="button primary" onClick={()=>window.location.reload()}>Reload HeatSense</button></main>:this.props.children;}
}
function Experience() {
  const device=useDevice();
  const connected=device.connection==='connected'&&device.data?.bridge_connected===true;
  return <><a className="skip-link" href="#live">Skip to live dashboard</a><Navbar connected={connected}/><main><Hero/><UnoQExperience connected={connected}/><Dashboard device={device}/><SystemArchitecture/></main><footer className="footer section-wrap"><div className="footer-top"><div><Logo/><p>Cooler rooms. Safer people. Smarter cities.</p></div><a href="#overview" className="back-top">Back to the top <ArrowUpRight size={18}/></a></div><div className="footer-bottom"><span>BUILT BY <strong>TEAM BITBYBIT</strong></span><span>BPUT HACKATHON 2026 <i/> BH26PS02T015</span><span>ENGINEERED WITH PURPOSE.</span></div></footer></>;
}
export default function App(){return <ErrorBoundary><LanguageProvider><MotionConfig reducedMotion="user"><Experience/></MotionConfig></LanguageProvider></ErrorBoundary>;}
