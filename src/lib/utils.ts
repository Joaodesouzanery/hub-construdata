import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Domínios confiáveis para links externos.
 * Adicione novos domínios conforme necessário.
 */
const DOMINIOS_CONFIAVEIS = [
  "pncp.gov.br",
  "comprasnet.gov.br",
  "gov.br",
  "diariooficial.com.br",
  "in.gov.br",
  "ana.gov.br",
  "inmet.gov.br",
  "cemaden.gov.br",
  "supabase.co",
];

/**
 * Valida que a URL é segura contra XSS.
 * - Rejeita javascript:, data:, vbscript: e outros protocolos perigosos
 * - Aceita apenas http: e https:
 * - Valida que a URL é absoluta (não relativa com truques)
 * Retorna "#" se inválida.
 */
export function urlSegura(url: string): string {
  if (!url || typeof url !== "string") return "#";

  // Normaliza espaços e caracteres de controle antes de parsear
  const limpo = url.trim().replace(/[\x00-\x1f\x7f]/g, "");

  // Rejeita prefixos perigosos antes mesmo de parsear (case insensitive)
  const lower = limpo.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("ftp:")
  ) {
    return "#";
  }

  try {
    // Usa uma base fixa para evitar injeção via window.location
    const parsed = new URL(limpo, "https://placeholder.invalid");

    // Dupla verificação do protocolo depois do parse
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "#";
    }

    // Se a URL original era absoluta, retorna o href parseado
    if (limpo.startsWith("http://") || limpo.startsWith("https://")) {
      return parsed.href;
    }

    // URLs relativas: mantém apenas caminhos simples (sem //)
    if (limpo.startsWith("/") && !limpo.startsWith("//")) {
      return limpo;
    }

    return "#";
  } catch {
    return "#";
  }
}

/** Verifica se um domínio é de uma fonte confiável */
export function isDominioConfiavel(url: string): boolean {
  try {
    const parsed = new URL(url);
    return DOMINIOS_CONFIAVEIS.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

/** Sanitiza texto para prevenir XSS em contextos onde é renderizado como texto */
export function sanitizarTexto(text: string, maxLength = 500): string {
  if (!text || typeof text !== "string") return "";
  return text
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, (ch) => {
      const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "&": "&amp;" };
      return map[ch] || ch;
    });
}

/** Valida formato de email */
export function validarEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email);
}
