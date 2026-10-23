import React, { useState } from 'react';
import { X, Download, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';

export interface GameScreenshot {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  filename: string;
}

export const GAME_SCREENSHOTS: GameScreenshot[] = [
  {
    id: 'drakkar_sailing',
    title: 'Majestic Drakkar Longship Fjord Sailing',
    category: 'Naval Exploration & Sailing',
    description: 'Viking warship with carved dragon figurehead and red-and-white striped sails sailing through Nordic fjords with HUD quickslots and minimap.',
    url: '/screenshots/1_viking_drakkar_sailing.jpeg',
    filename: '1_viking_drakkar_sailing.jpeg',
  },
  {
    id: 'pet_trading_hall',
    title: 'Katfjord Pet Trading Post & Barter Hall',
    category: 'Pet Barter & Companions',
    description: 'Viking warriors gathered around the barter counter trading glowing mythical pets: Frost Dragon wyrmling, Dire Wolf pup, Golden Freyr Boar, and Runic Raven.',
    url: '/screenshots/2_pet_trading_hall.jpeg',
    filename: '2_pet_trading_hall.jpeg',
  },
  {
    id: 'viking_village',
    title: 'Sprawling Katfjord Coastal Settlement',
    category: 'Viking Hub & Settlements',
    description: 'Scenic panoramic overview of Katfjord harbor with wooden mead halls, smoking hearths, archery training ranges, watchtowers, and berthing docks.',
    url: '/screenshots/3_katfjord_coastal_village.jpeg',
    filename: '3_katfjord_coastal_village.jpeg',
  },
  {
    id: 'naval_siege',
    title: 'Naval Siege & Frost-Ballista Fortress Assault',
    category: 'Siege Battles & Raids',
    description: 'Armada of Viking drakkars storming a coastal Saxon fortress gate, firing deck-mounted frost ballista bolts and charging the beachhead.',
    url: '/screenshots/4_naval_siege_fortress_battle.jpeg',
    filename: '4_naval_siege_fortress_battle.jpeg',
  },
  {
    id: 'dragon_dungeon_boss',
    title: 'Níðhöggr Dragon Underworld Dungeon Boss',
    category: 'Co-Op Raid & Dungeon',
    description: 'Epic dungeon raid in Niflheim ice caverns against a massive crystalline frost dragon breathing blizzards over an ancient runic floor.',
    url: '/screenshots/5_niflheim_dragon_boss_raid.jpeg',
    filename: '5_niflheim_dragon_boss_raid.jpeg',
  },
];

interface ScreenshotsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenshotsGalleryModal: React.FC<ScreenshotsGalleryModalProps> = ({ isOpen, onClose }) => {
  const [selectedShot, setSelectedShot] = useState<GameScreenshot>(GAME_SCREENSHOTS[0]);

  if (!isOpen) return null;

  const handleDownloadAll = () => {
    GAME_SCREENSHOTS.forEach((shot, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = shot.url;
        link.download = shot.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 250);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-400 font-['Cinzel',serif] flex items-center gap-2">
                Official Game Screenshots &amp; Upload Kit
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  5 Full HD Images (1920×1080)
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Ready to download &amp; upload to Roblox, Steam, Google Play, itch.io, Discord or Social Media
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/viking-realm-itchio.zip"
              download="viking-realm-itchio.zip"
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
              title="Download packaged game ZIP ready to upload to itch.io"
            >
              <span>🎮</span>
              Itch.io Game ZIP
            </a>
            <button
              onClick={handleDownloadAll}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download JPEGs
            </button>
            <a
              href="/screenshots.html"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition"
              title="Open full-page press kit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Press Kit Page
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Selected Preview */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
            <div className="relative aspect-video w-full bg-black group">
              <img
                src={selectedShot.url}
                alt={selectedShot.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {selectedShot.category}
              </div>
              <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-700 text-sky-300 px-2.5 py-1 rounded-md text-xs font-mono">
                1920 × 1080 (16:9)
              </div>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 border-t border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white font-['Cinzel',serif]">{selectedShot.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedShot.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedShot.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Full
                </a>
                <a
                  href={selectedShot.url}
                  download={selectedShot.filename}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JPEG
                </a>
              </div>
            </div>
          </div>

          {/* Thumbnails Row */}
          <div>
            <div className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Select Screenshot to Preview &amp; Download:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {GAME_SCREENSHOTS.map((shot, idx) => {
                const isSelected = selectedShot.id === shot.id;
                return (
                  <button
                    key={shot.id}
                    onClick={() => setSelectedShot(shot)}
                    className={`relative rounded-lg overflow-hidden border transition text-left cursor-pointer group ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                        : 'border-neutral-800 hover:border-neutral-600 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-video w-full bg-black">
                      <img src={shot.url} alt={shot.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 bg-neutral-900/90">
                      <div className="text-[11px] font-bold text-white truncate">
                        {idx + 1}. {shot.title}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {shot.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Files saved in <code className="text-amber-300 font-mono">/public/screenshots/</code> and available online at <code className="text-sky-300 font-mono">/screenshots.html</code></span>
          <button onClick={onClose} className="hover:text-white transition">
            Close [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
