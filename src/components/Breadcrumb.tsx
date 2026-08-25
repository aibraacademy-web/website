import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? 'text-white font-semibold' : 'text-slate-400 font-medium'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
