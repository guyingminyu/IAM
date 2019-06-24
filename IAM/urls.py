"""IAM URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import re_path
from django.conf import settings,urls
from django.views import static,generic
from api import views



urlpatterns = [
    re_path(r'^admin/', admin.site.urls),
    re_path(r'favicon\.ico$',generic.RedirectView.as_view(url='/static/images/favicon.ico')),
    re_path(r'^$',views.index),
    re_path(r'^login/',views.login),
    re_path(r'^index/',views.index,name="index"),
    re_path(r'^admin_login/',views.admin_login,name='login'),
    re_path(r'^logout/',views.logout),
    re_path(r'^event_manage/',views.event_manage,name='emanage'),
    re_path(r'^accounts/login/',views.login),
    re_path(r'^search_name/',views.search_name),
    re_path(r'^create_project/$',views.create_project),
    re_path(r'^delete_project/$',views.delete_project),
    re_path(r'^edit_project/(?P<pid>\d+)$',views.edit_project),
    re_path(r'^project/',views.project_html),
    re_path(r'^project_env/(?P<pid>\d+)$',views.project_env),
    re_path(r'get_project_envs',views.get_project_envs,name='get_project_envs'),
    re_path(r'search_project_envs', views.search_project_envs, name='search_project_envs'),
    re_path(r'get_project_env',views.get_project_env,name='get_project_env'),
    re_path(r'get_projects',views.get_projects,name='get_projects'),
    re_path(r'add_project_env',views.add_project_env,name='add_project_env'),
    re_path(r'edit_project_env',views.edit_project_env,name='edit_project_env'),
    re_path(r'del_project_env',views.del_project_env,name='del_project_env'),
    re_path(r'^project_api/(?P<pid>\d+)',views.project_api),
    re_path(r'get_project_apis',views.get_project_apis,name='get_project_apis'),
    re_path(r'get_project_api',views.get_project_api,name='get_project_api'),
    re_path(r'search_project_apis', views.search_project_apis, name='search_project_apis'),
    re_path(r'add_project_api',views.add_project_api,name='add_project_api'),
    re_path(r'edit_project_api',views.edit_project_api,name='edit_project_api'),
    re_path(r'del_project_api',views.del_project_api,name='del_project_api'),
    re_path(r'testhtml/(?P<data>.*)$',views.testhtml),
    re_path(r'^testjson/(?P<data>.*)$',views.testjson),
    re_path(r'send',views.send),
    re_path(r'project_case/(?P<pid>\d+)',views.project_case,name='project_case'),
    re_path(r'get_project_cases',views.get_project_cases,name='get_project_cases'),
    re_path(r'search_project_cases',views.search_project_cases),
    re_path(r'auto_aps/',views.auto_aps),
    re_path(r'auto_aps1/', views.auto_aps1),
    re_path(r'set_case_status',views.set_case_status),
    re_path(r'get_case_api_list',views.get_case_api_list),
    re_path(r'add_project_case$',views.add_project_case),
    re_path(r'edit_project_case$',views.edit_project_case),
    re_path(r'get_project_case$',views.get_project_case),
    re_path(r'case_detail/(?P<pid>\d+)/(?P<cid>\d+)$',views.case_detail),
    re_path(r'get_case_apis/',views.get_case_apis),
    re_path(r'del_project_case$',views.del_project_case),
    re_path(r'add_project_case_api$',views.add_project_case_api),
    re_path(r'del_project_case_api$',views.del_project_case_api),
    re_path(r'up_case_api$',views.up_case_api),
    re_path(r'down_case_api$',views.down_case_api),
    re_path(r'get_case_api_detail$',views.get_case_api_detail),
    re_path(r'edit_case_api$',views.edit_case_api),

    urls.url(r'^static/(?P<path>.*)$', static.serve,
        {'document_root': settings.STATIC_ROOT}, name='static')
]

handler403 = views.permission_denied
handler404 = views.page_not_found
handler500 = views.page_error