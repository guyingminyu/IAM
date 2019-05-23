/**
* Created by HUB-211 on 2018/10/9.
*/
layui.use(['table', 'jquery', 'layer', 'form','laytpl','element'], function () {
    var reg = /project_api\/(\d+)/;
    var r = window.location.pathname.match(reg);
    var pid = 0;
    if(r!=null){
        pid = r[1];
    }
    var table = layui.table,
        layer = layui.layer,
        form = layui.form,
        element = layui.element,
        $ = layui.jquery;
    var laytpl = layui.laytpl;
    var myInit ={
        getCookie : function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for ( var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
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
    $("#project"+pid+" .api").addClass("layui-this");

    //渲染表格
    var apiTable = table.render({//渲染table
        method: 'get',//数据传输方式为post
        height: '475',//高度
        cellMinWidth: 80,//单元格最小宽度为80
        page: true,//开启分页
        limit: 10,//分页默认为30
        where: {
            'pid':pid,
            'csrfmiddlewaretoken':csrftoken
        },
        elem: '#project-api-table',//设置容器
        url: '/get_project_apis',//数据获取url
        id:'apiTable',
        cols: [[//设置列标签、标题、宽度、是否排序等
            {type:'numbers'},
            {type: 'checkbox'},
            {field: 'id', title: 'ID', width: 100, sort: true},
            {field: 'api_name', title: '接口名', width: 200,},
            {field: 'api_method', title: '请求方式',width: 100,},
            {field: 'api_path', title: '接口地址',},
            {field: 'progress-bar',title:'用例覆盖率',width: 260,templet:'#progress-bar'},
            {field: 'api_update_time', title: '更新日期',width: 200,},
            {fixed: 'right', title:'操作', width: 220, toolbar: '#barapi'},//设置每行的工具栏以及其容器
        ]],
        done:function(){
            element.init();
            }
    });

   //监听工具条，每行
    table.on('tool(data-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'detail') {//如果event是detail,这里的event名称需要在容器中设置lay-event
            $.get(//向服务器发送问题id，获取选中问题行的数据
                '/get_project_api',
                {id: data.id,
                csrfmiddlewaretoken:csrftoken},
                function (data) {//获取数据后开启弹窗
                    var tmp1 = '';
                    if(data.api_headers.length >=1) {
                        $.each(data.api_headers, function (k, v) {
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
                    if(data.api_params.length >=1){
                        $.each(data.api_params,function (k,v) {
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
                                    '<input type="text" name="param_type" placeholder="Type" class="layui-input" value="' + v['param_type'] + '">'+
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
                    layer.open({
                        title: '接口详情',
                        area: ['1150px', '850px'],
                        content: '<form class="layui-form layui-form-pane" id="project-api-add" action="/add_project_api" style="width: 1100px">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">接口名称</label>'+
                        '<div class="layui-input-block">'+
                        '<input type="text" id="project-api-add-name" name="api_name" style="width: 940px" lay-verify="required" lay-verify="name" autocomplete="off" placeholder="请输入接口名称" class="layui-input"' +
                        'value='+data.api_name+'>'+
                        '</div>'+
                        '<label class="layui-form-label">接口地址</label>'+
                        '<div class="layui-input-block" >'+
                        '<input type="text" id="project-api-add-path" name="path" style="width: 940px" lay-verify="required" lay-verify="path" autocomplete="off" placeholder="请输入接口地址" class="layui-input"' +
                        'value='+data.api_path+'>'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">协议</label>'+
                        '<div class="layui-input-inline">'+
                        '<select id="project-api-add-protocol" name="protocol" >'+
                        // '<option value="default">'+data.api_protocol.toUpperCase()+'</option>'+
                        '<option value="http">HTTP</option>'+
                        '<option value="https">HTTPS</option>'+
                        '</select>'+
                        '</div>'+
                        '<label class="layui-form-label">请求方式</label>'+
                        '<div class="layui-input-inline">'+
                        '<select id="project-api-add-method" name="method">'+
                        // '<option value="default">'+data.api_method.toUpperCase()+'</option>'+
                        '<option value="get">GET</option>'+
                        '<option value="post">POST</option>'+
                        '<option value="put">PUT</option>'+
                        '<option value="delete">DELETE</option>'+
                        '</select>'+
                        '</div>'+
                        '</div>'+
                        '<blockquote class="layui-elem-quote">请求头 '+
                        '<a href="javascript:;" class="right add-field" data-num="0">'+
                        '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                        '</a>'+
                        '</blockquote>'+
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
                        '<blockquote class="layui-elem-quote">请求参数 '+
                        '<a href="javascript:;" class="right add-param-field" data-num="0">'+
                        '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                        '</a>'+
                        '</blockquote>'+
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
                        '</table>'+
                        '<blockquote class="layui-elem-quote">响应结果'+
                        '</blockquote>'+
                        '<div class="layui-form-item layui-form-text">'+
                        '<div class="layui-input-block">'+
                        '<textarea  type="text" id="resonpse"'+
                        'name="resonpse" lay-verify="resonpse"'+
                        'class="layui-input" placeholder="输入响应结果模板" style="width: 100%;min-height: 150px">' +
                        data.api_response+
                        '</textarea>'+
                        '</div>'+
                        '</div>'+
                        '</form>',//设置弹窗的容器
                        btn: ['确定'],//点击确定的时候，会关闭弹窗
                        yes: function (index, layero) {
                            layer.close(index)
                        }
                    });
                    $("#project-api-add-protocol option[value='"+data.api_protocol+"']").prop("selected",true);//根据值让option选中
                    $("#project-api-add-method option[value='"+data.api_method+"']").prop("selected",true);
                    form.render();
                }
            )

        } else if (obj.event === 'del') {
            layer.confirm('确认删除吗？', function (index) {
                obj.del();
                $.post(
                    '/del_project_api',
                    {id: data.id,
                    csrfmiddlewaretoken:csrftoken},
                    function (data) {//删除成功后需要关闭弹窗并且重载表格
                        layer.close(index)
                        layer.msg('删除成功！', {icon: 1})
                        apiTable.reload()
                    }
                )
            });
        } else if (obj.event === 'edit') {
            $.get(//根据id获取服务器中的数据
                '/get_project_api',
                {id: data.id,
                csrfmiddlewaretoken:csrftoken},
                function (data) {
                    var tmp1 = '';
                    if(data.api_headers.length >=1) {
                        $.each(data.api_headers, function (k, v) {
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
                    if(data.api_params.length >=1){
                        $.each(data.api_params,function (k,v) {
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
                    layer.open({
                        title: '编辑接口',
                        area: ['1150px', '850px'],
                        content: '<form class="layui-form layui-form-pane" id="project-api-add" action="/add_project_api" style="width: 1100px">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">接口名称</label>'+
                        '<div class="layui-input-block">'+
                        '<input type="text" id="project-api-add-name" name="api_name" style="width: 940px" lay-verify="required" lay-verify="name" autocomplete="off" placeholder="请输入接口名称" class="layui-input"' +
                        'value='+data.api_name+'>'+
                        '</div>'+
                        '<label class="layui-form-label">接口地址</label>'+
                        '<div class="layui-input-block" >'+
                        '<input type="text" id="project-api-add-path" name="path" style="width: 940px" lay-verify="required" lay-verify="path" autocomplete="off" placeholder="请输入接口地址" class="layui-input"' +
                        'value='+data.api_path+'>'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">协议</label>'+
                        '<div class="layui-input-inline">'+
                        '<select id="project-api-add-protocol" name="protocol" >'+
                        // '<option value="'+data.api_protocol.toUpperCase()+'">'+data.api_protocol.toUpperCase()+'</option>'+
                        '<option value="http">HTTP</option>'+
                        '<option value="https">HTTPS</option>'+
                        '</select>'+
                        '</div>'+
                        '<label class="layui-form-label">请求方式</label>'+
                        '<div class="layui-input-inline">'+
                        '<select id="project-api-add-method" name="method">'+
                        // '<option value="'+data.api_method.toUpperCase()+'">'+data.api_method.toUpperCase()+'</option>'+
                        '<option value="get">GET</option>'+
                        '<option value="post">POST</option>'+
                        '<option value="put">PUT</option>'+
                        '<option value="delete">DELETE</option>'+
                        '</select>'+
                        '</div>'+
                        '</div>'+
                        '<blockquote class="layui-elem-quote">请求头 '+
                        '<a href="javascript:;" class="right add-field" data-num="0">'+
                        '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                        '</a>'+
                        '</blockquote>'+
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
                        '<blockquote class="layui-elem-quote">请求参数 '+
                        '<a href="javascript:;" class="right add-param-field" data-num="0">'+
                        '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                        '</a>'+
                        '</blockquote>'+
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
                        '</table>'+
                        '<blockquote class="layui-elem-quote">响应结果'+
                        '</blockquote>'+
                        '<div class="layui-form-item layui-form-text">'+
                        '<div class="layui-input-block">'+
                        '<textarea  type="text" id="resonpse"'+
                        'name="resonpse" lay-verify="resonpse"'+
                        'class="layui-input" placeholder="输入响应结果模板" style="width: 100%;min-height: 150px">' +
                        data.api_response+
                        '</textarea>'+
                        '</div>'+
                        '</div>'+
                        '</form>',
                        btn: ['确定', '取消'],//一个是确定修改，一个是取消
                        yes: function (index, layero) {
                            var values = {};
                            $(function (){
                                var params = $("#project-api-add").serializeArray();//序列化表单，转化成一个json结构对象
                                var x;
                                values["headers"] = [];
                                values["params"] = [];
                                var a = ["header_key","header_value","param_name","param_desc","param_default","param_type","param_must"];
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
                            });
                            //确定修改的时候需要吧各个值传到服务器当中
                            $.post(
                                '/edit_project_api',
                                {
                                    pdata:JSON.stringify(values), //对象转字符串
                                    api_id: data.id,
                                    csrfmiddlewaretoken:csrftoken,
                                },
                                function (data) {//修改成功后需要关闭弹窗并且重载表格
                                    layer.close(index)
                                    layer.msg('修改成功！', {icon: 1})
                                    apiTable.reload()
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
                $("#project-api-add-protocol option[value='"+data.api_protocol+"']").prop("selected",true);//根据值让option选中
                $("#project-api-add-method option[value='"+data.api_method+"']").prop("selected",true);
                form.render();
                }
            )
        }else if (obj.event === 'test') {//如果event是test,这里的event名称需要在容器中设置lay-event
            $.get(//向服务器发送问题id，获取选中问题行的数据
                '/get_project_api',
                {id: data.id,
                csrfmiddlewaretoken:csrftoken},
                function (data) {//获取数据后开启弹窗
                    var tmp1 = '';
                    if(data.api_headers.length >=1) {
                        $.each(data.api_headers, function (k, v) {
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
                    if(data.api_params.length >=1){
                        $.each(data.api_params,function (k,v) {
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
                                    '<input type="text" name="param_type" placeholder="Type" class="layui-input" value="' + v['param_type'] + '">'+
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
                    layer.open({
                        title: '测试接口',
                        area: ['1150px', '850px'],
                        content: '<form class="layui-form layui-form-pane" id="project-api-add" action="/add_project_api" style="width: 1100px">'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">服务器域名</label>'+
                        '<div class="layui-input-block">'+
                        '<input type="text" id="project-api-add-host" name="host" style="width: 940px" lay-verify="required" lay-verify="name" autocomplete="off"  class="layui-input">'+
                        '</div>'+
                        '<label class="layui-form-label">接口名称</label>'+
                        '<div class="layui-input-block">'+
                        '<input type="text" id="project-api-add-name" name="api_name" style="width: 940px" lay-verify="required" lay-verify="name" autocomplete="off" placeholder="请输入接口名称" class="layui-input"' +
                        'value='+data.api_name+'>'+
                        '</div>'+
                        '<label class="layui-form-label">接口地址</label>'+
                        '<div class="layui-input-block" >'+
                        '<input type="text" id="project-api-add-path" name="path" style="width: 940px" lay-verify="required" lay-verify="path" autocomplete="off" placeholder="请输入接口地址" class="layui-input"' +
                        'value='+data.api_path+'>'+
                        '</div>'+
                        '</div>'+
                        '<div class="layui-form-item">'+
                        '<label class="layui-form-label">协议</label>'+
                        '<div class="layui-input-inline">'+
                        '<select id="project-api-add-protocol" name="protocol" >'+
                        // '<option value="'+data.api_protocol.toUpperCase()+'">'+data.api_protocol.toUpperCase()+'</option>'+
                        '<option value="http">HTTP</option>'+
                        '<option value="https">HTTPS</option>'+
                        '</select>'+
                        '</div>'+
                        '<label class="layui-form-label">请求方式</label>'+
                        '<div class="layui-input-inline">'+
                        '<select id="project-api-add-method" name="method">'+
                        // '<option value="'+data.api_method.toUpperCase()+'">'+data.api_method.toUpperCase()+'</option>'+
                        '<option value="get">GET</option>'+
                        '<option value="post">POST</option>'+
                        '<option value="put">PUT</option>'+
                        '<option value="delete">DELETE</option>'+
                        '</select>'+
                        '</div>'+
                        '</div>'+
                        '<blockquote class="layui-elem-quote">请求头 '+
                        '<a href="javascript:;" class="right add-field" data-num="0">'+
                        '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                        '</a>'+
                        '</blockquote>'+
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
                        '<blockquote class="layui-elem-quote">请求参数 '+
                        '<a href="javascript:;" class="right add-param-field" data-num="0">'+
                        '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                        '</a>'+
                        '</blockquote>'+
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
                        '</table>'+
                        '<blockquote class="layui-elem-quote">响应结果'+
                        '</blockquote>'+
                        '<div class="layui-form-item layui-form-text">'+
                        '<div class="layui-input-block">'+
                        '<textarea  type="text" id="resonpse"'+
                        'name="resonpse" lay-verify="resonpse"'+
                        'class="layui-input" placeholder="输入响应结果模板" style="width: 100%;min-height: 150px">' +
                        '</textarea>'+
                        '</div>'+
                        '</div>'+
                        '</form>',//设置弹窗的容器
                        btn: ['运行','取消'],//点击确定的时候，会关闭弹窗
                        yes: function (index, layero) {
                            var url = $("#project-api-add-protocol option:selected").val()+'://'+$("#project-api-add-host").val()+'/'+$("#project-api-add-path").val().replace(/^\//,"");
                            var dh = {};
                            var dp = {};
                            for(var n = 0;n < $("input[name='header_key']").length;n++){
                                dh[$("input[name='header_key']")[n].value] = $("input[name='header_value']")[n].value;
                                }
                            for(var i=0;i<$("input[name='param_name']").length;i++){
                                dp[$("input[name='param_name']")[i].value] = $("input[name='param_default']")[i].value;
                                }
                            $.ajax({
                                url:url,
                                type:$("#project-api-add-method option:selected").val(),
                                headers:dh,
                                data:dp,
                                success : function(msg){
                                    $("#resonpse").text(JSON.stringify(msg));
                                    form.render();
                                },
                                error : function(err){
                                    alert('请求失败!');
                                }
                            })
                        },
                        btn2: function (index, layero){
                            layer.close(index)
                        }
                    });
                    $("#project-api-add-protocol option[value='"+data.api_protocol+"']").prop("selected",true);//根据值让option选中
                    // $("#project-api-add-method option[value='"+data.api_method+"']").prop("selected",true);
                    $("select[name='method']").val(data.api_method);//另外一种select赋值方法
                    form.render();
                }
            )

        }
    });


    //监听工具条，全局
    var apiTools = {
        apiAdd: function () {//新增接口
            layer.open({
                title: '新增接口',
                area: ['1150px', '850px'],
                content: '<form class="layui-form layui-form-pane" id="project-api-add" action="/add_project_api" style="width: 1100px">'+
                    '<div class="layui-form-item">'+
                    '<label class="layui-form-label">接口名称</label>'+
                    '<div class="layui-input-block">'+
                    '<input type="text" id="project-api-add-name" name="api_name" style="width: 940px" lay-verify="required" lay-verify="name" autocomplete="off" placeholder="请输入接口名称" class="layui-input">'+
                    '</div>'+
                    '<label class="layui-form-label">接口地址</label>'+
                    '<div class="layui-input-block" >'+
                    '<input type="text" id="project-api-add-path" name="path" style="width: 940px" lay-verify="required" lay-verify="path" autocomplete="off" placeholder="请输入接口地址" class="layui-input">'+
                    '</div>'+
                    '</div>'+
                    '<div class="layui-form-item">'+
                    '<label class="layui-form-label">协议</label>'+
                    '<div class="layui-input-inline">'+
                    '<select id="project-api-add-protocol" name="protocol" >'+
                    '<option value="http">HTTP</option>'+
                    '<option value="https">HTTPS</option>'+
                    '</select>'+
                    '</div>'+
                    '<label class="layui-form-label">请求方式</label>'+
                    '<div class="layui-input-inline">'+
                    '<select id="project-api-add-method" name="method">'+
                    '<option value="get">GET</option>'+
                    '<option value="post">POST</option>'+
                    '<option value="put">PUT</option>'+
                    '<option value="delete">DELETE</option>'+
                    '</select>'+
                    '</div>'+
                    '</div>'+
                    '<blockquote class="layui-elem-quote">请求头 '+
                    '<a href="javascript:;" class="right add-field" data-num="0">'+
                    '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                    '</a>'+
                    '</blockquote>'+
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
                    '<tr>'+
                    '<td>'+
                    '<input type="text" name="header_key" placeholder="Key" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<input type="text" name="header_value" placeholder="Value" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<a href="javascript:;" class="delete">'+
                    '<i class="layui-icon">&#x1006;</i>'+
                    '</a>'+
                    '</td>'+
                    '</tr>'+
                    '</tbody>'+
                    '</table>'+
                    '<blockquote class="layui-elem-quote">请求参数 '+
                    '<a href="javascript:;" class="right add-param-field" data-num="0">'+
                    '<i class="layui-icon" style="font-size: 20px; font-weight: bold;color: #009688;">&#xe608;</i>'+
                    '</a>'+
                    '</blockquote>'+
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
                    '<tr>'+
                    '<td>'+
                    '<input type="text" name="param_name" placeholder="Name" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<input type="text" name="param_desc" placeholder="Desc" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<input type="text" name="param_default" placeholder="Default" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<select id="project-api-add-param_type" name="param_type" >'+
                    '<option value="string">string</option>'+
                    '<option value="int">int</option>'+
                    '</select>'+
                    '</td>'+
                    '<td>'+
                    '<input type="checkbox" name="param_must" title="" lay-skin="primary" value="1" checked>'+
                    '</td>'+
                    '<td>'+
                    '<a href="javascript:;" class="delete">'+
                    '<i class="layui-icon">&#x1006;</i>'+
                    '</a>'+
                    '</td>'+
                    '</tr>'+
                    '<tr>'+
                    '<td>'+
                    '<input type="text" name="param_name" placeholder="Name" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<input type="text" name="param_desc" placeholder="Desc" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<input type="text" name="param_default" placeholder="Default" class="layui-input">'+
                    '</td>'+
                    '<td>'+
                    '<select id="project-api-add-param_type" name="param_type" >'+
                    '<option value="string">string</option>'+
                    '<option value="int">int</option>'+
                    '</select>'+
                    '</td>'+
                    '<td>'+
                    '<input type="checkbox" name="param_must" title="" lay-skin="primary" value="1" checked>'+
                    '</td>'+
                    '<td>'+
                    '<a href="javascript:;" class="delete">'+
                    '<i class="layui-icon">&#x1006;</i>'+
                    '</a>'+
                    '</td>'+
                    '</tr>'+
                    '</tbody>'+
                    '</table>'+
                    '<blockquote class="layui-elem-quote">响应结果'+
                    '</blockquote>'+
                    '<div class="layui-form-item layui-form-text">'+
                    '<div class="layui-input-block">'+
                    '<textarea  type="text" id="resonpse"'+
                    'name="resonpse" lay-verify="resonpse"'+
                    'class="layui-input" placeholder="输入响应结果模板" style="width: 100%;min-height: 150px"></textarea>'+
                    '</div>'+
                    '</div>'+
                    '</form>',
                btn: ['确定', '取消'],
                //一个是确定添加，一个是取消
                yes: function (index, layero) {
                    var values = {};
                    $(function (){
                        var params = $("#project-api-add").serializeArray();//序列化表单，转化成一个json结构对象
                        var x;
                        values["headers"] = [];
                        values["params"] = [];
                        var a = ["header_key","header_value","param_name","param_desc","param_default","param_type","param_must"];
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
                    });
                    //确定添加的时候需要吧各个值传到服务器当中
                    $.post(
                        '/add_project_api',
                        {
                            pdata:JSON.stringify(values), //对象转字符串
                            project_id: pid,
                            csrfmiddlewaretoken:csrftoken,
                        },
                        function (data) {//新增成功后需要关闭弹窗并且重载表格
                            layer.close(index)
                            layer.msg('新增成功！', {icon: 1})
                            apiTable.reload()
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
        apiSearch: function () {
            var apiSearch = $('#apiSearch').val();//获取输入框的值
              //执行重载
            table.reload('apiTable',
                {
                    page:
                        {
                            curr: 1 //重新从第 1 页开始
                        }
                , where:{
                      'api_name': apiSearch,
                      'pid':pid,
                      'csrfmiddlewaretoken':csrftoken
                      }//这里传参  向后台
                , url: '/search_project_apis'//后台做模糊搜索接口路径
                , method: 'get'
                });
        }
      };
    //这个是用于创建点击事件的实例
    $('.apiTools .layui-btn').on('click', function ()
    {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });
    //搜索 ----------------------------------------------- End-----------------------------------------------------------

    //监听全局工具栏按钮点击
    $('#project-api-tool > .layui-btn').on('click', function () {
        var type = $(this).data('type');
        //如果apiTools[type]存在则call,否则为""
        apiTools[type] ? apiTools[type].call(this) : "";
    });

})