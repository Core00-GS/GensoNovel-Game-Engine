/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameStory } from './types';

export const presetStories: GameStory[] = [
  {
    metadata: {
      id: 'isekai_fantasy',
      title: '异世界转生：魔王城的圣剑少女',
      description: '你在一道耀眼的白光中醒来，发现自己转生到了奇幻异世界阿斯加德。眼前的少女自称莉莉丝，将指引你寻找封印魔王的方法……一款包含生命、魔力、力量等数值，配合道具判定与经典RPG掷骰子冒险的奇幻文字冒险游戏。',
      author: '神乐游戏工作室 (Kagura Games)',
      themeColor: 'cyan',
      coverUrl: '', // Will fall back to dynamic or generated covers
      initialStats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 30,
        strength: 12,
        charisma: 14,
        luck: 10,
      },
      initialInventory: ['🍞 乾面包', '🪵 练习短木剑'],
    },
    nodes: {
      start: {
        id: 'start',
        title: '异界之始：生命的神殿',
        avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '“勇者大人！您终于苏醒了！”\n\n眼前是一位有着金色卷发、身穿白底金边法袍的可爱精灵祭司。她紧握着双手，湛蓝的眼睛里满是希冀。\n\n“这里是阿斯加德的心脏。魔王阿萨谢尔已经苏醒，正将黑暗笼罩大地。我们需要前往魔王塔下的远古神殿取得【✨ 圣剑艾斯特】，才能拯救这个世界。您准备好开始这段冒险了吗？”',
        choices: [
          {
            text: '🛡️ “交给我吧！出发前往森林秘境。”',
            targetNode: 'forest_entrance',
            effects: {
              stats: { strength: 1 },
            },
          },
          {
            text: '🧪 “在出发前，能用治愈魔法帮我强化一下吗？” (消耗 10 魔力)',
            targetNode: 'shrine_blessing',
            requirements: {
              stats: { mp: 10 },
            },
            effects: {
              stats: { mp: -10, hp: 20 },
              gainItems: ['🔮 祝福圣水'],
            },
          },
          {
            text: '💰 “有启动资金支援吗？异世界消费可是很贵的。”',
            targetNode: 'shrine_gold',
            requirements: {
              stats: { charisma: 12 },
            },
          },
        ],
        bgPathName: 'academy',
        bgTone: 'cyan',
      },
      shrine_blessing: {
        id: 'shrine_blessing',
        title: '女神的圣洁加护',
        avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '莉莉丝闭上双眼，吟唱着空灵的古魔法咒语。温润的白光将你包围，你感到浑身酸痛一扫而空，浑身充满生机！\n\n“这是丰收女神的礼赞。我还为您准备了一瓶秘制的【🔮 祝福圣水】，请在危急关头引用。”',
        choices: [
          {
            text: '👣 信心满满，动身进入森林。',
            targetNode: 'forest_entrance',
          },
        ],
        bgPathName: 'academy',
        bgTone: 'cyan',
      },
      shrine_gold: {
        id: 'shrine_gold',
        title: '莉莉丝的小金库',
        avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '莉莉丝精致的脸蛋红了红，有些不好意思地从怀里掏出一个绣着蕾丝的小钱袋。\n\n“呜……这是莉莉丝攒了好久的私房钱。既然勇者大人提出来了，那就分给您多一点点吧。请务必用在刀刃上！”\n\n你获得了 50 枚金币！莉莉丝对你的好感度似乎悄悄改变了。',
        choices: [
          {
            text: '🍁 接过沉甸甸的钱袋，迈入黄昏森林。',
            targetNode: 'forest_entrance',
            effects: {
              stats: { gold: 50, charisma: 1 },
            },
          },
        ],
        bgPathName: 'academy',
        bgTone: 'amber',
      },
      forest_entrance: {
        id: 'forest_entrance',
        title: '微光闪烁的黄昏森林',
        avatarName: '林间异响',
        avatarType: 'system',
        text: '高耸入云的红枫树林中，薄雾弥漫。阳光穿过叶片在泥地上洒下斑驳的光影。\n\n突然，前方的灌木丛剧烈抖动，一只体型巨大、流着涎水的【🐺 狂暴魔狼】猛地蹦了出来，挡住了你们的去路！莉莉丝惊呼一声退到你身后。',
        choices: [
          {
            text: '⚔️ 拔出练习木剑，正面迎战魔狼！',
            targetNode: 'wolf_fight',
          },
          {
            text: '🎯 潜行绕开：敏捷与运气测试 (需要 D20 运势掷骰 >= 11)',
            targetNode: 'start', // Placeholder, using roll instead
            roll: {
              stat: 'luck',
              difficulty: 11,
              successNode: 'forest_escape_success',
              failureNode: 'forest_escape_fail',
            },
          },
          {
            text: '🔥 吟唱火焰术轰击魔狼！ (消耗 15 魔力)',
            targetNode: 'wolf_fire',
            requirements: {
              stats: { mp: 15 },
            },
          },
        ],
        bgPathName: 'forest',
        bgTone: 'emerald',
      },
      wolf_fight: {
        id: 'wolf_fight',
        title: '血战狂暴魔狼',
        avatarName: '战斗反馈',
        avatarType: 'enemy',
        text: '你低喝一声，举着简陋的木剑冲了上去！魔狼嗷呜一声，锋利的狼爪夹着劲风袭来。\n\n这是一场硬碰硬的较量！你成功击杀了魔狼，但练习木剑彻底断裂开来，你的身体也多处负伤。',
        choices: [
          {
            text: '🩹 包扎伤口，打扫战场。',
            targetNode: 'forest_cleared',
            effects: {
              stats: { hp: -25, gold: 15 },
              loseItems: ['🪵 练习短木剑'],
              gainItems: ['🐺 锋利狼牙'],
            },
          },
        ],
        bgPathName: 'forest',
        bgTone: 'rose',
      },
      forest_escape_success: {
        id: 'forest_escape_success',
        title: '无声惊弦：成功潜行',
        avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '你拉起莉莉丝冰凉的手，极其轻巧地踏在松软的红枫叶上。魔狼警惕地嗅了嗅空气，却只是挠了挠耳朵，转头走向了另一侧。\n\n“呼……勇者大人太厉害了，身手像猫一样敏捷！”莉莉丝拍着胸脯松了一口气。',
        choices: [
          {
            text: '🏃 穿过林海，来到迷雾沼泽。',
            targetNode: 'swamp_base',
          },
        ],
        bgPathName: 'forest',
        bgTone: 'cyan',
      },
      forest_escape_fail: {
        id: 'forest_escape_fail',
        title: '被发现！魔狼的暴袭',
        avatarName: '狂暴魔狼',
        avatarType: 'enemy',
        text: '你的脚踩断了一根枯树枝！“咔嚓”脆响瞬间惊动了魔狼。它发出嗜血的低吼，高高跃起，一爪狠狠将你扫飞出去！\n\n危急关头，你捡起石头砸中它的眼睛，才狼狈甩开它的追击，大口咳血。',
        choices: [
          {
            text: '🩸 捂着伤口，互相搀扶着逃向沼泽。',
            targetNode: 'swamp_base',
            effects: {
              stats: { hp: -40, luck: 1 },
            },
          },
        ],
        bgPathName: 'forest',
        bgTone: 'rose',
      },
      wolf_fire: {
        id: 'wolf_fire',
        title: '真红爆炎：魔法一击',
        avatarName: '魔法反馈',
        avatarType: 'hero',
        text: '你举起右手，集中精神，调用体内的玛那。一颗炽热无比的火球瞬间在掌心汇聚，轰然射出！\n\n火光撕裂黑暗，魔狼避无可避，在火焰中化为焦炭。空气中弥漫着烤肉的气味。',
        choices: [
          {
            text: '✨ 拾取晶石，保持状态前进。',
            targetNode: 'forest_cleared',
            effects: {
              stats: { mp: -15, gold: 30 },
              gainItems: ['💎 微光晶石'],
            },
          },
        ],
        bgPathName: 'forest',
        bgTone: 'purple',
      },
      forest_cleared: {
        id: 'forest_cleared',
        title: '战役落幕与旅行商人',
        avatarName: '可可 (Coco)',
        avatarType: 'merchant',
        text: '战胜魔狼后，林中的大雾明朗了一些。小道旁站着一个戴着巨大遮阳帽、尾巴一甩一甩的可爱猫耳少女商人。\n\n“喵呜！厉害的旅行者，你要来买点好东西喵？本喵这里绝无假货，假一罚十喵！”',
        choices: [
          {
            text: '精钢剑 (💰 40 金币) —— 获得强大战力 (+4力量)',
            targetNode: 'merchant_buy_sword',
            requirements: {
              stats: { gold: 40 },
            },
            effects: {
              stats: { gold: -40, strength: 4 },
              gainItems: ['🗡️ 精钢长剑'],
            },
          },
          {
            text: '神圣红茶 (💰 20 金币) —— 补满生命值 (+60HP)',
            targetNode: 'merchant_buy_tea',
            requirements: {
              stats: { gold: 20 },
            },
            effects: {
              stats: { gold: -20, hp: 60 },
            },
          },
          {
            text: '👋 “不买了，我们还要赶路。拜拜！”',
            targetNode: 'swamp_base',
          },
        ],
        bgPathName: 'town',
        bgTone: 'amber',
      },
      merchant_buy_sword: {
        id: 'merchant_buy_sword',
        title: '猫娘的可信交易',
        avatarName: '可可 (Coco)',
        avatarType: 'merchant',
        text: '“成交喵！这把【🗡️ 精钢长剑】可是用矮人铁砧打造的，绝对能砍碎魔物的脑袋，祝勇者大人旗开得胜！”\n\n你紧握剑柄，感受到其中流淌的力量。',
        choices: [
          {
            text: '🌿 挥舞佩剑，斗志高昂地挺进沼泽。',
            targetNode: 'swamp_base',
          },
        ],
        bgPathName: 'town',
        bgTone: 'cyan',
      },
      merchant_buy_tea: {
        id: 'merchant_buy_tea',
        title: '沁人心脾的温暖红茶',
        avatarName: '可可 (Coco)',
        avatarType: 'merchant',
        text: '“给喵！常温慢熬的神圣红茶，暖胃又治愈哦～”\n\n你将红茶一饮而尽，甜丝丝的暖流淌过经脉，疲劳和红肿瞬间消退，HP大幅回满！',
        choices: [
          {
            text: '🏃 感觉状态极佳，告别猫娘前往沼泽。',
            targetNode: 'swamp_base',
          },
        ],
        bgPathName: 'town',
        bgTone: 'emerald',
      },
      swamp_base: {
        id: 'swamp_base',
        title: '骷髅环绕的迷雾沼泽',
        avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '树木渐渐稀疏，前方演变为黏糊的恶臭泥潭。阴风刺骨，天空中时不时有尖锐的亡灵尖啸划过。\n\n“勇者大人，看！前面就是破败的魔王塔遗迹入口了。但是……门前游荡着一队手握锈刃的【💀 骷髅卫兵】，它们似乎在守护着一柄插入巨石中的闪光宝剑！”\n\n那正是【✨ 圣剑艾斯特】。',
        choices: [
          {
            text: '🤺 手握长剑正门突破！：力量与武艺对抗 (需要力量值 >= 15 或 拥有 🗡️ 精钢长剑)',
            targetNode: 'boss_fight_direct',
            requirements: {
              stats: { strength: 12 }, // Must have basic strength, but let\'s check sword item
            },
          },
          {
            text: '⭐ 洒下【🔮 祝福圣水】瓦解骷髅群！',
            targetNode: 'boss_fight_holy',
            requirements: {
              items: ['🔮 祝福圣水'],
            },
            effects: {
              loseItems: ['🔮 祝福圣水'],
            },
          },
          {
            text: '⚡ 用魔力施展雷电奇袭卫兵！ (消耗 20 魔力)',
            targetNode: 'boss_fight_lightning',
            requirements: {
              stats: { mp: 20 },
            },
            effects: {
              stats: { mp: -20 },
            },
          },
        ],
        bgPathName: 'cave',
        bgTone: 'purple',
      },
      boss_fight_direct: {
        id: 'boss_fight_direct',
        title: '正义的斩击：物理压制',
        avatarName: '战斗结果',
        avatarType: 'hero',
        text: '你怒吼一声，长剑划出一道炫目的银色弧光！骷髅兵干瘪的骨架在强大的力量冲击下支离破碎，你干净利落地料理了这群亡灵。\n\n你来到了石台前，终于，【✨ 圣剑艾斯特】正散发着金色微光等待着属于它的主人。',
        choices: [
          {
            text: '🗡️ 拔出圣剑，宣告异世界的拯救！',
            targetNode: 'ending_victory',
            effects: {
              gainItems: ['✨ 圣剑艾斯特'],
            },
          },
        ],
        bgPathName: 'dungeon',
        bgTone: 'cyan',
      },
      boss_fight_holy: {
        id: 'boss_fight_holy',
        title: '圣洁破邪：神圣瓦解',
        avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '你拔出水晶瓶，将净化神圣之水洒在天空中。莉莉丝吟唱吟诵，化暴雨倾盆。圣水落在骷髅身上，立刻激起白烟，亡灵痛苦尖叫着化为一滩滩无害的沙土。\n\n“太顺利了！不愧是圣水。勇者大人，圣剑在呼唤你！”',
        choices: [
          {
            text: '👑 握住圣剑之柄，迎接胜利黎明。',
            targetNode: 'ending_victory',
            effects: {
              gainItems: ['✨ 圣剑艾斯特'],
            },
          },
        ],
        bgPathName: 'dungeon',
        bgTone: 'emerald',
      },
      boss_fight_lightning: {
        id: 'boss_fight_lightning',
        title: '神伐之雷：毁灭打击',
        avatarName: '雷电冲击',
        avatarType: 'system',
        text: '狂妄暴躁的湛蓝色雷弧从指尖迸发，横扫荒野！雷电瞬间灌入骷髅生锈的胸甲里将其全部炸飞。但狂暴的反震也让你的体力大受折损。',
        choices: [
          {
            text: '🗡️ 咳着血，坚毅地拔出巨石底座上的圣剑。',
            targetNode: 'ending_victory',
            effects: {
              stats: { hp: -15 },
              gainItems: ['✨ 圣剑艾斯特'],
            },
          },
        ],
        bgPathName: 'dungeon',
        bgTone: 'purple',
      },
      ending_victory: {
        id: 'ending_victory',
        title: '【终章：传说的光辉】',
         avatarName: '莉莉丝 (Lilith)',
        avatarType: 'partner',
        text: '当你双手握住闪亮的【✨ 圣剑艾斯特】时，一道直冲云霄的金色圣光结界悍然砸下！将四周的沼泽之雾驱散殆尽，天空重获光明。\n\n莉莉丝崇拜地向你献上最高的敬意，全大陆的人民都将吟唱勇者与圣剑的拯救之曲。阿斯加德得救了，属于你的传奇才刚刚开始！\n\n🏆 恭喜玩家：成功通关【完美结局：圣光勇者传奇】！',
        choices: [],
        bgPathName: 'academy',
        bgTone: 'cyan',
      },
      ending_death: {
        id: 'ending_death',
        title: '【终章：转生成为劣等史莱姆】',
        avatarName: '灵魂深渊',
        avatarType: 'system',
        text: '你的生命值跌落到了 0 分水岭……你的身体渐渐冰冷失重。\n\n突然，神殿主神阿忒弥斯叹了一口气：“真是没用的勇者。好吧，看在莉莉丝的份上，再给你一次重游人间的机会，但是这次……当一只没骨气的史莱姆吧！”\n\n你转生变成了一只圆滚滚、黏糊糊的【💧 蓝色小史莱姆】，跳一下就啪叽一声。虽然不能封印魔王了，但在树林里无忧无虑也挺好？\n\n🍂 通关结局：【普通结局：史莱姆的退休生活】。',
        choices: [],
        bgPathName: 'forest',
        bgTone: 'rose',
      },
    },
  },
  {
    metadata: {
      id: 'cyber_hack',
      title: '赛博极客2088：新宿黑客传奇',
      description: '霓虹闪烁的未来东京、高耸的超级大企业总部和充满赛博朋克感的新宿地下街。你是一名顶级黑客高手，今夜将潜入“荒坂科技”窃取最终机密芯片。一款考验魔力值（黑客脑力）、金币、力量与运气的科幻文字跑团。',
      author: '赛博网络制作委员会 (Cyber Net Studio)',
      themeColor: 'rose',
      coverUrl: '',
      initialStats: {
        hp: 80,
        maxHp: 80,
        mp: 80,
        maxMp: 80,
        gold: 150,
        strength: 8,
        charisma: 16,
        luck: 12,
      },
      initialInventory: ['📱 黑客特制卡套', '💾 空白数据卡'],
    },
    nodes: {
      start: {
        id: 'start',
        title: '夜幕下的新宿后巷',
        avatarName: '搭档 杰克 (Jack)',
        avatarType: 'partner',
        text: '“喂，听得到吗，雨宫？公司大楼的安保层已经在我们的计划之中了。”\n\n耳机里传来熟练的电子过滤音。你站在新宿后街，头顶是全息浮空车与连绵的酸雨。面前的防火门通往荒坂研究所的中央网络。',
        choices: [
          {
            text: '🔌 物理脑插头接入，开始深度黑客破解！ (消耗 20 脑力值)',
            targetNode: 'matrix_hacked',
            requirements: {
              stats: { mp: 20 },
            },
            effects: {
              stats: { mp: -20 },
            },
          },
          {
            text: '💳 诱骗守卫：使用植入式社交话术测试 (极佳倾听 - 魅力 >= 12)',
            targetNode: 'gate_social',
            requirements: {
              stats: { charisma: 12 },
            },
          },
          {
            text: '🥃 先去一旁的“来世”酒吧喝杯加冰伏特加 (💰 消耗 20 金币)',
            targetNode: 'bar_pregame',
            requirements: {
              stats: { gold: 20 },
            },
            effects: {
              stats: { gold: -20 },
            },
          },
        ],
        bgPathName: 'town',
        bgTone: 'rose',
      },
      bar_pregame: {
        id: 'bar_pregame',
        title: '“来世”酒吧的致死霓虹',
        avatarName: '酒保 罗格 (Rogue)',
        avatarType: 'merchant',
        text: '酒吧里播放着粗制滥造的重金属音乐。老酒保端给你一杯泛着青色微光的烈酒。\n\n“喝吧，传奇，这杯算你的，不过喝完就得去办大事了。”\n\n烈酒增加了你的义体荷尔蒙！你的HP上限和精神力得到高额恢复！',
        choices: [
          {
            text: '🛹 抹了抹嘴，擦亮终端，正式迈入研究所门口。',
            targetNode: 'start',
            effects: {
              stats: { hp: 20, mp: 30, luck: 2 },
            },
          },
        ],
        bgPathName: 'town',
        bgTone: 'purple',
      },
      matrix_hacked: {
        id: 'matrix_hacked',
        title: '数字母体：霓虹冰流',
        avatarName: '超频警报',
        avatarType: 'system',
        text: '你的瞳孔瞬间被闪烁的青绿色代码流盖满。意识漂浮在无限的代码空间中。你迅速越过了外围两道红外防火墙！\n\n但警报代码开始捕获你的IP。你必须尽快决定怎么应对。',
        choices: [
          {
            text: '🔥 强行植入超量拒绝服务漏洞！ (需要黑客脑力 >= 40)',
            targetNode: 'matrix_success',
            requirements: {
              stats: { mp: 40 },
            },
          },
          {
            text: '🎲 诱骗AI定位重定向 (进行 D20 运气测试难度 12)',
            targetNode: 'start',
            roll: {
              stat: 'luck',
              difficulty: 12,
              successNode: 'matrix_success',
              failureNode: 'matrix_fail',
            },
          },
        ],
        bgPathName: 'cave',
        bgTone: 'cyan',
      },
      gate_social: {
        id: 'gate_social',
        title: '舌灿莲花的极客套话',
        avatarName: '武装警卫',
        avatarType: 'enemy',
        text: '你整了整风衣，露出一副自负的荒坂科技高级监察官做派，漫不经心地拿出伪造的电子警徽。\n\n“安保等级更新，大厅三号服务器有溢出，你们不想让部门主管明天开除你们吧？”\n\n警卫们擦了擦汗，连忙刷卡开门：“非常抱歉！监察官主管，请进！”',
        choices: [
          {
            text: '🏢 大摇大摆走进机房重地。',
            targetNode: 'core_room',
            effects: {
              stats: { luck: 1 },
              gainItems: ['🔑 安保电子红卡'],
            },
          },
        ],
        bgPathName: 'academy',
        bgTone: 'emerald',
      },
      matrix_success: {
        id: 'matrix_success',
        title: '破解完成：冰壁融化',
        avatarName: '系统回馈',
        avatarType: 'system',
        text: '“荒坂安保数据库 100% 熔断成功喵！”\n\n中控大门发出液压阀泄气的哧哧响，整排机柜失去了防御。蓝色的核心数据保险箱完全向你敞开。',
        choices: [
          {
            text: '💾 下载并封装【💾 机密芯片】！',
            targetNode: 'ending_cyber_victory',
            effects: {
              gainItems: ['💾 机密芯片'],
            },
          },
        ],
        bgPathName: 'cave',
        bgTone: 'emerald',
      },
      matrix_fail: {
        id: 'matrix_fail',
        title: '神经烧灼陷阱',
        avatarName: '黑屏警示',
        avatarType: 'system',
        text: '不好！对方使用了名为“灵魂杀手”的反侵入ICE技术！冰冷恐怖的高能脉冲瞬间通过数据脑链路逆流直击你的中枢脑神经！\n\n你惨叫一声扯下电极插头，口鼻溢血，眼球充满了血丝！',
        choices: [
          {
            text: '🩸 头痛欲裂，拿起枪寻找杰克护送逃走。',
            targetNode: 'core_room',
            effects: {
              stats: { hp: -35, mp: -30, luck: -2 },
            },
          },
        ],
        bgPathName: 'cave',
        bgTone: 'rose',
      },
      core_room: {
        id: 'core_room',
        title: '终极机房的黑寡妇',
        avatarName: '公司精锐特工',
        avatarType: 'enemy',
        text: '进入核心舱，四周冷气呼呼作响，液氮白气弥漫。突然红灯急闪，一名双臂改装有高周波螳螂刀的荒坂改造女特工在半空优雅转轴，拦截在出口！\n\n“小虫子，胆敢窃取大公司的财产？”',
        choices: [
          {
            text: '🗡️ 自负肉搏：用极寒冷兵器或者高超射击反杀 (需要力量 >= 10)',
            targetNode: 'hacker_fight_clash',
            requirements: {
              stats: { strength: 10 },
            },
          },
          {
            text: '💻 使用黑客终端超频特工身上的赛博强化脑机！ (消耗 30 脑力值)',
            targetNode: 'hacker_cyberware_melt',
            requirements: {
              stats: { mp: 30 },
            },
            effects: {
              stats: { mp: -30 },
            },
          },
        ],
        bgPathName: 'dungeon',
        bgTone: 'purple',
      },
      hacker_fight_clash: {
        id: 'hacker_fight_clash',
        title: '新宿地下格斗的反抗',
        avatarName: '特工惨叫',
        avatarType: 'enemy',
        text: '你凭借高强的爆发力，抬手拔出霰弹枪，扣动扳机近距离轰飞了特工身上的纳米防护磁盾，并将她当场重创瘫痪！\n\n高周波刀跌落在地。你拿下了战斗！',
        choices: [
          {
            text: '💾 将机密芯片拷贝出来。',
            targetNode: 'ending_cyber_victory',
            effects: {
              gainItems: ['💾 机密芯片'],
            },
          },
        ],
        bgPathName: 'dungeon',
        bgTone: 'cyan',
      },
      hacker_cyberware_melt: {
        id: 'hacker_cyberware_melt',
        title: '义体过载：脑死亡',
        avatarName: '义体火花',
        avatarType: 'system',
        text: '你敲击键盘的频率达到残影级别！“发热溢出吧，宝贝！”\n\n特工刚要跳过来，她的双眼突然喷出生理机能超负荷的焦烟，赛博眼球瞬间爆开，痛苦地捂着脑袋倒地狂抽，动弹不得。',
        choices: [
          {
            text: '💾 上传数据离开。',
            targetNode: 'ending_cyber_victory',
            effects: {
              gainItems: ['💾 机密芯片'],
            },
          },
        ],
        bgPathName: 'dungeon',
        bgTone: 'emerald',
      },
      ending_cyber_victory: {
        id: 'ending_cyber_victory',
        title: '【终章：赛博夜城的新神】',
        avatarName: '杰克 (Jack)',
        avatarType: 'partner',
        text: '“雨宫，成功了！我看到芯片数据包开始闪光了！哈哈，我们要名扬来世了！”\n\n你背靠着大楼围墙，迎风而立。拿到了价值2亿星币的荒坂绝密记忆体。杰克在霓虹闪耀的跑车里向你招手。你成为了不可阻挡的新宿黑客传奇，自由属于边缘行者！\n\n🏆 恭喜玩家：成功通关【经典赛博行者结局：名震来世】！',
        choices: [],
        bgPathName: 'town',
        bgTone: 'rose',
      },
    },
  },
];
