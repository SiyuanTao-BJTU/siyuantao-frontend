<script setup>
import {onMounted, ref, defineProps, defineEmits, reactive} from "vue";
import api from '@/API_PRO.js'; // 导入新的 API 服务
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
    ElMessage.error("请输入商品名称");
    return;
  }
  if (formData.value.description === "") {
    ElMessage.error("请输入商品描述");
    return;
  }
  if (formData.value.count === 0) {
    ElMessage.error("请输入商品数量");
    return;
  }
  if (formData.value.price < 0) {
    ElMessage.error("请输入正确的商品价格");
    return;
  }
  fd.append("name", formData.value.name);
  fd.append("description", formData.value.description);
  fd.append("quantity", formData.value.count);
  fd.append("price", formData.value.price);
  formData.value.img.forEach((file) => {
    fd.append('images', file.raw);
  });

  if (props.isPutRequest) {
    api.updateProduct(props.itemID, fd, true)
      .then(data => {
        ElMessage.success("商品更新成功");
        handlePutRequestSuccess(data);
      })
      .catch(err => {
        ElMessage.error("商品更新失败");
        console.log("ERR", err);
      });
  }
  else {
    api.createProduct(fd, true)
      .then(() => {
        ElMessage.success("商品添加成功");
        emits("updateSuccess");
      })
      .catch(err => {
        ElMessage.error("商品添加失败");
        console.log(err);
      });
  }
}
</script>

<template>
  <div>
    <el-dialog
      title="添加/编辑商品"
      v-model="props.isDialogVisiable"
      width="30%"
      draggable
      @close="emits('updateCancel')"
      @closed="emits('updateCancel')"
    >
      <el-form :model="formData" ref="form" label-width="120px" @submit.native.prevent="handleSubmit">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="formData.description" placeholder="请输入商品描述" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="count">
          <el-input-number v-model="formData.count" :min="1" label="Count"></el-input-number>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="formData.price" :min="0" label="Price"></el-input-number>
        </el-form-item>
        <el-form-item label="商品图片" prop="img">
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
          <el-button type="primary" @click="handleSubmit">上传</el-button>
          <el-button @click="emits('updateCancel')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>