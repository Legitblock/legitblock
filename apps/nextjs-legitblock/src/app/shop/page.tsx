'use client';

import React, { useState, useEffect } from 'react';
import {
  trackPageView,
  trackLegalShopAddToCart,
  trackLegalShopCheckout,
} from '@/lib/telemetry';
import {
  ShoppingBag,
  ShieldCheck,
  FileCheck2,
  Stamp,
  BookMarked,
  Scale,
  KeyRound,
  Check,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  Layers,
} from 'lucide-react';

interface LegalProduct {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  price: number;
  category: 'kit' | 'seal' | 'binder' | 'securities' | 'hardware';
  isDigital: boolean;
  specs: string[];
  inStock: boolean;
  badge?: string;
}

const LEGAL_CATALOG: LegalProduct[] = [
  {
    id: 'prod_delaware_ccorp_kit',
    sku: 'KIT-DE-CCORP-2026',
    title: 'Delaware C-Corporation Legal Formation & Governance Suite',
    subtitle: 'Exhaustive Delaware Secretary of State incorporation package, certified corporate bylaws, founder restricted stock agreements, and 83(b) tax packages.',
    price: 199.0,
    category: 'kit',
    isDigital: true,
    badge: 'Founder Essential',
    specs: [
      'Delaware Division of Corporations Filing Articles',
      'Organizational Board Minutes & Bylaws Pack',
      'Confidential Information & Invention Assignment (CIIA)',
      'Instant SeaweedFS Encrypted Vault Download',
    ],
    inStock: true,
  },
  {
    id: 'prod_corp_seal_embosser',
    sku: 'SEAL-BRASS-EMBOSSER',
    title: 'Executive Corporate Seal & Heavy-Duty Brass Embosser',
    subtitle: 'Custom laser-engraved 2-inch solid brass die featuring your exact corporate entity name, state of incorporation, and year of founding in cast-iron frame.',
    price: 89.0,
    category: 'seal',
    isDigital: false,
    badge: 'Custom Engraved',
    specs: [
      'Custom Laser-Engraved Solid Brass Seal Die',
      'Heavy-Duty Ergonomic Cast-Iron Hand Press',
      'High-Pressure Clean Embossing up to 100lb Bond',
      'Velvet Protective Travel & Archival Pouch',
    ],
    inStock: true,
  },
  {
    id: 'prod_stock_cert_folio',
    sku: 'FOLIO-MINBOOK-ARCHIVAL',
    title: 'Archival Stock Certificate Folio & Minute Book Binder',
    subtitle: 'Handcrafted corporate record binder with 24-carat gold foil titling, heavy slipcase, and 25 serialized anti-counterfeit stock certificates.',
    price: 129.0,
    category: 'binder',
    isDigital: false,
    badge: 'Archival Quality',
    specs: [
      'Hardbound Vegan Leather Binder with Custom Slipcase',
      '25 Numbered Stock Certificates with Micro-Print Borders',
      'Mylar-Reinforced Tab Dividers for Board Minutes',
      'Incorporation & Shareholder Stock Transfer Ledger',
    ],
    inStock: true,
  },
  {
    id: 'prod_sec_506b_safe_templates',
    sku: 'SAFE-SEC506B-FIN',
    title: 'SEC Rule 506(b) / 506(c) Private Placement & Post-Money SAFE Suite',
    subtitle: 'YC-standard post-money SAFE contracts with valuation cap & discount variations, accredited investor questionnaires, and Form D filing checklist.',
    price: 249.0,
    category: 'securities',
    isDigital: true,
    badge: 'Venture Ready',
    specs: [
      'Post-Money SAFE (Valuation Cap & Discount Versions)',
      'Accredited Investor Verification Pack (Rule 506(c))',
      'Pro-Rata Rights Side Letter & Information Agreements',
      'Automated Cap Table Model with Dilution Modeling',
    ],
    inStock: true,
  },
  {
    id: 'prod_hsm_governance_key',
    sku: 'HSM-GOV-FIPS140',
    title: 'FIPS 140-3 Hardware Key for On-Chain Corporate Governance',
    subtitle: 'Cryptographic secure element token for signing corporate resolutions, authorizing treasury multi-sig operations, and casting immutable blockchain votes.',
    price: 75.0,
    category: 'hardware',
    isDigital: false,
    badge: 'FIPS 140-3',
    specs: [
      'NIST FIPS 140-3 Level 3 Cryptographic Hardware',
      'Dual Contact USB-C and Contactless NFC Support',
      'Physical Capacitive Touch Button for Transaction Authorization',
      'Direct LegitBlock Ledger Multi-Sig Compatibility',
    ],
    inStock: true,
  },
];

interface CartItem {
  product: LegalProduct;
  quantity: number;
}

export default function LegalShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const addToCart = (product: LegalProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    trackLegalShopAddToCart({
      title: product.title,
      sku: product.sku,
      price: product.price,
      category: product.category,
    });

    setIsCartOpen(true);
  };

  useEffect(() => {
    trackPageView('LegitBlock Corporate Formation & Legal Hardware Store');
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const hasPhysical = cart.some((item) => !item.product.isDigital);
  const shipping = hasPhysical && cart.length > 0 ? 15.0 : 0.0;
  const estimatedTax = subtotal * 0.075;
  const grandTotal = subtotal + shipping + estimatedTax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerEmail) {
      setCheckoutError('Please enter your corporate email address for order confirmation.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const items = cart.map((item) => ({
        id: item.product.id,
        sku: item.product.sku,
        title: item.product.title,
        unitPriceUsd: item.product.price,
        quantity: item.quantity,
        isDigital: item.product.isDigital,
      }));

      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail,
          customerName: customerName || undefined,
          shippingAddress: hasPhysical ? shippingAddress : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      if (data.checkoutUrl) {
        trackLegalShopCheckout({
          orderId: data.sessionId || `legit_ord_${Date.now()}`,
          totalUsd: grandTotal,
          customerEmail,
          items,
        });

        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from Billama');
      }
    } catch (err: any) {
      setCheckoutError(err.message || String(err));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">LEGITBLOCK STORE</span>
              <span className="text-xs text-emerald-400 block -mt-1 font-mono uppercase tracking-wider">Corporate Formation & Hardware</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Billama MoR Protected &bull; Card / Solana Pay / Grid Credits</span>
            </div>

            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                  {cart.reduce((total, i) => total + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal E-Commerce Checkout Powered by Billama</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Corporate Incorporation &amp; Governance Kits
        </h1>
        <p className="mt-3 text-slate-400 max-w-2xl text-base sm:text-lg leading-relaxed">
          Launch your Delaware C-Corporation with gold-standard legal templates, official laser-engraved
          brass seals, archival stock folios, and cryptographic hardware tokens for on-chain voting.
        </p>
      </div>

      {/* Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LEGAL_CATALOG.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest">
                      {product.sku}
                    </span>
                    {product.badge && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition">
                    {product.category === 'kit' && <FileCheck2 className="w-6 h-6" />}
                    {product.category === 'seal' && <Stamp className="w-6 h-6" />}
                    {product.category === 'binder' && <BookMarked className="w-6 h-6" />}
                    {product.category === 'securities' && <Scale className="w-6 h-6" />}
                    {product.category === 'hardware' && <KeyRound className="w-6 h-6" />}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {product.subtitle}
                  </p>

                  <div className="mt-6 space-y-2 border-t border-slate-800/80 pt-4">
                    {product.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-mono">Price</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full shadow-2xl">
            {/* Cart Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Your Order</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {cart.reduce((tot, i) => tot + i.quantity, 0)} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                &times;
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Your cart is empty.</p>
                  <p className="text-xs mt-1 text-slate-600">Select formation kits or hardware above to begin.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-mono">{item.product.sku}</div>
                      <div className="font-semibold text-sm text-white line-clamp-1">
                        {item.product.title}
                      </div>
                      <div className="text-emerald-400 font-mono text-sm font-bold mt-1">
                        ${item.product.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-750 rounded-lg bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:text-emerald-400 text-slate-400 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:text-emerald-400 text-slate-400 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Checkout Form */}
              {cart.length > 0 && (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Corporate Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="incorporator@company.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Entity / Founder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Technologies Inc."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {hasPhysical && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Physical Delivery Address (Brass Seal &amp; Folio)</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Street Address"
                        value={shippingAddress.line1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          required
                          placeholder="State (e.g. DE, CA)"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Postal Code"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          disabled
                          value="United States"
                          className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-750 text-sm text-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  {checkoutError && (
                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
                      {checkoutError}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {hasPhysical && (
                    <div className="flex justify-between text-slate-400">
                      <span>Insured Courier Shipping</span>
                      <span className="font-mono text-white">${shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Sales Tax</span>
                    <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total Due</span>
                    <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-98"
                >
                  {isCheckingOut ? (
                    <span>Opening Billama Gateway...</span>
                  ) : (
                    <>
                      <span>Proceed to Billama MoR Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>PCI-DSS SAQ-A Certified &bull; Merchant of Record by Billama</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>&copy; {new Date().getFullYear()} LegitBlock Governance Inc. Built on Billama Cloud, FreeIPA, &amp; SeaweedFS.</p>
      </footer>
    </div>
  );
}
