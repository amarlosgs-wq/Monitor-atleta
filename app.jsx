import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom/client";
import {
  ComposedChart, LineChart, Line, Area, Bar, BarChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts";


/* ═══════════════════════ TOKENS ═══════════════════════ */
const T = {
  bg:'#070C18', panel:'#0C1424', card:'#111B2E', lift:'#18243A',
  brd:'#1C2A42', brd2:'#26374F',
  cyan:'#00CED1', mint:'#22C55E', amber:'#F59E0B', coral:'#FB7185',
  red:'#EF4444', violet:'#A78BFA', blue:'#60A5FA', gray:'#64748B',
  t1:'#E6EDF7', t2:'#8B9CB8', t3:'#4A5B78',
  mono:"ui-monospace,'SF Mono',Menlo,monospace",
  sans:"'Inter',system-ui,-apple-system,sans-serif",
};
const ATHLETE = { fcMax:195, fcRest:55 };
const ZONES = [
  { k:'Z1', lo:0, hi:138, c:T.gray, nome:'Recuperação' },
  { k:'Z2', lo:139, hi:152, c:T.mint, nome:'Fácil / Base' },
  { k:'LT1', lo:153, hi:162, c:T.cyan, nome:'Sub-limiar' },
  { k:'CINZA', lo:163, hi:167, c:T.coral, nome:'Zona cinza' },
  { k:'LT2', lo:168, hi:174, c:T.amber, nome:'Limiar' },
  { k:'VO2', lo:175, hi:220, c:T.red, nome:'VO₂máx' },
];
const zoneOf = hr => ZONES.find(z => hr >= z.lo && hr <= z.hi)?.k || 'Z1';
const zoneColor = k => ZONES.find(z => z.k === k)?.c || T.gray;

/* ═══════════════════════ MACROCICLO (planilha) ═══════════════════════ */
const INICIO_M1 = '2026-07-06';

const MICRO = {
  1:{ dia:'SEG', rot:'Z2 fácil 40–50min + 6–8 strides', tipo:'Fácil', pace:'5:45–6:15', fc:[140,152], min:45, lib:'Z2', extra:'Calistenia / core leve' },
  2:{ dia:'TER', rot:'CHAVE 1', tipo:'Chave', chave:1, lib:'LT2', extra:'Musculação inferior (após correr)' },
  3:{ dia:'QUA', rot:'Bike / Elíptico Z2 30–45min', tipo:'Cross', pace:'—', fc:[125,150], min:35, lib:'CROSS', extra:'Recuperativo · sem impacto' },
  4:{ dia:'QUI', rot:'CHAVE 2', tipo:'Chave', chave:2, lib:'LT1', extra:'—' },
  5:{ dia:'SEX', rot:'Z2 fácil 40–50min + 6–8 strides', tipo:'Fácil', pace:'5:45–6:15', fc:[140,152], min:45, lib:'Z2', extra:'Full body / superior' },
  6:{ dia:'SÁB', rot:'Bike / Elíptico Z2 ou descanso', tipo:'Cross', pace:'—', fc:[125,150], min:30, lib:'CROSS', extra:'Opcional · pernas leves p/ domingo' },
  0:{ dia:'DOM', rot:'Longo progressivo', tipo:'Longo', pace:'5:30→5:15', fc:[140,162], min:60, lib:'LONGO', extra:'Sem qualidade nas 24h seguintes' },
};

const MACRO = [
  { k:'M1', nome:'Limiar Intensivo', emoji:'🟡', cor:T.amber, periodo:'Jul–Set 2026', meta:'~22:30',
    foco:'Elevar o limiar de lactato (LT2). Hoje ~5:00/km @170bpm → meta ~4:45/km.',
    musc:'Hipertrofia (8–12 reps). TER: inferior pesado APÓS correr. SEX: full body.',
    c1lib:'LT2', c2lib:'LT1',
    sem:[
      {s:1,fase:'Adaptação',c1:'3×8min @ 5:05',c2:'20min @ 5:25',dom:'60min progressivo',vol:32,carga:'Mod',alerta:'Reentrada. Reconhecer os paces de limiar.'},
      {s:2,fase:'Carga',c1:'4×8min @ 5:00',c2:'25min @ 5:25',dom:'70min progressivo',vol:37,carga:'Alta',alerta:'FC do LT2 deve ESTABILIZAR ~170, não escalar.'},
      {s:3,fase:'Carga',c1:'5×8min @ 5:00',c2:'28min @ 5:22',dom:'75min progressivo',vol:41,carga:'M.Alta',alerta:'Pico de volume. Sono 8h+.'},
      {s:4,fase:'Deload',c1:'3×8min @ 5:05',c2:'18min @ 5:25',dom:'55min Z2',vol:28,carga:'Leve',alerta:'DELOAD obrigatório. Supercompensação.'},
      {s:5,fase:'Carga',c1:'4×10min @ 5:00',c2:'30min @ 5:22',dom:'80min progressivo',vol:43,carga:'Alta',alerta:'LT1 no piso: FC ≤162, conversável.'},
      {s:6,fase:'Carga',c1:'5×10min @ 4:55',c2:'2×15min @ 5:20',dom:'85min progressivo',vol:46,carga:'M.Alta',alerta:'Pico do bloco. Cuide do sono e do HRV.'},
      {s:7,fase:'Deload',c1:'3×10min @ 5:00',c2:'20min @ 5:22',dom:'60min Z2',vol:32,carga:'Leve',alerta:'DELOAD. Preparar terreno.'},
      {s:8,fase:'Choque',c1:'4×12min @ 4:55',c2:'2×15min @ 5:18',dom:'90min progressivo',vol:48,carga:'M.Alta',alerta:'Última semana forte. Limiar mais rápido.'},
      {s:9,fase:'Pré-teste',c1:'3×8min @ 4:50',c2:'25min @ 5:20',dom:'70min Z2',vol:38,carga:'Mod',alerta:'Reduz volume, mantém intensidade.'},
      {s:10,fase:'TESTE',c1:'Ativação 15min + 4×100m',c2:'Z2 leve 25min',dom:'🏁 TESTE 3km',vol:22,carga:'Teste',alerta:'Meta ~22:30 no 5km. Valida o LT2.',teste:true},
    ]},
  { k:'M2', nome:'Base + Força', emoji:'🟢', cor:T.mint, periodo:'Set–Dez 2026', meta:'~21:45',
    foco:'Construir o maior volume aeróbico do plano — levanta o teto onde o limiar encosta.',
    musc:'Força máxima (4–6 reps, cargas altas, menos volume).',
    c1lib:'LT2', c2lib:'LT1',
    sem:[
      {s:1,fase:'Carga',c1:'4×10min @ 5:00',c2:'30min @ 5:20',dom:'80min prog',vol:46,carga:'Alta',alerta:'Base aeróbica crescendo.'},
      {s:2,fase:'Carga',c1:'5×10min @ 5:00',c2:'35min @ 5:15',dom:'85min prog',vol:50,carga:'M.Alta',alerta:'Volume é o estímulo — fácil de verdade.'},
      {s:3,fase:'Carga',c1:'4×12min @ 4:55',c2:'30min @ 5:15',dom:'90min prog',vol:52,carga:'Alta',alerta:'Força: transição p/ 4–6 reps.'},
      {s:4,fase:'Deload',c1:'3×8min @ 5:05',c2:'20min @ 5:20',dom:'60min Z2',vol:36,carga:'Leve',alerta:'DELOAD. Supercompensação.'},
      {s:5,fase:'Carga',c1:'6×8min @ 4:55',c2:'35min @ 5:10',dom:'95min prog',vol:56,carga:'Alta',alerta:'Pico de volume do macro.'},
      {s:6,fase:'Carga',c1:'2×20min @ 5:00',c2:'30min @ 5:10',dom:'100min prog',vol:58,carga:'M.Alta',alerta:'Sustentar volume alto.'},
      {s:7,fase:'Carga',c1:'2×20min @ 4:55',c2:'40min @ 5:10',dom:'100min prog',vol:60,carga:'Alta',alerta:'Pico do bloco. Cuidar do sono.'},
      {s:8,fase:'Deload',c1:'3×8min @ 5:05',c2:'20min @ 5:20',dom:'60min Z2',vol:36,carga:'Leve',alerta:'DELOAD. Supercompensação.'},
      {s:9,fase:'Carga',c1:'4×10min @ 4:50',c2:'30min @ 5:05',dom:'95min prog',vol:52,carga:'Alta',alerta:'Reduzir, manter qualidade.'},
      {s:10,fase:'Carga',c1:'2×20min @ 4:55',c2:'40min @ 5:10',dom:'100min prog',vol:56,carga:'M.Alta',alerta:'Consolidar antes do teste.'},
      {s:11,fase:'Pré-teste',c1:'2×20min @ 4:55',c2:'40min @ 5:10',dom:'100min prog',vol:56,carga:'Mod',alerta:'Consolidar antes do teste.'},
      {s:12,fase:'TESTE',c1:'Ativação + strides',c2:'Z2 leve 25min',dom:'🏁 TESTE 3km',vol:24,carga:'Teste',alerta:'Meta ~21:45 no 5km. Calibra o M3.',teste:true},
    ]},
  { k:'M3', nome:'VO₂máx + Limiar', emoji:'🔵', cor:T.blue, periodo:'Dez 26–Fev 27', meta:'~21:00',
    foco:'Elevar o VO₂máx (o teto) sobre a base de limiar e volume já pronta.',
    musc:'Potência — pliometria e levantamentos explosivos, pernas frescas.',
    c1lib:'VO2', c2lib:'LT2',
    sem:[
      {s:1,fase:'Carga',c1:'VO₂ 4×4min @ 4:30',c2:'LT2 4×8min @ 4:50',dom:'90min prog',vol:50,carga:'Alta',alerta:'Reintroduz VO₂máx sobre base sólida.'},
      {s:2,fase:'Carga',c1:'VO₂ 5×3min @ 4:25',c2:'LT2 5×8min @ 4:50',dom:'90min prog',vol:52,carga:'M.Alta',alerta:'Tiros controlados, repetíveis.'},
      {s:3,fase:'Carga',c1:'VO₂ 4×4min @ 4:25',c2:'LT2 4×10min @ 4:50',dom:'95min prog',vol:54,carga:'Alta',alerta:'Teto subindo.'},
      {s:4,fase:'Deload',c1:'VO₂ 3×3min @ 4:30',c2:'LT1 20min @ 5:10',dom:'60min Z2',vol:34,carga:'Leve',alerta:'DELOAD. Supercompensação.'},
      {s:5,fase:'Carga',c1:'VO₂ 5×4min @ 4:20',c2:'LT2 5×8min @ 4:45',dom:'95min prog',vol:54,carga:'Alta',alerta:'Pico de intensidade.'},
      {s:6,fase:'Carga',c1:'VO₂ 4×4min @ 4:20',c2:'LT2 4×10min @ 4:45',dom:'90min prog',vol:52,carga:'M.Alta',alerta:'Manter qualidade dupla.'},
      {s:7,fase:'Carga',c1:'VO₂ 30/30 ×16',c2:'LT2 3×12min @ 4:45',dom:'85min prog',vol:48,carga:'Alta',alerta:'Variar estímulo (30/30).'},
      {s:8,fase:'Deload',c1:'VO₂ 3×3min @ 4:30',c2:'LT1 20min @ 5:10',dom:'60min Z2',vol:34,carga:'Leve',alerta:'DELOAD. Supercompensação.'},
      {s:9,fase:'Pré-teste',c1:'VO₂ 5×4min @ 4:20',c2:'LT2 2×15min @ 4:45',dom:'90min prog',vol:50,carga:'Mod',alerta:'Afiar antes do teste.'},
      {s:10,fase:'TESTE',c1:'Ativação + strides',c2:'Z2 leve 25min',dom:'🏁 TESTE 3km',vol:24,carga:'Teste',alerta:'Meta ~21:00 no 5km. Calibra o M4.',teste:true},
    ]},
  { k:'M4', nome:'Específico 5km', emoji:'🟠', cor:T.coral, periodo:'Fev–Abr 2027', meta:'~20:20',
    foco:'Tornar o pace de prova (3:59/km) automático e econômico.',
    musc:'Potência → manutenção. Volume baixo, só preservar.',
    c1lib:'PACE', c2lib:'LT2',
    sem:[
      {s:1,fase:'Carga',c1:"5×1000m @ 4:00 (rec 2')",c2:'LT2 4×8min @ 4:45',dom:'85min prog',vol:50,carga:'Alta',alerta:'Pace de prova entra em cena.'},
      {s:2,fase:'Carga',c1:'6×1000m @ 4:00',c2:'LT2 3×10min @ 4:45',dom:'85min prog',vol:52,carga:'M.Alta',alerta:'Acumular volume no pace-alvo.'},
      {s:3,fase:'Carga',c1:'4×1200m @ 4:00',c2:'LT2 2×15min @ 4:45',dom:'90min prog',vol:52,carga:'Alta',alerta:'Reps mais longas no pace.'},
      {s:4,fase:'Deload',c1:'4×800m @ 4:05',c2:'LT1 20min @ 5:05',dom:'55min Z2',vol:32,carga:'Leve',alerta:'DELOAD. Supercompensação.'},
      {s:5,fase:'Carga',c1:'3×1600m @ 4:00',c2:'LT2 3×12min @ 4:40',dom:'85min prog',vol:50,carga:'Alta',alerta:'Blocos longos no pace.'},
      {s:6,fase:'Carga',c1:'6×1000m @ 3:58',c2:'LT2 2×15min @ 4:40',dom:'80min prog',vol:48,carga:'M.Alta',alerta:'Tolerância ao pace de prova.'},
      {s:7,fase:'Carga',c1:'2×2000m @ 4:00',c2:'LT1 30min @ 5:00',dom:'80min prog',vol:46,carga:'Alta',alerta:'Simulação de sustentação.'},
      {s:8,fase:'Deload',c1:'4×800m @ 4:05',c2:'LT1 20min @ 5:05',dom:'55min Z2',vol:32,carga:'Leve',alerta:'DELOAD. Supercompensação.'},
      {s:9,fase:'Pré-teste',c1:'8×600m @ 3:55',c2:'LT2 3×10min @ 4:40',dom:'75min prog',vol:46,carga:'Mod',alerta:'Afiar a economia.'},
      {s:10,fase:'TESTE',c1:'Ativação + strides',c2:'Z2 leve 20min',dom:'🏁 TESTE 3km',vol:22,carga:'Teste',alerta:'Meta ~20:20 no 5km. Quase lá.',teste:true},
    ]},
  { k:'M5', nome:'Pico + Afiação', emoji:'🔴', cor:T.red, periodo:'Abr–Jun 2027', meta:'Sub-20',
    foco:'Converter a base em velocidade de prova e chegar fresco. O frescor revela a forma.',
    musc:'Manutenção mínima → zera nas 2 últimas semanas.',
    c1lib:'PACE', c2lib:'LT2',
    sem:[
      {s:1,fase:'Carga',c1:'6×400m @ 3:50',c2:'LT2 3×8min @ 4:40',dom:'75min prog',vol:44,carga:'Alta',alerta:'Velocidade pura e potência.'},
      {s:2,fase:'Carga',c1:'8×400m @ 3:50',c2:'LT2 2×12min @ 4:40',dom:'75min prog',vol:45,carga:'M.Alta',alerta:'Afiar o sistema neuromuscular.'},
      {s:3,fase:'Carga',c1:'5×600m @ 3:52',c2:'LT1 25min @ 5:00',dom:'70min Z2',vol:42,carga:'Alta',alerta:'Reduzindo volume, mantendo ponta.'},
      {s:4,fase:'Carga',c1:'10×300m @ 3:48',c2:'LT2 3×8min @ 4:38',dom:'70min prog',vol:42,carga:'M.Alta',alerta:'Tiros curtos e rápidos.'},
      {s:5,fase:'Taper',c1:'4×800m @ 3:55',c2:'LT1 20min @ 5:00',dom:'60min Z2',vol:38,carga:'Alta',alerta:'Taper começa — volume cai.'},
      {s:6,fase:'Taper',c1:'3×1000m @ 3:55',c2:'LT2 2×10min @ 4:38',dom:'55min Z2',vol:34,carga:'M.Alta',alerta:'Taper. Pernas frescas.'},
      {s:7,fase:'Taper',c1:'3×1000m @ 3:55',c2:'LT2 2×10min @ 4:38',dom:'55min Z2',vol:34,carga:'Mod',alerta:'Taper final. Nada pesado.'},
      {s:8,fase:'PROVA',c1:'Ativação 12min + 4×100m',c2:'Descanso ou Z2 15min',dom:'🏆 PROVA 5km',vol:20,carga:'Teste',alerta:'🏆 META Sub-20:00 / estímulo Sub-19:00',teste:true},
    ]},
];

/* Biblioteca — execução de cada sessão */
const LIB = {
  LT2:{ nome:'LT2 · Limiar em blocos', tag:'A maior alavanca pro teu 5km agora.', cor:T.amber,
    fc:[167,173], pace:'4:50–5:05', min:45,
    func:'Elevar o limiar de lactato: empurrar pra cima o ritmo que você sustenta sem acidificar.',
    estrut:'3–5 × 8–12min com 90s de trote entre. Aquec. 12–15min + desaq. 8–10min.',
    exec:['Comece pelo limite LENTO da faixa.','A FC deve ESTABILIZAR ao longo dos blocos, não escalar.','Se subir +3bpm de bloco a bloco ou passar de 173, segura o ritmo.','Termine com a sensação de que dava mais um bloco.'],
    erros:'Começar rápido e virar VO₂máx; deixar a FC escalar; cortar o aquecimento.',
    dica:'Progrida o TEMPO no limiar antes do pace. O pace sobe sozinho conforme adapta.' },
  LT1:{ nome:'LT1 · Limiar contínuo', tag:'O dia que mais escorrega pra zona cinza.', cor:T.cyan,
    fc:[155,162], pace:'5:20–5:30', min:40,
    func:'Desenvolver o limiar aeróbico sem o custo de recuperação de uma sessão de LT2.',
    estrut:'20–40min contínuo, sem intervalos. Aquec. e desaq. inclusos.',
    exec:['Ritmo confortavelmente forte e PLANO do início ao fim.','FC travada em 162 — não deixe subir.','É pra ser entediante de tão controlado; esse é o objetivo.'],
    erros:'Deixar virar LT2; FC passar de 162 (cai na zona cinza); acelerar no terço final.',
    dica:'Teste da fala: se não consegue dizer uma frase inteira sem ofegar, está rápido demais.' },
  Z2:{ nome:'Z2 fácil + strides', tag:'80% do volume mora aqui.', cor:T.mint,
    fc:[140,152], pace:'5:45–6:15', min:45,
    func:'Base aeróbica que permite recuperar pros dias duros. Strides preservam velocidade.',
    estrut:'35–55min fácil + 6–8 × 12s strides em subida leve (4–6%), volta caminhando.',
    exec:['Corra REALMENTE fácil: respiração nasal, conversa fluida.','Strides = acelerações suaves até ~95%, cadência alta — não é sprint.','Recupere por completo entre cada stride.'],
    erros:'Correr o fácil rápido demais (o erro mais custoso); sprintar os strides.',
    dica:'Na dúvida entre fácil e mais fácil, escolha mais fácil.' },
  LONGO:{ nome:'Longo progressivo', tag:'Onde o volume cresce e o teto sobe.', cor:T.violet,
    fc:[140,162], pace:'5:30→5:15', min:60,
    func:'Construir resistência aeróbica e ensinar o corpo a correr cansado.',
    estrut:'60–105min, com os últimos 15–20min mais firmes (chegando ao LT1).',
    exec:['Comece BEM fácil — mais devagar do que o ego quer.','Mantenha fácil por dois terços.','Só aperte no terço final.','Termine forte mas no controle, nunca em colapso.'],
    erros:'Começar rápido; terminar exausto; fazer no dia seguinte a treino pesado.',
    dica:'O longo não precisa ser rápido pra funcionar. Consistência vence heroísmo.' },
  VO2:{ nome:'VO₂máx · 4×4', tag:'Eleva o teto. Entra só no M3.', cor:T.red,
    fc:[178,188], pace:'4:20–4:35', min:50,
    func:'Elevar o VO₂máx com esforços sustentados que te levam fundo na zona máxima.',
    estrut:'4–6 × 3–4min a ~90–95% FCmáx, 2–3min de trote entre. Aquec. 15min.',
    exec:['Largue CONTROLADO — a FC sobe ao longo do tiro.','Recuperação ATIVA (trote leve, não parado).','A última série tão forte quanto a primeira.'],
    erros:'Largar rápido e morrer; recuperação parada demais; encurtar o tiro.',
    dica:'Conta o TEMPO acumulado acima de 90% FCmáx. 4 tiros iguais batem 2 voando + 2 morrendo.' },
  PACE:{ nome:'Específico · pace de prova', tag:'Torna o sub-20 automático.', cor:T.coral,
    fc:[174,182], pace:'3:55–4:00', min:50,
    func:'Tornar o ritmo-alvo de 5km automático e econômico.',
    estrut:'Reps de 1000–2000m no pace-alvo, 2min de trote entre. Aquec. 15min.',
    exec:['Trave o pace e mantenha CONSTANTE e relaxado.','Ritmo regular — não voe nos primeiros reps.','O objetivo é o pace passar a parecer fácil.'],
    erros:'Correr os reps rápido demais; pace irregular; recuperação longa demais.',
    dica:'Faça parte dos reps já cansado — é cansado que o pace de prova conta.' },
  CROSS:{ nome:'Cross · bike / elíptico', tag:'Volume sem impacto. Complemento, não troca.', cor:T.blue,
    fc:[125,150], pace:'—', min:35,
    func:'Somar volume aeróbico SEM impacto, protegendo as pernas.',
    estrut:'30–50min contínuos em Z2. Bike: cadência alta, 85–95rpm.',
    exec:['Esforço fácil e constante do início ao fim.','É recuperação ativa e base — não vire treino forte.'],
    erros:'Transformar em sessão intensa; usar no lugar de uma sessão-chave.',
    dica:'Cross não substitui a especificidade da corrida. Some, não troque.' },
  TESTE:{ nome:'Teste de 3km (contrarrelógio)', tag:'O termômetro que calibra todos os paces.', cor:T.amber,
    fc:[175,190], pace:'all-out', min:40,
    func:'Medir teu desempenho máximo atual. Calibra todas as zonas e paces do plano.',
    estrut:'Pista de 400m (7,5 voltas) ou trecho plano medido. Descansado, clima ameno.',
    exec:['Aquecimento 15–20min: fácil progressivo + 3–4 strides de 100m.','Largue CONTROLADO — só um pouco acima do ritmo de 5km.','Segure o ritmo o mais parelho possível no km do meio.','Esvazie o tanque nos últimos 600–800m.','Desaquecimento 8–10min trotando.'],
    erros:'Largar rápido e morrer (erro nº1); percurso com curvas; testar cansado ou no calor.',
    dica:'Ritmo parelho vence sempre. Escolha um dia em que você acorde se sentindo bem.' },
};

/* ═══════════════════════ FORÇA & CALISTENIA (cronograma atlético — fixo, repete toda semana) ═══════════════════════
   Fonte: aba "💪 Treinos" do cronograma_atletico.xlsx. Sessões de CORRIDA dessa planilha foram
   ignoradas de propósito — o plano de corrida do macrociclo continua sendo a única fonte pra isso.
   Reorganizado a pedido do atleta: perna pesada foi pro domingo (junto do longão), o dia de
   pliometria+perna foi pra quinta (junto do intervalado), e a calistenia isométrica avançada
   (handstand/front lever/dip explosivo) foi isolada na sexta. */
const FORCA_SEMANA = {
  1:{ /* Segunda */ nome:'Full Body A + Calistenia', tag:'Pulling + Empurrar + Habilidade calistênica · sem pliometria',
    cor:T.violet, min:60,
    blocos:[
      { t:'🔥 Aquecimento', itens:[
        { ex:'Mobilidade dinâmica (quadril, ombro, tornozelo)', s:'—', r:'10 min', c:'—', d:'—', o:'Essencial para longevidade' },
      ]},
      { t:'🏋️ Força principal', itens:[
        { ex:'Barra pronada (pull-up)', s:'4x', r:'Máx − 2 reps', c:'Peso corporal', d:'2–3 min', o:'Escápulas retraídas na subida · +1 rep/sem → lastrar' },
        { ex:'Paralela (dip)', s:'4x', r:'10–12', c:'PC ou +5kg', d:'90 seg', o:'Cotovelo 90° mínimo · +2kg quando >15 reps' },
        { ex:'Levantamento terra convencional', s:'3x', r:'5', c:'75–85% 1RM', d:'3 min', o:'Neutro lombar obrigatório · +2,5kg/sem se forma OK' },
        { ex:'Remada curvada supinada', s:'3x', r:'8–10', c:'Moderado', d:'90 seg', o:'Excêntrico 3s · isquiotibiais encurtados: cuidado' },
      ]},
      { t:'🤸 Calistenia — progressões', itens:[
        { ex:'Muscle-up progressão', s:'3x', r:'3–5', c:'Elástico/Jumping', d:'2 min', o:'Fase 1 negativa → 2 kip → 3 strict · false grip separado' },
        { ex:'L-sit progressão', s:'3x', r:'Máx hold', c:'Paralelas/solo', d:'90 seg', o:'Tucked → 1 perna → full · core ativo' },
        { ex:'Hollow body hold', s:'3x', r:'30–40 seg', c:'PC', d:'45 seg', o:'+5s/semana · lombar colada no chão' },
      ]},
      { t:'🧊 Volta à calma', itens:[
        { ex:'Alongamento estático (superiores)', s:'—', r:'8–10 min', c:'—', d:'—', o:'Foco peitoral e latíssimo' },
      ]},
    ]},
  3:{ /* Quarta */ nome:'Full Body B + Calistenia', tag:'Versão leve · a pliometria e o agachamento foram pra quinta, a calistenia isométrica pra sexta',
    cor:T.mint, min:35,
    blocos:[
      { t:'🔥 Aquecimento', itens:[
        { ex:'Mobilidade dinâmica (ombro, quadril)', s:'—', r:'8 min', c:'—', d:'—', o:'Rápido — dia leve' },
      ]},
      { t:'🏋️ Força complementar', itens:[
        { ex:'Supino livre', s:'4x', r:'6–8', c:'70–78% 1RM', d:'2–3 min', o:'Retração escapular total' },
        { ex:'Barra explosiva (explosive pull-up)', s:'3x', r:'5', c:'PC', d:'2 min', o:'Mento bem acima da barra' },
      ]},
    ]},
  4:{ /* Quinta */ nome:'Pernas + Pliometria', tag:'Combinado com o intervalado (Chave 2) do mesmo dia — sequência importa, ver alerta',
    cor:T.coral, min:50,
    blocos:[
      { t:'⚡ Aquecimento dinâmico', itens:[
        { ex:'Mobilidade + skipping, chutes de glúteo', s:'—', r:'8 min', c:'—', d:'—', o:'Eleva FC gradualmente' },
      ]},
      { t:'⚡ Pliometria (SNC fresco)', itens:[
        { ex:'Box jump', s:'4x', r:'5 saltos', c:'50–60 cm', d:'2 min', o:'Aterrissagem mole — amortece o joelho' },
        { ex:'Agachamento com salto', s:'4x', r:'6', c:'PC (ou +5kg colete)', d:'2 min', o:'Tripla extensão: tornozelo, joelho, quadril' },
        { ex:'Sprint aceleração', s:'4x', r:'20m', c:'—', d:'90 seg', o:'Qualidade máxima — não sprints longos' },
      ]},
      { t:'🏋️ Força', itens:[
        { ex:'Agachamento livre', s:'4x', r:'5', c:'80–87% 1RM', d:'3 min', o:'Profundidade coxa paralela · +2,5kg se 5x5 limpo' },
      ]},
      { t:'⚠️ Sequência com o intervalado', itens:[
        { ex:'Ordem recomendada', s:'—', r:'—', c:'—', d:'—', o:'Se o intervalado (Chave 2) é a prioridade do dia, faça-o PRIMEIRO com o SNC fresco e deixe pliometria/agachamento pro fim, com carga reduzida se sentir a perna pesada. Se a força é a prioridade, inverta. Não dá pra ir 100% nos dois — escolha o foco do dia.' },
      ]},
    ]},
  5:{ /* Sexta */ nome:'Calistenia — Força Isométrica', tag:'Isolada, ao lado do treino fácil do dia · baixo custo sistêmico',
    cor:T.cyan, min:30,
    blocos:[
      { t:'🤸 Calistenia — força isométrica', itens:[
        { ex:'Handstand em parede', s:'3x', r:'30–45 seg', c:'PC', d:'2 min', o:'→ HS livre em 4–6 meses' },
        { ex:'Front lever tucked', s:'3x', r:'10–15 seg', c:'PC', d:'2 min', o:'+5s/semana → one-leg' },
        { ex:'Dip paralela explosivo', s:'3x', r:'6', c:'PC', d:'90 seg', o:'Empurrar até extensão total' },
      ]},
    ]},
  6:{ /* Sábado */ nome:'Superior Completo', tag:'Volume superior + muscle-up técnico · dia standalone',
    cor:T.blue, min:70,
    blocos:[
      { t:'💪 Ativação', itens:[
        { ex:'Rotador manguito + mobilidade de ombro', s:'—', r:'8 min', c:'Elástico leve', d:'—', o:'Previne lesão de rotador (comum em corredor)' },
      ]},
      { t:'🏋️ Força principal — volume', itens:[
        { ex:'Supino livre', s:'4x', r:'8', c:'70–75% 1RM', d:'2 min', o:'Controle excêntrico 2s' },
        { ex:'Desenvolvimento militar em pé', s:'4x', r:'8', c:'65–72% 1RM', d:'2 min', o:'Core braced, glúteo contraído' },
        { ex:'Remada curvada', s:'4x', r:'10', c:'Moderado', d:'90 seg', o:'Supinada/pronada alternando semanas' },
        { ex:'Barra lastrada (weighted pull-up)', s:'3x', r:'5–6', c:'+5–10kg', d:'3 min', o:'Pré-requisito muscle-up avançado' },
      ]},
      { t:'🤸 Calistenia técnica — muscle-up', itens:[
        { ex:'Muscle-up técnico (qualidade máxima)', s:'3x', r:'3–5', c:'PC/Assistido', d:'3 min', o:'DIA PRINCIPAL de trabalho de muscle-up' },
        { ex:'Transição muscle-up (slow negative)', s:'3x', r:'3', c:'PC', d:'2 min', o:'Descer controlado 5s' },
      ]},
      { t:'🏋️ Isolamento — acabamento', itens:[
        { ex:'Crucifixo inclinado (peitoral)', s:'3x', r:'12', c:'Leve', d:'60 seg', o:'Amplitude total' },
        { ex:'Elevação lateral (ombro médio)', s:'3x', r:'15', c:'Leve', d:'45 seg', o:'Não sobrecarregar' },
        { ex:'Rosca alternada (bíceps)', s:'3x', r:'12', c:'Moderado', d:'60 seg', o:'Supinação no topo' },
        { ex:'Tríceps testa / mergulho no banco', s:'3x', r:'12', c:'Moderado', d:'60 seg', o:'Complemento do pushing' },
      ]},
    ]},
  0:{ /* Domingo */ nome:'Inferior Completo', tag:'Combinado com o longão do mesmo dia — sequência importa, ver alerta',
    cor:T.amber, min:70,
    blocos:[
      { t:'⚡ Ativação', itens:[
        { ex:'Elástico glúteo + mobilidade de quadril', s:'—', r:'8 min', c:'—', d:'—', o:'Previne joelho valgo' },
      ]},
      { t:'⚡ Pliometria primeiro (SNC fresco)', itens:[
        { ex:'Box jump', s:'3x', r:'5', c:'55 cm', d:'2 min', o:'Aterrissagem silenciosa' },
      ]},
      { t:'🏋️ Força principal', itens:[
        { ex:'Agachamento livre (força máxima)', s:'5x', r:'4–5', c:'82–90% 1RM', d:'3–4 min', o:'Dia mais pesado da semana' },
        { ex:'Hip thrust (barra)', s:'3x', r:'10', c:'Moderado→pesado', d:'90 seg', o:'Glúteo máximo — extensão completa' },
        { ex:'Leg press 45°', s:'3x', r:'12', c:'Vol. moderado', d:'90 seg', o:'Pós agachamento pesado' },
        { ex:'Stiff romeno (isquiotibiais)', s:'3x', r:'10', c:'Moderado', d:'2 min', o:'Essencial p/ corredor: isquio forte' },
        { ex:'Cadeira extensora', s:'3x', r:'12–15', c:'Leve/moderado', d:'60 seg', o:'Isolamento finisher' },
        { ex:'Mesa flexora', s:'3x', r:'12', c:'Moderado', d:'60 seg', o:'Par com extensora: equilíbrio' },
        { ex:'Panturrilha em pé (calf raise)', s:'4x', r:'15–20', c:'PC + barra', d:'45 seg', o:'Corredores: panturrilha crítica' },
      ]},
      { t:'⚠️ Sequência com o longão', itens:[
        { ex:'Ordem recomendada', s:'—', r:'—', c:'—', d:'—', o:'Agachamento pesado (82-90% 1RM) DEPOIS do longão sobrecarrega o quadril já fatigado — risco maior de forma ruim. Se puder, inverta: força de manhã cedo, longão à tarde/noite, ou aceite reduzir 1 série do agachamento nesse dia.' },
      ]},
      { t:'🧊 Volta à calma', itens:[
        { ex:'Foam roller + alongamento isquio/quadril', s:'—', r:'10 min', c:'—', d:'—', o:'Recuperação pós-longão + pós-força' },
      ]},
    ]},
};
const sessaoForcaDoDia = dow => FORCA_SEMANA[dow] || null;

/* ═══ Periodização da força — acompanha o mesociclo de corrida, não é mais estática ═══
   Regra: qualquer semana de Deload da corrida também reduz a força (sinergia de recuperação).
   M1–M2: força plena (bate com hipertrofia/força máxima do macro).
   M3–M4: reduzida (a corrida já está mais intensa — VO2máx/pace de prova).
   M5: reduzida nas semanas de carga → mínima no taper → zero na semana da prova. */
function faseForca(iso) {
  const pos = posMacro(iso);
  if (!pos) return 'plena';
  const { meso, semana, nSem } = pos;
  if (semana.fase === 'Deload') return 'reduzida';
  if (meso.k === 'M1' || meso.k === 'M2') return 'plena';
  if (meso.k === 'M3' || meso.k === 'M4') return 'reduzida';
  if (meso.k === 'M5') {
    if (semana.fase === 'PROVA') return 'zero';
    if (semana.fase === 'Taper' && nSem >= 7) return 'zero';
    if (semana.fase === 'Taper') return 'minima';
    return 'reduzida'; // semanas de carga do M5
  }
  return 'plena';
}
const FASE_INFO = {
  plena:    { label:'Fase plena',      cor:T.mint,  nota:null },
  reduzida: { label:'Fase reduzida',   cor:T.amber, nota:'Corte 1 série de cada exercício principal e reduza ~10% da carga. Pliometria: metade do volume.' },
  minima:   { label:'Manutenção mínima', cor:T.coral, nota:'Só o essencial — peso corporal e mobilidade. Sem carga pesada, sem pliometria máxima.' },
  zero:     { label:'Sem treino de força', cor:T.red, nota:'Prioridade total: chegar fresco. Só mobilidade leve se quiser.' },
};

/* Aplica a fase sobre o template bruto: filtra/ajusta blocos conforme o nível */
function adaptarSessaoForca(sessao, fase) {
  if (!sessao) return null;
  const info = FASE_INFO[fase];
  if (fase === 'plena') return { ...sessao, faseInfo: info };

  if (fase === 'reduzida') {
    return { ...sessao, faseInfo: info, min: Math.round(sessao.min * 0.8) };
  }

  if (fase === 'minima') {
    // mantém aquecimento/ativação/volta à calma inteiros; nos blocos de força, só peso corporal
    const blocos = sessao.blocos
      .map(b => {
        const isEstrutural = /Aquecimento|Ativação|Volta à calma/i.test(b.t);
        if (isEstrutural) return b;
        const leves = b.itens.filter(it => /PC|Peso corporal/i.test(it.c) || it.c === '—');
        return leves.length ? { ...b, itens: leves } : null;
      })
      .filter(Boolean);
    return { ...sessao, faseInfo: info, min: Math.max(15, Math.round(sessao.min * 0.4)), blocos };
  }

  // zero
  return {
    ...sessao, faseInfo: info, min: 10,
    blocos: [{ t:'😴 Descanso', itens:[
      { ex:'Sem treino de força hoje', s:'—', r:'Foco: chegar fresco', c:'—', d:'—', o:'Mobilidade leve opcional, 10min, sem esforço.' },
    ]}],
  };
}
const forcaDoDiaAdaptada = iso => adaptarSessaoForca(sessaoForcaDoDia(new Date(iso+'T12:00:00').getDay()), faseForca(iso));

/* posição no macrociclo */
function posMacro(iso) {
  const d = new Date(iso+'T12:00:00'), ini = new Date(INICIO_M1+'T12:00:00');
  const dias = Math.floor((d - ini)/86400000);
  if (dias < 0) return null;
  let acc = 0;
  for (const m of MACRO) {
    const dur = m.sem.length * 7;
    if (dias < acc + dur) {
      const idx = Math.floor((dias - acc)/7);
      return { meso:m, semana:m.sem[idx], nSem:idx+1, totalSem:m.sem.length };
    }
    acc += dur;
  }
  return null;
}
/* sessão planejada para uma data */
function sessaoDoDia(iso) {
  const pos = posMacro(iso);
  if (!pos) return null;
  const dow = new Date(iso+'T12:00:00').getDay();
  const base = MICRO[dow];
  const { meso, semana } = pos;
  const isTeste = semana.teste;

  if (base.tipo === 'Chave') {
    const det = base.chave === 1 ? semana.c1 : semana.c2;
    const libKey = isTeste ? 'TESTE' : (base.chave === 1 ? meso.c1lib : meso.c2lib);
    const lib = LIB[libKey];
    return { ...pos, dow, tipo:'Chave', titulo:`Chave ${base.chave} · ${lib.nome.split('·')[0].trim()}`,
             detalhe:det, lib, libKey, fc:lib.fc, pace:lib.pace, min:lib.min, extra:base.extra };
  }
  if (base.tipo === 'Longo') {
    const lib = isTeste ? LIB.TESTE : LIB.LONGO;
    const minEst = isTeste ? 40 : (parseInt(semana.dom) || 60);
    return { ...pos, dow, tipo: isTeste?'Teste':'Longo', titulo: isTeste?'Teste de 3km':'Longo progressivo',
             detalhe:semana.dom, lib, libKey:isTeste?'TESTE':'LONGO', fc:lib.fc, pace:lib.pace, min:minEst, extra:base.extra };
  }
  const lib = LIB[base.lib];
  return { ...pos, dow, tipo:base.tipo, titulo:base.rot, detalhe:base.rot,
           lib, libKey:base.lib, fc:base.fc, pace:base.pace, min:base.min, extra:base.extra };
}

/* ═══════════════════════ MOTOR FISIOLÓGICO ═══════════════════════ */
function rpeBase(fc) {
  if (fc == null) return null;
  if (fc<120) return 1; if (fc<136) return 2; if (fc<146) return 3;
  if (fc<156) return 4; if (fc<164) return 5; if (fc<168) return 6;
  if (fc<175) return 7; if (fc<183) return 8; if (fc<190) return 9;
  return 10;
}
function calcSRPE({ fcMedia, duracaoMin, altitudeM, hora, gradeMedio, tempC }) {
  const base = rpeBase(fcMedia);
  if (base == null || !duracaoMin) return null;
  const modAlt = altitudeM > 500 ? +(((altitudeM-500)/1000)*1.2).toFixed(1) : 0;
  let modCalor = 0;
  if (tempC != null) modCalor = tempC>32?0.7 : tempC>28?0.4 : tempC>24?0.2 : 0;
  else if (hora != null) modCalor = (hora>=13&&hora<=17)?0.4 : (hora>17&&hora<=20)?0.2 : (hora<9?-0.1:0);
  const modTerreno = gradeMedio>5?0.6 : gradeMedio>3?0.3 : 0;
  const total = Math.min(10, Math.max(1, +(base+modAlt+modCalor+modTerreno).toFixed(1)));
  return { base, modAlt, modCalor, modTerreno, rpeTotal:total, srpe:Math.round(total*duracaoMin) };
}
const cargaCat = s => s==null?'—' : s<150?'Baixa' : s<300?'Moderada' : s<450?'Alta':'Muito Alta';
const cargaCor = s => s==null?T.t3 : s<150?T.mint : s<300?T.cyan : s<450?T.amber:T.red;

function rollingStats(vals) {
  const v = vals.filter(x => x!=null && !Number.isNaN(x));
  if (!v.length) return null;
  const mean = v.reduce((a,b)=>a+b,0)/v.length;
  const sd = Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/v.length) || 1;
  return { mean, sd:Math.max(sd,0.5), n:v.length };
}
const clamp = (x,a,b) => Math.min(b, Math.max(a,x));
const zTo100 = (z,inv=false) => clamp(50 + (inv?-z:z)*18, 0, 100);

/* baseline de uma métrica: valor do dia + banda (média móvel 28d ± 1 SD) + status vs baseline */
function baselineSerie(serie, campo, invertido=false) {
  return serie.map((d,i) => {
    const janela = serie.slice(Math.max(0,i-28), i).map(x=>x[campo]).filter(x=>x!=null);
    const st = rollingStats(janela);
    const v = d[campo];
    let status = null;
    if (v!=null && st && st.n>=3) {
      const z = (v-st.mean)/st.sd;
      status = (invertido?-z:z) >= 0.5 ? 'bom' : (invertido?-z:z) <= -0.5 ? 'ruim' : 'neutro';
    }
    return { data:d.data, valor:v, baseMean:st?.mean??null,
             baseLo: st ? st.mean-st.sd : null, baseHi: st ? st.mean+st.sd : null, status };
  });
}
function resumoBaseline(serie, campo) {
  const st = rollingStats(serie.slice(-28).map(d=>d[campo]));
  const ultimoObj = [...serie].reverse().find(d => d[campo]!=null);
  return { atual: ultimoObj?.[campo] ?? null, data: ultimoObj?.data, media: st?.mean ?? null, n: st?.n ?? 0 };
}

function calcProntidao(dia, hist) {
  if (!dia) return null;
  const bH = rollingStats(hist.map(d=>d.rmssd)), bF = rollingStats(hist.map(d=>d.fc));
  const parts = [];
  if (dia.rmssd!=null && bH && bH.n>=3) parts.push({ k:'HRV', w:0.30, v:zTo100((dia.rmssd-bH.mean)/bH.sd) });
  if (dia.fc!=null && bF && bF.n>=3) parts.push({ k:'FC repouso', w:0.25, v:zTo100((dia.fc-bF.mean)/bF.sd, true) });
  if (dia.sonoDuracao!=null || dia.sonoSubj!=null) {
    const dur = dia.sonoDuracao!=null ? clamp((dia.sonoDuracao/8)*100,0,110) : 60;
    const efi = dia.sonoEficiencia ?? 80, sub = dia.sonoSubj!=null ? dia.sonoSubj*10 : 60;
    parts.push({ k:'Sono', w:0.25, v:clamp(dur*0.35+efi*0.35+sub*0.30,0,100) });
  }
  const wk = [['wFad',1],['wHum',0],['wDom',1],['wMot',0],['wStr',1]];
  const wv = wk.map(([k,inv]) => dia[k]==null?null:(inv?(6-dia[k]):dia[k])).filter(x=>x!=null);
  if (wv.length>=3) parts.push({ k:'Percepção', w:0.20, v:clamp(((wv.reduce((a,b)=>a+b,0)/wv.length)-1)/4*100,0,100) });
  if (!parts.length) return null;
  const wSum = parts.reduce((a,p)=>a+p.w,0);
  return { score: Math.round(clamp(parts.reduce((a,p)=>a+p.v*p.w,0)/wSum,0,100)), parts };
}
function calcPMC(serie) {
  const kA = 2/8, kC = 2/43;
  let atl=0, ctl=0;
  return serie.map((d,i) => {
    const carga = (d.cargaCorrida||0)+(d.cargaMuscu||0);
    if (i===0) { atl=carga; ctl=carga; }
    else { atl=carga*kA+atl*(1-kA); ctl=carga*kC+ctl*(1-kC); }
    return { ...d, carga, atl:+atl.toFixed(1), ctl:+ctl.toFixed(1), tsb:+(ctl-atl).toFixed(1),
             acwr: ctl>5 ? +(atl/ctl).toFixed(2) : null };
  });
}
const acwrStatus = a => a==null?{txt:'Sem base',c:T.t3} : a<0.8?{txt:'Destreino',c:T.blue}
  : a<=1.3?{txt:'Zona ótima',c:T.mint} : a<=1.5?{txt:'Risco moderado',c:T.amber}:{txt:'Risco alto',c:T.red};

/* ═══ Monotonia & Strain (Foster, 1998 — "Monitoring training in athletes...")
   Usado pelo TrainingPeaks e por times profissionais como segundo sinal de risco,
   complementar ao ACWR (que isolado tem baixo poder preditivo — Griffin et al. 2020).
   Monotonia = média da carga diária ÷ desvio-padrão da carga diária (7 dias).
   Alta monotonia = pouca variação de carga dia a dia → risco de overtraining mesmo
   com volume total moderado. Strain = carga semanal total × monotonia. ═══ */
function calcMonotoniaStrain(serie7d) {
  const cargas = serie7d.map(d => d.carga||0);
  if (cargas.length < 4) return null;
  const mean = cargas.reduce((a,b)=>a+b,0)/cargas.length;
  const sd = Math.sqrt(cargas.reduce((a,b)=>a+(b-mean)**2,0)/cargas.length) || 0.1;
  const monotonia = +(mean/sd).toFixed(2);
  const strain = Math.round(cargas.reduce((a,b)=>a+b,0) * monotonia);
  return { monotonia, strain, cargaTotal: Math.round(cargas.reduce((a,b)=>a+b,0)) };
}
const monotoniaStatus = m => m==null?{txt:'Sem base',c:T.t3}
  : m<1.5?{txt:'Variação saudável',c:T.mint} : m<2.0?{txt:'Atenção',c:T.amber}:{txt:'Risco alto — varie a carga',c:T.red};

/* ═══ Débito de sono acumulado (Van Dongen et al., 2003 — efeito cumulativo da
   privação de sono é sub-percebido pelo próprio atleta; débito importa mais que
   uma noite isolada). Meta 8h/noite, janela de 7 dias, estilo Oura/Whoop. ═══ */
function calcDebitoSono(serie7d, metaH=8) {
  const dias = serie7d.filter(d => d.sonoDuracao != null);
  if (!dias.length) return null;
  const debito = dias.reduce((acc,d) => acc + Math.max(0, metaH - d.sonoDuracao), 0);
  return { debitoH: +debito.toFixed(1), dias: dias.length, mediaH: +(dias.reduce((a,d)=>a+d.sonoDuracao,0)/dias.length).toFixed(1) };
}
const debitoStatus = h => h==null?{txt:'Sem dados',c:T.t3}
  : h<3?{txt:'Sob controle',c:T.mint} : h<7?{txt:'Acumulando',c:T.amber}:{txt:'Débito alto',c:T.red};

/* validador contra a sessão planejada do macrociclo */
function validar(plano, treino) {
  if (!plano || !treino) return null;
  const [lo,hi] = plano.fc, alvo = (lo+hi)/2;
  const scoreFC = clamp(100 - Math.abs((treino.fcMedia||alvo)-alvo)*3.5, 0, 100);
  const razao = (treino.duracaoMin||0)/plano.min;
  const scoreVol = clamp(100 - Math.abs(1-razao)*100, 0, 100);
  const total = Math.round(scoreFC*0.6 + scoreVol*0.4);
  const st = total>=90?{i:'🟢',t:'Cumprido',c:T.mint} : total>=70?{i:'🟡',t:'Parcial',c:T.amber}:{i:'🔴',t:'Divergente',c:T.red};

  /* diagnóstico causal — por que divergiu */
  let causa = null;
  if (scoreFC < 85 && treino.fcMedia != null) {
    const acima = treino.fcMedia > hi;
    const foraDaMeta = (treino.zonas?.CINZA||0) + (treino.zonas?.LT2||0) + (treino.zonas?.VO2||0);
    const terrenoAlto = (treino.gradeMedio||0) > 3.5;
    if (acima && plano.tipo !== 'Chave' && plano.tipo !== 'Teste') {
      causa = terrenoAlto
        ? `FC ${Math.round(treino.fcMedia)} acima do alvo — terreno acidentado (grade ${treino.gradeMedio.toFixed(1)}%) explica parte, mas ${foraDaMeta.toFixed(0)}% do tempo ficou em cinza+LT2. Pace escapou, não foi só o relevo.`
        : `FC ${Math.round(treino.fcMedia)} acima do alvo em terreno suave (grade ${treino.gradeMedio?.toFixed(1)}%) — ${foraDaMeta.toFixed(0)}% do tempo em cinza+LT2. O pace escapou pra cima sem justificativa de relevo.`;
    } else if (!acima && (plano.tipo === 'Chave' || plano.tipo === 'Teste')) {
      causa = `FC ${Math.round(treino.fcMedia)} abaixo do alvo — sessão de qualidade não atingiu o estímulo pretendido. Verifique se sobrou pique ou se a prontidão do dia pedia isso.`;
    }
  }
  if (scoreVol < 85 && causa == null) {
    causa = razao < 1
      ? `Duração ${Math.round(treino.duracaoMin)}min ficou ${Math.round((1-razao)*100)}% abaixo do planejado (~${plano.min}min).`
      : `Duração ${Math.round(treino.duracaoMin)}min ficou ${Math.round((razao-1)*100)}% acima do planejado (~${plano.min}min).`;
  }

  return { total, scoreFC:Math.round(scoreFC), scoreVol:Math.round(scoreVol), causa, ...st };
}

/* ═══════════════════════ DADOS ═══════════════════════ */
const SEED_DIARIO = {
  "2026-06-25":{estresseSono:40,fc:52,rmssd:38,cargaCorrida:400,cargaMuscu:300,sonoDuracao:8,sonoEficiencia:90,sonoSubj:8,wFad:3,wHum:4,wDom:2,wMot:5,wStr:1},
  "2026-06-26":{estresseSono:40,fc:53,rmssd:42,sonoDuracao:8,sonoEficiencia:90,sonoSubj:9,wFad:2,wHum:5,wDom:1,wMot:5,wStr:1,cargaMuscu:150,cargaCorrida:160},
  "2026-06-27":{estresseSono:20,cargaMuscu:250,fc:57,rmssd:27,cargaCorrida:210,sonoDuracao:7,sonoEficiencia:75,sonoSubj:7,wFad:3,wHum:4,wDom:2,wMot:3,wStr:2},
  "2026-06-28":{estresseSono:35,cargaMuscu:100,fc:54,rmssd:27,sonoDuracao:8,sonoEficiencia:85,sonoSubj:9,wFad:2,wHum:4,wDom:2,wMot:4,wStr:1},
  "2026-06-29":{estresseSono:7,cargaCorrida:126,fc:54,rmssd:39,sonoDuracao:9,sonoEficiencia:100,sonoSubj:10,wFad:1,wHum:5,wDom:1,wMot:5,wStr:1},
  "2026-06-30":{estresseSono:15,cargaCorrida:192,fc:58,sonoDuracao:6,sonoEficiencia:80,sonoSubj:7,wFad:3,wHum:4,wDom:1,wMot:4,wStr:3,rmssd:29},
  "2026-07-01":{estresseSono:30,fc:59,rmssd:35,sonoDuracao:8.5,sonoEficiencia:90,sonoSubj:8,wFad:3,wHum:5,wDom:2,wMot:5,wStr:2,cargaCorrida:105,cargaMuscu:105},
  "2026-07-02":{estresseSono:0,rmssd:25,fc:58,sonoDuracao:5.5,sonoEficiencia:70,sonoSubj:5,wFad:3,wHum:5,wDom:3,wMot:4,wStr:2},
  "2026-07-03":{estresseSono:35,rmssd:35,fc:54,sonoDuracao:7,sonoEficiencia:80,sonoSubj:7,wFad:2,wHum:4,wDom:2,wMot:5,wStr:2,cargaCorrida:314},
  "2026-07-04":{estresseSono:15,fc:57,rmssd:28,sonoDuracao:8.5,sonoEficiencia:85,sonoSubj:9,wFad:3,wHum:5,wDom:3,wMot:4,wStr:1},
  "2026-07-05":{estresseSono:30,cargaCorrida:146,fc:56,rmssd:23,sonoDuracao:8,sonoEficiencia:80,sonoSubj:9,wFad:2,wHum:5,wDom:2,wMot:4,wStr:2},
  "2026-07-06":{estresseSono:25,fc:54,rmssd:25,sonoDuracao:6,sonoEficiencia:50,sonoSubj:5,wFad:3,wHum:3,wDom:2,wMot:3,wStr:3,cargaCorrida:164},
  "2026-07-07":{estresseSono:58,rmssd:35,fc:55,sonoDuracao:8.5,sonoEficiencia:90,sonoSubj:10,wFad:2,wHum:5,wDom:1,wMot:5,wStr:1,cargaCorrida:220},
  "2026-07-08":{estresseSono:0,fc:56,rmssd:22,sonoDuracao:6,sonoEficiencia:45,sonoSubj:5,wFad:4,wHum:3,wDom:3,wMot:3,wStr:3},
  "2026-07-09":{estresseSono:20,fc:56,rmssd:30,sonoDuracao:6,sonoEficiencia:75,sonoSubj:7,wFad:2,wHum:4,wDom:2,wMot:4,wStr:2,cargaCorrida:192},
  "2026-07-10":{estresseSono:25,fc:56,rmssd:30,cargaCorrida:200,sonoDuracao:8,sonoEficiencia:85,sonoSubj:9,wStr:2,wMot:5,wDom:2,wHum:5,wFad:2},
  "2026-07-11":{estresseSono:30,fc:54,sonoDuracao:5,sonoEficiencia:80,sonoSubj:6,rmssd:32,wHum:4,wFad:2,wMot:4,wDom:3,wStr:2},
  "2026-07-12":{estresseSono:20,cargaCorrida:155,fc:55,rmssd:31,sonoDuracao:7,sonoEficiencia:82,sonoSubj:8,wFad:2,wHum:4,wDom:2,wMot:4,wStr:2},
  "2026-07-17":{cargaCorrida:174},
  "2026-07-20":{cargaCorrida:164},
  "2026-07-21":{cargaCorrida:191},
};
const SEED_TREINOS = [
  { id:"19447409010", data:"2026-07-21", hora:16, distKm:5.39, duracaoMin:29.4, elevM:52.1,
    fcMedia:165, fcMax:175, paceSeg:327, altitudeM:600, gradeMedio:1.96, cadencia:166, re:58,
    zonas:{Z1:1.7,Z2:11.9,LT1:11.9,CINZA:15.3,LT2:57.6,VO2:1.7} },
  { id:"19388497954", data:"2026-07-20", hora:6, distKm:6.21, duracaoMin:41.1, elevM:70.9,
    fcMedia:151, fcMax:175, paceSeg:396, altitudeM:599, gradeMedio:2.32, cadencia:154, re:45,
    zonas:{Z1:18.6,Z2:37.3,LT1:11.9,CINZA:18.6,LT2:11.9,VO2:1.7} },
  { id:"19356139775", data:"2026-07-17", hora:16, distKm:5.99, duracaoMin:38.8, elevM:66.8,
    fcMedia:146, fcMax:178, paceSeg:388, altitudeM:599, gradeMedio:2.37, cadencia:153, re:33,
    zonas:{Z1:37.3,Z2:23.7,LT1:20.3,CINZA:8.5,LT2:6.8,VO2:3.4} },
  { id:"19287174198", data:"2026-07-12", hora:16, distKm:5.52, duracaoMin:34.5, elevM:53.8,
    fcMedia:146, fcMax:168, paceSeg:375, altitudeM:600, gradeMedio:2.08, cadencia:157, re:27,
    zonas:{Z1:16.2,Z2:62.6,LT1:16.2,CINZA:4.0,LT2:1.0,VO2:0} },
  { id:"19253881639", data:"2026-07-09", hora:17, distKm:6.0, duracaoMin:35.0, elevM:65.8,
    fcMedia:161, fcMax:176, paceSeg:350, altitudeM:599, gradeMedio:2.31, cadencia:158, re:62,
    zonas:{Z1:3,Z2:6,LT1:47.5,CINZA:36.4,LT2:5.1,VO2:2} },
  { id:"19168043995", data:"2026-07-03", hora:17, distKm:8.08, duracaoMin:45.5, elevM:110.8,
    fcMedia:163, fcMax:186, paceSeg:338, altitudeM:595, gradeMedio:3.5, cadencia:159, re:92,
    zonas:{Z1:6,Z2:8,LT1:17,CINZA:18,LT2:40,VO2:11} },
];

/* ═══════════════════════ UI ═══════════════════════ */
const Card = ({ children, style, pad=16 }) => (
  <div style={{ background:T.card, border:`1px solid ${T.brd}`, borderRadius:12, padding:pad, ...style }}>{children}</div>
);
const Eyebrow = ({ children, c=T.t3 }) => (
  <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:c, fontFamily:T.mono }}>{children}</div>
);
const Stat = ({ label, value, c=T.t1, sub }) => (
  <div>
    <Eyebrow>{label}</Eyebrow>
    <div style={{ fontSize:23, fontWeight:800, color:c, fontFamily:T.mono, lineHeight:1.1, marginTop:3 }}>{value}</div>
    {sub && <div style={{ fontSize:10, color:T.t3, marginTop:1 }}>{sub}</div>}
  </div>
);
const Tip = ({ active, payload, label }) => !active||!payload?.length ? null : (
  <div style={{ background:T.panel, border:`1px solid ${T.brd2}`, borderRadius:8, padding:'8px 11px', fontSize:11, fontFamily:T.mono }}>
    <div style={{ color:T.t2, marginBottom:4 }}>{label}</div>
    {payload.map(p => <div key={p.name} style={{ color:p.color }}>{p.name}: <b>{typeof p.value==='number'?p.value.toFixed(1):p.value}</b></div>)}
  </div>
);
function Ring({ score, size=124 }) {
  const r=(size-16)/2, cx=size/2, cy=size/2, pct = score==null?0:score/100;
  const c = score==null?T.t3 : score>=75?T.mint : score>=50?T.amber:T.red;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        {Array.from({length:60},(_,i)=>i).map(i=>{
          const a=(i/60)*2*Math.PI, on=i/60<=pct;
          return <line key={i} x1={cx+Math.cos(a)*(r-5)} y1={cy+Math.sin(a)*(r-5)}
            x2={cx+Math.cos(a)*(r+3)} y2={cy+Math.sin(a)*(r+3)}
            stroke={on?c:T.brd} strokeWidth={on?2:1.2} opacity={on?1:.5} strokeLinecap="round"/>;
        })}
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:34, fontWeight:800, color:c, fontFamily:T.mono, lineHeight:1 }}>{score ?? '—'}</div>
        <div style={{ fontSize:8, color:T.t3, letterSpacing:1.4, fontFamily:T.mono, marginTop:2 }}>PRONTIDÃO</div>
      </div>
    </div>
  );
}
const ZoneBar = ({ z, h=7 }) => (
  <div style={{ display:'flex', height:h, borderRadius:h/2, overflow:'hidden', gap:1 }}>
    {ZONES.map(zz => <div key={zz.k} title={`${zz.k} ${z?.[zz.k]||0}%`}
      style={{ width:`${z?.[zz.k]||0}%`, background:zz.c, minWidth:(z?.[zz.k]>0?2:0) }}/>)}
  </div>
);

const hojeISO = () => new Date().toISOString().slice(0,10);
const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

/* Card de Força & Calistenia — reaproveitado na aba Hoje e na aba Plano */
function ForcaCard({ sessao, dowLabel, aberta, onToggle }) {
  if (!sessao) return null;
  return (
    <Card style={{ marginBottom:12, borderLeft:`3px solid ${sessao.cor}` }} pad={0}>
      <div style={{ padding:'14px 16px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
          <Eyebrow c={sessao.cor}>{dowLabel} · Força & Calistenia</Eyebrow>
          {sessao.faseInfo?.label !== 'Fase plena' && (
            <span style={{ fontSize:9, fontWeight:700, color:sessao.faseInfo.cor,
                          background:sessao.faseInfo.cor+'1A', padding:'1px 7px', borderRadius:20 }}>
              {sessao.faseInfo.label}
            </span>
          )}
        </div>
        <div style={{ fontSize:17, fontWeight:800, letterSpacing:-.3, margin:'5px 0 3px' }}>
          💪 {sessao.nome}
        </div>
        <div style={{ fontSize:11, color:T.t2, lineHeight:1.5 }}>{sessao.tag}</div>
        {sessao.faseInfo?.nota && (
          <div style={{ fontSize:11, color:sessao.faseInfo.cor, marginTop:7, lineHeight:1.5,
                        background:sessao.faseInfo.cor+'12', borderRadius:7, padding:'7px 9px' }}>
            ⚠ {sessao.faseInfo.nota}
          </div>
        )}
        <div style={{ display:'flex', gap:7, marginTop:10 }}>
          <div style={{ background:T.lift, borderRadius:7, padding:'6px 10px' }}>
            <div style={{ fontSize:8, color:T.t3, fontFamily:T.mono, letterSpacing:.5 }}>Duração</div>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:T.mono, color:T.t1 }}>~{sessao.min}min</div>
          </div>
          <div style={{ background:T.lift, borderRadius:7, padding:'6px 10px' }}>
            <div style={{ fontSize:8, color:T.t3, fontFamily:T.mono, letterSpacing:.5 }}>Blocos</div>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:T.mono, color:T.t1 }}>{sessao.blocos.length}</div>
          </div>
        </div>
      </div>
      <button onClick={onToggle} style={{
        width:'100%', background:T.lift, border:'none', borderTop:`1px solid ${T.brd}`,
        padding:'10px', color:sessao.cor, fontSize:12, fontWeight:700, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        Ver treino completo {aberta ? '▴' : '▾'}
      </button>
      {aberta && (
        <div style={{ padding:'14px 16px', background:T.panel }}>
          {sessao.blocos.map((b,bi) => (
            <div key={bi} style={{ marginBottom: bi<sessao.blocos.length-1 ? 14 : 0 }}>
              <Eyebrow c={sessao.cor}>{b.t}</Eyebrow>
              <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:6 }}>
                {b.itens.map((it,ii) => (
                  <div key={ii} style={{ background:T.card, borderRadius:7, padding:'8px 10px', border:`1px solid ${T.brd}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.t1 }}>{it.ex}</div>
                      {it.s!=='—' && (
                        <div style={{ fontSize:11, fontFamily:T.mono, color:sessao.cor, fontWeight:700, whiteSpace:'nowrap' }}>
                          {it.s} {it.r}
                        </div>
                      )}
                    </div>
                    {it.s==='—' && (
                      <div style={{ fontSize:11, fontFamily:T.mono, color:sessao.cor, marginTop:2 }}>{it.r}</div>
                    )}
                    <div style={{ display:'flex', gap:10, marginTop:4, fontSize:9, color:T.t3, fontFamily:T.mono, flexWrap:'wrap' }}>
                      {it.c!=='—' && <span>carga: {it.c}</span>}
                      {it.d!=='—' && <span>desc: {it.d}</span>}
                    </div>
                    {it.o && <div style={{ fontSize:10.5, color:T.t2, marginTop:4, lineHeight:1.5, fontStyle:'italic' }}>{it.o}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ═══════════════════════ APP ═══════════════════════ */
export default function App() {
  const [diario, setDiario] = useState(SEED_DIARIO);
  const [treinos, setTreinos] = useState(SEED_TREINOS);
  const [aba, setAba] = useState('hoje');
  const [dataSel, setDataSel] = useState(hojeISO());
  const [mesRef, setMesRef] = useState(() => { const d=new Date(); return { a:d.getFullYear(), m:d.getMonth() }; });
  const [toast, setToast] = useState(null);
  const [openExec, setOpenExec] = useState(true);
  const [openForca, setOpenForca] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => { (async () => {
    try { const r = await window.storage.get('monitor_v2');
      if (r?.value) { const d=JSON.parse(r.value); setDiario(d.diario||SEED_DIARIO); setTreinos(d.treinos||SEED_TREINOS); }
    } catch {}
  })(); }, []);
  const salvar = useCallback(async (d,t) => {
    try { await window.storage.set('monitor_v2', JSON.stringify({ diario:d, treinos:t })); } catch {}
  }, []);
  const flash = m => { setToast(m); setTimeout(()=>setToast(null), 3600); };

  const serie = useMemo(() => {
    const ds = Object.keys(diario).sort();
    if (!ds.length) return [];
    const ini = new Date(ds[0]+'T12:00:00'), fim = new Date(hojeISO()+'T12:00:00');
    const out = [];
    for (let d=new Date(ini); d<=fim; d.setDate(d.getDate()+1)) {
      const iso = d.toISOString().slice(0,10);
      out.push({ data:iso, ...(diario[iso]||{}) });
    }
    return calcPMC(out);
  }, [diario]);

  const prontSerie = useMemo(() => serie.map((d,i) => {
    const hist = serie.slice(Math.max(0,i-28), i).filter(x=>x.rmssd!=null||x.fc!=null);
    const p = calcProntidao(d, hist);
    return { ...d, prontidao:p?.score ?? null, partes:p?.parts };
  }), [serie]);

  const ultimo = [...prontSerie].reverse().find(d=>d.prontidao!=null);
  const monoStrain = useMemo(() => calcMonotoniaStrain(serie.slice(-7)), [serie]);
  const debitoSono = useMemo(() => calcDebitoSono(serie.slice(-7)), [serie]);
  const acwrSt = acwrStatus(ultimo?.acwr);
  const sessaoHoje = sessaoDoDia(hojeISO());
  const sessaoForcaHoje = forcaDoDiaAdaptada(hojeISO());
  const posHoje = posMacro(hojeISO());

  /* baselines de HRV, FC repouso, estresse do sono, eficiência e sono subjetivo */
  const BASE_METRICAS = [
    { k:'rmssd', l:'HRV (rMSSD)', u:'ms', c:T.violet, inv:false },
    { k:'fc', l:'FC repouso', u:'bpm', c:T.coral, inv:true },
    { k:'estresseSono', l:'Baixo estresse no sono', u:'%', c:T.cyan, inv:false },
    { k:'sonoEficiencia', l:'Eficiência do sono', u:'%', c:T.mint, inv:false },
    { k:'sonoDuracao', l:'Duração do sono', u:'h', c:T.blue, inv:false },
  ];
  const baselines = useMemo(() => {
    const out = {};
    for (const m of BASE_METRICAS) out[m.k] = { serie: baselineSerie(serie, m.k, m.inv), resumo: resumoBaseline(serie, m.k) };
    return out;
  }, [serie]);

  const tendencia = useMemo(() => {
    const p = prontSerie.filter(d=>d.prontidao!=null).slice(-7).map(d=>d.prontidao);
    if (p.length<4) return null;
    const a=p.slice(0,Math.floor(p.length/2)), b=p.slice(-Math.floor(p.length/2));
    return Math.round(b.reduce((x,y)=>x+y,0)/b.length - a.reduce((x,y)=>x+y,0)/a.length);
  }, [prontSerie]);

  /* aderência da semana corrente (seg–dom) — cruza treinos sincronizados com o microciclo do plano */
  const aderenciaSemana = useMemo(() => {
    const hoje = new Date(hojeISO()+'T12:00:00');
    const dow = hoje.getDay();
    const seg = new Date(hoje); seg.setDate(hoje.getDate() - ((dow+6)%7));
    const dias = Array.from({length:7}, (_,i) => { const d=new Date(seg); d.setDate(seg.getDate()+i); return d.toISOString().slice(0,10); });
    const linhas = dias
      .filter(iso => iso <= hojeISO())
      .map(iso => {
        const plano = sessaoDoDia(iso);
        if (!plano) return null;
        const tr = treinos.find(t => t.data === iso);
        const val = tr ? validar(plano, tr) : null;
        return { iso, dow:new Date(iso+'T12:00:00').getDay(), plano, tr, val };
      })
      .filter(Boolean);
    const chaves = linhas.filter(l => l.plano.tipo==='Chave' || l.plano.tipo==='Teste');
    const faceis = linhas.filter(l => l.plano.tipo==='Fácil');
    const cont = arr => ({
      feito: arr.filter(l => l.val).length,
      cumprido: arr.filter(l => l.val && l.val.total>=90).length,
      total: arr.length,
    });
    return { linhas, chaves:cont(chaves), faceis:cont(faceis) };
  }, [treinos, diario]);

  const setCampo = (campo,valor) => {
    const v = valor===''?null:Number(valor);
    const novo = { ...diario, [dataSel]:{ ...(diario[dataSel]||{}), [campo]:v } };
    setDiario(novo); salvar(novo, treinos);
  };
  const exportar = () => {
    const blob = new Blob([JSON.stringify({ v:5, exported:new Date().toISOString(), entries:diario, treinos }, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `monitor-${hojeISO()}.json`; a.click();
    URL.revokeObjectURL(a.href); flash('Arquivo exportado');
  };
  /* remove treinos duplicados do Strava — mesmo dia+hora e distância muito próxima
     (comum quando relógio e celular gravam a mesma corrida como 2 atividades) */
  const dedupeTreinos = list => {
    const out = [];
    for (const tr of list) {
      const dup = out.find(o =>
        o.data === tr.data && Math.abs((o.hora??0) - (tr.hora??0)) <= 0 &&
        Math.abs((o.distKm||0) - (tr.distKm||0)) < 0.15
      );
      if (!dup) { out.push(tr); continue; }
      /* mantém o que tem mais dado (zonas/cadência) */
      const scoreOf = x => (x.zonas?Object.keys(x.zonas).length:0) + (x.cadencia?1:0) + (x.fcMedia?1:0);
      if (scoreOf(tr) > scoreOf(dup)) { out[out.indexOf(dup)] = tr; }
    }
    return out;
  };
  const processarImport = (raw) => {
    if (!raw || !raw.trim()) { flash('Cole o JSON antes de processar'); return; }
    try {
      const j = JSON.parse(raw);
      const d = j.entries || j.diario || {};
      const tRaw = j.treinos ? [...treinos, ...j.treinos] : treinos;
      const t = dedupeTreinos(tRaw);
      const removidos = tRaw.length - t.length;
      const nDias = Object.keys(d).length;
      setDiario(prev => { const m = { ...prev, ...d }; salvar(m, t); return m; });
      if (j.treinos) setTreinos(t);
      if (nDias === 0 && !j.treinos) { flash('JSON válido, mas sem "entries" nem "treinos" reconhecidos'); return; }
      flash(`${nDias} dia(s) + ${j.treinos?.length||0} treino(s) importados${removidos>0?` · ${removidos} duplicata(s) removida(s)`:''}`);
      setShowImport(false); setImportText('');
    } catch (err) {
      flash('JSON inválido — confira se copiou o bloco completo');
    }
  };
  const importarArquivo = e => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => processarImport(rd.result);
    rd.onerror = () => flash('Não consegui ler o arquivo');
    rd.readAsText(f); e.target.value = '';
  };
  const colarClipboard = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setImportText(txt);
      flash('Colado — confira e clique em Processar');
    } catch {
      flash('Sem permissão de clipboard — cole manualmente no campo (Ctrl/Cmd+V)');
    }
  };
  const aplicarSRPE = tr => {
    const c = calcSRPE(tr);
    if (!c) { flash('Treino sem FC — sRPE não calculável'); return; }
    const novo = { ...diario, [tr.data]:{ ...(diario[tr.data]||{}), cargaCorrida:c.srpe } };
    setDiario(novo); salvar(novo, treinos);
    /* recalcula o PMC projetado na hora, pro toast já refletir o novo TSB */
    const ds = Object.keys(novo).sort();
    const ini = new Date(ds[0]+'T12:00:00'), fim = new Date(hojeISO()+'T12:00:00');
    const out = [];
    for (let d=new Date(ini); d<=fim; d.setDate(d.getDate()+1)) {
      const iso = d.toISOString().slice(0,10);
      out.push({ data:iso, ...(novo[iso]||{}) });
    }
    const pmc = calcPMC(out);
    const last = pmc[pmc.length-1];
    flash(`sRPE ${c.srpe} gravado em ${tr.data} · TSB agora ${last?.tsb ?? '—'} · ACWR ${last?.acwr ?? '—'}`);
  };

  /* veredito cruzando plano × prontidão */
  const veredito = useMemo(() => {
    const s = sessaoHoje, r = ultimo?.prontidao;
    if (!s) return { c:T.t3, txt:'Fora do macrociclo — o plano começa em 06/07/2026.' };
    if (r == null) return { c:T.t3, txt:'Registre os dados de hoje no Diário para receber a leitura cruzada.' };
    if (s.tipo==='Chave' || s.tipo==='Teste') {
      if (r>=70 && (ultimo.acwr ?? 1)<=1.5) return { c:T.mint, txt:`Prontidão ${r} — siga o plano como está.` };
      if (r>=50) return { c:T.amber, txt:`Prontidão ${r} — pode treinar, mas no piso da faixa ou com um bloco a menos. Pare se a FC escalar.` };
      return { c:T.red, txt:`Prontidão ${r} — troque por Z2 fácil. Dia-chave com prontidão baixa vira fadiga sem estímulo.` };
    }
    if (s.tipo==='Longo')
      return r>=60 ? { c:T.mint, txt:`Prontidão ${r} — siga o longo como planejado.` }
                   : { c:T.amber, txt:`Prontidão ${r} — encurte 20–30% e fique na base do pace.` };
    return r<40 ? { c:T.amber, txt:`Dia leve já previsto — com prontidão em ${r}, mantenha bem fácil.` }
                : { c:T.mint, txt:`Siga como planejado.` };
  }, [sessaoHoje, ultimo]);

  const abas = [
    { k:'hoje', n:'Hoje' }, { k:'diario', n:'Diário' }, { k:'baselines', n:'Baselines' },
    { k:'carga', n:'Carga' }, { k:'treinos', n:'Treinos' }, { k:'plano', n:'Plano' },
    { k:'sync', n:'Prompt Strava' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.t1, fontFamily:T.sans, paddingBottom:70 }}>

      <header style={{ background:T.panel, borderBottom:`1px solid ${T.brd}`, position:'sticky', top:0, zIndex:30 }}>
        <div style={{ maxWidth:720, margin:'0 auto', padding:'13px 18px 0' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:11 }}>
            <div>
              <Eyebrow c={T.cyan}>Macrociclo 2026–2027 · Sub-20</Eyebrow>
              <div style={{ fontSize:16, fontWeight:800, letterSpacing:-.3, marginTop:2 }}>
                {posHoje ? `${posHoje.meso.emoji} ${posHoje.meso.k} · ${posHoje.meso.nome}` : 'Painel do atleta'}
              </div>
              {posHoje && (
                <div style={{ fontSize:10, color:T.t3, fontFamily:T.mono, marginTop:1 }}>
                  Semana {posHoje.nSem}/{posHoje.totalSem} · {posHoje.semana.fase} · meta {posHoje.meso.meta}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setShowImport(v=>!v)} style={{
                background: showImport?T.cyan:T.lift, color: showImport?T.bg:T.t2,
                border:`1px solid ${T.brd2}`, borderRadius:7, padding:'6px 10px',
                fontSize:11, fontWeight:600, cursor:'pointer' }}>
                Importar
              </button>
              <button onClick={exportar} style={{ background:T.lift, border:`1px solid ${T.brd2}`, borderRadius:7, padding:'6px 10px', fontSize:11, fontWeight:600, cursor:'pointer', color:T.t2 }}>
                Exportar
              </button>
            </div>
          </div>
          {showImport && (
            <div style={{ background:T.lift, border:`1px solid ${T.brd2}`, borderRadius:9, padding:12, marginBottom:12 }}>
              <Eyebrow c={T.cyan}>Colar JSON de sincronização</Eyebrow>
              <div style={{ fontSize:10, color:T.t3, margin:'4px 0 8px', lineHeight:1.5 }}>
                Peça no chat com o prompt da aba "Prompt Strava" e cole a resposta do Claude aqui.
              </div>
              <textarea value={importText} onChange={e=>setImportText(e.target.value)}
                placeholder='{"entries": {...}, "treinos": [...]}'
                rows={5}
                style={{ width:'100%', background:T.card, border:`1px solid ${T.brd2}`, borderRadius:7,
                         padding:'8px 10px', color:T.t1, fontSize:11, fontFamily:T.mono, resize:'vertical',
                         outline:'none' }} />
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <button onClick={colarClipboard} style={{
                  background:T.card, border:`1px solid ${T.brd2}`, borderRadius:7, padding:'7px 11px',
                  fontSize:11, fontWeight:600, color:T.t2, cursor:'pointer' }}>
                  Colar da área de transferência
                </button>
                <button onClick={()=>processarImport(importText)} style={{
                  background:T.cyan, border:'none', borderRadius:7, padding:'7px 14px',
                  fontSize:11, fontWeight:700, color:T.bg, cursor:'pointer', flex:1 }}>
                  Processar
                </button>
                <label style={{ background:T.card, border:`1px solid ${T.brd2}`, borderRadius:7,
                                padding:'7px 11px', fontSize:11, fontWeight:600, color:T.t2, cursor:'pointer' }}>
                  Arquivo…
                  <input type="file" accept=".json" onChange={importarArquivo} style={{ display:'none' }}/>
                </label>
              </div>
            </div>
          )}
          <nav style={{ display:'flex', gap:2 }}>
            {abas.map(a => (
              <button key={a.k} onClick={()=>setAba(a.k)} style={{
                background:'transparent', border:'none', cursor:'pointer', padding:'9px 12px', fontSize:12,
                fontWeight:aba===a.k?700:500, color:aba===a.k?T.cyan:T.t2,
                borderBottom:`2px solid ${aba===a.k?T.cyan:'transparent'}` }}>{a.n}</button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth:720, margin:'0 auto', padding:'14px 16px 0' }}>

        {/* ═══ HOJE ═══ */}
        {aba==='hoje' && (
          <>
            {/* Sessão do dia — o herói */}
            {sessaoHoje && (
              <Card style={{ marginBottom:12, borderLeft:`3px solid ${sessaoHoje.lib.cor}` }} pad={0}>
                <div style={{ padding:'14px 16px 12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Eyebrow c={sessaoHoje.lib.cor}>
                        {DIAS[sessaoHoje.dow]} · {sessaoHoje.tipo} · S{sessaoHoje.nSem} {sessaoHoje.semana.fase}
                      </Eyebrow>
                      <div style={{ fontSize:19, fontWeight:800, letterSpacing:-.3, margin:'5px 0 3px' }}>
                        {sessaoHoje.titulo}
                      </div>
                      <div style={{ fontSize:14, color:sessaoHoje.lib.cor, fontWeight:700, fontFamily:T.mono }}>
                        {sessaoHoje.detalhe}
                      </div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:7, marginTop:12, flexWrap:'wrap' }}>
                    {[
                      { l:'FC alvo', v:`${sessaoHoje.fc[0]}–${sessaoHoje.fc[1]}` },
                      { l:'Pace', v:sessaoHoje.pace },
                      { l:'Duração', v:`~${sessaoHoje.min}min` },
                    ].map(m => (
                      <div key={m.l} style={{ background:T.lift, borderRadius:7, padding:'6px 10px', flex:1, minWidth:80 }}>
                        <div style={{ fontSize:8, color:T.t3, fontFamily:T.mono, letterSpacing:.5 }}>{m.l}</div>
                        <div style={{ fontSize:13, fontWeight:700, fontFamily:T.mono, color:T.t1 }}>{m.v}</div>
                      </div>
                    ))}
                  </div>

                  {sessaoHoje.extra && sessaoHoje.extra!=='—' && (
                    <div style={{ fontSize:11, color:T.t2, marginTop:9 }}>
                      <span style={{ color:T.t3 }}>Complemento: </span>{sessaoHoje.extra}
                    </div>
                  )}

                  <div style={{ background:T.lift, borderRadius:8, padding:'9px 11px', marginTop:10,
                                borderLeft:`2px solid ${veredito.c}` }}>
                    <div style={{ fontSize:12, color:veredito.c, fontWeight:600, lineHeight:1.5 }}>{veredito.txt}</div>
                  </div>

                  {sessaoHoje.semana.alerta && (
                    <div style={{ fontSize:11, color:T.t2, marginTop:8, fontStyle:'italic' }}>
                      ⚠ {sessaoHoje.semana.alerta}
                    </div>
                  )}
                </div>

                <button onClick={()=>setOpenExec(!openExec)} style={{
                  width:'100%', background:T.lift, border:'none', borderTop:`1px solid ${T.brd}`,
                  padding:'10px', color:sessaoHoje.lib.cor, fontSize:12, fontWeight:700, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  Como executar {openExec ? '▴' : '▾'}
                </button>

                {openExec && (
                  <div style={{ padding:'14px 16px', background:T.panel }}>
                    <div style={{ fontSize:12, color:T.t2, fontStyle:'italic', marginBottom:12 }}>
                      {sessaoHoje.lib.tag}
                    </div>
                    {[
                      { i:'🎯', l:'Função', t:sessaoHoje.lib.func },
                      { i:'🧱', l:'Estrutura', t:sessaoHoje.lib.estrut },
                    ].map(s => (
                      <div key={s.l} style={{ marginBottom:11 }}>
                        <Eyebrow c={T.t3}>{s.i} {s.l}</Eyebrow>
                        <div style={{ fontSize:12, color:T.t1, lineHeight:1.6, marginTop:3 }}>{s.t}</div>
                      </div>
                    ))}
                    <div style={{ marginBottom:11 }}>
                      <Eyebrow c={sessaoHoje.lib.cor}>▶ Passo a passo</Eyebrow>
                      <ol style={{ margin:'6px 0 0', paddingLeft:0, listStyle:'none' }}>
                        {sessaoHoje.lib.exec.map((p,i) => (
                          <li key={i} style={{ display:'flex', gap:8, marginBottom:6, fontSize:12, lineHeight:1.55 }}>
                            <span style={{ color:sessaoHoje.lib.cor, fontFamily:T.mono, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                            <span style={{ color:T.t1 }}>{p}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div style={{ marginBottom:11 }}>
                      <Eyebrow c={T.coral}>⚠ Erros frequentes</Eyebrow>
                      <div style={{ fontSize:12, color:T.t2, lineHeight:1.6, marginTop:3 }}>{sessaoHoje.lib.erros}</div>
                    </div>
                    <div style={{ background:T.card, borderRadius:8, padding:'9px 11px' }}>
                      <Eyebrow c={T.amber}>💡 Dica</Eyebrow>
                      <div style={{ fontSize:12, color:T.t1, lineHeight:1.6, marginTop:3 }}>{sessaoHoje.lib.dica}</div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Força & Calistenia de hoje — fixo semanalmente, independente do macrociclo de corrida */}
            <ForcaCard sessao={sessaoForcaHoje} dowLabel={DIAS[new Date(hojeISO()+'T12:00:00').getDay()]}
              aberta={openForca} onToggle={()=>setOpenForca(!openForca)} />

            {/* Aderência semanal — semáforo do microciclo */}
            {(aderenciaSemana.chaves.total>0 || aderenciaSemana.faceis.total>0) && (
              <Card style={{ marginBottom:12 }}>
                <Eyebrow>Aderência ao plano · semana corrente</Eyebrow>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
                  {[
                    { l:'Chaves', d:aderenciaSemana.chaves },
                    { l:'Fáceis', d:aderenciaSemana.faceis },
                  ].map(({l,d}) => {
                    const cor = d.total===0 ? T.t3 : d.cumprido===d.feito && d.feito===d.total ? T.mint
                              : d.cumprido >= d.feito*0.5 ? T.amber : T.red;
                    return (
                      <div key={l} style={{ background:T.lift, borderRadius:8, padding:'9px 11px' }}>
                        <div style={{ fontSize:9, color:T.t3, fontFamily:T.mono, letterSpacing:.5, marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:20, fontWeight:800, fontFamily:T.mono, color:cor, lineHeight:1 }}>
                          {d.cumprido}/{d.total}
                        </div>
                        <div style={{ fontSize:9, color:T.t3, marginTop:2 }}>
                          {d.feito} sincronizado{d.feito!==1?'s':''} de {d.total} previsto{d.total!==1?'s':''}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:'flex', gap:4, marginTop:10 }}>
                  {aderenciaSemana.linhas.map(l => {
                    const cor = !l.val ? T.brd
                              : l.val.total>=90 ? T.mint : l.val.total>=70 ? T.amber : T.red;
                    return (
                      <div key={l.iso} title={`${DIAS[l.dow]}: ${l.plano.titulo}${l.val?' · '+l.val.total+'%':''}`}
                        style={{ flex:1, height:6, borderRadius:2, background:cor,
                                 opacity: l.plano.tipo==='Chave'||l.plano.tipo==='Teste' ? 1 : 0.55 }} />
                    );
                  })}
                </div>
                {aderenciaSemana.faceis.feito > aderenciaSemana.faceis.cumprido && (
                  <div style={{ fontSize:11, color:T.amber, marginTop:9, lineHeight:1.5 }}>
                    {aderenciaSemana.faceis.feito - aderenciaSemana.faceis.cumprido} dia(s) fácil saiu da zona-alvo esta semana — o padrão de pace escapando pra cima continua.
                  </div>
                )}
              </Card>
            )}

            <Card style={{ marginBottom:12, display:'flex', gap:16, alignItems:'center' }} pad={16}>
              <Ring score={ultimo?.prontidao ?? null} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11, marginBottom:10 }}>
                  <Stat label="TSB · forma" value={ultimo?.tsb ?? '—'}
                    c={ultimo?.tsb>5?T.mint : ultimo?.tsb<-20?T.red : T.amber}
                    sub={ultimo?.tsb>5?'Fresco' : ultimo?.tsb<-20?'Fadiga alta':'Construindo'} />
                  <Stat label="ACWR" value={ultimo?.acwr ?? '—'} c={acwrSt.c} sub={acwrSt.txt} />
                  <Stat label="ATL · aguda" value={ultimo?.atl ?? '—'} c={T.coral} sub="média 7d" />
                  <Stat label="CTL · fitness" value={ultimo?.ctl ?? '—'} c={T.cyan} sub="média 42d" />
                </div>
                {tendencia!=null && (
                  <div style={{ fontSize:11, color:tendencia<-3?T.amber:T.t2, borderLeft:`2px solid ${tendencia<-3?T.amber:T.brd2}`, paddingLeft:9 }}>
                    Prontidão {tendencia>0?'subindo':tendencia<0?'caindo':'estável'} {tendencia>0?'+':''}{tendencia} pts na semana
                  </div>
                )}
              </div>
            </Card>

            <Card style={{ marginBottom:12 }}>
              <Eyebrow>Prontidão · HRV · FC repouso</Eyebrow>
              <ResponsiveContainer width="100%" height={165}>
                <ComposedChart data={prontSerie.slice(-21)} margin={{top:12,right:4,bottom:0,left:-24}}>
                  <ReferenceArea y1={0} y2={50} yAxisId="p" fill={T.red} fillOpacity={.05}/>
                  <ReferenceArea y1={50} y2={75} yAxisId="p" fill={T.amber} fillOpacity={.05}/>
                  <XAxis dataKey="data" tickFormatter={d=>d.slice(8)} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="p" domain={[0,100]} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false} width={32}/>
                  <YAxis yAxisId="h" orientation="right" hide/>
                  <Tooltip content={<Tip/>}/>
                  <Area yAxisId="p" type="monotone" dataKey="prontidao" name="Prontidão" stroke={T.cyan} strokeWidth={2} fill={T.cyan+'1A'} connectNulls dot={{r:2.5,fill:T.cyan}}/>
                  <Line yAxisId="h" type="monotone" dataKey="rmssd" name="rMSSD" stroke={T.violet} strokeWidth={1.3} dot={false} connectNulls strokeDasharray="3 2"/>
                  <Line yAxisId="h" type="monotone" dataKey="fc" name="FCR" stroke={T.coral} strokeWidth={1.3} dot={false} connectNulls/>
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:13, fontSize:10, color:T.t3, fontFamily:T.mono }}>
                <span><span style={{color:T.cyan}}>■</span> Prontidão</span>
                <span><span style={{color:T.violet}}>■</span> rMSSD</span>
                <span><span style={{color:T.coral}}>■</span> FC repouso</span>
              </div>
            </Card>

            {ultimo?.partes && (
              <Card>
                <Eyebrow>Composição do escore · {ultimo.data.split('-').reverse().slice(0,2).join('/')}</Eyebrow>
                <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
                  {ultimo.partes.map(p => (
                    <div key={p.k}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                        <span style={{ color:T.t2 }}>{p.k} <span style={{ color:T.t3, fontFamily:T.mono }}>· {Math.round(p.w*100)}%</span></span>
                        <span style={{ fontFamily:T.mono, fontWeight:700, color:p.v>=70?T.mint:p.v>=45?T.amber:T.red }}>{Math.round(p.v)}</span>
                      </div>
                      <div style={{ height:4, background:T.brd, borderRadius:2 }}>
                        <div style={{ width:`${p.v}%`, height:4, borderRadius:2, background:p.v>=70?T.mint:p.v>=45?T.amber:T.red }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ═══ DIÁRIO ═══ */}
        {aba==='diario' && (
          <>
            <Card style={{ marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                <div>
                  <Eyebrow>Data do registro</Eyebrow>
                  <input type="date" value={dataSel} onChange={e=>setDataSel(e.target.value)}
                    style={{ background:T.lift, border:`1px solid ${T.brd2}`, borderRadius:7, padding:'7px 10px',
                             color:T.t1, fontSize:13, marginTop:5, fontFamily:T.mono, colorScheme:'dark' }}/>
                  {(() => { const s = sessaoDoDia(dataSel);
                    return s ? <div style={{ fontSize:10, color:s.lib.cor, marginTop:6, fontFamily:T.mono }}>
                      {s.meso.emoji} {s.meso.k} S{s.nSem} · {s.titulo}</div> : null; })()}
                </div>
                <Ring score={prontSerie.find(d=>d.data===dataSel)?.prontidao ?? null} size={88}/>
              </div>
            </Card>
            {[
              { t:'Autonômico', c:[{k:'fc',l:'FC repouso',u:'bpm',s:1},{k:'rmssd',l:'HRV (rMSSD)',u:'ms',s:1}] },
              { t:'Sono', c:[{k:'sonoDuracao',l:'Duração',u:'h',s:.5},{k:'sonoEficiencia',l:'Eficiência',u:'%',s:5},{k:'sonoSubj',l:'Nota',u:'1–10',s:1},{k:'estresseSono',l:'Baixo estresse',u:'%',s:5}] },
              { t:'Percepção (1–5)', c:[{k:'wFad',l:'Fadiga',u:'↓ melhor',s:1},{k:'wHum',l:'Humor',u:'↑ melhor',s:1},{k:'wDom',l:'Dor muscular',u:'↓ melhor',s:1},{k:'wMot',l:'Motivação',u:'↑ melhor',s:1},{k:'wStr',l:'Estresse',u:'↓ melhor',s:1}] },
              { t:'Carga do dia', c:[{k:'cargaCorrida',l:'sRPE corrida',u:'ua',s:5},{k:'cargaMuscu',l:'sRPE musculação',u:'ua',s:5}] },
            ].map(g => (
              <Card key={g.t} style={{ marginBottom:10 }}>
                <Eyebrow>{g.t}</Eyebrow>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))', gap:9, marginTop:10 }}>
                  {g.c.map(c => (
                    <div key={c.k}>
                      <div style={{ fontSize:10, color:T.t2, marginBottom:3 }}>
                        {c.l} <span style={{ color:T.t3, fontFamily:T.mono }}>{c.u}</span>
                      </div>
                      <input type="number" step={c.s} value={diario[dataSel]?.[c.k] ?? ''} placeholder="—"
                        onChange={e=>setCampo(c.k, e.target.value)}
                        style={{ width:'100%', background:T.lift, border:`1px solid ${T.brd2}`, borderRadius:7,
                                 padding:'8px 10px', color:T.t1, fontSize:14, fontFamily:T.mono, fontWeight:600, outline:'none' }}/>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ═══ BASELINES ═══ */}
        {aba==='baselines' && (
          <>
            <Card style={{ marginBottom:12, background:T.panel }}>
              <Eyebrow c={T.cyan}>Sobre as baselines</Eyebrow>
              <div style={{ fontSize:11, color:T.t2, marginTop:5, lineHeight:1.55 }}>
                Cada linha compara o valor do dia com a média móvel dos últimos 28 dias (faixa sombreada = ±1 desvio-padrão).
                Fora da faixa pra melhor = 🟢, fora pra pior = 🔴, dentro da faixa = neutro.
              </div>
            </Card>

            {/* Débito de sono — Van Dongen et al. 2003, estilo Oura/Whoop */}
            {debitoSono && (() => {
              const ds = debitoStatus(debitoSono.debitoH);
              return (
                <Card style={{ marginBottom:12, borderLeft:`3px solid ${ds.c}` }}>
                  <Eyebrow>Débito de sono <span style={{color:T.t3, fontWeight:400}}>· janela 7 dias</span></Eyebrow>
                  <div style={{ fontSize:10, color:T.t3, margin:'2px 0 10px' }}>
                    O efeito cumulativo de sono curto é sub-percebido pelo próprio corpo — o débito importa
                    mais que uma noite isolada ruim (Van Dongen et al., 2003).
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                    <div style={{ fontSize:30, fontWeight:800, fontFamily:T.mono, color:ds.c, lineHeight:1 }}>
                      {debitoSono.debitoH}h
                    </div>
                    <div style={{ fontSize:11, color:ds.c, fontWeight:600 }}>{ds.txt}</div>
                  </div>
                  <div style={{ fontSize:10, color:T.t3, fontFamily:T.mono, marginTop:4 }}>
                    média {debitoSono.mediaH}h/noite em {debitoSono.dias} dias registrados · meta 8h
                  </div>
                  {debitoSono.debitoH >= 7 && (
                    <div style={{ background:T.red+'14', border:`1px solid ${T.red}44`, borderRadius:8,
                                  padding:'9px 11px', fontSize:11, color:T.coral, marginTop:9, lineHeight:1.5 }}>
                      Débito equivalente a uma noite inteira perdida. Priorize 1-2 noites de 9h+ antes da
                      próxima sessão-chave — sono não se recupera 1-para-1, mas ajuda a estancar o acúmulo.
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* cards-resumo */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              {BASE_METRICAS.map(m => {
                const r = baselines[m.k].resumo;
                const dentro = r.atual!=null && r.media!=null;
                const delta = dentro ? r.atual - r.media : null;
                const deltaPct = dentro && r.media ? (delta/r.media*100) : null;
                const bom = delta==null ? null : (m.inv ? delta<0 : delta>0);
                return (
                  <Card key={m.k} pad={12}>
                    <Eyebrow c={m.c}>{m.l}</Eyebrow>
                    <div style={{ display:'flex', alignItems:'baseline', gap:5, marginTop:4 }}>
                      <div style={{ fontSize:22, fontWeight:800, fontFamily:T.mono, color:T.t1 }}>
                        {r.atual!=null ? r.atual : '—'}
                      </div>
                      <div style={{ fontSize:10, color:T.t3 }}>{m.u}</div>
                    </div>
                    <div style={{ fontSize:9, color:T.t3, fontFamily:T.mono, marginTop:2 }}>
                      base 28d: {r.media!=null ? r.media.toFixed(1) : '—'} (n={r.n})
                    </div>
                    {deltaPct!=null && (
                      <div style={{ fontSize:10, fontWeight:700, marginTop:3,
                                    color: bom==null?T.t3 : bom?T.mint:T.coral }}>
                        {bom?'▲':'▼'} {Math.abs(deltaPct).toFixed(0)}% vs. base
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* gráficos individuais */}
            {BASE_METRICAS.map(m => (
              <Card key={m.k} style={{ marginBottom:12 }}>
                <Eyebrow c={m.c}>{m.l}</Eyebrow>
                <ResponsiveContainer width="100%" height={140}>
                  <ComposedChart data={baselines[m.k].serie.slice(-30)} margin={{top:10,right:4,bottom:0,left:-24}}>
                    <XAxis dataKey="data" tickFormatter={d=>d.slice(8)} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false}/>
                    <YAxis domain={['auto','auto']} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false} width={32}/>
                    <Tooltip content={<Tip/>}/>
                    <Area type="monotone" dataKey="baseHi" name="Base +1SD" stroke="none" fill={m.c+'12'} connectNulls/>
                    <Area type="monotone" dataKey="baseLo" name="Base -1SD" stroke="none" fill={T.bg} fillOpacity={1} connectNulls/>
                    <Line type="monotone" dataKey="baseMean" name="Baseline" stroke={T.t3} strokeWidth={1} strokeDasharray="3 3" dot={false} connectNulls/>
                    <Line type="monotone" dataKey="valor" name={m.l} stroke={m.c} strokeWidth={2} dot={{r:2.5,fill:m.c}} connectNulls/>
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            ))}

            {/* composição da prontidão (reaproveitada aqui como resumo) */}
            {ultimo?.partes && (
              <Card>
                <Eyebrow>Composição do escore de prontidão · hoje</Eyebrow>
                <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
                  {ultimo.partes.map(p => (
                    <div key={p.k}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                        <span style={{ color:T.t2 }}>{p.k} <span style={{ color:T.t3, fontFamily:T.mono }}>· {Math.round(p.w*100)}%</span></span>
                        <span style={{ fontFamily:T.mono, fontWeight:700, color:p.v>=70?T.mint:p.v>=45?T.amber:T.red }}>{Math.round(p.v)}</span>
                      </div>
                      <div style={{ height:4, background:T.brd, borderRadius:2 }}>
                        <div style={{ width:`${p.v}%`, height:4, borderRadius:2, background:p.v>=70?T.mint:p.v>=45?T.amber:T.red }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ═══ CARGA ═══ */}
        {aba==='carga' && (
          <>
            <Card style={{ marginBottom:12 }}>
              <Eyebrow>Performance Management Chart</Eyebrow>
              <div style={{ fontSize:10, color:T.t3, margin:'2px 0 8px' }}>
                CTL = fitness · ATL = fadiga recente · TSB = forma (CTL − ATL)
              </div>
              <ResponsiveContainer width="100%" height={195}>
                <ComposedChart data={serie} margin={{top:8,right:4,bottom:0,left:-26}}>
                  <ReferenceLine y={0} stroke={T.brd2}/>
                  <XAxis dataKey="data" tickFormatter={d=>d.slice(8)} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false} width={34}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="carga" name="Carga" fill={T.brd2} radius={[2,2,0,0]} maxBarSize={13}/>
                  <Area type="monotone" dataKey="ctl" name="CTL" stroke={T.cyan} strokeWidth={2} fill={T.cyan+'14'} dot={false}/>
                  <Line type="monotone" dataKey="atl" name="ATL" stroke={T.coral} strokeWidth={1.6} dot={false}/>
                  <Line type="monotone" dataKey="tsb" name="TSB" stroke={T.violet} strokeWidth={1.4} strokeDasharray="3 3" dot={false}/>
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:13, fontSize:10, color:T.t3, fontFamily:T.mono }}>
                <span><span style={{color:T.cyan}}>■</span> CTL</span><span><span style={{color:T.coral}}>■</span> ATL</span>
                <span><span style={{color:T.violet}}>■</span> TSB</span><span><span style={{color:T.brd2}}>■</span> carga</span>
              </div>
            </Card>

            <Card style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <Eyebrow>Razão carga aguda / crônica</Eyebrow>
                  <div style={{ fontSize:31, fontWeight:800, fontFamily:T.mono, color:acwrSt.c, lineHeight:1.1, marginTop:4 }}>
                    {ultimo?.acwr ?? '—'}
                  </div>
                  <div style={{ fontSize:11, color:acwrSt.c, fontWeight:600 }}>{acwrSt.txt}</div>
                </div>
                <div style={{ textAlign:'right', fontSize:10, color:T.t3, fontFamily:T.mono, lineHeight:1.7 }}>
                  <div>&lt;0.8 destreino</div><div style={{color:T.mint}}>0.8–1.3 ótimo</div>
                  <div style={{color:T.amber}}>1.3–1.5 atenção</div><div style={{color:T.red}}>&gt;1.5 risco</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={88}>
                <LineChart data={serie.filter(d=>d.acwr!=null).slice(-28)} margin={{top:10,right:4,bottom:0,left:-26}}>
                  <ReferenceArea y1={.8} y2={1.3} fill={T.mint} fillOpacity={.07}/>
                  <ReferenceLine y={1.5} stroke={T.red} strokeDasharray="3 3"/>
                  <XAxis dataKey="data" tickFormatter={d=>d.slice(8)} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[.4,2]} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false} width={28}/>
                  <Tooltip content={<Tip/>}/>
                  <Line type="monotone" dataKey="acwr" name="ACWR" stroke={T.amber} strokeWidth={2} dot={{r:2}}/>
                </LineChart>
              </ResponsiveContainer>
              {ultimo?.acwr>1.5 && (
                <div style={{ background:T.red+'14', border:`1px solid ${T.red}44`, borderRadius:8, padding:'9px 11px', fontSize:11, color:T.coral, marginTop:8, lineHeight:1.5 }}>
                  Carga aguda muito acima da base crônica. Reduza volume nos próximos dias.
                </div>
              )}
            </Card>

            {/* Monotonia & Strain — Foster 1998, sinal complementar ao ACWR */}
            {monoStrain && (() => {
              const ms = monotoniaStatus(monoStrain.monotonia);
              return (
                <Card style={{ marginBottom:12 }}>
                  <Eyebrow>Monotonia & Strain <span style={{color:T.t3, fontWeight:400}}>· Foster 1998</span></Eyebrow>
                  <div style={{ fontSize:10, color:T.t3, margin:'2px 0 10px' }}>
                    Complementa o ACWR: mede se a carga varia dia a dia ou fica sempre igual — carga monótona
                    é fator de risco mesmo com volume moderado.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:26, fontWeight:800, fontFamily:T.mono, color:ms.c, lineHeight:1.1 }}>
                        {monoStrain.monotonia}
                      </div>
                      <div style={{ fontSize:10, color:ms.c, fontWeight:600 }}>{ms.txt}</div>
                      <div style={{ fontSize:9, color:T.t3, fontFamily:T.mono, marginTop:2 }}>monotonia (7d)</div>
                    </div>
                    <div>
                      <div style={{ fontSize:26, fontWeight:800, fontFamily:T.mono, color:T.t1, lineHeight:1.1 }}>
                        {monoStrain.strain}
                      </div>
                      <div style={{ fontSize:10, color:T.t3, fontFamily:T.mono }}>
                        strain = carga total × monotonia
                      </div>
                    </div>
                  </div>
                  {monoStrain.monotonia >= 2.0 && (
                    <div style={{ background:T.red+'14', border:`1px solid ${T.red}44`, borderRadius:8,
                                  padding:'9px 11px', fontSize:11, color:T.coral, marginTop:10, lineHeight:1.5 }}>
                      Carga muito repetitiva nos últimos 7 dias. Mesmo sem ACWR alto, isso é fator de risco
                      isolado — intercale dias claramente mais leves e mais fortes.
                    </div>
                  )}
                </Card>
              );
            })()}

            <Card>
              <Eyebrow>Carga por modalidade · 14 dias</Eyebrow>
              <ResponsiveContainer width="100%" height={125}>
                <BarChart data={serie.slice(-14)} margin={{top:10,right:4,bottom:0,left:-26}}>
                  <XAxis dataKey="data" tickFormatter={d=>d.slice(8)} tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:T.t3,fontFamily:T.mono}} axisLine={false} tickLine={false} width={32}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="cargaCorrida" name="Corrida" stackId="a" fill={T.cyan} maxBarSize={19}/>
                  <Bar dataKey="cargaMuscu" name="Musculação" stackId="a" fill={T.violet} radius={[3,3,0,0]} maxBarSize={19}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:13, fontSize:10, color:T.t3, fontFamily:T.mono }}>
                <span><span style={{color:T.cyan}}>■</span> Corrida</span><span><span style={{color:T.violet}}>■</span> Musculação</span>
              </div>
            </Card>
          </>
        )}

        {/* ═══ TREINOS ═══ */}
        {aba==='treinos' && (
          <>
            <Card style={{ marginBottom:12, background:T.panel }}>
              <Eyebrow c={T.cyan}>Como sincronizar</Eyebrow>
              <div style={{ fontSize:12, color:T.t2, marginTop:6, lineHeight:1.6 }}>
                Peça no chat: <b style={{color:T.t1}}>"sincronize meu último treino do Strava"</b>.
                O Claude extrai FC, altitude, terreno e horário, calcula o sRPE e devolve o JSON — cole pelo botão Importar.
              </div>
            </Card>
            {treinos.map(tr => {
              const c = calcSRPE(tr);
              const plano = sessaoDoDia(tr.data);
              const val = plano ? validar(plano, tr) : null;
              const jaAplicado = diario[tr.data]?.cargaCorrida === c?.srpe;
              return (
                <Card key={tr.id} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:10, color:T.t3, fontFamily:T.mono }}>
                        {DIAS[new Date(tr.data+'T12:00:00').getDay()]} · {tr.data.split('-').reverse().slice(0,2).join('/')} · {tr.hora}h
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, marginTop:2 }}>{tr.distKm} km · {Math.round(tr.duracaoMin)} min</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:25, fontWeight:800, fontFamily:T.mono, color:cargaCor(c?.srpe), lineHeight:1 }}>{c?.srpe ?? '—'}</div>
                      <div style={{ fontSize:9, color:T.t3, fontFamily:T.mono }}>sRPE · {cargaCat(c?.srpe)}</div>
                    </div>
                  </div>
                  <ZoneBar z={tr.zonas}/>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'3px 10px', margin:'6px 0 10px' }}>
                    {ZONES.map(z => tr.zonas?.[z.k]>0 && (
                      <span key={z.k} style={{ fontSize:9, color:T.t3, fontFamily:T.mono }}>
                        <span style={{ color:z.c }}>■</span> {z.k} {tr.zonas[z.k]}%
                      </span>
                    ))}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:10 }}>
                    {[
                      { l:'FC méd', v:tr.fcMedia, c:zoneColor(zoneOf(tr.fcMedia)) },
                      { l:'FC máx', v:tr.fcMax, c:zoneColor(zoneOf(tr.fcMax)) },
                      { l:'Pace', v:`${Math.floor(tr.paceSeg/60)}:${String(tr.paceSeg%60).padStart(2,'0')}`, c:T.t1 },
                      { l:'Elev', v:`+${Math.round(tr.elevM)}`, c:T.t1 },
                    ].map(m => (
                      <div key={m.l} style={{ background:T.lift, borderRadius:7, padding:'6px 8px' }}>
                        <div style={{ fontSize:8, color:T.t3, fontFamily:T.mono }}>{m.l}</div>
                        <div style={{ fontSize:13, fontWeight:700, fontFamily:T.mono, color:m.c }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  {c && (
                    <div style={{ background:T.lift, borderRadius:8, padding:'8px 10px', marginBottom:10 }}>
                      <div style={{ fontSize:9, color:T.t3, fontFamily:T.mono, marginBottom:4 }}>RPE = BASE + MODIFICADORES</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', fontSize:11, fontFamily:T.mono }}>
                        <span>{c.base}</span>
                        {c.modAlt!==0 && <span style={{color:T.amber}}>+{c.modAlt} alt</span>}
                        {c.modCalor!==0 && <span style={{color:T.coral}}>{c.modCalor>0?'+':''}{c.modCalor} calor</span>}
                        {c.modTerreno!==0 && <span style={{color:T.amber}}>+{c.modTerreno} terreno</span>}
                        <span style={{color:T.t3}}>=</span><b style={{color:T.cyan}}>{c.rpeTotal}</b>
                        <span style={{color:T.t3}}>× {Math.round(tr.duracaoMin)}min =</span>
                        <b style={{color:cargaCor(c.srpe)}}>{c.srpe}</b>
                      </div>
                    </div>
                  )}
                  {val && plano && (
                    <div style={{ background:T.lift, borderRadius:8, padding:'9px 11px', marginBottom:10 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <span style={{ fontSize:16 }}>{val.i}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:val.c }}>{val.t} · {val.total}% do planejado</div>
                          <div style={{ fontSize:9, color:T.t3, fontFamily:T.mono }}>
                            intensidade {val.scoreFC}% · volume {val.scoreVol}%
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize:10, color:T.t2, marginTop:7, paddingTop:7, borderTop:`1px solid ${T.brd}` }}>
                        <span style={{ color:T.t3 }}>Plano {plano.meso.k} S{plano.nSem}: </span>
                        <span style={{ color:plano.lib.cor }}>{plano.titulo}</span>
                        {plano.detalhe!==plano.titulo && ` — ${plano.detalhe}`}
                        <span style={{ color:T.t3, fontFamily:T.mono }}> · FC {plano.fc[0]}–{plano.fc[1]} · ~{plano.min}min</span>
                      </div>
                      {val.causa && (
                        <div style={{ fontSize:11, color:val.c, marginTop:7, paddingTop:7,
                                      borderTop:`1px solid ${T.brd}`, lineHeight:1.55 }}>
                          <span style={{ fontFamily:T.mono, fontWeight:700 }}>Por quê: </span>{val.causa}
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={()=>aplicarSRPE(tr)} disabled={jaAplicado}
                    style={{ width:'100%', background:jaAplicado?T.lift:T.cyan, color:jaAplicado?T.t3:T.bg,
                             border:'none', borderRadius:8, padding:'9px', fontSize:12, fontWeight:700,
                             cursor:jaAplicado?'default':'pointer' }}>
                    {jaAplicado?'sRPE já gravado no diário':'Gravar sRPE no diário'}
                  </button>
                </Card>
              );
            })}
          </>
        )}

        {/* ═══ PROMPT STRAVA ═══ */}
        {aba==='sync' && (() => {
          const PROMPT = `Sincronize meus treinos de corrida mais recentes do Strava que ainda não estejam no meu Monitor Atleta e devolva SOMENTE um bloco JSON (sem texto antes/depois) no schema abaixo, pronto pra eu colar no botão Importar do app.

Pra cada atividade de corrida (Run) nova:
1. Use list_activities pra achar as atividades recentes.
2. Use get_activity_streams com streams=["heart_rate","velocity_smooth","grade_smooth","altitude","cadence","distance"] e resolution=60.
3. Calcule: FC média e máxima, pace médio (segundos/km), altitude média, grade média absoluta, distribuição de zonas em % usando estas faixas de FC: Z1 ≤138, Z2 139–152, LT1 153–162, CINZA 163–167, LT2 168–174, VO2 ≥175.
4. Calcule o sRPE pelo método: RPE base pela FC média (tabela Foster) + modificador de altitude (+1,2 por 1000m acima de 500m) + modificador de calor pelo horário (13–17h: +0,4 · 17–20h: +0,2 · antes das 9h: −0,1) + modificador de terreno (grade média >5%: +0,6 · >3%: +0,3). RPE total × duração em minutos = sRPE.
5. Preencha também a entrada correspondente em "entries" com o campo cargaCorrida = sRPE calculado.

Formato exato de saída:
{
  "entries": {
    "YYYY-MM-DD": { "cargaCorrida": <sRPE> }
  },
  "treinos": [
    {
      "id": "<activity id do Strava>",
      "data": "YYYY-MM-DD",
      "hora": <hora local, inteiro 0-23>,
      "distKm": <número>,
      "duracaoMin": <número>,
      "elevM": <número>,
      "fcMedia": <número>,
      "fcMax": <número>,
      "paceSeg": <segundos por km>,
      "altitudeM": <número>,
      "gradeMedio": <número>,
      "cadencia": <passos/min total>,
      "re": <relative_effort do Strava>,
      "zonas": { "Z1":n, "Z2":n, "LT1":n, "CINZA":n, "LT2":n, "VO2":n }
    }
  ]
}

Se alguma atividade não tiver stream de FC, pule ela e me avise fora do JSON (numa linha separada, não dentro do bloco).`;

          return (
            <>
              <Card style={{ marginBottom:12, background:T.panel }}>
                <Eyebrow c={T.cyan}>Como funciona</Eyebrow>
                <div style={{ fontSize:12, color:T.t2, marginTop:6, lineHeight:1.6 }}>
                  Copie o prompt abaixo e cole numa mensagem pra mim no chat. Eu extraio os treinos do teu Strava,
                  calculo o sRPE e as zonas com a mesma fórmula do app, e devolvo um bloco JSON pronto.
                  Copie a resposta e cole no botão <b style={{color:T.t1}}>Importar</b> aqui em cima.
                </div>
              </Card>
              <Card>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <Eyebrow>Prompt pronto pra copiar</Eyebrow>
                  <button onClick={async () => {
                      try { await navigator.clipboard.writeText(PROMPT); flash('Prompt copiado'); }
                      catch { flash('Selecione e copie manualmente o texto abaixo'); }
                    }}
                    style={{ background:T.cyan, border:'none', borderRadius:6, padding:'5px 11px',
                             fontSize:10, fontWeight:700, color:T.bg, cursor:'pointer' }}>
                    Copiar
                  </button>
                </div>
                <textarea readOnly value={PROMPT} rows={16}
                  style={{ width:'100%', background:T.panel, border:`1px solid ${T.brd2}`, borderRadius:7,
                           padding:'10px', color:T.t2, fontSize:10.5, fontFamily:T.mono, lineHeight:1.6,
                           resize:'vertical', outline:'none' }} />
              </Card>
            </>
          );
        })()}

        {/* ═══ PLANO (calendário do macrociclo) ═══ */}
        {aba==='plano' && (() => {
          const { a,m } = mesRef;
          const primeiro = new Date(a,m,1), offset = primeiro.getDay();
          const nDias = new Date(a,m+1,0).getDate();
          const cells = [...Array(offset).fill(null), ...Array.from({length:nDias},(_,i)=>i+1)];
          const nome = primeiro.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
          const mv = d => { const nm=m+d; setMesRef({ a:a+Math.floor(nm/12), m:((nm%12)+12)%12 }); };
          const sSel = sessaoDoDia(dataSel);
          const sSelForca = forcaDoDiaAdaptada(dataSel);
          return (
            <>
              <Card style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:13 }}>
                  <button onClick={()=>mv(-1)} style={{ background:T.lift, border:`1px solid ${T.brd2}`, borderRadius:6, color:T.t2, width:29, height:29, cursor:'pointer' }}>‹</button>
                  <div style={{ fontSize:13, fontWeight:700, textTransform:'capitalize' }}>{nome}</div>
                  <button onClick={()=>mv(1)} style={{ background:T.lift, border:`1px solid ${T.brd2}`, borderRadius:6, color:T.t2, width:29, height:29, cursor:'pointer' }}>›</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:5 }}>
                  {DIAS.map(d => <div key={d} style={{ textAlign:'center', fontSize:9, color:T.t3, fontFamily:T.mono }}>{d[0]}</div>)}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
                  {cells.map((d,i) => {
                    if (!d) return <div key={i}/>;
                    const iso = `${a}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const reg = prontSerie.find(x=>x.data===iso);
                    const s = sessaoDoDia(iso);
                    const sf = sessaoForcaDoDia(new Date(iso+'T12:00:00').getDay());
                    const faseF = sf ? faseForca(iso) : null;
                    const opForca = faseF==='plena'?.85 : faseF==='reduzida'?.55 : faseF==='minima'?.3 : .12;
                    const isHoje = iso===hojeISO(), sel = iso===dataSel;
                    const pc = reg?.prontidao==null?null : reg.prontidao>=75?T.mint : reg.prontidao>=50?T.amber:T.red;
                    return (
                      <button key={i} onClick={()=>setDataSel(iso)} style={{
                        aspectRatio:'1', background: sel?T.lift:T.card,
                        border:`1px solid ${isHoje?T.cyan : sel?T.brd2:T.brd}`, borderRadius:6,
                        cursor:'pointer', padding:2, display:'flex', flexDirection:'column',
                        alignItems:'center', justifyContent:'center', gap:1, position:'relative' }}>
                        {s && <div style={{ position:'absolute', top:2, left:2, right:2, height:2.5,
                                            borderRadius:2, background:s.lib.cor,
                                            opacity: s.tipo==='Chave'||s.tipo==='Teste'?1:.4 }}/>}
                        {sf && <div style={{ position:'absolute', top: s?5.5:2, left:2, right:2, height:2,
                                            borderRadius:2, background:sf.cor, opacity:opForca }}/>}
                        <span style={{ fontSize:11, fontFamily:T.mono, color:isHoje?T.cyan:T.t2, fontWeight:isHoje?700:500, marginTop:3 }}>{d}</span>
                        {pc && <span style={{ width:4.5, height:4.5, borderRadius:'50%', background:pc }}/>}
                        {reg?.carga>0 && <span style={{ fontSize:7, fontFamily:T.mono, color:cargaCor(reg.carga) }}>{reg.carga}</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:'flex', gap:11, marginTop:12, fontSize:9, color:T.t3, fontFamily:T.mono, flexWrap:'wrap' }}>
                  <span>Barra sup. = corrida</span>
                  <span>Barra inf. = força/calistenia (opacidade = fase: plena→zero)</span>
                  <span><span style={{color:T.mint}}>●</span> pront ≥75</span>
                  <span><span style={{color:T.amber}}>●</span> 50–74</span>
                  <span><span style={{color:T.red}}>●</span> &lt;50</span>
                </div>
              </Card>

              {sSelForca && (
                <ForcaCard sessao={sSelForca} dowLabel={`${DIAS[new Date(dataSel+'T12:00:00').getDay()]} ${dataSel.split('-').reverse().slice(0,2).join('/')}`}
                  aberta={openForca} onToggle={()=>setOpenForca(!openForca)} />
              )}

              {sSel && (
                <Card style={{ marginBottom:12, borderLeft:`3px solid ${sSel.lib.cor}` }}>
                  <Eyebrow c={sSel.lib.cor}>
                    {DIAS[sSel.dow]} {dataSel.split('-').reverse().slice(0,2).join('/')} · {sSel.meso.emoji} {sSel.meso.k} S{sSel.nSem} · {sSel.semana.fase}
                  </Eyebrow>
                  <div style={{ fontSize:16, fontWeight:800, margin:'5px 0 3px' }}>{sSel.titulo}</div>
                  <div style={{ fontSize:13, color:sSel.lib.cor, fontWeight:700, fontFamily:T.mono, marginBottom:9 }}>{sSel.detalhe}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {[['FC',`${sSel.fc[0]}–${sSel.fc[1]}`],['Pace',sSel.pace],['Dur',`~${sSel.min}min`],['Vol sem',`${sSel.semana.vol}km`]].map(([l,v]) => (
                      <div key={l} style={{ background:T.lift, borderRadius:6, padding:'5px 9px' }}>
                        <div style={{ fontSize:8, color:T.t3, fontFamily:T.mono }}>{l}</div>
                        <div style={{ fontSize:12, fontWeight:700, fontFamily:T.mono }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:T.t2, marginTop:9, fontStyle:'italic' }}>⚠ {sSel.semana.alerta}</div>
                </Card>
              )}

              <Card>
                <Eyebrow>Mesociclos</Eyebrow>
                <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:7 }}>
                  {MACRO.map(ms => {
                    const ativo = posHoje?.meso.k === ms.k;
                    return (
                      <div key={ms.k} style={{ background:ativo?T.lift:'transparent',
                        border:`1px solid ${ativo?ms.cor+'55':T.brd}`, borderRadius:8, padding:'9px 11px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontSize:12, fontWeight:700 }}>
                            {ms.emoji} {ms.k} · {ms.nome}
                            {ativo && <span style={{ fontSize:9, color:T.cyan, marginLeft:6, fontFamily:T.mono }}>ATUAL</span>}
                          </div>
                          <div style={{ fontSize:10, color:T.t3, fontFamily:T.mono }}>{ms.sem.length} sem · {ms.meta}</div>
                        </div>
                        <div style={{ fontSize:10, color:T.t3, fontFamily:T.mono, marginTop:2 }}>{ms.periodo}</div>
                        {ativo && (
                          <>
                            <div style={{ fontSize:11, color:T.t2, marginTop:6, lineHeight:1.5 }}>{ms.foco}</div>
                            <div style={{ display:'flex', gap:2, marginTop:8 }}>
                              {ms.sem.map(w => (
                                <div key={w.s} title={`S${w.s} ${w.fase}`} style={{ flex:1, height:5, borderRadius:2,
                                  background: w.s < posHoje.nSem ? ms.cor
                                            : w.s === posHoje.nSem ? T.cyan
                                            : w.fase==='Deload' ? T.brd2 : T.brd }}/>
                              ))}
                            </div>
                            <div style={{ fontSize:10, color:T.t3, marginTop:5, fontFamily:T.mono }}>
                              Musculação: {ms.musc}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          );
        })()}
      </main>

      {toast && (
        <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
                      background:T.lift, border:`1px solid ${T.cyan}55`, borderRadius:9, padding:'10px 18px',
                      fontSize:12, fontWeight:600, boxShadow:'0 8px 28px rgba(0,0,0,.5)', zIndex:60 }}>{toast}</div>
      )}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        button:focus-visible,input:focus-visible,label:focus-visible{outline:2px solid ${T.cyan};outline-offset:2px}
        input[type=number]::-webkit-inner-spin-button{opacity:.25}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.brd2};border-radius:2px}
        @media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
      `}</style>
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
