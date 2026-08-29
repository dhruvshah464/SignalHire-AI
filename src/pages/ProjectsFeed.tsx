import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Markdown from "react-markdown";
import {
  Sparkles,
  Activity,
  Users,
  Rocket,
  Target,
  Zap,
  BrainCircuit,
  TrendingUp,
  Cpu,
  ArrowRight,
  Globe,
  Radar,
  Settings,
  AlertTriangle,
  ListChecks,
  Lightbulb,
  Sprout,
  Brain,
  Network,
  Sword,
  Fingerprint,
  Crosshair,
  Map as MapIcon,
  Building2,
  Terminal,
  Radio,
  Newspaper,
  Play,
  Triangle,
  BarChart2,
  Bot,
  ScanSearch,
  Eye,
  Database,
  Dna,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  FileEdit,
  Send,
  Layers,
  History,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { AnimatedProjectCard } from "@/components/projects/AnimatedProjectCard";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectStatusStepper } from "@/components/projects/ProjectStatusStepper";
import { InterviewPrepModal } from "@/components/interview/InterviewPrepModal";
import { InterviewTriggerBanner } from "@/components/interview/InterviewTriggerBanner";
import { triggerInterviewPrepAgent } from "@/lib/interviewPrep";
import { toast } from "sonner";
import {
  ProjectStatusType,
  StatusHistoryEntry,
  normalizeStatus,
  STATUS_CONFIGS,
} from "@/components/projects/statusTypes";

// --- MOCK DATA FOR CIVILIZATION LAYER ---

const MOCK_STARTUPS = [
  {
    id: "1",
    name: "Nexus API",
    tagline: "Universal AI Agent Routing",
    stage: "Sent",
    status: "sent",
    momentum: 94,
    cap: "$14.2M",
    tags: ["AI Infra", "Routing"],
    color: "from-blue-500 to-cyan-400",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 100) + 40,
    })),
  },
  {
    id: "2",
    name: "Aether OS",
    tagline: "Spatial Compute Engine",
    stage: "Interviewing",
    status: "interviewing",
    momentum: 88,
    cap: "$28.5M",
    tags: ["AR", "OS"],
    color: "from-purple-500 to-pink-500",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 80) + 30,
    })),
  },
  {
    id: "3",
    name: "Synthetix Bio",
    tagline: "AI Protein Assembly",
    stage: "Offer",
    status: "offer",
    momentum: 98,
    cap: "$112M",
    tags: ["Hard Tech", "Bio"],
    color: "from-emerald-400 to-teal-500",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 120) + 80,
    })),
  },
  {
    id: "4",
    name: "Vortex Finance",
    tagline: "Decentralized Dark Pools",
    stage: "Draft",
    status: "draft",
    momentum: 64,
    cap: "$2.1M",
    tags: ["DeFi", "Liquidity"],
    color: "from-orange-400 to-amber-500",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 50) + 10,
    })),
  },
  {
    id: "5",
    name: "Chrono Mesh",
    tagline: "Temporal Distributed Consensus",
    stage: "Draft",
    status: "draft",
    momentum: 72,
    cap: "$6.5M",
    tags: ["Consensus", "Distributed"],
    color: "from-amber-400 to-rose-500",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 60) + 25,
    })),
  },
  {
    id: "6",
    name: "Omniscience ML",
    tagline: "Continuous Autonomous Fine-Tuning",
    stage: "Replied",
    status: "replied",
    momentum: 91,
    cap: "$19.8M",
    tags: ["Autonomous AI", "Fine-Tuning"],
    color: "from-teal-400 to-emerald-500",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 90) + 50,
    })),
  },
];

const INITIAL_METRICS = [
  {
    id: "m1",
    label: "Ecosystem Pulse",
    value: 14209,
    icon: Activity,
    trend: "+4.2%",
    color: "#3b82f6",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 14000 + Math.random() * 500,
    })),
    format: (v: number) => Math.floor(v).toLocaleString(),
  },
  {
    id: "m2",
    label: "AI Spawned Ventures",
    value: 489,
    icon: Dna,
    trend: "+12.4%",
    color: "#10b981",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 450 + Math.random() * 50,
    })),
    format: (v: number) => Math.floor(v).toLocaleString(),
  },
  {
    id: "m3",
    label: "Global Valuation",
    value: 84.2,
    icon: Radar,
    trend: "+8.1%",
    color: "#8b5cf6",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 80 + Math.random() * 5,
    })),
    format: (v: number) => "$" + v.toFixed(1) + "B",
  },
  {
    id: "m4",
    label: "Nodes Active",
    value: 3.2,
    icon: Network,
    trend: "+1.2%",
    color: "#f59e0b",
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 3 + Math.random() * 0.5,
    })),
    format: (v: number) => v.toFixed(1) + "M",
  },
];

const MOCK_AI_INTERVENTIONS = [
  {
    time: "14:22:04",
    type: "warning",
    action: "MERGER_PROPOSED",
    text: "Collision detected: NEXA and QBIO building identical routing layers. AI proposing merger protocol.",
  },
  {
    time: "14:21:18",
    type: "success",
    action: "CODE_DEPLOYED",
    text: "Aether OS achieved autonomous self-correction in core API. 4 vulnerabilities patched.",
  },
  {
    time: "14:19:45",
    type: "info",
    action: "RESOURCE_SHIFT",
    text: "Capital rotation protocol triggered. Vectoring $400M from infrastructure to application-layer biology.",
  },
  {
    time: "14:15:02",
    type: "alert",
    action: "FAILURE_PREDICTION",
    text: "Vortex Finance execution velocity trailing by 15%. 82% failure probability. AI Co-founder dispatched.",
  },
  {
    time: "14:10:33",
    type: "info",
    action: "FOUNDER_ALERT",
    text: "Fatigue detected in CEO biometric telemetry. Forcing 24h offline sprint recovery.",
  },
];

const MAP_DATA = Array.from({ length: 150 }, () => ({
  x: Math.random() * 1000,
  y: Math.random() * 500,
  z: Math.random() * 100,
  fill: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][
    Math.floor(Math.random() * 4)
  ],
}));

const MOCK_TICKERS = [
  {
    pair: "NEXA",
    name: "Nexus AI Systems",
    price: 142.12,
    change: "+12.4%",
    cap: "412M",
    type: "up",
  },
  {
    pair: "QBIO",
    name: "Quantum Bio Labs",
    price: 92.4,
    change: "+5.2%",
    cap: "1.2B",
    type: "up",
  },
  {
    pair: "VRX",
    name: "Vortex Finance",
    price: 14.5,
    change: "-2.1%",
    cap: "140M",
    type: "down",
  },
  {
    pair: "AURA",
    name: "Aura HealthOS",
    price: 4.88,
    change: "-14.2%",
    cap: "89M",
    type: "down",
  },
  {
    pair: "SYN",
    name: "Synthetix Bio",
    price: 104.2,
    change: "+8.9%",
    cap: "112M",
    type: "up",
  },
];

const MOCK_ASKS = Array.from({ length: 8 }, (_, i) => ({
  price: (142.12 + 0.1 * i + Math.random() * 0.1).toFixed(2),
  size: Math.floor(Math.random() * 2000 + 500),
  type: "ask",
})).reverse(); // High price to low price

const MOCK_BIDS = Array.from({ length: 8 }, (_, i) => ({
  price: (142.1 - 0.1 * i - Math.random() * 0.1).toFixed(2),
  size: Math.floor(Math.random() * 2000 + 500),
  type: "bid",
}));

const MOCK_ORDER_BOOK = [...MOCK_ASKS, ...MOCK_BIDS];

const MOCK_AI_ANALYSTS = [
  {
    name: "Oracle-7",
    insight:
      "Execution risk detected in competing layers. NEXA trajectory suggests high growth.",
    confidence: "89.4%",
    type: "bull",
  },
  {
    name: "Sentinel",
    insight:
      "Overvaluation detected in generalist LLMs. Capital rotating towards specialized biotech.",
    confidence: "94.1%",
    type: "bear",
  },
  {
    name: "Atlas",
    insight:
      "Ecosystem momentum for AURA is slowing. Monitor for team restructuring signals.",
    confidence: "76.2%",
    type: "warning",
  },
];

const MOCK_NEWS = [
  {
    title: "Why QBIO is dominating biotech momentum",
    category: "AI Analysis",
    time: "2m ago",
    impact: "High",
    image:
      "https://images.unsplash.com/photo-1620825937374-87fc7d6daf95?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Fintech sector momentum rising in India",
    category: "Ecosystem Pulse",
    time: "14m ago",
    impact: "Macro",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "The collapse of weak execution teams",
    category: "Venture Report",
    time: "1h ago",
    impact: "Warning",
    image:
      "https://images.unsplash.com/photo-1614064641936-3899884d24ad?auto=format&fit=crop&q=80&w=600",
  },
];

export default function ProjectsFeed() {
  const [metricsData, setMetricsData] = useState(INITIAL_METRICS);
  const [startupsData, setStartupsData] = useState(() => {
    try {
      const stored = localStorage.getItem("ventureMemory_startups");
      return stored ? JSON.parse(stored) : MOCK_STARTUPS;
    } catch {
      return MOCK_STARTUPS;
    }
  });
  const [marketTickers, setMarketTickers] = useState(MOCK_TICKERS);
  const [orderBook, setOrderBook] = useState(MOCK_ORDER_BOOK);
  const [activeTab, setActiveTab] = useState<
    "consciousness" | "globe" | "spawning" | "terminal" | "media" | "founder"
  >(() => {
    try {
      const stored = localStorage.getItem("ventureMemory_activeTab");
      return stored ? (stored as any) : "consciousness";
    } catch {
      return "consciousness";
    }
  });
  const [activeStartupId, setActiveStartupId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem("ventureMemory_activeStartupId");
      return stored ? stored : null;
    } catch {
      return null;
    }
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>("");
  const [isDraftModalOpen, setIsDraftModalOpen] = useState<boolean>(false);
  const [newProjectDraft, setNewProjectDraft] = useState({
    name: "",
    tagline: "",
    tags: "AI Infra, Core Engine",
    cap: "$5.0M",
  });

  // Automated AI Interview Preparation Workflow State
  const [interviewPrepTarget, setInterviewPrepTarget] = useState<{
    id: string;
    name: string;
    subtitle?: string;
    tags?: string[];
    cap?: string;
    notes?: string;
  } | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState<boolean>(false);
  const [isInterviewBannerOpen, setIsInterviewBannerOpen] = useState<boolean>(false);

  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem("ventureMemory_statusHistory");
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: "hist-init-1",
              projectId: "1",
              projectName: "Nexus API",
              fromStatus: "draft" as ProjectStatusType,
              toStatus: "sent" as ProjectStatusType,
              timestamp: "02:15:30",
              note: "Dispatched API routing orchestrator to venture ecosystem",
            },
            {
              id: "hist-init-2",
              projectId: "2",
              projectName: "Aether OS",
              fromStatus: "sent" as ProjectStatusType,
              toStatus: "interviewing" as ProjectStatusType,
              timestamp: "01:45:12",
              note: "Technical evaluation unlocked with spatial compute leads",
            },
            {
              id: "hist-init-3",
              projectId: "3",
              projectName: "Synthetix Bio",
              fromStatus: "interviewing" as ProjectStatusType,
              toStatus: "offer" as ProjectStatusType,
              timestamp: "01:10:00",
              note: "Scale milestones confirmed and production allocation active",
            },
          ];
    } catch {
      return [];
    }
  });

  // Venture Memory Engine: Persist to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem("ventureMemory_startups", JSON.stringify(startupsData));
    } catch (e) {
      console.warn("Venture Memory Engine: failed to persist startups data.");
    }
  }, [startupsData]);

  useEffect(() => {
    try {
      localStorage.setItem("ventureMemory_statusHistory", JSON.stringify(statusHistory));
    } catch (e) {
      console.warn("Venture Memory Engine: failed to persist status history.");
    }
  }, [statusHistory]);

  const handleStatusUpdate = (
    id: string,
    newStatus: ProjectStatusType,
    oldStatus: ProjectStatusType
  ) => {
    const targetProject = startupsData.find((p: any) => p.id === id);
    const newStageLabel = STATUS_CONFIGS[newStatus]?.label || newStatus;

    setStartupsData((prev: any[]) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              stage: newStageLabel,
            }
          : item
      )
    );

    const newEntry: StatusHistoryEntry = {
      id: `hist-${Date.now()}`,
      projectId: id,
      projectName: targetProject?.name || "Venture Project",
      fromStatus: oldStatus,
      toStatus: newStatus,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      note: `Shifted lifecycle status from ${
        STATUS_CONFIGS[oldStatus]?.shortLabel || oldStatus
      } to ${STATUS_CONFIGS[newStatus]?.shortLabel || newStatus}`,
    };

    setStatusHistory((prev) => [newEntry, ...prev]);

    // AUTOMATED WORKFLOW: Trigger AI Interview Preparation Agent
    if (newStatus === "interviewing") {
      const projMeta = {
        id,
        name: targetProject?.name || "Venture Project",
        subtitle: targetProject?.tagline || "",
        tags: targetProject?.tags || ["AI Infra", "Scale"],
        cap: targetProject?.cap || "$10M+",
        notes: `Pipeline transition from ${oldStatus} to interviewing.`,
      };

      setInterviewPrepTarget(projMeta);
      setIsInterviewBannerOpen(true);

      // Pre-fetch/generate dossier in background
      triggerInterviewPrepAgent({
        targetId: id,
        targetType: "project",
        targetName: projMeta.name,
        subtitle: projMeta.subtitle,
        tags: projMeta.tags,
        capOrSalary: projMeta.cap,
        notes: projMeta.notes,
      }).catch((err) => console.warn("Background prep agent warmup:", err));

      toast.info(`AI Agent Activated: Preparing Interview Dossier for ${projMeta.name}`, {
        description: "Principal-level technical questions, STAR behavioral frameworks & strategic tips generated.",
        action: {
          label: "View Dossier",
          onClick: () => {
            setInterviewPrepTarget(projMeta);
            setIsInterviewModalOpen(true);
            setIsInterviewBannerOpen(false);
          },
        },
      });
    }
  };

  const handleCreateDraftProject = () => {
    if (!newProjectDraft.name.trim()) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      name: newProjectDraft.name.trim(),
      tagline:
        newProjectDraft.tagline.trim() ||
        "Autonomous next-generation venture blueprint.",
      stage: "Draft",
      status: "draft",
      momentum: 60 + Math.floor(Math.random() * 25),
      cap: newProjectDraft.cap || "$4.2M",
      tags: newProjectDraft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      color: "from-amber-400 to-orange-500",
      chartData: Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 30 + Math.floor(Math.random() * 40),
      })),
    };

    setStartupsData((prev: any[]) => [newProject, ...prev]);

    const initialEntry: StatusHistoryEntry = {
      id: `hist-${Date.now()}`,
      projectId: newProject.id,
      projectName: newProject.name,
      fromStatus: "draft",
      toStatus: "draft",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      note: "Draft project blueprint initialized in local memory engine",
    };

    setStatusHistory((prev) => [initialEntry, ...prev]);
    setNewProjectDraft({
      name: "",
      tagline: "",
      tags: "AI Infra, Core Engine",
      cap: "$5.0M",
    });
    setIsDraftModalOpen(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem("ventureMemory_activeTab", activeTab);
    } catch (e) {
      // Ignore
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      if (activeStartupId) {
        localStorage.setItem("ventureMemory_activeStartupId", activeStartupId);
      } else {
        localStorage.removeItem("ventureMemory_activeStartupId");
      }
    } catch (e) {
      // Ignore
    }
  }, [activeStartupId]);

  // Pulse effect loops
  useEffect(() => {
    const interval = setInterval(() => {
      setStartupsData((current) =>
        current.map((startup) => {
          const lastValue =
            startup.chartData[startup.chartData.length - 1].value;
          const lastTime = startup.chartData[startup.chartData.length - 1].time;
          const newValue = Math.max(
            10,
            Math.min(200, lastValue + (Math.random() * 20 - 10)),
          );
          const newChartData = [
            ...startup.chartData.slice(1),
            { time: lastTime + 1, value: newValue },
          ];
          return {
            ...startup,
            momentum: Math.max(0, Math.min(100, Math.floor(lastValue))),
            chartData: newChartData,
          };
        }),
      );

      setMarketTickers((current) =>
        current.map((ticker) => {
          const change = Math.random() * 4 - 2;
          const newPrice = Math.max(1, ticker.price + change);
          const percentChange = (change / ticker.price) * 100;
          const isUp = change >= 0;
          return {
            ...ticker,
            price: parseFloat(newPrice.toFixed(2)),
            change: (isUp ? "+" : "") + percentChange.toFixed(1) + "%",
            type: isUp ? "up" : "down",
          };
        }),
      );

      setMetricsData((current) =>
        current.map((metric) => {
          const lastValue = metric.chartData[metric.chartData.length - 1].value;
          const lastTime = metric.chartData[metric.chartData.length - 1].time;
          const newValue = lastValue * (1 + (Math.random() * 0.02 - 0.01));
          const newChartData = [
            ...metric.chartData.slice(1),
            { time: lastTime + 1, value: newValue },
          ];
          return { ...metric, value: newValue, chartData: newChartData };
        }),
      );

      setOrderBook((current) => {
        return current.map((order) => {
          if (Math.random() > 0.6) {
            return {
              ...order,
              size: Math.max(
                100,
                Math.floor(order.size + (Math.random() * 2000 - 1000)),
              ),
            };
          }
          return order;
        });
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const activeStartup = startupsData.find((p) => p.id === activeStartupId);

  // -- Spawning State --
  const [isSpawning, setIsSpawning] = useState(false);
  const [spawnResult, setSpawnResult] = useState<any>(null);

  // -- Market Fit Analysis State --
  const [problemStatement, setProblemStatement] = useState("");
  const [isAnalyzingFit, setIsAnalyzingFit] = useState(false);
  const [marketFitResult, setMarketFitResult] = useState<any>(null);

  const triggerSpawn = async () => {
    setIsSpawning(true);
    setSpawnResult(null);
    try {
      const response = await fetch("/api/spawn-venture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemStatement:
            problemStatement ||
            "Create a random high-tech AI hardware startup.",
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Spawn error:", errorText);
        // Fallback if no API key
        setSpawnResult({
          name: "OmniChain Proxy",
          thesis:
            "Unified cross-chain liquidity layer powered by autonomous AI solvers.",
          market: "DeFi Infrastructure / Autonomous Agents",
          timeline: "14 Days to MVP",
          valuation: "$4.5M Est. Initial",
          dna: ["Systems Architect", "Crypto Native Growth"],
        });
      } else {
        const data = await response.json();
        setSpawnResult(data);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setSpawnResult({
        name: "OmniChain Proxy",
        thesis:
          "Unified cross-chain liquidity layer powered by autonomous AI solvers.",
        market: "DeFi Infrastructure / Autonomous Agents",
        timeline: "14 Days to MVP",
        valuation: "$4.5M Est. Initial",
        dna: ["Systems Architect", "Crypto Native Growth"],
      });
    } finally {
      setIsSpawning(false);
    }
  };

  const triggerMarketFitAnalysis = async () => {
    if (!problemStatement.trim()) return;
    setIsAnalyzingFit(true);
    setMarketFitResult(null);
    try {
      const response = await fetch("/api/spawn-venture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatement }),
      });
      if (response.ok) {
        const data = await response.json();
        setMarketFitResult({
          tam: data.tam,
          sam: data.sam,
          som: data.som,
          competitors: data.competitors,
          verdict: data.verdict,
          score: data.score,
        });
      } else {
        throw new Error("API Error");
      }
    } catch {
      setMarketFitResult({
        tam: "$120B Globally",
        sam: "$15B Enterprise US",
        som: "$450M Initial Target",
        competitors: ["Incumbents (Slow/Legacy)", "Fragmented Point Solutions"],
        verdict: "High Viability - Strong timing for AI-native disruption.",
        score: 88,
      });
    } finally {
      setIsAnalyzingFit(false);
    }
  };

  const orchestrateLaunch = async () => {
    if (!problemStatement.trim()) return;
    setIsSpawning(true);
    setSpawnResult(null);
    setMarketFitResult(null);

    try {
      // 1. Spawn the Venture & Market Analysis
      const spawnRes = await fetch("/api/spawn-venture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatement }),
      });
      let ventureData;
      if (spawnRes.ok) {
        ventureData = await spawnRes.json();
      } else {
        ventureData = {
          name: "OmniChain Proxy",
          thesis:
            "Unified cross-chain liquidity layer powered by autonomous AI solvers.",
          market: "DeFi Infrastructure / Autonomous Agents",
          timeline: "14 Days to MVP",
          valuation: "$4.5M Est. Initial",
          dna: ["Systems Architect", "Crypto Native Growth"],
        };
      }
      setSpawnResult(ventureData);
      setMarketFitResult(ventureData); // reuse the data

      // 2. We instantly switch them into the new twin
      const newStartupId = "orb-" + Date.now();
      const newStartup: any = {
        id: newStartupId,
        name: ventureData.name,
        tagline: ventureData.thesis,
        momentum: "100% (Initializing)",
        color: "from-purple-400 to-rose-400",
        stage: "Spawning",
        chartData: Array.from({ length: 20 }, (_, i) => ({
          time: i,
          value: 50 + Math.random() * 10,
        })),
      };

      setStartupsData((prev) => [newStartup, ...prev]);
      setActiveStartupId(newStartupId);
      setActiveTab("consciousness");
      setTwinAction("artifacts");

      // 3. Fire the execution orchestration
      setIsExecuting(true);

      const tasks = [
        {
          role: "AI PM",
          task: `Generate a full PRD for ${ventureData.name}. \nContext: ${ventureData.thesis}`,
        },
        {
          role: "AI CTO",
          task: `Create a scalable application architecture schema and backend stack for ${ventureData.name}.`,
        },
        {
          role: "AI Growth Lead",
          task: `Generate a hyper-viral Go-To-Market launch strategy for ${ventureData.name}.`,
        },
        {
          role: "AI Investor Agent",
          task: `Generate an elite Series Seed Pitch Deck structure for ${ventureData.name}.`,
        },
      ];

      for (const t of tasks) {
        setActiveTask(t.task);
        try {
          const exeRes = await fetch("/api/ai-execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: t.role,
              task: t.task,
              context: ventureData.thesis,
            }),
          });
          if (exeRes.ok) {
            const exeData = await exeRes.json();
            const newArtifact: StartupArtifact = {
              id: Date.now().toString() + Math.random(),
              role: t.role,
              task: t.task,
              content: exeData.output,
              timestamp: new Date().toLocaleTimeString(),
            };
            setArtifacts((prev) => ({
              ...prev,
              [newStartupId]: [newArtifact, ...(prev[newStartupId] || [])],
            }));
          }
        } catch (e) {
          console.error("Task failed:", t.task, e);
        }
      }
    } catch (e) {
      console.error("Spawn pipeline failed", e);
    } finally {
      setIsSpawning(false);
      setIsExecuting(false);
    }
  };

  // -- War Room / Digital Twins State --
  const [twinAction, setTwinAction] = useState("simulating");

  // -- Real AI Execution State --
  interface StartupArtifact {
    id: string;
    role: string;
    task: string;
    content: string;
    timestamp: string;
  }
  const [artifacts, setArtifacts] = useState<Record<string, StartupArtifact[]>>(() => {
    try {
      const stored = localStorage.getItem("ventureMemory_artifacts");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ventureMemory_artifacts", JSON.stringify(artifacts));
    } catch (e) {
      console.warn("Venture Memory Engine: failed to persist artifacts.");
    }
  }, [artifacts]);

  const [aiExecutionOutput, setAiExecutionOutput] = useState<string | null>(
    null,
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTask, setActiveTask] = useState<string>("");

  const executeAiTask = async (role: string, task: string, context: string) => {
    setIsExecuting(true);
    setActiveTask(task);
    setAiExecutionOutput(null);
    setTwinAction("execution");
    try {
      const res = await fetch("/api/ai-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, task, context }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExecutionOutput(data.output);

        if (activeStartup) {
          const newArtifact: StartupArtifact = {
            id: Date.now().toString(),
            role,
            task,
            content: data.output,
            timestamp: new Date().toLocaleTimeString(),
          };
          setArtifacts((prev) => ({
            ...prev,
            [activeStartup.id]: [
              newArtifact,
              ...(prev[activeStartup.id] || []),
            ],
          }));
        }
      } else {
        const err = await res.text();
        setAiExecutionOutput(`Error executing task: ${err}`);
      }
    } catch (e: any) {
      setAiExecutionOutput(`Failed to execute AI task: ${e.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const downloadArtifact = (artifact: StartupArtifact, startupName: string) => {
    const element = document.createElement("a");
    const file = new Blob([artifact.content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${startupName.replace(/\s+/g, "_")}_${artifact.role.replace(/\s+/g, "_")}_Artifact.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#050505] text-slate-200 p-8 relative flex flex-col font-sans selection:bg-brand-primary/30">
      {/* Ecosystem HUD Ambient Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Cinematic Glowing Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {activeStartup ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 flex flex-col h-full space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setActiveStartupId(null)}
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Leave War Room
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <ProjectStatusBadge
                status={activeStartup.status || activeStartup.stage || "draft"}
                onStatusChange={(newStatus) =>
                  handleStatusUpdate(
                    activeStartup.id,
                    newStatus,
                    normalizeStatus(activeStartup.status || activeStartup.stage)
                  )
                }
                size="md"
                interactive={true}
              />
              <div className="flex items-center gap-2 text-rose-500 font-mono text-xs uppercase bg-rose-500/10 px-3 py-1.5 rounded border border-rose-500/20 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Live War
                Room
              </div>
              <Badge className="bg-brand-primary/20 text-brand-primary border-brand-primary/30">
                {activeStartup.cap} Cap
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Digital Twin & Architecture */}
            <div className="xl:col-span-8 space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute -left-4 top-2 bottom-2 w-1 bg-gradient-to-b from-brand-primary to-transparent rounded-full" />
                  <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                    {activeStartup.name}
                  </h1>
                  <p className="text-xl text-slate-400 font-medium">
                    {activeStartup.tagline}
                  </p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                  <ProjectStatusStepper
                    status={activeStartup.status || activeStartup.stage || "draft"}
                    onStatusChange={(newStatus) =>
                      handleStatusUpdate(
                        activeStartup.id,
                        newStatus,
                        normalizeStatus(activeStartup.status || activeStartup.stage)
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                    Execution Velocity
                  </p>
                  <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {activeStartup.momentum}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                    AI Autopilot
                  </p>
                  <p className="text-3xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    Active
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                    Burn Rate
                  </p>
                  <p className="text-3xl font-black text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    $12k/mo
                  </p>
                </div>
              </div>

              {/* Digital Twin Core */}
              <div className="bg-[#0f1014] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div
                  className={cn(
                    "absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-20",
                    activeStartup.color,
                  )}
                />
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" /> Digital
                    Twin Central Nervous System
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        twinAction === "simulating" ? "default" : "outline"
                      }
                      className={
                        twinAction === "simulating"
                          ? "bg-purple-600 text-white"
                          : "border-white/10"
                      }
                      onClick={() => setTwinAction("simulating")}
                    >
                      Simulations
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        twinAction === "workforce" ? "default" : "outline"
                      }
                      className={
                        twinAction === "workforce"
                          ? "bg-brand-primary text-white"
                          : "border-white/10"
                      }
                      onClick={() => setTwinAction("workforce")}
                    >
                      AI Workforce
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        twinAction === "execution" ? "default" : "outline"
                      }
                      className={
                        twinAction === "execution"
                          ? "bg-rose-600 text-white"
                          : "border-white/10"
                      }
                      onClick={() => setTwinAction("execution")}
                    >
                      Execution Terminal
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        twinAction === "artifacts" ? "default" : "outline"
                      }
                      className={
                        twinAction === "artifacts"
                          ? "bg-indigo-600 text-white"
                          : "border-white/10"
                      }
                      onClick={() => setTwinAction("artifacts")}
                    >
                      Memory & Artifacts
                    </Button>
                  </div>
                </div>

                {twinAction === "simulating" ? (
                  <div className="space-y-6 relative z-10">
                    <div 
                      className="h-[250px] w-full min-w-[200px] min-h-[250px] relative overflow-hidden"
                      style={{ width: '100%', height: '250px', minWidth: '200px', minHeight: '250px' }}
                    >
                      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
                        <LineChart data={activeStartup.chartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff10"
                            vertical={false}
                          />
                          <XAxis dataKey="time" hide />
                          <YAxis
                            hide
                            domain={["dataMin - 10", "dataMax + 10"]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f1014",
                              border: "1px solid #333",
                            }}
                          />
                          <Line
                            type="stepAfter"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={false}
                            isAnimationActive={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={1}
                            strokeOpacity={0.5}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Crosshair className="w-4 h-4 text-emerald-400" />{" "}
                          Predicted Pivot
                        </h4>
                        <p className="text-base text-slate-200">
                          The twin model suggests a 82% chance of pivoting to
                          B2B enterprise sales within 3 months based on current
                          execution trajectory.
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />{" "}
                          Collapse Risk
                        </h4>
                        <p className="text-base text-slate-200">
                          14% risk of ecosystem collapse due to over-engineering
                          the backend before validating core user loop.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : twinAction === "workforce" ? (
                  <div className="space-y-4 relative z-10">
                    {[
                      {
                        unit: "AI Engineering Squad Alpha",
                        status: "Refactoring API Gateway",
                        health: "Optimal",
                        icon: Cpu,
                        color: "text-blue-400",
                        role: "AI CTO",
                        task: "Generate advanced backend architecture and API routes for a scalable Node.js/Express service.",
                      },
                      {
                        unit: "AI Growth Unit 1",
                        status: "Running A/B pricing models",
                        health: "Slight Delay",
                        icon: TrendingUp,
                        color: "text-emerald-400",
                        role: "AI Growth Lead",
                        task: "Create a highly viral Go-To-Market strategy with zero customer acquisition cost.",
                      },
                      {
                        unit: "AI Design System",
                        status: "Generating dark mode assets",
                        health: "Optimal",
                        icon: Zap,
                        color: "text-purple-400",
                        role: "AI Designer",
                        task: "Scaffold a dark mode design system structure with ShadCN.",
                      },
                    ].map((bot, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl gap-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <bot.icon className={cn("w-5 h-5", bot.color)} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {bot.unit}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {bot.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-white/10 flex items-center gap-1.5",
                              bot.health === "Optimal"
                                ? "text-emerald-400 bg-emerald-400/10"
                                : "text-amber-400 bg-amber-400/10",
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                bot.health === "Optimal"
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-amber-400 animate-pulse",
                              )}
                            />
                            {bot.health}
                          </Badge>
                          <Button
                            size="sm"
                            className="bg-brand-primary text-black font-bold h-7"
                            onClick={() =>
                              executeAiTask(
                                bot.role,
                                bot.task,
                                "Building " + activeStartup.name,
                              )
                            }
                          >
                            Force Execute Tasks
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : twinAction === "artifacts" ? (
                  <div className="space-y-4 relative z-10 w-full min-h-[350px]">
                    <h4 className="text-lg font-bold text-white mb-4">
                      Memory & Artifact Vault
                    </h4>

                    {isExecuting && (
                      <div className="flex items-center gap-3 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-xl mb-4">
                        <BrainCircuit className="w-5 h-5 text-brand-primary animate-pulse" />
                        <span className="text-brand-primary font-mono text-sm max-w-[80%] truncate">
                          Executing: {activeTask}
                        </span>
                      </div>
                    )}

                    {!artifacts[activeStartup.id] ||
                    artifacts[activeStartup.id].length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] border border-white/10 rounded-xl bg-black/40 text-slate-500">
                        <Database className="w-10 h-10 mb-4 opacity-50" />
                        <p>
                          No architecture or output logs found in venture
                          memory.
                        </p>
                        <Button
                          className="mt-4 bg-brand-primary text-black font-bold h-8"
                          onClick={() => setTwinAction("workforce")}
                        >
                          Assign Tasks
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {artifacts[activeStartup.id].map((artifact) => (
                          <div
                            key={artifact.id}
                            className="bg-black/60 border border-white/10 rounded-xl p-5 hover:border-brand-primary/50 transition-all shadow-lg flex flex-col"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className="font-bold text-brand-primary text-sm mb-1">
                                  {artifact.role}
                                </h5>
                                <p
                                  className="text-xs text-slate-400 line-clamp-1"
                                  title={artifact.task}
                                >
                                  {artifact.task}
                                </p>
                              </div>
                              <Badge className="bg-white/10 text-white text-[10px] font-mono shrink-0">
                                {artifact.timestamp}
                              </Badge>
                            </div>
                            <div className="text-[10px] bg-black/40 p-2 rounded text-slate-300 font-mono opacity-60 line-clamp-3 mb-4 flex-grow">
                              {artifact.content}
                            </div>
                            <Button
                              size="sm"
                              className="w-full bg-[#1a1b26] border border-white/10 text-slate-200 hover:text-white mt-auto truncate"
                              onClick={() =>
                                downloadArtifact(artifact, activeStartup.name)
                              }
                            >
                              Download .md Asset
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10 w-full bg-black/60 rounded-xl border border-white/10 p-6 min-h-[350px]">
                    {isExecuting ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                        <BrainCircuit className="w-12 h-12 text-rose-500 animate-pulse" />
                        <h4 className="text-xl font-black text-white">
                          AI Executing: {activeTask}
                        </h4>
                        <p className="text-slate-400">
                          Synthesizing command center terminal output...
                        </p>
                      </div>
                    ) : aiExecutionOutput ? (
                      <div className="text-slate-300 font-mono text-sm leading-relaxed overflow-y-auto max-h-[400px] markdown-body">
                        <Markdown>{aiExecutionOutput}</Markdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                        <Terminal className="w-12 h-12 mb-4 opacity-50" />
                        <p>
                          Waiting for command execution. Assign tasks from the
                          AI Workforce panel.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: War Room / Founder Int */}
            <div className="xl:col-span-4 space-y-8">
              {/* Live Actions Feed */}
              <div className="bg-[#0f1014] border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Sword className="w-4 h-4 text-rose-500" /> War Room Log
                </h3>
                <div className="space-y-4 relative z-10 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {[
                    {
                      time: "10s ago",
                      action: "AI CTO finalized database schema",
                      user: "System",
                    },
                    {
                      time: "2m ago",
                      action: "Founding member pushed to production",
                      user: "Alex (Human)",
                    },
                    {
                      time: "14m ago",
                      action: "Identified series seed investor match: Paradigm",
                      user: "Matchmaker AI",
                    },
                  ].map((log, i) => (
                    <div
                      key={i}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-[#0f1014] group-hover:border-brand-primary group-hover:bg-brand-primary/20 text-slate-500 group-hover:text-brand-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors">
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm shadow">
                        <p className="text-xs text-brand-primary font-bold mb-1">
                          {log.user}
                        </p>
                        <p className="text-sm text-slate-300 font-medium">
                          {log.action}
                        </p>
                        <time className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 block">
                          {log.time}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negotiation AI */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-[#0f1014] border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Target className="w-24 h-24 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2 relative z-10">
                  AI Negotiation Engine
                </h3>
                <p className="text-2xl font-black text-white relative z-10 mb-1">
                  Fundraising Mode
                </p>
                <p className="text-sm text-slate-400 relative z-10 mb-6">
                  Auto-generating investor decks and simulating term sheets for
                  upcoming seed round.
                </p>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Target Raise</span>
                    <span className="font-bold text-white">$2.5M</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Simulated Dilution</span>
                    <span className="font-bold text-emerald-400">14%</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-8 bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  onClick={() =>
                    executeAiTask(
                      "AI Investor Agent",
                      "Generate a Seed Round Term Sheet focusing on founder-friendly liquid terms.",
                      "Negotiating for " + activeStartup.name,
                    )
                  }
                >
                  Generate Term Sheet
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Civilization Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-black border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                  InnovationOS{" "}
                  <span className="text-brand-primary text-xl font-medium tracking-normal align-top ml-2">
                    CIVILIZATION
                  </span>
                </h1>
              </div>
              <p className="text-slate-400 text-base font-medium tracking-wide">
                The autonomous planetary engine for venture creation and
                ecosystem intelligence.
              </p>
            </div>

            <div className="flex flex-wrap bg-[#1a1c23]/80 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-2xl">
              {[
                { id: "consciousness", label: "Ecosystem", icon: Eye },
                { id: "globe", label: "Global Map", icon: MapIcon },
                { id: "spawning", label: "Autonomous Spawn", icon: Dna },
                { id: "terminal", label: "Terminal", icon: Terminal },
                { id: "media", label: "Intelligence", icon: Radio },
                { id: "founder", label: "Founder Mind", icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                    activeTab === tab.id
                      ? "bg-white/10 text-white shadow-md border border-white/5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent",
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-4 h-4",
                      activeTab === tab.id ? "text-brand-primary" : "",
                    )}
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Global Telemetry Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 relative z-20"
          >
            {metricsData.map((metric, i) => (
              <div
                key={i}
                className="bg-[#0f1014]/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col justify-between h-44 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Ambient Chart Background */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-28 min-w-[120px] min-h-[80px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none overflow-hidden"
                  style={{ width: '100%', height: '112px', minWidth: '120px', minHeight: '80px' }}
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={80}>
                    <AreaChart data={metric.chartData}>
                      <defs>
                        <linearGradient
                          id={`grad-m-${metric.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={metric.color}
                            stopOpacity={1}
                          />
                          <stop
                            offset="95%"
                            stopColor={metric.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metric.color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#grad-m-${metric.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <metric.icon className="w-5 h-5 text-slate-300" />
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-lg">
                    {metric.trend}
                  </span>
                </div>
                <div className="space-y-1 relative z-10 p-1">
                  <h4 className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">
                    {metric.format(metric.value)}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {metric.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {/* -- TAB 1: ECOSYSTEM CONSCIOUSNESS -- */}
            {activeTab === "consciousness" && (
              <motion.div
                key="consciousness"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="space-y-8 relative z-20"
              >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                          <Eye className="w-6 h-6 text-brand-primary" /> Global Hive Mind & Projects
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Interactive Project Lifecycle & Live Transition Pipeline
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter projects..."
                            value={projectSearchQuery}
                            onChange={(e) => setProjectSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors w-40 sm:w-48"
                          />
                        </div>

                        <Button
                          size="sm"
                          onClick={() => setIsDraftModalOpen(true)}
                          className="bg-brand-primary text-black font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Draft Project
                        </Button>
                      </div>
                    </div>

                    {/* Status Filter Tabs with Framer Motion Animated Slider */}
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0a0c10] border border-white/10 rounded-2xl backdrop-blur-xl">
                      {[
                        { id: "all", label: "All Projects" },
                        { id: "draft", label: "Draft" },
                        { id: "sent", label: "Sent" },
                        { id: "replied", label: "Replied" },
                        { id: "interviewing", label: "Interviewing" },
                        { id: "offer", label: "Offers & Scale" },
                      ].map((tab) => {
                        const count =
                          tab.id === "all"
                            ? startupsData.length
                            : tab.id === "offer"
                            ? startupsData.filter((s: any) => {
                                const n = normalizeStatus(s.status || s.stage);
                                return n === "offer" || n === "scaling";
                              }).length
                            : startupsData.filter(
                                (s: any) =>
                                  normalizeStatus(s.status || s.stage) === tab.id
                              ).length;

                        const isSelected = statusFilter === tab.id;

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={cn(
                              "relative px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2",
                              isSelected
                                ? "text-white"
                                : "text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="activeStatusFilterTab"
                                className="absolute inset-0 bg-white/15 border border-white/20 rounded-xl shadow-sm"
                                transition={{
                                  type: "spring",
                                  stiffness: 450,
                                  damping: 30,
                                }}
                              />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                            <span
                              className={cn(
                                "relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-white/5 text-slate-500"
                              )}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Projects Feed with Framer Motion Layout Reordering */}
                    <motion.div layout className="space-y-5">
                      <AnimatePresence mode="popLayout">
                        {startupsData
                          .filter((startup: any) => {
                            const norm = normalizeStatus(
                              startup.status || startup.stage
                            );
                            const matchesFilter =
                              statusFilter === "all" ||
                              (statusFilter === "draft" && norm === "draft") ||
                              (statusFilter === "sent" && norm === "sent") ||
                              (statusFilter === "replied" &&
                                norm === "replied") ||
                              (statusFilter === "interviewing" &&
                                norm === "interviewing") ||
                              (statusFilter === "offer" &&
                                (norm === "offer" || norm === "scaling"));

                            const matchesSearch =
                              !projectSearchQuery.trim() ||
                              startup.name
                                .toLowerCase()
                                .includes(projectSearchQuery.toLowerCase()) ||
                              startup.tagline
                                .toLowerCase()
                                .includes(projectSearchQuery.toLowerCase());

                            return matchesFilter && matchesSearch;
                          })
                          .map((startup: any) => (
                            <AnimatedProjectCard
                              key={startup.id}
                              project={startup}
                              onSelectProject={(id) => setActiveStartupId(id)}
                              onStatusUpdate={handleStatusUpdate}
                              historyEntries={statusHistory}
                              onOpenInterviewPrep={(proj) => {
                                setInterviewPrepTarget({
                                  id: proj.id,
                                  name: proj.name,
                                  subtitle: proj.tagline,
                                  tags: proj.tags,
                                  cap: proj.cap,
                                });
                                setIsInterviewModalOpen(true);
                              }}
                            />
                          ))}
                      </AnimatePresence>

                      {startupsData.filter((startup: any) => {
                        const norm = normalizeStatus(
                          startup.status || startup.stage
                        );
                        const matchesFilter =
                          statusFilter === "all" ||
                          (statusFilter === "draft" && norm === "draft") ||
                          (statusFilter === "sent" && norm === "sent") ||
                          (statusFilter === "replied" && norm === "replied") ||
                          (statusFilter === "interviewing" &&
                            norm === "interviewing") ||
                          (statusFilter === "offer" &&
                            (norm === "offer" || norm === "scaling"));
                        return matchesFilter;
                      }).length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-[#0f1014] border border-white/10 rounded-3xl p-12 text-center space-y-4"
                        >
                          <Layers className="w-12 h-12 text-slate-500 mx-auto opacity-40" />
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              No projects in this stage
                            </h4>
                            <p className="text-xs text-slate-400 font-mono mt-1">
                              Switch tabs or draft a new project to advance statuses.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setStatusFilter("all");
                              setIsDraftModalOpen(true);
                            }}
                            className="bg-white/10 text-white hover:bg-white/20 border border-white/15 rounded-xl font-bold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Initialize New Draft
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Right Panel: Ecosystem Events */}
                  <div className="xl:col-span-1">
                    <div className="bg-[#0f1014] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl h-full sticky top-8">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Network className="w-4 h-4" /> Live AI Interventions
                      </h3>
                      <div className="space-y-4">
                        {MOCK_AI_INTERVENTIONS.map((event, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className={cn(
                              "p-4 rounded-2xl border backdrop-blur-md relative overflow-hidden",
                              event.type === "warning"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
                                : event.type === "alert"
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                                  : event.type === "success"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-200",
                            )}
                          >
                            <div className="flex gap-2 items-center text-[10px] font-mono mb-2">
                              <span className="opacity-60">[{event.time}]</span>
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded font-black uppercase tracking-widest",
                                  event.type === "warning"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : event.type === "alert"
                                      ? "bg-rose-500/20 text-rose-300"
                                      : event.type === "success"
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : "bg-blue-500/20 text-blue-300",
                                )}
                              >
                                {event.action}
                              </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed shadow-sm font-mono">
                              {event.text}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/5">
                        <div className="w-full h-32 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-black/50 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-brand-primary/10 animate-pulse mix-blend-overlay" />
                          <p className="text-xs font-mono font-bold text-brand-primary uppercase tracking-widest z-10 text-center">
                            System
                            <br />
                            Scanning
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* -- TAB 2: GLOBAL MAP -- */}
            {activeTab === "globe" && (
              <motion.div
                key="globe"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="w-full relative z-20 h-[600px] bg-[#0f1014] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center"
              >
                <div className="absolute top-8 left-8 z-30">
                  <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                    Planetary Innovation Network
                  </h2>
                  <p className="text-slate-400 font-medium">
                    Real-time mapping of global venture density and AI clusters.
                  </p>
                </div>

                <div className="absolute top-8 right-8 z-30 flex gap-2">
                  <Badge
                    variant="outline"
                    className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 backdrop-blur-md"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-primary mr-2 animate-ping" />{" "}
                    Bangalore +18%
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 backdrop-blur-md"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />{" "}
                    SF Bay Constellation Active
                  </Badge>
                </div>

                {/* Glowing Map Mockup using ScatterChart as a stylistic representation */}
                <div 
                  className="absolute inset-0 w-full h-full min-w-[280px] min-h-[350px] opacity-80 mix-blend-screen pointer-events-none overflow-hidden"
                  style={{ width: '100%', height: '100%', minWidth: '280px', minHeight: '350px' }}
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={350}>
                    <ScatterChart
                      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    >
                      <XAxis
                        type="number"
                        dataKey="x"
                        hide
                        domain={[0, 1000]}
                      />
                      <YAxis type="number" dataKey="y" hide domain={[0, 500]} />
                      <ZAxis type="number" dataKey="z" range={[20, 200]} />
                      <Scatter data={MAP_DATA} fill="#fff">
                        {MAP_DATA.map((entry, index) => (
                          <circle
                            key={`cell-${index}`}
                            cx={entry.x}
                            cy={entry.y}
                            r={entry.z / 30}
                            fill={entry.fill}
                            fillOpacity={0.6 + Math.random() * 0.4}
                            className="animate-pulse"
                            style={{
                              animationDelay: `${Math.random() * 2}s`,
                              animationDuration: `${2 + Math.random() * 3}s`,
                            }}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                  <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center">
                    <p className="text-3xl font-black text-white">412</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                      Live Clusters
                    </p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center">
                    <p className="text-3xl font-black text-white">$14.2B</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                      Capital Velocity
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* -- TAB 3: AUTONOMOUS VENTURE SPAWNING -- */}
            {activeTab === "spawning" && (
              <motion.div
                key="spawning"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-12 relative z-20"
              >
                <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center mb-8 relative border border-purple-500/30">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full blur-[20px]",
                      isSpawning
                        ? "bg-purple-600/40 animate-ping"
                        : "bg-purple-600/10 animate-pulse",
                    )}
                  />
                  <Dna
                    className={cn(
                      "w-12 h-12 text-purple-400 relative z-10",
                      isSpawning && "animate-spin",
                    )}
                  />
                </div>

                <h2 className="text-5xl font-black text-white text-center mb-6 tracking-tighter">
                  {isSpawning
                    ? "Generating Venture Blueprint..."
                    : "Autonomous Venture Spawner"}
                </h2>
                <p className="text-xl text-slate-400 text-center max-w-2xl mb-12 font-medium">
                  The AI Genome Engine automatically discovers market gaps and
                  generates full-stack startup architectures.
                </p>

                {!spawnResult && (
                  <Button
                    size="lg"
                    onClick={triggerSpawn}
                    disabled={isSpawning}
                    className="bg-purple-600 text-white font-extrabold px-12 py-8 text-xl rounded-2xl shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Sparkles
                      className={cn(
                        "w-6 h-6 mr-3",
                        isSpawning && "animate-spin",
                      )}
                    />
                    {isSpawning
                      ? "Synthesizing Genome..."
                      : "Force Spawn Venture"}
                  </Button>
                )}

                {spawnResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl bg-[#0f1014] border border-purple-500/30 shadow-[0_0_60px_rgba(147,51,234,0.15)] rounded-3xl p-10 relative overflow-hidden"
                  >
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-6 px-3 py-1 font-mono uppercase tracking-widest">
                      Venture Spawned Successfully
                    </Badge>
                    <h3 className="text-4xl font-black text-white mb-2">
                      {spawnResult.name}
                    </h3>
                    <p className="text-xl text-slate-400 mb-10">
                      {spawnResult.thesis}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="bg-black/50 border border-white/5 rounded-2xl p-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Market Spec
                        </p>
                        <p className="text-lg font-bold text-white">
                          {spawnResult.market}
                        </p>
                      </div>
                      <div className="bg-black/50 border border-white/5 rounded-2xl p-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Build Velocity
                        </p>
                        <p className="text-lg font-bold text-white">
                          {spawnResult.timeline}
                        </p>
                      </div>
                      <div className="bg-black/50 border border-white/5 rounded-2xl p-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          AI Valuation
                        </p>
                        <p className="text-lg font-black text-emerald-400">
                          {spawnResult.valuation}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                          Required Founder DNA
                        </p>
                        <div className="flex gap-2">
                          {spawnResult.dna.map((d: string) => (
                            <Badge
                              key={d}
                              variant="outline"
                              className="text-slate-300 border-white/20 bg-white/5"
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="border-white/20 text-white"
                          onClick={() => setSpawnResult(null)}
                        >
                          Discard
                        </Button>
                        <Button
                          className="bg-purple-600 text-white font-bold hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                          onClick={() => {
                            if (spawnResult) {
                              const newVenture = {
                                id: `spawn-${Date.now()}`,
                                name: spawnResult.name,
                                tagline: spawnResult.thesis,
                                stage: "Draft",
                                status: "draft",
                                momentum: 78,
                                cap: spawnResult.valuation || "$8.5M",
                                tags: spawnResult.dna || ["AI Venture", "Autonomous MVP"],
                                color: "from-purple-500 to-indigo-500",
                                chartData: Array.from({ length: 20 }, (_, i) => ({
                                  time: i,
                                  value: 40 + Math.floor(Math.random() * 50),
                                })),
                              };
                              setStartupsData((prev: any[]) => [newVenture, ...prev]);
                              setStatusHistory((prev) => [
                                {
                                  id: `hist-${Date.now()}`,
                                  projectId: newVenture.id,
                                  projectName: newVenture.name,
                                  fromStatus: "draft",
                                  toStatus: "draft",
                                  timestamp: new Date().toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }),
                                  note: "Injected autonomous spawned genome into Ecosystem as Draft Project",
                                },
                                ...prev,
                              ]);
                              setSpawnResult(null);
                              setActiveTab("consciousness");
                              setStatusFilter("draft");
                            }
                          }}
                        >
                          Inject to Ecosystem
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Market Fit Analysis Section */}
                <div className="w-full max-w-4xl mt-16 bg-[#0a0c10] border border-white/5 shadow-2xl rounded-3xl p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Database className="w-48 h-48 text-brand-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 relative z-10 flex items-center gap-3">
                    <Rocket className="w-8 h-8 text-brand-primary" /> Spawn to
                    Launch Orchestration
                  </h3>
                  <p className="text-slate-400 mb-8 relative z-10">
                    Input a problem statement. The AI will spawn the company,
                    form a team, generate architecture, create the GTM, and
                    launch the execution environment.
                  </p>

                  <div className="relative z-10 space-y-6">
                    <textarea
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
                      placeholder="e.g., Doctors spend 40% of their time on administrative typing rather than patient care..."
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                    />
                    <Button
                      className="w-full bg-brand-primary text-black font-extrabold py-6 rounded-xl text-lg hover:bg-brand-primary/90 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                      onClick={orchestrateLaunch}
                      disabled={isSpawning || !problemStatement.trim()}
                    >
                      {isSpawning ? (
                        <>
                          <BrainCircuit className="w-5 h-5 mr-2 animate-spin" />{" "}
                          Spawning Full-Stack Venture Pipeline...
                        </>
                      ) : (
                        "Spawn to Launch Pipeline"
                      )}
                    </Button>

                    {marketFitResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-6">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                              Market Sizing
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400 font-bold">
                                  TAM (Total)
                                </span>
                                <span className="font-mono font-bold text-white">
                                  {marketFitResult.tam}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400 font-bold">
                                  SAM (Serviceable)
                                </span>
                                <span className="font-mono font-bold text-brand-primary">
                                  {marketFitResult.sam}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400 font-bold">
                                  SOM (Obtainable)
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {marketFitResult.som}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                              Market Verdict
                            </p>
                            <div className="bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 rounded-xl">
                              <p className="text-emerald-400 font-bold">
                                {marketFitResult.verdict}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                              Key Competitors
                            </p>
                            <div className="space-y-2">
                              {marketFitResult.competitors.map(
                                (comp: string, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-slate-300"
                                  >
                                    <Crosshair className="w-4 h-4 text-slate-500" />{" "}
                                    {comp}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                          <div className="bg-black/50 border border-brand-primary/20 p-5 rounded-2xl flex flex-col items-center text-center justify-center h-28">
                            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-1">
                              AI Confidence Score
                            </p>
                            <p className="text-4xl font-black text-white">
                              {marketFitResult.score}
                              <span className="text-lg text-slate-500">
                                /100
                              </span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* -- TAB 4: TERMINAL (EXCHANGE) -- */}
            {activeTab === "terminal" && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="space-y-6 relative z-20"
              >
                {/* Live Ticker Tape */}
                <div className="bg-[#050505] border-y border-white/10 px-4 py-2 overflow-hidden flex whitespace-nowrap text-xs font-mono">
                  <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                      repeat: Infinity,
                      duration: 20,
                      ease: "linear",
                    }}
                    className="flex gap-8"
                  >
                    {[...marketTickers, ...marketTickers].map((t, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="text-white font-bold">{t.pair}</span>
                        <span
                          className={
                            t.type === "up"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }
                        >
                          {t.price}
                        </span>
                        <span
                          className={
                            t.type === "up"
                              ? "text-emerald-400/80 bg-emerald-400/10 px-1 rounded"
                              : "text-rose-400/80 bg-rose-400/10 px-1 rounded"
                          }
                        >
                          {t.change}
                        </span>
                      </span>
                    ))}
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Main Chart Area */}
                  <div className="lg:col-span-8 bg-[#0a0c10] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-2 tracking-tighter">
                          NEXA{" "}
                          <span className="text-lg text-slate-500 font-medium">
                            Nexus AI Systems
                          </span>
                        </h2>
                        <p className="text-sm text-slate-400">
                          Universal AI Agent Routing • Cap: 412M
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-mono text-emerald-400 font-bold tracking-tighter">
                          142.12
                        </p>
                        <p className="text-emerald-500 text-sm font-bold">
                          +12.4%{" "}
                          <span className="text-slate-500 font-normal">
                            Today
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Trading Chart (Mocked with Area/Bar for depth) */}
                    <div 
                      className="h-[400px] w-full min-w-[280px] min-h-[400px] mb-4 relative z-10 flex flex-col"
                      style={{ width: '100%', height: '400px', minWidth: '280px', minHeight: '400px' }}
                    >
                      <div 
                        className="h-[320px] w-full min-w-[280px] min-h-[320px] relative overflow-hidden"
                        style={{ width: '100%', height: '320px', minWidth: '280px', minHeight: '320px' }}
                      >
                        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={320}>
                          <AreaChart data={startupsData[0].chartData}>
                            <defs>
                              <linearGradient
                                id="colorNexa"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#10b981"
                                  stopOpacity={0.4}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#10b981"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis
                              domain={["auto", "auto"]}
                              orientation="right"
                              tick={{ fill: "#64748b", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#ffffff05"
                              vertical={false}
                            />
                            <Tooltip
                              cursor={{ stroke: "#ffffff20" }}
                              contentStyle={{
                                backgroundColor: "#000",
                                border: "1px solid #333",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#10b981"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorNexa)"
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div 
                        className="h-[80px] w-full min-w-[280px] min-h-[80px] relative overflow-hidden"
                        style={{ width: '100%', height: '80px', minWidth: '280px', minHeight: '80px' }}
                      >
                        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={80}>
                          <BarChart data={startupsData[0].chartData}>
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              opacity={0.3}
                              isAnimationActive={false}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-4 border-t border-white/5 pt-4">
                      <Button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-lg">
                        BUY NEXA
                      </Button>
                      <Button className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 font-extrabold text-lg">
                        SHORT NEXA
                      </Button>
                    </div>
                  </div>

                  {/* Right Sidebar: Order Book & AI Analysis */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* AI Market Analyst Cards */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4" /> AI Market Analysts
                      </h3>
                      {MOCK_AI_ANALYSTS.map((analyst, i) => (
                        <div
                          key={i}
                          className="bg-[#0a0c10] border border-white/5 hover:border-white/10 transition-colors rounded-xl p-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-black text-white flex items-center gap-2">
                              <Brain className="w-3 h-3 text-brand-primary" />{" "}
                              {analyst.name}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-widest",
                                analyst.type === "bull"
                                  ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                                  : analyst.type === "bear"
                                    ? "bg-rose-400/10 text-rose-400 border border-rose-400/20"
                                    : "bg-amber-400/10 text-amber-400 border border-amber-400/20",
                              )}
                            >
                              {analyst.confidence}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed italic">
                            "{analyst.insight}"
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Book */}
                    <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> Live Order Depth
                      </h3>

                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600 mb-2 px-2">
                        <span>Price</span>
                        <span>Size</span>
                        <span>Total</span>
                      </div>

                      <div className="space-y-[2px] font-mono text-[10px] xl:text-xs relative">
                        {(() => {
                          const asks = orderBook.filter(
                            (o) => o.type === "ask",
                          );
                          const bids = orderBook.filter(
                            (o) => o.type === "bid",
                          );
                          let askTotal = 0;
                          let bidTotal = 0;

                          const renderRow = (
                            order: any,
                            isAsk: boolean,
                            index: number,
                            totalBefore: number,
                          ) => {
                            const currentTotal = totalBefore + order.size;
                            const maxTotal = 20000; // Arbitrary max for depth bar scaling
                            const depthRatio = Math.min(
                              (currentTotal / maxTotal) * 100,
                              100,
                            );

                            return (
                              <div
                                key={`${order.type}-${index}`}
                                className="flex justify-between relative group cursor-pointer px-2 py-1 overflow-hidden z-10 hover:bg-white/5"
                              >
                                {/* Depth Bar */}
                                <div
                                  className={cn(
                                    "absolute right-0 top-0 bottom-0 opacity-15",
                                    isAsk ? "bg-rose-500" : "bg-emerald-500",
                                  )}
                                  style={{ width: `${depthRatio}%` }}
                                />
                                <span
                                  className={cn(
                                    "relative z-10 w-1/3 text-left",
                                    isAsk
                                      ? "text-rose-400"
                                      : "text-emerald-400",
                                  )}
                                >
                                  {order.price}
                                </span>
                                <span className="text-slate-300 relative z-10 w-1/3 text-center">
                                  {order.size}
                                </span>
                                <span className="text-slate-500 relative z-10 w-1/3 text-right">
                                  {currentTotal}
                                </span>
                              </div>
                            );
                          };

                          return (
                            <>
                              {asks
                                .reverse()
                                .map((order, i) => {
                                  const row = renderRow(
                                    order,
                                    true,
                                    i,
                                    askTotal,
                                  );
                                  askTotal += order.size;
                                  return row;
                                })
                                .reverse()}

                              {/* Spread visualizer */}
                              <div className="py-2 my-1 flex justify-between items-center text-xs px-2 bg-gradient-to-r from-emerald-500/10 via-transparent to-rose-500/10 border-y border-white/5">
                                <span className="text-white font-bold opacity-80">
                                  142.11
                                </span>
                                <span className="text-slate-500 text-[10px] border border-white/10 px-1 rounded">
                                  Spread 0.02
                                </span>
                              </div>

                              {bids.map((order, i) => {
                                const row = renderRow(
                                  order,
                                  false,
                                  i,
                                  bidTotal,
                                );
                                bidTotal += order.size;
                                return row;
                              })}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venture Markets Watchlist */}
                <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-6 overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Market Watch
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {marketTickers.map((stock, i) => (
                      <div
                        key={i}
                        className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-white text-lg">
                              {stock.pair}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                              {stock.name}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                          <p className="font-mono text-xl text-white font-bold">
                            {stock.price}
                          </p>
                          <span
                            className={cn(
                              "text-xs font-bold px-1.5 py-0.5 rounded",
                              stock.type === "up"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-rose-400/10 text-rose-400",
                            )}
                          >
                            {stock.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* -- TAB 4.5: MEDIA NETWORK -- */}
            {activeTab === "media" && (
              <motion.div
                key="media"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="space-y-8 relative z-20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Newspaper className="w-8 h-8 text-indigo-400" /> Innovation
                    Intelligence
                  </h2>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-red-400 border-red-500/30 bg-red-500/10 animate-pulse"
                    >
                      <Radio className="w-3 h-3 mr-1" /> Live Broadcast
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Hero Cinematic Layout */}
                  <div className="lg:col-span-8 group cursor-pointer relative rounded-3xl overflow-hidden h-[500px] border border-white/10 shadow-2xl">
                    <img
                      src={MOCK_NEWS[0].image}
                      alt="News Hero"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <div className="flex gap-3 mb-4">
                        <Badge className="bg-brand-primary text-black font-black uppercase text-xs tracking-widest">
                          {MOCK_NEWS[0].category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-black/50 text-slate-300 border-white/20 backdrop-blur-md"
                        >
                          {MOCK_NEWS[0].time}
                        </Badge>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tighter drop-shadow-lg">
                        {MOCK_NEWS[0].title}
                      </h1>
                      <p className="text-lg text-slate-300 max-w-2xl mb-6">
                        Autonomous systems predict a substantial compounding
                        effect as the ecosystem capital rotates from
                        infrastructure to application-layer biology.
                      </p>

                      <div className="flex items-center gap-4">
                        <Button className="bg-white text-black hover:bg-slate-200 font-bold rounded-full pl-4 pr-6 py-6">
                          <Play className="w-5 h-5 mr-2 fill-current" />{" "}
                          Auto-play AI Narrative
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 flex items-center justify-center"
                        >
                          <ArrowRight className="w-5 h-5 text-slate-300" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sub news sidebar */}
                  <div className="lg:col-span-4 space-y-6 flex flex-col">
                    <div className="bg-[#0a0c10] border border-white/10 rounded-2xl p-5 flex-1 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-indigo-500" />
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Radio className="w-4 h-4" /> Real-time Pulse
                      </h3>
                      <div className="space-y-6">
                        {MOCK_NEWS.slice(1).map((news, i) => (
                          <div key={i} className="group cursor-pointer">
                            <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                <img
                                  src={news.image}
                                  alt={news.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <div className="flex flex-col justify-center">
                                <div className="flex gap-2 mb-1">
                                  <span
                                    className={cn(
                                      "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                      news.impact === "Warning"
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-white/10 text-slate-300",
                                    )}
                                  >
                                    {news.impact}
                                  </span>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                    {news.time}
                                  </span>
                                </div>
                                <h4 className="font-bold text-white leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                                  {news.title}
                                </h4>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Founder Spotlight */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-[#0f1014] border border-purple-500/30 rounded-2xl p-6 group cursor-pointer hover:border-purple-500/50 transition-colors">
                      <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
                        Founder Intelligence Spotlight
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-purple-400 to-brand-primary">
                          <img
                            src="https://i.pravatar.cc/150?u=spotlight"
                            alt="Founder"
                            className="w-full h-full rounded-full border-2 border-black object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            Sarah Jenkins
                          </h4>
                          <p className="text-sm text-slate-400">
                            CEO, Synthetix Bio
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-purple-200/80 leading-relaxed italic">
                        "The DNA assembly AI generated an entirely new protein
                        folding pathway today. Our execution velocity just
                        10x'd."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Venture Documentaries & Deep Dives */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-indigo-400" /> AI-Generated
                    Startup Documentaries
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Building the Brain of the Web",
                        startup: "NEXA",
                        duration: "14:20",
                        image:
                          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
                      },
                      {
                        title: "The Fall of Legacy Biotech",
                        startup: "QBIO vs Incumbents",
                        duration: "08:45",
                        image:
                          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=600",
                      },
                      {
                        title: "Inside the Vortex Protocol",
                        startup: "VRX",
                        duration: "22:10",
                        image:
                          "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600",
                      },
                    ].map((doc, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden aspect-video mb-3 border border-white/10 group-hover:border-indigo-400/50 transition-colors">
                          <img
                            src={doc.image}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={doc.title}
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                              <Play className="w-5 h-5 ml-1 fill-current" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-white font-bold">
                            {doc.duration}
                          </div>
                        </div>
                        <div className="px-1">
                          <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                            {doc.startup}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* -- TAB 5: FOUNDER CONSCIOUSNESS -- */}
            {activeTab === "founder" && (
              <motion.div
                key="founder"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="space-y-8 relative z-20"
              >
                <div className="bg-[#0f1014] border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl relative overflow-hidden shadow-2xl flex flex-col items-center text-center">
                  <div className="absolute top-0 right-0 left-0 h-[300px] bg-gradient-to-b from-brand-primary/20 to-transparent blur-[80px] pointer-events-none" />

                  <div className="w-24 h-24 rounded-2xl bg-black border border-white/20 p-1 mb-6 relative shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    <div className="absolute inset-0 border border-brand-primary/50 rounded-2xl scale-110 animate-ping opacity-20" />
                    <img
                      src="https://i.pravatar.cc/150?u=me"
                      alt="Founder"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>

                  <h2 className="text-4xl font-black text-white mb-2">
                    Alex.eth{" "}
                    <span className="text-lg text-brand-primary ml-2 font-mono">
                      Neural Profile Active
                    </span>
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl mb-10">
                    AI model interpreting your execution behavior, strategic
                    thinking, and emotional resilience across the ecosystem.
                  </p>

                  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-primary/30 transition-colors">
                      <Fingerprint className="w-6 h-6 text-brand-primary mb-4" />
                      <h4 className="font-bold text-white mb-1">
                        Execution Rhythm
                      </h4>
                      <p className="text-3xl font-black text-brand-primary mb-2">
                        94th %
                      </p>
                      <p className="text-xs text-slate-400">
                        Consistent deep work blocks detected. High resilience to
                        context switching.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-400/30 transition-colors">
                      <Brain className="w-6 h-6 text-emerald-400 mb-4" />
                      <h4 className="font-bold text-white mb-1">
                        Strategic Thesis
                      </h4>
                      <p className="text-3xl font-black text-emerald-400 mb-2">
                        Systems Builder
                      </p>
                      <p className="text-xs text-slate-400">
                        Gravitates towards infrastructure and API abstraction
                        plays.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-400/30 transition-colors">
                      <Target className="w-6 h-6 text-purple-400 mb-4" />
                      <h4 className="font-bold text-white mb-1">
                        AI Matchmaking
                      </h4>
                      <p className="text-3xl font-black text-white mb-2">
                        Ready
                      </p>
                      <p className="text-xs text-slate-400">
                        System is ready to scour global networks for your
                        perfect match.
                      </p>
                    </div>
                  </div>

                  {isExecuting ? (
                    <div className="mt-12 flex flex-col items-center justify-center space-y-4">
                      <BrainCircuit className="w-12 h-12 text-brand-primary animate-pulse" />
                      <p className="text-white font-bold text-lg">
                        AI Matching Protocol Active...
                      </p>
                    </div>
                  ) : aiExecutionOutput &&
                    activeTask === "Find Co-Founder Match" ? (
                    <div className="mt-12 w-full max-w-4xl text-left bg-black/60 rounded-xl border border-white/10 p-6 overflow-y-auto max-h-[400px] markdown-body">
                      <Markdown>{aiExecutionOutput}</Markdown>
                    </div>
                  ) : (
                    <Button
                      className="mt-12 bg-white text-black hover:bg-slate-200 font-extrabold px-8 py-6 text-lg rounded-xl"
                      onClick={() =>
                        executeAiTask(
                          "AI Matchmaker",
                          "Find Co-Founder Match",
                          "Alex.eth connects as a Technical Systems Builder. Generate a deep analysis of complementary co-founder roles, highlighting 3 specific simulated candidates with extreme precision.",
                        )
                      }
                    >
                      Engage Neural Matchmaker{" "}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Draft Project Modal */}
      <AnimatePresence>
        {isDraftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDraftModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="relative w-full max-w-lg bg-[#0c0d12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <FileEdit className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Draft New Project
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Initialize a venture proposal in the Ecosystem pipeline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Helix AI or Pulse Engine"
                    value={newProjectDraft.name}
                    onChange={(e) =>
                      setNewProjectDraft((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Core Thesis / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Real-time predictive dispatch routing for autonomous fleets"
                    value={newProjectDraft.tagline}
                    onChange={(e) =>
                      setNewProjectDraft((prev) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Target Cap / Val
                    </label>
                    <input
                      type="text"
                      placeholder="$6.0M"
                      value={newProjectDraft.cap}
                      onChange={(e) =>
                        setNewProjectDraft((prev) => ({
                          ...prev,
                          cap: e.target.value,
                        }))
                      }
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="AI, Infra, Cloud"
                      value={newProjectDraft.tags}
                      onChange={(e) =>
                        setNewProjectDraft((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Initial status will be <strong>Draft</strong>. You can dispatch to <strong>Sent</strong> with real-time transition animations anytime.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDraftProject}
                  disabled={!newProjectDraft.name.trim()}
                  className="bg-brand-primary text-black font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Initialize Draft Project
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Banner for Automated Interview Workflow */}
      <InterviewTriggerBanner
        isOpen={isInterviewBannerOpen && !!interviewPrepTarget}
        targetName={interviewPrepTarget?.name || 'Project'}
        onOpenDossier={() => {
          setIsInterviewBannerOpen(false);
          setIsInterviewModalOpen(true);
        }}
        onDismiss={() => setIsInterviewBannerOpen(false)}
      />

      {/* Full AI Interview Preparation Dossier Modal */}
      {interviewPrepTarget && (
        <InterviewPrepModal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          targetId={interviewPrepTarget.id}
          targetType="project"
          targetName={interviewPrepTarget.name}
          subtitle={interviewPrepTarget.subtitle}
          tags={interviewPrepTarget.tags}
          capOrSalary={interviewPrepTarget.cap}
          notes={interviewPrepTarget.notes}
        />
      )}
    </div>
  );
}
