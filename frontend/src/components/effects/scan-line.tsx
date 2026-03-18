interface ScanLineProps {
  active?: boolean;
  onHover?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ScanLine({
  active = false,
  onHover = false,
  children,
  className = "",
}: ScanLineProps) {
  const scanClass = active ? "scan-line" : onHover ? "scan-line-hover" : "";

  return <div className={`${scanClass} ${className}`}>{children}</div>;
}
