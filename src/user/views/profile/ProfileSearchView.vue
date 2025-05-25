<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import {computed, onMounted, ref} from "vue";
  import api from '@/API_PRO.js'; // 导入新的 API 服务
  import {Sell, ShoppingTrolley, User, Lock, Setting, Refresh, Download, Delete} from "@element-plus/icons-vue";
  import PersonalData from "@/user/components/PersonalData.vue";
  import PurchaseInfo from "@/user/components/PurchaseInfo.vue";
  import SaleInfo from "@/user/components/SaleInfo.vue";
  import PasswordDialog from "@/user/components/PasswordDialog.vue";
  import SettingsDialog from "@/user/components/SettingsDialog.vue";
  import WebSocketService from "@/socket_client/socket.js";
  import {ElMessage} from "element-plus";

  // 全局变量定义
  const host_username = ref('');
  const search_username = ref('');

  let username = ref("");
  let email = ref("");
  let student_id = ref("");
  let contact = ref("");
  let facauty = ref(""); // 院系
  let database_id = ref(0);
  let dormitory = ref("");
  let avatar_char = computed(() => username.value.slice(0, 2).toUpperCase());
  let email_shown = computed(
      () => ((email.value === "") || (email.value === null)) ? "未填写" : email.value
  );
  let dormitory_shown = computed(
      () => ((dormitory.value === "") || (dormitory.value === null)) ? "未填写" : dormitory.value
  );
  const MODE = process.env.NODE_ENV; // 获取当前环境
  let activeIndex = ref("1"); // 控制显示的内容，初始化为个人数据页面
  let componentKey = ref(0); // 用于强制刷新子组件
  let settingsDialogVisible = ref(false); // 控制设置对话框的显示
  const route = useRoute();
  const router = useRouter();

  // 组件全局函数定义
  onMounted(() => {
    host_username.value = localStorage.getItem('username');
    search_username.value = route.params.username;

    if (host_username.value === search_username.value) {
      router.push('/profile');
      return; // Return early if redirecting
    }

    api.getUserProfile(search_username.value)
      .then(data => {
        database_id.value = data.id;
        username.value = data.username;
        email.value = data.email;
        if (data.profile) {
          student_id.value = data.profile.student_id;
          contact.value = data.profile.contact;
          facauty.value = data.profile.facauty;
          dormitory.value = data.profile.dormitory;
        } else {
          // Handle case where profile might be null or undefined
          student_id.value = "";
          contact.value = "";
          facauty.value = "";
          dormitory.value = "";
        }
      })
      .catch(error => {
        console.warn("获取用户信息失败 ProfileSearch:", error);
        ElMessage.error('获取用户信息失败'); // Add to i18n
        // Redirect to a safe page or show a user not found message
        router.push('/home'); 
      })
      .finally(() => {
        componentKey.value += 1;
      });
  });

  const handleSelect = (key) => {
    activeIndex.value = key[0];
  }

  const onUpdateSuccess = (updateData) => {
    username.value = updateData.username;
    email.value = updateData.email;
    student_id.value = updateData.student_id;
    contact.value = updateData.contact;
    facauty.value = updateData.facauty;
    dormitory.value = updateData.dormitory;
    componentKey.value += 1;
  }

  const checkFileAvailable = async (fileURL) => {
    try {
      const res = await fetch(fileURL, {
        method: 'HEAD'
      });
      if (res.ok) {
        window.location.href = fileURL;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  const handleOtherSelect = (key) => {
    if (key[0] === "1") {
      passwordDialogVisible.value = true;
    }
    else if (key[0] === "2") {
      // 退出登录
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      WebSocketService.close();
      router.push('/login');
    }
    else if (key[0] === "3") {
      const fileURL = "/app/Goods Exchange Setup 0.0.0.exe";
      if (!checkFileAvailable(fileURL)) {
        ElMessage.warning('下载失败');
      }
    }
    else if (key[0] === "9") {
      locale.value = (locale.value === "zh") ? "en" : "zh";
    }
    componentKey.value += 1;
  }
</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <div class="bottom-container">
        <div class="left-container">
          <div class="avatar-info">
            <el-avatar :size="100" shape="square" class="avatar">{{avatar_char}}</el-avatar>
            <h3>{{username}}</h3>
          </div>
          <div class="personal-info">
            <h4>个人信息</h4>
            <div class="info-block">
              <div class="info-column">
                <p><b>用户名</b>: {{username}}</p>
                <p><b>邮箱</b>: {{email_shown}}</p>
                <p><b>宿舍</b>: {{dormitory_shown}}</p>
              </div>
            </div>
          </div>
          <div class="selector-container">
            <h4>更多信息</h4>
            <el-menu
                default-active="1"
                class="el-menu-vertical"
                @select="handleSelect"
            >
              <el-menu-item index="1">
                <el-icon><User /></el-icon>
                <span>个人数据</span>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="other-container">
            <h4>设置</h4>
            <el-menu
                class="el-menu-vertical"
                @select="handleOtherSelect"
            >
              <el-menu-item index="2">
                <el-icon><Delete /></el-icon>
                <span>退出登录</span>
              </el-menu-item>
              <el-menu-item index="3" v-if="MODE !== 'desktop'">
                <el-icon><Download /></el-icon>
                <span>下载桌面应用</span>
              </el-menu-item>
              <el-menu-item index="9">
                <el-icon><Refresh /></el-icon>
                <span>切换语言</span>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
        <div></div>
        <div class="right-container">
          <div v-if="activeIndex === '1'" class="active-block">
            <PersonalData
                :database_id="database_id"
                :username="username"
                :contact="contact"
                :student_id="student_id"
                :facauty="facauty"
                :email="email"
                :dormitory="dormitory"
                :key="componentKey"
                :is-searching="true"
                @updateSuccess="onUpdateSuccess"
            />
          </div>
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
  height: 1000px;
  background-color: #CAD9F1;
}

.center-container{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  max-width: 1200px;
  min-width: 1200px;
  margin-top: 50px;
}

.avatar-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: 10px;
}

.avatar-info::after {
  content: "";
  display: block;
  width: 90%;
  height: 1px;
  background-color: #969494;
  margin-top: 20px;
}


.avatar {
  font-size: 40px;
  background-color: #79b7f8;
  color: #ffffff;
}

h3 {
  font-size: 32px;
  font-weight: bold;
}

h4 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-top: 20px;
  margin-left: 10px;
}

.personal-info {
  width: 100%;
}

.personal-info::after {
  content: "";
  display: block;
  width: 90%;
  height: 1px;
  background-color: #969494;
  margin-top: 20px;
  margin-left: 5%;
}

.selector-container::after {
  content: "";
  display: block;
  width: 90%;
  height: 1px;
  background-color: #969494;
  margin-top: 20px;
  margin-left: 5%;
}

.info-block {
  margin-left: 10px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.info-column {
  font-size: 16px;
  color: #333333;
}

.info-column p b{
  font-weight: bold !important;
}

.bottom-container {
  display: grid;
  grid-template-columns: 25% 2% 73%;
  width: 100%;
  height: 900px;
}

.left-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.right-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.selector-container {
  margin-top: 20px;
  width: 100%;
}

.right-container .active-block {
  width: 100%;
  height: 100%;
}

.other-container {
  margin-top: 20px;
  width: 100%;
}
</style>
