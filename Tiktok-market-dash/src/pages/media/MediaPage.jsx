import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const mockMedia = [
  { id: 1, name: 'aura-pro-headphones-hero.jpg', type: 'image', size: '2.4 MB', dimensions: '2400×1600', used: 3, src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmtIBAqnV3xVGOhKGR86G4JCgusTMInAvvVILs0cooHHw7tjVptFxYICkZBi-ewy32VJRJrufRTAncXkKhYvN_0Sr825GD3sMbGlL9kKCpR-ieFmrTe7vzniKWTDeDgw7C1X8qrtJTl1oRdQ5dfRBsXemOWKuWMj63Idi9cpFLZLUy53iInF1DyuJlpEc8yOCyPN0r_B4NdcIoQRPbxFD01y6_4GVzrn7lXDo8OtJyM4KKoxgxzIOg' },
  { id: 2, name: 'chrono-m2-watch-main.jpg', type: 'image', size: '1.8 MB', dimensions: '2000×2000', used: 1, src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM5GtcuWM8jjj8O99wDQvraOUnU3rb2BTDK8wbqDteOWIB3X0vnkLaWZH0_5xvQtTIZUd1wwJjFAyx2ICRNW8EuYfarFqqKZxlHdh7xWc6xm0XQouSaQ4_f1ThxoBTutZhWPexmf2HuJx3fjN0Vd5Y9O6F03CINBbXiyKX9KlOVx_mesxfihYwJ_UyARez3oLlhe77gW7qlrwb-OrVtWINM7mhUISjusKqIQwymDPSdAxORabxPqPZ' },
  { id: 3, name: 'office-chair-banner.jpg', type: 'image', size: '3.1 MB', dimensions: '3000×1500', used: 2, src: null },
  { id: 4, name: 'keyboard-tkl-product.jpg', type: 'image', size: '1.2 MB', dimensions: '1800×1200', used: 0, src: null },
  { id: 5, name: 'monitor-27-lifestyle.jpg', type: 'image', size: '2.7 MB', dimensions: '2560×1440', used: 1, src: null },
  { id: 6, name: 'brand-logo-dark.svg', type: 'svg', size: '18 KB', dimensions: '—', used: 8, src: null },
];

const FILTERS = ['All', 'Images', 'SVG', 'Video', 'Documents'];

const MediaPage = () => {
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [dragging, setDragging] = useState(false);

  const filtered = mockMedia.filter((m) => {
    const matchFilter = filter === 'All' || m.type === filter.toLowerCase().replace('s', '').replace('vg', 'vg');
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-caps uppercase tracking-wider">Store</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-caps uppercase tracking-wider text-primary">Media</span>
          </div>
          <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Media Library</h2>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg text-body-sm font-medium hover:bg-surface-tint transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Upload Files
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
          ${dragging ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5'}`}
      >
        <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[28px] text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
        </div>
        <p className="text-body-md font-medium text-on-surface">Drop files here or <span className="text-primary">browse</span></p>
        <p className="text-body-sm text-on-surface-variant mt-1">Supports JPG, PNG, SVG, MP4, PDF — max 50MB</p>
        <div className="flex items-center gap-4 mt-4 text-label-caps text-on-surface-variant">
          <span>Used: 42.3 MB</span>
          <span className="w-1 h-1 rounded-full bg-outline" />
          <span>Limit: 5 GB</span>
          <span className="w-1 h-1 rounded-full bg-outline" />
          <span className="text-[#137333]">0.8% used</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex space-x-1 p-1 bg-surface-container-low rounded-lg border border-outline-variant/30">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-body-sm transition-colors ${filter === f ? 'bg-surface shadow-sm text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-[18px] transition-colors">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 rounded-lg py-1.5 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              placeholder="Search files..."
            />
          </div>
          <div className="flex p-1 gap-1 bg-surface-container-low border border-outline-variant/30 rounded-lg">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((file) => (
            <div
              key={file.id}
              onClick={() => toggleSelect(file.id)}
              className={`glass-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group
                ${selected.includes(file.id) ? 'ring-2 ring-primary' : ''}`}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-surface-container-low flex items-center justify-center relative overflow-hidden">
                {file.src ? (
                  <img src={file.src} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">image</span>
                )}
                {/* Selection checkbox */}
                <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                  ${selected.includes(file.id) ? 'bg-primary border-primary' : 'border-white/80 bg-white/20 opacity-0 group-hover:opacity-100'}`}>
                  {selected.includes(file.id) && (
                    <span className="material-symbols-outlined text-[14px] text-white">check</span>
                  )}
                </div>
                {/* Type badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium uppercase">
                  {file.type}
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-body-sm font-medium text-on-surface truncate">{file.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-label-caps text-outline">{file.size}</span>
                  {file.used > 0 && (
                    <span className="text-label-caps text-[#137333]">Used in {file.used}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                {['File', 'Type', 'Size', 'Dimensions', 'Used In', ''].map((h) => (
                  <th key={h} className="py-3 px-6 text-label-caps text-on-surface-variant uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/10">
              {filtered.map((file) => (
                <tr key={file.id} className="table-row-hover transition-all duration-200 cursor-pointer">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                        {file.src ? (
                          <img src={file.src} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-outline">image</span>
                        )}
                      </div>
                      <span className="font-medium text-on-surface">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-on-surface-variant uppercase text-label-caps">{file.type}</td>
                  <td className="py-3 px-6 font-mono text-on-surface-variant">{file.size}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{file.dimensions}</td>
                  <td className="py-3 px-6 text-on-surface-variant">{file.used > 0 ? `${file.used} product${file.used > 1 ? 's' : ''}` : '—'}</td>
                  <td className="py-3 px-6">
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant/50">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selection bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-6 py-3 flex items-center gap-4 shadow-xl border border-outline-variant/30">
          <span className="text-body-sm font-medium text-on-surface">{selected.length} selected</span>
          <div className="h-4 w-px bg-outline-variant/30" />
          <button className="flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>Download
          </button>
          <button className="flex items-center gap-1.5 text-body-sm text-error hover:text-error/80 transition-colors">
            <span className="material-symbols-outlined text-[18px]">delete</span>Delete
          </button>
          <button onClick={() => setSelected([])} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaPage;
