export const PREDICTIONS = [
  {temperature:26,humidity:40,activity:0,persona:'GENERAL',radiant:0},
  {temperature:31,humidity:55,activity:0,persona:'GENERAL',radiant:0},
  {temperature:34,humidity:68,activity:1,persona:'WORKER',radiant:0},
  {temperature:37,humidity:76,activity:2,persona:'WORKER',radiant:0},
  {temperature:29,humidity:65,activity:0,persona:'ELDERLY',radiant:2},
  {temperature:33,humidity:72,activity:1,persona:'CHILD',radiant:2},
  {temperature:35,humidity:80,activity:1,persona:'ELDERLY',radiant:1},
  {temperature:31,humidity:45,activity:2,persona:'GENERAL',radiant:1},
];
export const ACTIONS={cool:'Move to cooler area',rest:'Take a cooling break',water:'Arrange drinking water',assist:'Ask someone to check in',adult:'Arrange adult supervision',heavy:'Continue heavy activity',ignore:'Ignore the warning',vent:'Ventilate if outdoors is cooler'};
export const PERSONA_MISSIONS=[
  {persona:'ELDERLY',temperature:34,humidity:72,activity:0,brief:'An older visitor is waiting alone. Prioritize a cooler setting, assistance, and access to drinking water.',best:['cool','assist','water'],options:['ignore','water','assist','heavy','cool','vent'],why:'The mission prioritizes changing the exposure first, arranging a person to check in next, and providing water. Individual needs and real conditions can change priorities.'},
  {persona:'WORKER',temperature:35,humidity:70,activity:2,brief:'A worker is doing heavy manual work. Pause the work, relocate the break, then arrange water.',best:['rest','cool','water'],options:['heavy','water','vent','cool','ignore','rest'],why:'A cooling break removes the workload; taking that break somewhere cooler removes heat exposure. Hydration complements these changes.'},
  {persona:'CHILD',temperature:33,humidity:74,activity:1,brief:'A child is playing without an adult nearby. Arrange supervision, a cooler place, then water.',best:['adult','cool','water'],options:['water','heavy','ignore','adult','vent','cool'],why:'The scenario needs an adult to supervise the response. Moving to a cooler place and arranging drinking water follow. The child should not manage the response alone.'},
  {persona:'GENERAL',temperature:36,humidity:66,activity:1,brief:'An adult is standing in a hot room. Change the environment, pause activity, then arrange water.',best:['cool','rest','water'],options:['vent','water','heavy','rest','ignore','cool'],why:'The mission prioritizes lowering exposure and activity. Water supports the response but does not cool the room itself.'},
];
export function priorityPoints(order,best,seconds){return Math.min(250,best.reduce((sum,id,index)=>sum+(order.slice(0,3).includes(id)?40:0)+(order[index]===id?30:0),0)+Math.max(0,40-Math.floor(seconds)));}
export const SENSOR_NAMES=['PIR','BME688','BH1750','MPU6050','DS18B20','OLED'];
export const FAULT_TYPES=['Loose connection','Impossible reading','Sensor disconnected','Data frozen','Normal behaviour'];
export const DETECTIVE_CASES=[
  {sensor:'BME688',type:'Impossible reading',clue:'A quiet, stable room. One reading changes far faster than the environment can.',evidence:'BME688: 31.0 → 31.1 → 95.0°C in one second. The other sensors remain stable.',series:[31,31,31.1,31,95],values:{BME688:'95.0°C'},why:'The abrupt isolated jump needs validation. Flag this reading rather than treating it as a trustworthy measurement.'},
  {sensor:'DS18B20',type:'Sensor disconnected',clue:'The globe probe is missing from the latest bus scan.',evidence:'DS18B20: 3 consecutive timeouts. Device address missing. No valid measurement returned.',series:[32,32,32,0,0],values:{DS18B20:'NO RESPONSE'},why:'No response is missing data, not a zero-degree room. The interface should mark the probe unavailable.'},
  {sensor:'PIR',type:'Data frozen',clue:'The room has been empty for five minutes, beyond the configured hold period.',evidence:'PIR: output stays HIGH. The empty-room test and configured hold time rule out ordinary motion.',series:[1,1,1,1,1],values:{PIR:'HIGH · 5 MIN'},why:'A stuck signal can imitate occupancy. Compare signal history with the controlled empty-room test before trusting it.'},
  {sensor:'BH1750',type:'Loose connection',clue:'A lit room. The light reading drops out when its connector is gently moved.',evidence:'BH1750: 520 → 0 → 518 → 0 lx. The connector visibly lifts under the test.',series:[520,0,518,0,520],values:{BH1750:'0 ↔ 520 lx'},why:'Intermittent readings plus a visibly loose connector point to a connection issue. Zero light alone would not prove a fault.'},
  {sensor:'BME688',type:'Data frozen',clue:'The sensor sample timestamp stops advancing while the room warms.',evidence:'BME688: exactly 31.20°C for 120 s; timestamp unchanged. DS18B20 changes from 32 to 34°C.',series:[31.2,31.2,31.2,31.2,31.2],values:{BME688:'31.20°C · STALE',DS18B20:'34.0°C'},why:'A stale timestamp makes the reading unreliable even though the temperature itself looks plausible.'},
];
export const NORMAL_READINGS={PIR:'MOTION / IDLE',BME688:'31.2°C · 62% RH',BH1750:'520 lx',MPU6050:'LOW ACTIVITY',DS18B20:'32.0°C',OLED:'DISPLAY OK'};
