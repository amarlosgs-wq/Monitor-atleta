# Changelog

Todas as mudanças relevantes do Monitor Atleta ficam registradas aqui.

## [1.6.1] — Rede de segurança contra tela preta
### Adicionado
- Error Boundary no React: se qualquer componente quebrar durante o render, mostra a mensagem de erro na tela (com botão de recarregar) em vez de deixar tudo preto sem explicação
- Handler global de erro (`window.onerror`) que cobre falhas antes mesmo do React montar (ex.: CDN não carregou)
### Nota
- Não foi possível reproduzir o bug relatado (tela preta) por análise estática — sintaxe validada, sem erros de parse. Com a rede de segurança em produção, o próximo crash (se houver) vai aparecer com a mensagem exata na tela.

## [1.6.0] — Terça só LT2, quinta com força + Chave 2, e trilha de skills
### Mudado
- Musculação 2 (Full Body moderado) saiu de terça e foi pra quinta, antes da Chave 2 (LT1) com intervalo de 15–20min — terça fica 100% livre de força pra Chave 1 (LT2) rodar com o SNC fresco
- Zonas de FC e paces das sessões-chave permanecem exatamente os mesmos (LT2 168–174, LT1 153–162) — nenhuma mudança na estrutura de corrida
### Adicionado
- Alerta de validação de HRV no card do dia às quintas: compara o HRV da manhã com a baseline (−5%) e recomenda reduzir RPE da força / cortar a Chave 2 pra Z2 se vier baixo
- Nova aba **Skills**: trilha de progressão de calistenia de longo prazo (Crow Pose → Dips+Archer → Planche Lean → Tuck → Straddle → Full), com roadmap visual, registro de hold/reps/ângulo por etapa, leitura de tendência e guia de execução
- Persistência própria da trilha de skills (independente do diário/treinos)

## [1.5.0] — Peso corporal, resumo calórico semanal e lançamento manual
### Adicionado
- Registro de peso corporal no Diário (balança, em jejum)
- Card "Peso corporal" na aba Baselines: gráfico com média móvel de 7 dias + leitura de ritmo semanal vs meta de perda (−0,5 a −0,7%/semana)
- Card "Resumo calórico da semana" na aba Carga: alvo calórico, demanda e jejum planejados por dia + déficit acumulado da semana e projeção de perda de gordura
- Lançamento manual de treino na aba Treinos (data, distância, duração, FC, elevação, altitude) — pra dias sem sync do Strava
- Botão de remover treinos lançados manualmente
### Mudado
- O motor de calorias/jejum agora usa o peso real (média móvel de 7 dias da balança) em vez de um valor fixo — BMR, gasto de treino, proteína e carboidrato recalculam sozinhos a cada novo registro
- Card "Alerta calórico" mostra a origem do peso usado (balança ou padrão)

## [1.4.0] — Alerta calórico & jejum periodizado
### Adicionado
- Card "Alerta calórico" na aba Hoje: mantença (Mifflin-St Jeor), gasto de treino (real quando já registrado, estimado quando planejado), alvo calórico, proteína e carboidrato do dia
- Classificação de demanda do dia (alta/média/baixa) por sessão de corrida + força, define o corte calórico e a janela de jejum
- Recomendação de jejum intermitente 16–18h (dias leves), 12–14h (demanda moderada) ou sem jejum + refeição em torno do treino (chave, longão, perna pesada)
- Override de segurança: prontidão <45 cancela o jejum do dia, independente do treino planejado
### Mudado
- Sábado: longão + Musculação 3 (Superiores Completo) — Domingo: só perna pesada (Musculação 1) + cross opcional (já refletido no motor de sessões e no card de calorias)

## [1.3.0] — Redesign "pista noturna" + coach analítico
### Adicionado
- Nova identidade visual (Bebas Neue/Inter/JetBrains Mono, coral, zona cinza em framboesa como armadilha)
- Leitura do coach sob cada gráfico (tendência por regressão linear vs. banda ±1 SD)
- Diagnóstico integrado na aba Hoje, priorizado por severidade + síntese do dia
- Diário com sliders para métricas subjetivas (sono e percepção 1–5)
- Eficiência aeróbica (EF = m/min ÷ FC) nas rodagens, com leitura de tendência
- Padrão individual sono × HRV (rMSSD pós noites curtas vs. cheias)
- Card "Rota para o sub-20" (limiar atual → limiar alvo → pace de prova, modelo de Daniels)
- Contagem regressiva pro próximo teste 5k + protocolo de afiação quando faltam ≤10 dias
- Protocolos do dia com evidência (cafeína, nitrato, creatina, proteína, carbo intra) contextuais à sessão
### Mudado
- Treinos ordenados do mais recente pro mais antigo
- Persistência dupla: localStorage (GitHub Pages) + storage do artifact (Claude)
- App consolidado num index.html único (React UMD + Babel Standalone — sem build)
- Service worker v2 (cache renomeado pra forçar atualização) e ícones no shell offline
### Corrigido
- Deploy: o arquivo .jsx com imports npm não roda no GitHub Pages; o build HTML resolve

## [1.2.0] — Periodização, Foster e débito de sono
### Adicionado
- Periodização da força/calistenia atrelada ao mesociclo (plena → reduzida → mínima → zero na semana da prova)
- Monotonia & Strain (Foster, 1998) — sinal complementar ao ACWR
- Débito de sono acumulado (janela de 7 dias, base Van Dongen et al. 2003)
- Sequência recomendada nos dias combinados de força + corrida (quinta e domingo)

## [1.1.0] — Força & Calistenia
### Adicionado
- 6 sessões semanais fixas de força/calistenia (Full Body A/B, Pernas+Pliometria, Calistenia isométrica, Superior e Inferior Completo)
- Card "Força & Calistenia" na aba Hoje e na aba Plano
- Barra de calendário dupla (corrida + força)

## [1.0.0] — Base
### Adicionado
- Escore de prontidão (HRV, FC repouso, sono, percepção subjetiva) com baseline móvel de 28 dias
- Performance Management Chart (ATL/CTL/TSB) — modelo de Banister
- ACWR com zona ótima e alerta de risco
- Validador plano × executado com diagnóstico causal
- Sincronização de treinos via Strava (extração manual assistida por prompt)
- Aba Baselines com bandas de ±1 desvio-padrão por métrica
- Macrociclo completo (M1–M5) com progressão semana a semana
- Aderência semanal (semáforo de chaves e fáceis cumpridos)
