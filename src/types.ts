/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Types for our Text Adventure Engine

export type PlayerStatName = 'hp' | 'mp' | 'gold' | 'strength' | 'charisma' | 'luck';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  strength: number;
  charisma: number;
  luck: number;
}

export interface ChoiceRequirements {
  stats?: Partial<Record<PlayerStatName, number>>;
  items?: string[]; // Player must own these exact items
}

export interface ChoiceEffects {
  stats?: Partial<Record<PlayerStatName, number>>; // delta values (can be positive or negative)
  gainItems?: string[];
  loseItems?: string[];
}

export interface DiceRollChallenge {
  stat: PlayerStatName;
  difficulty: number; // target to equal or exceed
  successNode: string;
  failureNode: string;
}

export interface StoryChoice {
  text: string;
  targetNode: string;
  requirements?: ChoiceRequirements;
  effects?: ChoiceEffects;
  roll?: DiceRollChallenge; // Optional action challenge (RPG-style)
}

export interface StoryNode {
  id: string;
  title: string;
  avatarName?: string; // who is speaking (e.g. "莉莉丝 (Lilith)", "神秘商人", "系统提示")
  avatarType?: 'hero' | 'partner' | 'enemy' | 'merchant' | 'system' | 'custom';
  text: string; // The narration text
  choices: StoryChoice[];
  bgPathName?: string; // e.g. "academy", "forest", "dungeon", "town", "cave"
  bgTone?: string; // color tint or visual cue (e.g. "slate", "rose", "emerald")
}

export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  themeColor: 'cyan' | 'rose' | 'amber' | 'purple' | 'emerald' | 'sky';
  coverUrl?: string;
  initialStats: PlayerStats;
  initialInventory: string[];
  worldview?: string; // 世界观描述
  worldTone?: string; // 世界主基调/神话体系
  heroName?: string; // 主角默认称呼/名字
  currencyName?: string; // 货币自定义名称，例如 "金币", "原石", "铜钱"
  startingGear?: string[]; // 初始装备
}

export interface GameStory {
  metadata: GameMetadata;
  nodes: Record<string, StoryNode>;
}

// Player Context Session State
export interface PlayerSession {
  gameId: string;
  currentNodeId: string;
  stats: PlayerStats;
  inventory: string[];
  logs: Array<{
    nodeId: string;
    choiceText?: string;
    nodeTitle: string;
    timestamp: number;
  }>;
  isGameOver: boolean;
  isVictory: boolean;
}
