export function stateTransitions(previous, next, time) {
  if(!previous || !next)return [];
  const events=[];
  if(typeof previous.bridge_connected==='boolean'&&typeof next.bridge_connected==='boolean'&&previous.bridge_connected!==next.bridge_connected){events.push({field:'bridge_connected',text:next.bridge_connected?'Arduino Bridge connected':'Arduino Bridge disconnected'});}
  if(previous.bridge_connected===true&&next.bridge_connected===true){
    for(const field of ['occupancy','persona','risk']){
      if(previous[field]!=null&&next[field]!=null&&previous[field]!==next[field]){
        const text=field==='occupancy'?(next.occupancy==='OCCUPIED'?'PIR detected occupancy':'Room became empty'):field==='persona'?`Persona changed → ${next.persona}`:`Risk changed → ${next.risk}`;
        events.push({field,text});
      }
    }
  }
  return events.map((event,index)=>({...event,time,id:`${time}-${event.field}-${index}`}));
}
