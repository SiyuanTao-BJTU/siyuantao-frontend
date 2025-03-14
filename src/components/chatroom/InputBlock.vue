<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import data from 'emoji-mart-vue-fast/data/all.json';
import 'emoji-mart-vue-fast/css/emoji-mart.css';
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
import { useI18n } from "vue-i18n";
import { PictureRounded, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import WebSocketService from "@/socket_client/socket.js";
import axios from "@/axios_client/index.js";

// 全局基本事件属性定义
const props = defineProps({
  isChatroom: Boolean,
  item_id: String,
  room_id: {
    type: String,
    default: '0'
  }
})

const emits = defineEmits([
  "updateSuccess"
])

// 全局变量定义
const { t } = useI18n();
const emojiI18n = {
  search: t("emoji.search"),
  notfound: t("emoji.notfound"),
  categories: {
  search: t("emoji.search_result"),
  recent: t("emoji.recent"),
  smileys: t("emoji.smileys"),
  people: t("emoji.people"),
  nature: t("emoji.nature"),
  foods: t("emoji.foods"),
  activity: t("emoji.activity"),
  places: t("emoji.places"),
  objects: t("emoji.objects"),
  symbols: t("emoji.symbols"),
  flags: t("emoji.flags"),
  custom: t("emoji.custom"),
  },
};
const emojiIndex = new EmojiIndex(data);
const showEmojiPicker = ref(false); // 控制表情选择器的显示状态
let inputText = ref(''); // 绑定文本输入框的内容
const computedRow = computed(() => {
  return props.isChatroom ? 7 : 1;
});

// 全局函数定义
const handleEmoji = (emoji) => {
  inputText.value += emoji.native; // 将表情的 Unicode 字符添加到输入框内容中
};

// 关闭表情选择器的函数
const closeEmojiPicker = (event) => {
  const emojiPickerElement = document.querySelector('.emoji-picker');
  const inputTypeBarElement = document.querySelector('.input-type-bar');

  // 如果点击的区域既不是表情选择器也不是表情按钮，则关闭表情选择器
  if (
      emojiPickerElement && !emojiPickerElement.contains(event.target) &&
      inputTypeBarElement && !inputTypeBarElement.contains(event.target)
  ) {
    showEmojiPicker.value = false;
  }
};

// 监听点击事件以关闭表情选择器
onMounted(() => {
  document.addEventListener('click', closeEmojiPicker);
});

// 清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('click', closeEmojiPicker);
});

// 切换表情选择器的显示状态
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const pictureSelect = () => {
  ElMessage.error(t("chatroom.picture_upload_not_allow"))
}

const clearMessage = () => {
  inputText.value = '';
}

const uploadMessage = () => {
  if (props.isChatroom) {
    WebSocketService.sendMessage(inputText.value, props.room_id);
    inputText.value = '';
  }
  else {
    axios.post('/item/comment', {
      item_id: props.item_id,
      body: inputText.value
    }).then(res => {
      if (res.status === 200) {
        if (res.data.code === 0) {
          ElMessage.success(t("itemInfo.comment_success"));
          inputText.value = '';
          emits("updateSuccess");
        } else {
          ElMessage.error(t("itemInfo.comment_failure"));
        }
      } else {
        ElMessage.error(t("itemInfo.comment_failure"));
      }
    }).catch(err => {
      ElMessage.error(t("itemInfo.comment_failure"));
    })
  }
}
</script>

<template>
  <div class="text-editor">
    <div class="input-type-bar">
      <el-icon size="20"><PictureRounded  @click="toggleEmojiPicker"/></el-icon>
      <el-icon size="20"><Plus @click="pictureSelect"/></el-icon>
    </div>
    <div v-if="showEmojiPicker" class="emoji-picker">
      <Picker
          :data="emojiIndex"
          :emojiSize="18"
          :showPreview="false"
          :infiniteScroll="false"
          :i18n="emojiI18n"
          set="apple"
          @select="handleEmoji"
      />
    </div>
    <div class="text-area">
      <el-input
          v-model="inputText"
          style="width: 100%"
          :rows="computedRow"
          type="textarea"
          resize="none"
          :placeholder="t('chatroom.please_input_message')"
      />
    </div>
    <div class="op-button-block">
      <el-button @click="clearMessage">{{t("chatroom.clear_message")}}</el-button>
      <el-button type="primary" @click="uploadMessage">{{t("chatroom.send_message")}}</el-button>
    </div>
  </div>
</template>

<style scoped>
.text-editor {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  position: relative;
  height: 90%;
  display: flex;
  flex-direction: column;
}

.input-type-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 10px;
  border-radius: 5px;
  background-color: #e1e0e0;
  min-height: 30px;
}

.input-type-bar .el-icon {
  margin-right: 10px;
  cursor: pointer;
}

.text-area {
  margin-top: 10px;
}

.emoji-picker {
  position: absolute;
  bottom: 60px;
  z-index: 100;
  max-width: 250px;
}

.op-button-block {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
