/**
 * Created by HUB-211 on 2019/7/24.
 */

layui.use(['table', 'jquery', 'layer', 'form','laytpl','util'], function () {
    var reg = /project_task\/(\d+)/;
    var r = window.location.pathname.match(reg);
    var pid = 0;
    if(r!=null){
        pid = r[1];
    }
    var table = layui.table,
        layer = layui.layer,
        form = layui.form,
        util = layui.util,
        $ = layui.jquery;
    var laytpl = layui.laytpl;
    var myInit ={
        getCookie : function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for ( var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie
                            .substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
        },
        };
    var csrftoken = myInit.getCookie('csrftoken');

    $("#project"+pid).addClass("layui-nav-itemed");
    $("#project"+pid+" .task").addClass("layui-this");

    var content = '<i class="layui-icon">&#xe602;</i> 自动化测试';
    $("#switchNav").append(content);
    //渲染表格
    var taskTable = table.render({//渲染table
        method: 'get',//数据传输方式为post
        height: '475',//高度
        cellMinWidth: 80,//单元格最小宽度为80
        page: true,//开启分页
        limit: 10,//分页默认为30
        where: {
            'pid':pid,
            'csrfmiddlewaretoken':csrftoken
        },
        elem: '#project-task-table',//设置容器
        url: '/get_project_tasks',//数据获取url
        id:'taskTable',
        cols: [[//设置列标签、标题、宽度、是否排序等
            {type:'numbers'},
            {type: 'checkbox'},
            {field: 'id', title: 'ID', width: 100, sort: true,align:'center'},
            {field: 'task_name', title: '任务名', width: 300,align:'center'},
            {field: 'last_task_time', title: '最近一次执行时间',width: 240,sort:true,align:'center'},
            {field: 'last_task_result', title: '最近一次执行结果',width: 180,templet:'#lastresultstatus',align:'center'},
            {field: 'last_duration', title: '最近一次执行时长',width: 180,
                templet:function (d) {
                    return formatSeconds(d.last_duration)
                },align:'center'},
            {field: 'next_time', title: '下一次执行时间',align:'center'},
            {field: 'task_status', title: '状态',width: 100, templet:'#switchstauts',align:'center'},
            {fixed: 'right', title:'操作', width: 250, toolbar: '#bartask',align:'center'},//设置每行的工具栏以及其容器
        ]],
    });

    function formatSeconds(value) {
        if (value == null){
            return '';
        }
        var secondTime = parseInt(value);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = parseInt(secondTime / 60);
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = parseInt(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if(minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                //获取小时后取佘的分，获取分钟除以60取佘的分
                minuteTime = parseInt(minuteTime % 60);
            }
        }
        var result = "" + parseInt(secondTime) + "秒";

        if(minuteTime > 0) {
            result = "" + parseInt(minuteTime) + "分" + result;
        }
        if(hourTime > 0) {
            result = "" + parseInt(hourTime) + "小时" + result;
        }
        return result;
    }

    form.on('switch(on)', function(obj){
        var data = obj.elem.parentNode.parentNode.parentNode;
        var id = data.cells[2].firstChild.innerText;
        var ids = [id];
        var status = obj.elem.checked?1:2;
        $.post(
            '/set_task_status/',
            {id:JSON.stringify(ids),
            csrfmiddlewaretoken:csrftoken,
            task_status:status}
        )
    });

   //监听工具条，每行
    table.on('tool(data-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'detail') {//如果event是detail,这里的event名称需要在容器中设置lay-event
            window.location.href='/task_detail/'+pid+'/'+data.id;
        } else if (obj.event === 'del') {
            layer.confirm('确认删除吗？', function (index) {
                obj.del();
                $.post(
                    '/del_project_task',
                    {id: data.id,
                    csrfmiddlewaretoken:csrftoken},
                    function (data) {//删除成功后需要关闭弹窗并且重载表格
                        layer.close(index);
                        layer.msg('删除成功！', {icon: 1});
                        taskTable.reload()
                    }
                )
            });
        } else if (obj.event === 'edit') {
            var task_id = data.id;
            window.location.href = '/task_add/'+pid+'/'+task_id+'/';
        } else if  (obj.event === 'test') {
            var task_id = data.id;
            $.post(
                '/run_task',
                {id:task_id,
                csrfmiddlewaretoken:csrftoken},
                function (data) {
                    layer.msg('开始执行任务！',{icon:1,time:5000})
                }
            );
        }
    });

    //监听工具条，全局
    var taskTools = {
        changeStatusOn: function(){ //获取选中数据
            var checkStatus = table.checkStatus('taskTable')
                ,data = checkStatus.data
                ,ids = [];
            for(var i=0;i<data.length;i++){
                ids.push(data[i].id);
            }
            $.post(
                '/set_task_status/',
                {id:JSON.stringify(ids),
                csrfmiddlewaretoken:csrftoken,
                task_status:1},
                function(res){
                    taskTable.reload();
                }

        )
        },
        changeStatusOff: function(){ //获取选中数据
            var checkStatus = table.checkStatus('taskTable')
                ,data = checkStatus.data
                ,ids = [];
            for(var i=0;i<data.length;i++){
                ids.push(data[i].id);
            }
            $.post(
                '/set_task_status/',
                {id:JSON.stringify(ids),
                csrfmiddlewaretoken:csrftoken,
                task_status:0},
                function(res){
                    taskTable.reload();
                }

        )
        },
        taskAdd: function () {//新增任务
            layer.open({
                title: '新增任务',
                area: ['700px', '450px'],
                content:'<form id="project-task-add" class="layui-form" action="" style="width: 100%;height: 80%">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">任务名称</label>'+
                        '<div class="layui-input-block">'+
                        '<input id="project-task-add-name" name="project-task-add-name"'+
                        'lay-verify="project-task-add-name"'+
                        'class="layui-input" style="width: 90%">'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item layui-form-text">'+
                        '<label class="layui-form-label">任务描述</label>'+
                        '<div class="layui-input-block">'+
                        '<textarea  type="text" id="project-task-add-desc"'+
                        'name="project-task-add-desc" lay-verify="project-task-add-desc"'+
                        'class="layui-input" style="width: 90%;min-height: 200px"></textarea>'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item" pane="">'+
                        '<label class="layui-form-label">任务类型</label>'+
                        '<div class="layui-input-block">'+
                        '<input type="radio" name="type" id="circulation" value="2" title="普通" checked="" lay-filter="aaa">'+
                        // '<input type="radio" name="type" id="timing" value="1" title="定时"  lay-filter="aaa">'+
                        '</div>'+
                        '</div>'+
                        '</form>',
                btn: ['确定', '取消'],
                //一个是确定添加，一个是取消
                yes: function (index, layero) {
                    var data = $("#project-task-add").serializeArray(),
                        values = {};
                    $.each(data,function (k,v) {
                        values[v.name] = v.value;
                    })
                    //确定添加的时候需要吧各个值传到服务器当中
                    $.post(
                        '/add_project_task',
                        {
                            pdata:JSON.stringify(values), //对象转字符串
                            project_id: pid,
                            csrfmiddlewaretoken:csrftoken,
                        },
                        function (data) {//新增成功后需要关闭弹窗并且重载表格
                            layer.close(index)
                            layer.msg('新增成功！', {icon: 1})
                            taskTable.reload()
                        }
                    )
                },
                btn2: function (index, layero) {
                    layer.close(index)
                },
                //在弹层事件里加上这段内容可以去掉弹层的遮罩
                success:function(layero){
                 var mask = $(".layui-layer-shade");
                 mask.appendTo(layero.parent());
                 //其中：layero是弹层的DOM对象
                }
            })
            form.render();
        }
        };
    //搜索 ----------------------------------------------- Begin-----------------------------------------------------------
    var active ={
        taskSearch: function () {
            var taskSearchname = $('#taskSearch').val();//获取输入框的值
              //执行重载
            table.reload('taskTable',
                {
                    page:
                        {
                            curr: 1 //重新从第 1 页开始
                        }
                , where:{
                      'task_name': taskSearchname,
                      'pid':pid,
                      'csrfmiddlewaretoken':csrftoken
                      }//这里传参  向后台
                , url: '/search_project_tasks'//后台做模糊搜索接口路径
                , method: 'get'
                });
        }
      };
    //这个是用于创建点击事件的实例
    $('.taskTools .layui-btn').on('click', function ()
    {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    //搜索 ----------------------------------------------- End-----------------------------------------------------------

    //监听全局工具栏按钮点击
    $('#project-task-tool > .layui-btn').on('click', function () {
        var type = $(this).data('type');
        //如果taskTools[type]存在则call,否则为""
        taskTools[type] ? taskTools[type].call(this) : "";
    });

});