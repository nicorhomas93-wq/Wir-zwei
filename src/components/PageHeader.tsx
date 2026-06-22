import SectionLabel from './SectionLabel'

interface PageHeaderProps {
  symbol: string
  title: string
  subtitle: string
}

export default function PageHeader({ symbol, title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header">
      <SectionLabel symbol={symbol} />
      <h1 className="text-xl title-calm">{title}</h1>
      <p className="text-subtitle mt-2.5">{subtitle}</p>
    </header>
  )
}
