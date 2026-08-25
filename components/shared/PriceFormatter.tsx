interface PriceFormatterProps {
  amount?: number;
  className?: string;
}

export const PriceFormatter = ({ amount = 0, className }: PriceFormatterProps) => {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

  return <span className={className}>{formattedPrice}</span>;
};
