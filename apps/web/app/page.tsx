'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, BrainCircuit, Terminal, Activity,
  Boxes, GitMerge, FileCode2, Database, Mic, Layers,
  ChevronRight, Sparkles, Cpu, Blocks, ArrowUpRight,
  Network, Search, Code, Shield, Box, Server, CheckCircle, Target, PenTool
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   VEL AI — Premium Landing Page
   Inspired by elite devtools (Solana.new, Linear, Vercel)
   ═══════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-transparent text-[#E8E8E8] font-body selection:bg-white/20 selection:text-white overflow-hidden">
      
      {/* ── NAVIGATION ──────────────────────────────────────── */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
      >
        <div className="absolute inset-0 bg-[#020203]/40 backdrop-blur-2xl border-b border-white/[0.04] mask-nav" />
        
        <div className="relative z-10 flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">VEL AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/60">
            {['Features', 'Models', 'Workspace', 'Developers', 'Pricing'].map(item => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <Link href="/sign-in" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/sign-up" className="relative group overflow-hidden rounded-full p-[1px]">
            <span className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#0A0A0C] px-5 py-2 rounded-full flex items-center gap-2 transition-all group-hover:bg-[#111114]">
              <span className="text-[13px] font-semibold text-white">Launch App</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-32">
        {/* Background Visual moved to global layout.tsx */}

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse shadow-[0_0_12px_#00FF88]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-white/70">
              The Infinite Multi-Agent Operating Workspace
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(48px,8vw,120px)] font-hero font-normal leading-[0.9] tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 pb-4 drop-shadow-2xl"
          >
            The Future of <br className="hidden md:block" />
            AI Workflows
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[clamp(16px,2vw,20px)] leading-[1.6] text-white/50 max-w-2xl font-medium tracking-tight"
          >
            VEL AI unifies Claude, GPT, Gemini, Kimi, Perplexity, terminal agents, 
            CAD systems, and intelligent workflows into one infinite workspace.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/sign-up" className="h-12 px-8 rounded-full bg-white text-black font-semibold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="h-12 px-8 rounded-full bg-white/[0.03] border border-white/[0.08] text-white font-medium flex items-center gap-2 hover:bg-white/[0.08] transition-all backdrop-blur-md">
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Infinite Workspace Preview (Floating 3D) */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 2000 }}
          className="relative w-full max-w-6xl mt-32 px-6"
        >
          <div className="relative aspect-[16/9] w-full rounded-2xl bg-[#0A0A0C]/80 border border-white/[0.08] backdrop-blur-2xl shadow-[0_0_100px_rgba(109,95,255,0.15)] overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
            
            {/* Massive Complex Workflow Graph matching user reference */}
            <svg viewBox="0 0 1600 900" className="absolute inset-0 w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="gradient-A78BFA" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8"/><stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="gradient-FFAA00" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFAA00" stopOpacity="0.8"/><stop offset="100%" stopColor="#FFAA00" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="gradient-EC4899" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EC4899" stopOpacity="0.8"/><stop offset="100%" stopColor="#EC4899" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="gradient-00FF88" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00FF88" stopOpacity="0.8"/><stop offset="100%" stopColor="#00FF88" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="gradient-4488FF" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4488FF" stopOpacity="0.8"/><stop offset="100%" stopColor="#4488FF" stopOpacity="0.1"/></linearGradient>
                <linearGradient id="gradient-10B981" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/><stop offset="100%" stopColor="#10B981" stopOpacity="0.1"/></linearGradient>
              </defs>

              {/* Central Orchestrator Radial Glow */}
              <circle cx="800" cy="400" r="120" fill="none" stroke="#4488FF" strokeWidth="1" strokeDasharray="4 8" className="animate-[spin_20s_linear_infinite]" opacity="0.5" />
              <circle cx="800" cy="400" r="160" fill="none" stroke="#4488FF" strokeWidth="1" strokeDasharray="2 12" className="animate-[spin_30s_reverse_linear_infinite]" opacity="0.3" />

              {/* Connections */}
              {/* Goal to Research & UI */}
              <Connection start={[290, 150]} end={[380, 150]} color="#A78BFA" dashed />
              <Connection start={[290, 150]} end={[100, 320]} color="#EC4899" />
              
              {/* Research to Orchestrator & Data Analyzer */}
              <Connection start={[620, 150]} end={[800, 240]} color="#FFAA00" dashed />
              <Connection start={[620, 120]} end={[700, 120]} color="#FFAA00" />
              
              {/* Data Analyzer to Strategy */}
              <Connection start={[940, 120]} end={[1000, 150]} color="#A78BFA" />
              
              {/* Strategy to Orchestrator & PRD */}
              <Connection start={[1240, 150]} end={[1300, 150]} color="#EC4899" />
              <Connection start={[1050, 230]} end={[880, 290]} color="#EC4899" />

              {/* UI/UX to Orchestrator */}
              <Connection start={[290, 430]} end={[660, 400]} color="#EC4899" />

              {/* Orchestrator to Code Architect & Database & DevOps & QA */}
              <Connection start={[940, 400]} end={[1000, 400]} color="#00FF88" dashed />
              <Connection start={[700, 560]} end={[540, 600]} color="#10B981" />
              <Connection start={[800, 560]} end={[720, 680]} color="#4488FF" dashed />
              <Connection start={[940, 520]} end={[1000, 600]} color="#FFAA00" />

              {/* Code Architect to Code Generator */}
              <Connection start={[1240, 400]} end={[1300, 400]} color="#00FF88" />

              {/* Code Generator to Deployer */}
              <Connection start={[1420, 560]} end={[1380, 640]} color="#00FF88" dashed />

              {/* QA to Deployer */}
              <Connection start={[1240, 650]} end={[1300, 650]} color="#FFAA00" />


              {/* ── NODES ── */}
              
              {/* Top Left */}
              <foreignObject x="50" y="50" width="240" height="200">
                <AdvancedNode icon={Target} title="Goal / Input" model="User" color="#A78BFA" desc="Build a full-stack SaaS project for AI workflow automation. Requirements: Auth, Dashboard, Payments, Vercel." stats={[{label:'Priority', val:'High'}, {label:'Complexity', val:'High'}]} pulse />
              </foreignObject>

              <foreignObject x="380" y="60" width="240" height="180">
                <AdvancedNode icon={Search} title="Research Agent" model="Perplexity Pro" color="#FFAA00" status="Live" desc="Gathering market research, competitor analysis, and technical insights..." progress={72} stats={[{label:'Sources', val:'24'}, {label:'Findings', val:'18'}]} />
              </foreignObject>

              <foreignObject x="700" y="40" width="240" height="160">
                <AdvancedNode icon={Network} title="Data Analyzer" model="Claude 3 Opus" color="#A78BFA" status="Live" desc="Analyzing data and extracting key opportunities & risks..." progress={64} stats={[{label:'Insights', val:'12'}, {label:'Patterns', val:'7'}]} />
              </foreignObject>

              <foreignObject x="1000" y="60" width="240" height="170">
                <AdvancedNode icon={BrainCircuit} title="Strategy Synthesizer" model="GPT-4.1" color="#EC4899" status="Live" desc="Synthesizing research into product strategy..." progress={88} stats={[{label:'Strategies', val:'6'}, {label:'Score', val:'9.2/10'}]} />
              </foreignObject>

              <foreignObject x="1300" y="60" width="240" height="170">
                <AdvancedNode icon={FileCode2} title="PRD Generator" model="Claude 3.5 Sonnet" color="#4488FF" status="Processing" desc="Generating Product Requirements Document..." progress={41} code="prd_v1.0.md\n2.4 KB" />
              </foreignObject>

              {/* Mid Left */}
              <foreignObject x="50" y="320" width="240" height="220">
                <AdvancedNode icon={PenTool} title="UI/UX Designer" model="Gemini 1.5 Pro" color="#EC4899" status="Live" desc="Creating wireframes and visual design system..." progress={67} stats={[{label:'Frames', val:'24'}, {label:'Components', val:'156'}]}>
                   <div className="flex gap-2 mt-2">
                     <div className="w-8 h-6 bg-white/10 rounded-sm" />
                     <div className="w-8 h-6 bg-white/10 rounded-sm" />
                     <div className="w-8 h-6 bg-white/10 rounded-sm" />
                     <div className="w-8 h-6 bg-white/10 rounded-sm" />
                   </div>
                </AdvancedNode>
              </foreignObject>

              {/* Center ORCHESTRATOR */}
              <foreignObject x="660" y="240" width="280" height="320">
                <AdvancedNode icon={Server} title="Orchestrator Hub" model="VEL AI Core" color="#4488FF" status="Routing" pulse>
                  <div className="flex flex-col items-center justify-center flex-1 py-4">
                     <div className="relative w-32 h-32 rounded-full border border-[#4488FF]/30 flex items-center justify-center bg-[#4488FF]/5 shadow-[0_0_40px_rgba(68,136,255,0.2)]">
                        <div className="absolute w-2 h-2 bg-[#4488FF] rounded-full animate-ping" />
                        <div className="absolute w-4 h-4 bg-[#4488FF] rounded-full shadow-[0_0_20px_#4488FF]" />
                        <div className="absolute top-2 left-6 w-1.5 h-1.5 bg-[#00FF88] rounded-full" />
                        <div className="absolute bottom-4 right-8 w-1 h-1 bg-[#FFAA00] rounded-full" />
                     </div>
                     <div className="text-center mt-6">
                        <div className="text-white/90 text-sm font-semibold">Managing 12 agents</div>
                        <div className="text-white/50 text-xs">24 active connections</div>
                     </div>
                  </div>
                </AdvancedNode>
              </foreignObject>

              {/* Mid Right */}
              <foreignObject x="1000" y="300" width="240" height="200">
                <AdvancedNode icon={Box} title="Code Architect" model="Claude 3.5 Sonnet" color="#00FF88" status="Live" desc="Designing system architecture and tech stack..." progress={100} stats={[{label:'Components', val:'18'}, {label:'Services', val:'12'}]}>
                   <div className="w-full h-8 border border-white/10 rounded bg-[#050507] mt-2 flex items-center justify-around px-2">
                     <div className="w-4 h-4 rounded bg-[#00FF88]/20 border border-[#00FF88]/50" />
                     <div className="w-8 h-1 bg-white/10" />
                     <div className="w-4 h-4 rounded bg-[#4488FF]/20 border border-[#4488FF]/50" />
                   </div>
                </AdvancedNode>
              </foreignObject>

              <foreignObject x="1300" y="290" width="240" height="270">
                <AdvancedNode icon={Code} title="Code Generator" model="GPT-4.1" color="#10B981" status="Live" desc="Generating clean, production-ready code..." progress={68} code={`// API Route\napp.get('/api/workflows', \n  async (req, res) => {\n  const workflows = await \n    db.workflows.find();\n  res.json(workflows);\n})`} stats={[{label:'Files', val:'42'}, {label:'Lines', val:'2,847'}]} />
              </foreignObject>

              {/* Bottom Row */}
              <foreignObject x="300" y="550" width="240" height="220">
                <AdvancedNode icon={Database} title="Database Designer" model="Claude 3 Opus" color="#10B981" status="Live" desc="Designing database schema and relationships..." progress={100} stats={[{label:'Tables', val:'12'}, {label:'Relations', val:'18'}]}>
                  <div className="flex gap-4 text-[9px] font-mono text-white/50 mt-2">
                    <div>
                      <div className="text-white/80 mb-1 border-b border-white/10 pb-1">Users</div>
                      <div>• id (PK)</div>
                      <div>• email</div>
                    </div>
                    <div>
                      <div className="text-white/80 mb-1 border-b border-white/10 pb-1">Projects</div>
                      <div>• id (PK)</div>
                      <div>• user_id (FK)</div>
                    </div>
                  </div>
                </AdvancedNode>
              </foreignObject>

              <foreignObject x="600" y="650" width="240" height="200">
                <AdvancedNode icon={Terminal} title="DevOps Engineer" model="Claude 3.5 Sonnet" color="#4488FF" status="Live" desc="Setting up CI/CD, monitoring and infrastructure..." progress={68} stats={[{label:'Services', val:'6'}, {label:'Pipelines', val:'4'}]}>
                   <div className="flex items-center gap-3 mt-2">
                     <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px]">AWS</div>
                     <div className="w-6 h-6 rounded-full bg-[#00FF88]/20 text-[#00FF88] flex items-center justify-center text-[8px] font-bold">N</div>
                     <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px] font-bold">docker</div>
                   </div>
                </AdvancedNode>
              </foreignObject>

              <foreignObject x="1000" y="550" width="240" height="180">
                <AdvancedNode icon={Shield} title="QA & Tester" model="GPT-4.1" color="#FFAA00" status="Live" desc="Writing and running tests... Ensuring quality..." progress={77} stats={[{label:'Tests', val:'128'}, {label:'Passed', val:'112'}]} />
              </foreignObject>

              <foreignObject x="1300" y="600" width="240" height="230">
                <AdvancedNode icon={CheckCircle} title="Deployer" model="Vercel AI" color="#00FF88" status="Ready" desc="Preparing deployment pipeline...">
                   <div className="space-y-2 text-[10px] text-white/70 mt-2">
                      <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#00FF88]" /> Build Optimized</div>
                      <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#00FF88]" /> Tests Passed</div>
                      <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#00FF88]" /> Security Scanned</div>
                   </div>
                   <button className="w-full mt-4 py-2 rounded-md bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30 font-semibold text-[10px] hover:bg-[#00FF88]/20 transition-colors">
                     Deploy to Production
                   </button>
                </AdvancedNode>
              </foreignObject>

            </svg>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-transparent opacity-80" />
          </div>
        </motion.div>
      </section>

      {/* ── LOGOS ────────────────────────────────────────────── */}
      <section className="py-24 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[12px] font-mono tracking-widest text-white/30 uppercase mb-12">
            Integrated with the frontier of intelligence
          </p>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['Anthropic', 'OpenAI', 'Google DeepMind', 'Perplexity', 'Meta AI', 'DeepSeek', 'xAI'].map(logo => (
              <span key={logo} className="text-xl font-bold tracking-tight">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────── */}
      <section id="features" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-[clamp(32px,5vw,56px)] font-display font-semibold tracking-tight leading-[1.1] mb-6">
              Infinite Canvas.<br/>
              <span className="text-white/40">Zero limitations.</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              Break out of the chat box. Orchestrate complex workflows with multi-agent consensus, live terminal execution, and persistent shared context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[420px]">
            {/* ── CARD 1: Task List (1/3) ── */}
            <div className="group relative p-8 rounded-[24px] bg-[#0A0A0C]/90 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-end overflow-hidden hover:border-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-0 left-0 right-0 p-8 space-y-3">
                {[
                  { name: 'Research Competitors', icon: <Boxes className="w-3.5 h-3.5" />, color: '#00FF88' },
                  { name: 'Analyze Codebase', icon: <FileCode2 className="w-3.5 h-3.5" />, color: '#A78BFA' },
                  { name: 'Deploy Infrastructure', icon: <Terminal className="w-3.5 h-3.5" />, color: '#FFAA00' },
                  { name: 'Generate Reports', icon: <Database className="w-3.5 h-3.5" />, color: '#4488FF' },
                ].map((task, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      {task.icon} {task.name}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: task.color, boxShadow: `0 0 8px ${task.color}` }} />
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-display font-semibold tracking-tight mb-2 text-white/90">Autonomous Swarms</h3>
                <p className="text-[14px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  Deploy multiple specialized agents to handle repetitive research and engineering pipelines.
                </p>
              </div>
            </div>

            {/* ── CARD 2: Workflows (2/3) ── */}
            <div className="group relative p-8 md:col-span-2 rounded-[24px] bg-[#0A0A0C]/90 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-end overflow-hidden hover:border-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-0 left-0 w-full h-[60%] flex items-center justify-center">
                <svg viewBox="0 0 400 200" className="w-full h-full opacity-60">
                  <path d="M 100 100 C 180 100, 200 40, 300 40" stroke="url(#glow-blue)" strokeWidth="1.5" fill="none" className="animate-[dash_10s_linear_infinite]" strokeDasharray="4 4" />
                  <path d="M 100 100 C 180 100, 200 100, 300 100" stroke="url(#glow-purple)" strokeWidth="1.5" fill="none" />
                  <path d="M 100 100 C 180 100, 200 160, 300 160" stroke="url(#glow-orange)" strokeWidth="1.5" fill="none" className="animate-[dash_15s_linear_infinite]" strokeDasharray="4 4" />
                  
                  <defs>
                    <linearGradient id="glow-blue" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4488FF" stopOpacity="0.8"/><stop offset="100%" stopColor="#4488FF" stopOpacity="0"/></linearGradient>
                    <linearGradient id="glow-purple" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8"/><stop offset="100%" stopColor="#A78BFA" stopOpacity="0"/></linearGradient>
                  </defs>

                  <rect x="60" y="80" width="40" height="40" rx="8" fill="#111115" stroke="#ffffff" strokeOpacity="0.1" />
                  <foreignObject x="60" y="80" width="40" height="40">
                    <div className="w-full h-full flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5 text-white/80" />
                    </div>
                  </foreignObject>

                  <rect x="300" y="24" width="32" height="32" rx="6" fill="#111115" stroke="#ffffff" strokeOpacity="0.1" />
                  <foreignObject x="300" y="24" width="32" height="32">
                    <div className="w-full h-full flex items-center justify-center">
                      <Terminal className="w-3.5 h-3.5 text-[#4488FF]" />
                    </div>
                  </foreignObject>

                  <rect x="300" y="84" width="32" height="32" rx="6" fill="#111115" stroke="#ffffff" strokeOpacity="0.1" />
                  <foreignObject x="300" y="84" width="32" height="32">
                    <div className="w-full h-full flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5 text-[#A78BFA]" />
                    </div>
                  </foreignObject>

                  <rect x="300" y="144" width="32" height="32" rx="6" fill="#111115" stroke="#ffffff" strokeOpacity="0.1" />
                  <foreignObject x="300" y="144" width="32" height="32">
                    <div className="w-full h-full flex items-center justify-center">
                      <Database className="w-3.5 h-3.5 text-[#FFAA00]" />
                    </div>
                  </foreignObject>
                </svg>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-display font-semibold tracking-tight mb-2 text-white/90">Infinite Routing</h3>
                <p className="text-[14px] text-white/40 leading-relaxed max-w-md group-hover:text-white/60 transition-colors">
                  Design complex acyclic graphs. Output from GPT-4o flows directly into Claude's context window.
                </p>
              </div>
            </div>

            {/* ── CARD 3: Radar (1/3) ── */}
            <div className="group relative p-8 rounded-[24px] bg-[#0A0A0C]/90 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-end overflow-hidden hover:border-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-0 left-0 w-full h-[60%] flex items-center justify-center">
                <div className="relative w-40 h-40 rounded-full border border-white/5 flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full border border-white/5" />
                  <div className="absolute w-8 h-8 rounded-full border border-white/10 bg-white/[0.02]" />
                  <div className="absolute w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(255,255,255,0.1)_360deg)] animate-[spin_4s_linear_infinite]" />
                  <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                  <div className="absolute bottom-1/3 left-1/4 w-1 h-1 rounded-full bg-white/50" />
                </div>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-display font-semibold tracking-tight mb-2 text-white/90">Shared Context</h3>
                <p className="text-[14px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  A persistent memory store ensures all agents maintain exact situational awareness.
                </p>
              </div>
            </div>

            {/* ── CARD 4: Code (1/3) ── */}
            <div className="group relative p-8 rounded-[24px] bg-[#0A0A0C]/90 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-end overflow-hidden hover:border-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-8 left-8 right-8 bg-[#050507] rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="w-2 h-2 rounded-full bg-red-500/80" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <div className="w-2 h-2 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-[9px] font-mono text-white/30">terminal.tsx</span>
                </div>
                <div className="p-4 font-mono text-[10px] leading-relaxed text-white/40">
                  <span className="text-[#A78BFA]">const</span> agent = <span className="text-[#4488FF]">new</span> <span className="text-[#00FF88]">DevOpsAgent</span>();<br/>
                  agent.<span className="text-[#4488FF]">deploy</span>(&#123;<br/>
                  &nbsp;&nbsp;target: <span className="text-[#FFAA00]">'production'</span>,<br/>
                  &nbsp;&nbsp;autoFix: <span className="text-[#A78BFA]">true</span><br/>
                  &#125;);
                </div>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-display font-semibold tracking-tight mb-2 text-white/90">Terminal Sandboxes</h3>
                <p className="text-[14px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  Deploy agents that can write, execute, and debug bash scripts natively.
                </p>
              </div>
            </div>

            {/* ── CARD 5: Bars (1/3) ── */}
            <div className="group relative p-8 rounded-[24px] bg-[#0A0A0C]/90 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-end overflow-hidden hover:border-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-0 left-0 w-full h-[60%] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Sparkles className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex items-end gap-1.5 h-12">
                  {[40, 60, 30, 80, 50, 90, 70, 45].map((h, i) => (
                    <div key={i} className="w-3 bg-white/10 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-display font-semibold tracking-tight mb-2 text-white/90">Deep Research</h3>
                <p className="text-[14px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  Multi-pass data extraction powered by Perplexity Sonar and continuous learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TERMINAL / DEVOPS SHOWCASE ──────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-[11px] font-mono uppercase tracking-widest mb-6">
              Agentic Execution
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-6 leading-tight">
              AI that writes code.<br/>
              <span className="text-white/40">And actually runs it.</span>
            </h2>
            <p className="text-lg text-white/50 leading-relaxed mb-8">
              Deploy autonomous terminal agents. They don't just suggest bash commands—they execute them, read the output, debug failures, and deploy infrastructure directly from your workspace.
            </p>
            <ul className="space-y-4">
              {['Secure isolated sandboxes', 'Real-time stdout/stderr streaming', 'Automated error recovery loops'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full">
            <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-white/30">vel-ai@production:~</span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed h-[320px] overflow-hidden relative">
                <div className="text-white/40">~ <span className="text-[#00FF88]">$</span> vel-agent deploy --target aws</div>
                <div className="text-[#A78BFA] mt-2">➔ Initializing Claude DevOps Agent...</div>
                <div className="text-white/60 mt-2">Analyzing infrastructure requirements...</div>
                <div className="text-white/60">Generating Terraform states...</div>
                <div className="text-amber-400 mt-2">⚠ Warning: Missing IAM permissions. Automatically generating policy patch.</div>
                <div className="text-white/60 mt-2">Applying patches...</div>
                <div className="text-[#00FF88] mt-4">✔ Infrastructure successfully deployed in 14.2s</div>
                <div className="text-white/40 mt-4">~ <span className="text-[#00FF88]">$</span> <span className="animate-pulse">_</span></div>
                
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0C] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] bg-[#020203] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">VEL AI</span>
            </div>
            <p className="text-[13px] text-white/40 leading-relaxed">
              The infinite multi-agent operating workspace. Unifying intelligence, execution, and context.
            </p>
          </div>

          <div className="flex gap-16 text-[13px]">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white/80 mb-2">Platform</h4>
              {['Canvas', 'Models', 'Terminal', 'Pricing'].map(l => (
                <Link key={l} href="#" className="text-white/40 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white/80 mb-2">Resources</h4>
              {['Documentation', 'API Reference', 'GitHub', 'Discord'].map(l => (
                <Link key={l} href="#" className="text-white/40 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white/80 mb-2">Company</h4>
              {['Blog', 'Careers', 'Terms', 'Privacy'].map(l => (
                <Link key={l} href="#" className="text-white/40 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between text-[12px] text-white/30">
          <span>© {new Date().getFullYear()} VEL AI Inc. All rights reserved.</span>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="w-2 h-2 rounded-full bg-[#00FF88]" /> All systems operational
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes dash {
          to { stroke-dashoffset: -400; }
        }
      `}</style>
    </div>
  );
}

/* ── REUSABLE COMPONENTS ────────────────────────────────── */



function Connection({ start, end, color, dashed = false }: any) {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const midX = (sx + ex) / 2;
  const path = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ey}, ${ex} ${ey}`;
  return (
    <>
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" opacity="0.15" />
      <path 
        d={path} 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none" 
        strokeDasharray={dashed ? "6 6" : "none"}
        className={dashed ? "animate-[dash_20s_linear_infinite]" : "opacity-80"} 
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
      <circle cx={sx} cy={sy} r="3" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <circle cx={ex} cy={ey} r="3" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </>
  );
}

function AdvancedNode({ 
  icon: Icon, title, model, color, status, desc, progress, stats, code, children, pulse 
}: any) {
  return (
    <div className="p-4 rounded-xl bg-[#0A0A0C]/95 border shadow-2xl backdrop-blur-2xl w-full h-full flex flex-col transition-all duration-300" style={{ borderColor: `${color}40`, boxShadow: `0 0 40px ${color}10` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-6 h-6 flex items-center justify-center rounded-md" style={{ backgroundColor: `${color}15`, color }}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-white/90">{title}</span>
        </div>
        {model && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-mono flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: pulse ? `0 0 8px ${color}` : 'none' }} className={pulse ? "animate-pulse" : ""} />
            {model}
          </span>
        )}
      </div>
      
      {status && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-white/40">Status:</span>
          <span className="text-[10px] text-white/80 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'Live' || status === 'Processing' ? 'animate-pulse' : ''}`} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            {status}
          </span>
        </div>
      )}
      
      {desc && <p className="text-[10px] leading-[1.6] text-white/50 mb-4">{desc}</p>}
      
      <div className="mt-auto space-y-3">
        {progress !== undefined && (
          <div className="space-y-1.5">
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
            </div>
          </div>
        )}
        
        {stats && (
          <div className="flex items-center justify-between text-[9px] text-white/40 font-mono pt-1">
            {stats.map((s: any, i: number) => (
              <span key={i}>{s.label}: <span className="text-white/80">{s.val}</span></span>
            ))}
          </div>
        )}

        {code && (
           <div className="bg-[#050507] rounded-md border border-white/5 p-2.5 font-mono text-[8px] text-white/50 overflow-hidden leading-relaxed">
              {code}
           </div>
        )}

        {children}
      </div>
    </div>
  );
}
