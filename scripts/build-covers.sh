#!/usr/bin/env bash
# Normaliza as capas locais do catálogo.
#
# Entrada : uma pasta com uma imagem por livro, com o nome do slug
#           (ex.: terra-sonambula.jpg, mayombe.png).
# Saída   : public/covers/<slug>.jpg — recortadas ao fundo, ajustadas a uma
#           moldura branca 3:4 (600x800) e comprimidas, para que a grelha do
#           catálogo mostre todas as capas com a mesma proporção e nenhuma
#           capa fique cortada. As origens pequenas (as miniaturas de 200-500
#           px publicadas pelas editoras) são ampliadas para preencher a
#           moldura — sem isto ficariam perdidas no meio de um quadrado branco.
#
# Uso: scripts/build-covers.sh <pasta-de-origem>
#
# Requer ImageMagick (`convert`). Não é executado em build/deploy: as imagens
# finais são ficheiros versionados em public/covers, para o site não depender
# de nenhum serviço externo para mostrar uma capa.
set -euo pipefail

SRC_DIR="${1:-}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/covers"

if [[ -z "$SRC_DIR" || ! -d "$SRC_DIR" ]]; then
  echo "uso: $0 <pasta-com-as-capas-originais>" >&2
  exit 1
fi

# Dimensões de saída: 3:4, o mesmo rácio do componente BookCover.
OUT_W=600
OUT_H=800

mkdir -p "$OUT_DIR"
total=0

for src in "$SRC_DIR"/*; do
  [[ -f "$src" ]] || continue
  slug="$(basename "${src%.*}")"
  out="$OUT_DIR/$slug.jpg"

  # 1. remove a moldura/fundo uniforme (as fotografias de catálogo das
  #    editoras têm fundos de cor sólida que não pertencem à capa);
  # 2. ajusta a capa à moldura 3:4 — reduz originais grandes e amplia as
  #    miniaturas pequenas, sempre pela dimensão que "encher" primeiro, sem
  #    distorcer nem cortar a capa;
  # 3. centra numa tela branca de 3:4 — a capa inteira fica visível e todas
  #    as capas passam a ocupar o mesmo espaço na grelha (as sobras da tela
  #    branca são o que o `object-cover` do BookCover recorta na grelha);
  # 4. achata em JPEG (sem alfa) para servir diretamente de /public.
  convert "$src" \
    -fuzz 8% -trim +repage \
    -filter Lanczos -resize "${OUT_W}x${OUT_H}" \
    -background white -gravity center -extent "${OUT_W}x${OUT_H}" \
    -strip -interlace Plane -sampling-factor 4:2:0 -quality 82 \
    "$out"

  printf '%-38s %s\n' "$slug" "$(identify -format '%wx%h %b' "$out")"
  total=$((total + 1))
done

echo "capa(s) normalizada(s): $total → $OUT_DIR"
