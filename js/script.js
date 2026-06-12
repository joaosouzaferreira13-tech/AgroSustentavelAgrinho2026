// =====================================================
// AGRINHO 2026 – AgroSustentável PR
// Arquivo: js/script.js
// Tema: Agro forte, futuro sustentável
// Autor: João Mateus de Souza Ferreira – C. E. Heitor Rocha Kramer
// =====================================================
// Este arquivo controla todas as interações do site:
//  1. Modo claro/escuro
//  2. Menu hambúrguer para mobile
//  3. Calculadora de sustentabilidade
//  4. Animação do resultado (anel SVG, contador, barra)
//  5. Botão recalcular
//  6. Animações de scroll (IntersectionObserver)
//  7. Contador animado da seção de números
//  8. Efeito parallax nas bolhas do hero
//  9. Widget de clima em tempo real (API open-meteo)
// 10. Notificações Toast
// =====================================================

// Adiciona classe "js-ativo" no <body> para habilitar
// animações de scroll que dependem do JavaScript
document.body.classList.add('js-ativo');


// ── FUNÇÃO UTILITÁRIA: TOAST (ALERTAS ELEGANTES) ────
// Substitui o alert() padrão por uma notificação visual
function mostrarToast(mensagem, tipo = 'erro') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    container.appendChild(toast);

    // Força reflow para a transição CSS funcionar corretamente
    requestAnimationFrame(() => {
        toast.classList.add('mostrar');
    });

    // Remove o toast após 4.5 segundos
    setTimeout(() => {
        toast.classList.remove('mostrar');
        setTimeout(() => toast.remove(), 350);
    }, 4500);
}


// ── 1. MODO CLARO / ESCURO ───────────────────────────

const btnTema   = document.getElementById('btn-tema');
const iconeTema = document.getElementById('icone-tema');

// Ícones SVG para os dois modos
const SVG_LUA = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
</svg>`;

const SVG_SOL = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/><path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/><path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
</svg>`;

let modoEscuroAtivo = false;

function alternarTema() {
    modoEscuroAtivo = !modoEscuroAtivo;
    document.body.classList.toggle('modo-escuro', modoEscuroAtivo);

    // Troca o ícone conforme o estado atual
    iconeTema.innerHTML = modoEscuroAtivo ? SVG_SOL : SVG_LUA;

    // Atualiza o atributo para leitores de tela
    btnTema.setAttribute('aria-label',
        modoEscuroAtivo ? 'Alternar para tema claro' : 'Alternar para tema escuro'
    );
}

btnTema.addEventListener('click', alternarTema);


// ── 2. MENU HAMBÚRGUER (MOBILE) ──────────────────────

const btnMenu    = document.getElementById('btn-menu');
const menuMobile = document.getElementById('menu-mobile');

// Abre e fecha o menu mobile ao clicar no botão hambúrguer
function toggleMenu() {
    const estaAberto = menuMobile.classList.toggle('visivel');

    // Atualiza atributos de acessibilidade
    btnMenu.setAttribute('aria-expanded', estaAberto);
    menuMobile.setAttribute('aria-hidden', !estaAberto);

    // Anima as linhas do hambúrguer para um "X" quando aberto
    btnMenu.classList.toggle('aberto', estaAberto);
}

btnMenu.addEventListener('click', toggleMenu);

// Fecha o menu ao clicar em qualquer link do menu mobile
const linksMenuMobile = document.querySelectorAll('.menu-mobile__link');
linksMenuMobile.forEach(function (link) {
    link.addEventListener('click', function () {
        menuMobile.classList.remove('visivel');
        btnMenu.classList.remove('aberto');
        btnMenu.setAttribute('aria-expanded', 'false');
        menuMobile.setAttribute('aria-hidden', 'true');
    });
});

// Fecha o menu ao clicar fora (em qualquer área da página)
document.addEventListener('click', function (evento) {
    const clicouFora = !btnMenu.contains(evento.target) && !menuMobile.contains(evento.target);
    if (clicouFora && menuMobile.classList.contains('visivel')) {
        menuMobile.classList.remove('visivel');
        btnMenu.classList.remove('aberto');
        btnMenu.setAttribute('aria-expanded', 'false');
        menuMobile.setAttribute('aria-hidden', 'true');
    }
});


// ── 3. CALCULADORA DE SUSTENTABILIDADE ──────────────

const formCalculadora = document.getElementById('form-calculadora');

if (formCalculadora) {
    // Ouve o evento "submit" do formulário, que respeita as
    // validações nativas do HTML (campo required, type number etc.)
    formCalculadora.addEventListener('submit', function (evento) {
        evento.preventDefault(); // impede o recarregamento da página
        calcularSustentabilidade();
    });
}

function calcularSustentabilidade() {

    // ── Lê os valores dos campos ──
    const areaTotal       = parseFloat(document.getElementById('area-total').value);
    const areaPreservacao = parseFloat(document.getElementById('area-preservacao').value);
    const irrigacao       = document.getElementById('irrigacao').value;
    const captacaoChuva   = document.getElementById('captacao-chuva').value;
    const plantioDireto   = document.getElementById('plantio-direto').value;
    const rotacaoCulturas = document.getElementById('rotacao-culturas').value;
    const adubacao        = document.getElementById('adubacao').value;
    const energiaRenovavel= document.getElementById('energia-renovavel').value;

    // ── Validações com toast ──
    if (!areaTotal || areaTotal <= 0) {
        mostrarToast('Por favor, informe a área total da propriedade!', 'erro');
        return;
    }

    if (isNaN(areaPreservacao) || areaPreservacao < 0) {
        mostrarToast('Informe a área de preservação (pode ser 0 se não houver).', 'erro');
        return;
    }

    if (areaPreservacao > areaTotal) {
        mostrarToast('A área de preservação não pode ser maior que a área total!', 'erro');
        return;
    }

    // ── Cálculo da pontuação ──
    let pontuacao = 0;

    // Critério 1: Proporção de área preservada (até 30 pontos)
    const percentualPreservacao = (areaPreservacao / areaTotal) * 100;
    let pontosArea = 0;

    if      (percentualPreservacao >= 30) pontosArea = 30;
    else if (percentualPreservacao >= 20) pontosArea = 22;
    else if (percentualPreservacao >= 10) pontosArea = 14;
    else if (percentualPreservacao >=  5) pontosArea =  7;
    else                                  pontosArea =  0;

    pontuacao += pontosArea;

    // Critério 2: Uso de água (até 25 pontos)
    let pontosAgua = 0;

    if      (irrigacao === 'nao')         pontosAgua += 15;
    else if (irrigacao === 'gotejamento') pontosAgua += 15;
    else if (irrigacao === 'aspersao')    pontosAgua +=  8;
    else if (irrigacao === 'inundacao')   pontosAgua +=  2;

    if (captacaoChuva === 'sim') pontosAgua += 10;

    pontuacao += pontosAgua;

    // Critério 3: Práticas sustentáveis (até 45 pontos)
    let pontosPraticas = 0;

    if (plantioDireto   === 'sim')      pontosPraticas += 12;
    if (rotacaoCulturas === 'sim')      pontosPraticas += 11;
    if (adubacao        === 'organica') pontosPraticas += 12;
    else if (adubacao   === 'mista')    pontosPraticas +=  6;
    if (energiaRenovavel === 'sim')     pontosPraticas += 10;
    else if (energiaRenovavel === 'parcial') pontosPraticas += 5;

    pontuacao += pontosPraticas;

    // Garante máximo de 100
    if (pontuacao > 100) pontuacao = 100;

    // Exibe o resultado calculado na interface
    exibirResultado(pontuacao, pontosArea, pontosAgua, pontosPraticas, percentualPreservacao);
}


// ── 4. EXIBIR RESULTADO ──────────────────────────────

function exibirResultado(pontuacao, pontosArea, pontosAgua, pontosPraticas, percPreservacao) {

    const painel = document.getElementById('painel-resultado');

    // Mostra o painel (remove a classe que o ocultava)
    painel.classList.remove('painel-resultado--oculto');

    // Rola suavemente até o resultado
    painel.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // ── Animação de contagem do número ──
    const elementoNota = document.getElementById('nota-numero');
    elementoNota.textContent = '0';

    if (pontuacao > 0) {
        let contador = 0;
        // Tempo total 1.4s dividido pela pontuação para chegar na nota certa
        const intervalo = 1400 / pontuacao;

        const animaPontos = setInterval(() => {
            contador++;
            elementoNota.textContent = contador;
            if (contador >= pontuacao) {
                clearInterval(animaPontos);
                elementoNota.textContent = pontuacao;
            }
        }, intervalo);
    }

    // ── Animação da barra de progresso ──
    const barra = document.getElementById('barra-progresso');
    setTimeout(() => {
        barra.style.width = pontuacao + '%';
        barra.setAttribute('aria-valuenow', pontuacao);
    }, 100);

    // ── Animação do anel SVG circular ──
    // Circunferência do círculo com r=78: 2π×78 ≈ 490
    const CIRCUNFERENCIA = 490;
    const anel = document.getElementById('placar-progresso-circulo');
    if (anel) {
        const offset = CIRCUNFERENCIA - (pontuacao / 100) * CIRCUNFERENCIA;
        // Pequeno delay para a transição CSS animar corretamente
        setTimeout(() => {
            anel.style.strokeDashoffset = offset;
        }, 150);
    }

    // ── Define classificação, cor e mensagem conforme a nota ──
    let classificacao = '';
    let mensagem      = '';

    if (pontuacao >= 80) {
        classificacao = '🌳 Propriedade Sustentável';
        mensagem = '🎉 Parabéns! Sua propriedade é referência em sustentabilidade no Paraná. ' +
                   'Continue mantendo essas práticas e inspire outros produtores da região!';
    } else if (pontuacao >= 60) {
        classificacao = '🌿 Em desenvolvimento sustentável';
        mensagem = '👍 Muito bom! Você já adota práticas importantes. Para avançar, considere ' +
                   'ampliar a área de preservação e investir em energia renovável.';
    } else if (pontuacao >= 40) {
        classificacao = '🌾 Potencial de melhoria';
        mensagem = '💡 Sua propriedade tem bom potencial! Adotar plantio direto, rotação ' +
                   'de culturas e a captação de água da chuva pode melhorar bastante seu índice.';
    } else {
        classificacao = '🌱 Início da jornada sustentável';
        mensagem = '🌱 Toda grande jornada começa com um pequeno passo! Comece preservando ao ' +
                   'menos 20% da sua área e experimente o plantio direto. Cada mudança conta!';
    }

    document.getElementById('nota-texto').textContent = classificacao;

    // ── Detalhe por categoria ──
    document.getElementById('detalhe-area').textContent =
        `${Math.round(percPreservacao)}% preservado (${pontosArea}/30 pts)`;

    document.getElementById('detalhe-agua').textContent =
        `${pontosAgua}/25 pts`;

    document.getElementById('detalhe-praticas').textContent =
        `${pontosPraticas}/45 pts`;

    document.getElementById('mensagem-personalizada').textContent = mensagem;

    // Exibe toast de sucesso
    mostrarToast('Índice calculado com sucesso! 🌿', 'sucesso');
}


// ── 5. BOTÃO DE RECALCULAR ───────────────────────────

document.getElementById('btn-recalcular').addEventListener('click', function () {
    // Esconde o painel de resultado
    const painel = document.getElementById('painel-resultado');
    painel.classList.add('painel-resultado--oculto');

    // Reseta a barra de progresso
    document.getElementById('barra-progresso').style.width = '0%';

    // Reseta o anel SVG
    const anel = document.getElementById('placar-progresso-circulo');
    if (anel) anel.style.strokeDashoffset = '490';

    // Rola de volta para a calculadora
    document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
});


// ── 6. ANIMAÇÕES DE SCROLL (IntersectionObserver) ────
// O IntersectionObserver é uma API moderna de alta performance
// que detecta quando um elemento entra na área visível da tela.

// Seleciona todos os elementos que serão animados ao rolar
const elementosAnimaveis = document.querySelectorAll('.card-info, .dica-card, .numero-item');

const observadorScroll = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            // Adiciona a classe 'visivel', que o CSS usa para animar
            entrada.target.classList.add('visivel');
            // Para de observar após animar (animação ocorre só uma vez)
            observadorScroll.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.12  // dispara quando 12% do elemento está visível na tela
});

elementosAnimaveis.forEach((elemento) => {
    observadorScroll.observe(elemento);
});


// ── 7. CONTADOR ANIMADO (Seção de Números) ───────────
// Anima os números da seção "Impacto" do zero até o valor real
// quando a seção entra na área visível da tela.

const itensNumericos = document.querySelectorAll('.numero-item__valor');

const observadorContador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            const elemento  = entrada.target;
            const valorAlvo = parseInt(elemento.getAttribute('data-alvo'), 10);

            // Anima do 0 até o valor alvo em 1.6 segundos
            let atual   = 0;
            const duracao   = 1600;
            const intervalo = duracao / valorAlvo;

            const animacao = setInterval(() => {
                atual++;
                elemento.textContent = atual;
                if (atual >= valorAlvo) {
                    clearInterval(animacao);
                    elemento.textContent = valorAlvo;
                }
            }, intervalo);

            // Observa apenas uma vez
            observadorContador.unobserve(elemento);
        }
    });
}, {
    threshold: 0.4  // dispara quando 40% do elemento está visível
});

itensNumericos.forEach((item) => {
    observadorContador.observe(item);
});


// ── 8. EFEITO PARALLAX NAS BOLHAS DO HERO ───────────
// Cria um efeito de profundidade 3D interativo quando
// o cursor se move sobre a seção hero.

const secaoHero = document.querySelector('.hero');
const bolhas     = document.querySelectorAll('.hero__fundo .bolha');

if (secaoHero && bolhas.length > 0) {
    secaoHero.addEventListener('mousemove', function (evento) {
        // Calcula o deslocamento em relação ao centro da janela
        const x = (window.innerWidth  / 2 - evento.pageX) / 28;
        const y = (window.innerHeight / 2 - evento.pageY) / 28;

        // Move cada bolha em direção e velocidade diferentes para criar profundidade
        bolhas[0].style.transform = `translate(${x}px, ${y}px)`;
        bolhas[1].style.transform = `translate(${-x}px, ${-y}px) scale(1.05)`;
        bolhas[2].style.transform = `translate(${x * 1.6}px, ${y * 1.6}px)`;
    });

    // Retorna suavemente as bolhas à posição original
    secaoHero.addEventListener('mouseleave', function () {
        bolhas.forEach(function (b) {
            b.style.transition = 'transform 0.6s ease-out';
            b.style.transform  = '';
        });

        // Remove a transição após o retorno para o parallax ficar instantâneo novamente
        setTimeout(() => {
            bolhas.forEach(function (b) {
                b.style.transition = '';
            });
        }, 600);
    });
}


// ── 9. WIDGET DE CLIMA (API open-meteo – gratuita) ───
// Busca dados meteorológicos reais sem necessidade de chave de API.
// Ideal para projetos escolares e competições.

const btnClimaLocal = document.getElementById('btn-clima-local');
const climaWidget   = document.getElementById('clima-widget');

// Coordenadas padrão: Curitiba, PR
const LAT_PADRAO = -25.4284;
const LON_PADRAO = -49.2733;

if (btnClimaLocal) {
    btnClimaLocal.addEventListener('click', function () {
        mostrarCarregandoClima();

        if (navigator.geolocation) {
            // Tenta obter a localização real do usuário
            navigator.geolocation.getCurrentPosition(
                async function (posicao) {
                    const lat = posicao.coords.latitude;
                    const lon = posicao.coords.longitude;

                    // Reverse geocoding gratuito para descobrir o nome da cidade
                    let nomeCidade = 'Sua Região';
                    try {
                        const urlGeo = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
                        const respostaGeo = await fetch(urlGeo);
                        if (respostaGeo.ok) {
                            const dados = await respostaGeo.json();
                            if (dados.city) {
                                nomeCidade = `${dados.city}, ${dados.principalSubdivision}`;
                            } else if (dados.locality) {
                                nomeCidade = `${dados.locality}, ${dados.principalSubdivision}`;
                            }
                        }
                    } catch (e) {
                        // Falha silenciosa: usa "Sua Região" como fallback
                        console.log('Geocoding indisponível, usando nome padrão.');
                    }

                    buscarClima(lat, lon, nomeCidade);
                },
                function () {
                    // Permissão negada: usa Curitiba como padrão
                    mostrarToast('Localização negada. Mostrando clima de Curitiba, PR.', 'erro');
                    buscarClima(LAT_PADRAO, LON_PADRAO, 'Curitiba, PR');
                }
            );
        } else {
            mostrarToast('Geolocalização não suportada. Mostrando clima do PR.', 'erro');
            buscarClima(LAT_PADRAO, LON_PADRAO, 'Curitiba, PR');
        }
    });
}

// Exibe o estado de carregamento no widget de clima
function mostrarCarregandoClima() {
    climaWidget.innerHTML = `
        <div class="clima-carregando">
            <span class="clima-carregando__icone" aria-hidden="true">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" class="spin">
                    <line x1="12" y1="2" x2="12" y2="6"/>
                    <line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/>
                    <line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                </svg>
            </span>
            <p>Buscando dados meteorológicos em tempo real...</p>
        </div>
    `;
}

// Faz a chamada à API open-meteo com as coordenadas obtidas
async function buscarClima(lat, lon, nomeLocal) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=America%2FSao_Paulo`;
        const resposta = await fetch(url);

        if (!resposta.ok) throw new Error('Falha na API de clima');

        const dados = await resposta.json();
        renderizarClima(dados.current, nomeLocal);

    } catch (erro) {
        // Exibe mensagem de erro com botão para tentar novamente
        climaWidget.innerHTML = `
            <div class="clima-estado-inicial">
                <p class="clima-texto-ajuda clima-texto-erro">
                    ⚠️ Não foi possível carregar o clima. Verifique sua conexão.
                </p>
                <button id="btn-clima-tentar" class="btn-secundario btn-pequeno">
                    Tentar Novamente
                </button>
            </div>
        `;

        const btnTentar = document.getElementById('btn-clima-tentar');
        if (btnTentar) {
            btnTentar.addEventListener('click', function () {
                mostrarCarregandoClima();
                buscarClima(lat, lon, nomeLocal);
            });
        }
    }
}

// Renderiza os dados do clima na interface
function renderizarClima(atual, nomeLocal) {
    const infos = traduzirCodigoClima(atual.weather_code, atual.is_day);

    climaWidget.innerHTML = `
        <div class="clima-resultado">
            <p class="clima-localidade">📍 ${nomeLocal}</p>
            <p class="clima-descricao">${infos.descricao}</p>
            <div class="clima-icone-temp">
                <div class="clima-icone-svg ${infos.classeCor}" aria-hidden="true">
                    ${infos.svg}
                </div>
                <div class="clima-temperatura">${Math.round(atual.temperature_2m)}°C</div>
            </div>
            <div class="clima-detalhes">
                <span>💨 Vento: ${Math.round(atual.wind_speed_10m)} km/h</span>
                <span>💧 Umidade: ${atual.relative_humidity_2m}%</span>
            </div>
        </div>
    `;
}

// Traduz os códigos WMO de tempo em descrição e ícone SVG legíveis
function traduzirCodigoClima(codigo, isDay) {
    // SVGs inline — sem biblioteca externa, conforme exigido pelo edital
    const SVG_SOL_CLIMA = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>`;

    const SVG_SOL_NUVEM = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`;

    const SVG_LUA_CLIMA  = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    const SVG_NUVEM      = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;

    const SVG_CHUVA      = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;

    const SVG_TEMPESTADE = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M13 22l-3-4h4l-3-4"/></svg>`;

    // Mapa dos códigos climáticos WMO para descrição e ícone
    if (codigo === 0) {
        return { descricao: 'Céu limpo ☀️', svg: isDay ? SVG_SOL_CLIMA : SVG_LUA_CLIMA,
                 classeCor: isDay ? 'clima-cor-amarelo' : 'clima-cor-cinza' };
    }
    if (codigo === 1 || codigo === 2) {
        return { descricao: 'Sol com nuvens 🌤️', svg: isDay ? SVG_SOL_NUVEM : SVG_NUVEM,
                 classeCor: 'clima-cor-sol-nuvem' };
    }
    if (codigo === 3) {
        return { descricao: 'Nublado ☁️', svg: SVG_NUVEM, classeCor: 'clima-cor-nublado' };
    }
    if (codigo === 45 || codigo === 48) {
        return { descricao: 'Neblina 🌫️', svg: SVG_NUVEM, classeCor: 'clima-cor-neblina' };
    }
    if (codigo >= 51 && codigo <= 67) {
        return { descricao: 'Chuva / Garoa 🌧️', svg: SVG_CHUVA, classeCor: 'clima-cor-chuva' };
    }
    if (codigo >= 71 && codigo <= 77) {
        return { descricao: 'Neve / Frio intenso 🌨️', svg: SVG_NUVEM, classeCor: 'clima-cor-neblina' };
    }
    if (codigo >= 80 && codigo <= 82) {
        return { descricao: 'Pancadas de chuva 🌦️', svg: SVG_CHUVA, classeCor: 'clima-cor-chuva' };
    }
    if (codigo >= 95 && codigo <= 99) {
        return { descricao: 'Tempestade ⛈️', svg: SVG_TEMPESTADE, classeCor: 'clima-cor-tempestade' };
    }

    return { descricao: 'Tempo variável', svg: SVG_NUVEM, classeCor: 'clima-cor-padrao' };
}