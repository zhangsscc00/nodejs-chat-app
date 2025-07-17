/**
 * 词汇过滤器配置文件
 * 这里定义了各种类型的禁词列表和过滤规则
 */

const filterConfig = {
  // 过滤器默认配置
  defaultSettings: {
    strategy: 'block', // 'block' | 'replace' | 'warn'
    replaceChar: '*',
    caseSensitive: false,
    partialMatch: true,
    enabledCategories: ['profanity', 'spam', 'hate', 'custom'] // 默认启用的过滤类别
  },

  // 不同环境的配置
  environments: {
    strict: {
      strategy: 'block',
      enabledCategories: ['profanity', 'political', 'spam', 'hate', 'custom']
    },
    moderate: {
      strategy: 'replace',
      enabledCategories: ['profanity', 'spam', 'hate']
    },
    lenient: {
      strategy: 'warn',
      enabledCategories: ['profanity']
    }
  },

  // 禁词列表
  wordLists: {
    // 脏话/亵渎词汇
    profanity: {
      english: [
        'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard',
        'crap', 'piss', 'bloody', 'goddamn'
      ],
      chinese: [
        '操', '草', '妈的', '傻逼', '白痴', '混蛋', '垃圾', 
        '他妈的', '狗屎', '婊子', '贱人'
      ]
    },

    // 敏感政治词汇
    political: {
      general: [
        'politics', 'government', 'election', 'vote', 'politician',
        '政治', '政府', '选举', '投票', '政客'
      ],
      sensitive: [
        // 可根据需要添加更敏感的政治词汇
      ]
    },

    // 垃圾信息/广告
    spam: {
      sales: [
        'buy now', 'click here', 'make money', 'free money', 'get rich',
        'limited time', 'act now', 'guaranteed', 'no risk'
      ],
      chinese_sales: [
        '买', '免费', '赚钱', '点击', '广告', '购买', '优惠',
        '限时', '保证', '无风险', '立即行动'
      ],
      crypto: [
        'bitcoin', 'cryptocurrency', 'trading', 'investment scam',
        '比特币', '加密货币', '投资骗局', '理财'
      ]
    },

    // 仇恨言论
    hate: {
      discrimination: [
        'racist', 'sexist', 'homophobic', 'hate', 'discrimination',
        '仇恨', '歧视', '种族', '性别歧视'
      ],
      violence: [
        'kill', 'murder', 'violence', 'hurt', 'attack',
        '杀', '暴力', '攻击', '伤害'
      ]
    },

    // 不当内容
    inappropriate: {
      sexual: [
        // 性相关的不当词汇
        'sex', 'porn', 'nude', 'xxx'
      ],
      drugs: [
        'drug', 'cocaine', 'marijuana', 'weed',
        '毒品', '大麻', '可卡因'
      ]
    },

    // 自定义禁词（用户可添加）
    custom: {
      company_specific: [
        // 公司特定的禁词
      ],
      community_rules: [
        // 社区规则相关的禁词
      ]
    }
  },

  // 白名单 - 即使匹配到禁词也允许的词汇
  whitelist: [
    'grass', // 草地 vs 草（脏话）
    'class', // 班级 vs ass
    'classic' // 经典 vs ass
  ],

  // 预定义的过滤方案
  presets: {
    family_friendly: {
      description: '家庭友好模式 - 过滤所有不当内容',
      strategy: 'replace',
      enabledCategories: ['profanity', 'hate', 'inappropriate', 'spam'],
      strictness: 'high'
    },
    
    business: {
      description: '商务模式 - 过滤垃圾信息和不当内容',
      strategy: 'block',
      enabledCategories: ['spam', 'inappropriate', 'hate'],
      strictness: 'medium'
    },
    
    casual: {
      description: '休闲模式 - 只过滤严重的不当内容',
      strategy: 'warn',
      enabledCategories: ['hate', 'inappropriate'],
      strictness: 'low'
    },

    gaming: {
      description: '游戏模式 - 允许轻微脏话但过滤仇恨言论',
      strategy: 'replace',
      enabledCategories: ['hate', 'spam'],
      strictness: 'medium'
    }
  },

  // 特殊规则
  specialRules: {
    // 重复字符检测（如：aaaaaa）
    repeatCharLimit: 5,
    
    // 大写字母过多检测（如：HELLO!!!）
    capsLimitPercentage: 70,
    
    // 连续标点符号限制
    punctuationLimit: 5,
    
    // 数字/字母比例检测（防止随机字符）
    randomTextThreshold: 0.8
  }
};

module.exports = filterConfig; 