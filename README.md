# Leo Thaylor | Portfólio BJJ (V3)

Site estático one-page para o portfólio pessoal de Leo Thaylor, faixa preta de jiu-jitsu e professor no Rio de Janeiro.

## Estrutura (9 seções)

1. **Preloader** — ciclo de saudações (inclui "Oss"), dissolve revelando o site.
2. **Hero** — foto real sobre painel escurecido, headline, lead, pills (WhatsApp/Instagram) e badge de localização.
3. **Intro/transição** — bloco tipográfico esparso + botão circular "Sobre mim" + divisória "Método".
4. **Sobre** — trajetória.
5. **Método** — lista tipográfica grande (Percepção, Posição, Controle, Golpe).
6. **Conteúdo** — 3 slots de vídeo reservados ("Em breve").
7. **Momentos** — esteira dupla de fotos em contramovimento (fotos reais + placeholders).
8. **Presença** — frase de impacto sobre foto.
9. **Contato + footer curvo** — headline com avatar inline, pills de contato, rodapé.

## Arquivos

- `index.html`: marcação das 9 seções.
- `styles.css`: paleta caqui claro / verde-escuro / acento teal, layout e responsividade.
- `script.js`: preloader, smooth scroll (Lenis), parallax, scroll-reveal, botões magnéticos e esteira em contramovimento (GSAP + ScrollTrigger).
- `assets/images/`: fotos reais (`hero-leo-bjj.jpg`, `presence-leo-bjj.jpg`).

## Efeitos

Preloader com ciclo de saudações · scroll com inércia (Lenis) · parallax no hero · scroll-reveal por seção · botões magnéticos (desktop) · contramovimento horizontal (Momentos) · footer com borda curva. Efeitos pesados são desativados em mobile/touch e sob `prefers-reduced-motion`; o preloader tem failsafe por timer que libera o scroll mesmo se o JS atrasar.

## Publicação

Publicável direto pelo GitHub Pages usando a branch principal e a pasta raiz.
