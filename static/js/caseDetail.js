/**
 * Created by HUB-211 on 2019/4/29.
 */
layui.use(['table', 'jquery', 'layer', 'form','laytpl'], function () {
    var reg = /case_detail\/(\d+)\/(\d+)/;
    var r = window.location.pathname.match(reg);
    var pid = 0;
    var cid = 0;
    if(r!=null){
        pid = r[1];
        cid = r[2];
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

    //渲染表格
    var caseDetailTable = table.render({//渲染table
        method: 'get',//数据传输方式为post
        height: '475',//高度
        cellMinWidth: 80,//单元格最小宽度为80
        page: true,//开启分页
        limit: 10,//分页默认为30
        where: {
            'pid':pid,
            'cid':cid,
            'csrfmiddlewaretoken':csrftoken
        },
        elem: '#project-caseDetail-table',//设置容器
        url: '/get_case_apis',//数据获取url
        id:'caseDetailTable',
        cols: [[//设置列标签、标题、宽度、是否排序等
            {field: 'sort', title: '执行顺序',width:100,sort: true},
            {type: 'checkbox'},
            {field: 'id', title: 'ID', width: 100, sort: true},
            {field: 'api_name', title: '接口名称', width: 260,},
            {field: 'api_path',title:'接口url',},
            {field: 'case_api_update_time', title: '更新日期',width: 200,},
            {fixed: 'right', title:'操作', width: 250, toolbar: '#barcaseDetail'},//设置每行的工具栏以及其容器
        ]],
    });
    //监听工具条，全局
    var active = {
        choiceApi:function () {
            layer.open({
                title: '选择已有接口',
                area: ['700px', '300px'],
                content:'<form id="project-case-api-choice" class="layui-form" action="" style="width: 100%;height: 80%">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">关联接口</label>'+
                        '<div class="layui-input-block" style="width: 75%;" >'+
                        '<select name="case-api" id="api-list" lay-verify="required" lay-search="" >'+
                        '<option value="">直接选择或搜索选择</option></select>'+
                        '</div>'+
                        '</div>',
                btn: ['确定', '取消'],
                //一个是确定添加，一个是取消
                yes: function (index, layero) {
                    var data = $("#project-case-api-choice").serializeArray(),
                        values = {};
                    $.each(data,function (k,v) {
                        values[v.name] = v.value;
                    })
                    //确定添加的时候需要吧各个值传到服务器当中
                    $.post(
                        '/add_project_case_api',
                        {
                            pdata:JSON.stringify(values), //对象转字符串
                            case_id: cid,
                            csrfmiddlewaretoken:csrftoken,
                        },
                        function (data) {//新增成功后需要关闭弹窗并且重载表格
                            layer.close(index)
                            layer.msg('新增成功！', {icon: 1})
                            caseDetailTable.reload()
                        }
                    )
                },
                btn2: function (index, layero) {
                    layer.close(index)
                },
            });
            $.get('/get_case_api_list',
                {
                    pid:pid,
                    csrfmiddlewaretoken:csrftoken,
                },function(data){
                    if(data.count>=1){
                        $.each(data.data,function(k,v){
                            $("#api-list").append("<option value='" + v.id + "' style='font-weight: bold;'>" + v.api_path + "</option>");
                        })
                    }
                    form.render('select');
                    return false;
                }
            );
        },
        caseApiAdd: function () {//新增用例接口
            layer.open({
                title: '新增用例接口',
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
                    var values = {};
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
                            caseDetailTable.reload()
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
    };
    table.on('tool(data-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'detail') {//如果event是detail,这里的event名称需要在容器中设置lay-event
            window.location.href='/case_detail/'+pid+'/'+data.id;
        } else if (obj.event === 'del') {
            layer.confirm('确认删除吗？', function (index) {
                obj.del();
                $.post(
                    '/del_project_case_api',
                    {id: data.id,
                    csrfmiddlewaretoken:csrftoken},
                    function (data) {//删除成功后需要关闭弹窗并且重载表格
                        layer.close(index)
                        layer.msg('删除成功！', {icon: 1})
                        caseDetailTable.reload()
                    }
                )
            })
        }else if (obj.event === 'up'){
            var cdata = obj.data
            $.post(
                '/up_case_api',
                {
                    id:cdata.id,
                    csrfmiddlewaretoken:csrftoken
                },
                function(data){
                    caseDetailTable.reload()
                }
            )
        }else if (obj.event === 'down'){
            var cdata = obj.data
            $.post(
                '/down_case_api',
                {
                    id:cdata.id,
                    csrfmiddlewaretoken:csrftoken
                },
                function(data){
                    caseDetailTable.reload()
                }
            )
        }else if (obj.event === 'edit') {
            var api_id = 0;
            $.get(//根据id获取服务器中的数据
                '/get_project_case',
                {id: data.id,
                csrfmiddlewaretoken:csrftoken},
                function (data1) {
                    api_id = data1.data.api_id;
                    layer.open({
                        title: '编辑用例接口',
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
    })
    $('.caseDetailTools .layui-btn').on('click', function ()
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