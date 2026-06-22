"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header/Header";
import LoadingTemplate from "../components/loading/LoadingTemplate";
import { apiService } from "../services/apiService";
import { getAuthToken } from "../utils/session";
import { toast } from "react-toastify";

type CourtPieceSuit = "hearts" | "diamonds" | "clubs" | "spades";

type CourtPieceRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

type CourtPieceCard = {
  id: string;
  suit: CourtPieceSuit;
  rank: CourtPieceRank;
  label: string;
};

type CourtPiecePlayer = {
  token: string;
  nickName: string;
  isAI: boolean;
  isHuman: boolean;
  seatIndex: number;
  handCount: number;
  score: number;
  tricksWon: number;
};

type CourtPiecePlayedCard = {
  token: string;
  nickName: string;
  seatIndex: number;
  card: CourtPieceCard;
};

type CourtPieceGameResponse = {
  status: "in-progress" | "finished";
  trumpSuit: CourtPieceSuit;
  currentTurn: CourtPiecePlayer | null;
  leadSuit: CourtPieceSuit | null;
  currentTrick: CourtPiecePlayedCard[];
  players: CourtPiecePlayer[];
  hand: CourtPieceCard[];
  winner: CourtPiecePlayer | null;
  isNew: boolean;
  message?: string;
};

const SUIT_SYMBOLS: Record<CourtPieceSuit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const SUIT_COLORS: Record<CourtPieceSuit, string> = {
  hearts: "text-[#b33644]",
  diamonds: "text-[#b33644]",
  clubs: "text-[#1f6b55]",
  spades: "text-[#1f334f]",
};

function CourtPiecePageContent() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [game, setGame] = useState<CourtPieceGameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    apiService.setAuthToken(storedToken);
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadGame = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.startCourtPiece();
        if (cancelled) {
          return;
        }

        setGame(response.game);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Unable to load Court Piece";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadGame();

    const intervalId = setInterval(() => {
      void apiService
        .getCourtPieceStatus()
        .then((response) => {
          if (!cancelled) {
            setGame(response);
            setError(null);
          }
        })
        .catch(() => {
          // Ignore transient polling errors.
        });
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [token]);

  const isMyTurn = game?.currentTurn?.isHuman ?? false;
  const statusLabel = useMemo(() => {
    if (!game) {
      return "Preparing room";
    }

    if (game.status === "finished") {
      if (!game.winner) {
        return "Game finished in a draw";
      }

      return game.winner.isHuman ? "You won" : `${game.winner.nickName} won`;
    }

    return isMyTurn ? "Your turn" : `${game.currentTurn?.nickName ?? "AI"} to act`;
  }, [game, isMyTurn]);

  const handlePlayCard = async (card: CourtPieceCard) => {
    if (!game || !isMyTurn || isPlaying) {
      return;
    }

    try {
      setIsPlaying(true);
      const response = await apiService.playCourtPieceCard(card.id);
      setGame(response);
      setError(null);
    } catch (playError) {
      const message = playError instanceof Error ? playError.message : "Unable to play card";
      setError(message);
      toast.error(message);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStartAgain = async () => {
    if (isPlaying) {
      return;
    }

    try {
      setIsPlaying(true);
      setIsLoading(true);
      setGame(null);
      const response = await apiService.startCourtPiece();
      setGame(response.game);
      setError(null);
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : "Unable to start a new game";
      setError(message);
      toast.error(message);
    } finally {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (isLoading && !game) {
    return <LoadingTemplate message="Opening Court Piece..." />;
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Header title="Court Piece" />

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase  text-[var(--text-secondary)]">
                  Court Piece table
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  Play a trick
                </h1>
              </div>
              <div className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
                {statusLabel}
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-[var(--danger)] bg-[color-mix(in_oklab,var(--danger),white 88%)] px-4 py-3 text-sm font-medium text-[var(--danger-strong)]">
                {error}
              </p>
            ) : null}

            <div className="mt-6">
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4">
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                  Players
                </p>
                <div className="mt-3 grid gap-3 text-sm text-[var(--text-primary)] sm:grid-cols-2">
                  {game?.players.map((player) => (
                    <div
                      key={player.token}
                      className={`rounded-2xl border px-3 py-2 ${player.isHuman ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent),white 90%)]" : "border-[var(--border-soft)] bg-[var(--surface-strong)]"}`}
                    >
                      <div className="font-semibold">{player.nickName} ( {player.isHuman ? "You" : "AI"} )</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {player.score} Score <br/> {player.tricksWon} Tricks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.02))] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase  text-[var(--text-secondary)]">
                    Current trick
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {game?.message ?? "Play one card at a time. Follow the lead suit if you can."}
                  </p>
                </div>
                <div className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {game?.currentTurn ? `${game.currentTurn.nickName} to act` : "-"}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {game?.currentTrick?.length ? (
                  game.currentTrick.map((playedCard, index) => (
                    <div
                      key={`${playedCard.token}-${playedCard.card.id}`}
                      className={`rounded-3xl border p-4 ${index === 0 ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent),white 90%)] shadow-[0_8px_24px_rgba(23,98,79,0.15)]" : "border-[var(--border-soft)] bg-[var(--surface-strong)]"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold uppercase text-[var(--text-secondary)]">
                          {playedCard.nickName}
                        </div>
                        {index === 0 && (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                            Lead
                          </span>
                        )}
                      </div>
                      <div className={`mt-3 text-4xl font-black ${SUIT_COLORS[playedCard.card.suit]}`}>
                        {playedCard.card.label}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 text-sm text-[var(--text-secondary)] md:col-span-2">
                    No cards have been played in this trick yet.
                  </div>
                )}
              </div>
            </div>

            {game?.status === "finished" ? (
              <div className="mt-6 rounded-3xl border border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent),white 88%)] px-4 py-3 text-sm font-semibold text-[var(--accent-strong)]">
                <div>
                  {!game.winner
                    ? "The game ended in a draw."
                    : game.winner.isHuman
                      ? "You won the Court Piece match."
                      : `${game.winner.nickName} won the Court Piece match.`}
                </div>
                <button
                  type="button"
                  onClick={() => void handleStartAgain()}
                  className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:cursor-pointer"
                >
                  Start again
                </button>
              </div>
            ) : null}
          </section>

          <aside className="space-y-4 rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-6">
            {game ? (
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">Trump suit</p>
                <div className={`mt-1 text-2xl font-black ${SUIT_COLORS[game.trumpSuit]}`}>
                  {SUIT_SYMBOLS[game.trumpSuit]}
                  <span className="ml-1 text-base font-semibold capitalize text-[var(--text-primary)]">{game.trumpSuit}</span>
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-sm font-semibold uppercase  text-[var(--text-secondary)]">
                Your hand
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Click a card to play it when it is your turn.
              </p>
            </div>

            <div className="grid gap-2">
              {game?.hand?.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={!isMyTurn || isPlaying || game.status === "finished"}
                  onClick={() => void handlePlayCard(card)}
                  className="grid-cols-3 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className={`text-lg font-black leading-none ${SUIT_COLORS[card.suit]}`}>
                    {card.label}
                  </div>
                </button>
              ))}
              {!game?.hand?.length ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                  No cards left in your hand.
                </div>
              ) : null}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default function CourtPiecePage() {
  return (
    <Suspense fallback={<LoadingTemplate message="Opening Court Piece..." />}>
      <CourtPiecePageContent />
    </Suspense>
  );
}
