# 🎯 Dashboard: Reorganização de Treino Marlos

> **Status**: ✅ Pronto para implementação  
> **Data**: Agosto 2026 | **M1**: Limiar Intensivo  
> **Meta**: Sub-20:00 em 5km | **Fat Loss**: Preservando força

---

## 🔄 Antes vs. Depois

### **ANTES (Problema)**

```
TER → M2 (full-body) + CHAVE 1 (LT2)
      ↓ Sobrecarga CNS
      ↓ Pace variável
      ❌ CONFLITO FORÇA/CORRIDA
```

### **DEPOIS (Otimizado)**

```
SEG → Calistenia 1 (Crow Pose)  [Progressão skill]
TER → CHAVE 1 (LT2 só)          [CNS fresco, qualidade]
QUA → Calistenia 2 (força explosiva) [Dinâmica]
QUI → M2 + CHAVE 2              [Compatibilidade validada]
```

---

## 📊 Impacto Esperado (4–6 semanas)

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| **CNS Terça** | Fatigado | Fresco | ↑↑ Qualidade LT2 |
| **CHAVE 1 pace** | 4:50–5:10 ±variável | 4:50–5:05 ±2s | ↑ Consistência |
| **Calistenia** | Genérica | Crow Pose (#8) | ↑↑ Progressão estruturada |
| **ACWR semanal** | Picos altos TER | Distribuído TER+QUI | ↑ Tolerância |
| **Recuperação HRV** | DOM fatigado | DOM fresco | ↑ Quality of sleep |
| **Força preservada** | M2 movido | M2 em quinta (validado) | ✓ Nenhuma perda |

---

## ⚙️ Componentes da Mudança

### **1️⃣ Segunda: Calistenia Progressiva**

🎯 **Objetivo**: Progressão estruturada de skill (ex. 8 → 9 → 14)

**Exercício 8: Crow Pose (Bakasana)**
- Nível: Basic → Intermediate
- O que treina: Braços, ombros, core + equilíbrio
- Frequência: SEG + QUA (2x/sem)

**Timeline (4–6 semanas)**:
1. **Semana 1–2**: Hold 5–10s | RPE 5–6
2. **Semana 3–4**: Hold 15–20s | RPE 6–7
3. **Semana 5–6**: Hold 25–30s | RPE 6–7 → **Milestone: Pronto para Dips (#9)**

**Execução**:
```
1. Lean on hands (cotovelos bent)
2. Knees above elbows
3. Shift weight to hands
4. Eyes to floor
5. Hold, breathing steady
```

**App**: Input para registrar hold times + timeline visual

---

### **2️⃣ Terça: CHAVE 1 Exclusiva (Qualidade Máxima)**

🎯 **Objetivo**: Elevar LT2, seu gargalo real

| Parâmetro | Valor |
|-----------|-------|
| **Pace** | 4:50–5:05 /km |
| **FC** | 167–173 bpm |
| **Duração** | 30–40 min |
| **Zona** | LT2 (limiar) |
| **RPE** | 8–9 (dia duro) |
| **Musculação** | ❌ NENHUMA (TER é dia de corrida pura) |
| **Validação** | Pace repetido? Consistência? |

**Benefício**:
- ✓ CNS 100% para qualidade
- ✓ Sem fadiga residual de força
- ✓ Melhor transfer para 5km

**App**: Rastrear pace ±5s (meta: 4:50–5:05)

---

### **3️⃣ Quarta: Calistenia 2 (Força Explosiva)**

🎯 **Objetivo**: Força dinâmica + controle + transferência

**Sessão típica**:
- Front Lever progression (pulls, negatives, hold)
- Muscle-Up (ring ou bar)
- Bar core (weighted ab work)

| Parâmetro | Valor |
|-----------|-------|
| **RPE** | 6–7 (moderado) |
| **Foco** | Técnica, controle, estabilidade |
| **Frequência** | 1x/sem (QUA) |
| **Duração** | 40–50 min |

**Benefício**:
- ✓ Força explosiva = economia 5km
- ✓ Skills avançadas (front lever → planche)
- ✓ Transferência força/velocidade

**App**: Manter estrutura anterior, nomear como "Calistenia 2"

---

### **4️⃣ Quinta: M2 + CHAVE 2 (Compatibilidade Validada)**

🎯 **Objetivo**: Força pura + qualidade 5km, sem conflito

**Sequência**:
1. **M2 full-body** (8–10 reps) → 30–40 min | RPE 6–7
2. **Intervalo**: 15–20 min (hidratação, carbs)
3. **CHAVE 2 (LT1)** → 20–25 min | RPE 6–7

| Parâmetro | M2 | CHAVE 2 |
|-----------|-----|---------|
| **Pace** | — | 5:20–5:30 /km |
| **FC** | — | 155–162 bpm |
| **Tipo** | Força moderada | LT1 contínuo |
| **ACWR esperado** | 1.0–1.2 (normal dia duro) | |

**Validação (⚠️ CRÍTICO)**:
- ✓ HRV quinta de manhã: estável vs baseline?
- ✓ Se HRV > -5% → OK (continua)
- ✓ Se HRV < -5% → M2 RPE cai de 7 para 6

**App**:
- Alerta na quinta: "Validar HRV de manhã"
- Compatibilidade com justificativa
- Ordem: M2 → intervalo → CHAVE 2

---

## 📈 Crow Pose: Rastreamento em Tempo Real

### **Sua Progressão**

```javascript
// State que será adicionado ao app
caliProgress: {
  ex: 8,
  nome: 'Crow Pose',
  nivel: 'Basic',
  equip: 'None',
  holdDuration: [],  // [5, 7, 8, 10, 12, 15, ...] segundos
  targetDuration: 30,
  startDate: '2026-08-04',
  timeline: {
    'Semana 1–2': { hold: '5–10s', rpe: '5–6', series: '4–5' },
    'Semana 3–4': { hold: '15–20s', rpe: '6–7', series: '4–5' },
    'Semana 5–6': { hold: '25–30s', rpe: '6–7', series: '3–4', milestone: '🎯 Pronto para Dips (#9)' }
  }
}
```

### **Input no App**

```
Registrar Hold Hoje
┌─────────────────────────┐
│ [  20  ] Segundos       │
│ [ Registrar ]           │
└─────────────────────────┘

✓ Hold 20s registrado!
```

### **Próximos Skills (Roadmap)**

```
🎯 #8 Crow Pose      [VOCÊ ESTÁ AQUI] (ago–set 2026)
  ↓
🎯 #9 Dips           (set–out 2026)
  ↓
🎯 #14 L-Sit         (out–nov 2026)
  ↓
🎯 #26 Ring Muscle-Up (future)
  ↓
🎯 #32 Front Lever   (future advanced)
```

---

## ⚠️ Alertas & Validações

### **Quinta (M2 + CHAVE 2)**

```
╔════════════════════════════════════════════╗
║ ⚠️  VALIDAÇÃO: Compatibilidade M2 + Chave 2 ║
╠════════════════════════════════════════════╣
║                                            ║
║ • M2 moderado (8–10 reps) ≠ ultra-intens  ║
║ • Intervalo 15–20min entre sessões         ║
║ • CHAVE 2 (LT1) ≠ explosiva                ║
║ • ACWR esperado: 1.0–1.2 ✓                ║
║                                            ║
║ VALIDAÇÃO REAL:                            ║
║ Rastrear HRV quinta de manhã               ║
║ Se > -5% vs baseline → OK ✓               ║
║ Se < -5% → Reduz M2 RPE próxima semana   ║
║                                            ║
╚════════════════════════════════════════════╝
```

### **Terça (CHAVE 1)**

```
✓ CHAVE 1 é DIA DURO (sem musculação)
✓ Meta: Pace 4:50–5:05 repetido
✓ CNS 100% fresco (máxima qualidade)
✓ Zero fadiga residual de força
```

---

## 📋 Checklist de Implementação

- [ ] **App V6**: Atualizar MICRO (nova estrutura)
- [ ] **App V6**: Adicionar aba "Calistenia"
- [ ] **App V6**: Input Crow Pose hold times
- [ ] **App V6**: Timeline 4–6 semanas visual
- [ ] **App V6**: Alerta quinta (HRV validation)
- [ ] **App V6**: Atualizar MACRO (M1 com reorganização)
- [ ] **Testes**: Incognito (localStorage)
- [ ] **Segunda ago 11**: Começar Crow Pose (baseline)
- [ ] **Terça ago 12**: CHAVE 1 só (rastrear pace)
- [ ] **Quinta ago 14**: M2 + CHAVE 2 (HRV manhã)
- [ ] **Revisão ago 25**: Validar impacto real

---

## 🎯 Metas de 4 Semanas

| Métrica | Target | Validação |
|---------|--------|-----------|
| **Crow Pose Hold** | 20–25s | Progressão linear |
| **CHAVE 1 Pace** | 4:50–5:05 ±2s | Repetido 3x/mês |
| **HRV Quinta** | Estável vs BL | Sem queda >5% |
| **ACWR Semanal** | 0.8–1.3 | Dentro range |
| **M2 Compatibilidade** | ✓ OK | RPE 6–7 sustentável |
| **Força Preservada** | Sem queda | Mesmos pesos M1 |

---

## 🚀 Cronograma Próximo

```
SEG 11 ago   → Calistenia 1 (Crow Pose) INÍCIO
TER 12 ago   → CHAVE 1 só (validar pace)
QUA 13 ago   → Calistenia 2 (manter)
QUI 14 ago   → M2 + CHAVE 2 (teste compatibilidade)

FIM SEMANA 1 (ago 17) → Análise ACWR + HRV

SEG 18–25 ago → 2ª semana (continue registrando)

DOM 25 ago   → REVISÃO (4 semanas desde início)
             ✓ Crow hold 20–25s?
             ✓ CHAVE 1 consistente?
             ✓ HRV estável?
             ✓ ACWR 0.8–1.3?
             → Decisão: Continua ou ajusta
```

---

## 💡 Insights Coach

**Por que essa reorganização funciona:**

1. **Terça 100% LT2**: Seu gargalo real. CNS fresco = qualidade máxima = progressão LT2
2. **Quinta compatível**: M2 (força mod) + CHAVE 2 (LT1 contínuo) = diferentes janelas fisiológicas = sinergia, não conflito
3. **Calistenia estruturada**: Ex. 8→9→14 = progressão real, não genérica. Transfer para 5km (core explosivo = economia)
4. **Distribuição de carga**: TER + QUI duros, não só TER = tolerância > ACWR, recuperação melhor
5. **Fat loss + performance**: Força preservada (M1, M2, M3 íntegra) = velocidade 5km não sofre

---

## 📚 Documentação Disponível

1. **RELATORIO_REORGANIZACAO_TREINO.md**
   - Análise completa com justificativa fisiológica
   - Cronograma 4–6 semanas
   - Impacto por dia da semana

2. **MUDANCAS_APP_V6.md**
   - Código específico (copy-paste)
   - Estrutura MICRO atualizada
   - Componentes React calistenia
   - Alertas quinta

3. **RESUMO_IMPLEMENTACAO.txt**
   - Quick reference visual
   - Timeline pronta para imprimir

---

## ✅ Status Final

> **Reorganização**: ✅ Aprovada e otimizada  
> **App**: 🔧 Pronto para implementar (v6)  
> **Calistenia**: 🤸 Crow Pose (#8) estruturada  
> **Validação**: ⚠️ Rastrear HRV quinta  
> **Meta sub-20**: 🎯 Estrutura preservada e aprimorada

---

**Implementação**: Próxima segunda (ago 11)  
**Revisão**: ago 25  
**Coach**: Marlos | **Data**: Agosto 2026 | **Macrociclo**: M1

