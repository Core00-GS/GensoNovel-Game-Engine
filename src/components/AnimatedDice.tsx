/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerStats, PlayerStatName } from '../types';

interface AnimatedDiceProps {
  statName: PlayerStatName;
  difficulty: number;
  playerStats: PlayerStats;
  onComplete: (isSuccess: boolean) => void;
  onCancel?: () => void;
}

export const AnimatedDice: React.FC<AnimatedDiceProps> = ({
  statName,
  difficulty,
  playerStats,
  onComplete,
  onCancel,
}) => {
  const [rolling, setRolling] = useState(true);
  const [currentFace, setCurrentFace] = useState(20);
  const [rolledValue, setRolledValue] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  // Map stat names to Chinese labels
  const statLabelMap: Record<PlayerStatName, string> = {
    hp: '❤️ 生命值',
    mp: '🔮 魔法/脑力',
    gold: '💰 金币',
    strength: '⚔️ 力量值',
    charisma: '🌟 魅力值',
    luck: '🍀 运气值',
  };

  const currentStatValue = playerStats[statName] || 0;
  // Modifier is calculated as Math.floor((stat - 10) / 2) (classic RPG style) or straight value.
  // Let's make it a flat bonus based on the stat value: e.g. Math.floor(statValue / 2) to give nice tangible values
  const statModifier = Math.floor(currentStatValue / 3);

  // Web Audio Synth for retro mechanical dice ticks!
  const playTickSound = (dur = 0.05, freq = 600) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (e) {
      // Audio fallback is silent
    }
  };

  const playOutcomeSound = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      if (success) {
        // Success Fanfare: Arpeggio
        const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        tones.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.1, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.33);
        });
      } else {
        // Failure: Sad downward slid
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {}
  };

  // Roll handling loop
  useEffect(() => {
    let tickCount = 0;
    const maxTicks = 18;
    let timeoutId: any;

    const rollTick = () => {
      if (tickCount < maxTicks) {
        const tempVal = Math.floor(Math.random() * 20) + 1;
        setCurrentFace(tempVal);
        
        // Slower clicks over time
        const delay = 50 + (tickCount * tickCount * 1.5);
        playTickSound(0.04, 400 + tempVal * 20);
        
        tickCount++;
        timeoutId = setTimeout(rollTick, delay);
      } else {
        // Final roll result
        const finalVal = Math.floor(Math.random() * 20) + 1;
        setCurrentFace(finalVal);
        setRolledValue(finalVal);
        setRolling(false);
        setCompleted(true);

        const total = finalVal + statModifier;
        const reachedSuccess = total >= difficulty;
        playOutcomeSound(reachedSuccess);
      }
    };

    timeoutId = setTimeout(rollTick, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const totalValue = (rolledValue || 0) + statModifier;
  const isSuccess = totalValue >= difficulty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        className="w-full max-w-md bg-slate-900 border-2 border-purple-500/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] text-center relative overflow-hidden"
      >
        {/* Futuristic Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300">
            📊 命运抉择 · 骰子挑战
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-6 font-mono">
            DC (难度系数): <span className="text-pink-400 font-bold">{difficulty}</span> · 判定特质: {statLabelMap[statName]}
          </p>

          {/* D20 Visual Display Component */}
          <div className="my-8 flex justify-center">
            <motion.div
              animate={rolling ? {
                rotate: [0, 360, 720],
                scale: [1, 1.15, 1],
                y: [0, -10, 0]
              } : {
                scale: isSuccess ? [1, 1.2, 1] : 1,
                rotateY: isSuccess ? 360 : 0
              }}
              transition={rolling ? {
                duration: 1.5,
                ease: "easeOut"
              } : {
                duration: 0.5
              }}
              className="relative w-32 h-32 flex items-center justify-center hover:cursor-pointer select-none"
            >
              {/* D20 SVG Drawing */}
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                {/* 20-sided polygon backdrop */}
                <polygon
                  points="50,5 93,30 93,70 50,95 7,70 7,30"
                  fill={rolling ? "#3B0764" : isSuccess ? "#042F1A" : "#450A0A"}
                  stroke={rolling ? "#A855F7" : isSuccess ? "#10B981" : "#EF4444"}
                  strokeWidth="3.5"
                />
                
                {/* Inner facets */}
                <polygon points="50,5 50,42 93,30" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="50,5 50,42 7,30" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="7,30 50,42 28,70" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="93,30 50,42 72,70" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="50,42 28,70 72,70" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="28,70 50,95 72,70" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="7,70 28,70 50,95" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
                <polygon points="93,70 72,70 50,95" fill="none" stroke={rolling ? "#C084FC" : isSuccess ? "#34D399" : "#F87171"} strokeWidth="1.5" />
              </svg>

              {/* Number overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                  rolling ? 'text-purple-300' : isSuccess ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {currentFace}
                </span>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!completed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-300 text-sm font-mono h-20 flex items-center justify-center animate-pulse"
              >
                🔮 正在接受世界意识判定中...
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Result Math block */}
                <div className="bg-slate-950/80 rounded-xl p-3 inline-block border border-slate-800">
                  <div className="text-slate-400 text-xs font-mono">
                    计算公式: <span className="text-purple-300">{rolledValue} (D20)</span> + <span className="text-cyan-400">{statModifier} (属性加成)</span>
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-slate-100 font-mono">
                    最终总数值 = {totalValue}{' '}
                    <span className="text-sm font-medium text-slate-400">
                      ({totalValue >= difficulty ? '≥' : '<'} {difficulty})
                    </span>
                  </div>
                </div>

                {/* Success or failure stamp */}
                <div className="py-2">
                  {isSuccess ? (
                    <div className="text-2xl font-black text-emerald-400 tracking-wide filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      ✨ 判定成功 (SUCCESS) ✨
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-rose-500 tracking-wide filter drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                      💀 判定失败 (FAILURE) 💀
                    </div>
                  )}
                </div>

                {/* Next route action button */}
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => onComplete(isSuccess)}
                    id="dice_continue_btn"
                    className={`px-6 py-2.5 rounded-xl font-bold tracking-wide shadow-lg transform transition active:scale-95 ${
                      isSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                        : 'bg-rose-700 hover:bg-rose-600 text-white shadow-rose-950/50'
                    }`}
                  >
                    继续前进
                  </button>
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-mono"
                    >
                      返回
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
