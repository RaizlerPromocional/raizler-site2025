/* ===========================
   Utilidades & Estado
=========================== */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const state = {
  categoria: null,
  tipo: null,
  produto: null,
};

/* ===========================
   Base de dados (exemplo)
=========================== */
const DB = {
  imans: {
    nome: "Ímãs Promocionais",
    tipos: {
      "Formato": ["Retangular", "Redondo", "Personalizado"],
      "Material": ["PVC Flex", "Vinil", "Papel Couché"],
    },
    produtos: ["Ímã 5x7 cm", "Ímã redondo 5 cm", "Ímã de geladeira full color"]
  },
  resinados: {
    nome: "Resinados",
    tipos: {
      "Formato": ["Etiqueta", "Chaveiro", "Adesivo"],
      "Aplicação": ["Indoor", "Outdoor"]
    },
    produtos: ["Etiqueta resinada 3x6 cm", "Chaveiro resinado", "Adesivo resinado premium"]
  },
  dtf: {
    nome: "DTF",
    tipos: {
      "Tecido": ["Algodão", "Poliéster", "Misto"],
      "Cores": ["Base branca", "Colorido"]
    },
    produtos: ["DTF por metro", "Aplique DTF personalizado", "Cartela DTF promocional"]
  },
  adesivos: {
    nome: "Adesivos",
    tipos: {
      "Material": ["Vinil", "BOPP", "Transparente"],
      "Corte": ["Reto", "Especial (kiss-cut)"]
    },
    produtos: ["Adesivo vinil 5x5 cm", "Cartela de adesivos", "Etiqueta BOPP rolo"]
  },
  impressos: {
    nome: "Impressos e Papelaria",
    tipos: {
      "Item": ["Cartão de visita", "Flyer", "Folder"],
      "Acabamento": ["Laminação fosca", "Verniz localizado"]
    },
    produtos: ["Cartão de visita 4x4", "Flyer A5", "Folder tri-dobra"]
  },
  pdv: {
    nome: "Materiais de PDV",
    tipos: {
      "Item": ["Display balcão", "Wobbler", "Totem"],
      "Material": ["PS", "Papel cartão", "PVC expandido"]
    },
    produtos: ["Display A5", "Wobbler 10 cm", "Totem floor 160 cm"]
  },
  casa: {
    nome: "Casa e Escritório",
    tipos: { "Item": ["Porta-copos", "Lousa", "Calendário"] },
    produtos: ["Porta-copos cortiça", "Lousa magnética", "Calendário mesa"]
  },
  bottons: {
    nome: "Bottons",
    tipos: { "Tamanho": ["3,5 cm", "5,5 cm", "7,5 cm"] },
    produtos: ["Botton 3,5 cm", "Botton 5,5 cm", "Botton 7,5 cm"]
  },
  brindes: {
    nome: "Brindes Corporativos",
    tipos: { "Item": ["Chaveiro", "Squeeze", "Caneta"] },
    produtos: ["Chaveiro metálico", "Squeeze 600 ml", "Caneta metálica"]
  }
};

/* ===========================
   Header / Menu mobile
=========================== */
const hamb = $('.hamburger');
const menu = $('#menu');
if (hamb){
  hamb.addEventListener('click', () => {
    const open = menu.classList.toggle('show');
    hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Fecha menu ao clicar num link
  menu.addEventListener('click', e => {
    if (e.target.tagName === 'A' || e.target.classList.contains('open-wizard')) {
      menu.classList.remove('show');
      hamb.setAttribute('aria-expanded','false');
    }
  });
}

/* ===========================
   Ano corrente no rodapé
=========================== */
$('#year') && ($('#year').textContent = new Date().getFullYear());

/* ===========================
   Vídeo YouTube (lazy-load)
   -> aceita data-youtube-id OU data-youtube-src
=========================== */
const videoWrap = $('.video-wrap');
if (videoWrap){
  const extractId = (urlOrId='') => {
    if (!urlOrId) return '';
    // se já for ID simples
    if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
    // tenta extrair de URL
    const m = String(urlOrId).match(/(?:v=|\/embed\/|\.be\/)([\w-]{11})/i);
    return m ? m[1] : '';
  };
  const yt = videoWrap.dataset.youtubeId || extractId(videoWrap.dataset.youtubeSrc);
  if (yt){
    const thumb = new Image();
    thumb.alt = "Capa do vídeo no YouTube";
    thumb.loading = "lazy";
    thumb.decoding = "async";
    thumb.src = `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`;
    thumb.addEventListener('error',()=>thumb.src=`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`);
    videoWrap.appendChild(thumb);

    $('.video-play', videoWrap)?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.width = "560"; iframe.height = "315";
      iframe.src = `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`;
      iframe.title = "YouTube video player";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      videoWrap.innerHTML = "";
      videoWrap.appendChild(iframe);
    });
  }
}

/* ===========================
   Carrossel Depoimentos
=========================== */
(() => {
  const track = $('.reviews-track');
  if (!track) return;
  const prev = $('.reviews-carousel .prev');
  const next = $('.reviews-carousel .next');
  const scrollBy = () => track.scrollBy({ left: track.clientWidth * 0.9, behavior: 'smooth' });
  next.addEventListener('click', () => scrollBy());
  prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.9, behavior: 'smooth' }));
})();

/* ===========================
   Wizard de Orçamento
=========================== */
const modal = $('#wizard');
const openers = $$('.open-wizard,[data-open-wizard],[data-cat][data-open-wizard]');
const closer = $('.modal .close');
const wCloseBtn = $('.w-close');
const wPrevBtns = $$('.w-prev');
const progress = $$('.progress li');
const steps = $$('.w-step');

const fillCategorias = () => {
  const wrap = $('#w-categorias'); if (!wrap) return;
  wrap.innerHTML = '';
  Object.entries(DB).forEach(([key, val]) => {
    wrap.appendChild(wCard({
      label: val.nome,
      onClick: () => { state.categoria = key; goStep(2); fillTipos(); }
    }));
  });
};
const fillTipos = () => {
  const wrap = $('#w-tipos'); if (!wrap) return;
  wrap.innerHTML = '';
  const cat = DB[state.categoria];
  Object.entries(cat.tipos).forEach(([grupo, itens]) => {
    itens.forEach(i => {
      wrap.appendChild(wCard({
        label: `${grupo}: ${i}`,
        onClick: () => { state.tipo = `${grupo}: ${i}`; goStep(3); fillProdutos(); }
      }));
    });
  });
};
const fillProdutos = () => {
  const wrap = $('#w-produtos'); if (!wrap) return;
  wrap.innerHTML = '';
  DB[state.categoria].produtos.forEach(p => {
    wrap.appendChild(wCard({
      label: p,
      onClick: () => {
        state.produto = p;
        const prodField = $('#field-produto');
        if (prodField) prodField.value = `${DB[state.categoria].nome} — ${p}`;
        goStep(4);
      }
    }));
  });
};

const wCard = ({label,onClick}) => {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'w-card';
  el.innerHTML = `<span class="ico">🎯</span><span>${label}</span>`;
  el.addEventListener('click', onClick);
  return el;
};

const goStep = (n) => {
  steps.forEach(s => s.hidden = s.dataset.step != n);
  progress.forEach((p, i) => p.classList.toggle('active', i < n));
  const focusable = steps[n-1]?.querySelector('button, [href], input, select, textarea');
  if (focusable) focusable.focus();
};

const openWizard = (preCat=null) => {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  fillCategorias();
  if (preCat && DB[preCat]) { state.categoria = preCat; goStep(2); fillTipos(); }
  else { goStep(1); }
};
const closeWizard = () => {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  state.categoria = state.tipo = state.produto = null;
};

openers.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const pre = e.currentTarget.dataset.cat || null;
    openWizard(pre);
  });
});
if (closer) closer.addEventListener('click', closeWizard);
if (wCloseBtn) wCloseBtn.addEventListener('click', closeWizard);
modal?.addEventListener('click', (e)=>{ if(e.target === modal) closeWizard(); });
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal?.classList.contains('show')) closeWizard(); });
wPrevBtns.forEach(b => b.addEventListener('click', () => {
  const visible = steps.findIndex(s => !s.hidden) + 1;
  goStep(Math.max(1, visible-1));
}));

/* ===========================
   Form submit (demo)
=========================== */
$('#quote-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = ['field-produto','field-qtd','field-nome','field-email','field-tel','field-lgpd'];
  const invalid = required.filter(id => {
    const el = document.getElementById(id);
    return (el.type === 'checkbox') ? !el.checked : !String(el.value).trim();
  });
  if (invalid.length) {
    alert('Por favor, preencha os campos obrigatórios.');
    return;
  }
  const payload = {
    produto: $('#field-produto').value,
    qtd: $('#field-qtd').value,
    tamanho: $('#field-tamanho').value,
    material: $('#field-material').value,
    obs: $('#field-obs').value,
    nome: $('#field-nome').value,
    email: $('#field-email').value,
    tel: $('#field-tel').value,
    empresa: $('#field-empresa').value
  };
  console.log('Orçamento enviado:', payload);
  alert('Recebemos seu pedido de orçamento! Em breve entraremos em contato.');
  closeWizard();
});

/* ===========================
   Links de categoria (cards)
=========================== */
$$('.cat-card').forEach(c => c.addEventListener('click', (e) => {
  const cat = c.dataset.cat;
  if (cat){
    e.preventDefault();
    openWizard(cat);
  }
}));

/* ===========================
   PÁGINA DE PRODUTO — Galeria + Lightbox + Form rápido
=========================== */
(() => {
  const gal = $('.produto-galeria');
  if (!gal) return;

  // Thumbs -> imagem principal
  const mainImg = $('.galeria-principal img', gal);
  const thumbs = $$('.galeria-thumbs img', gal);
  const setMain = (imgEl) => {
    if (!imgEl || !mainImg) return;
    mainImg.src = imgEl.src;
    mainImg.alt = imgEl.alt || mainImg.alt;
    thumbs.forEach(t => t.classList.toggle('active', t === imgEl));
  };
  thumbs.forEach(t => t.addEventListener('click', () => setMain(t)));

  // Lightbox
  const openLightbox = (src, alt='Imagem do produto') => {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lb-close" aria-label="Fechar">✕</button>
      <img src="${src}" alt="${alt}" />
    `;
    const close = () => lb.remove();
    lb.addEventListener('click', (e)=>{ if(e.target === lb || e.target.classList.contains('lb-close')) close(); });
    document.addEventListener('keydown', function esc(ev){ if(ev.key === 'Escape'){ close(); document.removeEventListener('keydown', esc);} });
    document.body.appendChild(lb);
  };
  mainImg?.addEventListener('click', () => openLightbox(mainImg.src, mainImg.alt));

  // Form rápido -> abre wizard com dados
  $('#form-rapido')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const qtd = $('#form-rapido #qtd')?.value?.trim();
    const cat = document.querySelector('.produto-page')?.dataset.cat || null;
    const prodName = document.querySelector('.produto-info h1')?.textContent?.trim() || '';
    openWizard(cat);
    // Popular campos do passo final
    goStep(4);
    if ($('#field-produto') && prodName) $('#field-produto').value = prodName;
    if ($('#field-qtd') && qtd) $('#field-qtd').value = qtd;
  });
})();
/* ===========================
   Tabs de Produto
=========================== */
(() => {
  const tabs = $$('.produto-tabs .tab');
  const panels = $$('.produto-tabs .tab-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      // trocar ativo nos botões
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      // trocar painel ativo
      panels.forEach(p => {
        p.hidden = (p.id !== id);
        p.classList.toggle('active', p.id === id);
      });
    });
  });
})();
/* ===========================
   Galeria de Produto
=========================== */
(() => {
  const main = $('.galeria-principal img');
  const thumbs = $$('.galeria-thumbs img');
  if (!main || !thumbs.length) return;

  thumbs.forEach(t => {
    t.addEventListener('click', () => {
      // troca src da principal
      main.src = t.src;
      main.alt = t.alt || "Foto do produto";
      // marca thumb ativa
      thumbs.forEach(img => img.classList.remove('active'));
      t.classList.add('active');
    });
  });
})();
