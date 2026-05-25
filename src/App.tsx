/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Play,
  Wand2,
  Edit,
  Save,
  Trash2,
  Shield,
  Coins,
  Flame,
  Sword,
  Download,
  Upload,
  Dices,
  History,
  Heart,
  Compass,
  Trophy,
  ArrowLeft,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Eye,
  Info,
  Globe
} from 'lucide-react';
import { GameStory, GameMetadata, StoryNode, StoryChoice, PlayerStats, PlayerSession, PlayerStatName } from './types';
import { presetStories } from './presetStories';
import { CharacterAvatar } from './components/CharacterAvatar';
import { AnimatedDice } from './components/AnimatedDice';

// Standard background gradients based on scene name
const bgPathGradients: Record<string, string> = {
  academy: 'from-slate-900 via-indigo-950 to-zinc-950',
  forest: 'from-zinc-900 via-emerald-950 to-stone-950',
  cave: 'from-neutral-900 via-slate-950 to-indigo-950',
  dungeon: 'from-neutral-950 via-rose-950 to-slate-950',
  town: 'from-slate-900 via-amber-950/80 to-zinc-950',
};

// Standard glowing boundaries matching tone colors
const toneBorderShadows: Record<string, string> = {
  cyan: 'shadow-[0_0_20px_rgba(34,211,238,0.4)] border-cyan-500/50',
  rose: 'shadow-[0_0_20px_rgba(244,63,94,0.4)] border-rose-500/50',
  amber: 'shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-500/50',
  purple: 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500/50',
  emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.4)] border-emerald-500/50',
  sky: 'shadow-[0_0_20px_rgba(14,165,233,0.4)] border-sky-400/50',
};

// Pre-defined backdrop list for authors/editors
const SCENE_BACKDROPS = [
  { id: 'academy', name: '🏫 皇家神殿/魔导学院' },
  { id: 'forest', name: '🌲 微光森林/落叶旧道' },
  { id: 'cave', name: '🕳️ 古老洞穴/地底晶矿' },
  { id: 'dungeon', name: '🏰 深渊地牢/魔王大厅' },
  { id: 'town', name: '🧭 繁华城镇/酒馆后巷' },
];

const SPLASH_IMAGE = "/src/assets/images/anime_adventure_cover_1779696584272.png";

export default function App() {
  // Game database context (preset + local saved custom games)
  const [games, setGames] = useState<GameStory[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameStory | null>(null);

  // Active game player session state
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [typedText, setTypedText] = useState('');
  const [activeCombatLogs, setActiveCombatLogs] = useState<string[]>([]);
  
  // Custom Dice Roll State
  const [activeRoll, setActiveRoll] = useState<{
    choice: StoryChoice;
    stat: PlayerStatName;
    difficulty: number;
  } | null>(null);

  // Tab State: 'games' | 'editor'
  const [activeTab, setActiveTab] = useState<'games' | 'editor'>('games');

  // AI Story prompt input
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Editor specific states
  const [editingGameId, setEditingGameId] = useState<string>('');
  const [editingNodeId, setEditingNodeId] = useState<string>('start');
  const [showRawImportDialog, setShowRawImportDialog] = useState(false);
  const [rawImportJson, setRawImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Added sub-tabs under editor: 'nodes' (node editing) | 'settings' (metadata & world setups & stat definitions)
  const [editorSubTab, setEditorSubTab] = useState<'nodes' | 'settings'>('nodes');
  // Safe export modal for showing JSON backup cards
  const [exportGameModal, setExportGameModal] = useState<GameStory | null>(null);

  // Readme & Update log modal state
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [readmeSubTab, setReadmeSubTab] = useState<'guide' | 'features' | 'roadmap' | 'changelog'>('guide');

  // Sound effects generator back-off
  const playButtonPushSound = (freq = 450) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  };

  // Synchronize story database from localStorage on startup
  useEffect(() => {
    const list: GameStory[] = [...presetStories];
    const stored = localStorage.getItem('genso_custom_games');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GameStory[];
        // Filter duplicates by id
        const merged = [...list];
        parsed.forEach(game => {
          const idx = merged.findIndex(g => g.metadata.id === game.metadata.id);
          if (idx >= 0) {
            merged[idx] = game; // overwrite duplicate
          } else {
            merged.push(game);
          }
        });
        setGames(merged);
        return;
      } catch (err) {}
    }
    setGames(list);
  }, []);

  // Save custom games to localStorage
  const saveCustomGamesToLocal = (updatedList: GameStory[]) => {
    const customOnly = updatedList.filter(
      g => !presetStories.some(preset => preset.metadata.id === g.metadata.id)
    );
    localStorage.setItem('genso_custom_games', JSON.stringify(customOnly));
    setGames(updatedList);
  };

  // Create clean initial player session
  const initGamePlay = (game: GameStory) => {
    playButtonPushSound(520);
    const initialSession: PlayerSession = {
      gameId: game.metadata.id,
      currentNodeId: 'start',
      stats: { ...game.metadata.initialStats },
      inventory: [
        ...game.metadata.initialInventory,
        ...(game.metadata.startingGear || [])
      ],
      logs: [
        {
          nodeId: 'start',
          nodeTitle: game.nodes.start?.title || '序章',
          timestamp: Date.now(),
        },
      ],
      isGameOver: false,
      isVictory: false,
    };
    setSelectedGame(game);
    setSession(initialSession);
    setActiveCombatLogs([]);
    setActiveTab('games'); // 修正测试测试运行无效问题：点击后自动切换至冒险剧场页面
    scrollLogsToBottom();
  };

  // Typewriter effect state trigger on story navigation
  const currentNode = selectedGame && session ? selectedGame.nodes[session.currentNodeId] : null;
  useEffect(() => {
    if (!currentNode) return;
    let idx = 0;
    setTypedText('');
    const fullText = currentNode.text;
    
    const interval = setInterval(() => {
      setTypedText(prev => prev + fullText.charAt(idx));
      idx++;
      if (idx >= fullText.length) {
        clearInterval(interval);
      }
    }, 12); // fast typewriter speed for good game flow

    return () => clearInterval(interval);
  }, [currentNode]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLogsToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  // Core choice selector logic
  const handleSelectChoice = (choice: StoryChoice) => {
    if (!session || !selectedGame) return;

    // Check if there is D20 dice roll challenge tied to this choice!
    if (choice.roll) {
      playButtonPushSound(380);
      setActiveRoll({
        choice,
        stat: choice.roll.stat,
        difficulty: choice.roll.difficulty,
      });
      return;
    }

    applyChoiceResult(choice.targetNode, choice.text, choice.effects);
  };

  // Commit decision pathways
  const applyChoiceResult = (targetNodeId: string, choiceLabel: string, effects?: StoryChoice['effects']) => {
    if (!session || !selectedGame) return;

    const nextNode = selectedGame.nodes[targetNodeId];
    if (!nextNode) {
      alert(`错误: 找不到目标剧本节点: "${targetNodeId}". 请检查编辑器关联.`);
      return;
    }

    playButtonPushSound(600);
    
    // Compute stat changes and log floating rewards
    const newStats = { ...session.stats };
    const logs: string[] = [];

    if (effects && effects.stats) {
      Object.keys(effects.stats).forEach(k => {
        const key = k as PlayerStatName;
        const reward = effects.stats?.[key] || 0;
        if (reward !== 0) {
          const sign = reward > 0 ? '+' : '';
          const statEmoji = key === 'hp' ? '❤️' : key === 'mp' ? '🔮' : key === 'gold' ? '💰' : '🌟';
          logs.push(`${statEmoji} ${sign}${reward}`);
          
          if (key === 'hp') {
            newStats.hp = Math.max(0, Math.min(newStats.maxHp, newStats.hp + reward));
          } else if (key === 'mp') {
            newStats.mp = Math.max(0, Math.min(newStats.maxMp, newStats.mp + reward));
          } else {
            newStats[key] = Math.max(0, newStats[key] + reward);
          }
        }
      });
    }

    // Handout items
    let newInventory = [...session.inventory];
    if (effects && effects.gainItems) {
      effects.gainItems.forEach(item => {
        newInventory.push(item);
        logs.push(`🎒 获得: [${item}]`);
      });
    }

    // Spend items
    if (effects && effects.loseItems) {
      effects.loseItems.forEach(item => {
        newInventory = newInventory.filter(i => i !== item);
        logs.push(`🗑️ 消耗: [${item}]`);
      });
    }

    // Determine Victory or Doom states
    let isGameOver = false;
    let isVictory = false;

    // Standard endings rules
    if (targetNodeId.includes('ending_victory') || nextNode.choices.length === 0 && !targetNodeId.includes('ending_death')) {
      isVictory = true;
      isGameOver = true;
    }
    
    // Auto-death trigger if HP hits 0
    if (newStats.hp <= 0) {
      isGameOver = true;
      isVictory = false;
      targetNodeId = 'ending_death'; // Force route to ending death scene
    } else if (targetNodeId.includes('ending_death')) {
      isGameOver = true;
      isVictory = false;
    }

    setActiveCombatLogs(logs);

    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentNodeId: targetNodeId,
        stats: newStats,
        inventory: newInventory,
        isGameOver,
        isVictory,
        logs: [
          ...prev.logs,
          {
            nodeId: targetNodeId,
            choiceText: choiceLabel,
            nodeTitle: nextNode.title,
            timestamp: Date.now(),
          },
        ],
      };
    });

    scrollLogsToBottom();
  };

  // AI Story Generator - call Express server backend
  const handleGenerateStoryByAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiSuccessMsg(null);
    try {
      const response = await fetch('/api/gemini/generate-story', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI 剧本生成失败，请确认是否配置了 GEMINI_API_KEY。");
      }

      // Add to story database and notify
      const generated: GameStory = data.story;
      const newList = [generated, ...games.filter(g => g.metadata.id !== generated.metadata.id)];
      saveCustomGamesToLocal(newList);
      setAiSuccessMsg(`✨ 唤醒世界线成功！日系轻小说剧本《${generated.metadata.title}》已生成，你可以立即开始游玩！`);
      setAiPrompt('');
      
      // Auto pre-load it
      initGamePlay(generated);
    } catch (err: any) {
      setAiError(err.message || '召唤异世界大门时受到阻碍，请检查网络或配置。');
    } finally {
      setAiLoading(false);
    }
  };

  // Choice validity checker (locks locked forks)
  const evaluateChoiceLock = (choice: StoryChoice): { locked: boolean; reason: string } => {
    if (!session) return { locked: false, reason: '' };
    
    // Evaluate stats checks
    if (choice.requirements?.stats) {
      const statsReqs = choice.requirements.stats;
      for (const statName of Object.keys(statsReqs)) {
        const key = statName as PlayerStatName;
        const val = statsReqs[key] || 0;
        if (session.stats[key] < val) {
          const statLabels: Record<string, string> = { hp: 'HP', mp: 'Mana', gold: '金币', strength: '力量', charisma: '魅力', luck: '运气' };
          return { locked: true, reason: `需 🌟 ${statLabels[key]} ≥ ${val}` };
        }
      }
    }

    // Evaluate inventory items checks
    if (choice.requirements?.items) {
      const itemsReqs = choice.requirements.items;
      for (const item of itemsReqs) {
        if (!session.inventory.includes(item)) {
          return { locked: true, reason: `需携带: [${item}]` };
        }
      }
    }

    return { locked: false, reason: '' };
  };

  // Editor Actions: Delete chosen story from list
  const handleDeleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (presetStories.some(p => p.metadata.id === id)) {
      alert("内置剧本无法删除！");
      return;
    }
    if (confirm("确定要彻底销毁这个自定义剧本世界吗？")) {
      const filter = games.filter(g => g.metadata.id !== id);
      saveCustomGamesToLocal(filter);
      setSelectedGame(null);
      setSession(null);
    }
  };

  // Handlers to edit game nodes list
  const getEditingGame = (): GameStory | undefined => {
    return games.find(g => g.metadata.id === editingGameId) || games[0];
  };

  const handleUpdateNodeField = (nodeId: string, updates: Partial<StoryNode>) => {
    const game = getEditingGame();
    if (!game) return;

    const targetNode = game.nodes[nodeId];
    if (!targetNode) return;

    const updatedNode = { ...targetNode, ...updates };
    const updatedNodes = { ...game.nodes, [nodeId]: updatedNode };
    const updatedGame = { ...game, nodes: updatedNodes };

    const newList = games.map(g => (g.metadata.id === game.metadata.id ? updatedGame : g));
    saveCustomGamesToLocal(newList);
  };

  const handleCreateNewNode = (customName?: string) => {
    const game = getEditingGame();
    if (!game) return;

    const newId = customName || `node_${Date.now().toString().slice(-6)}`;
    const newNode: StoryNode = {
      id: newId,
      title: '未命名章节',
      avatarName: '莉莉丝',
      avatarType: 'partner',
      text: '在这里编写叙事或对白内容……',
      bgPathName: 'academy',
      bgTone: 'cyan',
      choices: [],
    };

    const updatedNodes = { ...game.nodes, [newId]: newNode };
    const updatedGame = { ...game, nodes: updatedNodes };

    const newList = games.map(g => (g.metadata.id === game.metadata.id ? updatedGame : g));
    saveCustomGamesToLocal(newList);
    setEditingNodeId(newId);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'start') {
      alert("初始起始节点 (start) 无法被删除！");
      return;
    }
    const game = getEditingGame();
    if (!game) return;

    const updatedNodes = { ...game.nodes };
    delete updatedNodes[nodeId];
    const updatedGame = { ...game, nodes: updatedNodes };

    const newList = games.map(g => (g.metadata.id === game.metadata.id ? updatedGame : g));
    saveCustomGamesToLocal(newList);
    setEditingNodeId('start');
  };

  // Edit Choice elements inside Editor
  const handleUpdateNodeChoice = (nodeId: string, choiceIndex: number, updates: Partial<StoryChoice>) => {
    const game = getEditingGame();
    if (!game) return;

    const targetNode = game.nodes[nodeId];
    if (!targetNode) return;

    const choicesCopy = [...targetNode.choices];
    choicesCopy[choiceIndex] = { ...choicesCopy[choiceIndex], ...updates };

    handleUpdateNodeField(nodeId, { choices: choicesCopy });
  };

  const handleAddNodeChoice = (nodeId: string) => {
    const game = getEditingGame();
    if (!game) return;

    const targetNode = game.nodes[nodeId];
    if (!targetNode) return;

    // Pick first available target node that exists as a default
    const availableTargets = Object.keys(game.nodes);
    const targetNodeDefault = availableTargets.find(id => id !== nodeId) || 'start';

    const newChoice: StoryChoice = {
      text: '👉 点击选项进行下个对话',
      targetNode: targetNodeDefault,
    };

    handleUpdateNodeField(nodeId, { choices: [...targetNode.choices, newChoice] });
  };

  const handleDeleteNodeChoice = (nodeId: string, index: number) => {
    const game = getEditingGame();
    if (!game) return;

    const targetNode = game.nodes[nodeId];
    if (!targetNode) return;

    const filtered = targetNode.choices.filter((_, i) => i !== index);
    handleUpdateNodeField(nodeId, { choices: filtered });
  };

  // Helper to update story metadata settings
  const handleUpdateMetadataField = (updates: Partial<GameMetadata>) => {
    const game = getEditingGame();
    if (!game) return;

    const updatedGame: GameStory = {
      ...game,
      metadata: {
        ...game.metadata,
        ...updates,
      },
    };

    const newList = games.map(g => (g.metadata.id === game.metadata.id ? updatedGame : g));
    saveCustomGamesToLocal(newList);
  };

  // Helper to update story metadata.initialStats
  const handleUpdateMetadataInitialStats = (updates: Partial<PlayerStats>) => {
    const game = getEditingGame();
    if (!game) return;

    const updatedGame: GameStory = {
      ...game,
      metadata: {
        ...game.metadata,
        initialStats: {
          ...game.metadata.initialStats,
          ...updates,
        },
      },
    };

    const newList = games.map(g => (g.metadata.id === game.metadata.id ? updatedGame : g));
    saveCustomGamesToLocal(newList);
  };

  const handleExportGameCard = (game: GameStory) => {
    try {
      playButtonPushSound(600);
      const code = JSON.stringify(game, null, 2);
      
      // Attempt standard clipboard copy
      try {
        navigator.clipboard.writeText(code);
      } catch (err) {
        console.warn('Iframe blocked clip API or failed:', err);
      }
      
      // Always trigger actual local .json download so they get a real file in all settings!
      const blob = new Blob([code], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${game.metadata.id || 'novel_story'}_rpg_sheet.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setExportGameModal(game);
  };

  // Create empty slate customized game
  const handleCreateEmptyGame = () => {
    const newId = `game_${Date.now()}`;
    const newGame: GameStory = {
      metadata: {
        id: newId,
        title: '我的全新微小说企划',
        description: '在编辑器里编写你的日系二次元异世界之旅，随心设定任务事件。',
        author: '新星游戏创作者',
        themeColor: 'emerald',
        initialStats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          gold: 50,
          strength: 10,
          charisma: 10,
          luck: 10,
        },
        initialInventory: ['🗺️ 粗糙地图'],
      },
      nodes: {
        start: {
          id: 'start',
          title: '起始篇章 (Start)',
          avatarName: '新手精灵',
          avatarType: 'partner',
          text: '“欢迎来到你自己设计的冒险大陆！请双击右上角的‘⚙️ 编辑剧本’开始丰富我的生平吧。”',
          bgPathName: 'town',
          bgTone: 'emerald',
          choices: [],
        },
      },
    };

    const updated = [newGame, ...games];
    saveCustomGamesToLocal(updated);
    setEditingGameId(newId);
    setEditingNodeId('start');
    setActiveTab('editor');
  };

  // Raw copy-paste story schema JSON importer
  const handleImportJsonCode = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(rawImportJson) as GameStory;
      if (!parsed.metadata || !parsed.metadata.title) {
        throw new Error("缺少剧本元数据(metadata)或标题字段。");
      }
      if (!parsed.nodes || !parsed.nodes.start) {
        throw new Error("必须包含至少包含主键为 'start' 的起始剧本节点。");
      }
      
      const existsIdx = games.findIndex(g => g.metadata.id === parsed.metadata.id);
      let updated: GameStory[];
      if (existsIdx >= 0) {
        updated = games.map((g, idx) => (idx === existsIdx ? parsed : g));
      } else {
        if (!parsed.metadata.id) {
          parsed.metadata.id = `game_imported_${Date.now()}`;
        }
        updated = [parsed, ...games];
      }

      saveCustomGamesToLocal(updated);
      setShowRawImportDialog(false);
      setRawImportJson('');
      alert(`🎉 成功导入剧本《${parsed.metadata.title}》！`);
    } catch (err: any) {
      setImportError(err.message || "JSON解析失败，请检查格式是否规范。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased selection:bg-cyan-500 selection:text-slate-900">
      
      {/* Dynamic Background Twinkle */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,27,75,0.4)_0%,rgba(15,23,42,0.95)_70%)] pointer-events-none" />

      {/* Top Header Panel */}
      <header className="relative z-20 border-b border-indigo-900/60 bg-slate-900/85 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg border border-indigo-400/30">
            <BookOpen className="w-6 h-6 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 font-mono">
                Genso Novel
              </span>
              文字游戏跑团引擎
            </h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide mt-0.5">
              Only Story & Choices · Japanese ACGN RPG System v1.6.0-Release
            </p>
          </div>
        </div>

        {/* Global tab routing navigation */}
        <div className="flex items-center gap-2">
          {/* Readme & System Manual Indicator Button */}
          <button
            onClick={() => {
              playButtonPushSound(440);
              setShowReadmeModal(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-cyan-200 border border-slate-700/60 hover:border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm focus:outline-none"
            title="查看软件说明书、安装步骤与更新日志"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">系统手册 & 升级志</span>
            <span className="inline xs:hidden">手册</span>
          </button>

          <button
            onClick={() => {
              playButtonPushSound(480);
              setActiveTab('games');
            }}
            className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-wide transition duration-250 flex items-center gap-1.5 ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-cyan-700 to-indigo-700 text-white shadow-lg shadow-cyan-950/40 border border-cyan-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            冒险剧场
          </button>
          <button
            onClick={() => {
              playButtonPushSound(485);
              const editingId = selectedGame ? selectedGame.metadata.id : (games[0]?.metadata.id || '');
              setEditingGameId(editingId);
              setActiveTab('editor');
            }}
            className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-wide transition duration-250 flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white shadow-lg shadow-pink-950/40 border border-pink-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-transparent'
            }`}
          >
            <Edit className="w-4 h-4" />
            创作者神卷
          </button>
        </div>
      </header>

      {/* Primary body slot */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 relative z-10">
        
        {/* VIEW 1: GAME EXPLORER HUB */}
        {activeTab === 'games' && !session && (
          <div className="space-y-8">
            
            {/* Top Showcase Banner (Splash block) */}
            <div className="relative rounded-3xl overflow-hidden border border-indigo-950 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
              {/* Outer splash frame layout */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
              
              <img
                src={SPLASH_IMAGE}
                alt="Genso Novel Cover Portal"
                className="absolute right-0 top-0 w-full md:w-3/5 h-full object-cover object-bottom opacity-65 md:opacity-85 mix-blend-lighten"
                referrerPolicy="no-referrer"
              />

              <div className="relative z-20 px-6 sm:px-12 py-10 sm:py-16 max-w-2xl text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 rounded-full border border-cyan-500/30 text-xs font-mono text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-300" />
                  日系ACG剧场 · 纯文字物语
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  唤醒属于你的<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 font-black">
                    异世界幻想之旅
                  </span>
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                  这是一个纯粹的文字冒险（Interactive Novel）引擎。通过选择衍生无穷剧情分岔，经历敏捷与好运掷骰硬核判定。利用下方的 AI 一键召唤你的自定义梦境世界！
                </p>

                {/* AI story prompt portal */}
                <div className="pt-2">
                  <div className="bg-slate-950/85 p-2 rounded-2xl border border-indigo-900/40 shadow-inner flex flex-col sm:flex-row gap-2 max-w-lg">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="例：学园都市最弱超能力者、克苏鲁深海探险、末日防空洞..."
                      disabled={aiLoading}
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0"
                    />
                    <button
                      onClick={handleGenerateStoryByAI}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      {aiLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-slate-900 border-t-white rounded-full animate-spin" />
                          <span>构筑神域中...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>AI一键构筑</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Alerts feedback */}
                  {aiLoading && (
                    <p className="text-xs text-cyan-400 font-mono mt-2 animate-pulse flex items-center gap-1">
                      <span>🔮 提示：Gemini 正在冥想编织包含至少 8 个庞大节点、完整属性体系与多样化结局的异界梦中梦... 请稍候 15 秒左右。</span>
                    </p>
                  )}
                  {aiError && (
                    <div className="text-xs text-rose-400 font-mono mt-2 flex items-center gap-1 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/30 max-w-lg">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{aiError}</span>
                    </div>
                  )}
                  {aiSuccessMsg && (
                    <div className="text-xs text-emerald-400 font-mono mt-2 flex items-center gap-1 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/30 max-w-lg">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{aiSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List Header and Manual Import options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-900">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  现已检索到的传说剧本 ({games.length})
                </h3>
                <p className="text-xs text-slate-400">选择心仪的题材，化身命运的干涉者开始跑团挑战。</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRawImportDialog(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  导入剧本编文 (JSON)
                </button>
                <button
                  onClick={handleCreateEmptyGame}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 hover:text-white rounded-xl text-xs font-semibold text-emerald-100 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新建空白剧本
                </button>
              </div>
            </div>

            {/* Games Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((g) => {
                const colorTone = g.metadata.themeColor || 'cyan';
                const shadowStyle = toneBorderShadows[colorTone] || toneBorderShadows.cyan;
                
                return (
                  <div
                    key={g.metadata.id}
                    onClick={() => initGamePlay(g)}
                    className={`bg-slate-900/40 hover:bg-slate-900/80 rounded-2xl border border-slate-800 p-5 cursor-pointer transform transition duration-300 hover:-translate-y-1 hover:${shadowStyle} flex flex-col justify-between gap-6 relative group overflow-hidden`}
                  >
                    {/* Decorative backdrop glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-${colorTone}-500/5 to-transparent rounded-full blur-2xl group-hover:from-${colorTone}-500/10 pointer-events-none`} />

                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono tracking-wide bg-slate-950 font-bold border ${
                          colorTone === 'rose' ? 'text-rose-400 border-rose-500/30' :
                          colorTone === 'amber' ? 'text-amber-400 border-amber-500/30' :
                          colorTone === 'emerald' ? 'text-emerald-400 border-emerald-500/30' :
                          colorTone === 'purple' ? 'text-purple-400 border-purple-500/30' :
                          'text-cyan-400 border-cyan-500/30'
                        }`}>
                          {colorTone.toUpperCase()} 机制
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono">
                          创作者：{g.metadata.author}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition duration-150">
                        {g.metadata.title}
                      </h4>
                      
                      {(g.metadata.worldTone || g.metadata.heroName) && (
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-0.5">
                          {g.metadata.worldTone && (
                            <span className="bg-purple-950/50 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                              🪐 主基调: {g.metadata.worldTone}
                            </span>
                          )}
                          {g.metadata.heroName && (
                            <span className="bg-slate-950/60 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              👤 扮演角色: {g.metadata.heroName}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                        {g.metadata.description}
                      </p>
                    </div>

                    {/* Stats metrics snippet */}
                    <div className="space-y-3 pt-3 border-t border-slate-900">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-950/60 rounded-lg py-1.5 p-1 border border-slate-900">
                          <span className="text-[10px] text-slate-500 font-mono block">❤️ HP 生命</span>
                          <span className="text-xs font-bold text-rose-400 font-mono">{g.metadata.initialStats.hp} / {g.metadata.initialStats.maxHp}</span>
                        </div>
                        <div className="bg-slate-950/60 rounded-lg py-1.5 p-1 border border-slate-900">
                          <span className="text-[10px] text-slate-500 font-mono block">🔮 精神魔力</span>
                          <span className="text-xs font-bold text-indigo-400 font-mono">{g.metadata.initialStats.mp} / {g.metadata.initialStats.maxMp}</span>
                        </div>
                        <div className="bg-slate-950/60 rounded-lg py-1.5 p-1 border border-slate-900">
                          <span className="text-[10px] text-slate-500 font-mono block">🎒 初始道具</span>
                          <span className="text-xs font-bold text-amber-500 font-mono">{g.metadata.initialInventory.length} 个</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-slate-950/80 rounded-xl p-2.5 px-3 border border-slate-900">
                        <div className="flex gap-2 items-center text-[10.5px] text-slate-400 font-mono">
                          <span>⚔️ 力量:{g.metadata.initialStats.strength}</span>
                          <span>🌟 魅力:{g.metadata.initialStats.charisma}</span>
                          <span>🍀 运气:{g.metadata.initialStats.luck}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                          <span>进入转生</span>
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* Edit tools overlay for custom ones */}
                    {!presetStories.some(p => p.metadata.id === g.metadata.id) && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playButtonPushSound(300);
                            setEditingGameId(g.metadata.id);
                            setEditingNodeId('start');
                            setActiveTab('editor');
                          }}
                          className="p-1 px-1.5 bg-purple-900 text-purple-200 hover:bg-purple-800 rounded-md text-[10px] border border-purple-500/30 flex items-center gap-0.5"
                          title="编辑这个游戏"
                        >
                          <Edit className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteGame(g.metadata.id, e)}
                          className="p-1 bg-rose-950 text-rose-400 hover:bg-rose-900 hover:text-white rounded-md border border-rose-500/20"
                          title="注销剧本"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: DIALOG DIALOG OVERLAY (RAW FORMAT IMPORTER / JSON IMPORT EXPORT) */}
        {showRawImportDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-xl bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl relative">
              <button
                onClick={() => setShowRawImportDialog(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                剧本导入端与数据卡贴合
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                你可以将朋友分享的大陆剧本配置JSON代码，或者在本地导出的JSON文本粘贴在下方，一键引入当前游戏引擎游玩或二次创改。
              </p>

              <textarea
                value={rawImportJson}
                onChange={(e) => setRawImportJson(e.target.value)}
                placeholder="请在此粘贴 幻境物语 标准故事 JSON 结构..."
                className="w-full h-64 bg-slate-950/90 text-slate-300 font-mono text-xs p-3 rounded-2xl border border-indigo-950 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
              />

              {importError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/30 mt-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    // Pre-fill a sample template schema to let them write it easily!
                    const sampleId = `game_sample_${Date.now()}`;
                    setRawImportJson(JSON.stringify({
                      metadata: {
                        id: sampleId,
                        title: "转生神职探险记",
                        description: "这是一个微小说冒险剧本范本。",
                        author: "无名氏",
                        themeColor: "amber",
                        initialStats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, gold: 50, strength: 10, charisma: 10, luck: 10 },
                        initialInventory: ["🥖 口粮"]
                      },
                      nodes: {
                        start: {
                          id: "start",
                          title: "初始神殿",
                          avatarName: "精灵祭司",
                          avatarType: "partner",
                          text: "“勇者啊，世界正面临危机。前行还是撤退？”",
                          bgPathName: "academy",
                          bgTone: "amber",
                          choices: [
                            { text: "⚔️ “随我踏平深渊。”", targetNode: "endpoint_victory" }
                          ]
                        },
                        endpoint_victory: {
                          id: "endpoint_victory",
                          title: "【终结：光明照耀】",
                          avatarName: "精灵祭司",
                          avatarType: "partner",
                          text: "你们征服了危机，光芒重新洒下。本剧本到此宣告终结！",
                          bgPathName: "academy",
                          bgTone: "cyan",
                          choices: []
                        }
                      }
                    }, null, 2));
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
                >
                  填入空白模板代码示范
                </button>
                <button
                  onClick={handleImportJsonCode}
                  className="px-5 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl text-xs hover:from-cyan-500"
                >
                  解析并导入载入
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ACTIVE GAME PLAYER MODE */}
        {activeTab === 'games' && session && selectedGame && (
          <div className="space-y-6">
            
            {/* Top Player Action Controls Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    playButtonPushSound(350);
                    setSelectedGame(null);
                    setSession(null);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    游戏游玩中 · {selectedGame.metadata.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    世界线ID: {selectedGame.metadata.id} · 当前章节: {currentNode?.title || '未知'}
                  </p>
                </div>
              </div>

              {/* Reset Game and Quick Escape controls */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => {
                    if (confirm("确定要重置当前游戏状态并重新开始本章旅程吗？")) {
                      initGamePlay(selectedGame);
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition border border-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>回到原点重来</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    setSession(null);
                  }}
                  className="px-3.5 py-2 bg-rose-950/80 text-rose-300 hover:bg-rose-900 hover:text-white rounded-xl text-xs transition border border-rose-900/40"
                >
                  <span>强退并保存进度</span>
                </button>
              </div>
            </div>

            {/* RPG Live Game Status Bar Panel */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* HP Progress Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    ❤️ 生命值 (HP)
                  </span>
                  <span className="text-slate-300">{session.stats.hp} / {session.stats.maxHp}</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(session.stats.hp / session.stats.maxHp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* MP Progress Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    🔮 精神魔力 (MP/脑力)
                  </span>
                  <span className="text-slate-300">{session.stats.mp} / {session.stats.maxMp}</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(session.stats.mp / session.stats.maxMp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-400 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Gold Pocket */}
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">【{selectedGame.metadata.heroName || '主角'}】资金库</span>
                    <span className="text-xs font-mono text-slate-300">{selectedGame.metadata.currencyName || '金币'}余额:</span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-400 font-mono tracking-wide">
                  💰 {session.stats.gold}
                </span>
              </div>

              {/* Extra RPG Stats */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 grid grid-cols-3 gap-1 text-center text-[10.5px] font-mono text-slate-300">
                <div className="p-1">
                  <span className="text-slate-500 text-[9px] block">⚔️ 力量</span>
                  <span className="font-bold text-sky-400">{session.stats.strength}</span>
                </div>
                <div className="p-1 border-x border-slate-900">
                  <span className="text-slate-500 text-[9px] block">🌟 魅力</span>
                  <span className="font-bold text-pink-400">{session.stats.charisma}</span>
                </div>
                <div className="p-1">
                  <span className="text-slate-500 text-[9px] block">🍀 运气</span>
                  <span className="font-bold text-emerald-400">{session.stats.luck}</span>
                </div>
              </div>
            </div>

            {/* Split layout: Narrative Arena vs Actions Desk */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDE: IMMERSIVE NARRATIVE STAGE (9 Columns on lg) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Arena Frame */}
                <div className={`relative bg-gradient-to-b ${bgPathGradients[currentNode?.bgPathName || 'academy'] || bgPathGradients.academy} border-2 ${toneBorderShadows[currentNode?.bgTone || 'cyan'] || toneBorderShadows.cyan} rounded-3xl overflow-hidden min-h-[460px] flex flex-col justify-end p-6 transition duration-500`}>
                  
                  {/* Cyber Anime Overlay sparkles */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(15,23,42,0.1)_0%,rgba(15,23,42,0.85)_80%)] pointer-events-none" />
                  
                  {/* Absolute character portrait positioned dynamic */}
                  <div className="absolute top-6 left-6 md:left-12 flex items-center gap-4">
                    <CharacterAvatar
                      type={currentNode?.avatarType || 'system'}
                      name={currentNode?.avatarName}
                      className="w-24 h-24 sm:w-28 sm:h-28"
                    />
                    
                    <div className="bg-slate-950/80 p-3 py-1.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
                      <span className="text-[9px] font-mono tracking-widest text-slate-500 block">SPEAKING TARGET</span>
                      <span className="text-xs font-black text-rose-300 font-sans tracking-wide">
                        🗣️ {currentNode?.avatarName || '系统提示'}
                      </span>
                    </div>
                  </div>

                  {/* Absolute top action log ticker */}
                  <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5">
                    {activeCombatLogs.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-950 text-emerald-300 border border-emerald-500/40 text-[11px] p-2 py-1 rounded-lg font-bold font-mono tracking-wide"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>

                  {/* Narration screen with smooth text display */}
                  <div className="relative z-10 bg-slate-950/90 p-5 sm:p-7 rounded-2xl border border-slate-800/80 backdrop-blur-md space-y-4 max-w-4xl w-full">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <h5 className="text-xs font-mono font-bold tracking-widest text-cyan-300">
                        {currentNode?.title || '第某章故事描述'}
                      </h5>
                    </div>

                    <div className="text-slate-200 text-sm sm:text-base leading-relaxed tracking-wide font-medium font-sans whitespace-pre-wrap min-h-[90px]">
                      {typedText}
                      {typedText.length < (currentNode?.text || '').length && (
                        <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-ping" />
                      )}
                    </div>
                  </div>
                </div>

                {/* RPG path tracing history card */}
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 font-mono">
                    <History className="w-3.5 h-3.5" />
                    旅途轨迹日志记录 ({session.logs.length} 段)
                  </h5>
                  <div
                    ref={scrollRef}
                    className="max-h-28 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800 text-xs font-mono"
                  >
                    {session.logs.map((log, index) => (
                      <div key={index} className="flex gap-2 items-start text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-600 shrink-0">#{index + 1}</span>
                        <div>
                          {log.choiceText && (
                            <span className="text-cyan-400 mr-2">【做出抉择：{log.choiceText}】</span>
                          )}
                          <span className="text-slate-200">到达节点：《{log.nodeTitle}》</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: OPTIONS PANEL & BAG STORAGE (4 Columns on lg) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Branch options selector box */}
                <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h5 className="text-xs font-extrabold text-slate-300 font-mono flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-cyan-400" />
                      接下来采取什么行动？
                    </h5>
                  </div>

                  {/* Choice Buttons List */}
                  <div className="space-y-3">
                    {currentNode && currentNode.choices.length > 0 && !session.isGameOver ? (
                      currentNode.choices.map((choice, idx) => {
                        const { locked, reason } = evaluateChoiceLock(choice);
                        
                        return (
                          <button
                            key={idx}
                            disabled={locked || typedText.length < (currentNode.text || '').length * 0.4}
                            onClick={() => handleSelectChoice(choice)}
                            className={`w-full text-left p-3.5 sm:p-4 rounded-2xl text-xs sm:text-xs font-semibold tracking-wide border transition duration-200 relative group flex justify-between items-center gap-3 active:scale-[0.98] ${
                              locked
                                ? 'bg-slate-950/50 text-slate-500 border-slate-900/65 cursor-not-allowed'
                                : 'bg-slate-950 hover:bg-indigo-950/40 text-slate-100 hover:text-white border-slate-800 hover:border-cyan-400/50 cursor-pointer shadow-lg hover:shadow-cyan-950/20'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="block text-slate-200 group-hover:text-cyan-200 transition-colors">
                                {choice.text}
                              </span>
                              
                              {/* Show requirements / bonuses */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {choice.roll && (
                                  <span className="inline-block px-1.5 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-500/30 rounded text-[9px] font-mono font-bold">
                                    🎲 D20 [{choice.roll.stat.toUpperCase()}] 判定难度 {choice.roll.difficulty}
                                  </span>
                                )}
                                {choice.effects?.stats && Object.keys(choice.effects.stats).map(k => {
                                  const key = k as PlayerStatName;
                                  const val = choice.effects?.stats?.[key] || 0;
                                  if (val === 0) return null;
                                  const sign = val > 0 ? '+' : '';
                                  return (
                                    <span key={key} className="inline-block px-1 py-0.5 bg-slate-900 text-slate-400 text-[8px] font-mono rounded border border-slate-800">
                                      {key.toUpperCase()}: {sign}{val}
                                    </span>
                                  );
                                })}
                                {choice.effects?.gainItems && choice.effects.gainItems.map(item => (
                                  <span key={item} className="inline-block px-1 py-0.5 bg-emerald-950/60 text-emerald-400 text-[8px] rounded border border-emerald-500/25">
                                    + {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Padlock status labels */}
                            {locked ? (
                              <span className="shrink-0 text-[10px] font-mono font-bold text-rose-400 py-0.5 px-1.5 bg-rose-950/60 rounded border border-rose-500/20">
                                {reason}
                              </span>
                            ) : (
                              <span className="shrink-0 text-slate-600 group-hover:text-cyan-400 transition-colors font-mono">
                                ➔
                              </span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                        <CharacterAvatar
                          type={session.isVictory ? 'partner' : 'enemy'}
                          className="w-16 h-16 mx-auto"
                        />
                        
                        <div>
                          <h4 className={`text-base font-black ${session.isVictory ? 'text-cyan-400' : 'text-rose-500'}`}>
                            {session.isVictory ? '✨ 恭喜：达成传说终章 ✨' : '💀 冒险终结：命运折损 💀'}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {session.isVictory ? '完成了这段波澜万丈的故事！阿斯加德在歌颂你的史诗。' : '生命终结，或在其他角落展开着奇特退休活动。'}
                          </p>
                        </div>

                        <div className="flex gap-2 justify-center pt-2">
                          <button
                            onClick={() => initGamePlay(selectedGame)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl text-xs hover:from-cyan-500 shadow-md"
                          >
                            时光倒流重开
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGame(null);
                              setSession(null);
                            }}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 border border-slate-700"
                          >
                            回到剧本列表
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Backpack items catalog panel */}
                <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-1">
                    <h5 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                      <Sword className="w-4 h-4 text-amber-500" />
                      冒险包背包与战利品 ({session.inventory.length})
                    </h5>
                  </div>

                  {session.inventory.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {session.inventory.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 p-2 py-2.5 rounded-xl text-left font-mono text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-sm hover:border-amber-500/30 group cursor-default"
                        >
                          <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-950/40 rounded-xl border border-slate-900 text-slate-500 text-[10px] font-mono">
                      🎒 背包空空如也，前行探索触发事件来赢取物资吧。
                    </div>
                  )}

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 text-[10px] text-slate-400 leading-relaxed font-sans flex items-start gap-1.5 mt-2">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>提示：部分选项需要拥有特定的道具背包判定解锁。你可以在剧情中做出理智兑换获取它们。</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: VISUAL STORY NODE EDITOR AND CREATOR */}
        {activeTab === 'editor' && (
          <div className="bg-slate-900/40 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-6">
            
            {/* Top Editor Switch Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-indigo-950">
              <div className="space-y-1">
                <label className="text-[10px] text-purple-400 font-mono block">SELECT DRAMA SCRIPT TO EDIT</label>
                <div className="flex items-center gap-2">
                  <select
                    value={editingGameId}
                    onChange={(e) => {
                      setEditingGameId(e.target.value);
                      setEditingNodeId('start');
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-48"
                  >
                    {games.map(g => (
                      <option key={g.metadata.id} value={g.metadata.id}>
                        {g.metadata.title} {presetStories.some(p => p.metadata.id === g.metadata.id) ? ' (内置只读)' : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const game = getEditingGame();
                      if (game) handleExportGameCard(game);
                    }}
                    className="p-1 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer hover:text-white hover:border-purple-500/50 transition-colors"
                    title="复制跑团卡并执行下载"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>导出跑团卡</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateEmptyGame}
                  className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition"
                >
                  ＋ 创建全新剧本世界
                </button>
                
                {getEditingGame() && (
                  <button
                    onClick={() => {
                      const game = getEditingGame();
                      if (game) initGamePlay(game);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 animate-pulse" />
                    <span>测试运行当前剧本</span>
                  </button>
                )}
              </div>
            </div>

            {/* Creator Scroll Sub-Tab controls */}
            <div className="flex border-b border-slate-800/60 pb-px gap-1">
              <button
                onClick={() => {
                  playButtonPushSound(420);
                  setEditorSubTab('nodes');
                }}
                className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                  editorSubTab === 'nodes'
                    ? 'border-purple-500 text-purple-300 bg-purple-950/20 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span>📝 章节分支节点编创</span>
              </button>
              <button
                onClick={() => {
                  playButtonPushSound(430);
                  setEditorSubTab('settings');
                }}
                className={`py-3 px-5 text-xs font-black tracking-wider uppercase border-b-2 transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                  editorSubTab === 'settings'
                    ? 'border-purple-500 text-purple-300 bg-purple-950/20 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span>⚙️ 全局配置、世界观与游戏数据规则</span>
              </button>
            </div>

            {editorSubTab === 'nodes' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Node sidebar navigator (4 columns) */}
              <div className="md:col-span-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h5 className="text-xs font-extrabold text-slate-300 font-mono tracking-widest block uppercase text-rose-300">
                    📂 剧本章节与分支节点树
                  </h5>
                  <button
                    onClick={() => {
                      const name = prompt("请设置新增节点的主键名 (格式如 forest_end, fight_cobra):");
                      if (name) {
                        const clean = name.trim().toLowerCase();
                        if (!clean) return;
                        const game = getEditingGame();
                        if (game && game.nodes[clean]) {
                          alert("冲突：这一节点主键标识已存在！");
                          return;
                        }
                        handleCreateNewNode(clean);
                      } else if (name === '') {
                        handleCreateNewNode();
                      }
                    }}
                    className="p-1 px-2 bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-500/30 rounded-lg text-[10px] flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加节点</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {getEditingGame() && Object.keys(getEditingGame()!.nodes).map(key => {
                    const node = getEditingGame()!.nodes[key];
                    const active = key === editingNodeId;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          playButtonPushSound(320);
                          setEditingNodeId(key);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold tracking-wide border transition flex justify-between items-center ${
                          active
                            ? 'bg-purple-950/40 text-purple-200 border-purple-500/40 shadow-inner'
                            : 'bg-slate-900/60 text-slate-400 border-transparent hover:border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono text-[10px] block text-slate-500">#{key}</span>
                          <span className={`${active ? 'text-purple-300' : ''}`}>{node.title}</span>
                        </div>
                        {editingNodeId !== 'start' && key === editingNodeId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`确定要彻底删除节点 [${key}] 吗？`)) {
                                handleDeleteNode(key);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  * 命运跑团引擎从 <span className="text-purple-400 font-bold">start</span> 节点作为冒险起点。你可以自由增加各个章节（如 forest、boss 等），并在选项中关联到下一个章节。
                </div>
              </div>

              {/* Node editor element builder (8 columns) */}
              <div className="md:col-span-8 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-6">
                
                {getEditingGame() && getEditingGame()!.nodes[editingNodeId] ? (
                  (() => {
                    const node = getEditingGame()!.nodes[editingNodeId];
                    const isPreset = presetStories.some(p => p.metadata.id === editingGameId);
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1">
                            <Eye className="w-4 h-4 text-purple-400" />
                            编辑节点细节：<span className="text-purple-300 font-mono">#{editingNodeId}</span>
                          </h4>
                          {isPreset && (
                            <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/30 rounded text-[9px] font-mono font-bold">
                              ⚠️ 内置剧本只读 (副本不支持持久存储)
                            </span>
                          )}
                        </div>

                        {/* Node basic headers form config */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-mono block">章节标题 (Title)</label>
                            <input
                              type="text"
                              value={node.title}
                              disabled={isPreset}
                              onChange={(e) => handleUpdateNodeField(editingNodeId, { title: e.target.value })}
                              placeholder="例：绝望黑暗的遗迹大厅"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-mono block">说话发起者 (Avatar Name)</label>
                            <input
                              type="text"
                              value={node.avatarName}
                              disabled={isPreset}
                              onChange={(e) => handleUpdateNodeField(editingNodeId, { avatarName: e.target.value })}
                              placeholder="例：莉莉丝"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-mono block">发起人立场 (Role)</label>
                            <select
                              value={node.avatarType}
                              disabled={isPreset}
                              onChange={(e) => handleUpdateNodeField(editingNodeId, { avatarType: e.target.value as any })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="system">系统提示 (System Logo)</option>
                              <option value="partner">金发祭司伴侣 (Lilith sprite)</option>
                              <option value="enemy">尖刺深渊强敌 (Evil demon sprite)</option>
                              <option value="merchant">招财猫耳少女 (Coco merchant sprite)</option>
                              <option value="hero">热血剑客勇者 (Hero sprite)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-mono block">环境场景底色 (Backdrop Arena)</label>
                            <select
                              value={node.bgPathName}
                              disabled={isPreset}
                              onChange={(e) => handleUpdateNodeField(editingNodeId, { bgPathName: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              {SCENE_BACKDROPS.map(op => (
                                <option key={op.id} value={op.id}>{op.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Node Narration Rich Text Area */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-mono block">本章详细剧本叙述对白文案 (Description Text)</label>
                          <textarea
                            value={node.text}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateNodeField(editingNodeId, { text: e.target.value })}
                            placeholder="编织惊心动魄的异世界故事..."
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-none"
                          />
                        </div>

                        {/* Option paths builder inside editor */}
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-slate-300 font-mono">
                              🛠️ 配置当前节点的选项分岔路径 ({node.choices.length})
                            </h5>
                            <button
                              onClick={() => handleAddNodeChoice(editingNodeId)}
                              disabled={isPreset}
                              className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 rounded-xl text-[10px] font-bold transition flex items-center gap-1 border border-purple-500/25"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>添加路径分岔</span>
                            </button>
                          </div>

                          {node.choices.length > 0 ? (
                            <div className="space-y-3">
                              {node.choices.map((choice, index) => (
                                <div key={index} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 space-y-3 relative">
                                  
                                  {/* Delete choice btn */}
                                  <button
                                    onClick={() => handleDeleteNodeChoice(editingNodeId, index)}
                                    disabled={isPreset}
                                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                  <div className="font-mono text-[9px] text-slate-500 uppercase">
                                    分支路径 #{index + 1}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] text-slate-500 font-mono block">选项显示字样 (Button Label)</label>
                                      <input
                                        type="text"
                                        value={choice.text}
                                        disabled={isPreset}
                                        onChange={(e) => handleUpdateNodeChoice(editingNodeId, index, { text: e.target.value })}
                                        placeholder="例：⚔️ 勇敢反击"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                      />
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <label className="text-[9px] text-slate-500 font-mono block">目标流向节点 (Target Destination)</label>
                                      <select
                                        value={choice.targetNode}
                                        disabled={isPreset}
                                        onChange={(e) => handleUpdateNodeChoice(editingNodeId, index, { targetNode: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                      >
                                        {Object.keys(getEditingGame()!.nodes).map(nodeId => (
                                          <option key={nodeId} value={nodeId}>#{nodeId} - {getEditingGame()!.nodes[nodeId].title}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Choice RPG mechanics options toggles */}
                                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 space-y-2 text-[10px]">
                                    <div className="flex gap-2 justify-between border-b border-slate-900 pb-1 text-slate-400 font-mono">
                                      <span>🧮 进阶属性/道具判定 (RPG Mechanics Settings)</span>
                                    </div>

                                    <div className="text-[10px] text-slate-400 leading-relaxed font-sans flex flex-col gap-1">
                                      <span>该选项可设定各种进阶玩法属性：。你可以直接编辑游戏 JSON 跑团文件获得无限的自定义加成、D20骰子判定和特定背包道具卡限制！</span>
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                              💡 这是一处终章结局节点（比如完美结局或角色暴毙结局），没有设计延续走向的分岐选项。
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    请在左侧侧边栏选择你想要编辑的剧情节点。
                  </div>
                )}
              </div>
            </div>
            ) : (() => {
              const game = getEditingGame();
              if (!game) return (
                <div className="text-center py-12 text-slate-500 font-mono">
                  ⚠️ 暂未选定或生成有效的可编辑剧情剧本。
                </div>
              );
              
              const isPreset = presetStories.some(p => p.metadata.id === game.metadata.id);
              const initialInvString = game.metadata.initialInventory.join(', ');
              const startingGearString = (game.metadata.startingGear || []).join(', ');
              
              return (
                <div className="space-y-6">
                  {isPreset && (
                    <div className="p-4 bg-amber-950/40 text-amber-300 border border-amber-500/30 rounded-2xl text-xs flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-200">内置只读警告 (Read-Only Script)</strong>
                        <span className="block mt-0.5 text-slate-300">《{game.metadata.title}》为系统内置只读剧本，不适用于云端或持久化覆盖保存。推荐您点击右上方“<b>创建全新剧本世界</b>”来启动您的自由物语。</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* CARD 1: SCRIPT TITLE SUMMARY INFO */}
                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="border-b border-slate-850 pb-2.5">
                        <h4 className="text-xs font-black text-cyan-300 uppercase font-mono tracking-widest flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> 🎭 1. 剧本基础属性设定
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">修改文本标题 (Script Title)</label>
                          <input
                            type="text"
                            value={game.metadata.title}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataField({ title: e.target.value })}
                            placeholder="例：极光境界之末日圣杯"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 active:ring-purple-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">创作者署名 (Author Name)</label>
                          <input
                            type="text"
                            value={game.metadata.author}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataField({ author: e.target.value })}
                            placeholder="例：梦境编织姬"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">剧本开局简介描述 (Intro / Logline)</label>
                          <textarea
                            value={game.metadata.description}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataField({ description: e.target.value })}
                            placeholder="写下几句扣人心弦的故事简介，吸引冒险者加入转生..."
                            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">视觉主题专属色调 (Accent Tone)</label>
                          <select
                            value={game.metadata.themeColor}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataField({ themeColor: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="cyan">冰海极光 · 青色 (Cyan)</option>
                            <option value="rose">炼狱狂岚 · 绯红 (Rose)</option>
                            <option value="amber">黄金遗珍 · 琥珀 (Amber)</option>
                            <option value="purple">秘术异界 · 邪紫 (Purple)</option>
                            <option value="emerald">永翠密林 · 鲜绿 (Emerald)</option>
                            <option value="sky">深穹星轨 · 蔚蓝 (Sky)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: WORLDVIEW CREATIVE DESCRIPTION */}
                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="border-b border-slate-850 pb-2.5">
                        <h4 className="text-xs font-black text-purple-300 uppercase font-mono tracking-widest flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> 🌌 2. 宏观世界观设置 (Worldview Lore)
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">世界主基调 / 题材体系 (Theme Genre)</label>
                          <input
                            type="text"
                            value={game.metadata.worldTone || ''}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataField({ worldTone: e.target.value })}
                            placeholder="例：高魔神话冒险 / 轻度克苏鲁惊悚 / 现实虚无主义"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">世界观环境规则与宏观背景设定 (Worldview Details)</label>
                          <textarea
                            value={game.metadata.worldview || ''}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataField({ worldview: e.target.value })}
                            placeholder="在这里撰写世界观神论结构。优秀的设定有助于未来 AI 故事流体生成时获取准确的世界设定，确保对话不穿帮、怪物属性高度契合..."
                            className="w-full h-44 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-none"
                          />
                        </div>

                        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 text-[10.5px] text-slate-400 leading-normal font-sans">
                          💡 <b>世界观小知识：</b>您可以描述魔法流派、天空色彩、诸神名册等。在体验冒险时，这些文本将被融合为冥想基底。
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: GAMEPLAY DATA HERO & CURRENCY */}
                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="border-b border-slate-850 pb-2.5">
                        <h4 className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                          <Sword className="w-3.5 h-3.5" /> 🎒 3. 初始姓名、装备与专属道具设置
                        </h4>
                      </div>

                      <div className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-mono block">主角名字 / 角色默认代称</label>
                            <input
                              type="text"
                              value={game.metadata.heroName || ''}
                              disabled={isPreset}
                              onChange={(e) => handleUpdateMetadataField({ heroName: e.target.value })}
                              placeholder="例：转生皇子 / 冒险者 / 阿尔斯"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-mono block">专属金币 / 代币货币称呼</label>
                            <input
                              type="text"
                              value={game.metadata.currencyName || ''}
                              disabled={isPreset}
                              onChange={(e) => handleUpdateMetadataField({ currencyName: e.target.value })}
                              placeholder="例：金币 / 摩拉 / 原石 / 魔晶"
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">初始携带背包道具卡 (以顿号或逗号分割)</label>
                          <input
                            type="text"
                            value={initialInvString}
                            disabled={isPreset}
                            onChange={(e) => {
                              const items = e.target.value.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
                              handleUpdateMetadataField({ initialInventory: items });
                            }}
                            placeholder="例：生命药水, 神圣洗礼卷轴, 冒险指南"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono block">初始专属战斗武器装备 (以顿号或逗号分割)</label>
                          <input
                            type="text"
                            value={startingGearString}
                            disabled={isPreset}
                            onChange={(e) => {
                              const gear = e.target.value.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
                              handleUpdateMetadataField({ startingGear: gear });
                            }}
                            placeholder="例：锈蚀的帝国十字重剑, 护身皮甲"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD 4: INITIAL NUMBERS AND ATTRIBUTES */}
                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="border-b border-slate-850 pb-2.5">
                        <h4 className="text-xs font-black text-rose-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5" /> 📊 4. 初始冒险属性数值设定
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                        <div className="space-y-1">
                          <label className="text-[10px] text-rose-300 block">当前生命 HP</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.hp}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ hp: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-rose-300 block">最大生命 HP Max</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.maxHp}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ maxHp: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-indigo-300 block">当前精神 MP</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.mp}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ mp: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-indigo-300 block">最大精神 MP Max</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.maxMp}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ maxMp: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-amber-300 block">起始钱包余额</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.gold}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ gold: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-sky-300 block">默认力量 (Strength)</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.strength}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ strength: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold text-sky-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-pink-300 block">默认魅力 (Charisma)</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.charisma}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ charisma: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold text-pink-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-emerald-300 block">默认运气 (Luck)</label>
                          <input
                            type="number"
                            value={game.metadata.initialStats.luck}
                            disabled={isPreset}
                            onChange={(e) => handleUpdateMetadataInitialStats({ luck: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold text-emerald-400"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </main>

      {/* FOOTER COOPERATIVE SECTION */}
      <footer className="relative z-20 border-t border-indigo-950/60 bg-slate-950 px-6 py-6 text-center text-xs text-slate-500 font-mono space-y-1.5">
        <div>
          © 2026 幻境物语 Genso Novel Studio · 基于 TypeScript & React 高性能渲染
        </div>
        <div className="text-[10.5px] text-slate-600">
          * 你的自定义剧本会自动保存在浏览器本地，可通过“导出跑团卡 (Standard JSON)”来交付分享。
        </div>
      </footer>

      {/* DETAILED MODAL: D20 DICE CHALLENGE */}
      <AnimatePresence>
        {activeRoll && session && (
          <AnimatedDice
            statName={activeRoll.stat}
            difficulty={activeRoll.difficulty}
            playerStats={session.stats}
            onComplete={(success) => {
              const targetNode = success
                ? activeRoll.choice.roll!.successNode
                : activeRoll.choice.roll!.failureNode;
              
              applyChoiceResult(
                targetNode,
                `🎲 ${activeRoll.choice.text} [骰子测试: ${success ? '成功' : '失败'}]`,
                activeRoll.choice.effects
              );
              
              setActiveRoll(null);
            }}
            onCancel={() => {
              setActiveRoll(null);
            }}
          />
        )}
        
        {exportGameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-xl bg-slate-900 border-2 border-purple-500 rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setExportGameModal(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  💾 剧本跑团卡配置数据已生成
                </h3>
                <p className="text-xs text-slate-400 mt-1">系统已自动为您触发下载后缀为 <span className="text-purple-300 font-semibold font-mono">.json</span> 的文件。若因浏览器/iframe沙盒限制未能下载，请直接复制下方文本进行备份！</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-mono block">剧本 Standard JSON 核心数据块</label>
                <textarea
                  readOnly
                  value={JSON.stringify(exportGameModal, null, 2)}
                  onClick={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.select();
                  }}
                  className="w-full h-72 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-[11px] font-mono text-cyan-300 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <span className="text-[10px] text-slate-500 font-mono block text-right">* 💡 提示：点击即可自动执行“全本高亮选中”</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(JSON.stringify(exportGameModal, null, 2));
                      alert("📋 数据已被成功写入系统剪切板！");
                    } catch (err) {
                      alert("⚠️ 复制通道受阻。请直接点击输入框按 Ctrl+C，并右键“拷贝”即可！");
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  复制到剪贴板
                </button>
                <button
                  onClick={() => setExportGameModal(null)}
                  className="px-4 py-2 bg-slate-850 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800"
                >
                  关闭页面
                </button>
              </div>
            </div>
          </div>
        )}

        {showReadmeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] text-left">
              <button
                onClick={() => setShowReadmeModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Version info */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2.5 bg-cyan-950/80 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold rounded-full">
                    v1.6.0-Release · 稳定版
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  🪐 Genso Novel 系统说明书 & 冒险升级志
                </h3>
              </div>

              {/* Multi-Tab Structure */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Left tab items (4 cols) */}
                <div className="md:col-span-4 flex flex-row md:flex-col gap-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4 overflow-x-auto whitespace-nowrap md:whitespace-normal">
                  <button
                    onClick={() => { playButtonPushSound(350); setReadmeSubTab('guide'); }}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer flex-1 md:flex-none ${
                      readmeSubTab === 'guide'
                        ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    📖 安装学、启动与新手使用
                  </button>
                  <button
                    onClick={() => { playButtonPushSound(360); setReadmeSubTab('features'); }}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer flex-1 md:flex-none ${
                      readmeSubTab === 'features'
                        ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    ⚡ 目前核心功能与判定系统
                  </button>
                  <button
                    onClick={() => { playButtonPushSound(370); setReadmeSubTab('roadmap'); }}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer flex-1 md:flex-none ${
                      readmeSubTab === 'roadmap'
                        ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    🚀 未来拓展与神级展望
                  </button>
                  <button
                    onClick={() => { playButtonPushSound(380); setReadmeSubTab('changelog'); }}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer flex-1 md:flex-none ${
                      readmeSubTab === 'changelog'
                        ? 'bg-cyan-950/50 border border-cyan-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    📜 历史版本更新日志 (All Log)
                  </button>
                </div>

                {/* Right content panel (8 cols) */}
                <div className="md:col-span-8 overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
                  {readmeSubTab === 'guide' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white text-xs mb-1">🎁 简介与定位</h4>
                        <p>本软件是一套原生的“日系 ACGN 游戏跑团与轻小说演绎引擎”。允许玩家用创作者身份快速在本地编撰自己心中的各种异世界世界线、初始道具/血量/力量，更可凭借 Gemini AI 一键构筑庞大的命运之网！</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-cyan-400">⚡ 极速本地安装步骤</h4>
                        <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 font-mono text-[11px]">
                          <li>
                            <b className="text-slate-200">安装 Node.js 18+</b>：访问 nodejs.org 获取最细致的版本包并安装。
                          </li>
                          <li>
                            <b className="text-slate-200">解压或下载源码并加载依赖</b>：
                            <pre className="bg-slate-950 p-1.5 rounded mt-1 overflow-x-auto text-[10px] text-slate-300 border border-slate-800">npm install</pre>
                          </li>
                          <li>
                            <b className="text-slate-200">配置 Gemini 密钥 (AI召唤需要)</b>：在项目根目录新建 <code className="text-cyan-300">.env</code> 配置文件：
                            <pre className="bg-slate-950 p-1.5 rounded mt-1 overflow-x-auto text-[10px] text-slate-300 border border-slate-800">GEMINI_API_KEY=你的谷歌开发金钥</pre>
                          </li>
                          <li>
                            <b className="text-slate-200">启动本地极速开发热构建服务器</b>：
                            <pre className="bg-slate-950 p-1.5 rounded mt-1 overflow-x-auto text-[10px] text-slate-300 border border-slate-800">npm run dev</pre>
                          </li>
                        </ol>
                      </div>

                      <div className="space-y-2 pl-1.5 border-l-2 border-indigo-500/50">
                        <h4 className="font-bold text-slate-200">🎮 新手使用教学</h4>
                        <p>① <b>选择剧本</b>：在“<b>冒险剧场</b>”首页，点击任一内置卡牌（如“皇家空防魔导兵”），点击“<b>进入转生</b>”。</p>
                        <p>② <b>选择与掷骰判定</b>：阅读右侧日系高爆轻小说文字。面临抉择时，若选项带有 “🎲 力量检测-难度 12”，点击会拉起动态 20 面骰判定，根据力量数值作为加成，大成功或成功将解锁隐藏通关选项！</p>
                        <p>③ <b>实时极速创作</b>：您可以点击页面顶部的“<b>创作者神卷</b>”选择自定义新建属于您的全新跑团脑洞！编写节点的台词、立绘头像，配置不同的下一级跳转，更改测试后点击“测试当前剧本”将瞬间让您置入该世界游玩测试！</p>
                      </div>
                    </div>
                  )}

                  {readmeSubTab === 'features' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <h5 className="font-bold text-cyan-400">🪐 多元动漫视觉场景</h5>
                          <p className="mt-1 text-slate-400 text-[11px] leading-normal">提供神导学院、微光森林、古老矿洞、深渊地廊和繁华酒馆等ACG经典背景并匹配场景极光色彩。</p>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <h5 className="font-bold text-purple-400">⚙️ 免代码沙盒配置</h5>
                          <p className="mt-1 text-slate-400 text-[11px] leading-normal">自主掌控初始血量 HP Max、最大蓝量 MP Max，极速自定义主角代称与硬通代币名称（如原石/摩拉）。</p>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <h5 className="font-bold text-amber-500">🎲 D20 判定大考验</h5>
                          <p className="mt-1 text-slate-400 text-[11px] leading-normal">集成了古典 TRPG 的 20 面好运筛子。检测玩家力量、魅力、运气。让冒险旅程充满无尽的随机喜感。</p>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <h5 className="font-bold text-emerald-400">🔮 AI 异界神话魔术</h5>
                          <p className="mt-1 text-slate-400 text-[11px] leading-normal">基于 Google Gemini 智能模型，只需要一句话主题，秒级繁衍出契合跑团体系的宏大初始卡！</p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-900 text-slate-300 leading-normal">
                        🎯 <b>最新特性：</b>目前新增了标准的“初始战斗装备 (Starting Gear)”一并加入到开局冒险背包，并支持即改即测试的刷新机制。
                      </div>
                    </div>
                  )}

                  {readmeSubTab === 'roadmap' && (
                    <div className="space-y-3.5">
                      <div className="flex gap-3 items-start">
                        <div className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 border border-cyan-500/30">1</div>
                        <div>
                          <h5 className="font-bold text-white text-xs">玩家在线共享工坊</h5>
                          <p className="text-slate-400 text-[11px] mt-0.5">连通云备份与共享社区，冒险者不仅能本地极速编写，也可以将自己的剧本上传让全世界数万玩家点赞挑战。</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 border border-cyan-500/30">2</div>
                        <div>
                          <h5 className="font-bold text-white text-xs">阵营势力与美少女羁绊好感度</h5>
                          <p className="text-slate-400 text-[11px] mt-0.5">增加羁绊好感度数值判定，通过抉择改变导师、怪兽或美少女队友的心之天平，解锁隐藏表白路线！</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 border border-cyan-500/30">3</div>
                        <div>
                          <h5 className="font-bold text-white text-xs">AI 概念背景音乐 (BGM) 与智能配音</h5>
                          <p className="text-slate-400 text-[11px] mt-0.5">集成高契合度 AI 谱曲服务，提供二次元管弦、激昂战斗等动态音场，并整合文本转日本动漫配音系统。</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {readmeSubTab === 'changelog' && (
                    <div className="space-y-3 font-mono text-[11px]">
                      <div className="border-l-2 border-cyan-500 pl-3 py-1 space-y-1">
                        <div className="flex justify-between text-white font-bold text-xs">
                          <span>🪐 v1.6.0-Release —— 【创作者重构版】</span>
                          <span className="text-cyan-400 font-sans">2026-05 (最新)</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          - <b>新增：世界观宏观详情字段：</b>创作者可在“全局配置”内自定义设定世界神话论与风格基调，便于 AI 对话时深度贴合。<br />
                          - <b>新增：主角称呼与代币名称深度自定义：</b>可以随意将货币和主角称号改成 *“阿尔斯”* 与 *“摩晶”* 等，并在游戏主面板和日志提示同步映射渲染。<br />
                          - <b>新增：初始背包装备属性：</b>额外提供了战斗武器和防具的装备插槽，初始开局更加立体。<br />
                          - <b>新增：剧本名称编辑重名功能：</b>支持在编辑器直接重命名剧本，免除本地保存只读标题。<br />
                          - <b>修复：“测试剧本”功能自动切页：</b>点击后重置数据并自动跳回“冒险剧场”，实现即改即玩的极致体验。<br />
                          - <b>修复：跑团卡导出弹窗交互：</b>重构一键导出逻辑，除了自动执行本地 .json 文件安全下载，还会拉起带自选拷贝的数据弹框，完美绕开 iframe 的安全剪贴限制。
                        </p>
                      </div>

                      <div className="border-l-2 border-slate-700 pl-3 py-1 space-y-1">
                        <div className="flex justify-between text-slate-400 font-bold text-xs">
                          <span>📦 v1.5.0 —— 【好运骰子跑团版】</span>
                          <span className="text-slate-500 font-sans">2026-04</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          - 引入动态 D20 三维骰子动效，关键关隘需要力量、魅力、运气属性进行难度扔骰竞争。<br />
                          - 集成物品背包增减状态和多结局判定机制。<br />
                          - 原生 Web Audio API 电子效果音，打字机节奏微调。
                        </p>
                      </div>

                      <div className="border-l-2 border-slate-700 pl-3 py-1 space-y-1">
                        <div className="flex justify-between text-slate-400 font-bold text-xs">
                          <span>🐣 v1.0.0 —— 【起点先锋版本】</span>
                          <span className="text-slate-500 font-sans">2026-02</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          - 文字跑团游戏初版，带有五大世界设定与初始多分支跑团剧本组件。
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={() => setShowReadmeModal(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition border border-slate-700 focus:outline-none"
                >
                  好的，开始我的异界物语
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
