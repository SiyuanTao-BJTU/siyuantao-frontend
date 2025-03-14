// 为Node.js 15添加node:前缀模块导入支持
const Module = require('module');
const originalRequire = Module.prototype.require;

// 拦截require调用
Module.prototype.require = function(id) {
  // 如果是使用node:前缀的模块，则去掉前缀
  if (id.startsWith('node:')) {
    return originalRequire.call(this, id.slice(5));
  }
  return originalRequire.call(this, id);
};

console.log('Node.js 兼容性脚本已加载 - 已添加对node:前缀导入的支持'); 