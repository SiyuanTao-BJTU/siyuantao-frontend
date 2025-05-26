<template>
  <div class="reports-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Warning /></el-icon>
            举报管理
          </h1>
          <p class="page-subtitle">处理用户举报，维护平台秩序</p>
        </div>
        <div class="header-stats">
          <div class="stat-item urgent">
            <span class="stat-number">{{ stats.pending }}</span>
            <span class="stat-label">待处理</span>
          </div>
          <div class="stat-item success">
            <span class="stat-number">{{ stats.resolved }}</span>
            <span class="stat-label">已处理</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.total }}</span>
            <span class="stat-label">总举报数</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filters-section">
      <el-card shadow="never" class="filters-card">
        <div class="filters-content">
          <div class="filters-left">
            <el-select 
              v-model="filters.status" 
              placeholder="选择状态" 
              clearable
              @change="handleFilterChange"
              class="filter-select"
            >
              <el-option label="全部状态" value=""></el-option>
              <el-option label="待处理" value="pending"></el-option>
              <el-option label="处理中" value="processing"></el-option>
              <el-option label="已解决" value="resolved"></el-option>
              <el-option label="已关闭" value="closed"></el-option>
            </el-select>

            <el-select 
              v-model="filters.type" 
              placeholder="举报类型" 
              clearable
              @change="handleFilterChange"
              class="filter-select"
            >
              <el-option label="全部类型" value=""></el-option>
              <el-option label="虚假信息" value="fake_info"></el-option>
              <el-option label="违规内容" value="inappropriate"></el-option>
              <el-option label="欺诈行为" value="fraud"></el-option>
              <el-option label="垃圾信息" value="spam"></el-option>
              <el-option label="侵权内容" value="copyright"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>

            <el-select 
              v-model="filters.priority" 
              placeholder="优先级" 
              clearable
              @change="handleFilterChange"
              class="filter-select"
            >
              <el-option label="全部优先级" value=""></el-option>
              <el-option label="紧急" value="urgent"></el-option>
              <el-option label="高" value="high"></el-option>
              <el-option label="中" value="medium"></el-option>
              <el-option label="低" value="low"></el-option>
            </el-select>

            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
              class="date-picker"
            />
          </div>

          <div class="filters-right">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索举报ID、举报人、被举报对象..."
              @input="handleSearch"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleBatchProcess" :disabled="selectedReports.length === 0">
              <el-icon><Operation /></el-icon>
              批量处理
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 举报列表 -->
    <div class="reports-list">
      <el-card shadow="never" class="list-card">
        <div class="list-header">
          <div class="list-title">
            <h3>举报列表</h3>
            <span class="count-badge">共 {{ pagination.total }} 条</span>
          </div>
          <div class="list-actions">
            <el-button-group>
              <el-button 
                :type="viewMode === 'table' ? 'primary' : ''" 
                @click="viewMode = 'table'"
                size="small"
              >
                <el-icon><Grid /></el-icon>
                表格视图
              </el-button>
              <el-button 
                :type="viewMode === 'card' ? 'primary' : ''" 
                @click="viewMode = 'card'"
                size="small"
              >
                <el-icon><List /></el-icon>
                卡片视图
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'" class="table-view">
          <el-table
            :data="reportsList"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            stripe
            class="reports-table"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="id" label="举报ID" width="120">
              <template #default="{ row }">
                <el-link type="primary" @click="viewReportDetail(row)">
                  #{{ row.id }}
                </el-link>
              </template>
            </el-table-column>

            <el-table-column label="举报信息" min-width="200">
              <template #default="{ row }">
                <div class="report-info">
                  <div class="report-type">
                    <el-tag :type="getTypeTagType(row.type)" size="small">
                      {{ getTypeText(row.type) }}
                    </el-tag>
                  </div>
                  <div class="report-target">
                    <span class="target-type">{{ row.target_type === 'user' ? '用户' : '商品' }}:</span>
                    <el-link @click="viewTarget(row)">{{ row.target_name }}</el-link>
                  </div>
                  <div class="report-reason">{{ row.reason }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="举报人" width="120">
              <template #default="{ row }">
                <div class="reporter-info">
                  <el-avatar :size="32" :src="row.reporter.avatar">
                    {{ row.reporter.username?.[0] }}
                  </el-avatar>
                  <span class="reporter-name">{{ row.reporter.username }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)" size="small">
                  <el-icon><Flag /></el-icon>
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="举报时间" width="120">
              <template #default="{ row }">
                <div class="time-info">
                  <div>{{ formatDate(row.created_at) }}</div>
                  <small>{{ formatTime(row.created_at) }}</small>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="viewReportDetail(row)"
                    link
                  >
                    详情
                  </el-button>
                  <el-button 
                    v-if="row.status === 'pending'" 
                    type="success" 
                    size="small" 
                    @click="processReport(row)"
                    link
                  >
                    处理
                  </el-button>
                  <el-dropdown @command="(cmd) => handleAction(cmd, row)">
                    <el-button size="small" link>
                      更多<el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="priority">设置优先级</el-dropdown-item>
                        <el-dropdown-item command="assign">分配处理人</el-dropdown-item>
                        <el-dropdown-item command="close" divided>关闭举报</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="card-view">
          <div class="reports-grid">
            <div 
              v-for="report in reportsList" 
              :key="report.id" 
              class="report-card"
              :class="{ urgent: report.priority === 'urgent' }"
            >
              <div class="card-header">
                <div class="card-left">
                  <el-checkbox 
                    v-model="selectedReportIds" 
                    :label="report.id"
                    @change="updateSelection"
                  />
                  <span class="report-id">#{{ report.id }}</span>
                  <el-tag :type="getTypeTagType(report.type)" size="small">
                    {{ getTypeText(report.type) }}
                  </el-tag>
                </div>
                <div class="card-right">
                  <el-tag :type="getPriorityTagType(report.priority)" size="small">
                    <el-icon><Flag /></el-icon>
                    {{ getPriorityText(report.priority) }}
                  </el-tag>
                  <el-tag :type="getStatusTagType(report.status)" size="small">
                    {{ getStatusText(report.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="card-content">
                <div class="target-info">
                  <span class="target-label">{{ report.target_type === 'user' ? '举报用户:' : '举报商品:' }}</span>
                  <el-link @click="viewTarget(report)" class="target-link">
                    {{ report.target_name }}
                  </el-link>
                </div>
                <div class="reason-text">{{ report.reason }}</div>
                
                <div class="reporter-section">
                  <el-avatar :size="24" :src="report.reporter.avatar">
                    {{ report.reporter.username?.[0] }}
                  </el-avatar>
                  <span class="reporter-name">{{ report.reporter.username }}</span>
                  <span class="report-time">{{ formatRelativeTime(report.created_at) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <el-button size="small" @click="viewReportDetail(report)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
                <el-button 
                  v-if="report.status === 'pending'" 
                  type="primary" 
                  size="small" 
                  @click="processReport(report)"
                >
                  <el-icon><Check /></el-icon>
                  处理
                </el-button>
                <el-button size="small" @click="handleAction('assign', report)">
                  <el-icon><User /></el-icon>
                  分配
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 举报详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="举报详情"
      width="900px"
      class="report-detail-dialog"
    >
      <div v-if="detailDialog.data" class="detail-content">
        <div class="detail-header">
          <div class="detail-basic">
            <h3>举报 #{{ detailDialog.data.id }}</h3>
            <div class="detail-tags">
              <el-tag :type="getTypeTagType(detailDialog.data.type)">
                {{ getTypeText(detailDialog.data.type) }}
              </el-tag>
              <el-tag :type="getPriorityTagType(detailDialog.data.priority)">
                {{ getPriorityText(detailDialog.data.priority) }}
              </el-tag>
              <el-tag :type="getStatusTagType(detailDialog.data.status)">
                {{ getStatusText(detailDialog.data.status) }}
              </el-tag>
            </div>
          </div>
          <div class="detail-time">
            <div>举报时间: {{ formatDateTime(detailDialog.data.created_at) }}</div>
            <div v-if="detailDialog.data.updated_at">
              更新时间: {{ formatDateTime(detailDialog.data.updated_at) }}
            </div>
          </div>
        </div>

        <el-divider />

        <div class="detail-body">
          <div class="detail-section">
            <h4>举报信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>举报对象:</label>
                <span>{{ detailDialog.data.target_type === 'user' ? '用户' : '商品' }} - {{ detailDialog.data.target_name }}</span>
              </div>
              <div class="info-item">
                <label>举报人:</label>
                <div class="reporter-detail">
                  <el-avatar :size="32" :src="detailDialog.data.reporter.avatar">
                    {{ detailDialog.data.reporter.username?.[0] }}
                  </el-avatar>
                  <span>{{ detailDialog.data.reporter.username }}</span>
                </div>
              </div>
            </div>
            <div class="reason-section">
              <label>举报原因:</label>
              <div class="reason-content">{{ detailDialog.data.reason }}</div>
            </div>
            <div v-if="detailDialog.data.evidence" class="evidence-section">
              <label>证据材料:</label>
              <div class="evidence-list">
                <el-image
                  v-for="(img, index) in detailDialog.data.evidence"
                  :key="index"
                  :src="img"
                  class="evidence-image"
                  fit="cover"
                  preview-teleported
                />
              </div>
            </div>
          </div>

          <div v-if="detailDialog.data.processing_history?.length" class="detail-section">
            <h4>处理历史</h4>
            <el-timeline class="processing-timeline">
              <el-timeline-item
                v-for="(item, index) in detailDialog.data.processing_history"
                :key="index"
                :timestamp="formatDateTime(item.timestamp)"
                :type="getTimelineType(item.action)"
              >
                <div class="timeline-content">
                  <div class="timeline-action">{{ item.action }}</div>
                  <div class="timeline-operator">操作人: {{ item.operator }}</div>
                  <div v-if="item.note" class="timeline-note">{{ item.note }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
          <el-button 
            v-if="detailDialog.data?.status === 'pending'" 
            type="primary" 
            @click="processReport(detailDialog.data)"
          >
            立即处理
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理举报对话框 -->
    <el-dialog
      v-model="processDialog.visible"
      title="处理举报"
      width="600px"
      class="process-dialog"
    >
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="处理结果" prop="result">
          <el-radio-group v-model="processForm.result">
            <el-radio value="valid">举报成立</el-radio>
            <el-radio value="invalid">举报不成立</el-radio>
            <el-radio value="partial">部分成立</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="处理措施" prop="action">
          <el-checkbox-group v-model="processForm.actions">
            <el-checkbox value="warning">警告</el-checkbox>
            <el-checkbox value="delete_content">删除内容</el-checkbox>
            <el-checkbox value="restrict">限制功能</el-checkbox>
            <el-checkbox value="suspend">暂停账号</el-checkbox>
            <el-checkbox value="ban">封禁账号</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="处理说明" prop="note">
          <el-input
            v-model="processForm.note"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明..."
          />
        </el-form-item>

        <el-form-item label="通知相关方">
          <el-switch
            v-model="processForm.notify"
            active-text="发送通知"
            inactive-text="不发送"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess" :loading="processDialog.loading">
            确认处理
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Warning, Search, Operation, RefreshLeft, Grid, List, Flag, ArrowDown, 
  View, Check, User 
} from '@element-plus/icons-vue'

// 简单的 debounce 实现
const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    const context = this;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

// 响应式数据
const loading = ref(false)
const viewMode = ref('table')
const selectedReports = ref([])
const selectedReportIds = ref([])

// 统计数据
const stats = ref({
  pending: 23,
  resolved: 156,
  total: 179
})

// 筛选条件
const filters = reactive({
  status: '',
  type: '',
  priority: '',
  dateRange: null,
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 举报列表数据
const reportsList = ref([])

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: null
})

// 处理对话框
const processDialog = reactive({
  visible: false,
  loading: false
})

const processForm = reactive({
  result: '',
  actions: [],
  note: '',
  notify: true
})

const processRules = {
  result: [{ required: true, message: '请选择处理结果', trigger: 'change' }],
  note: [{ required: true, message: '请填写处理说明', trigger: 'blur' }]
}

const processFormRef = ref()

// 计算属性
const currentReport = ref(null)

// 方法
const handleFilterChange = () => {
  pagination.page = 1
  fetchReports()
}

const handleSearch = debounce(() => {
  pagination.page = 1
  fetchReports()
}, 500)

const resetFilters = () => {
  Object.assign(filters, {
    status: '',
    type: '',
    priority: '',
    dateRange: null,
    keyword: ''
  })
  pagination.page = 1
  fetchReports()
}

const handleSelectionChange = (selection) => {
  selectedReports.value = selection
  selectedReportIds.value = selection.map(item => item.id)
}

const updateSelection = () => {
  // 更新选中状态
}

const handleBatchProcess = () => {
  if (selectedReports.value.length === 0) {
    ElMessage.warning('请选择要处理的举报')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量处理选中的 ${selectedReports.value.length} 条举报吗？`,
    '批量处理',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行批量处理逻辑
    ElMessage.success('批量处理完成')
    fetchReports()
  })
}

const viewReportDetail = (report) => {
  detailDialog.data = {
    ...report,
    processing_history: [
      {
        action: '举报提交',
        operator: report.reporter.username,
        timestamp: report.created_at,
        note: '用户提交举报'
      },
      {
        action: '分配处理人',
        operator: '系统自动',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        note: '自动分配给管理员处理'
      }
    ]
  }
  detailDialog.visible = true
}

const processReport = (report) => {
  currentReport.value = report
  processForm.result = ''
  processForm.actions = []
  processForm.note = ''
  processForm.notify = true
  processDialog.visible = true
}

const submitProcess = () => {
  processFormRef.value?.validate((valid) => {
    if (valid) {
      processDialog.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        processDialog.loading = false
        processDialog.visible = false
        ElMessage.success('举报处理完成')
        fetchReports()
      }, 1000)
    }
  })
}

const viewTarget = (report) => {
  // 跳转到对应的用户或商品页面
  ElMessage.info(`查看${report.target_type === 'user' ? '用户' : '商品'}: ${report.target_name}`)
}

const handleAction = (command, report) => {
  switch (command) {
    case 'priority':
      // 设置优先级逻辑
      ElMessage.info('设置优先级功能')
      break
    case 'assign':
      // 分配处理人逻辑
      ElMessage.info('分配处理人功能')
      break
    case 'close':
      // 关闭举报逻辑
      ElMessageBox.confirm('确定要关闭这个举报吗？', '确认关闭', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('举报已关闭')
        fetchReports()
      })
      break
  }
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchReports()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  fetchReports()
}

// 获取举报列表
const fetchReports = async () => {
  loading.value = true
  
  try {
    // 这里调用实际的API
    // const response = await api.getReports({ ...filters, ...pagination })
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData = generateMockReports()
    reportsList.value = mockData.list
    pagination.total = mockData.total
    
  } catch (error) {
    console.error('获取举报列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 生成模拟数据
const generateMockReports = () => {
  const types = ['fake_info', 'inappropriate', 'fraud', 'spam', 'copyright', 'other']
  const priorities = ['urgent', 'high', 'medium', 'low']
  const statuses = ['pending', 'processing', 'resolved', 'closed']
  
  const list = Array.from({ length: pagination.size }, (_, index) => ({
    id: `R${String(Date.now() + index).slice(-8)}`,
    type: types[Math.floor(Math.random() * types.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    target_type: Math.random() > 0.5 ? 'user' : 'product',
    target_name: Math.random() > 0.5 ? '张三的二手iPhone' : '用户李四',
    reason: '该内容涉嫌虚假宣传，与实际商品不符，请核实处理。',
    reporter: {
      username: `user${Math.floor(Math.random() * 1000)}`,
      avatar: null
    },
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updated_at: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
    evidence: Math.random() > 0.7 ? [
      'https://via.placeholder.com/400x300?text=Evidence1',
      'https://via.placeholder.com/400x300?text=Evidence2'
    ] : null
  }))
  
  return {
    list,
    total: 179
  }
}

// 辅助函数
const getTypeText = (type) => {
  const map = {
    fake_info: '虚假信息',
    inappropriate: '违规内容', 
    fraud: '欺诈行为',
    spam: '垃圾信息',
    copyright: '侵权内容',
    other: '其他'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    fake_info: 'danger',
    inappropriate: 'warning',
    fraud: 'danger',
    spam: 'info',
    copyright: 'warning',
    other: ''
  }
  return map[type] || ''
}

const getPriorityText = (priority) => {
  const map = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || priority
}

const getPriorityTagType = (priority) => {
  const map = {
    urgent: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return map[priority] || ''
}

const getStatusText = (status) => {
  const map = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    processing: 'info',
    resolved: 'success',
    closed: ''
  }
  return map[status] || ''
}

const getTimelineType = (action) => {
  if (action.includes('提交') || action.includes('创建')) return 'primary';
  if (action.includes('处理') || action.includes('分配')) return 'info';
  if (action.includes('解决') || action.includes('完成')) return 'success';
  if (action.includes('关闭') || action.includes('拒绝')) return 'danger';
  return '';
}
</script>

<style scoped>
/* 页面背景和内边距 - 保留特定背景 */
.reports-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 保留特定背景 */
}

/* 页面头部 - 移除大部分，保留特定样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 28px; /* 保留特定字体大小 */
  font-weight: 700; /* 保留特定字体粗细 */
  color: #1e293b;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item .stat-number {
  font-size: 24px; /* 保留特定字体大小 */
  font-weight: 700; /* 保留特定字体粗细 */
  color: #1e293b;
}

.stat-item .stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-item.urgent .stat-number {
  color: #ef4444; /* 保留特定颜色 */
}

.stat-item.success .stat-number {
  color: #10b981; /* 保留特定颜色 */
}

/* 筛选区域 - 移除大部分，保留特定样式 */
.filters-section {
  margin-bottom: 24px;
}

.filters-card :deep(.el-card__body) {
  padding: 24px;
}

.filters-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 保留特定对齐方式 */
  gap: 20px;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1; /* 填充剩余空间 */
}

.filter-select {
  width: 150px; /* 保留特定宽度 */
}

.date-picker {
  width: 240px; /* 保留特定宽度 */
}

.filters-right {
  display: flex;
  gap: 12px; /* 保留特定间距 */
  align-items: center; /* 保留特定对齐方式 */
}

.search-input {
  width: 250px; /* 保留特定宽度 */
}

/* 举报列表 - 移除大部分，保留特定样式 */
.reports-list {
  margin-bottom: 24px;
}

.list-card :deep(.el-card__body) {
  padding: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-title h3 {
  margin: 0;
  font-size: 18px; /* 保留特定字体大小 */
  font-weight: 600; /* 保留特定字体粗细 */
  color: #1e293b;
}

.count-badge {
  font-size: 14px;
  color: #64748b;
  margin-left: 12px;
}

/* 表格视图 - 保留特定样式 */
.table-view {
  /* styles */
}

.reports-table :deep(.el-table__header th) {
  background-color: #f8fafc !important;
  color: #374151;
  font-weight: 600 !important;
}

/* 举报信息列样式 - 保留特定样式 */
.report-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-type {
  /* styles */
}

.report-target {
  font-size: 14px;
  color: #333;
}

.target-type {
  font-weight: bold;
  margin-right: 4px;
}

.report-reason {
  font-size: 13px; /* 保留特定字体大小 */
  color: #666;
  display: -webkit-box; /* 多行文本截断 */
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 举报人列样式 - 保留特定样式 */
.reporter-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reporter-name {
  font-size: 14px; /* 保留特定字体大小 */
  color: #555;
}

/* 优先级标签样式 - 保留特定样式 */
.priority-tag .el-icon {
  vertical-align: -2px;
  margin-right: 4px;
}

/* 状态标签样式 - 保留特定样式 */
/* .status-tag {
  styles
} */

/* 举报时间样式 - 保留特定样式 */
.time-info {
  font-size: 13px;
  color: #606266;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-info small {
  font-size: 12px;
  color: #909399;
}

/* 操作按钮样式 - 保留特定样式 */
.table-actions .el-button {
  padding: 0;
  height: auto;
}

/* 卡片视图 - 保留特定样式 */
.card-view {
  /* styles */
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* 保留特定网格布局 */
  gap: 20px;
}

.report-card {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.report-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.report-card.urgent {
  border-left: 4px solid #ef4444; /* 保留特定边框 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-id {
  font-weight: bold;
  color: #303133;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  margin-bottom: 16px;
}

.target-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.target-label {
  font-weight: bold;
  margin-right: 4px;
}

.target-link {
  font-size: 14px;
}

.reason-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 12px;
}

.reporter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
}

.report-time {
  margin-left: auto; /* 时间靠右 */
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 举报详情对话框 - 移除大部分，保留特定样式 */
.detail-content {
  /* padding: 20px; 提取到 common */
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-basic h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.detail-tags .el-tag {
  margin-right: 8px;
}

.detail-time {
  font-size: 14px;
  color: #909399;
  text-align: right;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.info-item label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.reporter-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reason-section label,
.evidence-section label {
  font-weight: bold;
  color: #606266;
  display: block;
  margin-bottom: 8px;
}

.reason-content,
.timeline-note {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.evidence-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.evidence-image {
  width: 100px; /* 保留特定尺寸 */
  height: 100px; /* 保留特定尺寸 */
  border-radius: 8px;
  object-fit: cover;
}

/* 处理历史时间线样式 */
.processing-timeline {
  margin-top: 16px;
}

.timeline-content {
  font-size: 14px;
  color: #555;
}

.timeline-action {
  font-weight: bold;
  margin-bottom: 4px;
}

.timeline-operator {
  font-size: 13px;
  color: #777;
}

/* 处理举报对话框 - 移除通用部分，保留特定样式 */
.process-dialog .el-form-item {
  margin-bottom: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
/*   .reports-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
    gap: 12px;
  }

  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left,
  .filters-right {
    width: 100%;
    gap: 12px;
  }

  .filters-left > *,
  .filters-right > * {
      width: 100% !important;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .count-badge {
    margin-left: 0;
    margin-top: 8px;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .report-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-right {
    width: 100%;
    justify-content: space-between;
  }

  .reporter-section {
      flex-wrap: wrap;
  }

  .report-time {
      margin-left: 0;
      width: 100%;
      text-align: right;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-time {
    margin-top: 12px;
    text-align: left;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
 */
}
</style>