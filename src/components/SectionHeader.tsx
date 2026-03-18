interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  subtitleClassName?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  light,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <div className="mb-16 text-center">
      <h2
        className={`font-heading text-3xl font-bold md:text-4xl lg:text-5xl ${
          light ? "text-sand" : "text-forest"
        }`}
      >
        {title}
      </h2>
      <div className="mx-auto mt-5 flex items-center justify-center gap-3">
        <div
          className={`h-[1px] w-8 ${
            light
              ? "bg-gradient-to-r from-transparent to-gold/40"
              : "bg-gradient-to-r from-transparent to-gold/30"
          }`}
        />
        <div className="h-1.5 w-1.5 rounded-full bg-gold/50" />
        <div
          className={`h-[1px] w-8 ${
            light
              ? "bg-gradient-to-l from-transparent to-gold/40"
              : "bg-gradient-to-l from-transparent to-gold/30"
          }`}
        />
      </div>
      {subtitle && (
        <p
          className={`mx-auto mt-5 max-w-lg leading-relaxed ${
            subtitleClassName ?? "text-[15px]"
          } ${light ? "text-sand/45" : "text-clay-light"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
