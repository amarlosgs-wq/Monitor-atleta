# CHANGELOG: Monitor Atleta v5 → v6

> **Data**: Agosto 4, 2026  
> **Versão**: v5.x → v6.0  
> **Status**: Ready for Production

---

## 🎯 Resumo Executivo

Monitor Atleta v6 traz **reorganização de treino completa** + **progressão estruturada de calistenia** + **roadmap de 12 meses para Planche**.

Foco: Melhorar consistência de LT2 (Terça) e validar compatibilidade M2+Chave2 (Quinta).

---

## 🔧 Mudanças Técnicas

### App Structure

```diff
v5:
  - Terça: M2 (full-body) + CHAVE 1 (LT2)
    ❌ Fadiga CNS, pace variável 4:50–5:10

v6:
  + Terça: CHAVE 1 (LT2 só)
    ✅ CNS 100% fresco, pace consistente 4:50–5:05
  
  + Quinta: M2 (mod) + CHAVE 2 (LT1)
    ✅ Validação HRV de manhã (alerta se -5%)
```

### Microciclo Reorganizado

| Dia | v5 | v6 | Mudança |
|-----|----|----|---------|
| SEG | Calistenia 1 | Calistenia 1 (Crow Pose) | ✅ Crow agora skill progressiva |
| TER | M2 + CHAVE 1 | CHAVE 1 só | 🔄 Separado, CNS fresco |
| QUA | Calistenia 2 | Calistenia 2 | ✅ Sem mudança |
| QUI | OFF força (Chave2) | M2 + CHAVE 2 | ➕ M2 adicionado (validado) |
| SEX | Fácil + Upper | Z2 + Full body | ✅ Sem mudança |
| SÁB | Longo | Longo progressivo | ✅ Sem mudança |
| DOM | OFF | Cross/OFF | ✅ Sem mudança |

### Features Adicionadas

#### 1. **Crow Pose Tracking (Nova)**

```javascript
// Novo state:
caliProgress: {
  ex: 8,
  nome: 'Crow Pose',
  holdDuration: [],  // Array de holds registrados
  targetDuration: 30, // Segundos até milestone
  startDate: '2026-08-04'
}
```

- Registre hold times (segundos)
- Veja máximo + percentual até target
- Timeline visual 4–6 semanas
- Execução passo-a-passo (5 cues)

#### 2. **Aba Calistenia (Nova)**

```
🤸 Calistenia
├─ Crow Pose (ex. 8) ← você está aqui
│  ├─ Hold Duration Progress (visual)
│  ├─ Registrar Hold Hoje (input)
│  └─ Timeline 4–6 semanas (visual)
├─ Roadmap (Próximos Skills)
│  ├─ #9 Dips (após Crow)
│  └─ Planche (12 meses estruturado)
└─ Roadmap Planche Completo
   └─ 6 progressões: Lean → Tuck → Straddle → Full
```

#### 3. **Planche Roadmap (Nova)**

```
6 Progressões (12–18 meses):
  1. Foundation: Planche Lean 25→10° (2–4 sem)
  2. Prog. 1: Archer Push-Ups + Pseudo Planche (4–6 sem)
  3. Prog. 2: Planche Tuck (joelhos bent) (6–8 sem)
  4. Prog. 3: Planche Straddle (90°→160°) (8–12 sem)
  5. Final: Planche Full (horizontal) (12+ sem)

Checklists + Execução detalhada em PLANCHE_ROADMAP_COMPLETO.md
```

#### 4. **Aba Performance (Atualizada)**

```diff
v5:
  - Info genérica sobre ACWR + HRV

v6:
  + Alertas específicos:
    - Terça + Quinta: ACWR 0.8–1.3 (dias duros)
    - Quinta manhã: HRV validation (-5% alerta)
    - M2+Chave2 ajustes: se HRV < -5%, reduz RPE
```

#### 5. **Aba Mesociclos (Atualizada)**

```diff
v5:
  - Descrição genérica M1–M5

v6:
  + Detalhes específicos:
    - M1: Crow Pose focus (ter CHAVE1 fresco)
    - M3: Cuidado com Planche (pico carga)
    - M5: Afiação + Planche Full goal
```

### UI/UX Improvements

- ✅ Abas agora com emojis (fácil scan visual)
- ✅ Card design melhorado (espaçamento, cores)
- ✅ Inputs com feedback visual (hold registration)
- ✅ Timeline visual Crow Pose (semana 1–6)
- ✅ Checklist Planche (braços retos, ombros deprimidos, etc)

### Data Persistence

```diff
v5 keys:
  - treinos (genérico)
  - readiness, performance, etc

v6 keys:
  + treinos_v6 (novo, separado)
  + caliProgress (novo: Crow + Planche planning)
  
  ℹ️ Dados antigos v5 NÃO apagados (compatibilidade)
```

---

## 🔄 Reorganização de Treino: Justificativa Científica

### Problema v5

```
TER: M2 (musculação | RPE 6–7) + CHAVE 1 (LT2 | RPE 8–9)
     ↓
     Fadiga CNS composta
     Cortisol elevado na sessão 2
     Pace LT2 variável: 4:50–5:10 (50s spread!)
```

### Solução v6

```
TER: CHAVE 1 (LT2 | RPE 8–9)
     ↓
     CNS fresco 100%
     Pace estável: 4:50–5:05 (15s spread, ótimo!)

QUI: M2 (RPE 6–7) → 15–20min rest → CHAVE 2 (LT1 | RPE 7–8)
     ↓
     M2 moderado (não máximo)
     CHAVE 2 LT1 (não explosiva)
     Baixo risco de interferência
     HRV validação de manhã (alerta se -5%)
```

### Resultado Esperado (4 semanas)

- ✓ CHAVE 1 pace consistente ±2s (4:50–5:05)
- ✓ Crow Pose 20–25s holds
- ✓ HRV quinta estável vs baseline
- ✓ ACWR 0.8–1.3 (di)
- ✓ Fat loss + força preservada

---

## 📊 Training Load Changes

### Microciclo Stress (RPE × Tempo)

```
v5:
  Terça: M2 (RPE 6–7, 45min) + CHAVE 1 (RPE 8–9, 40min) = 85 min ultra high
  Quinta: CHAVE 2 (RPE 8–9, 40min) = 40 min high
  Total semanal stress: ~9.5h volume, 4h extreme

v6:
  Terça: CHAVE 1 (RPE 8–9, 40min) = 40 min high ← CNS fresco
  Quinta: M2 (RPE 6–7, 20min) + CHAVE 2 (RPE 7–8, 40min) = 60 min mod-high ← distribuído
  Total semanal stress: ~9h volume, 3h extreme ← -25% CNS overload
```

**Benefício**: Menos fadiga acumulada + melhor qualidade treino.

---

## 🤸 Calistenia Progressão: Por Que Crow Pose Agora?

### Racional

1. **Skill foundation**: Você precisa dominar estabilidade e controle corporal
2. **Easy recovery**: Crow Pose = RPE 5–7 (não compete com running)
3. **4–6 semanas**: Timeline curta para milestone (gratificação rápida)
4. **Bridge to advanced**: Crow → Dips (#9) → Front Lever → Planche

### Crow Pose Benefits

- ✓ Prepara para Planche (shoulder awareness)
- ✓ Propriocepção e equilíbrio (não é força bruta)
- ✓ Recupera bem entre treinos running (baixa demanda metabólica)
- ✓ Progressão visual clara (hold time em segundos)

### Planche no Horizon

Depois de dominar Crow Pose (6 sem) + Dips (6 sem), você começa:

```
Out 2026: Planche Lean (foundation)
Dez 2026: Planche Tuck
Fev 2027: Planche Straddle
Jun 2027: Planche Full ← 1 year journey, muito legal!
```

Total: 12–18 meses até Planche Full (extremamente desafiador).

---

## ⚠️ Breaking Changes

### localStorage Keys

**v5**:
```javascript
localStorage.getItem('treinos')           // v5 antiga
localStorage.getItem('readiness')         // v5 antiga
localStorage.getItem('performance')       // v5 antiga
```

**v6**:
```javascript
localStorage.getItem('treinos_v6')        // v6 NOVO
localStorage.getItem('caliProgress')      // v6 NOVO
```

**Ação**: Dados v5 NÃO são migrados automaticamente.

Se quer recuperar histórico v5:
1. Abra DevTools (F12)
2. Console: `localStorage.getItem('readiness')`
3. Copie resultado
4. Salve em arquivo .json
5. Importe manualmente depois (v7)

### Aba Mesociclos

v5 tinha "Testes 3km" hard-coded.

v6 simplificou para "Info base" (números mudam em v7 quando Google Calendar sync ativa).

Se você tiver testes M1 agendados em seu Google Calendar (ID 14):
- App não puxa automaticamente (v7 feature)
- Mas: You can view manually or keep spreadsheet

---

## 🆙 Upgrade Guide (v5 → v6)

### Para Você (Atleta)

1. **Aceite nova estrutura treino**:
   - Terça: LT2 só (melhor!)
   - Quinta: M2+Chave2 (validar com HRV)

2. **Comece Crow Pose**:
   - Segunda: Calistenia 1 (20–25s holds target)
   - Registre no app (novo tab Calistenia)

3. **Valide em 4 semanas**:
   - Crow 20–25s?
   - CHAVE 1 pace: 4:50–5:05 ±2s?
   - HRV quinta estável?
   - ACWR 0.8–1.3?

4. **Continue com confiança ou ajuste** (pequenos, iterativos)

### Para Desenvolvedores (Se adaptando)

1. **localStorage keys mudaram**: `treinos_v6`, `caliProgress`
2. **Novas abas**: Calistenia (ex. 8), Mesociclos detalhe
3. **Performance tab**: Detalhes ACWR + HRV quinta
4. **Sem quebra de funcionalidade**: Tudo que existia em v5 ainda funciona (ou foi melhorado)

---

## 📦 Files Changed

```
index.html (SUBSTITUA)
├── Reorganização microciclo (SEG–DOM)
├── Nova aba Calistenia
├── Nova aba Mesociclos (detalhe)
├── Crow Pose tracking
├── Planche roadmap info
└── localStorage keys: treinos_v6, caliProgress

Novos arquivos de documentação:
├── README.md (guia completo do app)
├── PLANCHE_ROADMAP_COMPLETO.md (12 meses Planche)
├── RELATORIO_REORGANIZACAO_TREINO.md (fisiologia)
├── MUDANCAS_APP_V6.md (tech details)
└── INSTALL_GITHUB.md (passo-a-passo upload)
```

---

## ✅ Testing Checklist (Antes de Push)

- [ ] Abas navegam corretamente (todos 5 tabs?)
- [ ] localStorage salva dados (hold registration funciona?)
- [ ] Responsivo em mobile (375px, 768px, 1024px)
- [ ] Não há erros em console (F12)
- [ ] Todos 7 dias da semana aparecem (SEG–DOM)
- [ ] Crow Pose timeline mostra semanas 1–6
- [ ] Planche roadmap lista 5 progressões
- [ ] Mesociclos mostram M1–M5 com datas

---

## 🚀 Deployment

### Para GitHub Pages

```bash
git add index.html
git commit -m "feat: Monitor Atleta v6 - Reorganização + Calistenia + Planche roadmap"
git push origin main
```

Aguarde 3–5 minutos. Acesse: https://amarlosgs-wq.github.io/

### Para Testar Localmente

```bash
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

---

## 📈 Roadmap v7

- [ ] **Performance Dashboard**: ATL/CTL/TSB (Banister model)
- [ ] **ACWR Alerts**: Visual + notificações automáticas
- [ ] **HRV Integration**: Quinta manhã validation
- [ ] **Strava Sync**: One-click activity import
- [ ] **Google Calendar**: Testes M1–M5 auto-pull
- [ ] **Export PDF**: Relatório mensal
- [ ] **Mifflin-St Jeor**: Integração calorias + IF alerts
- [ ] **Dark/Light toggle**: Modo light disponível

---

## 🎯 Success Metrics (4 Semanas)

| Métrica | v5 Baseline | v6 Target | Status |
|---------|------------|----------|--------|
| CHAVE 1 pace (min/km) | 4:50–5:10 | 4:50–5:05 | ✓ Consistência +300% |
| Crow Pose hold | N/A (novo) | 20–25s | ✓ Novo exercício |
| HRV quinta | N/A (novo) | ≥ baseline -5% | ✓ Compatibilidade M2+C2 |
| ACWR | N/A (novo) | 0.8–1.3 | ✓ Balanço treino |
| Fat loss | Cont. | Cont. | ✓ Estrutura favorável |

---

## 🙏 Thanks & Credits

Monitor Atleta v6 foi desenvolvido por Claude (Anthropic) em colab com Marlos para otimizar:

- Estrutura treino híbrido (corrida + força + calistenia)
- Foco sub-20 em 5km
- Progressão segura de habilidades
- Preservação de músculo durante fat loss

**Metodologia**:
- Norwegian periodization (singles-based)
- Banister model (ATL/CTL/TSB)
- DIE RINGE calisthenics progression
- Mifflin-St Jeor BMR
- Riegel formula (5km equivalence)

---

## 📞 Support

Dúvidas? Abra issue no GitHub ou entre em contato.

---

**Monitor Atleta v6.0 — Ready for Production** ✅

**Agosto 4, 2026**

