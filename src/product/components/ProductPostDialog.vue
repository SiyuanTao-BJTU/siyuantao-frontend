<script setup>
import { onMounted, ref, reactive, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElForm, ElDialog, ElUpload } from 'element-plus';
import { Plus, Close } from '@element-plus/icons-vue';
import api from '@/API_PRO.js';
import BackendConfig from '../../../backend.config'; // Import BackendConfig

const router = useRouter();

// 定义 props
const props = defineProps({
  isDialogVisible: Boolean,
  isEditMode: {
    type: Boolean,
    default: false,
  },
  productId: {
    type: String,
    default: null,
  },
});

// 定义 emits
const emits = defineEmits(['update:isDialogVisible', 'updateSuccess', 'updateCancel']);

const localDialogVisible = ref(props.isDialogVisible);

// 商品表单数据
const productForm = reactive({
  product_name: '',
  description: '',
  price: null,
  category: '',
  condition: '',
  quantity: 1, // 新增：商品数量，默认1
  image_urls: [], // 用于显示已有的图片，可能从后端获取
  image_files: [], // 用于存储待上传的图片文件
});

// 表单验证规则
const rules = {
  product_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', message: '价格必须是数字', trigger: 'blur', transform: (value) => Number(value) },
    { min: 0.01, message: '价格必须大于0', trigger: 'blur', type: 'number' }
  ],
  quantity: [
    { required: true, message: '请输入商品数量', trigger: 'blur' },
    { type: 'number', message: '数量必须是数字', trigger: 'blur', transform: (value) => Number(value) },
    { min: 1, message: '数量必须大于0', trigger: 'blur', type: 'number' }
  ],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  condition: [{ required: true, message: '请选择商品成色', trigger: 'change' }],
  image_files: [
    {
      validator: (rule, value, callback) => {
        if (productForm.image_urls.length === 0 && productForm.image_files.length === 0) {
          callback(new Error('请至少上传一张商品图片'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
};

const productFormRef = ref(null); // 表单引用

// 获取商品详情 (编辑模式下)
const fetchProductDetail = async (id) => {
  try {
    const response = await api.getProductDetail(id);
    if (response) {
      productForm.product_name = response.商品名称;
      productForm.description = response.描述;
      productForm.price = parseFloat(response.价格) || null;
      productForm.category = response.分类名称;
      productForm.condition = response.成色 || '';
      productForm.quantity = parseInt(response.数量, 10) || 1;
      
      const imageUrlsString = response.图片URL列表;
      if (imageUrlsString && typeof imageUrlsString === 'string') {
        productForm.image_urls = imageUrlsString.split(',').map(url => {
            const baseUrl = BackendConfig.RESTFUL_API_URL.replace('/api', '');
            const trimmedUrl = url.trim();
            if (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('//')) {
                return trimmedUrl;
            }
            return (baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl) + (trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl);
        });
      } else {
        productForm.image_urls = [];
      }
      
      productForm.image_files = [];
    } else {
      ElMessage.error('获取商品详情失败: 未返回有效数据');
      emits('updateCancel');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败: ' + (error.response?.data?.detail || error.message));
    emits('updateCancel');
  }
};

// 重置表单
const resetForm = () => {
  productForm.product_name = '';
  productForm.description = '';
  productForm.price = null;
  productForm.category = '';
  productForm.condition = '';
  productForm.quantity = 1; // 重置数量
  productForm.image_urls = [];
  productForm.image_files = [];
  if (productFormRef.value) {
    productFormRef.value.clearValidate(); // 清除验证状态
  }
};

// 监听 props.isDialogVisible 的变化
watch(() => props.isDialogVisible, (newValue) => {
  localDialogVisible.value = newValue;
  if (newValue) {
    // 弹窗打开时，如果是编辑模式，则获取商品详情
    if (props.isEditMode && props.productId) {
      fetchProductDetail(props.productId);
    } else {
      // 发布模式，重置表单
      resetForm();
    }
  } else {
    // 弹窗关闭时，重置表单和验证状态
    if (productFormRef.value) {
      productFormRef.value.resetFields();
    }
    resetForm(); // 确保手动重置所有字段
  }
}, { immediate: true });

// 监听 localDialogVisible 的变化，将其同步回父组件
watch(localDialogVisible, (newValue) => {
  emits('update:isDialogVisible', newValue);
});

// 图片上传相关
const handleImageUpload = async (options) => {
  const file = options.file;
  productForm.image_files.push(file); // 将文件添加到待上传列表
  // 仅在前端显示预览，实际上传在提交表单时进行
  options.onSuccess(); // 假装上传成功，让 Element Plus 显示文件
};

const handleRemoveImage = (file) => {
  // 从 image_files 中移除文件
  const index = productForm.image_files.findIndex(f => f.uid === file.uid);
  if (index !== -1) {
    productForm.image_files.splice(index, 1);
  }
  // 如果是已有的图片（通过 image_urls 显示的），则需要特殊处理
  // 这里简化处理，直接移除，实际项目中可能需要额外的删除图片API
  const urlIndex = productForm.image_urls.indexOf(file.url);
  if (urlIndex !== -1) {
    productForm.image_urls.splice(urlIndex, 1);
  }
  // 手动触发图片验证
  if (productFormRef.value) {
    nextTick(() => {
      productFormRef.value.validateField('image_files');
    });
  }
};

const beforeImageUpload = (rawFile) => {
  const isLt2M = rawFile.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
  }
  // 检查文件类型
  const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type);
  if (!isValidType) {
    ElMessage.error('图片只能是 JPG/PNG/GIF 格式!');
  }
  return isLt2M && isValidType;
};

// 提交表单（发布或更新）
const handleSubmit = async () => {
  if (!productFormRef.value) return;

  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let uploadedImageUrls = [];
        // 如果有新上传的图片文件，先上传它们
        if (productForm.image_files.length > 0) {
          for (const file of productForm.image_files) {
            const formData = new FormData();
            formData.append('file', file.raw); // 后端接口期望的字段名为 'file'
            // 调用新的通用图片上传接口
            const uploadResponse = await api.uploadImage(formData);
            if (uploadResponse && uploadResponse.url) {
              uploadedImageUrls.push(uploadResponse.url); // 收集返回的图片 URL
            } else {
              ElMessage.error('图片上传失败: 未获取到有效的图片 URL');
              return;
            }
          }
        }

        const finalImageUrls = [
          ...productForm.image_urls.map(url => {
            const baseUrl = BackendConfig.RESTFUL_API_URL.replace('/api', '');
            const relativeUrl = url.replace((baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl), '');
            return relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
          }),
          ...uploadedImageUrls
        ];

        const submitData = {
          product_name: productForm.product_name,
          description: productForm.description,
          price: productForm.price,
          category_name: productForm.category,
          quantity: productForm.quantity,
          image_urls: finalImageUrls,
          // condition: productForm.condition, // Backend schema ProductCreate/Update does not have condition
        };
        // 如果 productForm.condition 有值且确实希望提交，需要后端 ProductCreate schema 支持 condition
        if (productForm.condition) {
            submitData.condition = productForm.condition;
        }

        if (props.isEditMode && props.productId) {
          // 更新商品
          const updateData = {
            product_name: submitData.product_name,
            description: submitData.description,
            price: submitData.price,
            category_name: submitData.category_name,
            quantity: submitData.quantity,
            image_urls: submitData.image_urls.length > 0 ? submitData.image_urls : [],
            // ProductUpdate schema doesn't have condition, so we don't send it
            // If backend ProductUpdate schema is updated to include condition, uncomment below
            // ...(submitData.condition && { condition: submitData.condition }), 
          };
          // 如果后端 ProductUpdate schema 明确支持 condition，则可以这样添加：
          if (submitData.condition) { //  仅在有值时传递，且后端ProductUpdate支持此字段
             updateData.condition = submitData.condition; // 后端已支持 condition
          }

          await api.updateProduct(props.productId, updateData, false); 
          ElMessage.success('商品更新成功');
        } else {
          // 发布商品
          await api.createProduct(submitData, false);
          ElMessage.success('商品发布成功');
        }
        emits('updateSuccess');
        localDialogVisible.value = false;
      } catch (error) {
        console.error('商品操作失败:', error);
        ElMessage.error('商品操作失败：' + (error.response?.data?.detail || error.message));
      }
    } else {
      ElMessage.error('表单验证失败，请检查输入');
    }
  });
};

const handleCancel = () => {
  localDialogVisible.value = false;
  emits('updateCancel');
};

// 组件挂载时如果是在编辑模式且有productId，则加载数据
onMounted(() => {
  if (props.isEditMode && props.productId) {
    fetchProductDetail(props.productId);
  }
});
</script>

<template>
  <el-dialog
    v-model="localDialogVisible"
    :title="props.isEditMode ? '编辑商品信息' : '发布新商品'"
    width="600px"
    :before-close="handleCancel"
    destroy-on-close
    class="product-post-dialog"
  >
    <el-form
      :model="productForm"
      :rules="rules"
      ref="productFormRef"
      label-width="80px"
      class="product-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="商品名称" prop="product_name">
            <el-input v-model="productForm.product_name" placeholder="请输入商品名称，简洁明了" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品描述" prop="description">
            <el-input
              type="textarea"
              v-model="productForm.description"
              :rows="5"
              placeholder="请详细描述商品特点、状况及交易方式等"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品数量" prop="quantity">
            <el-input-number v-model="productForm.quantity" 
            :min="1" 
            :precision="0" 
            controls-position="right" 
            placeholder="请输入商品数量" 
            style="width: 100%;" 
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品价格" prop="price">
            <el-input-number
              v-model="productForm.price"
              :min="0.01"
              :precision="2"
              controls-position="right"
              placeholder="请输入价格"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品分类" prop="category">
            <el-select v-model="productForm.category" placeholder="请选择商品分类" style="width: 100%;">
              <el-option label="电子产品" value="电子产品"></el-option>
              <el-option label="书籍文具" value="书籍文具"></el-option>
              <el-option label="生活用品" value="生活用品"></el-option>
              <el-option label="服装配饰" value="服装配饰"></el-option>
              <el-option label="运动户外" value="运动户外"></el-option>
              <el-option label="服装鞋包" value="服装鞋包"></el-option>
              <el-option label="文体用品" value="文体用品"></el-option>
              <el-option label="乐器" value="乐器"></el-option>
              <el-option label="家居日用" value="家居日用"></el-option>
              <el-option label="影音娱乐" value="影音娱乐"></el-option>
              <el-option label="游戏周边" value="游戏周边"></el-option>
              <el-option label="其他" value="其他"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品成色" prop="condition">
            <el-select v-model="productForm.condition" placeholder="请选择商品成色" style="width: 100%;">
              <el-option label="全新" value="全新"></el-option>
              <el-option label="九成新" value="九成新"></el-option>
              <el-option label="八成新" value="八成新"></el-option>
              <el-option label="七成新" value="七成新"></el-option>
              <el-option label="五成新及以下" value="五成新及以下"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="商品图片" prop="image_files">
            <el-upload
              v-model:file-list="productForm.image_files"
              action=""
              list-type="picture-card"
              :limit="5"
              :on-remove="handleRemoveImage"
              :before-upload="beforeImageUpload"
              :http-request="handleImageUpload"
              :auto-upload="false"
              class="product-image-uploader"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="el-upload__tip">支持JPG/PNG/GIF格式，单张不超过2MB，最多5张</div>
              </template>
            </el-upload>
            <!-- 已上传图片预览区域 -->
            <div v-if="productForm.image_urls.length > 0" class="existing-images-preview">
              <div v-for="(url, index) in productForm.image_urls" :key="'existing-' + index" class="image-preview-item">
                <img :src="url" class="uploaded-image-preview" />
                <div class="image-overlay">
                  <el-icon class="delete-icon" @click.stop="handleRemoveImage({url: url})"><Close /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ props.isEditMode ? '保存修改' : '立即发布' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* Dialog 整体样式 */
.product-post-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.product-post-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.product-post-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

/* Form 样式 */
.product-form .el-form-item {
  margin-bottom: 22px;
}

.product-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

/* Input/Select/Textarea 样式 */
.product-form :deep(.el-input__inner),
.product-form :deep(.el-textarea__inner),
.product-form :deep(.el-select__inner) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  box-shadow: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.product-form :deep(.el-input__inner:focus),
.product-form :deep(.el-textarea__inner:focus),
.product-form :deep(.el-select__inner:focus) {
  border-color: #4A90E2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* InputNumber 样式 */
.product-form :deep(.el-input-number) {
  width: 100%;
}

.product-form :deep(.el-input-number__decrease),
.product-form :deep(.el-input-number__increase) {
  border-left: 1px solid #dcdfe6;
  border-radius: 0 8px 8px 0;
}

/* Upload 样式 */
.product-image-uploader :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}

.product-image-uploader :deep(.el-upload--picture-card):hover {
  border-color: #4A90E2;
}

.product-image-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.product-image-uploader :deep(.el-upload__tip) {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

.existing-images-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px; /* Space from new upload button */
}

.image-preview-item {
    position: relative;
    width: 120px; /* Match el-upload item size */
    height: 120px; /* Match el-upload item size */
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    display: flex; /* For centering content */
    justify-content: center;
    align-items: center;
}

.uploaded-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6); /* Darker overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-preview-item:hover .image-overlay {
    opacity: 1;
}

.delete-icon {
    color: #fff;
    font-size: 28px; /* Larger delete icon */
    cursor: pointer;
}

/* Footer buttons */
.dialog-footer .el-button {
  min-width: 100px;
}

.dialog-footer .el-button--primary {
  background-color: #4A90E2;
  border-color: #4A90E2;
}

.dialog-footer .el-button--primary:hover {
  background-color: #357ABD;
  border-color: #357ABD;
}
</style> 