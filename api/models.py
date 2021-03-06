from django.db import models

# Create your models here.
from django.utils import timezone


class Project(models.Model):
    name = models.CharField(max_length=32)
    desc = models.CharField(max_length=1000,default='')
    version = models.CharField(max_length=10,default='')
    type = models.IntegerField(default=1)

class Env(models.Model):
    project = models.ForeignKey('Project',on_delete=models.CASCADE)
    env_name = models.CharField(max_length=32)
    env_value = models.CharField(max_length=1000)
    env_desc = models.CharField(max_length=1000,default='')

class Api(models.Model):
    project = models.ForeignKey('Project',on_delete=models.CASCADE)
    api_name = models.CharField(max_length=32)
    api_path = models.CharField(max_length=1000)
    api_status = models.IntegerField(default=1)
    api_case_coverage = models.IntegerField(default=0)
    api_method = models.CharField(max_length=10)
    api_protocol = models.CharField(max_length=10)
    api_response = models.CharField(max_length=1000,default='')
    api_create_time = models.DateTimeField(null=True, blank=True,default=timezone.now)
    api_update_time = models.DateTimeField(null=True, blank=True)

class ApiParameters(models.Model):
    api = models.ForeignKey('Api',on_delete=models.CASCADE)
    param_name = models.CharField(max_length=32,null=False)
    param_desc = models.CharField(max_length=1000,default='')
    param_default = models.CharField(max_length=100,default='')
    param_type = models.CharField(max_length=32)
    param_must = models.IntegerField(default=0)

class ApiHeaders(models.Model):
    api = models.ForeignKey('Api',on_delete=models.CASCADE)
    head_name = models.CharField(max_length=32)
    head_value = models.CharField(max_length=1000)

class Case(models.Model):
    project = models.ForeignKey('Project', on_delete=models.CASCADE)
    api = models.ForeignKey('Api', on_delete=models.CASCADE, default='')
    case_name = models.CharField(max_length=32,null=False)
    case_desc = models.CharField(max_length=1000,default='')
    case_status = models.IntegerField(default=1)
    case_create_time = models.DateTimeField(null=True, blank=True, default=timezone.now)
    case_update_time = models.DateTimeField(null=True, blank=True)

class Step(models.Model):
    CaseApi = models.ForeignKey('CaseApi',on_delete=models.CASCADE)
    step_type = models.CharField('类型',null=False,blank=False,max_length=100)
    step_sort = models.IntegerField('1=pre_sqlenv,100=post_reg,101=assertion',null=False,blank=False,default=100)
    step_content = models.CharField(null=False,blank=False,max_length=1000)
    step_create_time = models.DateTimeField(null=True, blank=True, default=timezone.now)
    step_update_time = models.DateTimeField(null=True, blank=True)

class Task(models.Model):
    project = models.ForeignKey('Project', on_delete=models.CASCADE)
    task_name = models.CharField(max_length=32,null=False,blank=False)
    task_desc = models.CharField(max_length=1000,default='')
    task_status = models.IntegerField(default=1)
    task_timer = models.CharField(max_length=1000,default='')
    task_create_time = models.DateTimeField(null=True, blank=True, default=timezone.now)
    task_update_time = models.DateTimeField(null=True, blank=True)

class TaskLog(models.Model):
    task_id = models.IntegerField(default=0)
    task_no = models.IntegerField(default=0)
    task_result = models.IntegerField(default=1)
    duration = models.IntegerField(default=0)
    create_time = models.DateTimeField(null=True, blank=True, default=timezone.now)

class TaskReportLog(models.Model):
    task_log = models.ForeignKey('TaskLog', on_delete=models.CASCADE)
    case = models.IntegerField(default=0)
    request = models.TextField()
    assertion = models.CharField(max_length=1000,default='')
    response = models.TextField()
    status = models.IntegerField(default=1)
    duration = models.IntegerField(default=0)
    create_time = models.DateTimeField(null=True, blank=True, default=timezone.now)

class TaskCase(models.Model):
    task = models.ForeignKey('Task',on_delete=models.CASCADE)
    case = models.ForeignKey('Case',on_delete=models.CASCADE)

class CaseApi(models.Model):
    case = models.ForeignKey('Case',on_delete=models.CASCADE)
    api = models.ForeignKey('Api',on_delete=models.CASCADE)
    host = models.CharField(max_length=255,default='')
    api_params = models.CharField(max_length=1000,default='')
    api_headers = models.CharField(max_length=1000,default='')
    sort = models.IntegerField(null=False,blank=False,default=1)
    ca_create_time = models.DateTimeField(null=True, blank=True, default=timezone.now)
    ca_update_time = models.DateTimeField(null=True, blank=True)

