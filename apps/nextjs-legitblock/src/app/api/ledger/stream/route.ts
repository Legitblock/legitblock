export const dynamic = "force-dynamic";

import { getStore, getBlockchain, getVotingEngine } from "@/lib/ledger";

/**
 * Server-Sent Events (SSE) Live Ledger Stream
 * Streams block confirmations, quorum progression, and proposal updates in real time.
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Controller might be closed
        }
      };

      // 1. Initial State Broadcast
      try {
        const store = getStore();
        const bc = getBlockchain();
        const engine = getVotingEngine();
        const isInit = store.isInitialized();

        sendEvent("CONNECTED", {
          timestamp: new Date().toISOString(),
          message: "Connected to LegitBlock Live Ledger Stream",
          blockHeight: bc.chain.length,
          isInitialized: isInit,
          organization: bc.organization?.name || "Uninitialized"
        });

        // 2. Initial Ledger Snapshot
        sendEvent("SNAPSHOT", {
          blockHeight: bc.chain.length,
          latestBlock: bc.getLatestBlock(),
          activeProposals: isInit ? engine.listProposals({ status: "ACTIVE" }) : [],
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        sendEvent("ERROR", { message: err?.message || "Initialization error" });
      }

      // 3. Periodic Heartbeat & State Monitor
      let lastHeight = -1;
      const interval = setInterval(() => {
        try {
          const bc = getBlockchain();
          const engine = getVotingEngine();
          const currentHeight = bc.chain.length;

          // Emit block minted event if chain advanced
          if (lastHeight !== -1 && currentHeight > lastHeight) {
            sendEvent("BLOCK_MINTED", {
              blockHeight: currentHeight,
              block: bc.getLatestBlock(),
              timestamp: new Date().toISOString()
            });
          }
          lastHeight = currentHeight;

          // Heartbeat ping
          sendEvent("PING", {
            blockHeight: currentHeight,
            activeProposalsCount: engine.listProposals({ status: "ACTIVE" }).length,
            timestamp: new Date().toISOString()
          });
        } catch {
          // Ignore polling errors
        }
      }, 5000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
