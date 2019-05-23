from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor
import datetime
import time
import re
import requests

from tools import log,db

class APS():
    executors = {
        'default': ThreadPoolExecutor(10),
        'processpool': ProcessPoolExecutor(1),
    }
    jobstores = {
               'default': SQLAlchemyJobStore(url='mysql+mysqlconnector://root:123456@localhost/iam')
           }
    job_defaults = {
               'coalesce': True,
               'max_instances': 10,
           }
    scheduler = BackgroundScheduler(jobstores=jobstores, executors=executors, job_defaults=job_defaults)

    log.setup_logging()
    logger = log.get_logger()

    # @classmethod
    # def write_error_logs(cls,file,errors):
    #     logger = logging.getLogger(__name__)
    #     logger.setLevel(level=logging.INFO)
    #     file_hanlder = logging.FileHandler(filename=file,mode='a', encoding='utf-8')
    #     file_hanlder.setLevel(logging.INFO)
    #     formatter = logging.Formatter('%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s')
    #     file_hanlder.setFormatter(formatter)
    #     logger.addHandler(file_hanlder)
    #     logger.info(errors)
    #     logger.removeHandler(file_hanlder)

    @classmethod
    def ajob(cls):
        print("11111:%s"%datetime.datetime.now())
        cls.logger.info(datetime.datetime.now())

    @classmethod
    def get_api_case_coverage(cls):
        curl = r'http://192.168.120.173:8000/getcommentdetail'
        connection = db.MysqlTools().connection
        cursor = connection.cursor()
        sql = 'select api_path,project_id from api_api;'
        cursor.execute(sql)
        api_list = cursor.fetchall()
        for api in api_list:
            try:
                comment = re.search(r'^.*?([^/\s]+?)/?$',api['api_path'])
                data = {
                    'changename':r'application/controllers/api',
                    'object_id':api['project_id'],
                    'comment':comment.group(1)
                }
                commentdetail = requests.get(url=curl,params=data).json()
                if 'if_cn' in commentdetail.keys():
                    count = (commentdetail['if_cn'] + commentdetail['for_cn'] + commentdetail['switch_cn'] + commentdetail['while_cn'])*2
                    update_sql = "update api_api set api_case_coverage = %d where api_path = '%s';"%(count,api['api_path'])
                    cursor.execute(update_sql)
                    connection.commit()
                else:
                    update_sql = "update api_api set api_case_coverage = 1 where api_path = '%s' ;"%(api['api_path'])
                    cursor.execute(update_sql)
                    connection.commit()
            except Exception as e:
                print(e)
                cls.logger.error(e)
                continue
        connection.close()

    @classmethod
    def add_acc_tasks(cls,id):
        cls.scheduler.add_job(cls.get_api_case_coverage, 'interval', seconds=3600,id=id)

    @classmethod
    def start_aps(cls):
        cls.scheduler.start()
        cls.logger.info("任务开始！！！")

    @classmethod
    def stop_aps(cls):
        cls.scheduler.shutdown(wait=False)
        cls.logger.info("任务结束！！！")



if __name__=='__main__':
    APS.add_acc_tasks(str(time.time()))
    APS.start_aps()
    while True:
        pass