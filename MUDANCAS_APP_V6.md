# 🔄 Monitor Atleta v6: Guia de Mudanças

## 📝 Alterações Necessárias no App

### **1. Atualizar MICRO (Microciclo Padrão)**

**ANTES:**
```javascript
const MICRO = {
  1:{ dia:'SEG', rot:'Z2 fácil 40–50min + 6–8 strides', tipo:'Fácil', ... },
  2:{ dia:'TER', rot:'CHAVE 1 + Musculação inferior', tipo:'Chave', chave:1, ... },
  3:{ dia:'QUA', rot:'Bike / Elíptico Z2 30–45min', tipo:'Cross', ... },
  4:{ dia:'QUI', rot:'CHAVE 2', tipo:'Chave', chave:2, ... },
  5:{ dia:'SEX', rot:'Z2 fácil 40–50min + 6–8 strides', tipo:'Fácil', ... },
  // ...
};
```

**DEPOIS:**
```javascript
const MICRO = {
  1:{ 
    dia:'SEG', 
    rot:'Calistenia 1: Crow Pose + Plyometria', 
    tipo:'Calistenia',
    calisth:{ ex:8, nome:'Crow Pose', nivel:'Basic', equip:'None' },
    extra:'RPE 6–7 | Hold 15–20s | 4–5 séries | 90s rest'
  },
  2:{ 
    dia:'TER', 
    rot:'CHAVE 1 (LT2 só)', 
    tipo:'Chave', 
    chave:1, 
    lib:'LT2', 
    extra:'Qualidade pura | Sem musculação TER'
  },
  3:{ 
    dia:'QUA', 
    rot:'Calistenia 2: Front Lever + Muscle-Up + Bar Core', 
    tipo:'Calistenia',
    calisth:{ ex:'prog', nome:'Força Explosiva', nivel:'Intermediate' },
    extra:'RPE 6–7 | Técnica e controle'
  },
  4:{ 
    dia:'QUI', 
    rot:'M2 Full-body MODERADO + CHAVE 2', 
    tipo:'Chave', 
    chave:2, 
    lib:'LT1', 
    extra:'M2 → 15–20min → CHAVE 2 | Compatibilidade verificada'
  },
  5:{ 
    dia:'SEX', 
    rot:'Z2 fácil 40–50min + 6–8 strides', 
    tipo:'Fácil', 
    pace:'5:45–6:15', 
    fc:[140,152], 
    min:45, 
    lib:'Z2', 
    extra:'Full body / superior'
  },
  6:{ 
    dia:'SÁB', 
    rot:'Longo progressivo', 
    tipo:'Longo', 
    pace:'5:30→5:15', 
    fc:[140,162], 
    min:60, 
    lib:'LONGO', 
    extra:'Sem qualidade nas 24h seguintes'
  },
  0:{ 
    dia:'DOM', 
    rot:'Bike / Elíptico Z2 ou descanso', 
    tipo:'Cross', 
    pace:'—', 
    fc:[125,150], 
    min:30, 
    lib:'CROSS', 
    extra:'Opcional · pernas leves'
  }
};
```

---

### **2. Adicionar Progressão de Calistenia**

**Nova seção no state:**
```javascript
const [caliProgress, setCaliProgress] = useState({
  ex: 8,  // Começando em exercício 8
  nome: 'Crow Pose',
  nivel: 'Basic',
  equip: 'None',
  holdDuration: [],  // Array de durações (segundos) por semana
  targetDuration: 30,  // Target 30s hold
  startDate: '2026-08-04',
  timeline: {
    'Semana 1–2': { hold: '5–10s', rpe: '5–6', series: '4–5' },
    'Semana 3–4': { hold: '15–20s', rpe: '6–7', series: '4–5' },
    'Semana 5–6': { hold: '25–30s', rpe: '6–7', series: '3–4', milestone: 'Pronto para Dips (#9)' }
  },
  executionGuide: {
    1: 'Lean on your hands (cotovelos ligeiramente bent)',
    2: 'Position knees directly above elbows',
    3: 'Shift body weight to hands (core ativo)',
    4: 'Eyes directed toward floor',
    5: 'Hold position, breathing steady'
  }
});
```

---

### **3. Nova Aba ou Card: "Progressão Calistenia"**

Adicionar dentro de `<nav>` (abas):
```javascript
<button onClick={() => setTab('calistenia')} 
        style={{ ...botãoAbaTyle, opacity: tab === 'calistenia' ? 1 : 0.5 }}>
  🤸 Calistenia
</button>
```

Conteúdo da aba (dentro do `{(() => { switch(tab) { case 'calistenia': return (...) } })()}`):
```javascript
case 'calistenia': return (
  <>
    <Card>
      <Eyebrow icon={Target}>Progressão: Exercício {caliProgress.ex}</Eyebrow>
      <div style={{ fontSize:18, fontWeight:700, color:T.coral, marginBottom:10 }}>
        {caliProgress.nome} ({caliProgress.nivel})
      </div>
      
      <div style={{ background:T.lift, borderRadius:10, padding:15, marginBottom:15 }}>
        <div style={{ fontSize:11, color:T.t3, fontFamily:T.mono, textTransform:'uppercase', marginBottom:5 }}>
          Hold Duration Progress
        </div>
        <div style={{ fontSize:16, fontWeight:700, fontFamily:T.disp, color:T.cyan }}>
          {caliProgress.holdDuration.length > 0 
            ? `${Math.max(...caliProgress.holdDuration)}s` 
            : 'Começar agora!'}
        </div>
        <div style={{ fontSize:10, color:T.t2, marginTop:5 }}>
          Target: {caliProgress.targetDuration}s | Status: 
          {caliProgress.holdDuration.length > 0 && caliProgress.holdDuration[caliProgress.holdDuration.length-1] >= caliProgress.targetDuration 
            ? ' ✓ Alcançado!' 
            : caliProgress.holdDuration.length > 0 
              ? ` ${Math.round((Math.max(...caliProgress.holdDuration) / caliProgress.targetDuration) * 100)}% completo`
              : ' Não iniciado'}
        </div>
      </div>

      <div style={{ marginBottom:15 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.t3, marginBottom:8, textTransform:'uppercase' }}>
          Execução (passo-a-passo)
        </div>
        {Object.entries(caliProgress.executionGuide).map(([step, desc]) => (
          <div key={step} style={{ fontSize:12, color:T.t2, marginBottom:6, display:'flex', gap:8 }}>
            <span style={{ color:T.cyan, fontWeight:700, minWidth:24 }}>
              {step}.
            </span>
            <span>{desc}</span>
          </div>
        ))}
      </div>

      <div style={{ background:T.lift, borderRadius:10, padding:12, marginBottom:15 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.amber, marginBottom:8, textTransform:'uppercase' }}>
          Registrar Hold Hoje
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input 
            type="number" 
            placeholder="Segundos" 
            min="0" 
            max="60"
            id="holdInput"
            style={{ flex:1, padding:'8px 10px', fontSize:12, borderRadius:7, 
                     border:`1px solid ${T.brd}`, background:T.card, color:T.t1 }}
          />
          <button 
            onClick={() => {
              const val = parseInt(document.getElementById('holdInput').value);
              if (val > 0) {
                setCaliProgress(prev => ({
                  ...prev,
                  holdDuration: [...prev.holdDuration, val]
                }));
                document.getElementById('holdInput').value = '';
                setToast(`✓ Hold ${val}s registrado!`);
              }
            }}
            style={{ padding:'8px 15px', background:T.coral, color:'#000', fontWeight:700,
                     border:'none', borderRadius:7, cursor:'pointer', fontSize:11 }}>
            Registrar
          </button>
        </div>
      </div>

      <div style={{ background:T.lift, borderRadius:10, padding:12 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.t3, marginBottom:8, textTransform:'uppercase' }}>
          Timeline (4–6 semanas até domínio)
        </div>
        {Object.entries(caliProgress.timeline).map(([periodo, dados]) => (
          <div key={periodo} style={{ marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${T.brd}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.cyan }}>{periodo}</div>
            <div style={{ fontSize:10, color:T.t2, marginTop:4 }}>
              Hold: <span style={{ fontFamily:T.mono }}>{dados.hold}</span> | 
              RPE: <span style={{ fontFamily:T.mono }}>{dados.rpe}</span> | 
              Séries: <span style={{ fontFamily:T.mono }}>{dados.series}</span>
            </div>
            {dados.milestone && (
              <div style={{ fontSize:10, color:T.mint, marginTop:4, fontWeight:700 }}>
                🎯 Milestone: {dados.milestone}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <Eyebrow icon={TrendingUp}>Próximos Skills (Roadmap)</Eyebrow>
      <div style={{ fontSize:11, color:T.t2, lineHeight:1.8 }}>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontWeight:700, color:T.t1, marginBottom:4 }}>9. Dips</div>
          <div style={{ fontSize:10, color:T.t3 }}>Parallel Bars | After dominating Crow Pose (~6 semanas)</div>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontWeight:700, color:T.t1, marginBottom:4 }}>10. Toes To Bar</div>
          <div style={{ fontSize:10, color:T.t3 }}>High Bar | Core & abdominal focus</div>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontWeight:700, color:T.t1, marginBottom:4 }}>14. L-Sit</div>
          <div style={{ fontSize:10, color:T.t3 }}>Parallettes | Static hold, core + hip flexors</div>
        </div>
      </div>
    </Card>
  </>
);
```

---

### **4. Alertas Específicos para Quinta (M2 + Chave 2)**

Adicionar no card de sessão quinta:
```javascript
{sSel?.dia === 'QUI' && (
  <div style={{ background:'#E24E8055', border:`1px solid ${T.red}`, 
                borderRadius:8, padding:10, marginTop:10, fontSize:10 }}>
    <div style={{ fontWeight:700, color:T.red, marginBottom:5 }}>
      ⚠️ Quinta: Validar Compatibilidade
    </div>
    <div style={{ color:T.t2, lineHeight:1.6 }}>
      • M2 moderado (8–10 reps) → qualidade força<br/>
      • Intervalo 15–20min entre sessões<br/>
      • CHAVE 2 (LT1 cont.) não é explosiva<br/>
      • ACWR esperado: 1.0–1.2<br/>
      • <strong>Validação: Ratrear HRV quinta de manhã</strong><br/>
      • Se HRV &gt; -5% vs baseline → OK<br/>
      • Se HRV &lt; -5% → Reduz M2 RPE próxima semana
    </div>
  </div>
)}
```

---

### **5. Atualizar Microciclo M1 (específico para Limiar)**

```javascript
const MACRO = [
  { 
    k:'M1', 
    nome:'Limiar Intensivo', 
    emoji:'🟡', 
    cor:T.amber, 
    periodo:'Jul–Set 2026', 
    meta:'~22:30',
    foco:'Elevar o limiar de lactato (LT2). Hoje ~5:00/km @170bpm → meta ~4:45/km.',
    musc:'Hipertrofia (8–12 reps). TER: CHAVE 1 só. QUI: M2 + CHAVE 2. SEX: full body. Calistenia: SEG + QUA.',
    c1lib:'LT2', 
    c2lib:'LT1',
    avisoReorg:'🔄 REORGANIZAÇÃO ATIVA (ago 2026): Terça = Chave 1 só | Quinta = M2 + Chave 2 | Calistenia: SEG + QUA',
    // ... resto igual
  },
  // ...
];
```

---

### **6. Adicionar Botão "Validar Compatibilidade" na Semana**

Dentro do card de macrociclo (quando ativo M1):
```javascript
{ativo && (
  <>
    {/* ... conteúdo existente ... */}
    
    <button 
      onClick={() => {
        setToast(`✓ Semana ${posHoje.nSem}: ACWR rastreado. Quinta: HRV ${hrv}bpm (validar compatibilidade M2+Chave2)`);
      }}
      style={{ marginTop:10, padding:'8px 12px', background:T.coral, color:'#000',
               fontWeight:700, border:'none', borderRadius:7, cursor:'pointer', fontSize:10 }}>
      Validar Compatibilidade Esta Semana
    </button>
  </>
)}
```

---

### **7. Chart de ACWR com Alertas para Terça+Quinta**

Adicionar no card de ACWR (Performance Management):
```javascript
// Dentro do componente ACWR
const diasDuros = [1, 3];  // Terça (1) e Quinta (3)
const acrwColor = (acwr, dayOfWeek) => {
  if (dayOfWeek === 1 || dayOfWeek === 3) {  // Dias duros
    return acwr > 1.5 ? T.red : acwr > 1.2 ? T.amber : T.mint;
  }
  return acwr > 1.3 ? T.red : acwr > 1.1 ? T.amber : T.mint;
};
```

---

## 🔄 Resumo das Mudanças

| Componente | Antes | Depois | Benefício |
|-----------|-------|--------|-----------|
| **SEG** | Z2 + Calistenia genérica | Calistenia 1 (Crow Pose) | Progressão skill estruturada |
| **TER** | M2 + CHAVE 1 | CHAVE 1 só | CNS 100% fresco, LT2 consistente |
| **QUA** | Bike Z2 | Calistenia 2 (força explosiva) | Força dinâmica + transferência |
| **QUI** | CHAVE 2 | M2 + CHAVE 2 | Compatibilidade validada |
| **Estado** | Sem cali tracking | Com progressão ex. 8 | Dados hold duration + milestone |
| **Aba** | 5 abas | + aba Calistenia | Interface dedicada progresso |
| **Alertas** | Genéricos | Quinta: validação HRV | Feedback real compatibilidade |

---

##  ✅ Checklist de Implementação

- [ ] Atualizar `MICRO` com nova estrutura (SEG, TER, QUA, QUI)
- [ ] Adicionar `caliProgress` state com exercício 8 (Crow Pose)
- [ ] Criar aba "Calistenia" com card de progressão
- [ ] Adicionar input para registrar hold duration
- [ ] Implementar timeline 4–6 semanas
- [ ] Adicionar alerta quintal (HRV validation)
- [ ] Atualizar MACRO (M1) com aviso reorganização
- [ ] Teste em incognito (localStorage)
- [ ] Validar ACWR Terça + Quinta (esperado 1.0–1.2)

---

## 🎯 Próximas Ações

1. **Aplicar mudanças** ao seu app v5
2. **Testar SEG** (primeira calistenia)
3. **Validar TER** (Chave 1 só — rastrear pace 4:50–5:05)
4. **Monitorar QUI** (M2 + Chave 2 — HRV de manhã)
5. **Registrar hold times** (Crow Pose SEG + QUA)
6. **Revisar em 4 semanas** (Crow Pose 20–25s? ACWR 0.8–1.3? HRV estável?)

---

**Versão**: Monitor Atleta v6 | **Data**: Agosto 2026 | **Status**: Pronto para implementação
