import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TourStep {
  title: string;
  description: string;
  targetSelector: string;
  position: TooltipPosition;
}

interface TourContextType {
  tourCompleted: boolean;
  tourActive: boolean;
  startTour: () => void;
  resetTour: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "hub_construdata_tour_completed";

const TOUR_STEPS: TourStep[] = [
  {
    title: "Dashboard",
    description: "Visao geral com KPIs nacionais, noticias e licitacoes",
    targetSelector: 'a[href="#/"]',
    position: "right",
  },
  {
    title: "Mapa",
    description: "Mapa interativo do Brasil com todas as camadas de dados",
    targetSelector: 'a[href="#/mapa"]',
    position: "right",
  },
  {
    title: "Dossies",
    description: "Perfil completo de empresas com score, sancoes e projetos",
    targetSelector: 'a[href="#/empresas"]',
    position: "right",
  },
  {
    title: "Grafo Vinculos",
    description: "Rede de conexoes entre empresas, socios e projetos",
    targetSelector: 'a[href="#/vinculos"]',
    position: "right",
  },
  {
    title: "Busca IA",
    description: "Pesquise com linguagem natural para encontrar dados cruzados",
    targetSelector: 'a[href="#/busca"]',
    position: "right",
  },
  {
    title: "Anomalias",
    description: "Deteccao automatica de padroes suspeitos em licitacoes",
    targetSelector: 'a[href="#/anomalias"]',
    position: "right",
  },
  {
    title: "Comparativo",
    description: "Compare indicadores entre estados lado a lado",
    targetSelector: 'a[href="#/comparativo"]',
    position: "right",
  },
  {
    title: "Dark Mode",
    description: "Alterne entre tema claro e escuro na barra lateral",
    targetSelector: 'button[title="Modo escuro"], button[title="Modo claro"]',
    position: "right",
  },
];

// ---------------------------------------------------------------------------
// Context + Hook
// ---------------------------------------------------------------------------

const TourContext = createContext<TourContextType>({
  tourCompleted: true,
  tourActive: false,
  startTour: () => {},
  resetTour: () => {},
});

export function useTour(): TourContextType {
  return useContext(TourContext);
}

// ---------------------------------------------------------------------------
// Spotlight Overlay (renders via portal)
// ---------------------------------------------------------------------------

const PADDING = 8;
const OVERLAY_Z = 99999;
const TOOLTIP_GAP = 14;
const ARROW_SIZE = 8;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetRect(selector: string): TargetRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

/** Compute tooltip position near the target, respecting viewport edges. */
function computeTooltipStyle(
  target: TargetRect,
  position: TooltipPosition,
  tooltipWidth: number,
  tooltipHeight: number
): React.CSSProperties {
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;

  let top = 0;
  let left = 0;

  switch (position) {
    case "right":
      top = target.top + target.height / 2 - tooltipHeight / 2;
      left = target.left + target.width + PADDING + TOOLTIP_GAP;
      break;
    case "left":
      top = target.top + target.height / 2 - tooltipHeight / 2;
      left = target.left - PADDING - TOOLTIP_GAP - tooltipWidth;
      break;
    case "bottom":
      top = target.top + target.height + PADDING + TOOLTIP_GAP;
      left = target.left + target.width / 2 - tooltipWidth / 2;
      break;
    case "top":
      top = target.top - PADDING - TOOLTIP_GAP - tooltipHeight;
      left = target.left + target.width / 2 - tooltipWidth / 2;
      break;
  }

  // Clamp inside viewport
  if (left < scrollX + 12) left = scrollX + 12;
  if (left + tooltipWidth > scrollX + vpW - 12)
    left = scrollX + vpW - 12 - tooltipWidth;
  if (top < scrollY + 12) top = scrollY + 12;
  if (top + tooltipHeight > scrollY + vpH - 12)
    top = scrollY + vpH - 12 - tooltipHeight;

  return { position: "absolute", top, left };
}

/** Arrow pointing from tooltip to target. */
function arrowStyle(position: TooltipPosition): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
  };
  switch (position) {
    case "right":
      return {
        ...base,
        top: "50%",
        left: -ARROW_SIZE,
        marginTop: -ARROW_SIZE,
        borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
        borderColor: "transparent var(--tour-bg) transparent transparent",
      };
    case "left":
      return {
        ...base,
        top: "50%",
        right: -ARROW_SIZE,
        marginTop: -ARROW_SIZE,
        borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
        borderColor: "transparent transparent transparent var(--tour-bg)",
      };
    case "bottom":
      return {
        ...base,
        left: "50%",
        top: -ARROW_SIZE,
        marginLeft: -ARROW_SIZE,
        borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
        borderColor: "transparent transparent var(--tour-bg) transparent",
      };
    case "top":
      return {
        ...base,
        left: "50%",
        bottom: -ARROW_SIZE,
        marginLeft: -ARROW_SIZE,
        borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
        borderColor: "var(--tour-bg) transparent transparent transparent",
      };
  }
}

interface SpotlightOverlayProps {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function SpotlightOverlay({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: SpotlightOverlayProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0,
  });

  // Measure target & position tooltip
  const reposition = useCallback(() => {
    const rect = getTargetRect(step.targetSelector);
    setTargetRect(rect);

    if (rect && tooltipRef.current) {
      const { offsetWidth, offsetHeight } = tooltipRef.current;
      const style = computeTooltipStyle(
        rect,
        step.position,
        offsetWidth,
        offsetHeight
      );
      setTooltipPos({ ...style, opacity: 1 });
    }
  }, [step]);

  // Initial positioning + scroll target into view
  useEffect(() => {
    const el = document.querySelector(step.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // Small delay to let scroll settle before measuring
    const t = setTimeout(reposition, 80);
    return () => clearTimeout(t);
  }, [step, reposition]);

  // Re-position on scroll/resize
  useEffect(() => {
    const handler = () => reposition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [reposition]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  // Spotlight "hole" via box-shadow
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: "absolute",
        top: targetRect.top - PADDING,
        left: targetRect.left - PADDING,
        width: targetRect.width + PADDING * 2,
        height: targetRect.height + PADDING * 2,
        borderRadius: 10,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
        zIndex: OVERLAY_Z,
        pointerEvents: "none" as const,
        transition: "all 0.3s ease-in-out",
      }
    : {};

  // Fallback when element not found: show tooltip centered
  const fallbackCenter: React.CSSProperties = !targetRect
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 1,
      }
    : {};

  return createPortal(
    <div
      style={
        {
          "--tour-bg": "#1e293b",
        } as React.CSSProperties
      }
    >
      {/* Click-blocker behind everything */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: OVERLAY_Z - 1,
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Spotlight cut-out */}
      {targetRect && <div style={spotlightStyle} />}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          ...(targetRect ? tooltipPos : fallbackCenter),
          zIndex: OVERLAY_Z + 1,
          width: 340,
          transition: "opacity 0.25s ease, top 0.3s ease, left 0.3s ease",
        }}
        className="rounded-xl shadow-2xl border border-white/10 bg-[#1e293b] text-white p-5 select-none"
      >
        {/* Arrow */}
        {targetRect && <div style={arrowStyle(step.position)} />}

        {/* Step counter */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
            Passo {currentIndex + 1} de {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Pular Tour
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full bg-white/10 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold mb-1">{step.title}</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-5">
          {step.description}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {isLast ? "Concluir" : "Proximo"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// TourGuiado (provider + overlay)
// ---------------------------------------------------------------------------

interface TourGuiadoProps {
  children: ReactNode;
}

export function TourGuiado({ children }: TourGuiadoProps) {
  const [tourCompleted, setTourCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-show on first visit (small delay so the DOM is painted)
  useEffect(() => {
    if (tourCompleted) return;
    const t = setTimeout(() => setTourActive(true), 800);
    return () => clearTimeout(t);
  }, [tourCompleted]);

  const completeTour = useCallback(() => {
    setTourActive(false);
    setCurrentStep(0);
    setTourCompleted(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    toast.success("Tour concluido! Explore a plataforma a vontade.", {
      description:
        "Voce pode reiniciar o tour a qualquer momento pelo seu perfil.",
      duration: 5000,
    });
  }, []);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const nextStep = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      completeTour();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, completeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setTourActive(true);
  }, []);

  const resetTour = useCallback(() => {
    setTourCompleted(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    startTour();
  }, [startTour]);

  // Keyboard navigation
  useEffect(() => {
    if (!tourActive) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          nextStep();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevStep();
          break;
        case "Escape":
          e.preventDefault();
          skipTour();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tourActive, nextStep, prevStep, skipTour]);

  return (
    <TourContext.Provider
      value={{ tourCompleted, tourActive, startTour, resetTour }}
    >
      {children}
      {tourActive && (
        <SpotlightOverlay
          step={TOUR_STEPS[currentStep]}
          currentIndex={currentStep}
          totalSteps={TOUR_STEPS.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
        />
      )}
    </TourContext.Provider>
  );
}

export default TourGuiado;
