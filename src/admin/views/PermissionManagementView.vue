<template>
  <div class="permission-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Setting /></el-icon>
            权限管理
          </h1>
          <p class="page-subtitle">管理平台用户角色和权限配置</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="RefreshRight" @click="refreshPermissions">
            刷新数据
          </el-button>
          <el-button type="success" :icon="Plus" @click="createRole">
            创建新角色
          </el-button>
        </div>
      </div>
    </div>

    <!-- 权限统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon"><el-icon><Avatar /></el-icon></div>
        <div class="stat-content">
          <h3>{{ stats.rolesCount || '--' }}</h3>
          <p>总角色数</p>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon"><el-icon><Checked /></el-icon></div>
        <div class="stat-content">
          <h3>{{ stats.permissionsCount || '--' }}</h3>
          <p>总权限项</p>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon"><el-icon><User /></el-icon></div>
        <div class="stat-content">
          <h3>{{ stats.adminUsers || '--' }}</h3>
          <p>管理员用户</p>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>角色列表</h3>
          <div class="card-actions">
             <el-input
                v-model="searchQuery"
                placeholder="搜索角色名称..."
                :prefix-icon="Search"
                clearable
                style="width: 200px; margin-right: 12px;"
                @input="handleSearch"
              />
              <el-button size="small" @click="refreshPermissions">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredRoles"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'permissions', hasChildren: 'hasPermissions' }"
      >
        <el-table-column prop="name" label="角色/权限名称" width="250">
           <template #default="{ row }">
              <div v-if="row.isRole" class="role-name">
                 <el-icon><Avatar /></el-icon>
                 <span>{{ row.name }}</span>
              </div>
              <div v-else class="permission-item">
                 <el-icon><Check /></el-icon>
                 <span>{{ row.name }}</span>
              </div>
           </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
             <div class="action-buttons">
                <template v-if="row.isRole">
                   <el-button type="primary" size="small" @click="editRole(row)" link>编辑</el-button>
                   <el-button type="danger" size="small" @click="deleteRole(row)" link>删除</el-button>
                </template>
                <template v-else>
                   <!-- 权限项的操作，例如查看关联 -->
                   <el-button size="small" @click="viewPermissionDetail(row)" link>详情</el-button>
                </template>
             </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialog.visible"
      :title="roleDialog.isEdit ? '编辑角色' : '创建新角色'"
      width="500px"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="关联权限">
           <el-tree
             :data="allPermissionsTree"
             show-checkbox
             node-key="id"
             ref="permissionTreeRef"
             highlight-current
             :props="{ label: 'name' }"
             @check-change="handlePermissionCheckChange"
           />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm" :loading="roleDialog.loading">
            {{ roleDialog.isEdit ? '保存修改' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, RefreshRight, Plus, Avatar, Checked, User, Search, Refresh, Check } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')

// 统计数据
const stats = ref({
  rolesCount: 5,
  permissionsCount: 30,
  adminUsers: 10
})

// 角色和权限数据 (模拟数据)
const roles = ref([
  {
    id: 'role-super-admin',
    name: '超级管理员',
    description: '拥有平台所有权限',
    isRole: true,
    hasPermissions: true,
    permissions: [
      { id: 'perm-all-users', name: '查看所有用户', description: '' },
      { id: 'perm-manage-users', name: '管理用户', description: '' },
      { id: 'perm-manage-roles', name: '管理角色和权限', description: '' },
      { id: 'perm-system-settings', name: '系统设置', description: '' },
    ]
  },
  {
    id: 'role-admin',
    name: '管理员',
    description: '负责日常内容和用户管理',
    isRole: true,
    hasPermissions: true,
    permissions: [
      { id: 'perm-view-dashboard', name: '查看仪表盘', description: '' },
      { id: 'perm-view-users', name: '查看用户列表', description: '' },
      { id: 'perm-manage-products', name: '管理商品', description: '' },
      { id: 'perm-manage-returns', name: '管理退货申请', description: '' },
      { id: 'perm-manage-reports', name: '管理举报', description: '' },
      { id: 'perm-send-notifications', name: '发送系统通知', description: '' },
    ]
  },
  {
    id: 'role-user',
    name: '普通用户',
    description: '平台普通用户',
    isRole: true,
    hasPermissions: true,
    permissions: [
      { id: 'perm-view-products', name: '浏览商品', description: '' },
      { id: 'perm-create-product', name: '发布商品', description: '' },
      { id: 'perm-place-order', name: '下订单', description: '' },
      { id: 'perm-chat-with-seller', name: '与卖家聊天', description: '' },
    ]
  }
])

// 所有可用的权限项 (模拟数据)
const allPermissionsTree = ref([
  {
    id: 'module-users',
    name: '用户模块',
    isPermissionGroup: true,
    children: [
      { id: 'perm-view-users', name: '查看用户列表', description: '允许查看平台用户列表' },
      { id: 'perm-manage-users', name: '管理用户', description: '允许禁用、启用、删除用户等操作' },
      { id: 'perm-adjust-credit', name: '调整用户信用分', description: '' },
    ]
  },
  {
    id: 'module-products',
    name: '商品模块',
    isPermissionGroup: true,
    children: [
       { id: 'perm-view-products-admin', name: '查看所有商品 (管理员)', description: '' },
      { id: 'perm-manage-products', name: '管理商品', description: '允许审核、删除商品等操作' },
    ]
  },
  {
    id: 'module-trade',
    name: '交易模块',
    isPermissionGroup: true,
    children: [
      { id: 'perm-view-trades-admin', name: '查看所有交易 (管理员)', description: '' },
      { id: 'perm-manage-returns', name: '管理退货申请', description: '' },
      { id: 'perm-intervene-trade', name: '介入交易纠纷', description: '' },
    ]
  },
   {
    id: 'module-reports',
    name: '举报模块',
    isPermissionGroup: true,
    children: [
      { id: 'perm-view-reports', name: '查看举报列表', description: '' },
      { id: 'perm-handle-reports', name: '处理举报', description: '' },
    ]
  },
   {
    id: 'module-notifications',
    name: '通知模块',
    isPermissionGroup: true,
    children: [
      { id: 'perm-send-notifications', name: '发送系统通知', description: '' },
    ]
  },
  {
    id: 'module-system',
    name: '系统模块',
    isPermissionGroup: true,
    children: [
      { id: 'perm-manage-roles', name: '管理角色和权限', description: '' },
      { id: 'perm-system-settings', name: '系统设置', description: '' },
    ]
  },
])

// 过滤后的角色列表 (用于搜索)
const filteredRoles = computed(() => {
  if (!searchQuery.value) {
    return roles.value;
  }
  const query = searchQuery.value.toLowerCase();
  return roles.value.filter(role => role.name.toLowerCase().includes(query));
})

// 对话框状态和表单
const roleDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
})

const roleForm = reactive({
  id: null,
  name: '',
  description: '',
  permissionIds: [] // 选中的权限ID
})

const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 100, message: '长度不超过 100 个字符', trigger: 'blur' }
  ]
}

const roleFormRef = ref(null)
const permissionTreeRef = ref(null)

// 方法
const refreshPermissions = () => {
  // TODO: 调用 API 获取最新的角色和权限数据
  loading.value = true;
  setTimeout(() => {
     // 模拟数据更新
     stats.value = { rolesCount: 6, permissionsCount: 35, adminUsers: 12 };
     loading.value = false;
     ElMessage.success('权限数据已刷新');
  }, 800);
}

const createRole = () => {
  roleDialog.visible = true;
  roleDialog.isEdit = false;
  Object.assign(roleForm, { id: null, name: '', description: '', permissionIds: [] });
  // 重置树形组件的选中状态
  permissionTreeRef.value?.setCheckedKeys([]);
}

const editRole = (role) => {
  roleDialog.visible = true;
  roleDialog.isEdit = true;
  Object.assign(roleForm, { id: role.id, name: role.name, description: role.description });
  // 设置树形组件的选中状态（根据角色的现有权限）
  const permissionIds = role.permissions.map(p => p.id);
  roleForm.permissionIds = permissionIds; // 更新表单数据
  // nextTick(() => {
     permissionTreeRef.value?.setCheckedKeys(permissionIds);
  // });
}

const deleteRole = async (role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？`, 
      '删除角色',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    // TODO: 调用 API 删除角色
    // await api.deleteRole(role.id);
    // 从本地模拟数据中删除
    roles.value = roles.value.filter(item => item.id !== role.id);
    ElMessage.success('角色已删除');
  } catch (error) {
    if (error !== 'cancel') {
       console.error('删除角色失败:', error);
       ElMessage.error('删除角色失败');
    }
  }
}

const submitRoleForm = () => {
  roleFormRef.value?.validate(async (valid) => {
    if (valid) {
      roleDialog.loading = true;
      const selectedPermissions = permissionTreeRef.value?.getCheckedKeys() || [];
      roleForm.permissionIds = selectedPermissions;

      try {
        if (roleDialog.isEdit) {
          // TODO: 调用 API 更新角色
          // await api.updateRole(roleForm.id, { name: roleForm.name, description: roleForm.description, permission_ids: roleForm.permissionIds });
          // 模拟本地更新
          const index = roles.value.findIndex(r => r.id === roleForm.id);
          if (index !== -1) {
             roles.value[index].name = roleForm.name;
             roles.value[index].description = roleForm.description;
             // 模拟更新关联权限 (这里简化处理，实际应根据 permissionIds 查找对应权限对象)
             roles.value[index].permissions = allPermissionsTree.value.flatMap(group => 
                 group.children.filter(perm => roleForm.permissionIds.includes(perm.id))
             );
          }
          ElMessage.success('角色更新成功');
        } else {
          // TODO: 调用 API 创建角色
          // await api.createRole({ name: roleForm.name, description: roleForm.description, permission_ids: roleForm.permissionIds });
           // 模拟本地创建
           const newRole = {
              id: `role-${Date.now()}`,
              name: roleForm.name,
              description: roleForm.description,
              isRole: true,
              hasPermissions: roleForm.permissionIds.length > 0,
              permissions: allPermissionsTree.value.flatMap(group => 
                 group.children.filter(perm => roleForm.permissionIds.includes(perm.id))
             ), // 模拟关联权限
           };
           roles.value.push(newRole);
          ElMessage.success('角色创建成功');
        }
        roleDialog.visible = false;
        refreshPermissions(); // 刷新列表
      } catch (error) {
        console.error('提交角色信息失败:', error);
        ElMessage.error('操作失败');
      } finally {
        roleDialog.loading = false;
      }
    }
  })
}

const handleSearch = () => {
  // computed property handles filtering
}

const handlePermissionCheckChange = (data, checked, indeterminate) => {
  // 可以在这里处理权限选择的变化，例如同步到 roleForm.permissionIds
   console.log('Permission checked changed:', data, checked, indeterminate);
   // 如果是父节点被选中或取消选中，需要额外处理子节点的选中状态，
   // 但 El-tree 的 show-checkbox 模式通常会自动处理父子联动。
   // 如果需要手动同步，可以通过 getCheckedKeys 获取所有选中节点的 key。
   // roleForm.permissionIds = permissionTreeRef.value?.getCheckedKeys() || []; // 可能在需要时再获取
}

const viewPermissionDetail = (permission) => {
  // TODO: 查看权限详情或关联的用户/角色
   ElMessage.info(`查看权限详情: ${permission.name}`);
}

onMounted(() => {
  // 初始加载权限数据
  refreshPermissions();
})

</script>

<style scoped>
/* 页面背景和内边距 - 引入公共样式 */
.permission-management-container {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  /* padding: 24px; */
}

/* 页面头部 - 引入公共样式 */
.page-header {
  /* margin-bottom: 24px; */
}

.header-content {
  /* display: flex; justify-content: space-between; align-items: center; */
  /* padding: 32px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
}

.header-left {
  /* display: flex; align-items: center; gap: 8px; */
}

.page-title {
  /* font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; */
}

.page-subtitle {
  /* font-size: 16px; color: #64748b; margin: 0; */
}

.header-actions {
  /* display: flex; gap: 12px; */
}

/* 统计卡片 - 引入公共样式 */
.stats-grid {
  /* display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; */
}

.stat-card {
  /* display: flex; align-items: center; padding: 24px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); */
}

.stat-card .stat-icon {
  /* width: 48px; height: 48px; border-radius: 12px; display: flex; justify-content: center; align-items: center; margin-right: 16px; color: #fff; */
}

.stat-card.primary .stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-card.success .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-card.warning .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.stat-icon .el-icon {
  /* font-size: 28px; */
}

.stat-content {
  /* display: flex; flex-direction: column; */
}

.stat-number {
  /* font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 4px; */
}

.stat-label {
  /* font-size: 14px; color: #606266; */
}

/* 列表卡片 */
.list-card {
  /* border-radius: 12px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); */
}

.list-card :deep(.el-card__header) {
  /* padding: 20px 24px; border-bottom: 1px solid rgba(0, 0, 0, 0.06); */
}

.card-header {
  /* display: flex; justify-content: space-between; align-items: center; */
}

.card-header h3 {
  /* margin: 0; font-size: 18px; font-weight: 600; color: #1e293b; */
}

.card-actions {
   display: flex;
   align-items: center;
}

/* 表格样式 */
.el-table {
  /* styles */
}

.el-table :deep(.el-table__header th) {
  /* background-color: #f8fafc !important; color: #374151; font-weight: 600 !important; */
}

/* 角色/权限名称列样式 */
.role-name, .permission-item {
   display: flex;
   align-items: center;
   gap: 8px;
   font-weight: bold;
}

.role-name .el-icon {
   color: #409EFF; /* Primary color */
}

.permission-item .el-icon {
    color: #67C23A; /* Success color */
}

/* 操作按钮样式 */
.action-buttons .el-button {
  /* padding: 0; height: auto; */
}

/* 对话框样式 */
.el-dialog__body {
  /* padding: 20px; */
}

.dialog-footer {
  /* text-align: right; */
}

.el-form-item {
  /* margin-bottom: 20px; */
}

.recipient-selector, .filter-selector {
  /* border: 1px solid #ebeef5; border-radius: 4px; padding: 15px; margin-top: 15px; background-color: #f9fafc; */
}

.el-tree {
    /* padding: 10px; border: 1px solid #ebeef5; border-radius: 4px; */
}

/* 响应式调整 */
@media (max-width: 768px) {
  /* .permission-management-container { padding: 16px; } */

  /* .header-content { flex-direction: column; align-items: flex-start; gap: 20px; padding: 24px; } */

  /* .header-actions { width: 100%; justify-content: space-around; margin-top: 16px; } */

  /* .stats-grid { grid-template-columns: 1fr; } */

   .card-actions {
       flex-direction: column;
       align-items: flex-end;
       gap: 8px;
   }

   .card-actions .el-input {
       width: 100% !important;
   }

   .el-dialog {
       width: 90% !important;
   }
}

</style> 