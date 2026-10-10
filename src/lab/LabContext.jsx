import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { emptyProgress, PROGRESS_KEY, readProgress, recordResult } from './progress';
import { useLabSound } from './useMission';
const LabContext=createContext(null);
export function LabProvider({children}) {
  const [progress,setProgress]=useState(()=>{try{return readProgress(window.localStorage);}catch{return emptyProgress();}});
  const [storageNotice,setStorageNotice]=useState('');
  const current=useRef(progress);
  const sound=useLabSound(progress.sound);
  const save=useCallback(next=>{current.current=next;setProgress(next);try{window.localStorage.setItem(PROGRESS_KEY,JSON.stringify(next));setStorageNotice('');}catch{setStorageNotice('Browser storage is unavailable. Scores are kept for this visit only.');}},[]);
  const report=useCallback((id,result)=>{const update=recordResult(current.current,id,result);save(update.progress);return update.unlocked;},[save]);
  const toggleSound=()=>{save({...current.current,sound:!current.current.sound});};
  return <LabContext.Provider value={{progress,report,toggleSound,sound,storageNotice}}>{children}</LabContext.Provider>;
}
export const useLab=()=>useContext(LabContext);
