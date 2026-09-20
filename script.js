(function(){
  "use strict";

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

  var $ = function(id){ return document.getElementById(id); };
  var atual = 0;

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
      var d = caminho(40 + i*27, i*1.9 + .6);

      var hit = document.createElementNS(NS, "path");
      hit.setAttribute("d", d); hit.setAttribute("class", "hit");
      var vis = document.createElementNS(NS, "path");
      vis.setAttribute("d", d); vis.setAttribute("class", "vis");
      vis.setAttribute("pathLength", "1");
      vis.style.strokeWidth = (5 + (i % 3)) + "px";

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

  function legenda(i){
    $("ringCaption").innerHTML = "<strong>Anel " + (i+1) + ": " + AREAS[i].nome + ".</strong> " + AREAS[i].frase;
  }

  /* ---------- abas ---------- */
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
    if (rolar){
      var alvo = $("areas");
      var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      alvo.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
    }
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
  }

  function resultado(){
    var soma = AREAS.map(function(){ return 0; });
    var faltam = 0;
    PERGUNTAS.forEach(function(q, i){
      var sel = document.querySelector("input[name='q" + i + "']:checked");
      if (!sel){ faltam++; return; }
      soma[q[0]] += parseInt(sel.value, 10);
    });
    var msg = $("quizMsg");
    if (faltam){
      msg.textContent = faltam === 1 ? "Falta responder 1 afirmação." : "Faltam " + faltam + " afirmações para responder.";
      return;
    }
    msg.textContent = "";

    var pct = soma.map(function(s){ return Math.round((s - 2) / 6 * 100); });
    var barras = "";
    pct.forEach(function(p, i){
      barras += "<div class='bar-row" + (p < 50 ? " low" : "") + "'><span>" + AREAS[i].nome + "</span>" +
                "<div class='bar'><i data-w='" + p + "'></i></div><b>" + p + "%</b></div>";
    });
    $("barras").innerHTML = barras;
    $("resultado").hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        Array.prototype.forEach.call(document.querySelectorAll(".bar i"), function(el){
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
    $("resultado").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  /* ---------- plano de 30 dias ---------- */
  var CHAVE = "aneis-plano-v1";
  var estado = { habito:"", dias:[] };

  function carregar(){
    try {
      var bruto = localStorage.getItem(CHAVE);
      if (bruto){
        var e = JSON.parse(bruto);
        if (e && typeof e.habito === "string" && Array.isArray(e.dias) && e.dias.length === 30) estado = e;
      }
    } catch (err) {}
  }
  function salvar(){
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (err) {}
  }

  function desenharPlano(){
    var ativo = !!estado.habito;
    $("planoNovo").hidden = ativo;
    $("planoAtivo").hidden = !ativo;
    if (!ativo) return;
    $("habitoTitulo").textContent = estado.habito;
    var box = $("days");
    box.innerHTML = "";
    estado.dias.forEach(function(feito, i){
      var b = document.createElement("button");
      b.type = "button"; b.className = "day";
      b.textContent = i + 1;
      b.setAttribute("aria-pressed", feito ? "true" : "false");
      b.setAttribute("aria-label", "Dia " + (i+1));
      b.addEventListener("click", function(){
        estado.dias[i] = !estado.dias[i];
        b.setAttribute("aria-pressed", estado.dias[i] ? "true" : "false");
        salvar(); contar();
      });
      box.appendChild(b);
    });
    contar();
  }

  function contar(){
    var n = estado.dias.filter(Boolean).length;
    var t = n + " de 30 dias cumpridos.";
    if (n === 30) t += " Você fechou o ciclo. Isso já é caráter, não só vontade.";
    else if (n >= 7) t += " Continue: a repetição é o que forma o hábito.";
    $("contagem").textContent = t;
  }

  function iniciar(){
    var v = $("habito").value.trim();
    if (!v){ $("habito").focus(); return; }
    estado = { habito: v, dias: new Array(30).fill(false) };
    salvar(); desenharPlano();
  }

  function montarPlano(){
    ["Acordar sempre no mesmo horário","Caminhar 30 minutos","Anotar todos os meus gastos","Ligar para um amigo toda semana","Ficar 1 hora sem celular à noite"].forEach(function(s){
      var c = document.createElement("button");
      c.type = "button"; c.className = "chip"; c.textContent = s;
      c.addEventListener("click", function(){ $("habito").value = s; $("habito").focus(); });
      $("chips").appendChild(c);
    });
    $("btnIniciar").addEventListener("click", iniciar);
    $("habito").addEventListener("keydown", function(e){ if (e.key === "Enter") iniciar(); });
    $("btnRecomecar").addEventListener("click", function(){
      if (!window.confirm("Apagar o progresso atual e escolher outro hábito?")) return;
      estado = { habito:"", dias:[] };
      $("habito").value = "";
      salvar(); desenharPlano();
    });
  }

  /* ---------- início ---------- */
  desenharAneis();
  montarAbas();
  escolher(0, false);
  $("ringCaption").textContent = "Como numa árvore, cada anel se apoia no anterior. Toque em um para ler sobre a área.";
  montarTeste();
  $("btnResultado").addEventListener("click", resultado);
  carregar();
  montarPlano();
  desenharPlano();
})();