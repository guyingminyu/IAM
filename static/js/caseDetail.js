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
                    "field": self.nextAll('table:visible').first().data('field'),
                    "num": self.data('num')
                }
                laytpl($('#addfield').html()).render(data, function (html) {
                    self.nextAll('table:visible').first().find('tbody').append(
                        html);
                    self.data('num', parseInt(data.num) + 1);
                });
                return false;
            });
            $('.add-param-field').click(function (event) {
                var self = $(this);
                var data = {
                    "field": self.nextAll('table:visible').first().data('field'),
                    "num": self.data('num')
                }
                laytpl($('#addparamfield').html()).render(data, function (html) {
                    self.nextAll('table:visible').first().find('tbody').append(
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
            var res;
            $.get(//根据id获取服务器中的数据
                '/get_case_api_detail',
                {id: data.id,
                csrfmiddlewaretoken:csrftoken},
                function (res) {
                    var tmp1 = '';
                    var data = res.data;
                    if(data.case_api_info.api_headers.length >=1){
                        $.each(data.case_api_info.api_headers, function (k, v) {
                            tmp1 += '<tr>' +
                                '<td>' +
                                '<input type="text" name="header_key" placeholder="Key" class="layui-input" value="' + v['head_name'] + '">' +
                                '</td><td>' +
                                '<input type="text" name="header_value" placeholder="Value" class="layui-input" value="' + v['head_value'] + '">' +
                                '</td><td><a href="javascript:;" class="delete">' +
                                '<i class="layui-icon" >&#x1006;</i></a></td></tr>';
                        });
                    }
                    var tmp2 ='';
                    if(data.case_api_info.api_params.length >=1){
                        $.each(data.case_api_info.api_params,function (k,v) {
                            tmp2 += '<tr>'+
                                    '<td>'+
                                    '<input type="text" name="param_name" placeholder="Name" class="layui-input" value="' + v['param_name'] + '">'+
                                    '</td>'+
                                    '<td>'+
                                    '<input type="text" name="param_desc" placeholder="Desc" class="layui-input" value="' + v['param_desc'] + '">'+
                                    '</td>'+
                                    '<td>'+
                                    '<input type="text" name="param_default" placeholder="Default" class="layui-input" value="' + v['param_default'] + '">'+
                                    '</td>'+
                                    '<td>'+
                                    // '<input type="text" name="param_type" placeholder="Type" class="layui-input" value="' + v['param_type'] + '">'+
                                    '<select id="project-api-add-param_type" name="param_type" >';
                                    var a=['int','string'];
                                    $.each(a,function (k1, v1) {
                                        tmp2 +='<option value="'+v1+'" '+(v['param_type']==v1?"selected":"") +'>'+v1+'</option>';
                                    });
                                    tmp2 +=
                                    '</select>'+
                                    '</td>'+
                                    '<td>'+
                                    '<input type="checkbox" name="param_must" title="" lay-skin="primary" '+ (v["param_must"]===1?"checked":"") +'>'+
                                    '</td>'+
                                    '<td>'+
                                    '<a href="javascript:;" class="delete">'+
                                    '<i class="layui-icon">&#x1006;</i>'+
                                    '</a>'+
                                    '</td>'+
                                    '</tr>'
                        })
                    }
                    var tmp3 ='';
                    if(data.pre_steps.length >=1){
                        $.each(data.pre_steps,function (k,v) {
                            if(v['step_type']=='SQL') {
                                var step_content = eval("("+v['step_content']+")");
                                tmp3 += '<tr><td><input type="text" name="pre_type" placeholder="Type" class="layui-input" value="SQL">' +
                                    '<td><input type="text" name="pre_sqlenv" placeholder="SqlEnv" class="layui-input" value="' + step_content['pre_sqlenv'] + '"></td>' +
                                    '</td><td><input type="text" name="pre_content" placeholder="Content" class="layui-input" value="' + step_content["pre_content"].replace(/\"/g,"&quot;") + '">' +
                                    '</td><td><input type="text" name="pre_variable" placeholder="Variable" class="layui-input" value="' + step_content["pre_variable"] + '">' +
                                    '</td><td><input type="text" name="pre_sort" placeholder="Sort" class="layui-input" value="' + v["step_sort"] + '">' +
                                    '</td><td><a href="javascript:;" class="delete"><i class="layui-icon">&#x1006;</i></a></td></tr>'
                            }
                        })
                    }
                    var tmp4 ='';
                    if(data.post_steps.length >=1){
                        $.each(data.post_steps,function (k,v) {
                            tmp4 += '<tr>'+
                                '<td>'+
                                '<input type="text" name="post_type" placeholder="Type" class="layui-input" value="REGEXP">'+
                                '</td>'+
                                '<td>'+
                                    '<select id="case-api-add-post-object" name="post_object" >';
                                    var a={
                                        'Body':'响应内容',
                                        'URL':'URL',
                                        'ResHeader':'响应头',
                                        'ReqHeader':'请求头'
                                    };
                                    $.each(a,function (k1, v1) {
                                        tmp4 +='<option value="'+k1+'" '+(v['post_object']==k1?"selected":"") +'>'+v1+'</option>';
                                    });
                                    tmp4 +=
                                    '</select>'+
                                '</td>'+
                                '<td>'+
                                '<input type="text" name="post_expression" placeholder="Expression" class="layui-input">'+
                                '</td>'+
                                '<td>'+
                                '<input type="text" name="post_variable" placeholder="Variable" class="layui-input">'+
                                '</td>'+
                                '<td>'+
                                '<a href="javascript:;" class="delete">'+
                                '<i class="layui-icon">&#x1006;</i>'+
                                '</a>'+
                                '</td>'+
                                '</tr>'
                        })
                    }
                    layer.open({
                        title: '编辑用例',
                        area: ['1200px', '850px'],
                        content:'<form class="layui-form layui-form-pane" id="cas-api-edit" action="/edit_case_api" style="width: 1150px">'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">接口名称</label>'+
                                '<div class="layui-input-block">'+
                                '<input type="text" id="case-api-edit-name" name="api_name" style="width: 1040px" ' +
                        'lay-verify="required" lay-verify="name" autocomplete="off" placeholder="请输入接口名称" ' +
                        'class="layui-input" value="'+data.case_api_info.api_name+'">'+
                                '</div>'+
                                '<label class="layui-form-label">域名ip</label>'+
                                '<div class="layui-input-block">'+
                                '<input type="text" id="case-api-edit-host" name="host" style="width: 1040px" ' +
                        'lay-verify="required" lay-verify="name" autocomplete="off" placeholder="请输入服务器域名或ip" ' +
                        'class="layui-input" value="'+data.case_api_info.host+'">'+
                                '</div>'+
                                '<label class="layui-form-label">接口地址</label>'+
                                '<div class="layui-input-block" >'+
                                '<input type="text" id="case-api-edit-path" name="path" style="width: 1040px" ' +
                        'lay-verify="required" lay-verify="path" autocomplete="off" placeholder="请输入接口地址" ' +
                        'class="layui-input" value="'+data.case_api_info.api_path+'">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">协议</label>'+
                                '<div class="layui-input-inline">'+
                                '<select id="case-api-edit-protocol" name="protocol" >'+
                                '<option value="http">HTTP</option>'+
                                '<option value="https">HTTPS</option>'+
                                '</select>'+
                                '</div>'+
                                '<label class="layui-form-label">请求方式</label>'+
                                '<div class="layui-input-inline">'+
                                '<select id="case-api-edit-method" name="method">'+
                                '<option value="get">GET</option>'+
                                '<option value="post">POST</option>'+
                                '<option value="put">PUT</option>'+
                                '<option value="delete">DELETE</option>'+
                                '</select>'+
                                '</div>'+
                                '</div>'+
                                '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 1px;">'+
                                '<legend style="font-size:15px;font-weight: 300;">请求信息</legend>'+
                                '</fieldset>'+
                                '<div class="layui-tab layui-tab-card">'+
                                '<ul class="layui-tab-title">'+
                                '<li class="layui-this">请求头</li>'+
                                '<li>请求参数</li>'+
                                '<li>前置处理</li>'+
                                '</ul>'+
                                '<div class="layui-tab-content" style="height: 100%;">'+
                                '<div class="layui-tab-item layui-show">'+
                                '<a href="javascript:;" class="left add-field" data-num="0">'+
                                '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                                '<span class="layui-inline" style="height: 27px;font-size: 14px">新增请求头</span>'+
                                '</a>'+
                                '<table class="layui-table" data-field="headers">'+
                                '<colgroup>'+
                                '<col width="35%">'+
                                '<col>'+
                                '<col width="10">'+
                                '</colgroup>'+
                                '<thead>'+
                                '<tr>'+
                                '<th>标签</th>'+
                                '<th>内容</th>'+
                                '<th></th>'+
                                '</tr>'+
                                '</thead>'+
                                '<tbody>'+
                                tmp1+
                                '</tbody>'+
                                '</table>'+
                                '</div>'+
                                '<div class="layui-tab-item">'+
                                '<a href="javascript:;" class="right add-param-field" data-num="0">'+
                                '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                                '<span class="layui-inline" style="height: 27px;font-size: 14px">新增请求参数</span>'+
                                '</a>'+
                                '<table class="layui-table" data-field="params" name="params">'+
                                '<colgroup>'+
                                '<col width="15%">'+
                                '<col width="35%">'+
                                '<col width="30%">'+
                                '<col width="10%">'+
                                '<col>'+
                                '<col width="10">'+
                                '</colgroup>'+
                                '<thead>'+
                                '<tr>'+
                                '<th>参数名</th>'+
                                '<th>描述</th>'+
                                '<th>默认值</th>'+
                                '<th>类型</th>'+
                                '<th>必填</th>'+
                                '<th></th>'+
                                '</tr>'+
                                '</thead>'+
                                '<tbody>'+
                                tmp2+
                                '</tbody>'+
                                '</table></div>'+
                                '<div class="layui-tab-item">'+
                                '<a href="javascript:;" class="right add-pre-field" data-num="0">'+
                                '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                                '<span class="layui-inline" style="height: 27px;font-size: 14px">新增sql</span>'+
                                '</a>'+
                                '<table class="layui-table" data-field="pres" name="pres">'+
                                '<colgroup>'+
                                '<col width="8%">'+
                                '<col width="10%">'+
                                '<col width="45%">'+
                                '<col width="22%">'+
                                '<col width="7%">'+
                                '<col width="6">'+
                                '</colgroup>'+
                                '<thead>'+
                                '<tr>'+
                                '<th>类型</th>'+
                                '<th>sql配置</th>'+
                                '<th>内容(sql语句)</th>'+
                                '<th>变量(赋值变量逗号分割)</th>'+
                                '<th>排序</th>'+
                                '<th>操作</th>'+
                                '</tr>'+
                                '</thead>'+
                                '<tbody>'+
                                tmp3+
                                '</tbody>'+
                                '</table>'+
                                '</div>'+
                                '</div>'+
                                '</div>'+
                                '<fieldset class="layui-elem-field layui-field-title" style="margin-top: 15px;">'+
                                '<legend style="font-size:15px;font-weight: 300;">响应信息</legend>'+
                                '</fieldset>               '+
                                '<div class="layui-tab layui-tab-card">'+
                                '<ul class="layui-tab-title">'+
                                '<li class="layui-this">后置处理</li>'+
                                '<li>断言</li>'+
                                '</ul>'+
                                '<div class="layui-tab-content" style="height: 100%;">'+
                                '<div class="layui-tab-item layui-show">'+
                                '<a href="javascript:;" class="right add-post-field" data-num="0">'+
                                '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                                '<span class="layui-inline" style="height: 27px;font-size: 14px">正则提取</span>'+
                                '</a>'+
                                '<table class="layui-table" data-field="post" name="post">'+
                                '<colgroup>'+
                                '<col width="15%">'+
                                '<col width="15%">'+
                                '<col width="40%">'+
                                '<col width="24%">'+
                                '<col width="6">'+
                                '</colgroup>'+
                                '<thead>'+
                                '<tr>'+
                                '<th>后置类型</th>'+
                                '<th>提取对象</th>'+
                                '<th>语句(正则表达式)</th>'+
                                '<th>变量(赋值变量名)</th>'+
                                '<th>操作</th>'+
                                '</tr>'+
                                '</thead>'+
                                '<tbody>'+
                                tmp4+
                                '</tbody>'+
                                '</table>'+
                                '</div>'+
                                '<div class="layui-tab-item">'+
                                '响应内容断言（支持正则）'+
                                '<br><br>'+
                                '<input type="text" name="assertion" class="layui-input" value="'+data.assertion+'">'+
                                '<br>'+
                                '</div>'+
                                '</div>'+
                                '</div>'+
                                '</form>',
                        btn: ['确定', '取消'],//一个是确定修改，一个是取消
                        yes: function (index, layero) {
                            var values = {};
                            $(function (){
                                var params = $("#cas-api-edit").serializeArray();//序列化表单，转化成一个json结构对象
                                var x;
                                values["headers"] = [];
                                values["params"] = [];
                                values["pres"] = [];
                                values["posts"] = [];
                                var a = ["header_key","header_value","param_name","param_desc","param_default",
                                    "param_type","param_must","pre_type","pre_sqlenv","pre_content","pre_variable",
                                    "pre_sort","post_type","post_object","post_expression","post_variable"];
                                for(x in params){
                                    var j = $.inArray(params[x].name,a);
                                    if(j==-1){
                                        values[params[x].name] = params[x].value;
                                    }
                                }
                                for(var n = 0;n < $("input[name='header_key']").length;n++){
                                    var dh = {};
                                    dh['header_key'] = $("input[name='header_key']")[n].value;
                                    dh['header_value'] = $("input[name='header_value']")[n].value;
                                    values["headers"].push(dh);
                                }
                                for(var i=0;i<$("input[name='param_name']").length;i++){
                                    var dp = {};
                                    dp['param_name'] = $("input[name='param_name']")[i].value;
                                    dp['param_desc'] = $("input[name='param_desc']")[i].value;
                                    dp['param_default'] = $("input[name='param_default']")[i].value;
                                    dp['param_type'] = $("select[name='param_type']")[i].value;
                                    dp['param_must'] = $("input[name='param_must']")[i].checked?1:0;
                                    values["params"].push(dp);
                                }
                                for(var i=0;i<$("input[name='pre_type']").length;i++){
                                    var dp = {};
                                    dp['pre_type'] = $("input[name='pre_type']")[i].value;
                                    dp['pre_sqlenv'] = $("input[name='pre_sqlenv']")[i].value;
                                    dp['pre_content'] = $("input[name='pre_content']")[i].value;
                                    dp['pre_variable'] = $("input[name='pre_variable']")[i].value;
                                    dp['pre_sort'] = $("input[name='pre_sort']")[i].value;
                                    values["pres"].push(dp);
                                }
                                for(var i=0;i<$("input[name='post_type']").length;i++){
                                    var dp = {};
                                    dp['post_type'] = $("input[name='post_type']")[i].value;
                                    dp['post_object'] = $("select[name='post_object']")[i].value;
                                    dp['post_expression'] = $("input[name='post_expression']")[i].value;
                                    dp['post_variable'] = $("input[name='post_variable']")[i].value;
                                    values["posts"].push(dp);
                                }
                            });
                            //确定修改的时候需要吧各个值传到服务器当中
                            $.post(
                                '/edit_case_api',
                                {
                                    pdata:JSON.stringify(values), //对象转字符串
                                    case_api_id:data.case_api_info.id,
                                    csrfmiddlewaretoken:csrftoken,
                                },
                                function (data) {//修改成功后需要关闭弹窗并且重载表格
                                    layer.close(index)
                                    layer.msg('修改成功！', {icon: 1})
                                    caseDetailTable.reload()
                                }
                            )
                        },
                        btn2: function (index, layero) {
                            layer.close(index)
                        }
                    });
                $('.add-field').click(function (event) {
                    var self = $(this);
                    var data = {
                        "field": self.nextAll('table:visible').first().data('field'),
                        "num": self.data('num')
                    }
                    laytpl($('#addfield').html()).render(data, function (html) {
                        self.nextAll('table:visible').first().find('tbody').append(
                            html);
                        self.data('num', parseInt(data.num) + 1);
                    });
                    return false;
                });
                $('.add-param-field').click(function (event) {
                    var self = $(this);
                    var data = {
                        "field": self.nextAll('table:visible').first().data('field'),
                        "num": self.data('num')
                    }
                    laytpl($('#addparamfield').html()).render(data, function (html) {
                        self.nextAll('table:visible').first().find('tbody').append(
                            html);
                        self.data('num', parseInt(data.num) + 1);
                    });
                    form.render();
                    return false;
                });
                $('.add-pre-field').click(function (event) {
                    var self = $(this);
                    var data = {
                        "field": self.nextAll('table:visible').first().data('field'),
                        "num": self.data('num')
                    }
                    laytpl($('#addprefield').html()).render(data, function (html) {
                        self.nextAll('table:visible').first().find('tbody').append(
                            html);
                        self.data('num', parseInt(data.num) + 1);
                    });
                    form.render();
                    return false;
                });
                $('.add-post-field').click(function (event) {
                    var self = $(this);
                    var data = {
                        "field": self.nextAll('table:visible').first().data('field'),
                        "num": self.data('num')
                    }
                    laytpl($('#addpostfield').html()).render(data, function (html) {
                        self.nextAll('table:visible').first().find('tbody').append(
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
                $("#case-api-edit-protocol option[value='"+data.case_api_info.api_protocol+"']").prop("selected",true);//根据值让option选中
                $("#case-api-edit-method option[value='"+data.case_api_info.api_method+"']").prop("selected",true);
                form.render();
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