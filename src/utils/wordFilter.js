/**
 * 自定义词汇过滤器
 * 支持多种过滤类型、策略和自定义配置
 */

const filterConfig = require('../config/filterConfig');

class WordFilter {
  constructor(options = {}) {
    // 合并默认配置和用户配置
    this.config = {
      ...filterConfig.defaultSettings,
      ...options
    };

    // 当前使用的预设
    this.currentPreset = options.preset || 'moderate';

    // 应用预设配置
    if (options.preset && filterConfig.presets[options.preset]) {
      this.applyPreset(options.preset);
    }

    // 初始化禁词列表
    this.initializeFilters();
    
    // 加载白名单
    this.whitelist = new Set(filterConfig.whitelist);
    
    // 特殊规则配置
    this.specialRules = filterConfig.specialRules;
  }

  /**
   * 应用预定义的过滤方案
   * @param {string} presetName - 预设名称
   */
  applyPreset(presetName) {
    const preset = filterConfig.presets[presetName];
    if (preset) {
      this.config = {
        ...this.config,
        strategy: preset.strategy,
        enabledCategories: preset.enabledCategories
      };
      this.currentPreset = presetName;
    }
  }

  /**
   * 从配置文件初始化各种类型的过滤器
   */
  initializeFilters() {
    this.filters = {};
    
    // 从配置文件加载禁词列表
    Object.keys(filterConfig.wordLists).forEach(category => {
      this.filters[category] = [];
      
      // 合并各子类别的词汇
      const categoryData = filterConfig.wordLists[category];
      Object.keys(categoryData).forEach(subCategory => {
        if (Array.isArray(categoryData[subCategory])) {
          this.filters[category].push(...categoryData[subCategory]);
        }
      });
    });

    // 编译正则表达式以提高性能
    this.compiledPatterns = {};
    this.compilePatterns();
  }

  /**
   * 编译正则表达式模式
   */
  compilePatterns() {
    Object.keys(this.filters).forEach(category => {
      const words = this.filters[category];
      if (words.length > 0) {
        // 转义特殊字符并创建正则表达式
        const escapedWords = words.map(word => 
          word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        );
        
        const pattern = this.config.partialMatch 
          ? `(${escapedWords.join('|')})` 
          : `\\b(${escapedWords.join('|')})\\b`;
        
        const flags = this.config.caseSensitive ? 'g' : 'gi';
        this.compiledPatterns[category] = new RegExp(pattern, flags);
      }
    });
  }

  /**
   * 检查是否在白名单中
   * @param {string} text - 要检查的文本
   * @returns {boolean} 是否在白名单中
   */
  isWhitelisted(text) {
    const lowerText = text.toLowerCase();
    // 检查完整文本是否在白名单中
    if (this.whitelist.has(lowerText)) {
      return true;
    }
    // 检查文本中是否包含白名单词汇
    for (const whitelistWord of this.whitelist) {
      if (lowerText.includes(whitelistWord)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查特殊规则
   * @param {string} text - 要检查的文本
   * @returns {Object} 特殊规则检查结果
   */
  checkSpecialRules(text) {
    const issues = [];

    // 检查重复字符
    const repeatPattern = /(.)\1{4,}/g;
    if (repeatPattern.test(text)) {
      issues.push('excessive_repeat_chars');
    }

    // 检查大写字母比例
    const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[A-Za-z]/g) || []).length;
    if (letterCount > 0 && (uppercaseCount / letterCount) * 100 > this.specialRules.capsLimitPercentage) {
      issues.push('excessive_caps');
    }

    // 检查连续标点符号
    const punctuationPattern = /[!@#$%^&*(),.?":{}|<>]{5,}/g;
    if (punctuationPattern.test(text)) {
      issues.push('excessive_punctuation');
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  }

  /**
   * 添加自定义禁词
   * @param {string} category - 禁词类别
   * @param {string|string[]} words - 要添加的词汇
   */
  addWords(category, words) {
    if (!this.filters[category]) {
      this.filters[category] = [];
    }
    
    const wordsArray = Array.isArray(words) ? words : [words];
    this.filters[category].push(...wordsArray);
    
    // 重新编译模式
    this.compilePatterns();
  }

  /**
   * 移除禁词
   * @param {string} category - 禁词类别
   * @param {string|string[]} words - 要移除的词汇
   */
  removeWords(category, words) {
    if (!this.filters[category]) return;
    
    const wordsArray = Array.isArray(words) ? words : [words];
    wordsArray.forEach(word => {
      const index = this.filters[category].indexOf(word);
      if (index > -1) {
        this.filters[category].splice(index, 1);
      }
    });
    
    // 重新编译模式
    this.compilePatterns();
  }

  /**
   * 添加到白名单
   * @param {string|string[]} words - 要添加到白名单的词汇
   */
  addToWhitelist(words) {
    const wordsArray = Array.isArray(words) ? words : [words];
    wordsArray.forEach(word => this.whitelist.add(word.toLowerCase()));
  }

  /**
   * 从白名单移除
   * @param {string|string[]} words - 要从白名单移除的词汇
   */
  removeFromWhitelist(words) {
    const wordsArray = Array.isArray(words) ? words : [words];
    wordsArray.forEach(word => this.whitelist.delete(word.toLowerCase()));
  }

  /**
   * 检查文本是否包含禁词
   * @param {string} text - 要检查的文本
   * @param {string[]} categories - 要检查的类别，默认使用启用的类别
   * @returns {Object} 检查结果
   */
  check(text, categories = null) {
    const result = {
      isFiltered: false,
      filteredCategories: [],
      matches: {},
      filteredText: text,
      specialRuleViolations: [],
      severity: 'none' // 'none' | 'low' | 'medium' | 'high'
    };

    // 如果文本在白名单中，直接返回
    if (this.isWhitelisted(text)) {
      return result;
    }

    // 检查特殊规则
    const specialRuleCheck = this.checkSpecialRules(text);
    if (specialRuleCheck.hasIssues) {
      result.specialRuleViolations = specialRuleCheck.issues;
      result.isFiltered = true;
      result.severity = 'low';
    }

    // 确定要检查的类别
    const categoriesToCheck = categories || this.config.enabledCategories || Object.keys(this.filters);

    // 检查禁词
    categoriesToCheck.forEach(category => {
      if (this.compiledPatterns[category]) {
        const matches = text.match(this.compiledPatterns[category]);
        if (matches) {
          // 过滤掉白名单中的匹配项
          const filteredMatches = matches.filter(match => !this.isWhitelisted(match));
          
          if (filteredMatches.length > 0) {
            result.isFiltered = true;
            result.filteredCategories.push(category);
            result.matches[category] = [...new Set(filteredMatches)]; // 去重
            
            // 设置严重程度
            if (category === 'hate' || category === 'inappropriate') {
              result.severity = 'high';
            } else if (category === 'profanity' || category === 'political') {
              result.severity = result.severity === 'high' ? 'high' : 'medium';
            } else if (result.severity === 'none') {
              result.severity = 'low';
            }
          }
        }
      }
    });

    // 根据策略处理文本
    if (result.isFiltered) {
      result.filteredText = this.applyFilterStrategy(text, categoriesToCheck);
    }

    return result;
  }

  /**
   * 应用过滤策略
   * @param {string} text - 原始文本
   * @param {string[]} categories - 要过滤的类别
   * @returns {string} 处理后的文本
   */
  applyFilterStrategy(text, categories) {
    let filteredText = text;

    categories.forEach(category => {
      if (this.compiledPatterns[category]) {
        switch (this.config.strategy) {
          case 'replace':
            filteredText = filteredText.replace(
              this.compiledPatterns[category], 
              (match) => {
                // 检查是否在白名单中
                if (this.isWhitelisted(match)) {
                  return match;
                }
                return this.config.replaceChar.repeat(match.length);
              }
            );
            break;
          case 'block':
            // 对于 block 策略，返回原始文本，由调用者决定如何处理
            break;
          case 'warn':
            // 对于 warn 策略，在文本前添加警告标记
            if (this.compiledPatterns[category].test(text)) {
              filteredText = `[CONTENT WARNING] ${filteredText}`;
            }
            break;
        }
      }
    });

    return filteredText;
  }

  /**
   * 快速检查是否包含任何禁词
   * @param {string} text - 要检查的文本
   * @param {string[]} categories - 要检查的类别
   * @returns {boolean} 是否包含禁词
   */
  isProfane(text, categories = null) {
    return this.check(text, categories).isFiltered;
  }

  /**
   * 获取过滤统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      currentPreset: this.currentPreset,
      totalCategories: Object.keys(this.filters).length,
      enabledCategories: this.config.enabledCategories,
      wordCounts: Object.keys(this.filters).reduce((acc, category) => {
        acc[category] = this.filters[category].length;
        return acc;
      }, {}),
      whitelistSize: this.whitelist.size,
      config: { ...this.config }
    };
  }

  /**
   * 设置配置
   * @param {Object} newConfig - 新配置
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.compilePatterns(); // 重新编译模式
  }

  /**
   * 获取可用的预设
   * @returns {Object} 预设列表及其描述
   */
  getAvailablePresets() {
    return Object.keys(filterConfig.presets).reduce((acc, presetName) => {
      acc[presetName] = {
        description: filterConfig.presets[presetName].description,
        strategy: filterConfig.presets[presetName].strategy,
        strictness: filterConfig.presets[presetName].strictness
      };
      return acc;
    }, {});
  }
}

module.exports = WordFilter; 