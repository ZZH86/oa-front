<template>
    <div class="app-container">
        <!--查询表单-->
        <div class="search-div">
            <el-form label-width="70px" size="small">
               <el-row>
                    <el-col :span="24">
                        <el-form-item label="角色名称">
                            <el-input style="width: 100%" v-model="searchObj.roleName" placeholder="角色名称"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row style="display:flex">
                    <el-button type="primary" icon="el-icon-search" size="mini" :loading="loading" @click="fetchData()">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetData">重置</el-button>
                </el-row>
            </el-form>
        </div>
        <!-- 表格 -->
        <el-table
            v-loading="listLoading"
            :data="list"
            stripe
            border
            style="width: 100%;margin-top: 10px;"
            @selection-change="handleSelectionChange">
        <el-table-column type="selection"/>

        <el-table-column
            label="序号"
            width="170"
            align="center">
            <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
            </template>
        </el-table-column>

        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="300" align="center" fixed="right">
            <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)" title="修改"/>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDataById(scope.row.id)" title="删除"/>
            <el-button type="warning" icon="el-icon-baseball" size="mini" @click="showAssignAuth(scope.row)" title="分配权限"/>
            </template>
        </el-table-column>
        </el-table>
        <div class="tools-div">
            <el-button type="success" icon="el-icon-plus" size="mini" @click="add" :disabled="$hasBP('bnt.sysRole.add')  === false">添 加</el-button>
            <el-button class="btn-add" size="mini" type="success" @click="batchRemove()" >批量删除</el-button>
        </div>
        <!-- 分页组件 -->
        <el-pagination
            :current-page="page"
            :total="total"
            :page-size="limit"
            style="padding: 30px 0; text-align: center;"
            layout="total, prev, pager, next, jumper"
            @current-change="fetchData"
        />
        <el-dialog title="添加/修改" :visible.sync="dialogVisible" width="40%" >
            <el-form ref="dataForm" :model="sysRole" label-width="150px" size="small" style="padding-right: 40px;">
                <el-form-item label="角色名称">
                    <el-input v-model="sysRole.roleName"/>
                </el-form-item>
                <el-form-item label="角色编码">
                    <el-input v-model="sysRole.roleCode"/>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false" size="small" icon="el-icon-refresh-right">取 消</el-button>
                <el-button type="primary" icon="el-icon-check" @click="saveOrUpdate()" size="small">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import api from '@/api/system/sysRole'
import { appendFile } from 'fs'
    export default {
        // 定义数据模型
        data() {
            return {
                list:[],  // 角色列表
                page:1,   // 当前页
                limit:4, // 每页显示记录数
                total:0,   // 总记录数
                searchObj:{},// 条件对象

                dialogVisible: false,
                sysRole: {},
                saveBtnDisabled: false,
                multipleSelection: []  // 批量删除选中的记录列表
            }
        },
        // 页面渲染成功前获取数据
        created() {
            this.fetchData()
        },
        // 定义方法
        methods: {
            //跳转到分配菜单页面
            showAssignAuth(row) {
                //实现路由跳转
                this.$router.push('/system/assignAuth?id='+row.id+'&roleName='+row.roleName);
            },
            // 条件分页查询
            fetchData(current=1) {
                this.page = current
                api.getPageList(this.page,this.limit,this.searchObj)
                    .then(response =>{
                        this.list = response.data.records
                        this.total = response.data.total
                })
            },
            // 删除
            removeDataById(id){
                this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => { // promise
                    // 点击确定，远程调用ajax
                    return api.removeById(id)
                }).then((response) => {
                    // 刷新页面
                    this.fetchData(this.page)
                    // 提示信息
                    this.$message.success(response.message || '删除成功')
                })
            },
            // 重置表单
            resetData() {
                console.log('重置查询表单')
                this.searchObj = {}
                this.fetchData()
            },
            fetchDataById(id){
                api.getRoleById(id).then(response =>{
                    this.sysRole = response.data
                })

            },
            // 添加
            add(){
                this.sysRole = {}
                this.dialogVisible = true
            },
            edit(id){
                this.fetchDataById(id)
                this.dialogVisible = true
            },
            saveOrUpdate(){
                this.saveBtnDisabled = true
                if(!this.sysRole.id){
                    this.roleSave()
                }else{
                    this.roleUpdate()
                }
            },
            roleSave(){
                api.save(this.sysRole).then(response => {
                    this.$message.success(response.message || '操作成功')
                    this.dialogVisible = false
                    this.fetchData(this.page)
                })
            },
            roleUpdate(){
                api.updateById(this.sysRole).then(response => {
                    this.$message.success(response.message || '操作成功')
                    this.dialogVisible = false
                    this.fetchData(this.page)
                })
            },
            //批量删除
            handleSelectionChange(selection){
                this.multipleSelection = selection
            },
            batchRemove(){
                if(this.multipleSelection.length === 0){
                    this.$message.warning('请选择要删除的记录！')
                    return
                }
                this.$confirm('此操作将永久删除该记录，是否继续？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(() => {
                    //点击确定,远程调用ajax
                    //遍历section，将id放入idList
                    var idList = []
                    this.multipleSelection.forEach(item => {
                        idList.push(item.id)
                    })
                    //调用api
                    return api.batchRemove(idList)
                }).then(response => {
                    this.fetchData()
                    this.$message.success(response.message || '删除成功')
                })
            },

        }
    }
</script>