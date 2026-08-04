import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const steps = ['Basic Info', 'Pricing & Stock', 'Media', 'Review'];

const AddProductPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', category: '', description: '',
    price: '', comparePrice: '', cost: '',
    stock: '', reorderPoint: '',
    status: 'Draft',
  });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const inputClass = 'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm';

  return (
    <div className="space-y-6 py-2 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button onClick={() => navigate(ROUTES.PRODUCTS)} className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors">Products</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">New Product</span>
          </div>
          <h2 className="text-display-lg-mobile text-on-background">Add Product</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-body-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            AI Generate
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-semibold shrink-0 transition-colors ${
                  i < step ? 'bg-[#137333] text-white' :
                  i === step ? 'bg-primary text-on-primary' :
                  'bg-surface-container text-on-surface-variant'
                }`}>
                  {i < step ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
                </div>
                <span className={`text-body-sm font-medium hidden sm:block ${i === step ? 'text-primary' : i < step ? 'text-[#137333]' : 'text-on-surface-variant'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full ${i < step ? 'bg-[#137333]' : 'bg-outline-variant/30'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-5">Product Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Product Name <span className="text-error">*</span></label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="e.g. Aura Pro Noise Cancelling Headphones" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">SKU</label>
                  <input value={form.sku} onChange={(e) => update('sku', e.target.value)} className={inputClass} placeholder="e.g. AUR-PRO-NC-BLK" />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
                    <option value="">Select category...</option>
                    <option>Electronics &gt; Audio</option>
                    <option>Electronics &gt; Wearables</option>
                    <option>Electronics &gt; Peripherals</option>
                    <option>Furniture &gt; Office</option>
                    <option>Accessories &gt; Desk</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className={inputClass + ' resize-none'}
                  placeholder="Describe your product in detail..."
                />
                {/* AI Assist */}
                <button className="mt-2 flex items-center gap-1.5 text-body-sm text-primary hover:text-primary-fixed-variant transition-colors">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Generate with AI
                </button>
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Status</label>
                <div className="flex gap-3">
                  {['Draft', 'Active'].map((s) => (
                    <button
                      key={s}
                      onClick={() => update('status', s)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-body-sm font-medium transition-colors ${
                        form.status === s
                          ? 'bg-primary-container border-primary text-on-primary-container'
                          : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant/30'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${s === 'Active' ? 'bg-[#137333]' : 'bg-outline'}`} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Pricing & Stock */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-5">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'price', label: 'Selling Price', placeholder: '0.00', required: true },
                { key: 'comparePrice', label: 'Compare at Price', placeholder: '0.00' },
                { key: 'cost', label: 'Cost per Item', placeholder: '0.00' },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    {label} {required && <span className="text-error">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-sm">$</span>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className={inputClass + ' pl-7'}
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
            {form.price && form.cost && (
              <div className="mt-4 p-3 bg-[#e6f4ea] border border-[#ceead6] rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#137333]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                <span className="text-body-sm text-[#137333]">
                  Profit margin: <strong>{Math.round(((form.price - form.cost) / form.price) * 100)}%</strong>
                </span>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-5">Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Stock Quantity</label>
                <input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">Reorder Point</label>
                <input type="number" value={form.reorderPoint} onChange={(e) => update('reorderPoint', e.target.value)} className={inputClass} placeholder="10" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Media */}
      {step === 2 && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-headline-md text-on-background mb-5">Product Images</h3>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); }}
            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
              ${dragging ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5'}`}
          >
            <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>add_photo_alternate</span>
            </div>
            <p className="text-body-md font-medium text-on-surface">Drop images here or <span className="text-primary">browse</span></p>
            <p className="text-body-sm text-on-surface-variant mt-1">JPG, PNG, WebP — max 10MB per file</p>
            <p className="text-label-caps text-outline mt-3">Recommended: 2000×2000px, white background</p>
          </div>

          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div>
              <p className="text-label-caps text-primary font-semibold uppercase">AI Image Enhancement</p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">AI can automatically remove backgrounds, enhance lighting, and optimize your product images for e-commerce.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="glass-panel rounded-xl p-6 space-y-5">
          <h3 className="text-headline-md text-on-background">Review Product</h3>
          <div className="divide-y divide-outline-variant/10">
            {[
              { label: 'Product Name', value: form.name || '—' },
              { label: 'SKU', value: form.sku || '—' },
              { label: 'Category', value: form.category || '—' },
              { label: 'Selling Price', value: form.price ? `$${form.price}` : '—' },
              { label: 'Stock', value: form.stock || '—' },
              { label: 'Status', value: form.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3">
                <span className="text-body-sm text-on-surface-variant">{label}</span>
                <span className="text-body-sm font-medium text-on-surface">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step === 0 ? navigate(ROUTES.PRODUCTS) : setStep((s) => s - 1)}
          className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            Continue
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Create Product
          </button>
        )}
      </div>
    </div>
  );
};

export default AddProductPage;
