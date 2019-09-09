# -*- coding: utf-8 -*-
import requests
import json,csv
import re
import time
import codecs
import pymysql
import sys
import threading

from django.forms import model_to_dict

from api.models import *
from tools.aps import APS
from tools import log

class RunTaskThread(threading.Thread):
    def __init__(self,task_id):
        threading.Thread.__init__(self)
        self.task_id = task_id
        log.setup_logging()
        self.logger = log.get_logger()

    def run(self):
        try:
            self.logger.info("start_test:thread=%s,task=%s"%(self.getName(),self.task_id))
            tstart_time = int(time.time())
            last_tlindex = TaskLog.objects.filter(task_id=self.task_id).values_list('task_no',flat=True)\
                .order_by('-task_no').first()
            if last_tlindex:
                task_log = TaskLog.objects.create(task_id=self.task_id,task_no=int(last_tlindex)+1,
                                                  create_time=time.strftime('%Y-%m-%d %H:%M:%S'))
            else:
                task_log = TaskLog.objects.create(task_id=self.task_id,task_no=1,
                                                  create_time=time.strftime('%Y-%m-%d %H:%M:%S'))
            task_log.save()
            tclist = self.task_case_list()
            # print(tclist)
            for tc in tclist:
                try:
                    log_info = "="*20+" thread=%s,task=%s,case=%s "%(self.getName(),self.task_id,tc['case_name'])+"="*20
                    self.logger.info(log_info)
                    cstart_time = int(time.time())
                    al = tc.get('case_apis_list')
                    for a in al:
                        time.sleep(1)
                        if len(a.get('pre_steps'))>0:
                            for prs in a.get('pre_steps'):
                                print(prs)
                        url = a['case_api_info']['api_protocol'].lower() +'://'+a['case_api_info']['host']+'/'+\
                              re.sub('^/+','',a['case_api_info']['api_path'])
                        headers = a['case_api_info']['api_headers']
                        params = a['case_api_info']['api_params']
                        method = a['case_api_info']['api_method']
                        # print(params)
                        result = self.execute_api(url=url,heads=headers,params=params,method=method)
                        response_data = result.text
                        # print(response_data)
                        if len(a.get('post_steps'))>0:
                            for pos in a.get('post_steps'):
                                print(pos)
                        if a.get('assertion'):
                            d = {
                                'response_data':response_data,
                                'assertion':a.get('assertion')
                            }
                            acresult = self.assert_case(type=1,ao=1,**d)
                            # print(acresult)
                            if acresult['code'] == 0:
                                acstatus = 1
                            else:
                                acstatus = 2
                            cend_time = int(time.time())
                            duration = cend_time-cstart_time
                            request_dict = {
                                'request_url' : result.url,
                                'request_body' : result.request.body,
                                'request_headers' : result.request.headers,
                                'request_method' : result.request.method
                            }
                            response_dict = {
                                'response_data' : response_data,
                                'response_headers' : result.headers
                            }
                            TaskReportLog.objects.create(case=tc.get('id'),request=str(request_dict),
                                                         assertion=a.get('assertion'),response=str(response_dict),
                                                         status=acstatus,duration=duration,
                                                         create_time=time.strftime('%Y-%m-%d %H:%M:%S'),
                                                         task_log_id=task_log.id)
                    self.logger.info("case_status:%s"%acstatus)
                except Exception as e:
                    # print(e)
                    TaskReportLog.objects.create(case=tc.get('id'),
                                                 response=str(e),
                                                 status=3,
                                                 create_time=time.strftime('%Y-%m-%d %H:%M:%S'),
                                                 task_log_id=task_log.id)
                    self.logger.error(e)
                    continue
            task_log_status = 1
        except Exception as e:
            self.logger.error(e)
            task_log_status =2
        finally:
            self.logger.info("end_test:thread=%s,task=%s" % (self.getName(), self.task_id))
            tend_time = int(time.time())
            tduration = tend_time-tstart_time
            TaskLog.objects.filter(id=task_log.id).update(duration=tduration,task_result= task_log_status)


    def execute_api(self,url, heads, params, method='POST', cookies=None, files=None):
        r = ''
        if method.upper() == 'POST':
            r = requests.request('post', url=url, headers=heads, data=params, cookies=cookies, files=files,timeout=30,verify=False)
        elif method.upper() == 'GET':
            r = requests.request('get', url=url, headers=heads, data=params,timeout=30,verify=False)
        return r

    def task_case_list(self):
        task_cases = TaskCase.objects.filter(task_id=self.task_id).values_list('case_id',flat=True)
        task_case_list = []
        for case_id in task_cases:
            case_info = Case.objects.get(id=case_id)
            case_apis = CaseApi.objects.filter(case_id=case_id).values()
            case_apis_list = []
            for case_api in case_apis:
                api_info = Api.objects.filter(id=case_api['api_id']).values('api_name', 'api_path', 'api_protocol',
                                                                            'api_method').first()
                pre_steps = Step.objects.filter(CaseApi_id=case_api['api_id'], step_type='SQL').order_by('step_sort').values()
                post_steps = Step.objects.filter(CaseApi_id=case_api['api_id'], step_type='REGEXP').order_by('step_sort').values()
                assertion = Step.objects.filter(CaseApi_id=case_api['api_id'], step_type='Assertion').values().first()
                data = {}
                case_api_info = api_info
                case_api_info['api_headers'] = eval(case_api['api_headers'])
                api_params = eval(case_api['api_params'])
                api_params_data = {}
                for param in api_params:
                    api_params_data[param['param_name']] = param['param_default']
                case_api_info['api_params'] = api_params_data
                case_api_info['host'] = case_api['host']
                case_api_info['id'] = case_api['api_id']
                data['case_api_info'] = case_api_info
                data['pre_steps'] = list(pre_steps)
                data['post_steps'] = list(post_steps)
                if assertion:
                    data['assertion'] = assertion['step_content']
                case_apis_list.append(data)
            case_info = model_to_dict(case_info)
            case_info['case_apis_list'] = case_apis_list
            task_case_list.append(case_info)
        return task_case_list

    def eval_variable(self,key):
        pass

    def assert_case(self,type=1,ao=1,**kwargs):
        '''
        断言用例
        :rtype: object
        :param type: 1=包含,2=相等,3=不包含,4=不相等
        :param ao: 1=响应数据,2=响应头,3=变量
        :param kwargs: 
        :return: 
        '''
        ao = int(ao)
        type = int(type)
        if ao == 1:
            ac = kwargs['response_data']
            ap = kwargs['assertion']
        elif ao == 2:
            ac = kwargs['response_headers']
            ap = kwargs['assertion']
        elif ao == 3:
            ac = kwargs['variable']
            ap = kwargs['assertion']
        else:
            aresult = {
                'code':2,
                'msg':'断言失败，对象不存在！'
            }
            return aresult
        if type == 1:
            result = re.search(ap,ac)
            if result:
                aresult = {
                    'code':0,
                    'msg':'success!'
                }
            else:
                aresult = {
                    'code':201,
                    'msg':'断言失败，"%s"不包含"%s"！'%(ac,ap)
                }
        elif type == 2:
            if ap == ac:
                aresult = {
                    'code':0,
                    'msg':'success!'
                }
            else:
                aresult = {
                    'code':202,
                    'msg':'断言失败，"%s"不等于"%s"！'%(ac,ap)
                }
        elif type == 3:
            result = re.search(ap,ac)
            if result is None:
                aresult = {
                    'code':0,
                    'msg':'success!'
                }
            else:
                aresult = {
                    'code':203,
                    'msg':'断言失败，"%s"包含"%s"！'%(ac,ap)
                }
        elif type == 4:
            if ap != ac:
                aresult = {
                    'code': 0,
                    'msg': 'success!'
                }
            else:
                aresult = {
                    'code': 204,
                    'msg': '断言失败，"%s"等于"%s"！' % (ac, ap)
                }
        else:
            aresult = {
                'code': 1,
                'msg': '断言失败，类型不正确！'
            }
            return aresult
        return aresult