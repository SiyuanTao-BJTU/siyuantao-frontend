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
.reports-container {
  padding: 24px;
  /* Use the overall light gray background from AdminLayout */
  background: #F8F9FA; /* Match AdminLayout background */
  min-height: calc(100vh - 60px);
}

/* Page Header - Adjust to match UserManagementView */
.page-header {
  margin-bottom: 24px;
}

.header-content {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 32px; /* Match UserManagementView header padding */
   background: rgba(255, 255, 255, 0.95); /* Match UserManagementView header background */
   backdrop-filter: blur(10px); /* Keep backdrop-filter if desired */
   border-radius: 20px; /* Match UserManagementView header radius */
   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* Match UserManagementView header shadow */
}

.header-left {
   display: flex;
   flex-direction: column;
   justify-content: center;
}

.page-title {
   font-size: 28px; /* Match UserManagementView */
   font-weight: 700;
   background: linear-gradient(135deg, #667eea, #764ba2); /* Keep unique gradient */
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
   margin: 0 0 8px 0;
}

.page-subtitle {
   font-size: 16px; /* Match UserManagementView */
   color: #64748b; /* Match UserManagementView */
   margin: 0;
}

/* Stats - Adjust to match UserManagementView */
.header-stats {
  display: grid; /* Use grid layout */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Responsive grid */
  gap: 20px; /* Consistent gap */
  /* Remove header-stats specific flex/alignment */
  /* display: flex; */
  /* align-items: center; */
  /* gap: 20px; */
}

.stat-item {
   display: flex;
   flex-direction: column;
   align-items: center;
   padding: 24px; /* Match UserManagementView stat card padding */
   background: #FFFFFF; /* White background for stat items */
   border-radius: 8px; /* Rounded corners */
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Subtle shadow */
}

/* Keep unique stat item colors */
.stat-item.urgent { border-left: 4px solid #ef4444; /* Danger color */ }
.stat-item.success { border-left: 4px solid #10b981; /* Success color */ }
.stat-item.primary { border-left: 4px solid #3b82f6; /* Primary color */ }


.stat-item .stat-number {
   font-size: 24px; /* Match UserManagementView */
   font-weight: bold; /* Match UserManagementView */
   color: #303133; /* Match UserManagementView */
   margin-bottom: 4px;
}

.stat-item .stat-label {
   font-size: 14px; /* Match UserManagementView */
   color: #606266; /* Match UserManagementView */
}


/* Filter and Search Area - Adjust to match UserManagementView */
.filters-section {
  margin-bottom: 24px;
}

.filters-card {
  border-radius: 12px; /* Match UserManagementView radius */
  background: #FFFFFF; /* White background for filter card */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Match UserManagementView shadow */
}

.filters-card :deep(.el-card__body) {
  padding: 24px; /* Match UserManagementView padding */
}

.filters-content {
  /* Remove padding as it's now on the card body */
  /* padding: 20px; */
}

.filters-left,
.filters-right {
   display: flex;
   align-items: center;
   gap: 12px; /* Consistent gap */
   /* Remove flex-wrap if not intended */
   /* flex-wrap: wrap; */
}

.filters-left > *, .filters-right > * {
    /* Ensure elements within flex containers dont stretch unnecessarily */
     flex-shrink: 0;
}

.filter-select,
.date-picker {
  width: auto; /* Allow select/date picker to size based on content or grid */
  min-width: 150px; /* Ensure minimum width */
}

.search-input {
  flex-grow: 1; /* Allow search input to grow */
  min-width: 250px; /* Ensure minimum width */
}

/* Adjust filter row for consistency */
.filters-content {
  display: flex; /* Use flexbox for layout */
  flex-direction: column; /* Stack filter rows vertically */
  gap: 20px; /* Space between filter rows */
}

.filters-left {
  flex-wrap: wrap; /* Allow items to wrap in the left filter section */
}

.filters-right {
  justify-content: flex-end; /* Align actions to the right */
  width: 100%; /* Take full width */
}


/* Advanced Filter Area - Adjust to match UserManagementView pattern */
.advanced-filter {
  /* Use consistent padding and background/shadow if it were a separate card */
  /* For now, just adjust internal spacing */
   margin-top: 20px; /* Space after basic filter row */
}

.advanced-filter-row {
  display: grid; /* Use grid layout */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Responsive grid */
  gap: 20px; /* Consistent gap */
  align-items: center; /* Vertically align items */
}

.advanced-filter-row .el-select,
.advanced-filter-row .el-input-number {
  width: 100%; /* Ensure inputs take full width of grid item */
}


/* Reports List (Table/Card View) - Adjust to match UserManagementView Table Card */
.reports-list {
   margin-top: 24px; /* Space above the list card */
}

.list-card {
  border-radius: 12px; /* Match UserManagementView radius */
  background: #FFFFFF; /* White background for table card */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* Match UserManagementView shadow */
}

.list-card :deep(.el-card__body) {
  padding: 24px; /* Match UserManagementView padding */
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* Space below header */
}

.list-title h3 {
  font-size: 18px; /* Match UserManagementView table header */
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.count-badge {
  font-size: 14px; /* Match UserManagementView result count */
  color: #64748b;
  margin-left: 12px;
}

/* Table View - Adjust table styles to match UserManagementView */
.table-view {
  /* Styles for the table container */
}

.reports-table {
  width: 100%; /* Ensure table takes full width */
}

.reports-table :deep(.el-table__header th) {
   background-color: #f8f8f8 !important; /* Match UserManagementView */
   color: #606266; /* Match UserManagementView */
   font-weight: bold; /* Match UserManagementView */
}

.reports-table :deep(.el-table__cell) {
   padding: 12px 0; /* Match UserManagementView padding */
}

/* Specific column styles to match UserManagementView */
.report-info {
   display: flex;
   flex-direction: column;
   gap: 4px; /* Space between items */
}

.report-type .el-tag {
  /* Default tag styling is fine */
}

.report-target {
   font-size: 14px;
   color: #303133;
}

.target-type {
   font-weight: bold;
   margin-right: 4px;
}

.report-reason {
   font-size: 13px;
   color: #606266;
   /* Allow text wrapping */
   white-space: normal; /* Override nowrap if applied elsewhere */
}

.reporter-info {
   display: flex;
   align-items: center;
   gap: 8px; /* Consistent gap */
}

.reporter-name {
   font-size: 14px;
   color: #303133;
}

.time-info {
   font-size: 13px;
   color: #606266;
   display: flex;
   flex-direction: column;
   gap: 4px;
}

.table-actions .el-button {
   padding: 4px 8px; /* Adjust button padding */
   font-size: 12px; /* Adjust font size */
}

/* Card View - Keep existing styles but ensure consistency where applicable */
.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.report-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.report-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.card-meta {
  font-size: 12px;
  color: #999;
}

.card-content {
  margin-bottom: 15px;
}

.card-actions {
  text-align: right;
}

/* Detail Dialog - Keep specific styles but align padding/margins */
.detail-dialog :deep(.el-dialog__body) {
  padding: 20px; /* Consistent dialog body padding */
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5; /* Keep separator */
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

.evidence-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.evidence-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.reason-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* Process Dialog - Keep specific styles but align padding/margins */
.process-dialog :deep(.el-dialog__body) {
  padding: 20px; /* Consistent dialog body padding */
}

.dialog-footer {
   text-align: right;
   padding-top: 20px; /* Space above footer buttons */
   border-top: 1px solid #ebeef5; /* Add a separator */
}
</style>