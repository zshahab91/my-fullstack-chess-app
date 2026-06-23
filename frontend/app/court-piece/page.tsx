"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  lastCompletedTrick: CourtPiecePlayedCard[];
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
  clubs: "text-[#000000]",
  spades: "text-[#000000]",
};

const CARD_FRONT_BACKGROUND = {
  backgroundImage:
    "radial-gradient(circle at 20% 14%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 40%), linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.96) 100%)",
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;

const CARD_BACK_BACKGROUND = {
  backgroundImage:
    "linear-gradient(150deg, rgba(127,29,29,0.95) 0%, rgba(153,27,27,0.95) 50%, rgba(185,28,28,0.95) 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 8px)",
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;

const CARD_SIZE_CLASS = "h-[78px] w-[54px]";
const TABLE_CARD_SIZE_CLASS = "h-[110px] w-[76px]";
const USER_CARD_SIZE_CLASS = "h-[96px] w-[66px]";

function getPipCount(rank: CourtPieceRank): number | null {
  const parsedRank = Number(rank);
  if (Number.isInteger(parsedRank) && parsedRank >= 2 && parsedRank <= 10) {
    return parsedRank;
  }

  return null;
}

function RealCardFace({
  card,
  size,
}: {
  card: CourtPieceCard;
  size: "sm" | "md";
}) {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const colorClass = SUIT_COLORS[card.suit];
  const pipCount = getPipCount(card.rank);
  const rankClass = size === "sm" ? "text-xs" : "text-base";
  const centerClass = size === "sm" ? "text-3xl" : "text-5xl";
  const pipClass = size === "sm" ? "text-base" : "text-2xl";
  const pipGapClass = size === "sm" ? "gap-x-0.5 gap-y-0" : "gap-x-1 gap-y-1";
  const pipGridClass =
    pipCount && pipCount <= 3
      ? "grid-cols-1"
      : pipCount && pipCount <= 8
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-xl border border-[#cbd5e1] p-1 shadow-[0_4px_14px_rgba(15,23,42,0.18)]"
      style={CARD_FRONT_BACKGROUND}
    >
      <div className={`absolute left-1 top-1 flex flex-col items-center leading-none ${colorClass}`}>
        <span className={`font-black ${rankClass}`}>{card.rank}</span>
      </div>

      {pipCount ? (
        <div className={`grid ${pipGridClass} ${pipGapClass} items-center justify-items-center ${colorClass}`}>
          {Array.from({ length: pipCount }).map((_, index) => (
            <span key={`${card.id}-pip-${index}`} className={`font-black leading-none ${pipClass}`}>
              {suitSymbol}
            </span>
          ))}
        </div>
      ) : (
        <div className={`font-black ${centerClass} ${colorClass}`}>{suitSymbol}</div>
      )}

      <div
        className={`absolute bottom-1 right-1 flex rotate-180 flex-col items-center leading-none ${colorClass}`}
      >
        <span className={`font-black ${rankClass}`}>{card.rank}</span>
      </div>
    </div>
  );
}

function RealCardBack() {
  return (
    <div
      className={`relative ${CARD_SIZE_CLASS} rounded-md border border-[#94a3b8] shadow-[0_2px_7px_rgba(15,23,42,0.2)]`}
      style={CARD_BACK_BACKGROUND}
    >
      <div className="absolute inset-1 rounded-[4px] border border-[rgba(255,255,255,0.55)]" />
      <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">♠</div>
    </div>
  );
}

type SeatPlayers = {
  bottom: CourtPiecePlayer | null;
  left: CourtPiecePlayer | null;
  top: CourtPiecePlayer | null;
  right: CourtPiecePlayer | null;
};

type SeatTrick = {
  bottom: CourtPiecePlayedCard | null;
  left: CourtPiecePlayedCard | null;
  top: CourtPiecePlayedCard | null;
  right: CourtPiecePlayedCard | null;
};

function getTrickKey(trick: CourtPiecePlayedCard[]): string {
  return trick.map((play) => `${play.token}:${play.card.id}`).join("|");
}

function formatPlayedCardLabel(card: CourtPieceCard): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

function CourtPiecePageContent() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [game, setGame] = useState<CourtPieceGameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedTrick, setDisplayedTrick] = useState<CourtPiecePlayedCard[]>([]);
  const lastShownCompletedTrickKeyRef = useRef<string | null>(null);
  const trickLockUntilRef = useRef<number>(0);
  const hideTrickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    const currentTrick = game?.currentTrick ?? [];
    const completedTrick = game?.lastCompletedTrick ?? [];

    if (Date.now() < trickLockUntilRef.current) {
      return;
    }

    if (currentTrick.length > 0) {
      if (hideTrickTimeoutRef.current) {
        clearTimeout(hideTrickTimeoutRef.current);
        hideTrickTimeoutRef.current = null;
      }
      setDisplayedTrick(currentTrick);
      return;
    }

    if (completedTrick.length === 4) {
      const completedTrickKey = getTrickKey(completedTrick);
      if (lastShownCompletedTrickKeyRef.current === completedTrickKey) {
        return;
      }

      lastShownCompletedTrickKeyRef.current = completedTrickKey;
      trickLockUntilRef.current = Date.now() + 1000;
      setDisplayedTrick(completedTrick);
      if (hideTrickTimeoutRef.current) {
        clearTimeout(hideTrickTimeoutRef.current);
      }
      hideTrickTimeoutRef.current = setTimeout(() => {
        trickLockUntilRef.current = 0;
        setDisplayedTrick([]);
        hideTrickTimeoutRef.current = null;
      }, 1000);
      return;
    }

    setDisplayedTrick([]);
  }, [game?.currentTrick, game?.lastCompletedTrick]);

  useEffect(() => {
    return () => {
      if (hideTrickTimeoutRef.current) {
        clearTimeout(hideTrickTimeoutRef.current);
      }
    };
  }, []);

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

  const seatPlayers = useMemo<SeatPlayers>(() => {
    if (!game?.players?.length) {
      return {
        bottom: null,
        left: null,
        top: null,
        right: null,
      };
    }

    const bottom = game.players.find((player) => player.isHuman) ?? game.players[0] ?? null;
    if (!bottom) {
      return {
        bottom: null,
        left: null,
        top: null,
        right: null,
      };
    }

    const bottomSeat = bottom.seatIndex;
    const byOffset = (offset: number) =>
      game.players.find((player) => ((player.seatIndex - bottomSeat + 4) % 4) === offset) ?? null;

    return {
      bottom: byOffset(0),
      left: byOffset(1),
      top: byOffset(2),
      right: byOffset(3),
    };
  }, [game?.players]);

  const seatTrick = useMemo<SeatTrick>(() => {
    const mapped: SeatTrick = {
      bottom: null,
      left: null,
      top: null,
      right: null,
    };

    if (!displayedTrick.length || !seatPlayers.bottom) {
      return mapped;
    }

    const bottomSeat = seatPlayers.bottom.seatIndex;

    displayedTrick.forEach((playedCard) => {
      const offset = (playedCard.seatIndex - bottomSeat + 4) % 4;
      if (offset === 0) {
        mapped.bottom = playedCard;
      } else if (offset === 1) {
        mapped.left = playedCard;
      } else if (offset === 2) {
        mapped.top = playedCard;
      } else if (offset === 3) {
        mapped.right = playedCard;
      }
    });

    return mapped;
  }, [displayedTrick, seatPlayers.bottom]);

  const leadToken = displayedTrick[0]?.token;
  const currentTurnToken =
    game?.status === "in-progress" ? (game.currentTurn?.token ?? null) : null;
  const isTurnPlayer = (player: CourtPiecePlayer | null) =>
    Boolean(player && currentTurnToken && player.token === currentTurnToken);

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
      setDisplayedTrick([]);
      lastShownCompletedTrickKeyRef.current = null;
      trickLockUntilRef.current = 0;
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

        <main>
          <section className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
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

            {game ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)]">
                <span className={`${SUIT_COLORS[game.trumpSuit]} text-lg leading-none`}>
                  {SUIT_SYMBOLS[game.trumpSuit]}
                </span>
                <span className="capitalize">Trump: {game.trumpSuit}</span>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-2xl border border-[var(--danger)] bg-[color-mix(in_oklab,var(--danger),white 88%)] px-4 py-3 text-sm font-medium text-[var(--danger-strong)]">
                {error}
              </p>
            ) : null}

            <div className="mt-6 rounded-[28px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.02))] p-4 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(280px,1fr)_180px] lg:grid-rows-[auto_1fr_auto]">
                <div className="lg:col-start-2 lg:row-start-1">
                  {seatPlayers.top ? (
                    <div
                      className={`mx-auto max-w-xs rounded-2xl border bg-[var(--surface-strong)] px-3 py-2 text-center ${
                        isTurnPlayer(seatPlayers.top)
                          ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent),white_60%)]"
                          : "border-[var(--border-soft)]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {seatPlayers.top.nickName} (Teammate)
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">
                        {seatPlayers.top.score} Score • {seatPlayers.top.tricksWon} Tricks
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold">
                        {isTurnPlayer(seatPlayers.top) ? (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-white">Turn</span>
                        ) : null}
                        {seatTrick.top ? (
                          <span className={`rounded-full border border-[var(--border-soft)] px-2 py-0.5 ${SUIT_COLORS[seatTrick.top.card.suit]}`}>
                            Card: {formatPlayedCardLabel(seatTrick.top.card)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-center -space-x-8">
                        {Array.from({ length: seatPlayers.top.handCount }).map((_, index) => (
                          <div key={`top-card-back-${index}`} className="first:ml-0">
                            <RealCardBack />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="lg:col-start-1 lg:row-start-2">
                  {seatPlayers.left ? (
                    <div
                      className={`h-full rounded-2xl border bg-[var(--surface-strong)] px-3 py-2 text-center lg:flex lg:flex-col lg:items-center lg:justify-center ${
                        isTurnPlayer(seatPlayers.left)
                          ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent),white_60%)]"
                          : "border-[var(--border-soft)]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{seatPlayers.left.nickName}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">
                        {seatPlayers.left.score} Score • {seatPlayers.left.tricksWon} Tricks
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold">
                        {isTurnPlayer(seatPlayers.left) ? (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-white">Turn</span>
                        ) : null}
                        {seatTrick.left ? (
                          <span className={`rounded-full border border-[var(--border-soft)] px-2 py-0.5 ${SUIT_COLORS[seatTrick.left.card.suit]}`}>
                            Card: {formatPlayedCardLabel(seatTrick.left.card)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-col items-center -space-y-16">
                        {Array.from({ length: seatPlayers.left.handCount }).map((_, index) => (
                          <div key={`left-card-back-${index}`}>
                            <RealCardBack />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="lg:col-start-3 lg:row-start-2">
                  {seatPlayers.right ? (
                    <div
                      className={`h-full rounded-2xl border bg-[var(--surface-strong)] px-3 py-2 text-center lg:flex lg:flex-col lg:items-center lg:justify-center ${
                        isTurnPlayer(seatPlayers.right)
                          ? "border-[var(--accent)] ring-2 ring-[color-mix(in_oklab,var(--accent),white_60%)]"
                          : "border-[var(--border-soft)]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{seatPlayers.right.nickName}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">
                        {seatPlayers.right.score} Score • {seatPlayers.right.tricksWon} Tricks
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold">
                        {isTurnPlayer(seatPlayers.right) ? (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-white">Turn</span>
                        ) : null}
                        {seatTrick.right ? (
                          <span
                            className={`rounded-full border border-[var(--border-soft)] px-2 py-0.5 ${SUIT_COLORS[seatTrick.right.card.suit]}`}
                          >
                            Card: {formatPlayedCardLabel(seatTrick.right.card)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-col items-center -space-y-16">
                        {Array.from({ length: seatPlayers.right.handCount }).map((_, index) => (
                          <div key={`right-card-back-${index}`}>
                            <RealCardBack />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="lg:col-start-2 lg:row-start-2">
                  <div className="mx-auto flex h-96 w-full max-w-[380px] items-center justify-center rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-3">
                    {displayedTrick.length ? (
                      <div className="relative h-full w-full">
                        {seatTrick.top ? (
                          <div className="absolute left-1/2 top-0 -translate-x-1/2">
                            <div
                              className={`rounded-2xl p-2 ${seatTrick.top.token === leadToken ? "bg-[color-mix(in_oklab,var(--accent),white 86%)] ring-2 ring-[var(--accent)]" : "bg-[var(--surface)]"}`}
                            >
                              <div className={TABLE_CARD_SIZE_CLASS}>
                                <RealCardFace card={seatTrick.top.card} size="md" />
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {seatTrick.left ? (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2">
                            <div
                              className={`rounded-2xl p-2 ${seatTrick.left.token === leadToken ? "bg-[color-mix(in_oklab,var(--accent),white 86%)] ring-2 ring-[var(--accent)]" : "bg-[var(--surface)]"}`}
                            >
                              <div className={TABLE_CARD_SIZE_CLASS}>
                                <RealCardFace card={seatTrick.left.card} size="md" />
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {seatTrick.right ? (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <div
                              className={`rounded-2xl p-2 ${seatTrick.right.token === leadToken ? "bg-[color-mix(in_oklab,var(--accent),white 86%)] ring-2 ring-[var(--accent)]" : "bg-[var(--surface)]"}`}
                            >
                              <div className={TABLE_CARD_SIZE_CLASS}>
                                <RealCardFace card={seatTrick.right.card} size="md" />
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {seatTrick.bottom ? (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                            <div
                              className={`rounded-2xl p-2 ${seatTrick.bottom.token === leadToken ? "bg-[color-mix(in_oklab,var(--accent),white 86%)] ring-2 ring-[var(--accent)]" : "bg-[var(--surface)]"}`}
                            >
                              <div className={TABLE_CARD_SIZE_CLASS}>
                                <RealCardFace card={seatTrick.bottom.card} size="md" />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-[var(--text-secondary)]">
                        {game?.message ?? "Play one card at a time. Follow the lead suit if you can."}
                      </p>
                    )}
                  </div>
                  {displayedTrick.length === 4 ? (
                    <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Trick complete. Cards clear in 1 second.
                    </p>
                  ) : null}
                </div>

                <div className="lg:col-start-2 lg:row-start-3">
                  {seatPlayers.bottom ? (
                    <div
                      className={`rounded-2xl border px-3 py-3 ${
                        isTurnPlayer(seatPlayers.bottom)
                          ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent),white_92%)]"
                          : "border-[var(--border-soft)] bg-[var(--surface-strong)]"
                      }`}
                    >
                      <div className="text-center text-sm font-semibold text-[var(--text-primary)]">
                        {seatPlayers.bottom.nickName} (You)
                      </div>
                      <div className="mt-1 text-center text-xs text-[var(--text-secondary)]">
                        {seatPlayers.bottom.score} Score • {seatPlayers.bottom.tricksWon} Tricks
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold">
                        {isTurnPlayer(seatPlayers.bottom) ? (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-white">Turn</span>
                        ) : null}
                        {seatTrick.bottom ? (
                          <span
                            className={`rounded-full border border-[var(--border-soft)] px-2 py-0.5 ${SUIT_COLORS[seatTrick.bottom.card.suit]}`}
                          >
                            Card: {formatPlayedCardLabel(seatTrick.bottom.card)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-end justify-center -space-x-12 pb-1">
                        {game?.hand?.map((card, index) => (
                          <button
                            key={card.id}
                            type="button"
                            disabled={!isMyTurn || isPlaying || game.status === "finished"}
                            onClick={() => void handlePlayCard(card)}
                            className={`group relative flex ${USER_CARD_SIZE_CLASS} origin-bottom items-center justify-center rounded-2xl bg-transparent p-0 text-center transition duration-150 hover:z-50 hover:-translate-y-3 hover:scale-[1.18] disabled:cursor-not-allowed disabled:opacity-60`}
                            style={{ zIndex: index + 1 }}
                          >
                            <div className="h-full w-full">
                              <RealCardFace card={card} size="sm" />
                            </div>
                            <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 hidden h-[160px] w-[110px] -translate-x-1/2 group-hover:block">
                              <RealCardFace card={card} size="md" />
                            </div>
                          </button>
                        ))}
                        {!game?.hand?.length ? (
                          <div className="w-full rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-6 text-center text-sm text-[var(--text-secondary)] dark:bg-gray-100">
                            No cards left in your hand.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1.5 text-center text-xs font-semibold text-[var(--text-secondary)]">
                {game?.currentTurn ? `${game.currentTurn.nickName} to act` : "-"}
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
