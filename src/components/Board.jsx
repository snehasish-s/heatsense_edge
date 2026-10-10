import { useId } from 'react';

// Conceptual UNO Q illustration, drawn as SVG rather than a product photograph.
export default function Board({ className = '', active = 'both' }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`uno-board ${className}`} viewBox="0 0 620 420" role="img" aria-label="Stylized Arduino UNO Q circuit board with a Linux processor, real-time MCU and connecting bridge">
    <defs>
      <linearGradient id={`${id}pcb`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#187370" /><stop offset=".48" stopColor="#10534f" /><stop offset="1" stopColor="#073b3c" /></linearGradient>
      <linearGradient id={`${id}chip`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#394247" /><stop offset=".5" stopColor="#171e22" /><stop offset="1" stopColor="#0b1013" /></linearGradient>
      <linearGradient id={`${id}metal`} x1="0" x2="1"><stop stopColor="#748080" /><stop offset=".25" stopColor="#e0e7df" /><stop offset=".5" stopColor="#8d9c99" /><stop offset=".8" stopColor="#c4d0c9" /><stop offset="1" stopColor="#5c6e6d" /></linearGradient>
      <pattern id={`${id}mesh`} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6" fill="#9cdbc2" opacity=".2" /></pattern>
      <filter id={`${id}glow`}><feGaussianBlur stdDeviation="4" /></filter>
    </defs>
    <path d="M81 68H500L539 108V332L517 355H81Z" fill="#042426" stroke="#021a1c" strokeWidth="12" transform="translate(0 12)" />
    <path d="M81 68H500L539 108V332L517 355H81Z" fill={`url(#${id}pcb)`} stroke="#55a898" strokeWidth="1.5" />
    <path d="M81 68H500L539 108V332L517 355H81Z" fill={`url(#${id}mesh)`} />
    <g fill="none" stroke="#6ac6a6" strokeWidth="1" opacity=".36">
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${180 + i * 9} 110V${136 + i * 4}L${245 + i * 9} ${187 + i * 4}H${380 + i * 5}V310`} />)}
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M126 ${164 + i * 12}H${159 + i * 8}L${210 + i * 8} ${220 + i * 6}V313`} />)}
      <path d="M440 104V152L488 200V292H455M445 263H497V322H370M350 173H405L454 124V100M125 132H158V92H365" />
    </g>
    <g fill="#17211f" stroke="#75a598" strokeWidth="2">{[[101,88],[512,120],[101,333],[512,332]].map(([x,y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="9" fill="#b9c8aa"/><circle cx={x} cy={y} r="4.5" /></g>)}</g>
    <g fill="#10191b" stroke="#031c1e" strokeWidth="3">
      <rect x="164" y="81" width="136" height="26" rx="2" /><rect x="313" y="81" width="135" height="26" rx="2" />
      <rect x="173" y="313" width="120" height="25" rx="2" /><rect x="306" y="313" width="142" height="25" rx="2" />
    </g>
    <g fill="#adac80">{Array.from({ length: 20 }, (_, i) => <g key={i}><rect x={172+i*13.5+(i>9?14:0)} y="88" width="6" height="11" rx="1"/><rect x={181+i*12.5+(i>8?12:0)} y="320" width="5" height="10" rx="1"/></g>)}</g>
    <g fill="#e5eddd" opacity=".7" fontFamily="monospace" fontSize="6"><text x="168" y="76">DIGITAL / PWM</text><text x="340" y="76">GPIO · COMMUNICATION</text><text x="178" y="349">POWER</text><text x="342" y="349">ANALOG IN</text></g>
    <g fill={`url(#${id}metal)`} stroke="#718480" strokeWidth="1"><rect x="58" y="132" width="69" height="66" rx="4"/><rect x="57" y="138" width="12" height="53" rx="2" fill="#a8b7ad"/><rect x="57" y="145" width="8" height="37" rx="3" fill="#192627"/><path d="M76 132V198M113 133V197"/><rect x="64" y="241" width="61" height="49" rx="3"/></g>
    <rect x="59" y="248" width="20" height="35" rx="4" fill="#0b1518" stroke="#536b66" strokeWidth="3"/><circle cx="68" cy="265" r="6" fill="#263638"/>
    <g fill="#c6cdb0">{Array.from({ length: 15 }, (_, i) => <g key={i}><rect x={222+i*7} y="145" width="3" height="10"/><rect x={222+i*7} y="257" width="3" height="10"/><rect x="209" y={161+i*6} width="9" height="3"/><rect x="333" y={161+i*6} width="9" height="3"/></g>)}</g>
    <rect x="219" y="154" width="111" height="103" rx="3" fill={`url(#${id}chip)`} stroke="#52655e"/>
    <rect x="228" y="163" width="93" height="84" rx="2" fill="none" stroke="#66726a" strokeWidth=".5"/>
    <g fill="#c8d7ce" fontFamily="monospace" textAnchor="middle"><text x="275" y="195" fontSize="11" letterSpacing="2">LINUX</text><text x="275" y="213" fontSize="8" opacity=".65">EDGE COMPUTE</text><text x="275" y="235" fontSize="6" opacity=".4">UNO Q / HEATSENSE</text></g>
    <circle cx="228" cy="165" r="2" fill="#8f9c92" />
    <g fill="#c6cdb0">{Array.from({ length: 8 }, (_, i) => <g key={i}><rect x={383+i*5} y="192" width="2" height="9"/><rect x={383+i*5} y="249" width="2" height="9"/><rect x="372" y={207+i*5} width="8" height="2"/><rect x="424" y={207+i*5} width="8" height="2"/></g>)}</g>
    <rect x="380" y="201" width="44" height="48" rx="2" fill={`url(#${id}chip)`} stroke="#658779"/><text x="402" y="222" textAnchor="middle" fill="#c6d1c3" fontFamily="monospace" fontSize="7">STM32</text><text x="402" y="235" textAnchor="middle" fill="#84938a" fontFamily="monospace" fontSize="6">MCU</text>
    <g fill="#233b38" stroke="#9daf9d" strokeWidth=".6">{[[157,155],[158,179],[155,207],[180,276],[349,275],[457,211],[476,253],[353,151]].map(([x,y],i)=><g key={i}><rect x={x} y={y} width="17" height="9" rx="1"/><rect x={x} y={y} width="3" height="9" fill="#acb59b"/><rect x={x+14} y={y} width="3" height="9" fill="#acb59b"/></g>)}</g>
    <g fill={`url(#${id}metal)`}><circle cx="144" cy="251" r="9"/><circle cx="146" cy="284" r="9"/><rect x="357" y="170" width="10" height="17" rx="3"/></g>
    <rect x="467" y="146" width="28" height="26" rx="2" fill="#172422" stroke="#98ac97"/><circle cx="481" cy="159" r="7" fill="#c0c6b3"/>
    <g fill="#c6e0ce"><path d="M377 132c-13-17-37 13-24 17 10 5 24-20 34-19 17 0 15 25 2 20l-9-9" fill="none" stroke="#d4e9d7" strokeWidth="3"/><text x="421" y="149" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="23">UNO Q</text><text x="457" y="294" fontSize="8" fontFamily="monospace" letterSpacing="1">ARDUINO</text></g>
    <path className="board-signal" d="M330 225H356L372 219H380" fill="none" stroke="#a2f4c9" strokeWidth="2"/>
    <path className="board-signal" d="M402 200V179L430 151V107" fill="none" stroke="#a2f4c9" strokeWidth="1.5" />
    <g className="board-led"><circle cx="464" cy="185" r="9" fill="#83ffc6" opacity=".65" filter={`url(#${id}glow)`}/><rect x="460" y="182" width="8" height="5" rx="1" fill="#c8ffd9"/></g>
    <rect x={active === 'mcu' ? 373 : 212} y={active === 'mcu' ? 194 : 147} width={active === 'mcu' ? 58 : 125} height={active === 'mcu' ? 62 : 117} rx="6" fill="none" stroke="#a5f8d1" opacity=".22" />
  </svg>;
}
