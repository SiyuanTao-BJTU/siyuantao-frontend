<script setup>
import {onMounted, ref, defineProps, defineEmits, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {ElMessage} from "element-plus";
import PatternCheck from "@/utils/pattern.js";
import axios from "@/axios_client/index.js";

// 组件事件与属性定义
const props = defineProps({
  isPasswordDialogVisiable: Boolean,
});

const emits = defineEmits([
  "updateSuccess",
  "updateCancel"
])

// 组件全局变量定义
let isVisiable = ref(false); // 控制修改密码对话框的显示
const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
let form = reactive({
  origin_password: "",
  password: "",
  confirm_password: "",
})


// 组件全局函数定义
onMounted(() => {
  isVisiable.value = props.isPasswordDialogVisiable;
});

const changePassword = () => {
  if(form.origin_password === "" || form.password === "" || form.confirm_password === ""){
    // 如果用户任意一项密码为空，则提示用户输入账号密码
    ElMessage.error(t("profile.empty_input"))
    return;
  }
  else if (form.password !== form.confirm_password){
    // 如果两次输入的密码不一致，则提示用户两次输入的密码不一致
    ElMessage.error(t("login.password_not_match"))
    return;
  }

  let password_res = PatternCheck.password_check(form.password)
  if (!password_res.valid){
    ElMessage.error(t(password_res.error))
    return;
  }

  axios.post("/user/password",{
    origin_password: form.origin_password,
    password: form.password,
    confirm_password: form.confirm_password,
  }).then(res => {
    if(res.status === 200){
      if (res.data.code === 0) {
        ElMessage.success(t("profile.change_password_success"))
        isVisiable.value = false;
        emits("updateSuccess")
      }
      else{
        ElMessage.error(t("profile.change_password_fail"))
      }
    }
    else{
      ElMessage.error(t("profile.change_password_fail"))
    }
  }).catch(res => {
    ElMessage.error(t("profile.change_password_fail"))
  })
}

const cancelChangePassword = () => {
  form.confirm_password = ""
  form.origin_password = ""
  form.password = ""
  isVisiable.value = false;
  emits("updateCancel")
}

</script>

<template>
  <el-dialog
    v-model="isVisiable"
    :title="t('profile.change_password_title')"
    width="40%"
    draggable
    @close="cancelChangePassword"
    @closed="cancelChangePassword"
  >
    <el-form
      :model="form"
      label-position="top"
      label-width="100px"
    >
      <el-form-item
        :label="t('profile.origin_password')"
      >
        <el-input v-model="form.origin_password" show-password></el-input>
      </el-form-item>
      <el-form-item
        :label="t('profile.new_password')"
      >
        <el-input v-model="form.password" show-password></el-input>
      </el-form-item>
      <el-form-item
        :label="t('profile.confirm_password')"
      >
        <el-input v-model="form.confirm_password" show-password></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click=changePassword>{{t("profile.change_upload")}}</el-button>
      <el-button @click=cancelChangePassword>{{t("profile.change_cancel")}}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
