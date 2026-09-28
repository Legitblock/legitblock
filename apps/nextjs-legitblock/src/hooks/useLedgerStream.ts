"use client";

import { useEffect, useState, useRef } from "react";

export interface LedgerStreamEvent {
  event: string;
  data: any;
  timestamp: string;
}

export function useLedgerStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<LedgerStreamEvent | null>(null);
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [latestBlock, setLatestBlock] = useState<any>(null);
  const [activeProposals, setActiveProposals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimeout: any = null;

    function connect() {
      try {
        es = new EventSource("/api/ledger/stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        es.onerror = () => {
          setIsConnected(false);
          es?.close();
          // Retry connection in 5 seconds
          retryTimeout = setTimeout(connect, 5000);
        };

        es.addEventListener("CONNECTED", (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          setBlockHeight(data.blockHeight || 0);
          setLastEvent({ event: "CONNECTED", data, timestamp: new Date().toISOString() });
        });

        es.addEventListener("SNAPSHOT", (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          setBlockHeight(data.blockHeight || 0);
          setLatestBlock(data.latestBlock || null);
          setActiveProposals(data.activeProposals || []);
          setLastEvent({ event: "SNAPSHOT", data, timestamp: new Date().toISOString() });
        });

        es.addEventListener("BLOCK_MINTED", (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          setBlockHeight(data.blockHeight);
          setLatestBlock(data.block);
          setLastEvent({ event: "BLOCK_MINTED", data, timestamp: new Date().toISOString() });
        });

        es.addEventListener("PING", (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          setBlockHeight(data.blockHeight);
          setLastEvent({ event: "PING", data, timestamp: new Date().toISOString() });
        });

      } catch (err: any) {
        setError(err?.message || "Failed to initialize EventSource");
        retryTimeout = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      if (es) es.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  return {
    isConnected,
    lastEvent,
    blockHeight,
    latestBlock,
    activeProposals,
    error
  };
}
