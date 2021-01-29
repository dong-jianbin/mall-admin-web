<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询搜索
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="任务名称" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()" style="margin-left: 20px">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="jobTable" :data="tableData" style="width:100%" border center>
        <el-table-column prop="jobName" label="任务名称" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column prop="jobGroup" label="任务所在组" sortable align="center"></el-table-column>
        <el-table-column prop="jobClassName" label="任务类名" align="center"></el-table-column>
        <el-table-column prop="triggerName" label="触发器名称" align="center"></el-table-column>
        <el-table-column prop="triggerGroup" label="触发器所在组" sortable align="center"></el-table-column>
        <el-table-column prop="cronExpression" label="表达式" align="center"></el-table-column>
        <el-table-column prop="timeZoneId" label="时区" align="center"></el-table-column>
        <el-table-column prop="triggerState" label="状态" align="center" :formatter="formatState"></el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template slot-scope="scope">
            <el-button size="small" type="warning" @click="handlePause(scope.$index, scope.row)">
                暂停
            </el-button>
            <el-button size="small" type="info" @click="handleResume(scope.$index, scope.row)">
                恢复
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                删除
            </el-button>
            <el-button size="small" type="success" @click="handleUpdate(scope.$index, scope.row)">
                修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <div align="center">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalCount">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="添加任务" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="任务名称" label-width="100px" style="width:90%">
            <el-input v-model="form.jobName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="任务分组" label-width="100px" style="width:90%">
            <el-input v-model="form.jobGroup" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="表达式" label-width="100px" style="width:90%">
            <el-input v-model="form.cronExpression" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>
      <el-dialog title="修改任务" :visible.sync="updateFormVisible">
      <el-form :model="updateform">
        <el-form-item label="表达式" label-width="100px" style="width:90%">
            <el-input v-model="updateform.cronExpression" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="update">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList,doPost,doPut,doDelete} from '@/api/job';

  const defaultListQuery = {
    currentPage: 1,
    pageSize: 10,
    keyword: null
  };

  const defaultOprationParams = {
    jobClassName: null,
    jobGroupName: null,
    cronExpression: null
  };

  export default {
    name: 'joblist',
    data() {
      return {
            listQuery: Object.assign({}, defaultListQuery),
            oprationParams: Object.assign({}, defaultOprationParams),
            //表格当前页数据
            tableData: [],
            //请求的URL
            url: 'job',
            //默认每页数据量
            pagesize: 10,
            //当前页码
            currentPage: 1,
            //查询的页码
            start: 1,
            //默认数据总数
            totalCount: 1000,
            //添加对话框默认可见性
            dialogFormVisible: false,
            //修改对话框默认可见性
            updateFormVisible: false,
            //提交的表单
            form: {
                jobName: '',
                jobGroup: '',
                cronExpression: ''
            },
            updateform: {
                jobName: '',
                jobGroup: '',
                cronExpression: ''
            },
            loading: false
      }
    },
    created() {
      this.listQuery.currentPage = this.currentPage;
      this.listQuery.pageSize = this.pagesize;
      this.loadData(this.currentPage, this.pagesize);
    },
    methods: {
      // 格式化状态
      formatState: function (row, column, cellValue, index) {
          if (row.triggerState === 'WAITING' || row.triggerState === 'ACQUIRED') {
              return "运行中";
          } else if (row.triggerState === 'PAUSED') {
              return "暂停";
          } else {
              return "未知状态";
          }
      },
      // 从服务器读取数据
      loadData: function (currentPage, pageSize) {
        this.loading = true;
        this.listQuery.currentPage = currentPage;
        this.listQuery.pageSize = pageSize;

        fetchList(this.listQuery).then(response => {
          this.loading = false;
          this.tableData = response.data.list;
          this.totalCount = response.data.total;
        });
      },
      // 删除任务
      handleDelete: function (index, row) {
        this.oprationParams.jobClassName = row.jobName;
        this.oprationParams.jobGroupName = row.jobGroup;
        
        doDelete(this.oprationParams).then(response => {
          this.loadData(this.currentPage, this.pagesize);
        });
      },
      // 暂停任务
      handlePause: function (index, row) {

        this.oprationParams.jobClassName = row.jobName;
        this.oprationParams.jobGroupName = row.jobGroup;
        delete this.oprationParams.resume;
        delete this.oprationParams.cron;
        let type = {pause: "pause"};
        
        doPut(this.oprationParams, type).then(response => {
          this.loadData(this.currentPage, this.pagesize);
        });
      },
      // 恢复任务
      handleResume: function (index, row) {
        this.oprationParams.jobClassName = row.jobName;
        this.oprationParams.jobGroupName = row.jobGroup;
        delete this.oprationParams.pause;
        delete this.oprationParams.cron;
        let type = {resume: "resume"};
        
        doPut(this.oprationParams, type).then(response => {
          this.loadData(this.currentPage, this.pagesize);
        });
      },
      // 搜索
      search: function () {
          this.loadData(this.currentPage, this.pagesize);
      },
      // 弹出对话框
      handleAdd: function () {
          this.dialogFormVisible = true;
      },
      // 添加
      add: function () {
        this.oprationParams.jobClassName = this.form.jobName;
        this.oprationParams.jobGroupName = this.form.jobGroup;
        this.oprationParams.cronExpression = this.form.cronExpression;
        
        doPost(this.oprationParams).then(response => {
          this.loadData(this.currentPage, this.pagesize);
          this.dialogFormVisible = false;
        });
      },
      // 更新
      handleUpdate: function (index, row) {
          console.log(row);
          this.updateFormVisible = true;
          this.updateform.jobName = row.jobName;
          this.updateform.jobGroup = row.jobGroup;
      },
      // 更新任务
      update: function () {
        this.oprationParams.jobClassName = this.updateform.jobName;
        this.oprationParams.jobGroupName = this.updateform.jobGroup;
        this.oprationParams.cronExpression = this.updateform.cronExpression;
        delete this.oprationParams.pause;
        delete this.oprationParams.resume;
        let type = {cron: "cron"};
        
        doPut(this.oprationParams, type).then(response => {
          this.loadData(this.currentPage, this.pagesize);
          this.updateFormVisible = false;
        });

      },
      // 每页显示数据量变更
      handleSizeChange: function (val) {
          this.pagesize = val;
          this.loadData(this.currentPage, this.pagesize);
      },
      // 页码变更
      handleCurrentChange: function (val) {
          this.currentPage = val;
          this.loadData(this.currentPage, this.pagesize);
      }
   }

  }
</script>

<style>
</style>


