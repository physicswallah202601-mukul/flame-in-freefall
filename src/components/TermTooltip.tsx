import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { GLOSSARY_TERMS, type GlossaryTermId } from '../data/glossaryTerms';

interface TermTooltipProps {
  termKey: GlossaryTermId;
  label?: string;
  className?: string;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ termKey, label, className = '' }) => {
  const [openByClick, setOpenByClick] = useState(false);
  const [openByHover, setOpenByHover] = useState(false);
  const [openByFocus, setOpenByFocus] = useState(false);
  const [shiftX, setShiftX] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const entry = GLOSSARY_TERMS[termKey];

  const isOpen = openByClick || openByHover || openByFocus;

  useLayoutEffect(() => {
    if (!isOpen || !tooltipRef.current) {
      setShiftX(0);
      return;
    }
    const rect = tooltipRef.current.getBoundingClientRect();
    const margin = 12;
    let delta = 0;
    if (rect.right > window.innerWidth - margin) {
      delta = window.innerWidth - margin - rect.right;
    } else if (rect.left < margin) {
      delta = margin - rect.left;
    }
    if (delta !== 0) {
      setShiftX((prev) => prev + delta);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const closeAll = () => {
      setOpenByClick(false);
      setOpenByHover(false);
      setOpenByFocus(false);
    };

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeAll();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAll();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-baseline ${className}`}
      onMouseEnter={() => setOpenByHover(true)}
      onMouseLeave={() => setOpenByHover(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenByClick((prev) => !prev);
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(':focus-visible')) {
            setOpenByFocus(true);
          }
        }}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOpenByFocus(false);
          }
        }}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="inline-flex items-center gap-1 border-b border-dotted border-cyan-400/80 font-semibold text-cyan-200 hover:text-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xs cursor-help"
      >
        <span>{label ?? entry.symbol}</span>
        <HelpCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={shiftX !== 0 ? { transform: `translateX(${shiftX}px)` } : undefined}
          className="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-1.5rem)] sm:w-72 border border-cyan-500/60 bg-[#0B1120] p-3 text-left font-sans text-xs font-normal normal-case tracking-normal text-slate-200 shadow-xl"
        >
          <span className="block font-mono text-xs font-semibold tracking-wider text-cyan-300">
            <span>{entry.symbol}</span>{' '}
            <span className="uppercase">· {entry.shortLabel}</span>
          </span>
          <span className="mt-1 block leading-relaxed text-slate-200">{entry.definition}</span>
          <span className="mt-1.5 block font-mono text-[11px] text-slate-300">
            Source: {entry.sourceRef}
          </span>
        </span>
      )}
    </span>
  );
};
