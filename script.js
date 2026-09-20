(function(){
  "use strict";

  /* ---------- utilidades ---------- */
  var $ = function(id){ return document.getElementById(id); };
  var reduzir = function(){ return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function ler(chave){
    try { var b = localStorage.getItem(chave); return b ? JSON.parse(b) : null; } catch (e) { return null; }
  }
  function guardar(chave, valor){
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {}
  }
  function apagar(chave){
    try { localStorage.removeItem(chave); } catch (e) {}
  }
  function hojeISO(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function diasEntre(a, b){
    var x = a.split("-"), y = b.split("-");
    return Math.round((Date.UTC(+y[0], y[1] - 1, +y[2]) - Date.UTC(+x[0], x[1] - 1, +x[2])) / 86400000);
  }
  function fmtData(iso){ var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function rolarPara(el){
    el.scrollIntoView({ behavior: reduzir() ? "auto" : "smooth", block: "start" });
  }
  // Botão que pede um segundo clique para confirmar (funciona em qualquer navegador, sem janelas pop-up)
  function duploClique(btn, fn){
    var original = btn.textContent, timer = null, armado = false;
    btn.addEventListener("click", function(){
      if (!armado){
        armado = true;
        btn.textContent = "Clique de novo para confirmar";
        timer = setTimeout(function(){ armado = false; btn.textContent = original; }, 4000);
        return;
      }
      clearTimeout(timer); armado = false; btn.textContent = original; fn();
    });
  }
  function copiar(texto){
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(texto);
    return new Promise(function(ok, falha){
      var t = document.createElement("textarea");
      t.value = texto; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy") ? ok() : falha(); } catch (e) { falha(); }
      document.body.removeChild(t);
    });
  }

  /* ---------- tema claro/escuro ---------- */
  function iniciarTema(){
    var salvo = ler("aneis-tema");
    if (salvo === "light" || salvo === "dark") document.documentElement.setAttribute("data-theme", salvo);
    $("tema").addEventListener("click", function(){
      var atual = document.documentElement.getAttribute("data-theme");
      if (!atual) atual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var novo = atual === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", novo);
      guardar("aneis-tema", novo);
    });
  }

  /* ---------- dados ---------- */
  var AREAS = [
    { nome:"Responsabilidade",
      frase:"Maduro é quem responde pelo que fez e pelo que deixou de fazer.",
      pratica:["Cumpra o que prometeu, principalmente as promessas pequenas.","Ao errar, diga “errei” e diga o que vai fazer a respeito.","Hoje, termine uma tarefa que você vem adiando."],
      armadilha:"Culpar o chefe, a ex, a infância ou a crise. Entender a causa ajuda; usar a causa como desculpa te mantém parado." },
    { nome:"Emoções",
      frase:"Sentir raiva, medo e tristeza é normal. Descarregar nos outros não é.",
      pratica:["Dê nome ao que sente antes de reagir: “estou com raiva e com medo de falhar”.","Espere 20 minutos antes de responder uma mensagem que te irritou.","Converse com uma pessoa de confiança, não só consigo mesmo."],
      armadilha:"Achar que homem forte não sente. Emoção engolida não some: costuma voltar como irritação, bebida ou isolamento." },
    { nome:"Disciplina",
      frase:"Fazer o que precisa ser feito, mesmo sem vontade.",
      pratica:["Fixe o mínimo de sono, comida e movimento antes de qualquer meta grande.","Faça a tarefa mais importante do dia antes de abrir o celular.","Reduza o atrito: deixe roupa, agenda e material prontos na véspera."],
      armadilha:"Esperar motivação. Ela vai e volta. Quem tem constância tem um sistema simples, não mais força de vontade." },
    { nome:"Dinheiro",
      frase:"Autonomia financeira é liberdade para você e cuidado com quem depende de você.",
      pratica:["Anote todos os gastos durante 30 dias, sem julgamento.","Monte uma reserva de emergência, começando por um valor pequeno e fixo.","Fuja do rotativo do cartão e de dívida para consumo."],
      armadilha:"Gastar para parecer bem-sucedido. Carro, roupa e viagem impressionam pouco quem vê a fatura junto." },
    { nome:"Relações",
      frase:"Ouvir mais do que provar que tem razão. Ser presença, não plateia.",
      pratica:["Numa conversa difícil, ouça até o fim sem interromper.","Peça desculpas sem a palavra “mas”.","Marque algo com um amigo ainda esta semana."],
      armadilha:"Competir com todo mundo e só ter amizades de superfície. Muitos homens chegam aos 40 sem ter com quem falar de verdade." },
    { nome:"Propósito e saúde",
      frase:"Saber para onde vai e cuidar do corpo que leva você até lá.",
      pratica:["Escreva três valores seus e confira se a sua semana os reflete.","Faça check-up anual e não deixe sintoma esquisito para depois.","Considere terapia antes da crise, não só durante."],
      armadilha:"Adiar médico e autoconhecimento até virar problema grande. Cuidar cedo sai mais barato e dói menos." }
  ];

  var PERGUNTAS = [
    [0,"Quando erro, assumo sem procurar culpados."],
    [0,"Cumpro o que prometo, mesmo quando ninguém está cobrando."],
    [1,"Consigo dizer o que sinto sem virar agressividade ou silêncio."],
    [1,"Depois de uma discussão, volto para conversar em vez de fingir que nada aconteceu."],
    [2,"Tenho horários mínimos de sono, comida e movimento."],
    [2,"Faço o que é importante antes de me distrair."],
    [3,"Sei quanto ganho e quanto gasto por mês."],
    [3,"Tenho uma reserva para imprevistos ou um plano para montá-la."],
    [4,"Ouço até o fim sem interromper nem preparar a resposta."],
    [4,"Tenho pelo menos um amigo com quem falo de assuntos difíceis."],
    [5,"Sei dizer três valores que guiam minhas decisões."],
    [5,"Faço exames de rotina e busco ajuda quando preciso."]
  ];
  var ESCALA = ["Raramente","Às vezes","Quase sempre","Sempre"];

  var atual = 0;
  var mapa = null;          // resultado do teste: { pct:[...], data:"aaaa-mm-dd" }
  var CH_TESTE = "aneis-teste-v1";

  /* ---------- anéis ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var svg = $("rings");
  var aneis = [];

  function caminho(r, seed){
    var n = 90, d = "";
    for (var k = 0; k < n; k++){
      var a = k / n * Math.PI * 2;
      var w = Math.sin(a*2 + seed)*2.4 + Math.sin(a*3 + seed*1.7)*1.7 + Math.sin(a*5 + seed*2.3)*.9;
      var rr = r + w;
      var x = 200 + Math.cos(a)*rr, y = 200 + Math.sin(a)*rr*.98;
      d += (k ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d + "Z";
  }

  function desenharAneis(){
    var pith = document.createElementNS(NS, "circle");
    pith.setAttribute("cx", 200); pith.setAttribute("cy", 200); pith.setAttribute("r", 13);
    pith.setAttribute("class", "pith");
    svg.appendChild(pith);

    AREAS.forEach(function(area, i){
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "ring");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", "Anel " + (i+1) + ": " + area.nome);
      g.style.setProperty("--i", i);
      g.style.setProperty("--w", 5 + (i % 3));
      var d = caminho(40 + i*27, i*1.9 + .6);

      var hit = document.createElementNS(NS, "path");
      hit.setAttribute("d", d); hit.setAttribute("class", "hit");
      var vis = document.createElementNS(NS, "path");
      vis.setAttribute("d", d); vis.setAttribute("class", "vis");
      vis.setAttribute("pathLength", "1");

      g.appendChild(hit); g.appendChild(vis);
      g.addEventListener("click", function(){ escolher(i, true); });
      g.addEventListener("keydown", function(e){
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); escolher(i, true); }
      });
      g.addEventListener("mouseenter", function(){ legenda(i); });
      g.addEventListener("focus", function(){ legenda(i); });
      g.addEventListener("mouseleave", function(){ legenda(atual); });
      svg.appendChild(g);
      aneis.push(g);
    });
  }

  // Quanto maior a pontuação, mais grosso o anel
  function aplicarAneis(pct){
    aneis.forEach(function(g, k){
      var w = pct ? (4 + pct[k] / 100 * 9).toFixed(1) : (5 + (k % 3));
      g.style.setProperty("--w", w);
    });
  }

  function legenda(i){
    var t = "<strong>Anel " + (i+1) + ": " + AREAS[i].nome + ".</strong> " + AREAS[i].frase;
    if (mapa) t += " Sua pontuação: " + mapa.pct[i] + "%.";
    $("ringCaption").innerHTML = t;
  }
  function legendaInicial(){
    $("ringCaption").textContent = mapa
      ? "Seus anéis mostram o resultado do teste: quanto mais grosso, mais forte a área. Toque em um para ler sobre ela."
      : "Como numa árvore, cada anel se apoia no anterior. Toque em um para ler sobre a área.";
  }

  /* ---------- abas das áreas ---------- */
  function montarAbas(){
    var box = $("tabs");
    AREAS.forEach(function(area, i){
      var b = document.createElement("button");
      b.type = "button"; b.className = "tab"; b.setAttribute("role", "tab");
      b.id = "tab" + i; b.textContent = area.nome;
      b.setAttribute("aria-controls", "panel");
      b.addEventListener("click", function(){ escolher(i, false); });
      b.addEventListener("keydown", function(e){
        var k = e.key, n = AREAS.length, alvo = null;
        if (k === "ArrowDown" || k === "ArrowRight") alvo = (i + 1) % n;
        if (k === "ArrowUp" || k === "ArrowLeft") alvo = (i - 1 + n) % n;
        if (alvo !== null){ e.preventDefault(); escolher(alvo, false); $("tab" + alvo).focus(); }
      });
      box.appendChild(b);
    });
  }

  function escolher(i, rolar){
    atual = i;
    var a = AREAS[i];
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function(t, k){
      t.setAttribute("aria-selected", k === i ? "true" : "false");
      t.tabIndex = k === i ? 0 : -1;
    });
    aneis.forEach(function(g, k){ g.classList.toggle("on", k === i); });
    var lis = a.pratica.map(function(p){ return "<li>" + p + "</li>"; }).join("");
    $("panel").setAttribute("aria-labelledby", "tab" + i);
    $("panel").innerHTML =
      "<h3>" + a.nome + "</h3>" +
      "<p class='frase'>" + a.frase + "</p>" +
      "<h4>Na prática</h4><ul>" + lis + "</ul>" +
      "<div class='armadilha'><p><strong>Armadilha comum.</strong> " + a.armadilha + "</p></div>";
    legenda(i);
    if (rolar) rolarPara($("areas"));
  }

  /* ---------- teste ---------- */
  function montarTeste(){
    var html = "";
    PERGUNTAS.forEach(function(q, i){
      html += "<fieldset class='q'><legend>" + q[1] + "</legend><div class='scale'>";
      ESCALA.forEach(function(rot, v){
        html += "<label><input type='radio' name='q" + i + "' value='" + (v+1) + "'><span>" + rot + "</span></label>";
      });
      html += "</div></fieldset>";
    });
    $("quiz").innerHTML = html;
    $("quiz").addEventListener("change", progresso);
  }

  function progresso(){
    var n = 0;
    PERGUNTAS.forEach(function(q, i){
      if (document.querySelector("input[name='q" + i + "']:checked")) n++;
    });
    $("quizProg").textContent = n + " de " + PERGUNTAS.length + " respondidas";
    $("progBar").style.width = (n / PERGUNTAS.length * 100) + "%";
  }

  function calcular(){
    var soma = AREAS.map(function(){ return 0; }), faltam = 0;
    PERGUNTAS.forEach(function(q, i){
      var sel = document.querySelector("input[name='q" + i + "']:checked");
      if (!sel){ faltam++; return; }
      soma[q[0]] += parseInt(sel.value, 10);
    });
    if (faltam){
      $("quizMsg").textContent = faltam === 1 ? "Falta responder 1 afirmação." : "Faltam " + faltam + " afirmações para responder.";
      return null;
    }
    $("quizMsg").textContent = "";
    return soma.map(function(s){ return Math.round((s - 2) / 6 * 100); });
  }

  function mostrarResultado(m, rolar){
    mapa = m;
    var pct = m.pct, barras = "";
    pct.forEach(function(p, i){
      barras += "<div class='bar-row" + (p < 50 ? " low" : "") + "'><span>" + AREAS[i].nome + "</span>" +
                "<div class='bar'><i data-w='" + p + "'></i></div><b>" + p + "%</b></div>";
    });
    $("barras").innerHTML = barras;
    $("salvoEm").textContent = "Resultado de " + fmtData(m.data) + ", salvo neste aparelho. Os anéis no topo da página agora mostram o seu mapa: quanto mais grosso, mais forte a área.";
    $("resultado").hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        Array.prototype.forEach.call(document.querySelectorAll(".bar i[data-w]"), function(el){
          el.style.width = el.getAttribute("data-w") + "%";
        });
      });
    });

    var menor = 0, maior = 0;
    pct.forEach(function(p, i){ if (p < pct[menor]) menor = i; if (p > pct[maior]) maior = i; });
    var v;
    if (pct[maior] === pct[menor]){
      v = "<h3>Um perfil equilibrado</h3><p>Suas seis áreas estão no mesmo nível. Escolha a que mais importa para você agora e transforme uma prática dela em hábito no plano de 30 dias.</p>";
    } else {
      v = "<h3>Por onde começar: " + AREAS[menor].nome + "</h3>" +
          "<p>Seu ponto mais forte é <strong>" + AREAS[maior].nome + "</strong>. A área com mais espaço para crescer é <strong>" + AREAS[menor].nome + "</strong>. Uma primeira prática:</p>" +
          "<p><em>" + AREAS[menor].pratica[0] + "</em></p>" +
          "<p><button class='btn btn-line' type='button' id='verArea'>Ler sobre " + AREAS[menor].nome + "</button></p>";
    }
    $("veredito").innerHTML = v;
    var vb = $("verArea");
    if (vb) vb.addEventListener("click", function(){ escolher(menor, true); });

    aplicarAneis(pct);
    legendaInicial();
    if (rolar) rolarPara($("resultado"));
  }

  function iniciarTeste(){
    montarTeste();
    $("btnResultado").addEventListener("click", function(){
      var pct = calcular();
      if (!pct) return;
      var m = { pct: pct, data: hojeISO() };
      guardar(CH_TESTE, m);
      mostrarResultado(m, true);
    });

    $("btnCopiar").addEventListener("click", function(){
      if (!mapa) return;
      var texto = "Meu mapa de maturidade (Anéis): " +
        AREAS.map(function(a, i){ return a.nome + " " + mapa.pct[i] + "%"; }).join(", ") + ".";
      copiar(texto).then(function(){
        $("copiaMsg").textContent = "Copiado.";
      }, function(){
        $("copiaMsg").textContent = "Não foi possível copiar sozinho. Copie daqui: " + texto;
      });
    });

    duploClique($("btnRefazer"), function(){
      Array.prototype.forEach.call(document.querySelectorAll("#quiz input"), function(r){ r.checked = false; });
      apagar(CH_TESTE);
      mapa = null;
      $("resultado").hidden = true;
      $("copiaMsg").textContent = "";
      aplicarAneis(null);
      legendaInicial();
      progresso();
      rolarPara($("teste"));
    });

    var salvo = ler(CH_TESTE);
    if (salvo && Array.isArray(salvo.pct) && salvo.pct.length === AREAS.length &&
        salvo.pct.every(function(n){ return typeof n === "number"; }) && typeof salvo.data === "string"){
      mostrarResultado(salvo, false);
    }
  }

  /* ---------- pausa de um minuto (respiração) ---------- */
  var timers = [], respirando = false;
  function agenda(fn, ms){ timers.push(setTimeout(fn, ms)); }

  function fase(nome, seg, escala){
    var orb = $("orb");
    orb.style.transitionDuration = reduzir() ? "0s" : seg + "s";
    orb.style.transform = "scale(" + escala + ")";
    $("breathLabel").textContent = nome;
  }

  function pararRespiracao(interrompido){
    timers.forEach(clearTimeout); timers = []; respirando = false;
    $("btnRespirar").textContent = "Começar de novo";
    $("orb").style.transitionDuration = reduzir() ? "0s" : ".6s";
    $("orb").style.transform = "scale(.5)";
    $("breathLabel").textContent = interrompido ? "Pausa interrompida" : "Muito bem. Agora responda com calma.";
  }

  function alternarRespiracao(){
    if (respirando){ pararRespiracao(true); return; }
    respirando = true;
    $("btnRespirar").textContent = "Parar";
    var rodadas = 0, TOTAL = 4;
    (function rodada(){
      if (rodadas >= TOTAL){ pararRespiracao(false); return; }
      rodadas++;
      fase("Inspire", 4, 1);
      agenda(function(){ fase("Segure", 4, 1); }, 4000);
      agenda(function(){ fase("Solte", 6, .5); }, 8000);
      agenda(rodada, 14000);
    })();
  }

  /* ---------- revisão da noite (diário) ---------- */
  var CH_DIARIO = "aneis-diario-v1";

  function historico(){
    var dados = ler(CH_DIARIO) || {};
    var box = $("historico");
    box.innerHTML = "";
    var chaves = Object.keys(dados).sort().reverse().slice(0, 7);
    if (!chaves.length) return;
    var h = document.createElement("h4");
    h.textContent = "Últimas entradas";
    box.appendChild(h);
    chaves.forEach(function(k){
      var det = document.createElement("details");
      det.className = "hist";
      var s = document.createElement("summary");
      s.textContent = fmtData(k);
      det.appendChild(s);
      [["Orgulho", dados[k].a], ["Faria diferente", dados[k].b], ["Amanhã", dados[k].c]].forEach(function(par){
        if (!par[1]) return;
        var p = document.createElement("p");
        var st = document.createElement("strong");
        st.textContent = par[0] + ": ";
        p.appendChild(st);
        p.appendChild(document.createTextNode(par[1]));
        det.appendChild(p);
      });
      var del = document.createElement("button");
      del.type = "button"; del.className = "link-btn"; del.textContent = "Apagar esta entrada";
      del.addEventListener("click", function(){
        var x = ler(CH_DIARIO) || {};
        delete x[k];
        guardar(CH_DIARIO, x);
        historico();
      });
      det.appendChild(del);
      box.appendChild(det);
    });
  }

  function iniciarDiario(){
    var dados = ler(CH_DIARIO) || {};
    var hoje = dados[hojeISO()];
    if (hoje){ $("d1").value = hoje.a || ""; $("d2").value = hoje.b || ""; $("d3").value = hoje.c || ""; }
    $("btnDiario").addEventListener("click", function(){
      var a = $("d1").value.trim(), b = $("d2").value.trim(), c = $("d3").value.trim();
      if (!a && !b && !c){ $("diarioMsg").textContent = "Escreva pelo menos uma resposta."; return; }
      var d = ler(CH_DIARIO) || {};
      d[hojeISO()] = { a: a, b: b, c: c };
      guardar(CH_DIARIO, d);
      $("diarioMsg").textContent = "Salvo neste aparelho.";
      historico();
    });
    historico();
  }

  /* ---------- plano de 30 dias ---------- */
  var CH_PLANO = "aneis-plano-v1";
  var estado = { habito:"", dias:[], inicio:"" };

  function carregarPlano(){
    var e = ler(CH_PLANO);
    if (e && typeof e.habito === "string" && Array.isArray(e.dias) && e.dias.length === 30){
      if (typeof e.inicio !== "string" || !e.inicio) e.inicio = hojeISO();
      estado = e;
    }
  }
  function salvarPlano(){ guardar(CH_PLANO, estado); }
  function diaHoje(){ return diasEntre(estado.inicio, hojeISO()) + 1; }

  function sequencia(){
    var i = Math.min(diaHoje(), 30) - 1;
    if (i >= 0 && !estado.dias[i]) i--;
    var n = 0;
    while (i >= 0 && estado.dias[i]){ n++; i--; }
    return n;
  }

  function pintarPlano(){
    var h = diaHoje();
    var n = estado.dias.filter(Boolean).length;
    var botoes = $("days").children;
    for (var i = 0; i < botoes.length; i++){
      botoes[i].setAttribute("aria-pressed", estado.dias[i] ? "true" : "false");
    }
    var t = n + " de 30 dias cumpridos.";
    var seq = sequencia();
    if (seq >= 2) t += " Sequência atual: " + seq + " dias.";
    if (n === 30) t += " Você fechou o ciclo. Isso já é caráter, não só vontade.";
    $("contagem").textContent = t;

    var bh = $("btnHoje");
    if (h >= 1 && h <= 30){
      bh.hidden = false;
      bh.textContent = estado.dias[h - 1] ? "Desmarcar hoje" : "Marcar hoje como cumprido";
      $("hojeInfo").textContent = "Hoje é o dia " + h + " de 30. Você também pode completar dias anteriores.";
    } else {
      bh.hidden = true;
      $("hojeInfo").textContent = "Os 30 dias terminaram. Escolha outro hábito para começar um novo ciclo.";
    }
  }

  function desenharPlano(){
    var ativo = !!estado.habito;
    $("planoNovo").hidden = ativo;
    $("planoAtivo").hidden = !ativo;
    if (!ativo) return;
    $("habitoTitulo").textContent = estado.habito;
    var box = $("days");
    box.innerHTML = "";
    var h = diaHoje();
    estado.dias.forEach(function(feito, i){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day" + (i + 1 === h ? " hoje" : "");
      b.textContent = i + 1;
      b.disabled = h >= 1 && i + 1 > h;
      b.setAttribute("aria-label", "Dia " + (i + 1) + (i + 1 === h ? ", hoje" : ""));
      b.addEventListener("click", function(){
        estado.dias[i] = !estado.dias[i];
        salvarPlano(); pintarPlano();
      });
      box.appendChild(b);
    });
    pintarPlano();
  }

  function iniciarPlano(){
    var v = $("habito").value.trim();
    if (!v){ $("habito").focus(); return; }
    estado = { habito: v, dias: new Array(30).fill(false), inicio: hojeISO() };
    salvarPlano(); desenharPlano();
  }

  function montarPlano(){
    ["Acordar sempre no mesmo horário","Caminhar 30 minutos","Anotar todos os meus gastos","Ligar para um amigo toda semana","Ficar 1 hora sem celular à noite"].forEach(function(s){
      var c = document.createElement("button");
      c.type = "button"; c.className = "chip"; c.textContent = s;
      c.addEventListener("click", function(){ $("habito").value = s; $("habito").focus(); });
      $("chips").appendChild(c);
    });
    $("btnIniciar").addEventListener("click", iniciarPlano);
    $("habito").addEventListener("keydown", function(e){ if (e.key === "Enter") iniciarPlano(); });
    $("btnHoje").addEventListener("click", function(){
      var h = diaHoje();
      if (h < 1 || h > 30) return;
      estado.dias[h - 1] = !estado.dias[h - 1];
      salvarPlano(); pintarPlano();
    });
    duploClique($("btnRecomecar"), function(){
      estado = { habito:"", dias:[], inicio:"" };
      $("habito").value = "";
      salvarPlano(); desenharPlano();
    });
  }

  /* ---------- menu: destaca a seção que está na tela ---------- */
  function iniciarMenu(){
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    Array.prototype.forEach.call(document.querySelectorAll(".top nav a"), function(a){
      links[a.getAttribute("href").slice(1)] = a;
    });
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function(k){ links[k].removeAttribute("aria-current"); });
        if (links[e.target.id]) links[e.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(links).forEach(function(id){ if ($(id)) obs.observe($(id)); });
  }

  /* ---------- início ---------- */
  iniciarTema();
  desenharAneis();
  montarAbas();
  escolher(0, false);
  iniciarTeste();
  legendaInicial();
  carregarPlano();
  montarPlano();
  desenharPlano();
  iniciarDiario();
  $("btnRespirar").addEventListener("click", alternarRespiracao);
  iniciarMenu();
})();