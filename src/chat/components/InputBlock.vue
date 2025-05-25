<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import data from 'emoji-mart-vue-fast/data/all.json';
import 'emoji-mart-vue-fast/css/emoji-mart.css';
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
import { PictureRounded, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import WebSocketService from "@/socket_client/socket.js";
import api from '@/API_PRO.js'; // 导入新的 API 服务

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
const emojiI18n = {
  search: "搜索",
  notfound: "未找到表情",
  categories: {
  search: "搜索结果",
  recent: "常用",
  smileys: "笑脸与情感",
  people: "人物",
  nature: "动物与自然",
  foods: "食物与饮料",
  activity: "活动",
  places: "旅行与地点",
  objects: "物体",
  symbols: "符号",
  flags: "旗帜",
  custom: "自定义",
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
  ElMessage.error("暂不支持图片上传")
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
    if (!props.item_id) {
      ElMessage.error("商品ID缺失"); // Add to i18n
      return;
    }
    const commentData = { content: inputText.value };
    // If rating is also part of item comments, it needs to be added here.
    // For example: commentData.rating = someRatingValue;

    api.addProductComment(props.item_id, commentData)
      .then(() => {
        ElMessage.success("评论成功");
        inputText.value = '';
        emits("updateSuccess");
      })
      .catch(error => {
        console.error("Add product comment failure:", error);
        ElMessage.error("评论失败");
      });
  }
}
</script>

<template>
  <div class="text-editor">
    <div class="input-type-bar">
      <el-icon size="20" class="input-icon" @click="toggleEmojiPicker"><PictureRounded /></el-icon>
      <el-icon size="20" class="input-icon" @click="pictureSelect"><Plus /></el-icon>
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
          placeholder="请输入消息"
          class="message-textarea"
      />
    </div>
    <div class="op-button-block">
      <el-button @click="clearMessage">清空</el-button>
      <el-button type="primary" @click="uploadMessage">发送</el-button>
    </div>
  </div>
</template>

<style scoped>
.text-editor {
  margin-top: 0; /* Remove default margin */
  margin-left: 0; /* Remove default margin */
  margin-right: 0; /* Remove default margin */
  position: relative;
  height: 100%; /* Take full height of parent */
  display: flex;
  flex-direction: column;
  background-color: #ffffff; /* White background */
  border-top: 1px solid #d0d0d0; /* Subtle separator line */
  padding-top: 10px; /* Padding above the input area */
}

.input-type-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start; /* Align icons to the start */
  align-items: center; /* Center icons vertically */
  padding: 0 10px; /* Horizontal padding */
  /* background-color: #e1e0e0; */ /* Remove background, icons are enough */
  min-height: 30px; /* Minimum height */
  flex-shrink: 0; /* Prevent shrinking */
}

.input-icon {
  margin-right: 15px; /* Increase space between icons */
  cursor: pointer;
  color: #606266; /* Medium grey icon color */
  transition: color 0.3s ease; /* Smooth color transition */
}

.input-icon:hover {
    color: #4A90E2; /* Accent blue on hover */
}

.text-area {
  margin-top: 10px; /* Space below the input-type bar */
  flex-grow: 1; /* Allow textarea to grow */
  padding: 0 10px; /* Horizontal padding */
  box-sizing: border-box; /* Include padding in width */
}

.message-textarea :deep(.el-textarea__inner) {
    border: none; /* Remove default border */
    box-shadow: none !important; /* Remove shadow */
    padding: 0; /* Remove default padding */
    resize: none; /* Ensure resize is none */
    font-size: 15px; /* Adjust font size */
    color: #303133; /* Dark text color */
    background-color: transparent; /* Transparent background */
}

.message-textarea :deep(.el-textarea__inner::placeholder) {
    color: #a8a8a8; /* Placeholder color */
}

.emoji-picker {
  position: absolute;
  bottom: 60px; /* Position above the buttons block */
  left: 10px; /* Align to the left */
  z-index: 100; /* Ensure it's above other content */
  max-width: 250px; /* Limit width */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  border-radius: 8px; /* Rounded corners */
  overflow: hidden; /* Hide overflow */
}

.op-button-block {
  display: flex;
  flex-direction: row;
  justify-content: flex-end; /* Align buttons to the right */
  margin-top: 10px; /* Space above buttons */
  padding: 0 10px 10px 10px; /* Padding around buttons */
  gap: 10px; /* Space between buttons */
  flex-shrink: 0; /* Prevent shrinking */
}
</style>
