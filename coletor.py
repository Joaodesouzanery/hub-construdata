"""
coletor.py - Coletor de Notícias de Saneamento
================================================
Busca notícias de múltiplos feeds RSS de saneamento,
consolida, remove duplicatas e salva as 10 mais recentes
em public/noticias.json para consumo pelo frontend.
"""

import requests
import xml.etree.ElementTree as ET
import json
import os
from datetime import datetime
from email.utils import parsedate_to_datetime

# ============================================================
# 1. CONFIGURAÇÃO DAS FONTES DE NOTÍCIAS (Feeds RSS)
# ============================================================
# Cada fonte tem uma URL do feed e um nome amigável.
FONTES = [
    {
        "url": "https://saneamentobasico.com.br/feed/",
        "nome": "Saneamento Básico"
    },
    {
        "url": "https://tratamentodeagua.com.br/feed/",
        "nome": "Tratamento de Água"
    },
]

# Caminho de saída do JSON (pasta public/ do projeto Vite)
CAMINHO_SAIDA = os.path.join(os.path.dirname(__file__), "public", "noticias.json")


def buscar_feed(url, nome_fonte):
    """
    2. BUSCA E EXTRAÇÃO DE DADOS
    Faz a requisição HTTP ao feed RSS e extrai os dados de cada <item>.
    Retorna uma lista de dicionários com titulo, link, data_publicacao e fonte.
    """
    noticias = []

    try:
        # Faz a requisição HTTP com timeout de 15 segundos
        resposta = requests.get(url, timeout=15, headers={
            "User-Agent": "HubConstrudata/1.0 (coletor de noticias)"
        })
        resposta.raise_for_status()  # Levanta exceção para status 4xx/5xx

    except requests.exceptions.RequestException as erro:
        # Se o site estiver fora do ar ou der erro, apenas avisa e continua
        print(f"[ERRO] Não foi possível acessar '{nome_fonte}' ({url})")
        print(f"       Motivo: {erro}")
        return noticias  # Retorna lista vazia, sem quebrar o script

    try:
        # Analisa o XML do feed RSS
        raiz = ET.fromstring(resposta.content)

        # Percorre cada <item> dentro de <channel>
        for item in raiz.findall(".//item"):
            titulo = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            data_publicacao = item.findtext("pubDate", "").strip()
            fonte = nome_fonte

            # Só adiciona se tiver ao menos título e link
            if titulo and link:
                noticias.append({
                    "titulo": titulo,
                    "link": link,
                    "data_publicacao": data_publicacao,
                    "fonte": fonte
                })

        print(f"[OK] {nome_fonte}: {len(noticias)} notícias coletadas")

    except ET.ParseError as erro:
        print(f"[ERRO] Falha ao analisar XML de '{nome_fonte}': {erro}")

    return noticias


def remover_duplicatas(lista_noticias):
    """
    3. REMOÇÃO DE DUPLICATAS
    Remove notícias com o mesmo link, mantendo apenas a primeira ocorrência.
    """
    links_vistos = set()
    noticias_unicas = []

    for noticia in lista_noticias:
        if noticia["link"] not in links_vistos:
            links_vistos.add(noticia["link"])
            noticias_unicas.append(noticia)

    duplicatas_removidas = len(lista_noticias) - len(noticias_unicas)
    if duplicatas_removidas > 0:
        print(f"[INFO] {duplicatas_removidas} duplicata(s) removida(s)")

    return noticias_unicas


def ordenar_por_data(lista_noticias):
    """
    4. ORDENAÇÃO POR DATA
    Ordena as notícias da mais recente para a mais antiga,
    usando o campo data_publicacao (formato RFC 2822 dos feeds RSS).
    """
    def parse_data(noticia):
        try:
            # Feeds RSS usam formato RFC 2822, ex: "Thu, 12 Jun 2025 14:30:00 +0000"
            return parsedate_to_datetime(noticia["data_publicacao"])
        except (ValueError, TypeError):
            # Se a data for inválida, coloca no final da lista
            return datetime.min

    return sorted(lista_noticias, key=parse_data, reverse=True)


def salvar_json(noticias, caminho):
    """
    5. SAÍDA FINAL
    Salva a lista de notícias em um arquivo JSON com formatação legível.
    """
    # Garante que o diretório de saída existe
    os.makedirs(os.path.dirname(caminho), exist_ok=True)

    with open(caminho, "w", encoding="utf-8") as arquivo:
        json.dump(noticias, arquivo, ensure_ascii=False, indent=2)

    print(f"[OK] {len(noticias)} notícias salvas em: {caminho}")


def main():
    """
    Fluxo principal do coletor:
    1. Busca notícias de cada fonte RSS
    2. Consolida tudo em uma lista única
    3. Remove duplicatas por link
    4. Ordena por data (mais recente primeiro)
    5. Seleciona as 10 mais recentes
    6. Salva em noticias.json
    """
    print("=" * 50)
    print("Hub Construdata - Coletor de Notícias")
    print("=" * 50)

    # Passo 1 e 2: Buscar e consolidar notícias de todas as fontes
    todas_noticias = []
    for fonte in FONTES:
        noticias = buscar_feed(fonte["url"], fonte["nome"])
        todas_noticias.extend(noticias)

    print(f"\n[INFO] Total coletado: {len(todas_noticias)} notícias")

    if not todas_noticias:
        print("[AVISO] Nenhuma notícia foi coletada. Verifique sua conexão.")
        return

    # Passo 3: Remover duplicatas
    noticias_unicas = remover_duplicatas(todas_noticias)

    # Passo 4: Ordenar por data de publicação (mais recente primeiro)
    noticias_ordenadas = ordenar_por_data(noticias_unicas)

    # Passo 5: Selecionar apenas as 10 mais recentes
    top_10 = noticias_ordenadas[:10]

    # Passo 6: Salvar no arquivo JSON
    salvar_json(top_10, CAMINHO_SAIDA)

    print("\nConcluído com sucesso!")


# Executa o script diretamente
if __name__ == "__main__":
    main()
