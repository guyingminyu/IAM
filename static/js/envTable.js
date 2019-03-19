/**
 * Created by HUB-211 on 2018/9/25.
 */
        layui.use(['table', 'jquery', 'layer', 'form'], function () {
            var reg = /project_env\/(\d+)/;
            var r = window.location.pathname.match(reg);
            var pid = 0;
            if(r!=null){
                pid = r[1];
            }
            var table = layui.table,
                layer = layui.layer,
                form = layui.form,
                $ = layui.jquery;
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
            $("#project"+pid+" .env").addClass("layui-this");

            //渲染表格
            var envTable = table.render({//渲染table
                method: 'post',//数据传输方式为post
                height: '475',//高度
                cellMinWidth: 80,//单元格最小宽度为80
                page: true,//开启分页
                limit: 10,//分页默认为30
                where: {
                    'pid':pid,
                    'csrfmiddlewaretoken':csrftoken
                },
                elem: '#project-env-table',//设置容器
                url: '/get_project_envs',//数据获取url
                id:'envTable',
                cols: [[//设置列标签、标题、宽度、是否排序等
                    {type:'numbers'},
                    {type: 'checkbox'},
                    {field: 'id', title: 'ID', width: 100, sort: true},
                    {field: 'env_name', title: '变量名', width: 120,},
                    {field: 'env_value', title: '变量值',},
                    {field: 'env_desc', title: '描述',},
                    {fixed: 'right', title:'操作', width: 200, toolbar: '#barEnv'},//设置每行的工具栏以及其容器
                ]],
            });

           //监听工具条，每行
            table.on('tool(data-table)', function (obj) {
                var data = obj.data;
                if (obj.event === 'detail') {//如果event是detail,这里的event名称需要在容器中设置lay-event
                    $.post(//向服务器发送问题id，获取选中问题行的数据
                        '/get_project_env',
                        {id: data.id,
                        csrfmiddlewaretoken:csrftoken},
                        function (data) {//获取数据后开启弹窗
                            layer.open({
                                title: '变量详情',
                                area: ['500px', '400px'],
                                content: '<form id="project-env-detail" class="layui-form" action="" style="width: 100%;height: 80%">'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">变量名称</label>'+
                                '<div class="layui-input-block">'+
                                '<input id="project-env-detail-name" name="project-env-detail-name"'+
                                'lay-verify="project-env-detail-name"'+
                                'class="layui-input" style="width: 90%">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">变量内容</label>'+
                                '<div class="layui-input-block">'+
                                '<input type="text" id="project-env-detail-value" name="project-env-detail-value"'+
                                'lay-verify="project-env-detail-value"'+
                                'class="layui-input" style="width: 90%">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item layui-form-text">'+
                                '<label class="layui-form-label">变量描述</label>'+
                                '<div class="layui-input-block">'+
                                '<textarea  type="text" id="project-env-detail-desc"'+
                                'name="project-env-detail-desc" lay-verify="project-env-detail-desc"'+
                                'class="layui-input" style="width: 90%;min-height: 150px"></textarea>'+
                                '</div>'+
                                '</div>'+
                                '</form>',//设置弹窗的容器
                                btn: ['确定'],//点击确定的时候，会关闭弹窗
                                yes: function (index, layero) {
                                    layer.close(index)
                                }
                            });
                            //设置容器中各个值
                            $('#project-env-detail-name').val(data.env_name);
                            $('#project-env-detail-value').val(data.env_value);
                            $('#project-env-detail-desc').val(data.env_desc);
                        }
                    )
                } else if (obj.event === 'del') {
                    layer.confirm('确认删除吗？', function (index) {
                        obj.del();
                        $.post(
                            '/del_project_env',
                            {id: data.id,
                            csrfmiddlewaretoken:csrftoken},
                            function (data) {//删除成功后需要关闭弹窗并且重载表格
                                layer.close(index)
                                layer.msg('删除成功！', {icon: 1})
                                envTable.reload()
                            }
                        )
                    });
                } else if (obj.event === 'edit') {
                    $.post(//根据id获取服务器中的数据
                        '/get_project_env',
                        {id: data.id,
                        csrfmiddlewaretoken:csrftoken},
                        function (data) {
                            layer.open({
                                title: '编辑变量',
                                area: ['500px', '400px'],
                                content: '<form id="project-env-edit" class="layui-form" action="" style="width: 100%;height: 80%">'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">变量名称</label>'+
                                '<div class="layui-input-block">'+
                                '<input id="project-env-edit-name" name="project-env-edit-name"'+
                                'lay-verify="project-env-edit-name"'+
                                'class="layui-input" style="width: 90%">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">变量内容</label>'+
                                '<div class="layui-input-block">'+
                                '<input type="text" id="project-env-edit-value" name="project-env-edit-value"'+
                                'lay-verify="project-env-edit-value"'+
                                'class="layui-input" style="width: 90%">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item layui-form-text">'+
                                '<label class="layui-form-label">变量描述</label>'+
                                '<div class="layui-input-block">'+
                                '<textarea  type="text" id="project-env-edit-desc"'+
                                'name="project-env-edit-desc" lay-verify="project-env-edit-desc"'+
                                'class="layui-input" style="width: 90%;min-height: 150px"></textarea>'+
                                '</div>'+
                                '</div>'+
                                '</form>',
                                btn: ['确定', '取消'],//一个是确定修改，一个是取消
                                yes: function (index, layero) {
                                    //确定修改的时候需要吧各个值传到服务器当中
                                    $.post(
                                        '/edit_project_env',
                                        {
                                            env_name: $('#project-env-edit-name').val(),
                                            env_value: $('#project-env-edit-value').val(),
                                            env_desc: $('#project-env-edit-desc').val(),
                                            id: data.id,
                                            csrfmiddlewaretoken:csrftoken
                                        },
                                        function (data) {//修改成功后需要关闭弹窗并且重载表格
                                            layer.close(index)
                                            layer.msg('修改成功！', {icon: 1})
                                            envTable.reload()
                                        }
                                    )
                                },
                                btn2: function (index, layero) {
                                    layer.close(index)
                                }
                            });
                            $('#project-env-edit-name').val(data.env_name);
                            $('#project-env-edit-value').val(data.env_value);
                            $('#project-env-edit-desc').val(data.env_desc);
                        }
                    )
                }
            });

            //监听工具条，全局
            var envTools = {
                envAdd: function () {//新增变量
                    layer.open({
                        title: '新增变量',
                        area: ['500px', '400px'],
                        content: '<form id="project-env-add" class="layui-form" action="" style="width: 100%;height: 80%">'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">变量名称</label>'+
                                '<div class="layui-input-block">'+
                                '<input id="project-env-add-name" name="project-env-add-name"'+
                                'lay-verify="project-env-add-name"'+
                                'class="layui-input" style="width: 90%">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item">'+
                                '<label class="layui-form-label">变量内容</label>'+
                                '<div class="layui-input-block">'+
                                '<input type="text" id="project-env-add-value" name="project-env-add-value"'+
                                'lay-verify="project-env-add-value"'+
                                'class="layui-input" style="width: 90%">'+
                                '</div>'+
                                '</div>'+
                                '<div class="layui-form-item layui-form-text">'+
                                '<label class="layui-form-label">变量描述</label>'+
                                '<div class="layui-input-block">'+
                                '<textarea  type="text" id="project-env-add-desc"'+
                                'name="project-env-add-desc" lay-verify="project-env-add-desc"'+
                                'class="layui-input" style="width: 90%;min-height: 150px"></textarea>'+
                                '</div>'+
                                '</div>'+
                                '</form>',
                        btn: ['确定', '取消'],//一个是确定修改，一个是取消
                        yes: function (index, layero) {
                            //确定修改的时候需要吧各个值传到服务器当中
                            $.post(
                                '/add_project_env',
                                {
                                    env_name: $('#project-env-add-name').val(),
                                    env_value: $('#project-env-add-value').val(),
                                    env_desc: $('#project-env-add-desc').val(),
                                    project_id: pid,
                                    csrfmiddlewaretoken:csrftoken,
                                },
                                function (data) {//修改成功后需要关闭弹窗并且重载表格
                                    layer.close(index)
                                    layer.msg('新增成功！', {icon: 1})
                                    envTable.reload()
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
                }
            }
            //搜索 ----------------------------------------------- Begin-----------------------------------------------------------
            var active ={
                  envSearch: function () {
                      var envSearch = $('#envSearch').val();//获取输入框的值
                      //执行重载
                      table.reload('envTable',
                          {
                              page:
                                  {
                                      curr: 1 //重新从第 1 页开始
                                  }
                        , where: {
                              'env_name': envSearch,
                              'pid':pid,
                              'csrfmiddlewaretoken':csrftoken
                              }//这里传参  向后台
                        , url: '/search_project_envs'//后台做模糊搜索接口路径
                        , method: 'post'
                          });
                  }
              };
            //这个是用于创建点击事件的实例
            $('.envTools .layui-btn').on('click', function ()
            {
                var type = $(this).data('type');
                active[type] ? active[type].call(this) : '';
            });
            //搜索 ----------------------------------------------- End-----------------------------------------------------------

            //监听全局工具栏按钮点击
            $('#project-env-tool > .layui-btn').on('click', function () {
                var type = $(this).data('type');
                //如果envTools[type]存在则call,否则为""
                envTools[type] ? envTools[type].call(this) : "";
            })
        })