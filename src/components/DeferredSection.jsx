import { useEffect, useRef, useState } from 'react';
export default function DeferredSection({id,label,children}) {
  const ref=useRef(null);const [visible,setVisible]=useState(false);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'800px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <div id={id} ref={ref} className="deferred-section">{visible?children:<div className="deferred-placeholder"><span className="eyebrow">HEATSENSE EDGE</span><h2>{label}</h2><button className="button outline" onClick={()=>setVisible(true)}>Explore {label}</button></div>}</div>;
}
