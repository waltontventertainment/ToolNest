import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock, Play, Pause, RotateCcw, Volume2, VolumeX, Globe, Shuffle, Check, Copy,
  Plus, Trash2, Calculator, Monitor, Activity, FileText, Keyboard, Image as ImageIcon,
  Save, Download, Zap, Sliders, Maximize, Eye, RefreshCw, Hash, FileSpreadsheet,
  CheckCircle2, XCircle, Info, Sparkles, Award, ArrowRight, HelpCircle, Search
} from 'lucide-react';

// Helper for copying text to clipboard
const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Copy failed', err);
  }
};

// ============================================================================
// 1. Countdown Timer & Event Alarm
// ============================================================================
export const CountdownTimerAlarm: React.FC = () => {
  const [targetSeconds, setTargetSeconds] = useState<number>(300); // default 5 min
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(5);
  const [customSeconds, setCustomSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator using Web Audio API
  const playAlarmBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 3 high-pitched beeps
      [0, 0.2, 0.4].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay); // A5 note
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setTimerFinished(true);
      playAlarmBeep();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, soundEnabled]);

  const applyPreset = (minutes: number) => {
    const totalSec = minutes * 60;
    setIsRunning(false);
    setTargetSeconds(totalSec);
    setTimeLeft(totalSec);
    setTimerFinished(false);
    setCustomHours(Math.floor(minutes / 60));
    setCustomMinutes(minutes % 60);
    setCustomSeconds(0);
  };

  const setCustomTime = () => {
    const totalSec = (customHours * 3600) + (customMinutes * 60) + customSeconds;
    if (totalSec <= 0) return;
    setIsRunning(false);
    setTargetSeconds(totalSec);
    setTimeLeft(totalSec);
    setTimerFinished(false);
  };

  const toggleTimer = () => {
    if (timeLeft <= 0) return;
    setIsRunning(!isRunning);
    setTimerFinished(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(targetSeconds);
    setTimerFinished(false);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = targetSeconds > 0 ? Math.round(((targetSeconds - timeLeft) / targetSeconds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/40 p-4 rounded-xl border border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Timer Presets</h3>
          <p className="text-xs text-muted-foreground">Quick-start standard productivity intervals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset(25)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground hover:bg-secondary/60 transition shadow-xs"
          >
            🍅 Pomodoro (25m)
          </button>
          <button
            onClick={() => applyPreset(5)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground hover:bg-secondary/60 transition shadow-xs"
          >
            ☕ Short Break (5m)
          </button>
          <button
            onClick={() => applyPreset(15)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground hover:bg-secondary/60 transition shadow-xs"
          >
            🌴 Long Break (15m)
          </button>
          <button
            onClick={() => applyPreset(45)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground hover:bg-secondary/60 transition shadow-xs"
          >
            🎯 Deep Work (45m)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Main Clock Display */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-6 shadow-xs relative overflow-hidden">
          {timerFinished && (
            <div className="absolute top-0 inset-x-0 bg-rose-500 text-white text-xs font-bold py-1.5 text-center tracking-wide animate-pulse">
              🔔 TIMER EXPIRED! ALARM RINGING
            </div>
          )}

          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className={`transition-all duration-500 ${
                  timerFinished
                    ? 'text-rose-500'
                    : isRunning
                    ? 'text-indigo-600'
                    : 'text-indigo-400'
                }`}
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black font-mono tracking-tight text-foreground">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
                {isRunning ? 'Counting Down' : timerFinished ? 'Completed' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-md transition transform active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-3 rounded-xl font-semibold text-xs text-foreground bg-secondary/60 hover:bg-secondary flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl text-xs transition border ${
                soundEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-secondary/40 border-border text-muted-foreground'
              }`}
              title={soundEnabled ? 'Alarm Sound On' : 'Alarm Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Custom Duration Set Panel */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Custom Duration Setup
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="99"
                value={customHours}
                onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            onClick={setCustomTime}
            className="w-full py-2.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition"
          >
            Apply Custom Duration
          </button>

          <div className="p-3 bg-secondary/40 border border-border rounded-xl space-y-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground block flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-600" /> Audio Alarm Features
            </span>
            <p className="leading-relaxed">
              Synthesizes crisp 880Hz audio beeps using native Web Audio API. Works smoothly without relying on remote sound assets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. World Clock & Time Zone Scheduler
// ============================================================================

// Comprehensive Country, City, Flag & Alias metadata dictionary for world timezones
const COUNTRY_TZ_MAP: Record<string, { flag: string; country: string; aliases: string[] }> = {
  'Asia/Dhaka': { flag: '🇧🇩', country: 'Bangladesh', aliases: ['dhaka', 'bangladesh', 'bst', 'chittagong', 'sylhet', 'khulna', 'rajshahi'] },
  'Asia/Kolkata': { flag: '🇮🇳', country: 'India', aliases: ['delhi', 'mumbai', 'india', 'ist', 'kolkata', 'calcutta', 'bangalore', 'chennai', 'hyderabad', 'ahmedabad'] },
  'Asia/Karachi': { flag: '🇵🇰', country: 'Pakistan', aliases: ['karachi', 'lahore', 'pakistan', 'islamabad', 'pkt', 'rawalpindi'] },
  'Asia/Riyadh': { flag: '🇸🇦', country: 'Saudi Arabia', aliases: ['riyadh', 'jeddah', 'saudi', 'mecca', 'medina', 'ast', 'dammam'] },
  'Asia/Dubai': { flag: '🇦🇪', country: 'United Arab Emirates', aliases: ['dubai', 'abu dhabi', 'uae', 'emirates', 'gst', 'sharjah'] },
  'Asia/Tokyo': { flag: '🇯🇵', country: 'Japan', aliases: ['tokyo', 'japan', 'osaka', 'jst', 'kyoto', 'yokohama'] },
  'Asia/Singapore': { flag: '🇸🇬', country: 'Singapore', aliases: ['singapore', 'sgt'] },
  'Asia/Shanghai': { flag: '🇨🇳', country: 'China', aliases: ['beijing', 'shanghai', 'china', 'cst', 'guangzhou', 'shenzhen', 'chengdu'] },
  'Asia/Bangkok': { flag: '🇹🇭', country: 'Thailand', aliases: ['bangkok', 'thailand', 'ict', 'phuket', 'chiang mai'] },
  'Asia/Jakarta': { flag: '🇮🇩', country: 'Indonesia', aliases: ['jakarta', 'indonesia', 'wib', 'bali', 'surabaya'] },
  'Asia/Seoul': { flag: '🇰🇷', country: 'South Korea', aliases: ['seoul', 'korea', 'kst', 'busan', 'incheon'] },
  'Asia/Kuala_Lumpur': { flag: '🇲🇾', country: 'Malaysia', aliases: ['kuala lumpur', 'malaysia', 'myt', 'penang', 'johor bahru'] },
  'Asia/Kathmandu': { flag: '🇳🇵', country: 'Nepal', aliases: ['kathmandu', 'nepal', 'npt', 'pokhara'] },
  'Asia/Colombo': { flag: '🇱🇰', country: 'Sri Lanka', aliases: ['colombo', 'sri lanka', 'kandy'] },
  'Asia/Manila': { flag: '🇵🇭', country: 'Philippines', aliases: ['manila', 'philippines', 'pht', 'cebu', 'davao'] },
  'Asia/Ho_Chi_Minh': { flag: '🇻🇳', country: 'Vietnam', aliases: ['ho chi minh', 'hanoi', 'vietnam', 'saigon', 'da nang'] },
  'Asia/Tehran': { flag: '🇮🇷', country: 'Iran', aliases: ['tehran', 'iran', 'irst', 'isfahan', 'shiraz'] },
  'Asia/Baghdad': { flag: '🇮🇶', country: 'Iraq', aliases: ['baghdad', 'iraq', 'erbil', 'basra'] },
  'Asia/Kabul': { flag: '🇦🇫', country: 'Afghanistan', aliases: ['kabul', 'afghanistan', 'aft', 'herat'] },
  'Asia/Qatar': { flag: '🇶🇦', country: 'Qatar', aliases: ['doha', 'qatar'] },
  'Asia/Bahrain': { flag: '🇧🇭', country: 'Bahrain', aliases: ['manama', 'bahrain'] },
  'Asia/Kuwait': { flag: '🇰🇼', country: 'Kuwait', aliases: ['kuwait city', 'kuwait'] },
  'Asia/Muscat': { flag: '🇴🇲', country: 'Oman', aliases: ['muscat', 'oman'] },
  'Asia/Amman': { flag: '🇯🇴', country: 'Jordan', aliases: ['amman', 'jordan'] },
  'Asia/Beirut': { flag: '🇱🇧', country: 'Lebanon', aliases: ['beirut', 'lebanon'] },
  'Asia/Damascus': { flag: '🇸🇾', country: 'Syria', aliases: ['damascus', 'syria'] },
  'Asia/Jerusalem': { flag: '🇮🇱', country: 'Israel', aliases: ['jerusalem', 'tel aviv', 'israel'] },
  'Asia/Gaza': { flag: '🇵🇸', country: 'Palestine', aliases: ['gaza', 'palestine', 'ramallah'] },
  'Asia/Tashkent': { flag: '🇺🇿', country: 'Uzbekistan', aliases: ['tashkent', 'uzbekistan', 'samarkand'] },
  'Asia/Almaty': { flag: '🇰🇿', country: 'Kazakhstan', aliases: ['almaty', 'astana', 'kazakhstan', 'nur-sultan'] },
  'Asia/Bishkek': { flag: '🇰🇬', country: 'Kyrgyzstan', aliases: ['bishkek', 'kyrgyzstan'] },
  'Asia/Dushanbe': { flag: '🇹🇯', country: 'Tajikistan', aliases: ['dushanbe', 'tajikistan'] },
  'Asia/Ashgabat': { flag: '🇹🇲', country: 'Turkmenistan', aliases: ['ashgabat', 'turkmenistan'] },
  'Asia/Baku': { flag: '🇦🇿', country: 'Azerbaijan', aliases: ['baku', 'azerbaijan'] },
  'Asia/Yerevan': { flag: '🇦🇲', country: 'Armenia', aliases: ['yerevan', 'armenia'] },
  'Asia/Tbilisi': { flag: '🇬🇪', country: 'Georgia', aliases: ['tbilisi', 'georgia'] },
  'Asia/Ulaanbaatar': { flag: '🇲🇳', country: 'Mongolia', aliases: ['ulaanbaatar', 'mongolia'] },
  'Asia/Yangon': { flag: '🇲🇲', country: 'Myanmar', aliases: ['yangon', 'myanmar', 'burma', 'naypyidaw'] },
  'Asia/Phnom_Penh': { flag: '🇰🇭', country: 'Cambodia', aliases: ['phnom penh', 'cambodia'] },
  'Asia/Vientiane': { flag: '🇱🇦', country: 'Laos', aliases: ['vientiane', 'laos'] },
  'Asia/Brunei': { flag: '🇧🇳', country: 'Brunei', aliases: ['bandar seri begawan', 'brunei'] },
  'Asia/Hong_Kong': { flag: '🇭🇰', country: 'Hong Kong', aliases: ['hong kong', 'hk'] },
  'Asia/Taipei': { flag: '🇹🇼', country: 'Taiwan', aliases: ['taipei', 'taiwan'] },
  'Asia/Macau': { flag: '🇲🇴', country: 'Macau', aliases: ['macau'] },
  'Asia/Thimphu': { flag: '🇧🇹', country: 'Bhutan', aliases: ['thimphu', 'bhutan'] },
  'Europe/London': { flag: '🇬🇧', country: 'United Kingdom', aliases: ['london', 'uk', 'england', 'britain', 'gmt', 'bst', 'manchester', 'birmingham', 'edinburgh'] },
  'Europe/Paris': { flag: '🇫🇷', country: 'France', aliases: ['paris', 'france', 'cet', 'cest', 'lyon', 'marseille'] },
  'Europe/Berlin': { flag: '🇩🇪', country: 'Germany', aliases: ['berlin', 'germany', 'frankfurt', 'munich', 'hamburg', 'cologne'] },
  'Europe/Rome': { flag: '🇮🇹', country: 'Italy', aliases: ['rome', 'italy', 'milan', 'naples', 'turin'] },
  'Europe/Madrid': { flag: '🇪🇸', country: 'Spain', aliases: ['madrid', 'spain', 'barcelona', 'valencia', 'seville'] },
  'Europe/Moscow': { flag: '🇷🇺', country: 'Russia', aliases: ['moscow', 'russia', 'msk', 'saint petersburg'] },
  'Europe/Istanbul': { flag: '🇹🇷', country: 'Turkey', aliases: ['istanbul', 'ankara', 'turkey', 'izmir'] },
  'Europe/Amsterdam': { flag: '🇳🇱', country: 'Netherlands', aliases: ['amsterdam', 'netherlands', 'holland', 'rotterdam'] },
  'Europe/Brussels': { flag: '🇧🇪', country: 'Belgium', aliases: ['brussels', 'belgium', 'antwerp'] },
  'Europe/Vienna': { flag: '🇦🇹', country: 'Austria', aliases: ['vienna', 'austria', 'salzburg'] },
  'Europe/Zurich': { flag: '🇨🇭', country: 'Switzerland', aliases: ['zurich', 'switzerland', 'geneva', 'bern'] },
  'Europe/Athens': { flag: '🇬🇷', country: 'Greece', aliases: ['athens', 'greece', 'thessaloniki'] },
  'Europe/Dublin': { flag: '🇮🇪', country: 'Ireland', aliases: ['dublin', 'ireland', 'cork'] },
  'Europe/Stockholm': { flag: '🇸🇪', country: 'Sweden', aliases: ['stockholm', 'sweden', 'gothenburg'] },
  'Europe/Oslo': { flag: '🇳🇴', country: 'Norway', aliases: ['oslo', 'norway', 'bergen'] },
  'Europe/Copenhagen': { flag: '🇩🇰', country: 'Denmark', aliases: ['copenhagen', 'denmark'] },
  'Europe/Helsinki': { flag: '🇫🇮', country: 'Finland', aliases: ['helsinki', 'finland'] },
  'Europe/Warsaw': { flag: '🇵🇱', country: 'Poland', aliases: ['warsaw', 'poland', 'krakow'] },
  'Europe/Lisbon': { flag: '🇵🇹', country: 'Portugal', aliases: ['lisbon', 'portugal', 'porto'] },
  'Europe/Prague': { flag: '🇨🇿', country: 'Czech Republic', aliases: ['prague', 'czechia'] },
  'Europe/Budapest': { flag: '🇭🇺', country: 'Hungary', aliases: ['budapest', 'hungary'] },
  'Europe/Bucharest': { flag: '🇷🇴', country: 'Romania', aliases: ['bucharest', 'romania'] },
  'Europe/Sofia': { flag: '🇧🇬', country: 'Bulgaria', aliases: ['sofia', 'bulgaria'] },
  'Europe/Kiev': { flag: '🇺🇦', country: 'Ukraine', aliases: ['kiev', 'kyiv', 'ukraine'] },
  'Europe/Belgrade': { flag: '🇷🇸', country: 'Serbia', aliases: ['belgrade', 'serbia'] },
  'Europe/Zagreb': { flag: '🇭🇷', country: 'Croatia', aliases: ['zagreb', 'croatia'] },
  'Europe/Reykjavik': { flag: '🇮🇸', country: 'Iceland', aliases: ['reykjavik', 'iceland'] },
  'America/New_York': { flag: '🇺🇸', country: 'United States', aliases: ['new york', 'usa', 'us', 'est', 'edt', 'boston', 'miami', 'washington dc', 'atlanta'] },
  'America/Los_Angeles': { flag: '🇺🇸', country: 'United States', aliases: ['los angeles', 'usa', 'us', 'pst', 'pdt', 'san francisco', 'seattle', 'california', 'las vegas'] },
  'America/Chicago': { flag: '🇺🇸', country: 'United States', aliases: ['chicago', 'usa', 'us', 'cst', 'cdt', 'houston', 'dallas', 'austin'] },
  'America/Denver': { flag: '🇺🇸', country: 'United States', aliases: ['denver', 'usa', 'us', 'mst', 'mdt', 'colorado', 'salt lake city'] },
  'America/Phoenix': { flag: '🇺🇸', country: 'United States', aliases: ['phoenix', 'arizona', 'usa'] },
  'America/Anchorage': { flag: '🇺🇸', country: 'United States', aliases: ['anchorage', 'alaska', 'usa'] },
  'America/Toronto': { flag: '🇨🇦', country: 'Canada', aliases: ['toronto', 'canada', 'ottawa', 'montreal', 'quebec'] },
  'America/Vancouver': { flag: '🇨🇦', country: 'Canada', aliases: ['vancouver', 'canada', 'bc', 'victoria'] },
  'America/Edmonton': { flag: '🇨🇦', country: 'Canada', aliases: ['edmonton', 'calgary', 'canada'] },
  'America/Winnipeg': { flag: '🇨🇦', country: 'Canada', aliases: ['winnipeg', 'canada'] },
  'America/Halifax': { flag: '🇨🇦', country: 'Canada', aliases: ['halifax', 'canada', 'nova scotia'] },
  'America/Mexico_City': { flag: '🇲🇽', country: 'Mexico', aliases: ['mexico city', 'mexico', 'guadalajara', 'monterrey'] },
  'America/Sao_Paulo': { flag: '🇧🇷', country: 'Brazil', aliases: ['sao paulo', 'brazil', 'rio de janeiro', 'brasilia', 'salvador'] },
  'America/Buenos_Aires': { flag: '🇦🇷', country: 'Argentina', aliases: ['buenos aires', 'argentina', 'cordoba'] },
  'America/Bogota': { flag: '🇨🇴', country: 'Colombia', aliases: ['bogota', 'colombia', 'medellin'] },
  'America/Santiago': { flag: '🇨🇱', country: 'Chile', aliases: ['santiago', 'chile'] },
  'America/Lima': { flag: '🇵🇪', country: 'Peru', aliases: ['lima', 'peru'] },
  'America/Caracas': { flag: '🇻🇪', country: 'Venezuela', aliases: ['caracas', 'venezuela'] },
  'America/Guayaquil': { flag: '🇪🇨', country: 'Ecuador', aliases: ['guayaquil', 'quito', 'ecuador'] },
  'America/Montevideo': { flag: '🇺🇾', country: 'Uruguay', aliases: ['montevideo', 'uruguay'] },
  'America/Asuncion': { flag: '🇵🇾', country: 'Paraguay', aliases: ['asuncion', 'paraguay'] },
  'America/La_Paz': { flag: '🇧🇴', country: 'Bolivia', aliases: ['la paz', 'bolivia'] },
  'America/Havana': { flag: '🇨🇺', country: 'Cuba', aliases: ['havana', 'cuba'] },
  'America/Panama': { flag: '🇵🇦', country: 'Panama', aliases: ['panama city', 'panama'] },
  'America/Costa_Rica': { flag: '🇨🇷', country: 'Costa Rica', aliases: ['san jose', 'costa rica'] },
  'America/Guatemala': { flag: '🇬🇹', country: 'Guatemala', aliases: ['guatemala city', 'guatemala'] },
  'America/Jamaica': { flag: '🇯🇲', country: 'Jamaica', aliases: ['kingston', 'jamaica'] },
  'America/Santo_Domingo': { flag: '🇩🇴', country: 'Dominican Republic', aliases: ['santo domingo', 'dominican republic'] },
  'America/Puerto_Rico': { flag: '🇵🇷', country: 'Puerto Rico', aliases: ['san juan', 'puerto rico'] },
  'Africa/Cairo': { flag: '🇪🇬', country: 'Egypt', aliases: ['cairo', 'egypt', 'alexandria'] },
  'Africa/Lagos': { flag: '🇳🇬', country: 'Nigeria', aliases: ['lagos', 'abuja', 'nigeria', 'kano', 'ibadan'] },
  'Africa/Johannesburg': { flag: '🇿🇦', country: 'South Africa', aliases: ['johannesburg', 'cape town', 'pretoria', 'south africa', 'durban'] },
  'Africa/Nairobi': { flag: '🇰🇪', country: 'Kenya', aliases: ['nairobi', 'kenya', 'mombasa'] },
  'Africa/Casablanca': { flag: '🇲🇦', country: 'Morocco', aliases: ['casablanca', 'rabat', 'morocco', 'marrakesh'] },
  'Africa/Accra': { flag: '🇬🇭', country: 'Ghana', aliases: ['accra', 'ghana'] },
  'Africa/Addis_Ababa': { flag: '🇪🇹', country: 'Ethiopia', aliases: ['addis ababa', 'ethiopia'] },
  'Africa/Algiers': { flag: '🇩🇿', country: 'Algeria', aliases: ['algiers', 'algeria'] },
  'Africa/Tunis': { flag: '🇹🇳', country: 'Tunisia', aliases: ['tunis', 'tunisia'] },
  'Africa/Tripoli': { flag: '🇱🇾', country: 'Libya', aliases: ['tripoli', 'libya'] },
  'Africa/Khartoum': { flag: '🇸🇩', country: 'Sudan', aliases: ['khartoum', 'sudan'] },
  'Africa/Dar_es_Salaam': { flag: '🇹🇿', country: 'Tanzania', aliases: ['dar es salaam', 'dodoma', 'tanzania'] },
  'Africa/Kampala': { flag: '🇺🇬', country: 'Uganda', aliases: ['kampala', 'uganda'] },
  'Africa/Harare': { flag: '🇿🇼', country: 'Zimbabwe', aliases: ['harare', 'zimbabwe'] },
  'Africa/Luanda': { flag: '🇦🇴', country: 'Angola', aliases: ['luanda', 'angola'] },
  'Africa/Abidjan': { flag: '🇨🇮', country: 'Ivory Coast', aliases: ['abidjan', 'ivory coast', 'cote d\'ivoire'] },
  'Africa/Dakar': { flag: '🇸🇳', country: 'Senegal', aliases: ['dakar', 'senegal'] },
  'Australia/Sydney': { flag: '🇦🇺', country: 'Australia', aliases: ['sydney', 'australia', 'nsw', 'aest'] },
  'Australia/Melbourne': { flag: '🇦🇺', country: 'Australia', aliases: ['melbourne', 'australia', 'victoria'] },
  'Australia/Brisbane': { flag: '🇦🇺', country: 'Australia', aliases: ['brisbane', 'queensland'] },
  'Australia/Perth': { flag: '🇦🇺', country: 'Australia', aliases: ['perth', 'australia', 'awst'] },
  'Australia/Adelaide': { flag: '🇦🇺', country: 'Australia', aliases: ['adelaide', 'australia'] },
  'Australia/Darwin': { flag: '🇦🇺', country: 'Australia', aliases: ['darwin', 'australia'] },
  'Pacific/Auckland': { flag: '🇳🇿', country: 'New Zealand', aliases: ['auckland', 'wellington', 'new zealand', 'nzst', 'christchurch'] },
  'Pacific/Honolulu': { flag: '🇺🇸', country: 'United States', aliases: ['honolulu', 'hawaii', 'usa', 'hst'] },
  'Pacific/Fiji': { flag: '🇫🇯', country: 'Fiji', aliases: ['suva', 'fiji'] },
  'Pacific/Guam': { flag: '🇬🇺', country: 'Guam', aliases: ['guam'] },
  'Pacific/Tahiti': { flag: '🇵🇫', country: 'French Polynesia', aliases: ['tahiti', 'papeete'] },
  'Pacific/Port_Moresby': { flag: '🇵🇬', country: 'Papua New Guinea', aliases: ['port moresby', 'papua new guinea'] },
};

interface ProcessedTzItem {
  tz: string;
  cityName: string;
  countryName: string;
  flag: string;
  region: string;
  searchStr: string;
}

// Transform raw IANA string into searchable, rich location item
const processTzString = (tz: string): ProcessedTzItem => {
  const customInfo = COUNTRY_TZ_MAP[tz];
  const parts = tz.split('/');
  const region = parts[0] || 'Global';
  const rawCity = parts[parts.length - 1] || tz;
  const formattedCity = rawCity.replace(/_/g, ' ');

  let flag = '🌐';
  if (customInfo?.flag) {
    flag = customInfo.flag;
  } else {
    if (region === 'Africa') flag = '🌍';
    else if (region === 'America') flag = '🌎';
    else if (region === 'Asia') flag = '🌏';
    else if (region === 'Europe') flag = '🇪🇺';
    else if (region === 'Australia') flag = '🇦🇺';
    else if (region === 'Pacific') flag = '🏝️';
    else if (region === 'Atlantic') flag = '🌊';
    else if (region === 'Indian') flag = '🌊';
  }

  const countryName = customInfo?.country || region;
  const aliases = customInfo?.aliases ? customInfo.aliases.join(' ') : '';
  const searchStr = `${formattedCity} ${countryName} ${tz} ${region} ${aliases}`.toLowerCase();

  return {
    tz,
    cityName: customInfo ? `${formattedCity}, ${customInfo.country}` : `${formattedCity} (${region})`,
    countryName,
    flag,
    region,
    searchStr,
  };
};

// Calculate GMT offset, daytime status, and relative difference
const getTzOffsetInfo = (tz: string, now: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    const offsetStr = tzPart ? tzPart.value : 'UTC';

    // Calculate diff relative to local Date
    const targetDateStr = now.toLocaleString('en-US', { timeZone: tz });
    const localDateStr = now.toLocaleString('en-US');
    const targetTime = new Date(targetDateStr).getTime();
    const localTime = new Date(localDateStr).getTime();
    const diffMs = targetTime - localTime;
    const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    let diffText = 'Local time';
    if (diffHours > 0) {
      diffText = `+${diffHours}h ahead`;
    } else if (diffHours < 0) {
      diffText = `${diffHours}h behind`;
    }

    // Determine Day or Night
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).format(now);
    const hourNum = parseInt(hourStr, 10);
    const isDaytime = hourNum >= 6 && hourNum < 18;

    return { offsetStr, diffText, isDaytime };
  } catch (e) {
    return { offsetStr: 'UTC', diffText: '', isDaytime: true };
  }
};

export const WorldClockScheduler: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('All');
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Default active clock cards
  const [activeCities, setActiveCities] = useState<ProcessedTzItem[]>([
    processTzString('Asia/Dhaka'),
    processTzString('Asia/Tokyo'),
    processTzString('Europe/London'),
    processTzString('America/New_York'),
    processTzString('Asia/Dubai'),
    processTzString('Australia/Sydney'),
  ]);

  // Generate complete list of ALL ~430+ supported IANA timezones in the world
  const masterTzList = useMemo(() => {
    let rawList: string[] = [];
    try {
      if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
        rawList = (Intl as any).supportedValuesOf('timeZone');
      }
    } catch (e) {
      console.warn('supportedValuesOf unavailable', e);
    }

    const knownKeys = Object.keys(COUNTRY_TZ_MAP);
    const set = new Set([...knownKeys, ...rawList]);
    return Array.from(set)
      .map(processTzString)
      .sort((a, b) => a.cityName.localeCompare(b.cityName));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter master list based on search term & region filter
  const filteredTzList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return masterTzList.filter((item) => {
      const matchesSearch = !query || item.searchStr.includes(query);
      const matchesRegion =
        selectedRegionFilter === 'All' ||
        item.region.toLowerCase() === selectedRegionFilter.toLowerCase();
      return matchesSearch && matchesRegion;
    });
  }, [masterTzList, searchQuery, selectedRegionFilter]);

  const addCityToActive = (item: ProcessedTzItem) => {
    if (!activeCities.some((c) => c.tz === item.tz)) {
      setActiveCities([...activeCities, item]);
    }
    setIsModalOpen(false);
  };

  const removeCity = (tz: string) => {
    setActiveCities(activeCities.filter((c) => c.tz !== tz));
  };

  const addLocalTimezoneCard = () => {
    try {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (localTz) {
        const item = processTzString(localTz);
        addCityToActive(item);
      }
    } catch (e) {
      console.error('Failed to get local timezone', e);
    }
  };

  const addPresetHubs = (presetKey: string) => {
    let tzsToAdd: string[] = [];
    if (presetKey === 'asia') {
      tzsToAdd = ['Asia/Dhaka', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Bangkok'];
    } else if (presetKey === 'europe') {
      tzsToAdd = ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid', 'Europe/Moscow'];
    } else if (presetKey === 'americas') {
      tzsToAdd = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Toronto', 'America/Sao_Paulo', 'America/Mexico_City'];
    } else if (presetKey === 'middleeast') {
      tzsToAdd = ['Asia/Riyadh', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Tehran', 'Africa/Cairo', 'Asia/Istanbul'];
    }

    const newItems = tzsToAdd.map(processTzString);
    const combined = [...activeCities];
    newItems.forEach((item) => {
      if (!combined.some((c) => c.tz === item.tz)) {
        combined.push(item);
      }
    });
    setActiveCities(combined);
  };

  const getTimeInZone = (date: Date, tz: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: !use24Hour,
      }).format(date);
    } catch {
      return '--:--:--';
    }
  };

  const getDateInZone = (date: Date, tz: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">World Clock & Timezone Hub</h3>
              <p className="text-xs text-muted-foreground">
                Live time tracking across all 195+ countries & 430+ global timezones
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setUse24Hour(!use24Hour)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                use24Hour
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-border text-foreground hover:bg-secondary/40'
              }`}
            >
              {use24Hour ? '24-Hour Format' : '12-Hour Format'}
            </button>
            <button
              onClick={() => setShowSeconds(!showSeconds)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                showSeconds
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-border text-foreground hover:bg-secondary/40'
              }`}
            >
              {showSeconds ? 'Seconds On' : 'Seconds Off'}
            </button>
            <button
              onClick={addLocalTimezoneCard}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1"
            >
              📍 My Location
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Country / City
            </button>
          </div>
        </div>

        {/* Preset Hub Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-muted-foreground mr-1">Quick Add Hubs:</span>
          <button
            onClick={() => addPresetHubs('asia')}
            className="px-2.5 py-1 bg-secondary/60 hover:bg-indigo-50 hover:text-indigo-600 text-foreground rounded-md font-medium transition"
          >
            ⛩️ Asian Capitals
          </button>
          <button
            onClick={() => addPresetHubs('europe')}
            className="px-2.5 py-1 bg-secondary/60 hover:bg-indigo-50 hover:text-indigo-600 text-foreground rounded-md font-medium transition"
          >
            🏛️ European Hubs
          </button>
          <button
            onClick={() => addPresetHubs('americas')}
            className="px-2.5 py-1 bg-secondary/60 hover:bg-indigo-50 hover:text-indigo-600 text-foreground rounded-md font-medium transition"
          >
            🗽 Americas
          </button>
          <button
            onClick={() => addPresetHubs('middleeast')}
            className="px-2.5 py-1 bg-secondary/60 hover:bg-indigo-50 hover:text-indigo-600 text-foreground rounded-md font-medium transition"
          >
            🕌 Middle East
          </button>
          {activeCities.length > 0 && (
            <button
              onClick={() => setActiveCities([])}
              className="px-2.5 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md font-medium ml-auto transition"
            >
              Clear All Cards
            </button>
          )}
        </div>
      </div>

      {/* Grid of Active City Clocks */}
      {activeCities.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <Globe className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-foreground text-sm">No City Clocks Displayed</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click "Add Country / City" to search and add any world city or country clock card.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-indigo-700 transition"
          >
            + Search World Cities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCities.map((city) => {
            const timeStr = getTimeInZone(now, city.tz);
            const dateStr = getDateInZone(now, city.tz);
            const { offsetStr, diffText, isDaytime } = getTzOffsetInfo(city.tz, now);

            return (
              <div
                key={city.tz}
                className="bg-card border border-border rounded-2xl p-5 relative space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-sm transition group"
              >
                {/* Header: Flag, City/Country & Remove */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0" role="img" aria-label="flag">
                      {city.flag}
                    </span>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-foreground truncate" title={city.cityName}>
                        {city.cityName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                        <span className="bg-secondary/60 px-1.5 py-0.5 rounded font-semibold text-muted-foreground">
                          {offsetStr}
                        </span>
                        <span>{diffText}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeCity(city.tz)}
                    className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 opacity-80 group-hover:opacity-100"
                    title="Remove card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Clock Display & Day/Night Indicator */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <div className="text-3xl font-black font-mono tracking-tight text-slate-950">
                      {timeStr}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1.5">
                      📅 {dateStr}
                    </div>
                  </div>

                  {/* Day / Night Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                      isDaytime
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-900 text-indigo-300 border border-slate-800'
                    }`}
                  >
                    {isDaytime ? '☀️ DAY' : '🌙 NIGHT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* World Timezone Search Modal / Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-secondary/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-foreground text-sm">Select World Country or City</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Input & Region Filter */}
            <div className="p-4 border-b border-border space-y-3 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type any country name (e.g. Bangladesh, USA, Germany, Japan, Saudi Arabia, India) or city (e.g. Dhaka, London, Paris, Tokyo)..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              {/* Region Tabs */}
              <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                {['All', 'Asia', 'Europe', 'America', 'Africa', 'Australia', 'Pacific'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegionFilter(reg)}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedRegionFilter === reg
                        ? 'bg-indigo-600 text-white'
                        : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {reg === 'America' ? 'Americas' : reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Timezone Results List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-border">
              <div className="text-[11px] font-semibold text-muted-foreground mb-2">
                Showing {filteredTzList.length} global location results
              </div>

              {filteredTzList.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No matching country or city found. Try searching by country name or city name.
                </div>
              ) : (
                filteredTzList.slice(0, 100).map((item) => {
                  const isAdded = activeCities.some((c) => c.tz === item.tz);
                  const { offsetStr, diffText } = getTzOffsetInfo(item.tz, now);

                  return (
                    <div
                      key={item.tz}
                      onClick={() => !isAdded && addCityToActive(item)}
                      className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        isAdded
                          ? 'bg-secondary/40 opacity-60 cursor-not-allowed'
                          : 'hover:bg-indigo-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-foreground">{item.cityName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.tz} • {offsetStr} ({diffText})
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isAdded}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                          isAdded
                            ? 'bg-slate-200 text-muted-foreground'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                        }`}
                      >
                        {isAdded ? 'Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-secondary/40 border-t border-border text-center text-xs text-muted-foreground">
              Free lifetime global time search powered by native browser IANA specifications.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. Random Choice Picker & List Spinner
// ============================================================================
export const RandomChoicePicker: React.FC = () => {
  const [itemsText, setItemsText] = useState("Pizza\nBurger\nSushi\nTacos\nSalad\nPasta");
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  const itemList = useMemo(() => {
    return itemsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);
  }, [itemsText]);

  const pickRandom = () => {
    if (itemList.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    let count = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * itemList.length);
      setWinner(itemList[randomIndex]);
      count++;
      if (count >= maxSpins) {
        clearInterval(interval);
        const finalWinner = itemList[Math.floor(Math.random() * itemList.length)];
        setWinner(finalWinner);
        setIsSpinning(false);
        setHistory((prev) => [finalWinner, ...prev.slice(0, 9)]);
      }
    }, 80);
  };

  const shuffleItems = () => {
    const arr = [...itemList];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setItemsText(arr.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Options Input */}
        <div className="lg:col-span-6 space-y-4 bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Enter Choices (One per line)
            </h4>
            <span className="text-xs text-muted-foreground font-mono">{itemList.length} choices</span>
          </div>

          <textarea
            rows={8}
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            placeholder="Item 1&#10;Item 2&#10;Item 3"
            className="w-full p-3 text-xs border border-border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />

          <div className="flex gap-2">
            <button
              onClick={pickRandom}
              disabled={isSpinning || itemList.length === 0}
              className="flex-1 py-3 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Picking Random Winner...' : 'Pick Random Choice'}
            </button>
            <button
              onClick={shuffleItems}
              className="px-3 py-3 text-xs font-semibold bg-secondary/60 text-foreground hover:bg-secondary rounded-xl transition"
              title="Shuffle order"
            >
              🔀 Shuffle
            </button>
          </div>
        </div>

        {/* Right: Winner Display & History */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md">
            {winner ? (
              <div className="space-y-2 animate-bounce">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  🎉 Selected Winner
                </span>
                <div className="text-3xl font-black text-white">{winner}</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-indigo-400 opacity-60" />
                <span>Click "Pick Random Choice" to select a winner</span>
              </div>
            )}
          </div>

          {/* Previous History */}
          {history.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-2 shadow-xs">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Recent Picks History
              </h5>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100"
                  >
                    #{i + 1} {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. Unit Price & Cost Comparator
// ============================================================================
export const UnitPriceComparator: React.FC = () => {
  const [itemA, setItemA] = useState({ name: 'Option A', price: 4.99, quantity: 500, unit: 'g' });
  const [itemB, setItemB] = useState({ name: 'Option B', price: 7.49, quantity: 800, unit: 'g' });

  const unitPriceA = itemA.quantity > 0 ? itemA.price / itemA.quantity : 0;
  const unitPriceB = itemB.quantity > 0 ? itemB.price / itemB.quantity : 0;

  const winner = useMemo(() => {
    if (unitPriceA === 0 || unitPriceB === 0) return null;
    if (unitPriceA < unitPriceB) return 'A';
    if (unitPriceB < unitPriceA) return 'B';
    return 'equal';
  }, [unitPriceA, unitPriceB]);

  const percentDiff = useMemo(() => {
    if (unitPriceA === 0 || unitPriceB === 0 || winner === 'equal' || !winner) return 0;
    const higher = Math.max(unitPriceA, unitPriceB);
    const lower = Math.min(unitPriceA, unitPriceB);
    return Math.round(((higher - lower) / higher) * 100);
  }, [unitPriceA, unitPriceB, winner]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item A */}
        <div
          className={`bg-white border rounded-2xl p-5 space-y-4 shadow-xs transition ${
            winner === 'A' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              🛒 Product Option A
            </h4>
            {winner === 'A' && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                BEST VALUE
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Product Name</label>
            <input
              type="text"
              value={itemA.name}
              onChange={(e) => setItemA({ ...itemA, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={itemA.price}
                onChange={(e) => setItemA({ ...itemA, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Quantity / Size</label>
              <input
                type="number"
                value={itemA.quantity}
                onChange={(e) => setItemA({ ...itemA, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-secondary/40 rounded-xl">
            <span className="text-xs text-muted-foreground block">Calculated Unit Price:</span>
            <span className="text-xl font-bold font-mono text-foreground">
              ${unitPriceA.toFixed(4)} <span className="text-xs font-normal text-muted-foreground">/ unit</span>
            </span>
          </div>
        </div>

        {/* Item B */}
        <div
          className={`bg-white border rounded-2xl p-5 space-y-4 shadow-xs transition ${
            winner === 'B' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              🛒 Product Option B
            </h4>
            {winner === 'B' && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                BEST VALUE
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Product Name</label>
            <input
              type="text"
              value={itemB.name}
              onChange={(e) => setItemB({ ...itemB, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={itemB.price}
                onChange={(e) => setItemB({ ...itemB, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Quantity / Size</label>
              <input
                type="number"
                value={itemB.quantity}
                onChange={(e) => setItemB({ ...itemB, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-secondary/40 rounded-xl">
            <span className="text-xs text-muted-foreground block">Calculated Unit Price:</span>
            <span className="text-xl font-bold font-mono text-foreground">
              ${unitPriceB.toFixed(4)} <span className="text-xs font-normal text-muted-foreground">/ unit</span>
            </span>
          </div>
        </div>
      </div>

      {/* Outcome Verdict */}
      {winner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">
              {winner === 'equal'
                ? 'Both options offer identical unit pricing values!'
                : `${winner === 'A' ? itemA.name : itemB.name} is ${percentDiff}% cheaper per unit!`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. Screen & Display Diagnostic Tester
// ============================================================================
export const ScreenWebcamTester: React.FC = () => {
  const [fullscreenColor, setFullscreenColor] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const triggerColorTest = (color: string) => {
    setFullscreenColor(color);
  };

  return (
    <div className="space-y-6">
      {/* Diagnostics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
          <span className="text-xs text-muted-foreground block">Screen Resolution</span>
          <span className="text-xl font-bold font-mono text-foreground">
            {window.screen.width} × {window.screen.height}
          </span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
          <span className="text-xs text-muted-foreground block">Device Pixel Ratio</span>
          <span className="text-xl font-bold font-mono text-foreground">
            {window.devicePixelRatio}x
          </span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
          <span className="text-xs text-muted-foreground block">Color Depth</span>
          <span className="text-xl font-bold font-mono text-foreground">
            {window.screen.colorDepth}-bit
          </span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl space-y-1 shadow-xs">
          <span className="text-xs text-muted-foreground block">Measured FPS</span>
          <span className="text-xl font-bold font-mono text-indigo-600">{fps} FPS</span>
        </div>
      </div>

      {/* Dead Pixel Color Checkers */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Monitor className="w-4 h-4 text-indigo-600" /> Dead Pixel Inspection Colors
        </h4>
        <p className="text-xs text-muted-foreground">
          Click a color to test your display for dead or stuck pixels in full screen mode. Press ESC or click anywhere to exit.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          {[
            { name: 'Red', bg: '#ff0000' },
            { name: 'Green', bg: '#00ff00' },
            { name: 'Blue', bg: '#0000ff' },
            { name: 'White', bg: '#ffffff' },
            { name: 'Black', bg: '#000000' },
            { name: 'Yellow', bg: '#ffff00' },
            { name: 'Cyan', bg: '#00ffff' },
          ].map((c) => (
            <button
              key={c.name}
              onClick={() => triggerColorTest(c.bg)}
              style={{ backgroundColor: c.bg }}
              className="px-4 py-3 rounded-lg text-xs font-bold border border-border shadow-xs hover:scale-105 transition"
            >
              <span className={c.bg === '#ffffff' || c.bg === '#ffff00' || c.bg === '#00ffff' ? 'text-foreground' : 'text-white'}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {fullscreenColor && (
        <div
          onClick={() => setFullscreenColor(null)}
          style={{ backgroundColor: fullscreenColor }}
          className="fixed inset-0 z-50 cursor-pointer flex items-center justify-center text-xs opacity-90 hover:opacity-100"
        >
          <span className="px-3 py-1 bg-black/50 text-white rounded-full">Click anywhere to exit</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. Audio Frequency & Tone Generator
// ============================================================================
export const AudioToneGenerator: React.FC = () => {
  const [freq, setFreq] = useState<number>(440); // A4 tuning standard
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const toggleAudio = () => {
    if (isPlaying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying && oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    }
  }, [freq, isPlaying]);

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" /> Web Audio Tone Synthesizer
          </h4>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {freq} Hz
          </span>
        </div>

        {/* Waveform Selector */}
        <div className="grid grid-cols-4 gap-2">
          {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map((w) => (
            <button
              key={w}
              onClick={() => setWaveform(w)}
              className={`py-2 text-xs font-semibold capitalize rounded-lg transition ${
                waveform === w
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-secondary/60 text-foreground hover:bg-secondary'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Frequency Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>20 Hz</span>
            <span>{freq} Hz</span>
            <span>5,000 Hz</span>
          </div>
          <input
            type="range"
            min="20"
            max="5000"
            value={freq}
            onChange={(e) => setFreq(parseInt(e.target.value) || 440)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Quick Tone Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { name: '440Hz (A4)', value: 440 },
            { name: '528Hz (Solfeggio)', value: 528 },
            { name: '432Hz (Tuning)', value: 432 },
            { name: '1000Hz (Test Tone)', value: 1000 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => setFreq(preset.value)}
              className="px-2.5 py-1 text-xs font-medium bg-secondary/60 hover:bg-secondary text-foreground rounded-lg"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Play/Stop Button */}
        <button
          onClick={toggleAudio}
          className={`w-full py-3.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md transition ${
            isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          {isPlaying ? 'Stop Tone' : 'Play Synthesized Tone'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 7. File Hash Checksum Calculator
// ============================================================================
export const FileHashCalculator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{ sha1: string; sha256: string; sha512: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true);

    try {
      const buffer = await selected.arrayBuffer();

      const [sha1Buf, sha256Buf, sha512Buf] = await Promise.all([
        crypto.subtle.digest('SHA-1', buffer),
        crypto.subtle.digest('SHA-256', buffer),
        crypto.subtle.digest('SHA-512', buffer),
      ]);

      const toHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      setHashes({
        sha1: toHex(sha1Buf),
        sha256: toHex(sha256Buf),
        sha512: toHex(sha512Buf),
      });
    } catch (err) {
      console.error('Hash failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-xs">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Hash className="w-4 h-4 text-indigo-600" /> Select File for Hash Checksum
        </h4>

        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
        />

        {file && (
          <div className="text-xs text-muted-foreground font-mono bg-secondary/40 p-3 rounded-lg flex flex-wrap justify-between gap-2">
            <span>📄 File: {file.name}</span>
            <span>💾 Size: {(file.size / 1024).toFixed(2)} KB</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-6 text-xs text-indigo-600 font-semibold animate-pulse">
          Calculating cryptographic hashes...
        </div>
      )}

      {hashes && (
        <div className="space-y-3">
          {[
            { label: 'SHA-256 Checksum', val: hashes.sha256 },
            { label: 'SHA-1 Checksum', val: hashes.sha1 },
            { label: 'SHA-512 Checksum', val: hashes.sha512 },
          ].map((h) => (
            <div key={h.label} className="bg-card border border-border p-4 rounded-xl space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">{h.label}</span>
                <button
                  onClick={() => {
                    copyToClipboard(h.val, () => {});
                    setCopied(h.label);
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-1"
                >
                  {copied === h.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === h.label ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-xs font-mono break-all">
                {h.val}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 8. Keyboard Key Code & Press Tester
// ============================================================================
export const KeyboardKeyTester: React.FC = () => {
  const [lastEvent, setLastEvent] = useState<{
    key: string;
    code: string;
    keyCode: number;
    location: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setLastEvent({
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        location: e.location,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 shadow-xs">
        <Keyboard className="w-10 h-10 text-indigo-600 mx-auto" />
        <h4 className="font-bold text-foreground text-base">Press Any Key on Your Keyboard</h4>
        <p className="text-xs text-muted-foreground">
          Captures keyboard events in real-time and displays event properties.
        </p>

        {lastEvent ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-left">
            <div className="bg-secondary/40 p-3 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground font-semibold block">event.key</span>
              <span className="text-lg font-bold font-mono text-indigo-600">{lastEvent.key}</span>
            </div>
            <div className="bg-secondary/40 p-3 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground font-semibold block">event.code</span>
              <span className="text-lg font-bold font-mono text-foreground">{lastEvent.code}</span>
            </div>
            <div className="bg-secondary/40 p-3 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground font-semibold block">event.keyCode</span>
              <span className="text-lg font-bold font-mono text-foreground">{lastEvent.keyCode}</span>
            </div>
            <div className="bg-secondary/40 p-3 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground font-semibold block">Modifiers</span>
              <span className="text-xs font-semibold text-foreground">
                {lastEvent.shiftKey ? 'Shift ' : ''}
                {lastEvent.ctrlKey ? 'Ctrl ' : ''}
                {lastEvent.altKey ? 'Alt' : ''}
                {!lastEvent.shiftKey && !lastEvent.ctrlKey && !lastEvent.altKey ? 'None' : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-secondary/40 rounded-xl text-muted-foreground text-xs">
            Waiting for keyboard event input...
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 9. Base64 Image Converter
// ============================================================================
export const ImageToBase64Converter: React.FC = () => {
  const [dataUri, setDataUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-600" /> Upload Image File
        </h4>

        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
        />
      </div>

      {dataUri && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center shadow-xs">
            <img src={dataUri} alt="Preview" className="max-h-48 object-contain rounded-lg border border-border" />
            <span className="text-xs text-muted-foreground mt-2 font-mono">
              {fileName} ({(fileSize / 1024).toFixed(1)} KB)
            </span>
          </div>

          <div className="lg:col-span-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">Base64 Data URI Code</span>
              <button
                onClick={() => copyToClipboard(dataUri, setCopied)}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Data URI'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
              {dataUri}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 10. Quick Scratchpad & Notes
// ============================================================================
export const QuickScratchpadNotes: React.FC = () => {
  const [noteText, setNoteText] = useState<string>(() => {
    return localStorage.getItem('webtools_scratchpad') || 'Welcome to Scratchpad! Type your notes here...';
  });
  const [saved, setSaved] = useState<boolean>(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteText(val);
    localStorage.setItem('webtools_scratchpad', val);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const wordCount = noteText.trim() ? noteText.trim().split(/\s+/).length : 0;
  const charCount = noteText.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <Save className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Browser Auto-Saving Scratchpad
          </h4>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-muted-foreground">{wordCount} words | {charCount} chars</span>
          {saved && <span className="text-emerald-600 font-semibold text-[11px]">Saved to LocalStorage</span>}
        </div>
      </div>

      <textarea
        rows={12}
        value={noteText}
        onChange={handleTextChange}
        placeholder="Start typing your quick notes..."
        className="w-full p-4 text-sm border border-border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white shadow-xs"
      />
    </div>
  );
};
