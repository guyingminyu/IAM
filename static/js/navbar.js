/**
 * Created by HUB-211 on 2018/9/11.
 */
layui.use(['jquery', 'form', 'element'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var html = '';
//获取菜单
    $.ajax({
        url: "/get_projects",
        type: "post",
        dataType: "json",
        data: {},
        success: function (data) {
            var navs = data.result;
            $.each(navs, function (i, item) {
                html += '<div title="菜单缩放" class="kit-side-fold"><i class="fa fa-navicon" aria-hidden="true"></i></div>' +
                    '<ul class="layui-nav layui-nav-tree" id="index-nav" lay-filter="index-nav" style="margin-top: 0px;">' +
                    '<li class="layui-nav-item" nav-id=' + item.id + '><a class="javascript:;" href="javascript:;">' + item.name + '</a>' +
                    '<dl class="layui-nav-child">' +
                    //第二级菜单
                    '<dd class="project">' +
                    '<a href="/project_env/"+item.id onclick="">环境变量</a>' +
                    '</dd>' +
                    '<dd class="api">' +
                    '<a href="/demo/admin.html">接口管理</a>' +
                    '</dd>' +
                    '<dd class="">' +
                    '<a href="/demo/admin.html">用例管理</a>' +
                    '</dd>' +
                    '<dd class="">' +
                    '<a href="/demo/admin.html">自动化测试</a>' +
                    '</dd>' +
                    '<dd class="">' +
                    '<a href="/demo/admin.html">自动化测试报告</a>' +
                    '</dd>' +
                    '</dl>';
            });
            //渲染html
            $('#admin-navbar-side').html(html);
        }
    });

//触发事件
    var active = {
        tabAdd: function (obj) {
            //新增一个Tab项
            element.tabAdd('admin-tab', {
                title: $(this).html()//用于演示
                , content: '<iframe src="' + $(this).attr('data-url') + '"></iframe>'
            });
            element.tabChange("admin-tab", $('.layui-tab-title li').length - 1);
        },
        tabDelete: function (index) {
            //删除指定Tab项
            element.tabDelete('admin-tab', index); //删除（注意序号是从0开始计算）
        }
        , tabChange: function (lay_id) {
            //切换到指定Tab项
            element.tabChange('admin-tab', lay_id); //切换到：用户管理
        }
    };
//添加tab
    $(document).on('click', 'a', function () {
        if (!$(this)[0].hasAttribute('data-url') || $(this).attr('data-url') === '')return;
        var title = $.trim($(this).text());
        var tabs = $(".layui-tab-title").children();
        for (var i = 0; i < tabs.length; i++) {
            if ($(tabs).eq(i).children('cite').text() == title) {
                element.tabChange('admin-tab', i);
                return;
            }
        }
        active["tabAdd"].call(this);
        resize();
        active.tabChange($(".layui-tab-title").children().length - 1);
    });

//iframe自适应
    function resize() {
        var $content = $('.admin-nav-card .layui-tab-content');
        $content.height($(this).height() - 147);
        $content.find('iframe').each(function () {
            $(this).height($content.height());
        });
    }

    $(window).on('resize', function () {
        var $content = $('.admin-nav-card .layui-tab-content');
        $content.height($(this).height() - 147);
        $content.find('iframe').each(function () {
            $(this).height($content.height());
        });
    }).resize();


//toggle左侧菜单
    $('.admin-side-toggle').on('click', function () {
        var sideWidth = $('#admin-side').width();
        if (sideWidth === 200) {
            $('#admin-body').animate({
                left: '0'
            }); //admin-footer
            $('#admin-footer').animate({
                left: '0'
            });
            $('#admin-side').animate({
                width: '0'
            });
        } else {
            $('#admin-body').animate({
                left: '200px'
            });
            $('#admin-footer').animate({
                left: '200px'
            });
            $('#admin-side').animate({
                width: '200px'
            });
        }
    });
    $(document).on('click', 'dt', function () {
        $(this).parent().find('dd').toggle();
    });
    $(document).on('click', 'dd a', function () {
        $(this).next('ul').toggle();
    });
})