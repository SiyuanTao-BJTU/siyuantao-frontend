<script setup>
import { ref, computed } from 'vue'

import RegisterBlock from '@/user/components/RegisterBlock.vue'
import LoginBlock from "@/user/components/LoginBlock.vue"

// 使用一个状态来控制当前显示的是登录还是注册表单
const isLoginMode = ref(true);

// Computed property to determine the class for the container
const authContainerClass = computed(() => {
  return isLoginMode.value ? 'login-mode' : 'register-mode';
});

// 组件全局函数定义

const toggleMode = () => {
  /**
   * 控制登录和注册表单的切换
   */
  isLoginMode.value = !isLoginMode.value;
}

const handleRegisterSuccess = () => {
  /**
   * 注册成功后的回调函数，用于切换到登录表单
   */
  isLoginMode.value = true;
}
</script>

<template>
  <div class="basic-container">
    <div class="auth-split-container" :class="authContainerClass">
      <!-- 左侧面板 (登录模式显示) -->
      <div class="split-panel left-panel">
        <div class="panel-content">
          <h2>欢迎来到<br/><span>思源淘</span></h2>
          <p>没有账号？</p>
          <el-button class="panel-button" @click="toggleMode">去注册</el-button>
        </div>
      </div>

      <!-- 右侧面板 (注册模式显示) -->
      <div class="split-panel right-panel">
         <div class="panel-content">
          <h2>欢迎来到<br/><span>思源淘</span></h2>
          <p>已有账号？</p>
          <el-button class="panel-button" @click="toggleMode">去登录</el-button>
        </div>
      </div>

      <!-- 表单容器 (始终显示，但内部内容切换) -->
      <div class="form-container">
        <div v-if="isLoginMode" class="login-form-block">
          <h1>登录</h1>
          <LoginBlock />
        </div>
        <div v-else class="register-form-block">
          <h1>注册</h1>
          <RegisterBlock @registerSuccess="handleRegisterSuccess"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overall container */
.basic-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* background-color: #CAD9F1; Light blue background */
  background-color: #f5f7fa; /* 使用一个更中性的浅灰色背景 */
  padding: 20px;
  box-sizing: border-box;
}

/* Main split container */
.auth-split-container {
  background-color: #ffffff;
  width: 100%;
  max-width: 900px; /* Adjusted max-width */
  height: 550px; /* Adjusted height */
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Stronger shadow */
  display: flex;
  overflow: hidden;
  position: relative; /* Needed for absolute positioning of form container */
}

/* Left and Right Panels (for welcome text and toggle button) */
.split-panel {
  width: 40%; /* Panels take 40% */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  position: absolute;
  top: 0;
  transition: transform 0.6s ease-in-out; /* Transition only transform */
  z-index: 1; /* Below form container */
  color: #fff; /* White text for panels */
}

.left-panel {
  left: 0; /* Always positioned at left: 0 */
  /* background: linear-gradient(to right, #4A90E2, #6FA8DC); Blue gradient */
  background: linear-gradient(to right, #607d8b, #90a4ae); /* 使用一个更中性的灰色渐变 */
}

.right-panel {
  right: 0; /* Always positioned at right: 0 */
  /* background: linear-gradient(to left, #4A90E2, #6FA8DC); Blue gradient */
   background: linear-gradient(to left, #607d8b, #90a4ae); /* 使用一个更中性的灰色渐变 */
}

/* Control panel visibility based on auth-split-container class */
.auth-split-container.login-mode .left-panel {
  transform: translateX(0%); /* Visible */
}

.auth-split-container.login-mode .right-panel {
  transform: translateX(100%); /* Hidden by sliding right (moves 100% of its own width from right: 0)*/
}

.auth-split-container.register-mode .left-panel {
   transform: translateX(-100%); /* Hidden by sliding left (moves 100% of its own width from left: 0)*/
}

.auth-split-container.register-mode .right-panel {
   transform: translateX(0%); /* Visible */
}

.panel-content h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

.panel-content span {
    color: #F5A623; /* Orange accent for website name */
}

.panel-content p {
  font-size: 16px;
  margin-bottom: 25px;
}

.panel-button {
  background-color: transparent;
  color: #fff;
  border: 2px solid #fff; /* White border */
  padding: 10px 25px;
  border-radius: 25px; /* More rounded */
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.panel-button:hover {
  background-color: #fff;
  color: #4A90E2; /* Blue text on hover */
}

/* Form Container (holds Login/Register blocks) */
.form-container {
  width: 60%; /* Form area takes 60% */
  height: 100%;
  position: absolute;
  top: 0;
  /* Positioned relative to auth-split-container */
  transition: transform 0.6s ease-in-out; /* Transition only transform */
  z-index: 2; /* Above panels */
  background-color: #fff; /* White background for form area */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Control form container position based on auth-split-container class */
.auth-split-container.login-mode .form-container {
    transform: translateX(66.66%); /* Moves 66.66% of 60% width = 40% of total width, positioning it after the left panel */
    /* Simplified: moves 100% of 40% panel width from left: 0 */
    left: 0%; /* Start from left edge */
}

.auth-split-container.register-mode .form-container {
    transform: translateX(0%); /* Stays at the left */
    left: 0; /* Start from left edge */
}

.login-form-block,
.register-form-block {
  width: 80%; /* Forms take 80% of the form-container width */
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333; /* Dark text for form titles */
  font-size: 28px; /* Larger title */
}

/* Styles for LoginBlock and RegisterBlock (will be further refined in their own files) */
/* You might add some basic overrides here if needed */


</style>