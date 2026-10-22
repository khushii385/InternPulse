import React from 'react';

export default function SkeletonGrid({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="skel-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 160 }} />
      ))}
    </div>
  );
}
