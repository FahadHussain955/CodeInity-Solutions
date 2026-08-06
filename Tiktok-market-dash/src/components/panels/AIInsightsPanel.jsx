import { useEffect } from 'react';

const AIInsightsPanel = ({ isOpen, onClose }) => {
  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const insights = [
    {
      category: 'Growth Opportunities',
      icon: 'trending_up',
      color: 'text-[#137333]',
      bg: 'bg-[#e6f4ea]',
      items: [
        'Scale "Summer Sale" campaign: ROAS is 4.2x above average.',
        'Target "Lookalike Audience US" for TikTok Shop.',
      ],
    },
    {
      category: 'Budget Optimisation',
      icon: 'payments',
      color: 'text-[#b06000]',
      bg: 'bg-[#fef3c7]',
      items: [
        'Pause "Underperforming Ad Group 3" to save $120/day.',
        'Reallocate budget to TikTok catalog sales.',
      ],
    },
    {
      category: 'Inventory Alerts',
      icon: 'warehouse',
      color: 'text-error',
      bg: 'bg-error-container',
      items: [
        'SKU-1029 (Wireless Earbuds) is running low on stock.',
        'Reorder needed for Top Selling Bundle.',
      ],
    },
    {
      category: 'Product Recommendations',
      icon: 'inventory_2',
      color: 'text-primary',
      bg: 'bg-primary-container',
      items: [
        'Bundle "Smart Watch" with "Screen Protector" for higher AOV.',
        'Optimize product descriptions for TikTok SEO.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-headline-md text-on-background">AI Insights</h2>
              <p className="text-label-caps text-on-surface-variant">Powered by GrowthAI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          <div className="p-4 bg-primary-container/30 border border-primary/20 rounded-xl">
            <h4 className="text-body-sm font-semibold text-primary mb-1">Sales Forecast</h4>
            <p className="text-body-sm text-on-surface-variant">Projected revenue for this week is <span className="font-semibold text-on-surface">$14,500</span> (+12% vs last week).</p>
          </div>

          {insights.map((group, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${group.bg} ${group.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{group.icon}</span>
                </div>
                <h3 className="text-body-md font-semibold text-on-surface">{group.category}</h3>
              </div>
              <ul className="space-y-3 pl-[40px]">
                {group.items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-body-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/50 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-t border-outline-variant/20 pt-6">
             <h3 className="text-body-md font-semibold text-on-surface mb-3">AI Action Items</h3>
             <button className="w-full text-left px-4 py-3 rounded-lg border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group">
                <div>
                  <p className="text-body-sm font-medium text-on-surface">Auto-optimize Campaigns</p>
                  <p className="text-label-caps text-on-surface-variant">Apply suggested budget changes</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
