# -*- coding: utf-8 -*-
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor
import logging
import datetime
import time

jobstores = {
       'default': SQLAlchemyJobStore(url='mysql+mysqlconnector://root:123456@localhost/iam')
   }
executors = {
       'default': ThreadPoolExecutor(20),
       'processpool': ProcessPoolExecutor(5),
    }
job_defaults = {
       'coalesce': True,
       'max_instances': 10,
   }
scheduler = BackgroundScheduler(jobstores=jobstores, executors=executors, job_defaults=job_defaults)

def job():
    print("11111:%s"%datetime.datetime.now())
    write_error_logs(r'D:\Program Files\Vashpy\logs\logs-111111s.txt',datetime.datetime.now())

def write_error_logs(file,errors):
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s',
                        datefmt='%a, %d %b %Y %H:%M:%S',
                        filename=file,
                        filemode='a')
    logging.info(errors)

scheduler.start()

time.sleep(2)

scheduler.add_job(job,'interval', seconds=3)

while True:
    pass