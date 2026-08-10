import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import type { Component } from '../../types';
import { CategoryBadge } from '../ui/Badge';

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component: c }: ComponentCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="component-card"
      onClick={() => navigate(`/component/${c.id}`)}
      id={`component-card-${c.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/component/${c.id}`)}
      aria-label={`${c.name}, quantity ${c.quantity}`}
    >
      {/* Image */}
      <div className="component-card-img">
        {c.image_urls && c.image_urls.length > 0 ? (
          <img src={c.image_urls[0]} alt={c.name} loading="lazy" />
        ) : (
          <div className="component-card-img-placeholder">
            <Package size={36} strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="component-card-body">
        <div className="component-card-name">{c.name}</div>
        <div className="component-card-tags">
          <CategoryBadge category={c.category} />
        </div>
      </div>

      {/* Footer */}
      <div className="component-card-footer">
        <div className="quantity-display">
          <span className="quantity-value">{c.quantity}</span>
          <span className="quantity-unit">{c.unit}</span>
        </div>
      </div>
    </article>
  );
}
