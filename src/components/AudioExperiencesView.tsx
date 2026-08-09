import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Headphones, 
  Volume2, 
  FileText, 
  Download, 
  Bookmark, 
  Plus, 
  Check, 
  Compass, 
  Sparkles, 
  Clock, 
  Info,
  ChevronRight,
  BookOpen
} from "lucide-react";

interface AudioTrack {
  id: string;
  title: { en: string; zh: string };
  category: { en: string; zh: string };
  categoryKey: "audiobook" | "essay" | "podcast" | "listening-room";
  duration: string;
  pillar: string;
  transcript: {
    en: string;
    zh: string;
  };
}

interface AudioExperiencesViewProps {
  lang: "en" | "zh";
  onBackToHome: () => void;
  onPlayChime?: () => void;
  onAddToCart?: (item: any) => void;
  onNavigateToListeningRoom?: () => void;
}

export default function AudioExperiencesView({
  lang,
  onBackToHome,
  onPlayChime,
  onAddToCart,
  onNavigateToListeningRoom
}: AudioExperiencesViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<string>("featured-audio");
  const [playbackProgress, setPlaybackProgress] = useState(35); // Initial percentage
  const [showTranscriptId, setShowTranscriptId] = useState<string | null>(null);
  const [librarySavedIds, setLibrarySavedIds] = useState<string[]>([]);
  const [customVolume, setCustomVolume] = useState(80);

  // Simulated player tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleAction = (cb?: () => void) => {
    if (onPlayChime) onPlayChime();
    if (cb) cb();
  };

  const togglePlay = (trackId: string) => {
    handleAction(() => {
      if (activeTrackId !== trackId) {
        setActiveTrackId(trackId);
        setPlaybackProgress(0);
        setIsPlaying(true);
      } else {
        setIsPlaying(!isPlaying);
      }
    });
  };

  const toggleSaveToLibrary = (id: string) => {
    handleAction(() => {
      setLibrarySavedIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    });
  };

  // Audio categories
  const categories = [
    {
      id: "audiobooks",
      title: { en: "Audiobooks", zh: "有声书" },
      desc: { en: "Long-form knowledge publications in audio format.", zh: "将长期出版内容与厚重智识转化为可随时聆听的深度有声经典。" }
    },
    {
      id: "essays",
      title: { en: "Audio Essays", zh: "音频文章" },
      desc: { en: "Shorter editorial reflections designed for focused listening.", zh: "适合在短暂散步或休息时，用于专注聆听的短篇编辑型思想随笔。" }
    },
    {
      id: "podcasts",
      title: { en: "Podcasts", zh: "播客系统" },
      desc: { en: "Conversational or narrated episodes across body, tool, and capital.", zh: "围绕身体长寿、AI自动化工具与财富认知展开的叙事型音频对话。" }
    },
    {
      id: "listening-room",
      title: { en: "Listening Room", zh: "聆听室" },
      desc: { en: "A calm online space for selected Immersation audio.", zh: "用于在线流式播放精选 Immersation 音频的高信噪比沉浸式播放空间。" }
    }
  ];

  // List of tracks
  const tracks: AudioTrack[] = [
    {
      id: "featured-audio",
      title: {
        en: "Stable Body. Intelligent Leverage. Long-Term Capital.",
        zh: "稳定的身体、智能的杠杆、长期的资本"
      },
      category: { en: "Audio Introduction", zh: "音频导论" },
      categoryKey: "listening-room",
      duration: "12:15",
      pillar: "SYSTEM",
      transcript: {
        en: "Welcome to Immersation. In this introductory essay, we dissect the core synergy between our three pillars. True high-signal performance is not built on stress and hustle. It is built on standardizing biological recovery, using prompts and background scripts to offload cognitive chores, and allocating long-term compound capital. Under this design, the mind remains perfectly quiet, while physical and economic assets expand sustainably in the silent background...",
        zh: "欢迎收听智枢导论。在本章中，我们将拆解三大核心支柱之间的无缝协同机制。高信噪比的个人成就绝非构建在焦虑与无休止的内耗之上，而是源于：使生理机能恢复标准化，通过系统级的 AI 提示词与后台脚本自动处理琐碎的脑力劳动，以及在长周期中配置具备复利效应的资本。在这种架构下，您的大脑得享绝对的寂静，而身体与财务资产则在后台安静且持续地演进增长……"
      }
    },
    {
      id: "audio-art-thinking",
      title: {
        en: "Cognitive Offloading & Sleep Optimization",
        zh: "大脑卸载、深睡眠机制与认知复位"
      },
      category: { en: "Audio Essay", zh: "音频文章" },
      categoryKey: "essay",
      duration: "18:40",
      pillar: "BODY",
      transcript: {
        en: "How does the brain purge waste and reset system variables? In this reading, we trace the biochemical links between slow-wave deep sleep and cognitive offloading. By writing structured journals before bedtime, we send clean closure cues to the subconscious, reducing decision latency the next morning...",
        zh: "大脑如何清除代谢废物并重置系统变量？在这篇音频中，我们追踪慢波深睡眠与‘心智卸载’之间的神经生化联系。在睡前通过结构化的日志对全天事务进行利落收尾，能向潜意识发送闭环指令，从而在第二天早晨大幅缩短决策延迟……"
      }
    },
    {
      id: "audio-leverage-prompting",
      title: {
        en: "Prompting Pipelines for Zero Friction",
        zh: "零磨损的 AI 自动化提示词工作流管线"
      },
      category: { en: "Audio Audiobook", zh: "有声书籍" },
      categoryKey: "audiobook",
      duration: "42:10",
      pillar: "TOOL",
      transcript: {
        en: "Chapter 4: The Construction of Silent Assistants. Learn how to configure JSON prompts that feed into local scripts. By standardizing the parameters of your input formats, you eliminate the cognitive overhead of reminding the machine what you want. We explore a practical multi-stage review template...",
        zh: "第四章：静音数字助手的搭建工程。了解如何配置输出高度稳定 JSON 格式的系统级 Prompts，并将其接入本地自动化脚本。通过规范输入格式的各项参数，能够彻底消除“每次都要教 AI 重来一遍”的认知开销，实现真正无摩擦的日常流转……"
      }
    },
    {
      id: "audio-compound-wealth",
      title: {
        en: "The Math of Quiet Capital Allocation",
        zh: "静音资本配置：长期投资的数学与纪律"
      },
      category: { en: "Audio Essay", zh: "音频文章" },
      categoryKey: "essay",
      duration: "14:50",
      pillar: "CAPITAL",
      transcript: {
        en: "In highly distracted market cycles, the greatest risk is the urge to react. We analyze why active trading often degrades net returns when compared to quiet, algorithmic dollar-cost averaging. Reclaim control of your compounding parameters and block out noisy short-term market indicators...",
        zh: "在被严重碎片化的市场周期中，最大的风险来自大动干戈的盲目频繁操作。我们用数学模型证明，与静默、有纪律的周期性配置相比，高频的主动交易如何由于手续费与心理噪音而削弱了净回报。夺回属于你的复利参数控制权，屏蔽市场的短期杂音……"
      }
    },
    {
      id: "audio-podcast-builders",
      title: {
        en: "Conversations with Quiet Builders (Ep. 04)",
        zh: "安静的构建者：专访那些拒绝喧嚣的极客 (第四期)"
      },
      category: { en: "Podcast", zh: "播客节目" },
      categoryKey: "podcast",
      duration: "35:15",
      pillar: "SYSTEM",
      transcript: {
        en: "In this episode, we sit down with developer and long-term allocator Chen, who runs a multi-million dollar asset portfolio entirely through serverless cron scripts and a 3-hour workweek. We discuss why high output doesn't require a high pulse, and how he keeps his attention workspace pristine...",
        zh: "在本期播客中，我们对话极简开发者与长期投资者 Chen。他通过无服务器的静默 Cron 脚本和每周仅 3 小时的复盘，平稳掌管着数百万美元的资产组合。我们探讨了为什么极致的产能并不需要亢奋的脉搏，以及他是如何保持个人注意力的绝对无暇……"
      }
    }
  ];

  const currentTrack = tracks.find(t => t.id === activeTrackId) || tracks[0];

  return (
    <div className="bg-[#F4F1EB] min-h-screen text-[#1C1C1C] selection:bg-[#8B5A44]/10 selection:text-[#8B5A44] pt-24 pb-20 relative overflow-hidden font-sans">
      
      {/* Editorial Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" id="audio-grid-bg">
        <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#1C1C1C 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => handleAction(onBackToHome)}
          className="flex items-center gap-2 group text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1C1C]/60 hover:text-[#8B5A44] transition-colors mb-12 cursor-pointer"
          id="audio-back"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{lang === "en" ? "Back to Chamber" : "返回主页"}</span>
        </button>

        {/* 1. Hero Masthead (With soft concentric circles and minimal waveform abstraction) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 border-b border-[#D8D2C6]/50 pb-16" id="audio-hero">
          
          {/* Left Text */}
          <div className="lg:col-span-7">
            <span className="font-display text-[9px] uppercase font-bold tracking-[0.25em] text-[#8B5A44] bg-[#8B5A44]/10 px-2.5 py-1.5 rounded-sm inline-block mb-4">
              {lang === "en" ? "LOW-ATTENTION LAYER" : "听觉通道 · 音频出版层"}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A2F24] tracking-tight leading-[1.1] mb-6 ink-text">
              {lang === "en" ? "Audio Experiences" : "音频体验"}
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#1C1C1C]/75 leading-relaxed max-w-xl">
              {lang === "en" 
                ? "Knowledge for walking, resting, commuting, and focused listening. Listen to selected audiobooks, audio essays, and podcast-style knowledge sessions designed to bring Immersation into low-attention and reflective moments."
                : "进入通勤、散步、休息与专注聆听场景的知识内容。聆听精选有声书、音频文章与播客式知识内容，屏蔽屏幕发蓝光的干扰，让 Immersation｜智枢阁 的高信噪比心智资产进入低注意力与深度反思的时刻。"}
            </p>
          </div>

          {/* Right: Custom Abstract Audio concentric circle wave visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 rounded-full border border-[#D8D2C6] bg-white/30 flex items-center justify-center p-6 shadow-sm overflow-hidden" id="audio-wave-graphic">
              
              {/* Concentric rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-60 h-60 border border-[#8B5A44]/10 rounded-full"></div>
                <div className="w-48 h-48 border border-[#8B5A44]/15 rounded-full animate-pulse"></div>
                <div className="w-36 h-36 border border-[#8B5A44]/20 rounded-full"></div>
                <div className="w-24 h-24 border border-[#8B5A44]/30 border-dashed rounded-full animate-[spin_30s_linear_infinite]"></div>
              </div>

              {/* Minimal Earbud/Soundwave vector center */}
              <div className="z-10 text-center flex flex-col items-center">
                <Headphones className="w-8 h-8 text-[#1A2F24] mb-2 stroke-[1.25]" />
                <div className="h-4 flex items-end gap-1 overflow-hidden" id="mini-waveform">
                  {[12, 24, 8, 16, 28, 14, 10, 22, 6, 18, 12, 16].map((h, i) => (
                    <span 
                      key={i} 
                      className="w-0.5 bg-[#8B5A44]/70 rounded-xs transition-all duration-300"
                      style={{ 
                        height: isPlaying ? `${Math.sin((playbackProgress + i) * 0.8) * 10 + 15}px` : `${h}px` 
                      }}
                    ></span>
                  ))}
                </div>
                <span className="text-[8px] font-mono tracking-widest text-[#1C1C1C]/40 mt-3 uppercase">
                  {isPlaying ? "PLAYING AUDIO SIGNAL" : "SIGNAL STANDBY"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Audio Categories (Four Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24" id="audio-categories">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="bg-white/45 border border-[#D8D2C6]/60 rounded-md p-6 hover-lift hover:border-[#8B5A44]/60 transition-all duration-300"
            >
              <span className="font-mono text-[9px] text-[#8B5A44] font-bold block mb-4">PILLAR MATCHED</span>
              <h3 className="font-serif text-base font-semibold text-[#1A2F24] mb-2">
                {cat.title[lang]}
              </h3>
              <p className="font-serif text-xs text-[#1C1C1C]/65 leading-relaxed">
                {cat.desc[lang]}
              </p>
            </div>
          ))}
        </div>

        {/* 3. Featured Audio (The Immersation Intro with Premium Audio Player) */}
        <div className="bg-white/55 border border-[#D8D2C6] rounded-md p-8 md:p-12 mb-24 relative overflow-hidden" id="featured-audio-player">
          <div className="absolute top-0 right-0 h-1.5 w-full bg-[#1A2F24]"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Player controls */}
            <div className="lg:col-span-5 bg-[#1A2F24] text-[#F4F1EB] rounded-md p-6 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none">
                <Volume2 className="w-48 h-48" />
              </div>

              <div className="flex justify-between items-center text-[8px] font-mono text-[#B69A6B] mb-6">
                <span>IMMEDIATE STREAMING</span>
                <span>CH. 01 SYSTEM SIGNAL</span>
              </div>

              <div className="mb-8">
                <span className="text-[10px] font-mono text-[#B69A6B] block mb-2">
                  {tracks[0].category[lang].toUpperCase()}
                </span>
                <h3 className="font-serif text-lg text-white font-normal leading-snug mb-3">
                  {tracks[0].title[lang]}
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-mono text-white/55">
                  <span>{lang === "en" ? "DURATION: 12:15" : "时长 12:15"}</span>
                  <span>•</span>
                  <span>{tracks[0].pillar}</span>
                </div>
              </div>

              {/* Progress Bar & Timing */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-[9px] font-mono text-white/40 mb-2">
                  <span>{Math.floor((12.25 * playbackProgress) / 100).toString().padStart(2, "0")}:{Math.floor(((12.25 * playbackProgress) % 100) * 0.6).toString().padStart(2, "0")}</span>
                  <span>12:15</span>
                </div>
                {/* Progress bar container: Warm Stone, Active progress: Quiet Rust */}
                <div 
                  className="w-full h-1 bg-[#D8D2C6]/20 rounded-full cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = ((e.clientX - rect.left) / rect.width) * 100;
                    setPlaybackProgress(percent);
                  }}
                >
                  <div 
                    className="h-full bg-[#8B5A44] rounded-full relative" 
                    style={{ width: `${playbackProgress}%` }}
                  >
                    <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#B69A6B] shadow-md"></span>
                  </div>
                </div>
              </div>

              {/* Player control buttons */}
              <div className="flex items-center justify-between">
                
                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-white/50" />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={customVolume}
                    onChange={(e) => setCustomVolume(Number(e.target.value))}
                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B69A6B]"
                  />
                </div>

                {/* Main Play/Pause (Deep Cypress play button, styled nicely) */}
                <button 
                  onClick={() => togglePlay("featured-audio")}
                  className="w-12 h-12 rounded-full bg-[#B69A6B] hover:bg-white text-[#1C1C1C] flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                  id="featured-audio-play-btn"
                >
                  {isPlaying && activeTrackId === "featured-audio" ? (
                    <Pause className="w-5 h-5 fill-current text-[#1C1C1C]" />
                  ) : (
                    <Play className="w-5 h-5 fill-current text-[#1C1C1C] ml-0.5" />
                  )}
                </button>

                {/* Library bookmark button */}
                <button 
                  onClick={() => toggleSaveToLibrary("featured-audio")}
                  className={`p-2.5 rounded-sm border transition-colors cursor-pointer ${
                    librarySavedIds.includes("featured-audio") 
                      ? "border-green-600/50 text-green-400" 
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {librarySavedIds.includes("featured-audio") ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            {/* Content description */}
            <div className="lg:col-span-7">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#8B5A44] block mb-2">
                {lang === "en" ? "FEATURED AUDIO ESSAY" : "核心主推音频"}
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] mb-4">
                {tracks[0].title[lang]}
              </h2>
              <p className="font-serif text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed mb-6">
                {lang === "en"
                  ? "A 12-minute fundamental introduction to the Immersation system. We break down the math and physiological feedback of calm leverage. Listen to learn how aligning deep sleep habits with automated workspace routines can liberate up to 15 hours of focused research time per week."
                  : "一节 12 分钟的 Immersation｜智枢阁 系统基础性导论。本篇音频直击本质，剖析了如何将有规律的生物节律与后台轻量级自动化进行深层拼装，从而每周释放多达 15 小时的深度研究时间。"}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => togglePlay("featured-audio")}
                  className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-sm transition-brand flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isPlaying && activeTrackId === "featured-audio" ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>{lang === "en" ? "Pause Listening" : "暂停播放"}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{lang === "en" ? "Listen Now" : "立即收听"}</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowTranscriptId(showTranscriptId === "featured-audio" ? null : "featured-audio")}
                  className="border border-[#D8D2C6] hover:border-[#8B5A44] text-[#1C1C1C] font-display text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white/20 hover:bg-white/50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{showTranscriptId === "featured-audio" ? (lang === "en" ? "Hide Transcript" : "隐藏对照文稿") : (lang === "en" ? "View Transcript" : "对照文稿阅读")}</span>
                </button>
                <button 
                  onClick={() => handleAction(() => {
                    alert(lang === "en" ? "Downloading high-fidelity MP3 and PDF transcript bundle..." : "正在为您初始化下载高保真有声书 MP3 音频与 PDF 双语翻译对照文本包……");
                  })}
                  className="text-[#1C1C1C]/60 hover:text-[#8B5A44] font-display text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Download File" : "离线包下载"}</span>
                </button>
              </div>

              {/* Collapsible Transcript Display (Reading/Transcript Pairing) */}
              {showTranscriptId === "featured-audio" && (
                <div className="mt-8 bg-white/40 border border-[#D8D2C6] p-6 rounded-sm text-xs font-serif text-[#1C1C1C]/80 leading-relaxed max-w-2xl animate-fadeIn">
                  <div className="flex justify-between items-center pb-3 border-b border-[#D8D2C6]/40 mb-3">
                    <span className="font-mono text-[9px] text-[#8B5A44] font-bold">TRANSCRIPT / 智枢中英对照文稿</span>
                    <button 
                      onClick={() => setShowTranscriptId(null)}
                      className="text-[#1C1C1C]/40 hover:text-[#8B5A44] font-mono text-[10px]"
                    >
                      [CLOSE]
                    </button>
                  </div>
                  <p className="mb-4">{tracks[0].transcript[lang]}</p>
                  <p className="text-[10px] text-[#1C1C1C]/50 italic">
                    {lang === "en" 
                      ? "Note: High-fidelity audio is published for individual educational use. Redistribution violates copyright."
                      : "声明：有声出版物仅供个人学术探讨。智枢阁拥有完整的声音著作权。"}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* 4. Listening Room (The Audio Viewer / Player Library Grid) */}
        <div className="mb-24" id="listening-room-library">
          <div className="mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1A2F24] tracking-tight mb-2 ink-text">
              {lang === "en" ? "The Listening Room Library" : "智枢聆听馆 · 音频图书馆"}
            </h2>
            <p className="font-serif text-xs sm:text-sm text-[#1C1C1C]/60">
              {lang === "en" ? "Browse our structured catalog of audio essays, book narration, and podcasts." : "在此发掘并沉浸收听由智枢阁策划录制的各类音频经典、思想文集与深度播客。"}
            </p>
          </div>

          <div className="space-y-4">
            {tracks.map((track) => {
              const isCurrentPlaying = isPlaying && activeTrackId === track.id;
              const isCurrentSelected = activeTrackId === track.id;
              const isSaved = librarySavedIds.includes(track.id);

              return (
                <div 
                  key={track.id}
                  className={`border rounded-md p-5 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isCurrentSelected 
                      ? "bg-white/80 border-[#8B5A44] shadow-sm" 
                      : "bg-white/40 border-[#D8D2C6]/60 hover:border-[#8B5A44]/50 hover:bg-white/60"
                  }`}
                >
                  {/* Left Metadata & Info */}
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#1C1C1C]/50 mb-2">
                      <span className="text-[#8B5A44] font-bold tracking-wider">{track.pillar}</span>
                      <span>•</span>
                      <span>{track.category[lang]}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-semibold text-[#1A2F24] leading-snug">
                      {track.title[lang]}
                    </h4>
                  </div>

                  {/* Play & Add to Library actions */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t border-[#D8D2C6]/30 md:border-t-0 justify-end">
                    
                    {/* Transcript toggle */}
                    <button 
                      onClick={() => setShowTranscriptId(showTranscriptId === track.id ? null : track.id)}
                      className={`font-display text-[9px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm transition-colors cursor-pointer ${
                        showTranscriptId === track.id 
                          ? "bg-[#1A2F24] text-white" 
                          : "border border-[#D8D2C6] text-[#1C1C1C]/65 hover:border-[#8B5A44] hover:text-[#1C1C1C]"
                      }`}
                    >
                      {lang === "en" ? "Transcript" : "中英对照"}
                    </button>

                    {/* Bookmark to library */}
                    <button 
                      onClick={() => toggleSaveToLibrary(track.id)}
                      className={`font-display text-[9px] font-bold uppercase tracking-wider px-3 py-2 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSaved 
                          ? "bg-green-100 text-green-800 border border-green-300" 
                          : "border border-[#D8D2C6] text-[#1C1C1C]/65 hover:border-[#8B5A44]"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{lang === "en" ? "Saved" : "已入库"}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>{lang === "en" ? "Save" : "存入库"}</span>
                        </>
                      )}
                    </button>

                    {/* Play action */}
                    <button 
                      onClick={() => togglePlay(track.id)}
                      className={`font-display text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isCurrentPlaying 
                          ? "bg-[#8B5A44] text-[#F4F1EB]" 
                          : "bg-[#1A2F24] hover:bg-[#8B5A44] text-white"
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>{lang === "en" ? "Playing" : "正播放"}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>{lang === "en" ? "Listen" : "收听"}</span>
                        </>
                      )}
                    </button>
                    
                  </div>

                  {/* Inline Transcript render for library grid */}
                  {showTranscriptId === track.id && track.id !== "featured-audio" && (
                    <div className="w-full basis-full mt-4 bg-white/70 border border-[#D8D2C6] p-5 rounded-sm text-xs font-serif text-[#1C1C1C]/85 leading-relaxed animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b border-[#D8D2C6]/40 mb-3">
                        <span className="font-mono text-[8px] text-[#8B5A44] font-bold">TRANSCRIPT AUDIO / 双语原文对照</span>
                        <button 
                          onClick={() => setShowTranscriptId(null)}
                          className="text-[#1C1C1C]/40 hover:text-[#8B5A44] font-mono text-[9px]"
                        >
                          [CLOSE]
                        </button>
                      </div>
                      <p className="mb-2">{track.transcript[lang]}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Audio Reading Pairing Philosophy */}
        <div className="bg-white/40 border border-[#D8D2C6]/60 rounded-md p-8 mb-24 max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center" id="audio-pairing-philosophy">
          <div className="w-12 h-12 bg-[#1A2F24]/10 text-[#1A2F24] rounded-full flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-[#1A2F24] mb-2">
              {lang === "en" ? "Auditory Absorption & Structural Reading" : "听觉吸收与结构化阅读双通道机制"}
            </h4>
            <p className="font-serif text-xs text-[#1C1C1C]/70 leading-relaxed">
              {lang === "en"
                ? "Every audio publication we produce is designed with a full textual counterpart. We encourage you to listen to audiobooks during mechanical walking, but parse the transcripts dynamically with a pen or Notion workspace afterwards. Dual-sensory synthesis dramatically improves cognitive encoding."
                : "我们交付的每一部有声出版物均配备高保真的中英对照排版。听觉适合在步行或通勤时进行初始信息框架搭建，而纸面文稿则适宜在书桌前用笔和记号进行逻辑拆解与复盘。视觉与听觉的双重压制，能够极大增进长时记忆的沉淀效果。"}
            </p>
          </div>
        </div>

        {/* 6. High-Signal CTA */}
        <div className="text-center py-12 border-t border-[#D8D2C6]/50 max-w-xl mx-auto" id="audio-cta">
          <h2 className="font-serif text-3xl font-normal text-[#1A2F24] mb-4 ink-text">
            {lang === "en" ? "Listen with Clarity" : "在纯净中倾听智识"}
          </h2>
          <p className="font-serif text-sm text-[#1C1C1C]/60 leading-relaxed mb-8">
            {lang === "en"
              ? "Reclaim passive attention periods. Build a routine of low-stimulation, high-signal knowledge intake today."
              : "接管您的被动碎片时间，远离充满各种尖锐刺耳警报与刺激性噱头的网络播客，回到寂静常态。"}
          </p>
          <button
            onClick={() => handleAction(() => {
              if (onNavigateToListeningRoom) {
                onNavigateToListeningRoom();
              } else {
                alert(lang === "en" ? "Opening the complete Streaming Portal with active audio streaming options..." : "正在为您开启完整的智枢阁全频有声书馆流式音频交互界面……");
              }
            })}
            className="bg-[#1A2F24] hover:bg-[#8B5A44] text-[#F4F1EB] font-display text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-brand shadow-sm cursor-pointer"
          >
            {lang === "en" ? "Enter the Listening Room" : "进入聆听室馆藏"}
          </button>
        </div>

      </div>
    </div>
  );
}
