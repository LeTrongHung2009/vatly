import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { 
  Play, Pause, RefreshCw, Trash2, Settings, 
  Menu, X, ZoomIn, ZoomOut, MousePointer2, 
  Activity, Radio, Zap, Battery, Magnet,
  Undo, Copy, Clipboard, Disc, Grip,
  Turtle, Bug, Calculator, Crosshair, 
  TrendingUp, Divide, Tv, Lightbulb, Waves,
  Maximize2 // Icon phóng to
} from 'lucide-react';

// --- DATA: TOOLBOX ---
const TOOLBOX = [
  {
    id: 'chap1', title: 'Dao Động Cơ', color: 'bg-orange-50 text-orange-600',
    items: [
      { 
        type: 'SPRING_OSC', label: 'Lò xo', icon: <Activity size={24}/>, 
        params: { mode: 'param', k: 50, m: 1, A: 4, phi: 0, damping: 0, eq: '4 * cos(2*t)', showGraph: false, graphScale: 1 }, 
        color: '#F97316' 
      },
      { 
        type: 'PENDULUM', label: 'Con lắc đơn', icon: <Disc size={24}/>, 
        params: { mode: 'param', l: 2, m: 1, alpha0: 10, damping: 0, eq: '10 * cos(3*t)', showGraph: false, graphScale: 1 }, 
        color: '#3B82F6' 
      },
    ]
  },
  {
    id: 'chap2', title: 'Sóng Cơ', color: 'bg-teal-50 text-teal-600',
    items: [
      { 
        type: 'WAVE_SOURCE', label: 'Nguồn sóng tròn', icon: <Radio size={24}/>, 
        params: { mode: 'param', f: 1, A: 2, v: 10, eq: '2 * cos(2*pi*1*t - 0.5*r)', showGraph: false, graphScale: 1 }, 
        color: '#06B6D4' 
      },
      { 
        type: 'STANDING_WAVE', label: 'Sóng dừng (Dây)', icon: <Waves size={24}/>, 
        params: { mode: 'param', f: 1, A: 2, length: 10, loops: 3, eq: '4 * sin(1*x) * cos(3*t)', showGraph: false, graphScale: 1 }, 
        color: '#10B981' 
      },
    ]
  },
  {
    id: 'chap5', title: 'Sóng Ánh Sáng', color: 'bg-yellow-50 text-yellow-600',
    items: [
      { type: 'LIGHT_SOURCE', label: 'Nguồn Laser', icon: <Lightbulb size={24}/>, params: { lambda: 0.6, intensity: 1, angle: 0 }, color: '#EF4444' },
      { type: 'DOUBLE_SLIT', label: 'Khe Young', icon: <Divide size={24} className="rotate-90"/>, params: { a: 2, width: 8 }, color: '#334155' },
      { type: 'SCREEN', label: 'Màn chắn', icon: <Tv size={24}/>, params: { height: 15 }, color: '#1E293B' },
    ]
  },
  {
    id: 'chap3', title: 'Điện Từ', color: 'bg-purple-50 text-purple-600',
    items: [
      { type: 'POINT_CHARGE', label: 'Điện tích', icon: <Zap size={24}/>, params: { q: 5 }, color: '#EF4444' },
      { type: 'CAPACITOR', label: 'Tụ điện', icon: <Battery size={24} className="rotate-90"/>, params: { U: 10, d: 2 }, color: '#6366F1' },
    ]
  }
];

const HIT_RADIUS = 40;

const PhysicsSandboxV16 = () => {
  // --- STATE ---
  const [entities, setEntities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  
  // History & Settings
  const [history, setHistory] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 40 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [slowFactor, setSlowFactor] = useState(1.0);
  const [debugMode, setDebugMode] = useState(false);

  // UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Ref State (Fix Ghosting)
  const stateRef = useRef({ entities, view, time, isPlaying, slowFactor, canvasSize, debugMode, selectedId });
  useEffect(() => { stateRef.current = { entities, view, time, isPlaying, slowFactor, canvasSize, debugMode, selectedId }; }, [entities, view, time, isPlaying, slowFactor, canvasSize, debugMode, selectedId]);

  // Interaction Refs
  const dragRef = useRef({ isDragging: false, targetId: null, startX: 0, startY: 0, initialObjX: 0, initialObjY: 0 });
  const panRef = useRef({ isPanning: false, startX: 0, startY: 0, initialViewX: 0, initialViewY: 0 });

  // --- AUTO RESIZE ---
  useLayoutEffect(() => {
    const updateSize = () => { if (containerRef.current) setCanvasSize({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight }); };
    window.addEventListener('resize', updateSize); updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // --- COORDINATES ---
  const worldToScreen = (wx, wy, cSize, v) => ({ x: cSize.w/2 + v.x + wx*v.scale, y: cSize.h/2 + v.y - wy*v.scale });
  const screenToWorld = (sx, sy, cSize, v) => ({ x: (sx - cSize.w/2 - v.x)/v.scale, y: -(sy - cSize.h/2 - v.y)/v.scale });

  // --- PARSE EQUATION ---
  const evaluateEquation = (eqStr, t, x = 0) => {
      try {
          const safeStr = eqStr.toLowerCase()
              .replace(/pi/g, 'Math.PI').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos')
              .replace(/abs/g, 'Math.abs').replace(/\^/g, '**');
          return new Function('t', 'x', 'r', `return ${safeStr}`)(t, x, x); 
      } catch (e) { return 0; }
  };

  // --- GAME LOOP ---
  const animate = useCallback(() => {
    const { isPlaying, slowFactor } = stateRef.current;
    if (isPlaying) setTime(prev => prev + (0.02 / slowFactor));
    draw();
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => { requestRef.current = requestAnimationFrame(animate); return () => cancelAnimationFrame(requestRef.current); }, [animate]);

  // --- SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedId) { saveHistory(); setEntities(p => p.filter(e => e.id !== selectedId)); setSelectedId(null); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') handleUndo();
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedId) { const e = entities.find(i => i.id === selectedId); if(e) setClipboard(e); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) { saveHistory(); setEntities(p => [...p, { ...clipboard, id: Date.now(), x: clipboard.x+1, y: clipboard.y-1 }]); }
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, entities, clipboard, history]);

  // --- MOUSE HANDLERS ---
  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const { entities, view, canvasSize } = stateRef.current;
    
    let clicked = null;
    for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        const pos = worldToScreen(ent.x, ent.y, canvasSize, view);
        const r = (ent.type === 'STANDING_WAVE' || ent.type === 'SCREEN') ? 60 : HIT_RADIUS;
        if (Math.hypot(x - pos.x, y - pos.y) < r) { clicked = ent; break; }
    }

    if (clicked) {
        saveHistory(); setSelectedId(clicked.id);
        dragRef.current = { isDragging: true, targetId: clicked.id, startX: x, startY: y, initialObjX: clicked.x, initialObjY: clicked.y };
        setInspectorOpen(true);
    } else {
        panRef.current = { isPanning: true, startX: x, startY: y, initialViewX: view.x, initialViewY: view.y };
        setSelectedId(null);
    }
  };

  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const { view } = stateRef.current;

    if (dragRef.current.isDragging) {
        const dx = (x - dragRef.current.startX) / view.scale;
        const dy = -(y - dragRef.current.startY) / view.scale;
        setEntities(p => p.map(e => e.id === dragRef.current.targetId ? { ...e, x: dragRef.current.initialObjX + dx, y: dragRef.current.initialObjY + dy } : e));
    } else if (panRef.current.isPanning) {
        setView(p => ({ ...p, x: panRef.current.initialViewX + (x - panRef.current.startX), y: panRef.current.initialViewY + (y - panRef.current.startY) }));
    }
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    dragRef.current.isDragging = false; panRef.current.isPanning = false;
  };

  // --- DRAWING ENGINE ---
  const draw = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { canvasSize, view, entities, time, debugMode, selectedId } = stateRef.current;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
    if (canvasSize.w === 0) return;

    drawGrid(ctx, canvasSize.w, canvasSize.h, view);

    entities.forEach(ent => {
        ctx.save();
        const pos = worldToScreen(ent.x, ent.y, canvasSize, view);
        ctx.translate(pos.x, pos.y);
        
        if (debugMode) { ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fillStyle='red'; ctx.fill(); }

        try {
           switch(ent.type) {
               case 'SPRING_OSC': drawSpring(ctx, ent, time, view.scale); break;
               case 'PENDULUM': drawPendulum(ctx, ent, time, view.scale); break;
               case 'WAVE_SOURCE': drawWave(ctx, ent, time, view.scale); break;
               case 'STANDING_WAVE': drawStandingWave(ctx, ent, time, view.scale); break;
               case 'LIGHT_SOURCE': drawLightSource(ctx, ent, view.scale); break;
               case 'DOUBLE_SLIT': drawDoubleSlit(ctx, ent, view.scale); break;
               case 'SCREEN': drawScreen(ctx, ent, view.scale, entities); break;
               case 'POINT_CHARGE': drawCharge(ctx, ent, view.scale); break;
               case 'CAPACITOR': drawCapacitor(ctx, ent, view.scale); break;
               default: break;
           }
        } catch(e) {}
        ctx.restore();
    });

    if(selectedId) {
        const ent = entities.find(e=>e.id===selectedId);
        if(ent) {
            const pos = worldToScreen(ent.x, ent.y, canvasSize, view);
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            drawSelectionCorners(ctx, pos.x, pos.y, ent.type.includes('WAVE') || ent.type==='SCREEN' ? 60 : 40);
        }
    }
  };

  // --- RENDERERS ---

  // 1. WAVE SOURCE
  const drawWave = (ctx, ent, t, s) => {
      const { mode, f, v, A, eq, color, showGraph, graphScale } = ent.params;
      
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0,0, 6, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      
      if (mode === 'equation') {
          ctx.beginPath(); ctx.arc(0,0, s*2 + (t*20)%50, 0, Math.PI*2); ctx.stroke();
      } else {
          const lambda = v / f;
          for (let k = 0; k < 10; k++) {
              const r = ((v * t) % lambda) + k * lambda;
              if (r > 15) continue;
              ctx.globalAlpha = Math.max(0, 1 - r/10); 
              ctx.beginPath(); ctx.arc(0, 0, r * s, 0, Math.PI*2); ctx.stroke();
          }
          ctx.globalAlpha = 1;
      }

      if (showGraph) {
          let val = (mode === 'equation') ? evaluateEquation(eq, t, 0) : A * Math.cos(2 * Math.PI * f * t);
          drawOscillationGraph(ctx, t, val, s, color, 'u(0,t)', graphScale || 1);
      }
  };

  // 2. STANDING WAVE
  const drawStandingWave = (ctx, ent, t, s) => {
      const { mode, f, A, length, loops, eq, color, showGraph, graphScale } = ent.params;
      const L_px = length * s;
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      const startX = -L_px / 2; ctx.moveTo(startX, 0);
      const steps = 100; 
      for (let i = 0; i <= steps; i++) {
          const x_world = (i / steps) * length;
          let u = 0;
          if (mode === 'equation') u = evaluateEquation(eq, t, x_world);
          else u = 2 * A * Math.sin((loops * Math.PI / length) * x_world) * Math.cos(2 * Math.PI * f * t);
          ctx.lineTo(startX + i * (L_px / steps), -u * s * 0.5);
      }
      ctx.stroke();
      ctx.fillStyle = '#333'; ctx.fillRect(startX - 3, -6, 6, 12); ctx.fillRect(startX + L_px - 3, -6, 6, 12);

      if (showGraph) {
          const x_belly = length / (2 * (loops || 1));
          let val = (mode === 'equation') ? evaluateEquation(eq, t, x_belly) : 2 * A * Math.sin((loops * Math.PI / length) * x_belly) * Math.cos(2 * Math.PI * f * t);
          drawOscillationGraph(ctx, t, val, s, color, `u(${x_belly.toFixed(1)},t)`, graphScale || 1);
      }
  };

  // 3. GRAPH HELPER (ZOOMABLE)
  const drawOscillationGraph = (ctx, t, val, s, color, label, scale = 1) => {
      ctx.save(); 
      // Dời vị trí và scale
      const boxW = 120 * scale;
      const boxH = 80 * scale;
      ctx.translate(s * 1.5, -s * 1.5); 
      
      // Hộp nền
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; 
      ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 5;
      ctx.fillRect(0, -boxH + 20, boxW, boxH); // Anchor bottom-left
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.strokeRect(0, -boxH + 20, boxW, boxH);

      // Trục toạ độ
      const midY = -boxH + 20 + boxH/2;
      ctx.beginPath(); ctx.strokeStyle = '#94a3b8';
      ctx.moveTo(0, midY); ctx.lineTo(boxW, midY); // Trục t
      ctx.moveTo(5, -boxH + 20); ctx.lineTo(5, 20); // Trục u
      ctx.stroke();

      // Vẽ đường
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2 * scale; // Nét dày hơn khi zoom
      const points = 60;
      for(let i = 0; i < points; i++) {
          const dt = i * 0.05;
          // Giả lập
          const plotX = boxW - i * (2 * scale);
          const plotY = midY - (val * Math.cos(2*i*0.2)) * (5 * scale);
          if (i===0) ctx.moveTo(plotX, midY - val * (5*scale)); else ctx.lineTo(plotX, plotY);
      }
      ctx.stroke();

      // Text
      ctx.fillStyle = '#475569'; ctx.font = `${10 * scale}px monospace`; 
      ctx.fillText(label, 10 * scale, midY - (boxH/2 - 15*scale));
      
      ctx.restore();
  };

  // 4. OTHER RENDERERS
  const drawSpring = (ctx, ent, t, s) => { 
      const { mode, k, m, A, phi, eq, showGraph, graphScale, color } = ent.params; 
      let x = mode==='equation' ? evaluateEquation(eq, t) : A * Math.cos(Math.sqrt(k/m)*t + phi); 
      ctx.fillStyle='#64748B'; ctx.fillRect(-10,-s*3,20,10); ctx.beginPath(); ctx.moveTo(0,-s*3); const len=s*3+x*s; 
      for(let i=0;i<=10;i++) ctx.lineTo(i%2?5:-5, -s*3+(i/10)*len); ctx.stroke(); 
      ctx.fillStyle=ent.color; ctx.beginPath(); ctx.arc(0,x*s,s*0.4,0,Math.PI*2); ctx.fill(); 
      if(showGraph) drawOscillationGraph(ctx, t, x, s, color, 'x(t)', graphScale || 1); 
  };
  const drawPendulum = (ctx, ent, t, s) => { 
      const { mode, l, alpha0, eq, showGraph, graphScale, color } = ent.params; 
      let a = mode==='equation' ? evaluateEquation(eq, t)*(Math.PI/180) : alpha0*(Math.PI/180)*Math.cos(Math.sqrt(9.8/l)*t); 
      const bx=l*s*Math.sin(a), by=l*s*Math.cos(a); 
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(bx,by); ctx.stroke(); 
      ctx.beginPath(); ctx.arc(bx,by,s*0.3,0,Math.PI*2); ctx.fillStyle=ent.color; ctx.fill(); 
      if(showGraph) drawOscillationGraph(ctx, t, a, s, color, 'α(t)', graphScale || 1); 
  };
  // (Giữ các hàm Light, Slit, Screen, Charge... như V15)
  const drawLightSource = (ctx, ent, s) => { const {lambda}=ent.params; ctx.fillStyle=ent.color; ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=ent.color; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(s*10,0); ctx.stroke(); ctx.setLineDash([]); ctx.fillText(`λ=${lambda}µm`,0,-15); };
  const drawDoubleSlit = (ctx, ent, s) => { const {a,width}=ent.params; const gap=(a/1000)*s*100, h=s*width; ctx.fillStyle=ent.color; ctx.fillRect(-2,-h/2,4,(h-gap)/2); ctx.fillRect(-2,gap/2,4,(h-gap)/2); ctx.fillRect(-2,-gap/6,4,gap/3); };
  const drawScreen = (ctx, ent, s, allEnts) => { const {height}=ent.params, h=height*s; ctx.fillStyle=ent.color; ctx.fillRect(-2,-h/2,4,h); const slit=allEnts.find(e=>e.type==='DOUBLE_SLIT'), light=allEnts.find(e=>e.type==='LIGHT_SOURCE'); if(slit&&light&&ent.x>slit.x){ const D=Math.abs(ent.x-slit.x), a=slit.params.a*1e-3, lam=light.params.lambda*1e-6, i=(lam*D)/a, pat=20; for(let y=-h/2; y<h/2; y++){ const I=Math.pow(Math.cos((Math.PI*(y/s))/i),2); ctx.fillStyle=light.color; ctx.globalAlpha=I; ctx.fillRect(0,y,pat,1); } ctx.globalAlpha=1; } };
  const drawCharge = (ctx, ent, s) => { ctx.fillStyle=ent.color; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); ctx.fillStyle='white'; ctx.textAlign='center'; ctx.fillText('+',0,4); };
  const drawCapacitor = (ctx, ent, s) => { ctx.fillStyle='#333'; ctx.fillRect(-20,-50,10,100); ctx.fillRect(20,-50,10,100); };
  const drawGrid = (ctx, w, h, v) => { const s=v.scale, cx=w/2+v.x, cy=h/2+v.y, sx=cx%s, sy=cy%s; ctx.strokeStyle='#E2E8F0'; ctx.beginPath(); for(let x=sx;x<w;x+=s){ctx.moveTo(x,0);ctx.lineTo(x,h)} for(let y=sy;y<h;y+=s){ctx.moveTo(0,y);ctx.lineTo(w,y)} ctx.stroke(); ctx.strokeStyle='#94A3B8'; ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,h); ctx.moveTo(0,cy); ctx.lineTo(w,cy); ctx.stroke(); };
  const drawSelectionCorners = (ctx, x, y, r) => { const l=10; ctx.strokeStyle='#F59E0B'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-r,y-r+l);ctx.lineTo(x-r,y-r);ctx.lineTo(x-r+l,y-r); ctx.moveTo(x+r-l,y-r);ctx.lineTo(x+r,y-r);ctx.lineTo(x+r,y-r+l); ctx.moveTo(x-r,y+r-l);ctx.lineTo(x-r,y+r);ctx.lineTo(x-r+l,y+r); ctx.moveTo(x+r-l,y+r);ctx.lineTo(x+r,y+r);ctx.lineTo(x+r,y+r-l); ctx.stroke(); };

  // --- ACTIONS ---
  const saveHistory = () => { setHistory(p => { const n = [...p, JSON.stringify(entities)]; if(n.length>20) n.shift(); return n; }); };
  const handleUndo = () => { if(history.length===0) return; const last = history[history.length-1]; setEntities(JSON.parse(last)); setHistory(p => p.slice(0,-1)); };
  const updateParam = (id, k, v) => { setEntities(p => p.map(e => e.id === id ? { ...e, params: { ...e.params, [k]: v } } : e)); };

  return (
    <div className="flex w-full h-full bg-slate-50 overflow-hidden font-sans text-slate-800 relative select-none">
      <div className={`absolute inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 border-r flex flex-col`}>
         <div className="h-14 bg-[#0D205C] text-white flex items-center justify-between px-4 shrink-0"><span className="font-bold flex items-center gap-2"><Settings size={18}/> Toolbox</span><button onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={18}/></button></div>
         <div className="flex-1 overflow-y-auto p-4 space-y-6">
             {TOOLBOX.map(g => (
                 <div key={g.id}><h3 className={`font-bold text-xs uppercase mb-3 px-2 py-1 rounded w-fit ${g.color}`}>{g.title}</h3>
                     <div className="grid grid-cols-2 gap-2">{g.items.map((it, idx) => (
                         <button key={idx} onClick={() => { saveHistory(); setEntities(p => [...p, { ...it, id:Date.now(), x:0, y:0 }]); }} className="flex flex-col items-center justify-center p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"><div style={{color: it.color}} className="mb-1">{it.icon}</div><span className="text-[11px] font-bold text-slate-600 text-center">{it.label}</span></button>
                     ))}</div>
                 </div>
             ))}
         </div>
      </div>
      <div className="flex-1 flex flex-col relative h-full">
         <div className="h-14 bg-white border-b flex items-center justify-between px-4 z-40 shadow-sm shrink-0">
             <div className="flex items-center gap-2">
                 <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2"><Menu size={20}/></button>
                 <div className="flex bg-gray-100 rounded-lg p-1 items-center gap-1">
                     <button onClick={()=>setIsPlaying(!isPlaying)} className={`p-1.5 rounded-md ${isPlaying?'bg-white text-blue-600 shadow-sm':'text-gray-500'}`}>{isPlaying?<Pause size={18}/>:<Play size={18}/>}</button>
                     <button onClick={()=>{setTime(0);}} className="p-1.5 rounded-md text-gray-500 hover:text-red-500"><RefreshCw size={18}/></button>
                     <div className="flex items-center pl-2 ml-1 border-l border-gray-300 gap-2"><Turtle size={16} className="text-gray-500"/><input type="number" min="1" step="0.1" value={slowFactor} onChange={(e)=>{ let v = parseFloat(e.target.value); if(v<1) v=1; setSlowFactor(v); }} className="w-14 h-6 text-xs font-mono font-bold text-center border rounded focus:ring-1 outline-none"/></div>
                 </div>
             </div>
             <div className="flex gap-2"><button onClick={() => setView(p=>({...p, scale: Math.max(10, p.scale-5)}))} className="p-2 text-gray-500"><ZoomOut size={18}/></button><button onClick={() => setView(p=>({...p, scale: Math.min(200, p.scale+5)}))} className="p-2 text-gray-500"><ZoomIn size={18}/></button><button onClick={() => setInspectorOpen(!inspectorOpen)} className={`p-2 rounded ${inspectorOpen?'bg-blue-50 text-blue-600':'text-gray-500'}`}><Settings size={18}/></button></div>
         </div>
         <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#f8fafc] touch-none">
             <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} className="block"/>
             {inspectorOpen && (
                 <div className="absolute top-4 right-4 w-80 max-h-[85%] bg-white/95 backdrop-blur shadow-xl rounded-2xl border border-gray-100 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
                     {selectedId && entities.find(e=>e.id===selectedId) ? (
                         (() => {
                            const ent = entities.find(e=>e.id===selectedId);
                            return (
                             <>
                                 <div className="p-3 border-b bg-gray-50 flex justify-between items-center sticky top-0"><h4 className="font-bold text-[#0D205C] flex items-center gap-2"><Grip size={16}/> {ent.label}</h4><button onClick={()=>{saveHistory(); setEntities(p=>p.filter(e=>e.id!==selectedId));}} className="text-red-500 bg-white border p-1.5 rounded"><Trash2 size={16}/></button></div>
                                 <div className="p-4 space-y-4">
                                     {ent.params.hasOwnProperty('showGraph') && (
                                         <div className="bg-indigo-50 p-2 rounded border border-indigo-100 space-y-2">
                                             <div className="flex items-center justify-between">
                                                 <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs"><TrendingUp size={16}/> Hiện đồ thị</div>
                                                 <input type="checkbox" checked={ent.params.showGraph} onChange={(e)=>updateParam(ent.id, 'showGraph', e.target.checked)} className="accent-indigo-600"/>
                                             </div>
                                             {ent.params.showGraph && (
                                                 <div className="flex items-center gap-2 border-t border-indigo-200 pt-2">
                                                     <Maximize2 size={12} className="text-indigo-500"/>
                                                     <span className="text-[10px] text-indigo-600 font-bold">Kích thước:</span>
                                                     <input type="range" min="1" max="3" step="0.1" value={ent.params.graphScale || 1} onChange={(e)=>updateParam(ent.id, 'graphScale', parseFloat(e.target.value))} className="flex-1 h-1 bg-indigo-200 rounded accent-indigo-600"/>
                                                     <span className="text-[10px] font-mono w-4">{ent.params.graphScale || 1}x</span>
                                                 </div>
                                             )}
                                         </div>
                                     )}
                                     {ent.params.hasOwnProperty('mode') && ( <div className="bg-blue-50 p-2 rounded-lg flex gap-2"><button onClick={()=>updateParam(ent.id, 'mode', 'param')} className={`flex-1 py-1 text-xs font-bold rounded ${ent.params.mode==='param'?'bg-white shadow text-blue-600':'text-gray-500'}`}>Tham số</button><button onClick={()=>updateParam(ent.id, 'mode', 'equation')} className={`flex-1 py-1 text-xs font-bold rounded ${ent.params.mode==='equation'?'bg-white shadow text-blue-600':'text-gray-500'}`}>Phương trình</button></div> )}
                                     {Object.entries(ent.params).map(([k, v]) => {
                                         if (['mode', 'showGraph', 'graphScale'].includes(k)) return null;
                                         if (ent.params.mode === 'param' && k === 'eq') return null;
                                         if (ent.params.mode === 'equation' && ['k','m','A','phi','l','alpha0','damping','f','v','loops','length'].includes(k)) return null;
                                         return ( <div key={k} className="group"><div className="flex justify-between mb-1 items-center"><label className="text-xs font-bold text-gray-500 capitalize flex items-center gap-1">{k === 'eq' ? <Calculator size={12}/> : null} {k}</label>{typeof v === 'number' && (<input type="number" value={v} onChange={(e) => updateParam(ent.id, k, parseFloat(e.target.value))} className="w-16 text-right text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1 rounded border-none outline-none focus:ring-1"/>)}</div>{k === 'eq' ? (<textarea value={v} onChange={(e)=>updateParam(ent.id, k, e.target.value)} className="w-full text-xs font-mono border rounded p-2 focus:ring-2 ring-blue-500 outline-none h-16" placeholder="VD: 2*cos(2*t - 0.5*r)"/>) : typeof v === 'number' ? (<input type="range" min={k==='k'?10:0} max={k==='k'?200:20} step={0.1} value={v} onChange={(e)=>updateParam(ent.id, k, parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>) : typeof v === 'boolean' ? (<input type="checkbox" checked={v} onChange={(e)=>updateParam(ent.id, k, e.target.checked)}/>) : null}</div> );
                                     })}
                                 </div>
                             </>
                            );
                         })()
                     ) : ( <div className="flex flex-col items-center justify-center h-48 text-gray-400"><Crosshair size={32} className="opacity-30 mb-2"/><p className="text-xs font-medium">Chọn vật thể</p></div> )}
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default PhysicsSandboxV16;