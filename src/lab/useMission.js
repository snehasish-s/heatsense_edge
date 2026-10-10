import { useCallback, useEffect, useRef, useState } from 'react';

export function useMissionClock(active, paused=false, onTick) {
  const [seconds,setSeconds]=useState(0);
  const [background,setBackground]=useState(document.hidden);
  const tick=useRef(onTick);tick.current=onTick;
  useEffect(()=>{const update=()=>setBackground(document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
  useEffect(()=>{
    if(!active||paused||background)return;
    const timer=setInterval(()=>{setSeconds(n=>n+1);tick.current?.();},1000);
    return()=>clearInterval(timer);
  },[active,paused,background]);
  return {seconds,background};
}

export function useFinish(onFinish) {
  const finished=useRef(false);
  return useCallback(result=>{if(!finished.current){finished.current=true;onFinish(result);}},[onFinish]);
}

export function useLabSound(enabled) {
  const context=useRef(null);
  useEffect(()=>()=>{context.current?.close().catch(()=>{});},[]);
  return useCallback((type='click')=>{
    if(!enabled)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{
      const audio=context.current||(context.current=new Audio());
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const oscillator=audio.createOscillator(),gain=audio.createGain();
      oscillator.type='sine';oscillator.frequency.value=type==='success'?740:type==='warning'?190:420;
      gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.15);
      oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.16);
    }catch{/* Audio is optional and must never interrupt a mission. */}
  },[enabled]);
}
