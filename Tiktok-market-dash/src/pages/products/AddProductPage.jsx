import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants/routes';
import { API_BASE_URL } from '@/constants/config';
import { createProduct, fetchProductById, updateProduct } from '@/features/products/productsSlice';
import { uploadsService } from '@/services/settingsService';
import { aiService } from '@/services/aiService';
import ProductImage from '@/components/ui/ProductImage';

const steps = ['Basic Info', 'Pricing & Stock', 'Media', 'Review'];

const CATEGORY_OPTIONS = [
  'Electronics > Audio',
  'Electronics > Wearables',
  'Electronics > Peripherals',
  'Furniture > Office',
  'Accessories > Desk',
];

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

/** Module lock — prevents Strict Mode / double-click duplicate Gemini calls. */
let productAiInflight = null;

const AddProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const { actionStatus, error, selected } = useSelector((state) => state.products);
  const fileInputRef = useRef(null);
  const imageFileRef = useRef(null);
  const dirtyFieldsRef = useRef(new Set());

  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // idle|uploading|analyzing|success|error
  const [previewUrl, setPreviewUrl] = useState('');
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    highlights: '',
    keywords: '',
    productType: '',
    price: '',
    comparePrice: '',
    cost: '',
    stock: '',
    reorderPoint: '',
    status: 'Draft',
    image: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    dispatch(fetchProductById(id));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (!isEdit || !selected || selected.id !== id) return;
    setForm({
      name: selected.name || '',
      sku: selected.sku || '',
      category: selected.category || '',
      description: selected.description || '',
      highlights: '',
      keywords: '',
      productType: '',
      price: selected.price != null ? String(selected.price) : '',
      comparePrice: '',
      cost: selected.costPrice != null ? String(selected.costPrice) : '',
      stock: selected.stock != null ? String(selected.stock) : '',
      reorderPoint: selected.reorderLevel != null ? String(selected.reorderLevel) : '',
      status: selected.status || 'Draft',
      image: selected.image || '',
    });
    setPreviewUrl(selected.image ? resolveMediaUrl(selected.image) : '');
    dirtyFieldsRef.current = new Set();
  }, [isEdit, selected, id]);

  useEffect(
    () => () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const markDirty = (key) => {
    dirtyFieldsRef.current.add(key);
  };

  const update = (key, val, { userEdit = true } = {}) => {
    if (userEdit) markDirty(key);
    setForm((p) => ({ ...p, [key]: val }));
  };

  const inputClass =
    'w-full bg-surface border border-outline-variant/50 rounded-lg py-2.5 px-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm';

  const pickFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(String(file.type || '').toLowerCase())) {
      setAiError('Only JPEG, PNG, WebP, or GIF images are allowed.');
      setAiStatus('error');
      return;
    }
    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      setAiError(`Image must be ${maxMb}MB or smaller.`);
      setAiStatus('error');
      return;
    }
    imageFileRef.current = file;
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setAiError(null);
    setAiStatus('idle');
    setForm((p) => ({ ...p, image: '' }));
  };

  const uploadImage = async () => {
    const file = imageFileRef.current;
    if (!file && form.image) return form.image;
    if (!file) throw new Error('Upload a product image first.');
    setAiStatus('uploading');
    const uploaded = await uploadsService.uploadImage(file, 'products');
    const url = uploaded?.url;
    if (!url) throw new Error('Upload did not return an image URL.');
    update('image', url, { userEdit: false });
    setPreviewUrl(resolveMediaUrl(url));
    return url;
  };

  const applyAiProduct = (product) => {
    if (!product) return;
    const dirty = dirtyFieldsRef.current;
    const next = { ...form };

    if (!dirty.has('name') || !form.name.trim()) next.name = product.title || form.name;
    if (!dirty.has('description') || !form.description.trim()) {
      next.description = product.description || form.description;
    }
    if (!dirty.has('category') || !form.category.trim()) {
      next.category = product.category || form.category;
    }
    if (!dirty.has('productType') || !form.productType.trim()) {
      next.productType = product.productType || form.productType;
    }
    if (!dirty.has('highlights') || !form.highlights.trim()) {
      next.highlights = (product.highlights || []).join('\n');
    }
    if (!dirty.has('keywords') || !form.keywords.trim()) {
      next.keywords = (product.keywords || []).join(', ');
    }
    if ((!dirty.has('sku') || !form.sku.trim()) && product.suggestedSku) {
      next.sku = product.suggestedSku;
    }

    setForm(next);
  };

  const generateWithAi = async () => {
    setAiError(null);
    setFormError(null);

    if (productAiInflight) {
      try {
        await productAiInflight;
      } catch {
        /* prior error already surfaced */
      }
      return;
    }

    if (!imageFileRef.current && !form.image && !previewUrl) {
      setAiError('Upload a product image before generating with AI.');
      setAiStatus('error');
      setStep(2);
      return;
    }

    const run = (async () => {
      try {
        let imageUrl = form.image;
        if (imageFileRef.current || !imageUrl) {
          imageUrl = await uploadImage();
        }
        setAiStatus('analyzing');
        const result = await aiService.generateProductFromImage({
          file: imageFileRef.current || undefined,
          imageUrl,
        });
        applyAiProduct(result?.product);
        setAiStatus('success');
        setStep(0);
      } catch (err) {
        setAiStatus('error');
        setAiError(err?.message || 'AI generation failed. Please retry.');
      }
    })();

    productAiInflight = run.finally(() => {
      productAiInflight = null;
    });
    await productAiInflight;
  };

  const removeImage = () => {
    imageFileRef.current = null;
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    update('image', '', { userEdit: false });
    setAiStatus('idle');
    setAiError(null);
  };

  const composeDescription = () => {
    const parts = [form.description.trim()].filter(Boolean);
    const highlights = form.highlights
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    const keywords = form.keywords
      .split(/[,;\n]/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (highlights.length && !form.description.includes('Highlights:')) {
      parts.push(['Highlights:', ...highlights.map((h) => `• ${h}`)].join('\n'));
    }
    if (keywords.length && !form.description.includes('Keywords:')) {
      parts.push(`Keywords: ${keywords.join(', ')}`);
    }
    if (form.productType.trim() && !form.description.includes('Product type:')) {
      parts.push(`Product type: ${form.productType.trim()}`);
    }
    return parts.join('\n\n').slice(0, 5000) || undefined;
  };

  const submit = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.sku.trim() || !form.price) {
      setFormError('Name, SKU, and selling price are required.');
      setStep(0);
      return;
    }
    try {
      if (imageFileRef.current && !form.image) {
        await uploadImage();
      }
    } catch (err) {
      setFormError(err?.message || 'Image upload failed.');
      setStep(2);
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category || 'Uncategorized',
      description: composeDescription(),
      price: Number(form.price),
      costPrice: form.cost === '' ? null : Number(form.cost),
      stock: form.stock === '' ? 0 : Number.parseInt(form.stock, 10),
      reorderPoint: form.reorderPoint === '' ? 10 : Number.parseInt(form.reorderPoint, 10),
      status: form.status,
      image: form.image || undefined,
    };
    const result = isEdit
      ? await dispatch(updateProduct({ id, payload }))
      : await dispatch(createProduct(payload));
    if (createProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      const productId = result.payload?.id || id;
      navigate(productId ? `/dashboard/products/${productId}` : ROUTES.PRODUCTS);
      return;
    }
    setFormError(result.payload || error || 'Unable to save product.');
  };

  const busy = aiStatus === 'uploading' || aiStatus === 'analyzing';
  const categoryOptions =
    form.category && !CATEGORY_OPTIONS.includes(form.category)
      ? [form.category, ...CATEGORY_OPTIONS]
      : CATEGORY_OPTIONS;

  return (
    <div className="space-y-6 py-2 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="text-label-caps uppercase tracking-wider hover:text-primary transition-colors"
            >
              Products
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">
              {isEdit ? 'Edit Product' : 'New Product'}
            </span>
          </div>
          <h2 className="text-display-lg-mobile text-on-background">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setStep(2);
              generateWithAi();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-body-sm font-medium disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">
              {busy ? 'progress_activity' : 'auto_awesome'}
            </span>
            {aiStatus === 'uploading'
              ? 'Uploading…'
              : aiStatus === 'analyzing'
                ? 'Analyzing…'
                : 'Generate with AI'}
          </button>
        </div>
      </div>

      {(formError || error) && (
        <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm">
          {formError || error}
        </div>
      )}

      {aiError && (
        <div className="rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-body-sm flex items-start justify-between gap-3">
          <span>{aiError}</span>
          <button
            type="button"
            onClick={generateWithAi}
            className="shrink-0 text-primary font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {aiStatus === 'success' && !aiError && (
        <div className="rounded-lg border border-success-border bg-success-bg text-success px-4 py-3 text-body-sm">
          AI draft applied. Review and edit fields before saving — nothing is published until you
          confirm.
        </div>
      )}

      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-semibold shrink-0 transition-colors ${
                    i < step
                      ? 'bg-success text-on-primary'
                      : i === step
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {i < step ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-body-sm font-medium hidden sm:block ${
                    i === step
                      ? 'text-primary'
                      : i < step
                        ? 'text-success'
                        : 'text-on-surface-variant'
                  }`}
                >
                  {s}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded-full ${
                    i < step ? 'bg-success' : 'bg-outline-variant/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-5">Product Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Product Name <span className="text-error">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Aura Pro Noise Cancelling Headphones"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    SKU
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => update('sku', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. AUR-PRO-NC-BLK"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category...</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Product type
                </label>
                <input
                  value={form.productType}
                  onChange={(e) => update('productType', e.target.value)}
                  className={inputClass}
                  placeholder="Suggested by AI (editable)"
                />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className={inputClass + ' resize-none'}
                  placeholder="Describe your product in detail..."
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={generateWithAi}
                  className="mt-2 flex items-center gap-1.5 text-body-sm text-primary hover:text-primary-fixed-variant transition-colors disabled:opacity-60"
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  {busy ? 'Generating…' : 'Generate with AI'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={form.highlights}
                    onChange={(e) => update('highlights', e.target.value)}
                    className={inputClass + ' resize-none'}
                    placeholder="One highlight per line"
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                    Keywords
                  </label>
                  <textarea
                    rows={3}
                    value={form.keywords}
                    onChange={(e) => update('keywords', e.target.value)}
                    className={inputClass + ' resize-none'}
                    placeholder="Comma-separated keywords"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Status
                </label>
                <div className="flex gap-3">
                  {['Draft', 'Active'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('status', s)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-body-sm font-medium transition-colors ${
                        form.status === s
                          ? 'bg-primary-container border-primary text-on-primary-container'
                          : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant/30'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${s === 'Active' ? 'bg-success' : 'bg-outline'}`}
                      />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-sm">
                      $
                    </span>
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
              <div className="mt-4 p-3 bg-success-bg border border-success-border rounded-lg flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[16px] text-success"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trending_up
                </span>
                <span className="text-body-sm text-success">
                  Profit margin:{' '}
                  <strong>
                    {Math.round(((form.price - form.cost) / form.price) * 100)}%
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-headline-md text-on-background mb-5">Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => update('stock', e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant uppercase mb-1.5">
                  Reorder Point
                </label>
                <input
                  type="number"
                  value={form.reorderPoint}
                  onChange={(e) => update('reorderPoint', e.target.value)}
                  className={inputClass}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-headline-md text-on-background mb-5">Product Images</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="w-full max-h-80 object-contain bg-surface"
                />
                {busy && (
                  <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[28px] text-primary animate-spin">
                      progress_activity
                    </span>
                    <p className="text-body-sm text-on-surface">
                      {aiStatus === 'uploading' ? 'Uploading image…' : 'Analyzing with AI…'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border border-outline-variant/50 text-body-sm hover:bg-surface-variant/30 disabled:opacity-60"
                >
                  Replace image
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={removeImage}
                  className="px-4 py-2 rounded-lg border border-error/30 text-body-sm text-error hover:bg-error/5 disabled:opacity-60"
                >
                  Remove
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={generateWithAi}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint disabled:opacity-60 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  {busy ? 'Working…' : 'Generate with AI'}
                </button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
              ${dragging ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5'}`}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mb-4">
                <span
                  className="material-symbols-outlined text-[28px] text-on-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_photo_alternate
                </span>
              </div>
              <p className="text-body-md font-medium text-on-surface">
                Drop images here or <span className="text-primary">browse</span>
              </p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                JPG, PNG, WebP, GIF — max 5MB
              </p>
              <p className="text-label-caps text-outline mt-3">
                Recommended: 2000×2000px, white background
              </p>
            </div>
          )}

          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2">
            <span
              className="material-symbols-outlined text-[18px] text-primary shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <div>
              <p className="text-label-caps text-primary font-semibold uppercase">
                AI product draft
              </p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Upload a photo, then Generate with AI to draft title, description, category, and
                keywords. You always review and save manually.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-panel rounded-xl p-6 space-y-5">
          <h3 className="text-headline-md text-on-background">Review Product</h3>
          {(previewUrl || form.image) && (
            <ProductImage
              src={previewUrl || form.image}
              name={form.name}
              size="review"
              lazy={false}
            />
          )}
          <div className="divide-y divide-outline-variant/10">
            {[
              { label: 'Product Name', value: form.name || '—' },
              { label: 'SKU', value: form.sku || '—' },
              { label: 'Category', value: form.category || '—' },
              { label: 'Selling Price', value: form.price ? `$${form.price}` : '—' },
              { label: 'Cost per Item', value: form.cost ? `$${form.cost}` : '—' },
              { label: 'Stock', value: form.stock || '—' },
              { label: 'Status', value: form.status },
              { label: 'Image', value: form.image ? 'Attached' : 'None' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3">
                <span className="text-body-sm text-on-surface-variant">{label}</span>
                <span className="text-body-sm font-medium text-on-surface text-right max-w-[60%]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate(ROUTES.PRODUCTS) : setStep((s) => s - 1))}
          className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant/50 rounded-lg text-body-sm text-on-surface hover:bg-surface-variant/30 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm"
          >
            Continue
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={actionStatus === 'loading' || busy}
            onClick={submit}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            {actionStatus === 'loading' ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddProductPage;
