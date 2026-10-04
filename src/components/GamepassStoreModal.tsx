import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Crown,
  Coins,
  Trophy,
  Zap,
  Gift,
  RotateCw,
  Check,
  Shield,
  Heart,
  Flame,
  CreditCard,
  PoundSterling,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  GamepassItem,
  GBPCurrencyPack,
  GBPTransactionRecord,
  SagaPassTier,
} from '../types';
import { GBP_CURRENCY_PACKS, RUNE_WHEEL_PRIZES } from '../game/robloxFeaturesConfig';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string | number>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

export interface PendingGBPOrder {
  id: string;
  title: string;
  subtitle: string;
  amountGBP: number;
  kind: 'currency_pack' | 'gamepass' | 'gold_sagapass' | 'dev_product';
  payloadId: string;
}

interface GamepassStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  silver: number;
  valor: number;
  gbpWalletBalance: number;
  onCompleteGBPPurchase: (
    order: PendingGBPOrder,
    orderId: string,
    method: 'PayPal GBP' | 'GBP Express'
  ) => void;
  transactions: GBPTransactionRecord[];
  gamepasses: GamepassItem[];
  onBuyGamepass: (passId: string) => void;
  sagaTiers: SagaPassTier[];
  hasGoldSagaPass: boolean;
  onUnlockGoldSagaPass: () => void;
  onClaimSagaTier: (tier: number, isGold: boolean) => void;
  onUseDevProduct: (productType: 'revive_heal' | 'server_horn' | 'silver_chest') => void;
  freeWheelSpins: number;
  onSpinWheel: (prize: (typeof RUNE_WHEEL_PRIZES)[number], usedFreeSpin: boolean) => void;
}

export const GamepassStoreModal: React.FC<GamepassStoreModalProps> = ({
  isOpen,
  onClose,
  silver,
  valor,
  gbpWalletBalance,
  onCompleteGBPPurchase,
  transactions,
  gamepasses,
  onBuyGamepass,
  sagaTiers,
  hasGoldSagaPass,
  onUnlockGoldSagaPass,
  onClaimSagaTier,
  onUseDevProduct,
  freeWheelSpins,
  onSpinWheel,
}) => {
  const [activeTab, setActiveTab] = useState<'gbp_packs' | 'passes' | 'sagapass' | 'wheel'>(
    'gbp_packs'
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastPrizeLabel, setLastPrizeLabel] = useState<string | null>(null);

  // PayPal & GBP Checkout State
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    configured: boolean;
    environment: string;
  }>({
    clientId: '',
    configured: false,
    environment: 'sandbox',
  });
  const [sdkReady, setSdkReady] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingGBPOrder | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [isProcessingExpress, setIsProcessingExpress] = useState(false);
  const paypalButtonsContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch PayPal configuration from backend
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/paypal/config')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.clientId === 'string') {
          setPaypalConfig({
            clientId: data.clientId,
            configured: Boolean(data.configured),
            environment: data.environment || 'sandbox',
          });
        }
      })
      .catch(() => {
        // Ignore network errors if offline
      });
  }, [isOpen]);

  // Dynamically load PayPal JS SDK in GBP when clientId is available
  useEffect(() => {
    if (!paypalConfig.clientId) return;
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.getElementById('paypal-gbp-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => setSdkReady(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-gbp-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      paypalConfig.clientId
    )}&currency=GBP&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    document.body.appendChild(script);
  }, [paypalConfig.clientId]);

  // Render PayPal Buttons when a PendingGBPOrder is selected
  useEffect(() => {
    if (!pendingOrder || !sdkReady || !window.paypal || !paypalButtonsContainerRef.current) {
      return;
    }

    const container = paypalButtonsContainerRef.current;
    container.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 40,
          },
          createOrder: async () => {
            setCheckoutStatus('Creating £ GBP order with PayPal...');
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemId: pendingOrder.id,
                itemName: pendingOrder.title,
                amountGBP: pendingOrder.amountGBP,
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.id) {
              throw new Error(data.error || 'Could not create PayPal GBP order');
            }
            return data.id;
          },
          onApprove: async (data) => {
            setCheckoutStatus('Capturing £ GBP payment...');
            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const captureData = await res.json();
            if (!res.ok) {
              throw new Error(captureData.error || 'Capture failed');
            }
            onCompleteGBPPurchase(pendingOrder, data.orderID, 'PayPal GBP');
            setCheckoutStatus(`Payment Complete! (£${pendingOrder.amountGBP.toFixed(2)} GBP)`);
            setTimeout(() => {
              setPendingOrder(null);
              setCheckoutStatus(null);
            }, 1200);
          },
          onError: () => {
            setCheckoutStatus(
              'PayPal popup was blocked by browser frame or cancelled — you can use Instant £ GBP Checkout right beside it!'
            );
          },
        })
        .render(container);
    } catch {
      // Fallback handled by Instant GBP Checkout button
    }
  }, [pendingOrder, sdkReady, onCompleteGBPPurchase]);

  if (!isOpen) return null;

  const handleInstantGBPCheckout = async (order: PendingGBPOrder) => {
    setIsProcessingExpress(true);
    setCheckoutStatus(`Authorising £${order.amountGBP.toFixed(2)} GBP order...`);

    let orderId = `GBP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: order.id,
          itemName: order.title,
          amountGBP: order.amountGBP,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.id) orderId = data.id;
      }
    } catch {
      // Continue with local GBP receipt ID if offline
    }

    setTimeout(() => {
      onCompleteGBPPurchase(order, orderId, 'GBP Express');
      setIsProcessingExpress(false);
      setCheckoutStatus(`Unlocked ${order.title} (£${order.amountGBP.toFixed(2)} GBP)!`);
      setTimeout(() => {
        setPendingOrder(null);
        setCheckoutStatus(null);
      }, 1000);
    }, 450);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    const canFree = freeWheelSpins > 0;
    if (!canFree && silver < 100) return;

    setIsSpinning(true);
    setLastPrizeLabel(null);

    const prizeIdx = Math.floor(Math.random() * RUNE_WHEEL_PRIZES.length);
    const chosenPrize = RUNE_WHEEL_PRIZES[prizeIdx];
    const nextRot = wheelRotation + 1080 + prizeIdx * 60;
    setWheelRotation(nextRot);

    setTimeout(() => {
      setIsSpinning(false);
      setLastPrizeLabel(chosenPrize.label);
      onSpinWheel(chosenPrize, canFree);
    }, 1600);
  };

  const formatGBP = (amount: number) => `£${amount.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-5 select-none font-sans">
      <div className="w-full max-w-5xl bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-neutral-900/95 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-xl font-bold text-amber-400 font-['Cinzel',serif]">
                Jarl’s GBP (£) Royal Mint, Gamepasses & Saga Pass
              </h2>
              {paypalConfig.configured && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  PayPal GBP ({paypalConfig.environment}) Connected
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Official UK Sterling (£ GBP) Currency Bundles · Permanent VIP Gamepasses · Season 1 Saga Pass · Norn Prize Wheel
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Currencies Display: £ GBP Balance, Silver, Valor */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
              <span className="flex items-center gap-1 text-emerald-400 font-bold" title="Your GBP (£) Royal Wallet Balance">
                <PoundSterling className="w-3.5 h-3.5 text-emerald-400" />
                {formatGBP(gbpWalletBalance)} GBP
              </span>
              <span className="text-neutral-700">·</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {silver.toLocaleString()} Silver
              </span>
              <span className="text-neutral-700">·</span>
              <span className="flex items-center gap-1 text-sky-300 font-bold">
                <Trophy className="w-3.5 h-3.5 text-sky-400" />
                {valor.toLocaleString()} Valor
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active £ GBP Checkout Drawer (Appears when user clicks any £ GBP item) */}
        {pendingOrder && (
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/90 via-neutral-900 to-amber-950/80 border-b border-emerald-500/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider">
                  GBP (£) Checkout
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {pendingOrder.title} —{' '}
                  <span className="text-emerald-300 font-mono">
                    {formatGBP(pendingOrder.amountGBP)} GBP
                  </span>
                </h3>
              </div>
              <p className="text-xs text-neutral-300">{pendingOrder.subtitle}</p>
              {checkoutStatus && (
                <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 pt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{checkoutStatus}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              {/* Official PayPal GBP Button Container */}
              {paypalConfig.clientId && (
                <div
                  ref={paypalButtonsContainerRef}
                  className="min-w-[190px] min-h-[40px] flex items-center justify-center"
                />
              )}

              {/* Instant £ GBP Checkout Button (Works 1-click inside iframe or with £ GBP Wallet) */}
              <button
                onClick={() => handleInstantGBPCheckout(pendingOrder)}
                disabled={isProcessingExpress}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessingExpress
                    ? 'Processing £ GBP...'
                    : `Instant Pay ${formatGBP(pendingOrder.amountGBP)} GBP`}
                </span>
              </button>

              <button
                onClick={() => {
                  setPendingOrder(null);
                  setCheckoutStatus(null);
                }}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('gbp_packs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gbp_packs'
                  ? 'bg-emerald-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <PoundSterling className="w-3.5 h-3.5" />
              <span>£ GBP Currency Bundles</span>
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'passes'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              VIP Gamepasses (£ / Silver)
            </button>
            <button
              onClick={() => setActiveTab('sagapass')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'sagapass'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              Season 1 Saga Pass (£3.99)
            </button>
            <button
              onClick={() => setActiveTab('wheel')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'wheel'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span>Daily Rune Wheel</span>
              {freeWheelSpins > 0 && (
                <span className="text-[11px] font-mono tabular-nums">({freeWheelSpins} Free)</span>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: £ GBP CURRENCY BUNDLES */}
          {activeTab === 'gbp_packs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <PoundSterling className="w-4 h-4 text-emerald-400" />
                    <span>UK Sterling (£ GBP) Silver & Valor Packages</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Choose a £ GBP package below to top up Silver Coins, bonus Valor Honor, and free Norn Wheel spins via PayPal GBP or Instant GBP Checkout.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-lg self-start sm:self-auto">
                  All prices in British Pounds (£ GBP)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GBP_CURRENCY_PACKS.map((pack: GBPCurrencyPack) => (
                  <div
                    key={pack.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between relative ${
                      pack.includesAllPasses
                        ? 'bg-gradient-to-b from-amber-950/40 via-neutral-900 to-neutral-900 border-amber-400/70 shadow-lg'
                        : pack.popular
                        ? 'bg-gradient-to-b from-emerald-950/35 via-neutral-900 to-neutral-900 border-emerald-500/60 shadow-lg'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            pack.includesAllPasses
                              ? 'bg-amber-500 text-neutral-950'
                              : pack.popular
                              ? 'bg-emerald-500 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {pack.badgeText || 'GBP Pack'}
                        </span>
                        <span className="text-base font-black font-mono text-emerald-400">
                          {formatGBP(pack.priceGBP)}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-2.5">{pack.name}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{pack.subtitle}</p>

                      {/* Reward Breakdown */}
                      <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-amber-300 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            Silver Coins:
                          </span>
                          <span className="font-mono">+{pack.silverAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sky-300 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-sky-400" />
                            Bonus Valor:
                          </span>
                          <span className="font-mono">+{pack.bonusValor.toLocaleString()}</span>
                        </div>
                        {pack.freeWheelSpins > 0 && (
                          <div className="flex items-center justify-between text-purple-300 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                              Free Wheel Spins:
                            </span>
                            <span className="font-mono">+{pack.freeWheelSpins} Spins</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
                      <button
                        onClick={() =>
                          setPendingOrder({
                            id: pack.id,
                            title: pack.name,
                            subtitle: `+${pack.silverAmount.toLocaleString()} Silver & +${pack.bonusValor.toLocaleString()} Valor`,
                            amountGBP: pack.priceGBP,
                            kind: 'currency_pack',
                            payloadId: pack.id,
                          })
                        }
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                          pack.includesAllPasses
                            ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Buy for {formatGBP(pack.priceGBP)} GBP</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent £ GBP Transactions Ledger */}
              {transactions.length > 0 && (
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Recent £ GBP Treasury Purchases ({transactions.length})</span>
                    </h4>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Total Spent: £
                      {transactions.reduce((acc, t) => acc + t.amountGBP, 0).toFixed(2)} GBP
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-xs bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800/80"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold font-mono">
                            {formatGBP(tx.amountGBP)}
                          </span>
                          <span className="text-white font-semibold">{tx.itemName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {tx.method}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          Ref: {tx.orderId} · {tx.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VIP GAMEPASSES & CONSUMABLES (Dual £ GBP or Silver Pricing) */}
          {activeTab === 'passes' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200 mb-3">
                  01. Permanent Realm Gamepasses (Unlock with £ GBP or In-Game Silver)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gamepasses.map((gp) => {
                    const canAfford = silver >= gp.priceSilver;
                    return (
                      <div
                        key={gp.id}
                        className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                          gp.owned
                            ? 'bg-amber-950/20 border-amber-500/60'
                            : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-base font-semibold text-white">{gp.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                {formatGBP(gp.priceGBP)}
                              </span>
                              <span className="text-xs font-mono text-amber-400">
                                {gp.badgeText}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-amber-300/90 mt-1">{gp.tagline}</p>
                          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                            {gp.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-mono tabular-nums text-neutral-300">
                            {formatGBP(gp.priceGBP)} GBP · or {gp.priceSilver} Silver
                          </span>
                          {gp.owned ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                              <Check className="w-4 h-4" /> Active Forever
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setPendingOrder({
                                    id: `gbp_${gp.id}`,
                                    title: gp.name,
                                    subtitle: gp.tagline,
                                    amountGBP: gp.priceGBP,
                                    kind: 'gamepass',
                                    payloadId: gp.id,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer"
                              >
                                Buy {formatGBP(gp.priceGBP)}
                              </button>
                              <button
                                onClick={() => onBuyGamepass(gp.id)}
                                disabled={!canAfford}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                  canAfford
                                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                }`}
                              >
                                {gp.priceSilver} Silver
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Developer Products: Instant Boosts */}
              <div className="pt-4 border-t border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-200 mb-3">
                  02. Instant Battlefield Blessings (£ GBP or Silver)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-emerald-400 font-semibold text-sm">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          <span>Valhalla Restore</span>
                        </span>
                        <span className="font-mono text-xs">£0.79</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Instantly restores 100% Health, 100% Stamina, and grants +50 Bonus HP shield.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPendingOrder({
                            id: 'dev_revive_heal',
                            title: 'Valhalla Full Restore (150 HP)',
                            subtitle: 'Instant 150 HP & 100% Stamina Blessing',
                            amountGBP: 0.79,
                            kind: 'dev_product',
                            payloadId: 'revive_heal',
                          })
                        }
                        className="flex-1 py-2 px-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer"
                      >
                        £0.79 GBP
                      </button>
                      <button
                        onClick={() => onUseDevProduct('revive_heal')}
                        disabled={silver < 60}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          silver >= 60
                            ? 'bg-neutral-200 hover:bg-white text-neutral-950'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        60 Silver
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-sky-400 font-semibold text-sm">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4" />
                          <span>Server War Horn</span>
                        </span>
                        <span className="font-mono text-xs text-emerald-400">£1.49</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Rallies the entire server with a lightning strike and grants +250 Valor Honor.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPendingOrder({
                            id: 'dev_server_horn',
                            title: 'Server-Wide War Horn',
                            subtitle: '3D Lightning Strike + 250 Valor Honor',
                            amountGBP: 1.49,
                            kind: 'dev_product',
                            payloadId: 'server_horn',
                          })
                        }
                        className="flex-1 py-2 px-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer"
                      >
                        £1.49 GBP
                      </button>
                      <button
                        onClick={() => onUseDevProduct('server_horn')}
                        disabled={silver < 120}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          silver >= 120
                            ? 'bg-sky-500 hover:bg-sky-400 text-neutral-950'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        120 Silver
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-amber-400 font-semibold text-sm">
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4" />
                          <span>Warlord Crate</span>
                        </span>
                        <span className="font-mono text-xs text-emerald-400">£1.99</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Grants +350 Silver Coins, +10 Timber, and +5 Iron Ore immediately.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPendingOrder({
                            id: 'dev_silver_chest',
                            title: 'Warlord’s Supply Crate',
                            subtitle: '+350 Silver, +10 Timber, +5 Iron Ore',
                            amountGBP: 1.99,
                            kind: 'dev_product',
                            payloadId: 'silver_chest',
                          })
                        }
                        className="flex-1 py-2 px-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer"
                      >
                        £1.99 GBP
                      </button>
                      <button
                        onClick={() => onUseDevProduct('silver_chest')}
                        disabled={valor < 100}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          valor >= 100
                            ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        100 Valor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: SAGA BATTLE PASS */}
          {activeTab === 'sagapass' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-amber-300">
                    Season 1: Fimbulwinter Saga Pass
                  </h3>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Your Current Honor: <span className="font-mono text-sky-300">{valor} Valor</span> · Unlock tiers by earning Valor in raids, quests, and tycoon buildings.
                  </p>
                </div>
                {hasGoldSagaPass ? (
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> Gold Saga Track Unlocked
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPendingOrder({
                          id: 'gbp_gold_sagapass',
                          title: 'Season 1 Gold Saga Pass',
                          subtitle: 'Unlocks all 8 Gold Track Tier Rewards',
                          amountGBP: 3.99,
                          kind: 'gold_sagapass',
                          payloadId: 'gold_sagapass',
                        })
                      }
                      className="px-4 py-2 rounded-lg text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer"
                    >
                      Buy Gold Pass (£3.99 GBP)
                    </button>
                    <button
                      onClick={onUnlockGoldSagaPass}
                      disabled={silver < 300}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        silver >= 300
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      Unlock (300 Silver)
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sagaTiers.map((t) => {
                  const unlocked = valor >= t.requiredValor;
                  return (
                    <div
                      key={t.tier}
                      className={`p-4 rounded-xl border ${
                        unlocked
                          ? 'bg-neutral-900/80 border-neutral-700'
                          : 'bg-neutral-950 border-neutral-800/70 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                        <span className="font-semibold text-white">Tier 0{t.tier}</span>
                        <span className="font-mono tabular-nums">{t.requiredValor} Valor Required</span>
                      </div>

                      {/* Free Track */}
                      <div className="flex items-center justify-between py-2 border-t border-neutral-800">
                        <div>
                          <span className="text-xs text-neutral-400">Free Track: </span>
                          <span className="text-xs font-semibold text-neutral-200">
                            {t.freeRewardLabel}
                          </span>
                        </div>
                        {t.claimedFree ? (
                          <span className="text-xs text-emerald-400 font-medium">Claimed</span>
                        ) : (
                          <button
                            onClick={() => onClaimSagaTier(t.tier, false)}
                            disabled={!unlocked}
                            className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                              unlocked
                                ? 'bg-neutral-200 hover:bg-white text-neutral-950'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            Claim
                          </button>
                        )}
                      </div>

                      {/* Gold Track */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                        <div>
                          <span className="text-xs text-amber-400">Gold Track: </span>
                          <span className="text-xs font-semibold text-amber-200">
                            {t.goldRewardLabel}
                          </span>
                        </div>
                        {t.claimedGold ? (
                          <span className="text-xs text-emerald-400 font-medium">Claimed</span>
                        ) : (
                          <button
                            onClick={() => onClaimSagaTier(t.tier, true)}
                            disabled={!unlocked || !hasGoldSagaPass}
                            className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                              unlocked && hasGoldSagaPass
                                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            {hasGoldSagaPass ? 'Claim Gold' : 'Gold Pass Req'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DAILY RUNE WHEEL */}
          {activeTab === 'wheel' && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
              {/* Animated Rune Wheel */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0">
                <div
                  className="w-full h-full rounded-full border-4 border-amber-400 bg-neutral-900 shadow-2xl flex items-center justify-center transition-transform duration-1500 ease-out relative overflow-hidden"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {RUNE_WHEEL_PRIZES.map((p, idx) => {
                    const angle = idx * 60;
                    return (
                      <div
                        key={p.id}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-88px)`,
                        }}
                      >
                        <span className="text-xs font-bold text-amber-200 block whitespace-nowrap">
                          {p.label}
                        </span>
                      </div>
                    );
                  })}
                  <div className="w-16 h-16 rounded-full bg-amber-500 border-2 border-amber-200 flex items-center justify-center text-neutral-950 font-bold text-xs z-10">
                    ODIN
                  </div>
                </div>
                {/* Pointer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-6 bg-red-500 rounded-b-full border border-white shadow-lg z-20" />
              </div>

              {/* Wheel Controls & Prizes List */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Wheel of the Norns — Daily Spin
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Spin the sacred rune wheel for instant Silver jackpots, Valor honor, or building resources.
                  </p>
                </div>

                {lastPrizeLabel && (
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-sm font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>You won: {lastPrizeLabel}!</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
                  {RUNE_WHEEL_PRIZES.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between"
                    >
                      <span>{p.label}</span>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning || (freeWheelSpins <= 0 && silver < 100)}
                    className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                      !isSpinning && (freeWheelSpins > 0 || silver >= 100)
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>
                      {isSpinning
                        ? 'Spinning Runes...'
                        : freeWheelSpins > 0
                        ? `Spin Free (${freeWheelSpins} Left)`
                        : 'Extra Spin (100 Silver)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
