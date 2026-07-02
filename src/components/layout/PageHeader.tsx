interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="border-b mb-8" style={{ borderColor: '#D4E4F0' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {badge && (
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: '#E8F4FD', color: '#1B2E4B' }}
          >
            {badge}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1B2840' }}>{title}</h1>
        {description && (
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#5C6F8A' }}>{description}</p>
        )}
      </div>
    </div>
  );
}
