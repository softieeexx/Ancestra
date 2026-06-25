"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, usePublicClient, useSendTransaction } from "wagmi";
import { parseUnits, formatEther, parseEther, Address, keccak256, stringToBytes, slice, decodeEventLog } from "viem";
import { config, ritualChain } from "@/lib/config";
import AppNav from "@/components/AppNav";
import DappFrame from "@/components/DappFrame";
import WalletConnect from "@/components/WalletConnect";
import { CONTRACTS, ANCESTRA_AGENT_ABI, ANCESTRA_AGENT_BYTECODE } from "@/lib/constants";
import { FACTORY_ABI } from "@/lib/abi";


// RitualWallet ABI
const RITUAL_WALLET_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "lockDuration", "type": "uint256" }],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// AsyncJobTracker ABI
const ASYNC_JOB_TRACKER_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }],
    "name": "hasPendingJobForSender",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default function OraclePage() {
  const { isConnected, address } = useAccount();
  const { data: ritualBalance, refetch: refetchRitualBalance } = useBalance({ address, chainId: ritualChain.id });
  const publicClient = usePublicClient({ chainId: ritualChain.id });
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  // Query Factory feeToSetter to determine the dApp owner
  const { data: feeToSetter } = useReadContract({
    address: CONTRACTS.FACTORY,
    abi: FACTORY_ABI,
    functionName: "feeToSetter",
  });

  const isDappOwner =
    !!address &&
    (address.toLowerCase() === "0xde13d407093e0c0f4c3131b31b4b7b2d604a00da" ||
      (!!feeToSetter && address.toLowerCase() === feeToSetter.toLowerCase()));

  // Global deployed agent address
  const [agentAddress, setAgentAddress] = useState<Address | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [depositing, setDepositing] = useState(false);
  const [prompt, setPrompt] = useState("Analyze the current state of WRITUAL pools and suggest an optimal allocation.");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);

  // Load global deployed agent address from localStorage (simulates owner configuration)
  useEffect(() => {
    const saved = localStorage.getItem("ancestra_global_agent_address");
    if (saved && saved.startsWith("0x")) {
      setAgentAddress(saved as Address);
    }
  }, []);

  // Escrow balance from RitualWallet
  const { data: escrowBal, refetch: refetchEscrow } = useReadContract({
    address: CONTRACTS.RITUAL_WALLET,
    abi: RITUAL_WALLET_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  // Check if sender has a pending job on AsyncJobTracker
  const { data: hasPendingJob, refetch: refetchPendingJob } = useReadContract({
    address: CONTRACTS.ASYNC_JOB_TRACKER,
    abi: ASYNC_JOB_TRACKER_ABI,
    functionName: "hasPendingJobForSender",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Read current results from the contract
  const { data: lastJobId } = useReadContract({
    address: agentAddress || undefined,
    abi: ANCESTRA_AGENT_ABI,
    functionName: "lastJobId",
    query: { enabled: !!agentAddress, refetchInterval: 3000 },
  });

  const { data: lastResultText } = useReadContract({
    address: agentAddress || undefined,
    abi: ANCESTRA_AGENT_ABI,
    functionName: "lastResultText",
    query: { enabled: !!agentAddress, refetchInterval: 3000 },
  });

  // Monitor fulfillment status
  useEffect(() => {
    if (currentJobId && lastJobId && lastResultText) {
      if (lastJobId.toLowerCase() === currentJobId.toLowerCase() && lastResultText !== "") {
        setAgentResponse(lastResultText as string);
        setLoading(false);
        setStatusText("Oracle consultation completed successfully!");
        setCurrentJobId(null);
        refetchEscrow();
        refetchRitualBalance();
      }
    }
  }, [lastJobId, lastResultText, currentJobId, refetchEscrow, refetchRitualBalance]);

  // Deploy AncestraAgent Contract (Only visible/triggered in Admin Mode by DApp Owner)
  const handleDeploy = async () => {
    if (!address || !isDappOwner) return;
    setDeploying(true);
    setStatusText("Initiating agent contract deployment...");
    try {
      const txHash = await sendTransactionAsync({
        data: ANCESTRA_AGENT_BYTECODE,
      });
      setStatusText("Waiting for contract deployment confirmation...");
      const receipt = await publicClient!.waitForTransactionReceipt({ hash: txHash });
      if (receipt.contractAddress) {
        const deployedAddr = receipt.contractAddress;
        setAgentAddress(deployedAddr);
        localStorage.setItem("ancestra_global_agent_address", deployedAddr);
        setStatusText(`Sovereign Agent contract successfully deployed by Owner at ${deployedAddr}`);
      } else {
        throw new Error("Deployment confirmed but contract address is missing.");
      }
    } catch (err: any) {
      console.error(err);
      setStatusText(`Deployment failed: ${err.message || err}`);
    } finally {
      setDeploying(false);
    }
  };

  // Deposit to RitualWallet Escrow
  const handleDeposit = async () => {
    if (!address || !depositAmount) return;
    setDepositing(true);
    try {
      const val = parseEther(depositAmount);
      const tx = await writeContractAsync({
        address: CONTRACTS.RITUAL_WALLET,
        abi: RITUAL_WALLET_ABI,
        functionName: "deposit",
        args: [500n],
        value: val,
      });
      await publicClient!.waitForTransactionReceipt({ hash: tx });
      refetchEscrow();
      refetchRitualBalance();
      setDepositAmount("0.1");
    } catch (err) {
      console.error(err);
    } finally {
      setDepositing(false);
    }
  };

  const handleClearSaved = () => {
    if (!isDappOwner) return;
    localStorage.removeItem("ancestra_global_agent_address");
    setAgentAddress(null);
    setAgentResponse(null);
    setStatusText("");
  };

  // Trigger Sovereign Agent Query
  const handleConsultOracle = async () => {
    if (!address || !agentAddress || !prompt) return;

    setLoading(true);
    setAgentResponse(null);
    setStatusText("Discovering active TEE executor from TEEServiceRegistry...");

    try {
      // 1. Check pending jobs
      const pending = await publicClient!.readContract({
        address: CONTRACTS.ASYNC_JOB_TRACKER,
        abi: ASYNC_JOB_TRACKER_ABI,
        functionName: "hasPendingJobForSender",
        args: [address],
      });

      if (pending) {
        throw new Error("You already have a pending job on the Ritual Network. Please wait for it to settle before submitting a new one.");
      }

      // 2. Discover TEE Executor
      const randomSeed = BigInt(Math.floor(Math.random() * 1000000));
      let executor: Address = "0x2dF2080753059239D80b045AEF505e8129DA2a3948"; // default fallback
      try {
        const serviceNode = await publicClient!.readContract({
          address: CONTRACTS.TEE_SERVICE_REGISTRY,
          abi: [
            {
              "inputs": [
                { "internalType": "uint8", "name": "capability", "type": "uint8" },
                { "internalType": "bool", "name": "checkValidity", "type": "bool" },
                { "internalType": "uint256", "name": "seed", "type": "uint256" },
                { "internalType": "uint256", "name": "maxProbes", "type": "uint256" }
              ],
              "name": "pickServiceByCapability",
              "outputs": [
                { "internalType": "address", "name": "teeAddress", "type": "address" },
                { "internalType": "bool", "name": "found", "type": "bool" }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ],
          functionName: "pickServiceByCapability",
          args: [0, true, randomSeed, 10n],
        });
        if (serviceNode && serviceNode[1]) {
          executor = serviceNode[0];
          console.log("Selected dynamic TEE executor:", executor);
        }
      } catch (err) {
        console.warn("TEEServiceRegistry query failed, utilizing fallback executor.", err);
      }

      // 3. Compute Callback Selector (onSovereignAgentResult(bytes32,bytes))
      const selector = slice(keccak256(stringToBytes("onSovereignAgentResult(bytes32,bytes)")), 0, 4);

      // 4. Encode Sovereign Agent 23-Field Payload
      setStatusText("Encoding Sovereign Agent payload...");
      const { encodeAbiParameters } = await import("viem");
      const encodedPayload = encodeAbiParameters(
        [
          { name: "executor", type: "address" },
          { name: "ttl", type: "uint256" },
          { name: "userPublicKey", type: "bytes" },
          { name: "pollIntervalBlocks", type: "uint64" },
          { name: "maxPollBlock", type: "uint64" },
          { name: "taskIdMarker", type: "string" },
          { name: "deliveryTarget", type: "address" },
          { name: "deliverySelector", type: "bytes4" },
          { name: "deliveryGasLimit", type: "uint256" },
          { name: "deliveryMaxFeePerGas", type: "uint256" },
          { name: "deliveryMaxPriorityFeePerGas", type: "uint256" },
          { name: "agentType", type: "uint16" },
          { name: "prompt", type: "string" },
          { name: "encryptedSecrets", type: "bytes" },
          {
            name: "convoHistory",
            type: "tuple",
            components: [
              { name: "platform", type: "string" },
              { name: "path", type: "string" },
              { name: "keyRef", type: "string" }
            ]
          },
          {
            name: "output",
            type: "tuple",
            components: [
              { name: "platform", type: "string" },
              { name: "path", type: "string" },
              { name: "keyRef", type: "string" }
            ]
          },
          {
            name: "skills",
            type: "tuple[]",
            components: [
              { name: "platform", type: "string" },
              { name: "path", type: "string" },
              { name: "keyRef", type: "string" }
            ]
          },
          {
            name: "systemPrompt",
            type: "tuple",
            components: [
              { name: "platform", type: "string" },
              { name: "path", type: "string" },
              { name: "keyRef", type: "string" }
            ]
          },
          { name: "model", type: "string" },
          { name: "tools", type: "string[]" },
          { name: "maxTurns", type: "uint16" },
          { name: "maxTokens", type: "uint32" },
          { name: "rpcUrls", type: "string" }
        ],
        [
          executor,
          100n,
          "0x",
          10n,
          200n,
          "",
          agentAddress,
          selector,
          1500000n,
          20000000000n, // 20 Gwei
          2000000000n, // 2 Gwei
          0, // Claude Code
          prompt,
          "0x",
          { platform: "", path: "", keyRef: "" },
          { platform: "", path: "", keyRef: "" },
          [],
          { platform: "", path: "", keyRef: "" },
          "zai-org/GLM-4.7-FP8",
          [],
          5,
          4000,
          ""
        ]
      );

      // 5. Submit Transaction to Deployed Agent
      setStatusText("Submitting query transaction to AncestraAgent contract (Phase 1)...");
      const tx = await writeContractAsync({
        address: agentAddress,
        abi: ANCESTRA_AGENT_ABI,
        functionName: "callSovereignAgent",
        args: [encodedPayload],
      });

      setStatusText("Waiting for transaction confirmation...");
      const receipt = await publicClient!.waitForTransactionReceipt({ hash: tx });
      
      // Parse Job ID from event or read state
      let jobId: string | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ANCESTRA_AGENT_ABI,
            eventName: "AgentCallInitiated",
            topics: log.topics,
            data: log.data,
          });
          if (decoded && decoded.args) {
            jobId = decoded.args.jobId;
            break;
          }
        } catch {
          // not our event, skip
        }
      }

      if (!jobId) {
        const contractJobId = await publicClient!.readContract({
          address: agentAddress,
          abi: ANCESTRA_AGENT_ABI,
          functionName: "lastJobId",
        });
        jobId = contractJobId as string;
      }

      console.log("Initiated Job ID:", jobId);
      setCurrentJobId(jobId);
      setStatusText(`Phase 1 settled! Job ID: ${jobId.slice(0, 10)}... Waiting for Phase 2 callback from TEE executor (~60-90 seconds)...`);
    } catch (err: any) {
      console.error(err);
      setStatusText(`Error: ${err.message || err}`);
      setLoading(false);
    }
  };

  return (
    <DappFrame>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,168,83,0.06) 0%, transparent 65%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        <AppNav />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <p className="font-rajdhani font-semibold tracking-[0.4em] uppercase mb-2" style={{ color: "#c9a84c", fontSize: "0.68rem" }}>
            Enshrined AI Oracle
          </p>
          <h1 className="font-cinzel font-black text-white leading-tight text-3xl md:text-4xl">
            Ancestral Oracle
          </h1>
          <p className="mt-2 mx-auto text-sm max-w-md text-earth-100/50">
            Consult a Sovereign Agent executing inside a verifiable TEE on the Ritual Network. Uses the shared global contract deployed by the owner.
          </p>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 mt-12 bg-earth-900/60 p-8 rounded-2xl border border-ritual/10 max-w-sm w-full text-center">
            <span className="text-4xl">◈</span>
            <p className="text-sm text-earth-100/60">Connect your wallet to access the Ancestral Oracle and send queries.</p>
            <WalletConnect />
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-6">
            {/* Owner Admin Mode Toggle */}
            {isDappOwner && (
              <div className="flex items-center justify-end">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdminMode}
                    onChange={(e) => setIsAdminMode(e.target.checked)}
                    className="rounded border-ritual bg-earth-900 text-ritual focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-mono tracking-wider uppercase text-earth-100/40">DApp Admin Mode</span>
                </label>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar: Escrow and Deployment */}
              <div className="md:col-span-1 space-y-5">
                {/* Escrow Panel */}
                <div
                  className="p-5 rounded-2xl border bg-earth-900/50 backdrop-blur-md"
                  style={{ borderColor: "rgba(212, 168, 83, 0.12)" }}
                >
                  <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#c9a84c" }}>◈</span> Ritual Escrow
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-earth-100/40">Your Balance:</span>
                      <span className="text-white font-medium">
                        {ritualBalance ? parseFloat(formatEther(ritualBalance.value)).toFixed(4) : "—"} RITUAL
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-earth-100/40">Escrowed Balance:</span>
                      <span className="text-ritual font-semibold">
                        {escrowBal ? parseFloat(formatEther(escrowBal as bigint)).toFixed(4) : "0.0000"} RITUAL
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={depositing}
                        className="w-full pl-3 pr-16 py-2 text-xs font-semibold rounded-xl bg-black border outline-none text-white"
                        style={{ borderColor: "rgba(255,255,255,0.08)" }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-earth-100/40 font-mono font-semibold">RITUAL</span>
                    </div>
                    <button
                      onClick={handleDeposit}
                      disabled={depositing || !depositAmount || depositAmount === "0"}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-98 disabled:opacity-50"
                      style={{
                        background: "rgba(212,168,83,0.12)",
                        border: "1px solid rgba(212,168,83,0.22)",
                        color: "#D4A853",
                      }}
                    >
                      {depositing ? "Depositing..." : "Deposit to Escrow"}
                    </button>
                  </div>
                </div>

                {/* Owner-Only Deployment Panel */}
                {isAdminMode && (
                  <div
                    className="p-5 rounded-2xl border bg-earth-900/50 backdrop-blur-md border-ritual/20 animate-fade-in"
                    style={{ background: "rgba(212, 168, 83, 0.03)" }}
                  >
                    <h3 className="font-display font-bold text-sm text-[#D4A853] mb-4 flex items-center gap-2">
                      <span className="text-xs">🛠</span> Owner Admin Panel
                    </h3>

                    {agentAddress ? (
                      <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-black/40 border border-ritual/10">
                          <p className="text-[10px] text-earth-100/40 font-mono uppercase tracking-wider mb-1">Global Contract Address</p>
                          <p className="text-xs font-mono text-white/90 break-all">{agentAddress}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
                          <p className="text-xs text-green-400 font-medium">✓ Agent Active</p>
                        </div>
                        <button
                          onClick={handleClearSaved}
                          className="w-full py-2 text-xs font-semibold text-red-400/80 hover:text-red-400 transition-colors"
                        >
                          Tear Down Agent Contract
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-earth-100/50 leading-relaxed">
                          As DApp Owner, deploy the global `AncestraAgent` contract instances so that users can query the AI Oracle.
                        </p>
                        <button
                          onClick={handleDeploy}
                          disabled={deploying}
                          className="w-full py-2.5 rounded-xl text-xs font-bold uppercase transition-all active:scale-98 disabled:opacity-50"
                          style={{
                            background: "#D4A853",
                            color: "#090810",
                            boxShadow: "0 0 16px rgba(212, 168, 83, 0.18)",
                          }}
                        >
                          {deploying ? "Deploying..." : "Deploy Agent Contract"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Console: Prompt & Terminals */}
              <div className="md:col-span-2 space-y-5">
                {/* Query Console */}
                <div
                  className="p-5 rounded-2xl border bg-earth-900/50 backdrop-blur-md flex flex-col h-full"
                  style={{ borderColor: "rgba(212, 168, 83, 0.12)" }}
                >
                  <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#c9a84c" }}>◈</span> Consult the Ancestral Oracle
                  </h3>

                  <div className="space-y-4 flex-1 flex flex-col">
                    {!agentAddress ? (
                      <div className="p-8 text-center rounded-xl bg-black/20 border border-white/5 my-auto">
                        <p className="text-sm text-earth-100/40">The Sovereign Agent contract is not yet deployed by the Owner.</p>
                        <p className="text-xs text-earth-100/30 mt-2">
                          {isDappOwner
                            ? "Enable DApp Admin Mode to deploy the contract."
                            : "Please contact the DApp Owner to deploy the Sovereign Agent."}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] text-earth-100/40 uppercase tracking-widest font-mono mb-1.5">Oracle Prompt</label>
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={loading}
                            rows={3}
                            className="w-full p-3 rounded-xl bg-black text-white text-xs border outline-none leading-relaxed resize-none disabled:opacity-60"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}
                          />
                        </div>

                        <button
                          onClick={handleConsultOracle}
                          disabled={loading || !prompt || hasPendingJob}
                          className="py-3 px-6 rounded-xl text-xs font-bold uppercase transition-all active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2"
                          style={{
                            background: "linear-gradient(90deg, #D4A853, #b88f3b)",
                            color: "#090810",
                            boxShadow: "0 4px 20px rgba(212, 168, 83, 0.15)",
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              Querying Agent...
                            </>
                          ) : hasPendingJob ? (
                            "Pending Job In Progress..."
                          ) : (
                            "Consult Oracle"
                          )}
                        </button>
                      </>
                    )}

                    {/* Status update box */}
                    {statusText && (
                      <div
                        className="p-3 rounded-xl border text-xs font-mono break-all leading-normal"
                        style={{
                          background: "rgba(212, 168, 83, 0.04)",
                          borderColor: "rgba(212, 168, 83, 0.1)",
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        <span className="text-[#D4A853] font-bold">● STATUS: </span>
                        {statusText}
                      </div>
                    )}

                    {/* Terminal Display */}
                    <div className="flex-1 flex flex-col mt-2">
                      <span className="block text-[10px] text-earth-100/40 uppercase tracking-widest font-mono mb-1.5">Oracle Terminal</span>
                      <div
                        className="flex-1 min-h-[220px] max-h-[350px] overflow-y-auto p-4 rounded-xl border font-mono text-xs leading-relaxed"
                        style={{
                          background: "#050408",
                          borderColor: "rgba(255,255,255,0.04)",
                        }}
                      >
                        {agentResponse ? (
                          <div className="text-green-400/90 whitespace-pre-wrap">
                            {agentResponse}
                          </div>
                        ) : loading ? (
                          <div className="text-yellow-500/80 animate-pulse">
                            &gt; Accessing TEE enclave...
                            <br />
                            &gt; Initiating sovereign harness...
                            <br />
                            &gt; Running agent tools on market state...
                            <br />
                            &gt; Verifying outputs...
                          </div>
                        ) : (
                          <div className="text-earth-100/30">
                            &gt; Oracle is idle. Submit a query to initiate verifiable TEE agent execution.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        className="relative z-10 text-center py-6"
        style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.65rem", letterSpacing: "0.2em", fontFamily: "Rajdhani, sans-serif" }}
      >
        RITUAL TESTNET · ANCESTRA DEX AI AGENT
      </footer>
    </DappFrame>
  );
}
