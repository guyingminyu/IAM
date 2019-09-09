/**
* Created by HUB-211 on 2018/10/9.
*/
layui.use(['table', 'jquery', 'layer', 'form','laytpl'], function () {
    var reg = /project_case\/(\d+)/;
    var r = window.location.pathname.match(reg);
    var pid = 0;
    if(r!=null){
        pid = r[1];
    }
    var table = layui.table,
        layer = layui.layer,
        form = layui.form,
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
    $("#project"+pid+" .case").addClass("layui-this");
    var content = '<i class="layui-icon">&#xe602;</i> 用例管理';
    $("#switchNav").append(content);
    //渲染表格
    var caseTable = table.render({//渲染table
        method: 'get',//数据传输方式为post
        height: '475',//高度
        cellMinWidth: 80,//单元格最小宽度为80
        page: true,//开启分页
        limit: 10,//分页默认为30
        where: {
            'pid':pid,
            'csrfmiddlewaretoken':csrftoken
        },
        elem: '#project-case-table',//设置容器
        url: '/get_project_cases',//数据获取url
        id:'caseTable',
        cols: [[//设置列标签、标题、宽度、是否排序等
            {type:'numbers'},
            {type: 'checkbox'},
            {field: 'id', title: 'ID', width: 100, sort: true,align:'center'},
            {field: 'case_name', title: '用例名', width: 260,align:'center'},
            {field: 'api_path',title:'验证接口',width:300,align:'center'},
            {field: 'case_desc', title: '用例描述',align:'center'},
            {field: 'case_status', title: '状态',width: 90, templet:'#switchstauts',align:'center'},
            {field: 'case_update_time', title: '更新日期',width: 200,align:'center'},
            {fixed: 'right', title:'操作', width: 200, toolbar: '#barcase',align:'center'},//设置每行的工具栏以及其容器
        ]],
    });

    form.on('switch(on)', function(obj){
        var data = obj.elem.parentNode.parentNode.parentNode;
        var id = data.cells[2].firstChild.innerText;
        var ids = [id];
        var status = obj.elem.checked?1:0;
        $.post(
            '/set_case_status/',
            {id:JSON.stringify(ids),
            csrfmiddlewaretoken:csrftoken,
            case_status:status}
        )
    });

   //监听工具条，每行
    table.on('tool(data-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'detail') {//如果event是detail,这里的event名称需要在容器中设置lay-event
            window.location.href='/case_detail/'+pid+'/'+data.id;
        } else if (obj.event === 'del') {
            layer.confirm('确认删除吗？', function (index) {
                obj.del();
                $.post(
                    '/del_project_case',
                    {id: data.id,
                    csrfmiddlewaretoken:csrftoken},
                    function (data) {//删除成功后需要关闭弹窗并且重载表格
                        layer.close(index)
                        layer.msg('删除成功！', {icon: 1})
                        caseTable.reload()
                    }
                )
            });
        } else if (obj.event === 'edit') {
            var api_id = 0;
            $.get(//根据id获取服务器中的数据
                '/get_project_case',
                {id: data.id,
                csrfmiddlewaretoken:csrftoken},
                function (data1) {
                    api_id = data1.data.api_id;
                    layer.open({
                        title: '编辑用例',
                        area: ['700px', '450px'],
                        content:'<form id="project-case-edit" class="layui-form" action="" style="width: 100%;height: 80%">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">用例名称</label>'+
                        '<div class="layui-input-block">'+
                        '<input id="project-case-add-name" name="project-case-add-name"'+
                        'lay-verify="project-case-add-name" value="'+data1.data.case_name+'"'+
                        'class="layui-input" style="width: 90%">'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">关联接口</label>'+
                        '<div class="layui-input-block" style="width: 75%;" >'+
                        '<select name="case-api" id="api-list" lay-verify="required" lay-search="" >'+
                        '<option value="">直接选择或搜索选择</option></select>'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item layui-form-text">'+
                        '<label class="layui-form-label">用例描述</label>'+
                        '<div class="layui-input-block">'+
                        '<textarea  type="text" id="project-case-add-desc"'+
                        'name="project-case-add-desc" lay-verify="project-case-add-desc"'+
                        'class="layui-input" style="width: 90%;min-height: 200px">'+
                        data1.data.case_desc+'</textarea>'+
                        '</div>'+
                        '</div>'+
                        '</form>',
                        btn: ['确定', '取消'],//一个是确定修改，一个是取消
                        yes: function (index, layero) {
                            var data = $("#project-case-edit").serializeArray(),
                                values = {};
                            $.each(data,function (k,v) {
                                values[v.name] = v.value;
                            })
                            //确定修改的时候需要吧各个值传到服务器当中
                            $.post(
                                '/edit_project_case',
                                {
                                    pdata:JSON.stringify(values), //对象转字符串
                                    case_id:obj.data.id,
                                    csrfmiddlewaretoken:csrftoken,
                                },
                                function (data) {//修改成功后需要关闭弹窗并且重载表格
                                    layer.close(index)
                                    layer.msg('修改成功！', {icon: 1})
                                    caseTable.reload()
                                }
                            )
                        },
                        btn2: function (index, layero) {
                            layer.close(index)
                        }
                    });
                    $.get('/get_case_api_list',
                    {
                    pid:pid,
                    csrfmiddlewaretoken:csrftoken,
                    },
                    function(data2){
                        if(data2.count>=1){
                            $.each(data2.data,function(k,v){
                            $("#api-list").append("<option value='" + v.id + "' style='font-weight: bold;'>" + v.api_path + "</option>");
                            })
                        }
                        $("#api-list option[value='"+api_id+"']").prop("selected",true);
                        form.render('select');
                    return false;
                    });
                    form.render()
                })
        }
    });

    //监听工具条，全局
    var caseTools = {
        changeStatusOn: function(){ //获取选中数据
            var checkStatus = table.checkStatus('caseTable')
                ,data = checkStatus.data
                ,ids = [];
            for(var i=0;i<data.length;i++){
                ids.push(data[i].id);
            }
            $.post(
                '/set_case_status/',
                {id:JSON.stringify(ids),
                csrfmiddlewaretoken:csrftoken,
                case_status:1},
                function(res){
                    caseTable.reload();
                }

        )
        },
        changeStatusOff: function(){ //获取选中数据
            var checkStatus = table.checkStatus('caseTable')
                ,data = checkStatus.data
                ,ids = [];
            for(var i=0;i<data.length;i++){
                ids.push(data[i].id);
            }
            $.post(
                '/set_case_status/',
                {id:JSON.stringify(ids),
                csrfmiddlewaretoken:csrftoken,
                case_status:0},
                function(res){
                    caseTable.reload();
                }

        )
        },
        caseAdd: function () {//新增用例
            layer.open({
                title: '新增用例',
                area: ['700px', '450px'],
                content:'<form id="project-case-add" class="layui-form" action="" style="width: 100%;height: 80%">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">用例名称</label>'+
                        '<div class="layui-input-block">'+
                        '<input id="project-case-add-name" name="project-case-add-name"'+
                        'lay-verify="project-case-add-name"'+
                        'class="layui-input" style="width: 90%">'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">关联接口</label>'+
                        '<div class="layui-input-block" style="width: 75%;" >'+
                        '<select name="case-api" id="api-list" lay-verify="required" lay-search="" >'+
                        '<option value="">直接选择或搜索选择</option></select>'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item layui-form-text">'+
                        '<label class="layui-form-label">用例描述</label>'+
                        '<div class="layui-input-block">'+
                        '<textarea  type="text" id="project-case-add-desc"'+
                        'name="project-case-add-desc" lay-verify="project-case-add-desc"'+
                        'class="layui-input" style="width: 90%;min-height: 200px"></textarea>'+
                        '</div>'+
                        '</div>'+
                        '</form>',
                btn: ['确定', '取消'],
                //一个是确定添加，一个是取消
                yes: function (index, layero) {
                    var data = $("#project-case-add").serializeArray(),
                        values = {};
                    $.each(data,function (k,v) {
                        values[v.name] = v.value;
                    })
                    //确定添加的时候需要吧各个值传到服务器当中
                    $.post(
                        '/add_project_case',
                        {
                            pdata:JSON.stringify(values), //对象转字符串
                            project_id: pid,
                            csrfmiddlewaretoken:csrftoken,
                        },
                        function (data) {//新增成功后需要关闭弹窗并且重载表格
                            layer.close(index)
                            layer.msg('新增成功！', {icon: 1})
                            caseTable.reload()
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
            });

            $.get('/get_case_api_list',
                {
                    pid:pid,
                    csrfmiddlewaretoken:csrftoken,
                },function(data){
                console.log("adddata"+data.count);
                    if(data.count>=1){
                        $.each(data.data,function(k,v){
                            $("#api-list").append("<option value='" + v.id + "' style='font-weight: bold;'>" + v.api_path + "</option>");
                        })
                    }
                    form.render('select');
                    return false;
                }
            );

            $('.add-field').click(function (event) {
                var self = $(this);
                var data = {
                    "field": self.closest('blockquote').nextAll('table:visible').first().data('field'),
                    "num": self.data('num')
                }
                laytpl($('#addfield').html()).render(data, function (html) {
                    self.closest('blockquote').nextAll('table:visible').first().find('tbody').append(
                        html);
                    self.data('num', parseInt(data.num) + 1);
                });
                return false;
            });
            $('.add-param-field').click(function (event) {
                var self = $(this);
                var data = {
                    "field": self.closest('blockquote').nextAll('table:visible').first().data('field'),
                    "num": self.data('num')
                }
                laytpl($('#addparamfield').html()).render(data, function (html) {
                    self.closest('blockquote').nextAll('table:visible').first().find('tbody').append(
                        html);
                    self.data('num', parseInt(data.num) + 1);
                });
                form.render();
                return false;
            });
            $('.layui-table').on('click', '.delete', function (event) {
                event.preventDefault();
                $(this).closest('tr').remove();
                return false;
            });
            form.on('radio(table-radio)', function (data) {
                var obj = $(data.elem).closest('.layui-form-item');
                $('.request-data').hide();
                $('#' + data.value).show();
                if (data.value == 'raw') {
                    $('#model_header').show();
                } else {
                    $('#model_header').hide();
                }
            });
            form.render();
        }
    }
    //搜索 ----------------------------------------------- Begin-----------------------------------------------------------
    var active ={
        caseSearch: function () {
            var caseSearchname = $('#caseSearchname').val();
            var caseSearchapi = $('#caseSearchapi').val();
            var caseSearchstatus = $('#caseSearchstatus').val();//获取输入框的值
              //执行重载
            table.reload('caseTable',
                {
                    page:
                        {
                            curr: 1 //重新从第 1 页开始
                        }
                , where:{
                      'case_name': caseSearchname,
                      'case_api':caseSearchapi,
                      'case_status':caseSearchstatus,
                      'pid':pid,
                      'csrfmiddlewaretoken':csrftoken
                      }//这里传参  向后台
                , url: '/search_project_cases'//后台做模糊搜索接口路径
                , method: 'get'
                });
        }
      };
    //这个是用于创建点击事件的实例
    $('.caseTools .layui-btn').on('click', function ()
    {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    //搜索 ----------------------------------------------- End-----------------------------------------------------------

    //监听全局工具栏按钮点击
    $('#project-case-tool > .layui-btn').on('click', function () {
        var type = $(this).data('type');
        //如果caseTools[type]存在则call,否则为""
        caseTools[type] ? caseTools[type].call(this) : "";
    });

})