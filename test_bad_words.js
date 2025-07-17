/**
 * bad-words过滤器测试
 * 运行此脚本来测试过滤器功能
 */

const Filter = require("bad-words");

// 创建过滤器实例
const filter = new Filter();

// 添加中文禁词
filter.addWords('垃圾', '傻逼', '白痴', '混蛋', '操', '草', '妈的', '他妈的', '狗屎', '婊子', '贱人');

console.log('=== Bad Words 过滤器测试 ===\n');

// 测试消息列表
const testMessages = [
  'Hello everyone, how are you today?',
  'This is damn annoying!',
  'You are an asshole!',
  'What the hell is going on?',
  'shit',
  'fuck',
  '这真的很垃圾',
  '你是个傻逼',
  '这个人真白痴',
  'This is a normal message',
  'I love this product',
  'Have a great day!'
];

console.log('测试消息过滤结果：\n');

testMessages.forEach((message, index) => {
  const isProfane = filter.isProfane(message);
  
  console.log(`消息 ${index + 1}: "${message}"`);
  console.log(`  包含违禁词: ${isProfane ? '是' : '否'}`);
  console.log(`  ${isProfane ? '❌ 会被阻止发送' : '✅ 可以正常发送'}`);
  console.log('');
});

console.log('=== 过滤器功能说明 ===');
console.log('✅ isProfane(message) - 检查消息是否包含违禁词');
console.log('✅ addWords(...words) - 添加自定义禁词');
console.log('✅ removeWords(...words) - 移除禁词');
console.log('\n在聊天应用中，包含违禁词的消息会被阻止发送！'); 