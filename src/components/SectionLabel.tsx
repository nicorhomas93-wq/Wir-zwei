import FlameHeart from './FlameHeart'
import SectionSymbol from './SectionSymbol'

interface SectionLabelProps {
  symbol: string
  className?: string
}

export default function SectionLabel({ symbol, className = '' }: SectionLabelProps) {
  return (
    <div className={`section-label-row ${className}`}>
      <FlameHeart variant="inline" />
      <SectionSymbol symbol={symbol} />
    </div>
  )
}
