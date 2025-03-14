<script setup>
import { useI18n } from "vue-i18n";
import {defineEmits, defineProps, onMounted, reactive, ref} from "vue";
import {Delete} from "@element-plus/icons-vue";
import router from "@/router/index.js";
import WebSocketService from "@/socket_client/socket.js";

// 组件事件与属性定义
const props = defineProps({
  isSettingsDialogVisiable: Boolean,
});

const emits = defineEmits([
  "updateSuccess",
  "updateCancel"
])

// 组件全局变量定义
const { t, locale } = useI18n();
let isVisiable = ref(false); // 控制修改密码对话框的显示
let form = reactive({
  locale_temp: "",
})
const language_options = [
  {
    value: "zh",
    label: "简体中文"
  },
  {
    value: "en",
    label: "English"
  }
]

// 组件全局函数定义
onMounted(() => {
  isVisiable.value = props.isSettingsDialogVisiable;
});

const changeSettings = () => {
  locale.value = form.locale_temp;
  emits("updateSuccess")
  isVisiable.value = false;
}

const cancelChangeSettings = () => {
  emits("updateCancel")
  isVisiable.value = false;
}

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('username');
  localStorage.removeItem('userId');
  WebSocketService.close();
  isVisiable.value = false;
  emits("updateCancel");
  router.push('/login');
}
</script>

<template>
  <el-dialog
      v-model="isVisiable"
      :title="t('profile.settings_title')"
      width="30%"
      draggable
      @close="cancelChangeSettings"
      @closed="cancelChangeSettings"
  >
    <h4>{{t('profile.language_setting')}}</h4>
    <el-select
      v-model="form.locale_temp"
      :placeholder="t('profile.select_language')"
      style="width: 100%">
      <el-option
          v-for="item in language_options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <h4>{{t('profile.account_setting')}}</h4>
    <el-button @click=handleLogout>
      <el-icon><Delete /></el-icon>
      <p>{{t('profile.logout')}}</p>
    </el-button>
    <template #footer>
      <el-button type="primary" @click=changeSettings>{{t("profile.change_upload")}}</el-button>
      <el-button @click=cancelChangeSettings>{{t("profile.change_cancel")}}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
h4 {
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: bold;
}

p {
  margin-left: 10px;
}
</style>