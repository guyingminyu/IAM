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
            {type:'numbers'},
            {type: 'checkbox'},
            {field: 'id', title: 'ID', width: 100, sort: true},
            {field: 'api_name', title: '接口名称', width: 260,},
            {field: 'api_path',title:'接口url',width:300},
            {field: 'sort', title: '执行顺序',},
            {field: 'case_api_update_time', title: '更新日期',width: 200,},
            {fixed: 'right', title:'操作', width: 200, toolbar: '#barcase'},//设置每行的工具栏以及其容器
        ]],
    });
    })