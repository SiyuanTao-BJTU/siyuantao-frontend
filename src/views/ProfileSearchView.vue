<script setup>
  import { useRoute, useRouter } from 'vue-router';
  import {computed, onMounted, ref} from "vue";
  import axios from "@/axios_client/index.js";
  import { useI18n } from "vue-i18n";
  import {Sell, ShoppingTrolley, User, Lock, Setting, Refresh, Download, Delete} from "@element-plus/icons-vue";
  import PersonalData from "@/components/profile/PersonalData.vue";
  import PurchaseInfo from "@/components/profile/PurchaseInfo.vue";
  import SaleInfo from "@/components/profile/SaleInfo.vue";
  import PasswordDialog from "@/components/profile/PasswordDialog.vue";
  import SettingsDialog from "@/components/profile/SettingsDialog.vue";
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
      () => ((email.value === "") || (email.value === null)) ? t("profile.detail_none_shown") : email.value
  );
  let dormitory_shown = computed(
      () => ((dormitory.value === "") || (dormitory.value === null)) ? t("profile.detail_none_shown") : dormitory.value
  );
  const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
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
    }

    axios.get("/user/info", {
      params: {
        username: search_username.value
      }
    }).then(res => {
      if(res.status === 200){
        if (res.data.code === 0) {
          database_id.value = res.data.data.id;
          username.value = res.data.data.username;
          email.value = res.data.data.email;
          student_id.value = res.data.data.profile.student_id;
          contact.value = res.data.data.profile.contact;
          facauty.value = res.data.data.profile.facauty;
          dormitory.value = res.data.data.profile.dormitory;
        }
        else{
          console.warn("获取用户信息失败")
        }
      }
      else{
        console.warn("获取用户信息失败")
      }
      componentKey.value += 1;
    }).catch(res => {
      console.warn("获取用户信息失败")
      console.warn(res)
    })
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
        ElMessage.warning(t("profile.download_error"));
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
            <h4>{{t("profile.personal_info_title")}}</h4>
            <div class="info-block">
              <div class="info-column">
                <p><b>{{t("profile.username")}}</b>: {{username}}</p>
                <p><b>{{t("profile.email")}}</b>: {{email_shown}}</p>
                <p><b>{{t("profile.dormitory")}}</b>: {{dormitory_shown}}</p>
              </div>
            </div>
          </div>
          <div class="selector-container">
            <h4>{{t("profile.more_info_title")}}</h4>
            <el-menu
                default-active="1"
                class="el-menu-vertical"
                @select="handleSelect"
            >
              <el-menu-item index="1">
                <el-icon><User /></el-icon>
                <span>{{t("profile.personal_data")}}</span>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="other-container">
            <h4>{{t("profile.setting_block_title")}}</h4>
            <el-menu
                class="el-menu-vertical"
                @select="handleOtherSelect"
            >
              <el-menu-item index="2">
                <el-icon><Delete /></el-icon>
                <span>{{t("profile.logout")}}</span>
              </el-menu-item>
              <el-menu-item index="3" v-if="MODE !== 'desktop'">
                <el-icon><Download /></el-icon>
                <span>{{t("profile.download_desktop_app")}}</span>
              </el-menu-item>
              <el-menu-item index="9">
                <el-icon><Refresh /></el-icon>
                <span>{{t("profile.change_language")}}</span>
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
