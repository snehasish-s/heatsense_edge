import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ title, label='INTERACTIVE EXPERIENCE', onClose, children, className='' }) {
  const ref=useRef(null);
  useEffect(()=>{
    const dialog=ref.current;
    const focus=document.activeElement;
    const previous=document.body.style.overflow;
    dialog.showModal();document.body.style.overflow='hidden';
    return ()=>{dialog.close();document.body.style.overflow=previous;if(focus instanceof HTMLElement)focus.focus({preventScroll:true});};
  },[]);
  return createPortal(<dialog ref={ref} aria-label={title} className={`experience-modal ${className}`} onCancel={e=>{e.preventDefault();onClose();}}><header className="modal-topbar"><div><span className="eyebrow">{label}</span><strong>{title}</strong></div><button className="modal-close" aria-label="Close experience" onClick={onClose}><X size={18}/><span>Close</span></button></header><div className="modal-scroll">{children}</div></dialog>,document.body);
}
