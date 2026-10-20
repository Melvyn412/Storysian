import React, { useState } from 'react';
import {
  X,
  ArrowLeftRight,
  Shield,
  Coins,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Sparkles,
  Users,
  Scroll,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';
import {
  VikingPet,
  PetId,
  RemotePlayerState,
  ActivePetTradeSession,
  PublicPetTradeListing,
} from '../types';

interface PetTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selfId: string;
  playerName: string;
  playerClan: string;
  playerSilver: number;
  pets: VikingPet[];
  remotePlayers: RemotePlayerState[];
  activeSession: ActivePetTradeSession | null;
  publicListings: PublicPetTradeListing[];
  onRequestTrade: (targetPlayerId: string) => void;
  onUpdateTrade: (pets: PetId[], silver: number, locked: boolean, accepted: boolean) => void;
  onCancelTrade: () => void;
  onPostListing: (offeredPetId: PetId, offeredSilver: number, wantedPetId: PetId, wantedSilver: number) => void;
  onClaimListing: (listingId: string) => void;
  onInstantClanTrade?: (offeredPetId: PetId, wantedPetId: PetId, traderName: string) => void;
}

export const PetTradingModal: React.FC<PetTradingModalProps> = ({
  isOpen,
  onClose,
  selfId,
  playerName,
  playerClan,
  playerSilver,
  pets,
  remotePlayers,
  activeSession,
  publicListings,
  onRequestTrade,
  onUpdateTrade,
  onCancelTrade,
  onPostListing,
  onClaimListing,
  onInstantClanTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'p2p' | 'board' | 'clan_traders'>('p2p');

  // Staged offer state for local trader
  const [selectedOfferPets, setSelectedOfferPets] = useState<PetId[]>([]);
  const [offeredSilver, setOfferedSilver] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);

  // New public listing creator state
  const [newListingOfferedPet, setNewListingOfferedPet] = useState<PetId>(
    pets.find((p) => p.unlocked)?.id || 'pet_odin_raven'
  );
  const [newListingOfferedSilver, setNewListingOfferedSilver] = useState<number>(50);
  const [newListingWantedPet, setNewListingWantedPet] = useState<PetId>('pet_fenrir_pup');
  const [newListingWantedSilver, setNewListingWantedSilver] = useState<number>(0);

  // Target player selection when initiating trade
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  if (!isOpen) return null;

  const unlockedPets = pets.filter((p) => p.unlocked && p.count > 0);

  const getPet = (id: PetId): VikingPet | undefined => pets.find((p) => p.id === id);

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'mythic':
        return 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300';
      case 'legendary':
        return 'border-amber-500/60 bg-amber-950/40 text-amber-300';
      case 'epic':
        return 'border-purple-500/60 bg-purple-950/40 text-purple-300';
      default:
        return 'border-blue-500/60 bg-blue-950/40 text-blue-300';
    }
  };

  const handleTogglePetInOffer = (petId: PetId) => {
    if (isLocked) return;
    const nextPets = selectedOfferPets.includes(petId)
      ? selectedOfferPets.filter((id) => id !== petId)
      : [...selectedOfferPets, petId];
    setSelectedOfferPets(nextPets);
    setIsAccepted(false);
    onUpdateTrade(nextPets, offeredSilver, false, false);
  };

  const handleSilverChange = (amount: number) => {
    if (isLocked) return;
    const clamped = Math.min(playerSilver, Math.max(0, amount));
    setOfferedSilver(clamped);
    setIsAccepted(false);
    onUpdateTrade(selectedOfferPets, clamped, false, false);
  };

  const handleToggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    if (!nextLocked) {
      setIsAccepted(false);
    }
    onUpdateTrade(selectedOfferPets, offeredSilver, nextLocked, false);
  };

  const handleToggleAccept = () => {
    if (!isLocked) return;
    const nextAccepted = !isAccepted;
    setIsAccepted(nextAccepted);
    onUpdateTrade(selectedOfferPets, offeredSilver, true, nextAccepted);
  };

  const isSender = activeSession?.senderId === selfId;
  const partnerName = activeSession
    ? isSender
      ? activeSession.receiverName
      : activeSession.senderName
    : 'No Partner';
  const partnerClan = activeSession
    ? isSender
      ? activeSession.receiverClan
      : activeSession.senderClan
    : '';
  const partnerPets = activeSession
    ? isSender
      ? activeSession.receiverPets
      : activeSession.senderPets
    : [];
  const partnerSilver = activeSession
    ? isSender
      ? activeSession.receiverSilver
      : activeSession.senderSilver
    : 0;
  const partnerLocked = activeSession
    ? isSender
      ? activeSession.receiverLocked
      : activeSession.senderLocked
    : false;
  const partnerAccepted = activeSession
    ? isSender
      ? activeSession.receiverAccepted
      : activeSession.senderAccepted
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-neutral-900/90 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h2 className="text-lg sm:text-xl font-semibold text-amber-400 font-['Cinzel',serif]">
                Katfjord Pet Trading Post &amp; Barter Hall
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Trade rare Norse companion beasts with online players or fulfill public realm barter bounties
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-neutral-200">
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                {playerSilver.toLocaleString()} Silver
              </span>
              <span className="text-neutral-600">·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {unlockedPets.length} / {pets.length} Pets Unlocked
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

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('p2p')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'p2p'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Direct Player Trade
            {activeSession && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'board'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <Scroll className="w-4 h-4" />
            Realm Public Trade Board ({publicListings.length})
          </button>

          <button
            onClick={() => setActiveTab('clan_traders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'clan_traders'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Clan Merchants (Instant Swap)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: DIRECT PLAYER-TO-PLAYER TRADE */}
          {activeTab === 'p2p' && (
            <div className="space-y-6">
              {!activeSession ? (
                /* Select Partner */
                <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 max-w-2xl mx-auto space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-semibold text-white">
                      Start a Direct Pet Trade with an Online Player
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Select any Viking currently exploring the realm to open an interactive trade session.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-xs text-neutral-400 font-medium block">
                      Active Online Vikings in Katfjord:
                    </label>

                    {remotePlayers.length === 0 ? (
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-400">
                        No other players are currently in this room. You can open a second browser window to trade with yourself, or use the <strong>Realm Public Trade Board</strong> or <strong>Clan Merchants</strong> tabs!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {remotePlayers.map((rp) => (
                          <div
                            key={rp.id}
                            onClick={() => setSelectedPartnerId(rp.id)}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                              selectedPartnerId === rp.id
                                ? 'bg-amber-950/30 border-amber-500 text-white'
                                : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-xs text-white">{rp.name}</div>
                              <div className="text-[11px] text-neutral-400">
                                {rp.clan} · Lv.{rp.level}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestTrade(rp.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold cursor-pointer"
                            >
                              Request Trade
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 2-Sided Active Trade Window */
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-semibold">Active Trade Session:</span>
                      <span className="text-white font-medium">{playerName}</span>
                      <ArrowLeftRight className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-white font-medium">{partnerName}</span>
                      <span className="text-neutral-500 text-[11px]">({partnerClan})</span>
                    </div>

                    <button
                      onClick={onCancelTrade}
                      className="px-3 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-medium cursor-pointer"
                    >
                      Cancel Trade
                    </button>
                  </div>

                  {/* Dual Trade Panes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* YOUR OFFER (LEFT) */}
                    <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                            Your Offer ({playerName})
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                              isLocked
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {isLocked ? 'Locked' : 'Staging'}
                          </span>
                        </div>

                        {/* Staged Pets */}
                        <div className="min-h-[110px] p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                          {selectedOfferPets.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-neutral-500 italic py-6">
                              Click any pet below to add it to your offer
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selectedOfferPets.map((petId) => {
                                const pet = getPet(petId);
                                if (!pet) return null;
                                return (
                                  <div
                                    key={petId}
                                    className={`p-2 rounded-lg border flex items-center gap-2 ${getRarityBadge(
                                      pet.rarity
                                    )}`}
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: pet.accentColor }}
                                    />
                                    <div>
                                      <div className="text-xs font-semibold leading-tight">{pet.name}</div>
                                      <div className="text-[10px] text-neutral-400 leading-tight">
                                        +{pet.damageBonus} DMG · {pet.rarity}
                                      </div>
                                    </div>
                                    {!isLocked && (
                                      <button
                                        onClick={() => handleTogglePetInOffer(petId)}
                                        className="text-neutral-500 hover:text-red-400 ml-1 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Offered Silver */}
                        <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                          <span className="text-neutral-400 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            Sweeten with Silver:
                          </span>
                          {!isLocked ? (
                            <input
                              type="number"
                              min="0"
                              max={playerSilver}
                              value={offeredSilver}
                              onChange={(e) => handleSilverChange(Number(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-right text-xs font-mono text-amber-300"
                            />
                          ) : (
                            <span className="font-mono text-amber-300 font-semibold">
                              {offeredSilver.toLocaleString()} Silver
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lock / Confirm Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                        <button
                          onClick={handleToggleLock}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isLocked
                              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          {isLocked ? 'Unlock Offer' : 'Lock Offer'}
                        </button>

                        <button
                          onClick={handleToggleAccept}
                          disabled={!isLocked || !partnerLocked}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isAccepted
                              ? 'bg-amber-500 text-neutral-950'
                              : isLocked && partnerLocked
                              ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isAccepted ? 'Trade Confirmed!' : 'Accept Trade'}
                        </button>
                      </div>
                    </div>

                    {/* THEIR OFFER (RIGHT) */}
                    <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                            Their Offer ({partnerName})
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                              partnerLocked
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {partnerLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {partnerLocked ? 'Locked' : 'Staging'}
                          </span>
                        </div>

                        {/* Partner Staged Pets */}
                        <div className="min-h-[110px] p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                          {partnerPets.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-neutral-500 italic py-6">
                              Waiting for partner to stage pets...
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {partnerPets.map((petId) => {
                                const pet = getPet(petId);
                                if (!pet) return null;
                                return (
                                  <div
                                    key={petId}
                                    className={`p-2 rounded-lg border flex items-center gap-2 ${getRarityBadge(
                                      pet.rarity
                                    )}`}
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: pet.accentColor }}
                                    />
                                    <div>
                                      <div className="text-xs font-semibold leading-tight">{pet.name}</div>
                                      <div className="text-[10px] text-neutral-400 leading-tight">
                                        +{pet.damageBonus} DMG · {pet.rarity}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Partner Offered Silver */}
                        <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                          <span className="text-neutral-400 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            Incoming Silver:
                          </span>
                          <span className="font-mono text-amber-300 font-semibold">
                            {partnerSilver.toLocaleString()} Silver
                          </span>
                        </div>
                      </div>

                      {/* Partner Status Box */}
                      <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Partner Trade Status:</span>
                        <span
                          className={`font-semibold ${
                            partnerAccepted
                              ? 'text-emerald-400'
                              : partnerLocked
                              ? 'text-amber-300'
                              : 'text-neutral-500'
                          }`}
                        >
                          {partnerAccepted
                            ? '✓ Confirmed by Partner'
                            : partnerLocked
                            ? 'Locked (Reviewing)'
                            : 'Adjusting Offer...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Your Pet Inventory for Staging */}
                  {!isLocked && (
                    <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-semibold">
                          Your Unlocked Pets Collection (Click to add/remove from offer):
                        </span>
                        <span className="text-neutral-500 text-[11px]">
                          Only pets you own can be offered
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {unlockedPets.map((pet) => {
                          const isStaged = selectedOfferPets.includes(pet.id);
                          return (
                            <button
                              key={pet.id}
                              onClick={() => handleTogglePetInOffer(pet.id)}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                isStaged
                                  ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
                                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: pet.accentColor }}
                                />
                                {isStaged && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                              </div>
                              <div className="text-xs font-semibold text-white mt-1 truncate">
                                {pet.name}
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate">
                                {pet.species}
                              </div>
                              <div className="text-[10px] text-amber-300/90 mt-1 font-mono">
                                +{pet.damageBonus} DMG
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REALM PUBLIC TRADE BOARD */}
          {activeTab === 'board' && (
            <div className="space-y-6">
              {/* Creator Box */}
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-400" />
                    Post a Public Pet Barter Listing
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    Visible to all Vikings in the realm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Your Pet (Offered):</label>
                    <select
                      value={newListingOfferedPet}
                      onChange={(e) => setNewListingOfferedPet(e.target.value as PetId)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-xs cursor-pointer"
                    >
                      {unlockedPets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.rarity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Sweeten with Silver:</label>
                    <input
                      type="number"
                      min="0"
                      max={playerSilver}
                      value={newListingOfferedSilver}
                      onChange={(e) => setNewListingOfferedSilver(Number(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Pet You Want in Return:</label>
                    <select
                      value={newListingWantedPet}
                      onChange={(e) => setNewListingWantedPet(e.target.value as PetId)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-xs cursor-pointer"
                    >
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.rarity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        onPostListing(
                          newListingOfferedPet,
                          newListingOfferedSilver,
                          newListingWantedPet,
                          newListingWantedSilver
                        );
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition cursor-pointer"
                    >
                      Post to Board
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Listings Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Live Public Pet Barter Listings ({publicListings.length}):
                </h3>

                {publicListings.length === 0 ? (
                  <div className="p-8 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
                    No active listings right now. Post your offer above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {publicListings.map((listing) => {
                      const offered = getPet(listing.offeredPetId);
                      const wanted = getPet(listing.wantedPetId);
                      if (!offered || !wanted) return null;

                      const userOwnsWanted = pets.some(
                        (p) => p.id === listing.wantedPetId && p.unlocked && p.count > 0
                      );
                      const isOwnListing = listing.creatorId === selfId;

                      return (
                        <div
                          key={listing.id}
                          className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span className="font-semibold text-white">{listing.creatorName}</span>
                              <span className="text-neutral-500">{listing.creatorClan}</span>
                            </div>

                            <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-between gap-2 text-xs">
                              {/* They give */}
                              <div>
                                <span className="text-neutral-500 block text-[10px]">THEY OFFER</span>
                                <span className="font-semibold text-emerald-300 block">
                                  {offered.name}
                                </span>
                                {listing.offeredSilver > 0 && (
                                  <span className="text-[11px] text-amber-300 font-mono">
                                    +{listing.offeredSilver} Silver
                                  </span>
                                )}
                              </div>

                              <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />

                              {/* They want */}
                              <div className="text-right">
                                <span className="text-neutral-500 block text-[10px]">THEY WANT</span>
                                <span className="font-semibold text-sky-300 block">
                                  {wanted.name}
                                </span>
                                <span className="text-[10px] text-neutral-400 capitalize">
                                  {wanted.rarity} Tier
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-[11px] text-neutral-500">
                              {userOwnsWanted
                                ? '✓ You own this companion'
                                : '✗ You don’t own this companion yet'}
                            </span>

                            {!listing.completed ? (
                              <button
                                onClick={() => onClaimListing(listing.id)}
                                disabled={!userOwnsWanted || isOwnListing}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                  isOwnListing
                                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                    : userOwnsWanted
                                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                                    : 'bg-neutral-850 text-neutral-500 cursor-not-allowed'
                                }`}
                              >
                                {isOwnListing ? 'Your Listing' : 'Fulfill Barter'}
                              </button>
                            ) : (
                              <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Fulfilled
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLAN MERCHANTS (INSTANT BARTER) */}
          {activeTab === 'clan_traders' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300">
                Katfjord Clan Beastmasters &amp; Runic Barter Guild offer instant 1:1 pet trades anytime you have duplicate or unwanted companions.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  {
                    trader: 'Astrid_Beastmaster',
                    clan: 'Raven Clan',
                    offeredId: 'pet_golden_boar' as PetId,
                    wantedId: 'pet_odin_raven' as PetId,
                    desc: 'Trades Freyr’s Golden Boar in exchange for Odin’s Runic Raven.',
                  },
                  {
                    trader: 'Torstein_Wolfkeeper',
                    clan: 'Fenrir Clan',
                    offeredId: 'pet_garmr_hound' as PetId,
                    wantedId: 'pet_fenrir_pup' as PetId,
                    desc: 'Trades Helheim’s Garmr Hound in exchange for a Fenrir Dire Pup.',
                  },
                  {
                    trader: 'Lagertha_Valkyrie',
                    clan: 'Valkyrie Clan',
                    offeredId: 'pet_freya_cat' as PetId,
                    wantedId: 'pet_ratatoskr' as PetId,
                    desc: 'Trades Freyja’s Blue Forest Feline in exchange for Ratatoskr.',
                  },
                  {
                    trader: 'Einar_Sunseeker',
                    clan: 'Solar Clan',
                    offeredId: 'pet_skoll_wolf' as PetId,
                    wantedId: 'pet_vedrfolnir_hawk' as PetId,
                    desc: 'Trades Sköll Solar Stalker in exchange for Veðrfölnir Sun Hawk.',
                  },
                  {
                    trader: 'Brokk_Thorsmith',
                    clan: 'Mjolnir Clan',
                    offeredId: 'pet_tanngrisnir_goat' as PetId,
                    wantedId: 'pet_golden_boar' as PetId,
                    desc: 'Trades Thor’s Lightning Goatling in exchange for Gullinbursti.',
                  },
                  {
                    trader: 'Freydis_Tidewatcher',
                    clan: 'Katfjord Clan',
                    offeredId: 'pet_jormungandr_serpent' as PetId,
                    wantedId: 'pet_frost_dragon' as PetId,
                    desc: 'Trades Midgard Ocean Serpent Wyrmling in exchange for Nidhogg Frost Wyrm.',
                  },
                ].map((item, idx) => {
                  const off = getPet(item.offeredId);
                  const wan = getPet(item.wantedId);
                  if (!off || !wan) return null;

                  const canTrade = pets.some(
                    (p) => p.id === item.wantedId && p.unlocked && p.count > 0
                  );

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-semibold text-white">{item.trader}</span>
                          <span className="text-amber-400/90">{item.clan}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">{item.desc}</p>

                        <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-neutral-500 block text-[10px]">YOU RECEIVE</span>
                            <span className="font-semibold text-emerald-300 block">{off.name}</span>
                            <span className="text-[10px] text-neutral-400 capitalize">
                              {off.species} · +{off.damageBonus} DMG
                            </span>
                          </div>

                          <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />

                          <div className="text-right">
                            <span className="text-neutral-500 block text-[10px]">YOU GIVE</span>
                            <span className="font-semibold text-red-300 block">{wan.name}</span>
                            <span className="text-[10px] text-neutral-400 capitalize">
                              {wan.species}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-neutral-500">
                          {canTrade ? '✓ You have required beast' : '✗ Need required beast'}
                        </span>

                        <button
                          onClick={() => {
                            if (onInstantClanTrade) {
                              onInstantClanTrade(item.wantedId, item.offeredId, item.trader);
                            }
                          }}
                          disabled={!canTrade}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            canTrade
                              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                              : 'bg-neutral-850 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          Barter Pet
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
