<script setup>
import {onMounted, ref, defineProps, defineEmits, reactive} from "vue";
import {useI18n} from "vue-i18n";
import axios from '../../axios_client/index.js';
import {ElMessage} from "element-plus";

// 组件事件与属性定义
const props = defineProps({
  isDialogVisiable: Boolean,
  isPutRequest: Boolean,
  itemID: {
    type: String,
    default: "None"
  }
});

const emits = defineEmits([
  "updateSuccess",
  "updateCancel"
])

// 组件全局变量定义
const { t } = useI18n(); // 解构出t函数，t函数用于获取当前语言环境下的文本
const formData = ref({
  name: "",
  description: "",
  count: 1,
  price: 0,
  img: [],
})
const fileList = ref([]);

// 组件全局函数定义
const handleFileChange = (file, fileList) => {
  formData.value.img = fileList;
};

const handleFileRemove = (file, fileList) => {
  formData.value.img = fileList;
};

const handlePutRequestSuccess = (responseData) => {
  emits("updateSuccess", responseData)
}

const handleSubmit = () => {
  const fd = new FormData();
  if (formData.value.name === "") {
    ElMessage.error(t("sell.upload_error_no_name"));
    return;
  }
  if (formData.value.description === "") {
    ElMessage.error(t("sell.upload_error_no_description"));
    return;
  }
  if (formData.value.count === 0) {
    ElMessage.error(t("sell.upload_error_no_count"));
    return;
  }
  if (formData.value.price < 0) {
    ElMessage.error(t("sell.upload_error_no_price"));
    return;
  }
  fd.append("name", formData.value.name);
  fd.append("description", formData.value.description);
  fd.append("count", formData.value.count);
  fd.append("price", formData.value.price);
  // 将文件添加到 FormData 对象
  formData.value.img.forEach((file, index) => {
    console.log(file.raw)
    fd.append('img', file.raw);
  });
  if (props.isPutRequest) {
    fd.append("id", props.itemID);
    axios.put("/item/", fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => {
      if(res.status === 200){
        if (res.data.code === 0) {
          ElMessage.success(t("sell.api_success_upload_success"))
          handlePutRequestSuccess(res.data.data)
        }
        else{
          ElMessage.error(t("sell.api_failure_upload_fail"))
        }
      }
      else{
        ElMessage.error(t("sell.api_failure_upload_fail"))
      }
    }).catch(err => {
      ElMessage.error(t("sell.api_failure_upload_fail"))
      console.log("ERR", err)
    })
  }
  else {
    axios.post("/item/", fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => {
      if(res.status === 200){
        if (res.data.code === 0) {
          emits("updateSuccess")
          ElMessage.success(t("sell.api_success_upload_success"))
          emits("updateSuccess")
        }
        else{
          ElMessage.error(t("sell.api_failure_upload_fail"))
        }
      }
      else{
        ElMessage.error(t("sell.api_failure_upload_fail"))
      }
    }).catch(err => {
      ElMessage.error(t("sell.api_failure_upload_fail"))
      console.log(err)
    })
  }

}
</script>

<template>
  <div>
    <el-dialog
      :title="t('sell.add_item')"
      v-model="props.isDialogVisiable"
      width="30%"
      draggable
      @close="emits('updateCancel')"
      @closed="emits('updateCancel')"
    >
      <el-form :model="formData" ref="form" label-width="120px" @submit.native.prevent="handleSubmit">
        <el-form-item :label="t('sell.form_item_name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('sell.form_item_name_placeholder')"></el-input>
        </el-form-item>
        <el-form-item :label="t('sell.form_item_description')" prop="description">
          <el-input v-model="formData.description" :placeholder="t('sell.form_item_description_placeholder')" type="textarea"></el-input>
        </el-form-item>
        <el-form-item :label="t('sell.form_item_count')" prop="count">
          <el-input-number v-model="formData.count" :min="1" label="Count"></el-input-number>
        </el-form-item>
        <el-form-item :label="t('sell.form_item_price')" prop="price">
          <el-input-number v-model="formData.price" :min="0" label="Price"></el-input-number>
        </el-form-item>
        <el-form-item :label="t('sell.form_item_img')" prop="img">
          <el-upload
              class="upload-demo"
              drag
              multiple
              :on-change="handleFileChange"
              :file-list="fileList"
              :on-remove="handleFileRemove"
              list-type="picture-card"
              :auto-upload="false"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{t("sell.upload")}}</el-button>
          <el-button @click="emits('updateCancel')">{{t("sell.cancel")}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>