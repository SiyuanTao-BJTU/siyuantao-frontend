<script setup>
import { ref } from 'vue'
import { useI18n } from "vue-i18n";

import RegisterBlock from '@/components/login/RegisterBlock.vue'
import LoginBlock from '@/components/login/LoginBlock.vue'

// 组件全局变量定义
const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
let slide_tip = false // 用于切换登录和注册表单的滑动提示
let ref_style = ref({
  transform: 'translateX(0%)'
}) // 登录和注册表单的样式
let show_change = ref(false) // 控制登录和注册表单的显示隐藏
let loading_tip = ref(false) // 控制登录和注册表单的加载提示

// 组件全局函数定义
function loading_seconds(seconds) {
  /**
   * 控制加载提示的显示时间
   * @param {number} seconds 显示时间，单位为秒
   */
  setTimeout(function () {
    loading_tip.value = false
  }, seconds * 1000);
}

function waiting_change(seconds) {
  /**
   * 控制登录和注册表单的显示时间
   * @param {number} seconds 显示时间，单位为秒
   */
  setTimeout(function () {
    show_change.value = !show_change.value
  }, seconds * 1000)
}

const change_style = () => {
  /**
   * 控制登录和注册表单的切换
   */
  loading_tip.value = true
  waiting_change(0.2)
  slide_tip = !slide_tip
  ref_style.value.transform = slide_tip ? 'translateX(80%)' : 'translateX(0%)'
  loading_seconds(0.4)
}

const handleRegisterSuccess = () => {
  /**
   * 注册成功后的回调函数，用于切换到登录表单
   */
  change_style();
}
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <div class="slogan-container">
        <!-- 标语展示板块 -->
        <div class="slogan">Buy or sell second-hand goods</div>
        <div class="slogan">Go on GoodsExchange!!!!!!!!!!</div>
      </div>
      <div class="functional-container">
        <!-- 登录和注册板块 -->
        <div class="form-box" :style="ref_style" v-loading=loading_tip element-loading-background="#83A7EA">
          <div class="register-box" v-show=show_change>
            <h1>register</h1>
            <RegisterBlock @registerSuccess="handleRegisterSuccess"/>
          </div>
          <div class="login-box" v-show=!show_change>
            <h1>login</h1>
            <LoginBlock />
          </div>
        </div>
        <!-- 左右显示内容 - 左 -->
        <div class="con-box left">
          <h2>{{ t("login.welcome") }}
            <div><span>{{ t("login.website_name") }}</span></div>
          </h2>
          <p> </p>
          <img src="@\assets\login.png" alt="Login Pic" height="150" width="200">
          <p>{{ t("login.has_account") }}</p>
          <button id="login" @click="change_style">{{ t("login.go_login") }}</button>
        </div>
        <!-- 左右显示内容 - 右 -->
        <div class="con-box right">
          <h2>{{ t("login.welcome") }}
            <div><span>{{ t("login.website_name") }}</span></div>
          </h2>
          <p> </p>
          <img src="@\assets\login.png" alt="Login Pic" height="150" width="200">
          <p>{{ t("login.no_account") }}</p>
          <button id="register" @click="change_style">{{ t("login.go_register") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #CAD9F1;
}

.slogan-container {
  display: flex;
  flex-direction: column;
  margin: auto 5% auto auto;
}

.slogan {
  font-size: 29px;
  font-weight: bold;
  margin-bottom: 20px;
  background: #8e9aaf;
  background-clip: text;
  color: transparent;
  text-align: center;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

/* 定义渐变颜色的动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.center-container{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #CAD9F1;
  max-width: 1200px;
  min-width: 1200px;
}

.functional-container {
  background-color: #ffffff;
  margin: 10% auto auto 5%;
  min-width: 650px;
  height: 415px;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.slogan-container {
  margin: 10% auto auto 5%;
  width: 550px;
  height: 415px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.form-box {
  position: absolute;
  top: -10%;
  left: 5%;
  background-color: #83A7EA;
  width: 320px;
  height: 500px;
  border-radius: 5px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: 0.5s ease-in-out;
}


.register-box,
.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 25px;
  text-transform: uppercase;
  color: #fff;
  letter-spacing: 5px;
}

.con-box {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.con-box.left {
  left: -2%;
}

.con-box.right {
  right: -2%;
}

.con-box h2 {
  color: #8e9aaf;
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 4px;
}

.con-box p {
  font-size: 12px;
  letter-spacing: 2px;
  color: #8e9aaf;
  text-align: center;
}

.con-box span {
  color: #83A7EA;
}

.con-box img {
  width: 150px;
  height: 150px;
  opacity: 0.9;
  margin: 40px 0;
}

.con-box button {
  margin-top: 3%;
  background-color: #fff;
  color: #83A7EA;
  border: 1px solid #83A7EA;
  padding: 6px 10px;
  border-radius: 5px;
  letter-spacing: 1px;
  outline: none;
  cursor: pointer;
}

.con-box button:hover {
  background-color: #83A7EA;
  color: #fff;
}
</style>