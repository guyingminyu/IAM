import time
import json

# Create your views here.
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse

from api.models import *
from tools.aps import APS
from tools import log

try:
    log.setup_logging()
    logger = log.get_logger()
except Exception:
    pass


# 发送邮件
def send(request):
    msg='<a href="http://www.baidu.com" target="_blank">点击激活</a>'
    send_mail('测试邮件','',settings.EMAIL_HOST_USER,['fasheo@163.com'],html_message=msg)
    return HttpResponse('ok')

def auto_aps(request):
    if APS.scheduler.state == 0:
        print("state:%s"%APS.scheduler.state)
        APS.start_aps()
    elif APS.scheduler.state == 2:
        print(APS.scheduler.state)
        APS.resume_aps()
    i = 0
    while i<5:
        i+=1
        print(i)
        time.sleep(1)
    APS.stop_aps()
    return HttpResponse('ok,state:%s'%APS.scheduler.state)

def auto_aps1(request):
    status = 1
    if APS.scheduler.state == 0:
        print("state:%s"%APS.scheduler.state)
        status = 0
        APS.start_aps()
    elif APS.scheduler.state == 2:
        print(APS.scheduler.state)
        APS.resume_aps()
        status = 2
    print("state:%s" % APS.scheduler.state)
    return HttpResponse('ok,state:%s'%status)

def testjson(request,data):
    projects = Project.objects.values()
    resultdict = {}
    total = projects.count()
    resultdict['code'] = 0
    resultdict['count'] = total
    resultdict['msg'] = 'success'
    resultdict['data'] = list(projects)
    return JsonResponse(resultdict)

def testhtml(request,data):
    print(data)
    return render(request,'testf.html')

def page_not_found(request):
    return render(request, '404.html')

def page_error(request):
    return render(request, '500.html')

def permission_denied(request):
    return render(request, '403.html')

def login(request):
    return render(request, "login.html")


def admin_login(request):
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = auth.authenticate(username=username,password=password)
        if user:
            auth.login(request,user)
            # response = HttpResponseRedirect('/event_manage/')
            content = b'{"code":100,"msg":"success","data":""}'
            response = HttpResponse(content=content,content_type='application/json; charset=utf-8')
            # response.set_cookie('user',username,3600)
            request.session['user'] = username
            # print(response)
            return response
        else:
            return render(request, 'login.html', {'error': 'username or password error!'})

@login_required
def index(request):
    username = request.session.get('user', '')
    projects = Project.objects.filter(type=1)
    title = '主页'
    return render(request,'index.html',{'user':username,'projects':projects,'title':title})

@login_required
def event_manage(request):
    # username = request.COOKIES.get('user','')
    projects = Project.objects.filter(type=1)
    username = request.session.get('user','')
    paginator = Paginator(projects,15)
    page = request.GET.get('page')
    title = '项目管理'
    try:
        project_list = paginator.page(page)
    except PageNotAnInteger:
        project_list = paginator.page(1)
    except EmptyPage:
        project_list = paginator.page(paginator.num_pages)
    return render(request,'project.html',{'user':username,'project_list':project_list,'title':title})

def get_projects(request):
    projects = Project.objects.values()
    resultdict = {}
    total = projects.count()
    resultdict['code'] = 0
    resultdict['count'] = total
    resultdict['msg'] = 'success'
    resultdict['data'] = list(projects)
    return JsonResponse(resultdict,safe=False)

@login_required
def search_name(request):
    username = request.session.get('user','')
    search_name = request.GET.get('name','')
    projects = Project.objects.filter(name__contains=search_name)
    paginator = Paginator(projects,15)
    page = request.GET.get('page')
    try:
        project_list = paginator.page(page)
    except PageNotAnInteger:
        project_list = paginator.page(1)
    except EmptyPage:
        project_list = paginator.page(paginator.num_pages)
    return render(request,'project.html',{'user':username,'project_list':project_list,'title':'项目管理'})

@login_required
def create_project(request):
    # username = request.session.get('user','')
    project_name = request.POST.get('name','')
    project_host = request.POST.get('host','')
    project_port = request.POST.get('port','')
    Project.objects.create(name=project_name,host=project_host,port=project_port)
    response = HttpResponseRedirect('/project/')
    # project_list = Project.objects.filter(type=1)
    # return render(request,'event_manage.html',{'user':username,'project_list':project_list})
    return response

@login_required
def delete_project(request):
    if request.method=='POST':
        project_id = request.POST.get('id','')
        Project.objects.filter(id=project_id).delete()
        response = HttpResponse(content=b'success!')
        return response

@login_required
def edit_project(request,pid):
    try:
        project_id = pid
        project_name = request.POST.get('name','')
        project_host = request.POST.get('host','')
        project_port = request.POST.get('port','')
        Project.objects.filter(id=project_id).update(name=project_name,host=project_host,port=project_port)
        response = HttpResponseRedirect('/project/')
        return response
    except Exception as e:
        print(e)
        return HttpResponseRedirect('/project/')

@login_required
def logout(request):
    auth.logout(request)
    return redirect(reverse('index'))

@login_required
def project_html(request):
    projects = Project.objects.filter(type=1)
    username = request.session.get('user','')
    paginator = Paginator(projects,15)
    page = request.GET.get('page')
    title = '项目管理'
    try:
        project_list = paginator.page(page)
    except PageNotAnInteger:
        project_list = paginator.page(1)
    except EmptyPage:
        project_list = paginator.page(paginator.num_pages)
    return render(request,'project.html',{'user':username,'project_list':project_list,'title':title})

@login_required
def project_env(request,pid):
    username = request.session.get('user', '')
    projects = Project.objects.filter(type=1)
    project_name = Project.objects.filter(id=pid).values('name').first()
    data = {
        'user':username,
        'projects':projects,
        'title':project_name['name']
    }
    return render(request,'project_env.html',data)

@login_required
def get_project_envs(request):
    page = request.POST.get('page','1')
    rows = request.POST.get('limit','10')
    pid = request.POST.get('pid',0)
    i = (int(page)-1)*int(rows)
    j = (int(page)-1)*int(rows)+int(rows)
    envs = Env.objects.filter(project=pid)
    total = envs.count()
    envs = envs[i:j]
    resultdict = {}
    data = []
    for e in envs:
        de = {}
        de['id'] = e.id
        de['env_name'] = e.env_name
        de['env_desc'] = e.env_desc
        de['env_value'] = e.env_value
        data.append(de)
    resultdict['code'] = 0
    resultdict['count'] = total
    resultdict['msg'] = 'success'
    resultdict['data'] = data
    return JsonResponse(resultdict,safe=False)

@login_required
def search_project_envs(request):
    page = request.POST.get('page','1')
    rows = request.POST.get('limit','10')
    pid = request.POST.get('pid',0)
    env_name = request.POST.get('env_name','')
    i = (int(page)-1)*int(rows)
    j = (int(page)-1)*int(rows)+int(rows)
    envs = Env.objects.filter(project=pid,env_name__contains=env_name)
    total = envs.count()
    envs = envs[i:j]
    resultdict = {}
    data = []
    for e in envs:
        de = {}
        de['id'] = e.id
        de['env_name'] = e.env_name
        de['env_desc'] = e.env_desc
        de['env_value'] = e.env_value
        data.append(de)
    resultdict['code'] = 0
    resultdict['count'] = total
    resultdict['msg'] = 'success'
    resultdict['data'] = data
    return JsonResponse(resultdict,safe=False)

@login_required
def get_project_env(request):
    eid = request.POST.get('id')
    env = Env.objects.get(id=eid)
    de = {}
    de['id'] = env.id
    de['env_name'] = env.env_name
    de['env_desc'] = env.env_desc
    de['env_value'] = env.env_value
    return JsonResponse(de,safe=False)

@login_required
def add_project_env(request):
    env_name = request.POST.get("env_name","")
    env_value = request.POST.get("env_value","")
    env_desc = request.POST.get("env_desc","")
    project_id = request.POST.get("project_id",0)
    env = Env.objects.create(env_name=env_name,env_value=env_value,env_desc=env_desc,project_id=project_id)
    env.save()
    resultdict = {
        'code':100,
        'msg':'success',
        'data':{'env_id':env.id}
    }
    return JsonResponse(resultdict,safe=False)

@login_required
def edit_project_env(request):
    env_name = request.POST.get("env_name","")
    env_value = request.POST.get("env_value","")
    env_desc = request.POST.get("env_desc","")
    eid = request.POST.get("id",0)
    try:
        Env.objects.filter(id=eid).update(env_name=env_name,env_value=env_value,env_desc=env_desc)
        resultdict = {
            'code':100,
            'msg':'success',
            'data':[]
        }
        return JsonResponse(resultdict,safe=False)
    except Exception as e:
        print(e)
        resultdict = {
            'code':2,
            'msg':'error',
            'data':[]
        }
        return JsonResponse(resultdict,safe=False)

@login_required
def del_project_env(request):
    try:
        eid = request.POST.get("id",0)
        Env.objects.get(id=eid).delete()
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        print(e)
        resultdict = {
            'code': 2,
            'msg': 'error',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
def project_api(request,pid):
    username = request.session.get('user', '')
    projects = Project.objects.filter(type=1)
    project_name = Project.objects.filter(id=pid).values('name').first()
    data = {
        'user': username,
        'projects': projects,
        'title': project_name['name']
    }
    return render(request, 'project_api.html', data)

@login_required
def get_project_apis(request):
    if request.method=='GET':
        page = request.GET.get('page','1')
        rows = request.GET.get('limit','10')
        pid = request.GET.get('pid',0)
        i = (int(page)-1)*int(rows)
        j = (int(page)-1)*int(rows)+int(rows)
        apis = Api.objects.filter(project_id=pid,api_status=1)
        total = apis.count()
        apis = apis[i:j]
        resultdict = {}
        data = []
        for api in apis:
            de = {}
            de['id'] = api.id
            de['api_name'] = api.api_name
            de['api_method'] = api.api_method
            de['api_path'] = api.api_path
            if api.api_case_coverage==0:
                de['isAll'] = 1
                de['ratio'] = '0/0'
            else:
                api_case_count = Case.objects.filter(api_id=api.id).count()
                if api_case_count/api.api_case_coverage >=1:
                    de['isAll'] = 1
                    de['ratio'] = '%d/%d'%(api_case_count,api.api_case_coverage)
                else:
                    de['isAll'] = 0
                    de['ratio'] = '%d/%d'%(api_case_count,api.api_case_coverage)
            de['api_update_time'] = api.api_update_time.strftime("%Y-%m-%d %H:%M:%S")
            data.append(de)
        resultdict['code'] = 0
        resultdict['count'] = total
        resultdict['msg'] = 'success'
        resultdict['data'] = data
        return JsonResponse(resultdict, safe=False)

@login_required
def search_project_apis(request):
    page = request.GET.get('page', '1')
    rows = request.GET.get('limit', '10')
    pid = request.GET.get('pid', 0)
    api_name = request.GET.get('api_name', '')
    i = (int(page) - 1) * int(rows)
    j = (int(page) - 1) * int(rows) + int(rows)
    apis = Api.objects.filter(project=pid, api_name__contains=api_name,api_status=1)
    total = apis.count()
    apis = apis[i:j]
    resultdict = {}
    data = []
    for api in apis:
        de = {}
        de['id'] = api.id
        de['api_name'] = api.api_name
        de['api_method'] = api.api_method
        de['api_path'] = api.api_path
        if api.api_case_coverage == 0:
            de['isAll'] = 1
            de['ratio'] = '0/0'
        else:
            api_case_count = Case.objects.filter(api_id=api.id).count()
            if api_case_count / api.api_case_coverage == 1:
                de['isAll'] = 1
                de['ratio'] = '%d/%d' % (api_case_count, api.api_case_coverage)
            else:
                de['isAll'] = 0
                de['ratio'] = '%d/%d' % (api_case_count, api.api_case_coverage)
        de['api_update_time'] = api.api_update_time.strftime("%Y-%m-%d %H:%M:%S")
        data.append(de)
    resultdict['code'] = 0
    resultdict['count'] = total
    resultdict['msg'] = 'success'
    resultdict['data'] = data
    return JsonResponse(resultdict, safe=False)

@login_required
def get_project_api(request):
    if request.method=='GET':
        aid = request.GET.get('id')
        api = Api.objects.get(id=aid)
        de = {}
        headers = ApiHeaders.objects.filter(api_id=aid).values("id","head_name","head_value")
        params = ApiParameters.objects.filter(api_id=aid).values("id","param_name","param_desc","param_default","param_type","param_must")
        # print(list(params))
        de['id'] = api.id
        de['api_headers'] = list(headers)
        de['api_params'] = list(params)
        de['api_name'] = api.api_name
        de['api_protocol'] = api.api_protocol
        de['api_method'] = api.api_method
        de['api_path'] = api.api_path
        de['api_update_time'] = api.api_update_time.strftime("%Y-%m-%d %H:%M:%S")
        de['api_response'] = api.api_response
        return JsonResponse(de,safe=False)

@login_required
def add_project_api(request):
    try:
        api_data = request.POST.get("pdata","")
        d_api_data = eval(api_data)
        api_name = d_api_data['api_name']
        api_method = d_api_data['method']
        api_path = d_api_data['path']
        api_protocol = d_api_data['protocol']
        api_response = d_api_data['resonpse']
        project_id = request.POST.get("project_id",0)
        api = Api.objects.create(api_name=api_name,api_method=api_method,api_path=api_path,project_id=project_id,
                                 api_protocol=api_protocol,api_response=api_response,api_update_time=time.strftime('%Y-%m-%d %H:%M:%S'))
        api.save()
        api_headers = d_api_data['headers']
        api_params = d_api_data['params']
        api_headers_list = []
        api_params_list = []
        for header in api_headers:
            if header['header_key'] is not None or header['header_key'] != '':
                api_headers_list.append(ApiHeaders(api_id=api.id,head_name=header['header_key'],head_value=header['header_value']))
        ApiHeaders.objects.bulk_create(api_headers_list)
        for param in api_params:
            if param['param_name'] is not None or param['param_name'] != '':
                api_params_list.append(ApiParameters(api_id=api.id,param_name=param['param_name'],param_desc=param['param_desc'],
                                                     param_default=param['param_default'],param_type=param['param_type'],
                                                     param_must=param['param_must']))
        ApiParameters.objects.bulk_create(api_params_list)
        resultdict = {
            'code':100,
            'msg':'success',
            'data':{'api_id':api.id}
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        print(e)
        resultdict = {
            'code': 2,
            'msg': 'error:%s'%e,
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
def edit_project_api(request):
    try:
        api_id = request.POST.get("api_id")
        # print(api_id)
        api_data = request.POST.get("pdata","")
        d_api_data = eval(api_data)
        api_name = d_api_data['api_name']
        api_method = d_api_data['method']
        api_path = d_api_data['path']
        api_protocol = d_api_data['protocol']
        api_response = d_api_data['resonpse']
        Api.objects.filter(id=api_id).update(api_name=api_name,api_method=api_method,api_path=api_path,
                                 api_protocol=api_protocol,api_response=api_response,api_update_time=time.strftime('%Y-%m-%d %H:%M:%S'))
        api_headers = d_api_data['headers']
        api_params = d_api_data['params']
        api_headers_list = []
        api_params_list = []
        api_headers_old = ApiHeaders.objects.filter(api_id=api_id).values_list("head_name",flat=True)
        api_params_old = ApiParameters.objects.filter(api_id=api_id).values_list("param_name",flat=True)
        # print(api_headers_list)
        for header in api_headers:
            if header['header_key'] in api_headers_old:
                ApiHeaders.objects.filter(head_name=header['header_key']).update(head_value=header['header_value'])
            elif header['header_key'] is not None and header['header_key'] != '':
                api_headers_list.append(ApiHeaders(api_id=api_id,head_name=header['header_key'],head_value=header['header_value']))
        ApiHeaders.objects.bulk_create(api_headers_list)
        for header_old in api_headers_old:
            if header_old not in [x['header_key'] for x in api_headers]:
                ApiHeaders.objects.filter(head_name=header_old).delete()
        for param in api_params:
            if param['param_name'] in api_params_old:
                ApiParameters.objects.filter(param_name=param['param_name']).update(param_desc=param['param_desc'],
                                                 param_default=param['param_default'],param_type=param['param_type'],
                                                 param_must=param['param_must'])
            elif param['param_name'] is not None and param['param_name'] != '':
                api_params_list.append(ApiParameters(api_id=api_id,param_name=param['param_name'],param_desc=param['param_desc'],
                                                 param_default=param['param_default'],param_type=param['param_type'],
                                                 param_must=param['param_must']))
        ApiParameters.objects.bulk_create(api_params_list)
        for param_old in api_params_old:
            if param_old not in [y['param_name'] for y in api_params]:
                ApiParameters.objects.filter(param_name=param_old).delete()
        resultdict = {
            'code':100,
            'msg':'success',
            'data':{'api_id':api_id}
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        print(e)
        resultdict = {
            'code': 2,
            'msg': 'error:%s'%e,
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
def del_project_api(request):
    try:
        aid = request.POST.get("id",0)
        Api.objects.get(id=aid).delete()
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        print(e)
        resultdict = {
            'code': 2,
            'msg': 'error',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
def project_case(request,pid):
    username = request.session.get('user', '')
    projects = Project.objects.filter(type=1)
    project_name = Project.objects.filter(id=pid).values('name').first()
    data = {
        'user': username,
        'projects': projects,
        'title': project_name['name']
    }
    return render(request, 'project_case.html', data)

@login_required
def get_project_cases(request):
    page = request.GET.get('page', '1')
    rows = request.GET.get('limit', '10')
    pid = request.GET.get('pid', 0)
    i = (int(page) - 1) * int(rows)
    j = (int(page) - 1) * int(rows) + int(rows)
    cases = Case.objects.filter(project_id=pid)
    total = cases.count()
    cases = cases[i:j]
    resultdict = {}
    data = []
    for case in cases:
        de = {}
        de['id'] = case.id
        de['case_name'] = case.case_name
        de['api_path'] = Api.objects.filter(id=case.api_id).values_list("api_path").first()
        de['case_desc'] = case.case_desc
        de['case_status'] = case.case_status
        de['case_update_time'] = case.case_update_time.strftime("%Y-%m-%d %H:%M:%S")
        data.append(de)
    resultdict['code'] = 0
    resultdict['count'] = total
    resultdict['msg'] = 'success'
    resultdict['data'] = data
    return JsonResponse(resultdict, safe=False)

@login_required
def search_project_cases(request):
    if request.method == 'GET':
        try:
            page = request.GET.get('page', '1')
            rows = request.GET.get('limit', '10')
            pid = request.GET.get('pid',0)
            case_name = request.GET.get('case_name','')
            case_api = request.GET.get('case_api','')
            case_status = int(request.GET.get('case_status',2))
            if case_status > 1:
                cases = Case.objects.filter(project_id=pid, case_name__contains=case_name,
                                            api__api_path__contains=case_api)
            else:
                cases = Case.objects.filter(project_id=pid, case_name__contains=case_name,
                                            api__api_path__contains=case_api,case_status=case_status)
            i = (int(page) - 1) * int(rows)
            j = (int(page) - 1) * int(rows) + int(rows)
            total = cases.count()
            cases = cases[i:j]
            resultdict = {}
            data = []
            for case in cases:
                de = {}
                de['id'] = case.id
                de['case_name'] = case.case_name
                de['api_path'] = Api.objects.filter(id=case.api_id).values_list("api_path").first()
                de['case_desc'] = case.case_desc
                de['case_status'] = case.case_status
                de['case_update_time'] = case.case_update_time.strftime("%Y-%m-%d %H:%M:%S")
                data.append(de)
            resultdict['code'] = 0
            resultdict['count'] = total
            resultdict['msg'] = 'success'
            resultdict['data'] = data
            return JsonResponse(resultdict, safe=False)
        except Exception as e:
            logger.error(e)
            resultdict = {
                'code': 2,
                'msg': 'error',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)

@login_required
def get_case_api_list(request):
    if request.method == 'GET':
        try:
            pid = request.GET.get('pid',0)
            api_path_list = Api.objects.filter(project_id=pid).values("id","api_path")
            resultdict = {}
            resultdict['code'] = 0
            resultdict['count'] = api_path_list.count()
            resultdict['msg'] = 'success'
            resultdict['data'] = list(api_path_list)
            return JsonResponse(resultdict, safe=False)
        except Exception as e:
            logger.error(e)
            resultdict = {
                'code': 2,
                'msg': 'error',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)

@login_required
def get_project_case(request):
    if request.method == 'GET':
        cid = request.GET.get('id',0)
        case = Case.objects.filter(id=cid).values().first()
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': case
        }
        return JsonResponse(resultdict,safe=False)

@login_required
def add_project_case(request):
    if request.method == 'POST':
        try:
            case_data = request.POST.get('pdata')
            d_case_data = eval(case_data)
            case_name = d_case_data['project-case-add-name']
            case_desc = d_case_data['project-case-add-desc']
            project_id = request.POST.get("project_id",0)
            api_id = d_case_data['case-api']
            case = Case.objects.create(case_name=case_name,case_desc=case_desc,case_status=1,project_id=project_id,
                                       api_id=api_id,case_update_time=time.strftime('%Y-%m-%d %H:%M:%S'))
            case.save()
            headers = ApiHeaders.objects.filter(api_id=api_id).values("head_name", "head_value")
            params = ApiParameters.objects.filter(api_id=api_id).values("param_name", "param_desc", "param_default",
                                                                        "param_type", "param_must")
            api_headers = list(headers)
            api_params = list(params)
            case_api = CaseApi.objects.create(api_id=api_id,case_id=case.id,
                                              api_params=api_params, api_headers=api_headers,
                                              ca_update_time=time.strftime('%Y-%m-%d %H:%M:%S'))
            case_api.save()
            resultdict = {
                'code':100,
                'msg':'success',
                'data':{'case_id':case.id}
            }
            return JsonResponse(resultdict, safe=False)
        except Exception as e:
            logger.error(e)
            resultdict = {
                'code': 2,
                'msg': 'error',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)

@login_required
def set_case_status(request):
    if request.method == 'POST':
        try:
            case_ids = json.loads(request.POST.get('id'))
            case_status = request.POST.get('case_status')
            Case.objects.filter(id__in=case_ids).update(case_status=case_status)
            resultdict = {
                'code': 100,
                'msg': 'success',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)
        except Exception as e:
            logger.error(e)
            resultdict = {
                'code': 2,
                'msg': 'error',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)

@login_required
def edit_project_case(request):
    if request.method == 'POST':
        try:
            case_data = request.POST.get('pdata')
            d_case_data = eval(case_data)
            case_name = d_case_data['project-case-add-name']
            case_desc = d_case_data['project-case-add-desc']
            api_id = d_case_data['case-api']
            case_id = request.POST.get('case_id',0)
            Case.objects.filter(id=case_id).update(case_name=case_name, case_desc=case_desc,
                                       api_id=api_id, case_update_time=time.strftime('%Y-%m-%d %H:%M:%S'))
            resultdict = {
                'code': 0,
                'msg': 'success',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)
        except Exception as e:
            logger.error(e)
            resultdict = {
                'code': 2,
                'msg': 'error',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)

@login_required
def del_project_case(request):
    try:
        cid = request.POST.get("id",0)
        Case.objects.get(id=cid).delete()
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        print(e)
        resultdict = {
            'code': 2,
            'msg': 'error',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)


@login_required
def case_detail(request,pid,cid):
    if request.method == 'GET':
        username = request.session.get('user', '')
        projects = Project.objects.filter(type=1)
        project_name = Project.objects.filter(id=pid).values('name').first()
        case_detail = CaseApi.objects.filter(case_id=cid).values()
        data = {
            'user': username,
            'projects': projects,
            'pid':pid,
            'title': project_name['name'],
            'case_detail':case_detail
        }
        return render(request, 'case_detail.html', data)

@login_required
def get_case_apis(request):
    if request.method == 'GET':
        page = request.GET.get('page', '1')
        rows = request.GET.get('limit', '10')
        pid = request.GET.get('pid', 0)
        cid = request.GET.get('cid',0)
        case_apis = CaseApi.objects.filter(case_id=cid).order_by('sort')
        i = (int(page) - 1) * int(rows)
        j = (int(page) - 1) * int(rows) + int(rows)
        total = case_apis.count()
        case_apis = case_apis[i:j]
        resultdict = {}
        data = []
        for ca in case_apis:
            de = {}
            api_info = Api.objects.filter(id=ca.api_id).values('api_name','api_path','api_method').first()
            de['id'] = ca.id
            de['api_name'] = api_info['api_name']
            de['api_path'] = api_info['api_path']
            de['api_method'] = api_info['api_method']
            de['sort'] = ca.sort
            de['case_api_update_time'] = ca.ca_update_time.strftime("%Y-%m-%d %H:%M:%S")
            data.append(de)
        resultdict['code'] = 0
        resultdict['count'] = total
        resultdict['msg'] = 'success'
        resultdict['data'] = data
        return JsonResponse(resultdict, safe=False)

@login_required
def add_project_case_api(request):
    if request.method == 'POST':
        try:
            case_data = request.POST.get('pdata')
            d_case_data = eval(case_data)
            api_id = d_case_data['case-api']
            headers = ApiHeaders.objects.filter(api_id=api_id).values("head_name", "head_value")
            params = ApiParameters.objects.filter(api_id=api_id).values("param_name", "param_desc", "param_default",
                                                                     "param_type", "param_must")
            api_headers = list(headers)
            api_params = list(params)
            case_id = request.POST.get('case_id',0)
            max_sort = CaseApi.objects.filter(case_id=case_id).order_by("-sort").values("sort").first()
            case_api = CaseApi.objects.create(api_id=api_id,case_id=case_id,sort=max_sort['sort']+1,
                                              api_params=api_params,api_headers=api_headers,
                                              ca_update_time=time.strftime('%Y-%m-%d %H:%M:%S'))
            case_api.save()
            resultdict = {
                'code': 0,
                'msg': 'success',
                'data': {'case_api_id':case_api.id}
            }
            return JsonResponse(resultdict, safe=False)
        except Exception as e:
            logger.error(e)
            resultdict = {
                'code': 2,
                'msg': 'error',
                'data': []
            }
            return JsonResponse(resultdict, safe=False)

@login_required
def del_project_case_api(request):
    try:
        caid = request.POST.get("id",0)
        CaseApi.objects.get(id=caid).delete()
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        logger.error(e)
        resultdict = {
            'code': 2,
            'msg': 'error',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
def up_case_api(request):
    try:
        caid = request.POST.get("id",0)
        ca = CaseApi.objects.filter(id=caid).values('sort','case_id').first()
        if ca['sort']>1:
            CaseApi.objects.filter(case_id=ca['case_id'],sort=ca['sort']-1).update(sort=ca['sort'])
            CaseApi.objects.filter(id=caid).update(sort=ca['sort']-1)
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        logger.error(e)
        resultdict = {
            'code': 2,
            'msg': 'error',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
def down_case_api(request):
    try:
        caid = request.POST.get("id",0)
        ca = CaseApi.objects.filter(id=caid).values('sort','case_id').first()
        CaseApi.objects.filter(case_id=ca['case_id'],sort=ca['sort']+1).update(sort=ca['sort'])
        CaseApi.objects.filter(id=caid).update(sort=ca['sort']+1)
        resultdict = {
            'code': 0,
            'msg': 'success',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)
    except Exception as e:
        logger.error(e)
        resultdict = {
            'code': 2,
            'msg': 'error',
            'data': []
        }
        return JsonResponse(resultdict, safe=False)

@login_required
@require_http_methods(['GET'])
def get_case_api_detail(request):
    caid = request.GET.get('id', 0)
    case_api = CaseApi.objects.filter(id=caid).values().first()
    api_info = Api.objects.filter(id=case_api['api_id']).values('api_name','api_path','api_protocol','api_method').first()
    pre_steps = Step.objects.filter(CaseApi_id=caid,step_type=1).order_by('step_sort').values()
    post_steps = Step.objects.filter(CaseApi_id=caid,step_type=2).order_by('step_sort').values()
    data = {}
    case_api_info = api_info
    case_api_info['api_headers'] = eval(case_api['api_headers'])
    case_api_info['api_params'] = eval(case_api['api_params'])
    case_api_info['host'] = case_api['host']
    data['case_api_info']= case_api_info
    data['pre_steps'] = list(pre_steps)
    data['post_steps'] = list(post_steps)
    # print(data)
    resultdict = {
        'code': 0,
        'msg': 'success',
        'data': data
    }
    return JsonResponse(resultdict, safe=False)