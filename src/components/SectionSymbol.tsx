interface SectionSymbolProps {
  symbol: string
  className?: string
}

export default function SectionSymbol({ symbol, className = '' }: SectionSymbolProps) {
  return (
    <span className={`section-symbol ${className}`} aria-hidden>
      {symbol}
    </span>
  )
}
