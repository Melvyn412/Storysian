import React from 'react';
import { AvatarSkin } from '../types';
import { Shirt, Check, Coins, Sparkles, Shield } from 'lucide-react';

interface AvatarCustomizerProps {
  skins: AvatarSkin[];
  activeSkinId: string;
  silver: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectSkin: (skin: AvatarSkin) => void;
  onBuySkin: (skin: AvatarSkin) => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  skins,
  activeSkinId,
  silver,
  isOpen,
  onClose,
  onSelectSkin,
  onBuySkin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white font-['Cinzel',serif] tracking-wider">
              Viking Wardrobe & Skins
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Skin Selection Grid */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
          {skins.map((skin) => {
            const isEquipped = skin.id === activeSkinId;
            const canAfford = silver >= skin.price;

            return (
              <div
                key={skin.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition ${
                  isEquipped
                    ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-900/20'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Left Preview Swatch */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-neutral-700 shadow-inner relative overflow-hidden"
                    style={{ backgroundColor: skin.shirtColor }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: skin.helmetColor }}
                    />
                    <div
                      className="absolute bottom-0 w-8 h-2.5 rounded-t-sm"
                      style={{ backgroundColor: skin.beardColor }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{skin.name}</h4>
                      {isEquipped && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500 text-neutral-950 rounded uppercase">
                          Equipped
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{skin.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                      <span>Crest: {skin.shieldCrest}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div>
                  {skin.unlocked ? (
                    <button
                      onClick={() => onSelectSkin(skin)}
                      disabled={isEquipped}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isEquipped
                          ? 'bg-neutral-800 text-neutral-500 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Selected
                        </>
                      ) : (
                        'Equip'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuySkin(skin)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-300" />
                      <span>{skin.price} Silver</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
