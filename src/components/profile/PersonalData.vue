<script setup>
  import {onMounted, ref, reactive, computed} from "vue";
  import { useI18n } from "vue-i18n";
  import {Back, EditPen} from "@element-plus/icons-vue";
  import axios from "@/axios_client/index.js";
  import { ElMessage } from "element-plus";
  import PatternCheck from "@/utils/pattern.js";
  import router from "@/router/index.js";

  // 组件事件与属性定义
  const props = defineProps({
    database_id: String,
    username: String,
    email: String,
    student_id: Number,
    contact: Number,
    facauty: String, // 院系
    dormitory: String,
    componentKey: Number,
    isSearching: Boolean
  });

  const emits = defineEmits([
    "updateSuccess",
  ])

  // 组件全局变量定义
  const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
  let isEdit = ref(false); // 是否进入个人信息编辑状态
  let type_radio = ref("Calendar")
  let comment_info = ref([]); // 评论信息

  const origin_form = reactive({
    username: "",
    email: "",
    student_id: null,
    contact: null,
    facauty: "",
    dormitory: "",
  })

  const modify_form = reactive({
    username: "",
    email: "",
    student_id: "",
    contact: "",
    facauty: "",
    dormitory: "",
  })

  const calendar = ref("null")
  const selectDate = (val) => {
    if (!calendar.value) return
    calendar.value.selectDate(val)
  }
  let origin_avatar_char = computed(() => origin_form.username.slice(0, 2).toUpperCase());
  let modify_avatar_char = computed(() => modify_form.username.slice(0, 2).toUpperCase());

// 组件全局函数定义
  function clearModifyInfo() {
    modify_form.username = origin_form.username
    modify_form.email = origin_form.email
    modify_form.student_id = origin_form.student_id
    modify_form.contact = origin_form.contact
    modify_form.facauty = origin_form.facauty
    modify_form.dormitory = origin_form.dormitory
  }

  const handleEdit = () => {
    isEdit.value = true
  }

  const handleSave = () => {
    let username_res = PatternCheck.username_check(modify_form.username)
    if (!username_res.valid){
      ElMessage.error(t(username_res.error))
      return;
    }
    axios.put("/user/update", {
      username: modify_form.username,
      email: modify_form.email,
      profile: {
        student_id: modify_form.student_id,
        contact: modify_form.contact,
        facauty: modify_form.facauty,
        dormitory: modify_form.dormitory
      }
    }).then(res => {
      if(res.status === 200){
        if (res.data.code === 0) {
          origin_form.username = res.data.data.username
          origin_form.email = res.data.data.email
          origin_form.student_id = res.data.data.profile.student_id
          origin_form.contact = res.data.data.profile.contact
          origin_form.facauty = res.data.data.profile.facauty
          origin_form.dormitory = res.data.data.profile.dormitory
          localStorage.setItem("username", res.data.data.username)
          emits("updateSuccess", {
            username: origin_form.username,
            email: origin_form.email,
            student_id: origin_form.student_id,
            contact: origin_form.contact,
            facauty: origin_form.facauty,
            dormitory: origin_form.dormitory,
          })
          ElMessage.success(t("profile.info_updated_success"))
          clearModifyInfo()
        }
        else{
          console.warn("更新用户信息失败")
          ElMessage.error(t("profile.info_updated_fail"))
          clearModifyInfo()
        }
      }
      else{
        console.warn("更新用户信息失败")
        ElMessage.error(t("profile.info_updated_fail"))
        clearModifyInfo()
      }
    }).catch(res => {
      console.warn("更新用户信息失败")
      ElMessage.error(t("profile.info_updated_fail"))
      console.warn(res)
      clearModifyInfo()
    })
    isEdit.value = false
  }

  const handleCancel = () => {
    isEdit.value = false
    clearModifyInfo()
  }

  function getAvatar (owner) {
    return owner ? owner.slice(0, 2).toUpperCase() : "NA";
  }

  // 格式化时间
  function formatTime (time) {
    const date = new Date(time);
    return date.toLocaleString();
  }

  const handleOtherAvatarClick = (username) => {
    router.push(`/profile/${username}`)
  }

  const handleBack = () => {
    window.history.back();
  }

  onMounted(() => {
    origin_form.username = props.username
    origin_form.email = props.email
    origin_form.student_id = props.student_id
    origin_form.contact = props.contact
    origin_form.facauty = props.facauty
    origin_form.dormitory = props.dormitory

    modify_form.username = props.username
    modify_form.email = props.email
    modify_form.student_id = props.student_id
    modify_form.contact = props.contact
    modify_form.facauty = props.facauty
    modify_form.dormitory = props.dormitory

    if (props.database_id){
      axios.get("/user/comment", {
        params: {
          id: props.database_id
        }
      }).then((res) => {
        if (res.status === 200) {
          if (res.data.code === 0) {
            comment_info.value = res.data.data;
          }
          else {
            console.warn("获取评论失败")
          }
        }
        else {
          console.warn("获取评论失败")
        }
      }).catch((res) => {
        console.warn("获取评论失败")
        console.warn(res)
      })
    }
  })
</script>

<template>
  <div class="personal-data-container">
    <div class="personal-data-title">
      <h2 v-if="!isSearching">{{ t("profile.personal_data_title") }}</h2>
      <h2 v-else>{{t("profile.personal_data_title_searching")}}</h2>
    </div>
    <div class="profile-data-functional-block">
      <div v-if="isEdit">
        <el-button type="primary" @click="handleSave">{{ t("profile.save_button") }}</el-button>
        <el-button @click="handleCancel">{{ t("profile.cancel_button") }}</el-button>
      </div>
      <div v-else>
        <el-button type="primary" @click="handleEdit" v-if="!isSearching">
          <el-icon><EditPen /></el-icon>
           {{ t("profile.edit_button") }}
        </el-button>
        <el-button @click="handleBack" v-else>
          <el-icon><Back /></el-icon>
          {{t("itemInfo.back")}}
        </el-button>
      </div>
    </div>
    <div class="above-container">
      <div class="profile-detail-block">
        <div v-if="isEdit" class="edit-selector">
          <div class="avatar-container">
            <el-avatar :size="100" shape="square" class="avatar">{{modify_avatar_char}}</el-avatar>
            <h3>{{username}}</h3>
          </div>
          <el-form :model="modify_form" label-position="top">
            <el-form-item :label="t('profile.username')" >
              <el-input v-model="modify_form.username"/>
            </el-form-item>
            <el-form-item :label="t('profile.email')">
              <el-input v-model="modify_form.email"/>
            </el-form-item>
            <el-form-item :label="t('profile.student_id')">
              <el-input v-model="modify_form.student_id"/>
            </el-form-item>
            <el-form-item :label="t('profile.contact')">
              <el-input v-model="modify_form.contact"/>
            </el-form-item>
            <el-form-item :label="t('profile.facauty')">
              <el-input v-model="modify_form.facauty"/>
            </el-form-item>
            <el-form-item :label="t('profile.dormitory')">
              <el-input v-model="modify_form.dormitory"/>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="edit-selector">
          <div class="avatar-container">
            <el-avatar :size="100" shape="square" class="avatar">{{origin_avatar_char}}</el-avatar>
            <h3>{{username}}</h3>
          </div>
          <el-form :model="origin_form" label-position="top">
            <el-form-item :label="t('profile.username')" >
              <el-input v-model="origin_form.username" disabled/>
            </el-form-item>
            <el-form-item :label="t('profile.email')">
              <el-input v-model="origin_form.email" disabled/>
            </el-form-item>
            <el-form-item :label="t('profile.student_id')">
              <el-input v-model="origin_form.student_id" disabled/>
            </el-form-item>
            <el-form-item :label="t('profile.contact')">
              <el-input v-model="origin_form.contact" disabled/>
            </el-form-item>
            <el-form-item :label="t('profile.facauty')">
              <el-input v-model="origin_form.facauty" disabled/>
            </el-form-item>
            <el-form-item :label="t('profile.dormitory')">
              <el-input v-model="origin_form.dormitory" disabled/>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="other-info-block">
        <div class="other-type-radio">
          <el-radio-group v-model="type_radio" size="large" class="radio-group">
            <el-radio-button :label="t('profile.calendar_area')" value="Calendar" />
            <el-radio-button :label="t('profile.comments_area')" value="Comments Area" />
          </el-radio-group>
        </div>
        <div v-if="type_radio === 'Calendar'" class="calendar-block">
          <el-calendar ref="calendar">
            <template #header="{ date }">
              <span class="date-string">{{ date }}</span>
            </template>
          </el-calendar>
        </div>
        <div v-else class="comment-block">
          <el-scrollbar height="550" v-if="comment_info.length !== 0">
            <el-card
                v-for="item in comment_info"
                :key="item.id"
                class="comment-card"
                shadow="always"
                style="margin-bottom: 10px; padding: 10px;"
            >
              <div class="comment-item">
                <el-avatar
                    :size="35"
                    shape="square"
                    class="avatar_small"
                    @click="handleOtherAvatarClick(item.owner)">
                  {{getAvatar(item.owner)}}
                </el-avatar>
                <div class="content">
                  <div class="header">
                    <div class="owner">{{ item.owner }}</div>
                    <div class="time">{{ formatTime(item.time) }}</div>
                  </div>
                  <div class="body">{{ item.comment_body }}</div>
                </div>
              </div>
            </el-card>
          </el-scrollbar>
          <el-scrollbar height="550" v-else>
            <el-empty :description="t('profile.no_comment')"/>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="rest-container" />
  </div>
</template>

<style scoped>
.above-container {
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.avatar-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar {
  font-size: 40px;
  background-color: #79b7f8;
  color: #ffffff;
}


.avatar_small {
  font-size: 20px;
  background-color: #79b7f8;
  color: #ffffff;
}

.edit-selector h3 {
  margin-left: 10px;
  font-size: 32px;
  font-weight: bold;
}

.personal-data-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.personal-data-title {
  width: 100%;
  display: flex;
  justify-content: center;
}

.profile-data-functional-block {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
}

.personal-data-title h2 {
  font-size: 28px;
  font-weight: 800;
  margin-top: 20px;
  margin-bottom: 20px;
}

.profile-detail-block {
  margin-top: 5%;
  margin-left: 5%;
  margin-right: 5%;
  width: 50%;
}

.other-info-block {
  margin-top: 5%;
  margin-left: 5%;
  margin-right: 5%;
  width: 40%;
  border-left: 1px solid #dcdcdc;
  padding-left: 20px;
}

.edit-selector {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.el-form-item {
  margin-bottom: 30px;
}

.date-string {
  font-size: 20px;
  font-weight: 800;
}

.rest-container {
  width: 90%;
  margin-left: 5%;
  margin-right: 5%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  border-top: 1px solid #dcdcdc;
  padding-top: 20px;
}

.comment-card {
  border-radius: 10px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
}

.content {
  flex: 1;
}

.header {
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 14px;
  color: #888;
}

.body {
  margin-top: 5px;
  font-size: 16px;
}

.radio-group {
  margin-bottom: 20px;
}
</style>
