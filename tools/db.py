import pymysql
# import configparser
import os
import redis
import time

class MysqlTools():
    def __init__(self):
        try:
            #链接数据库
            # cur_path = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
            # config_path = cur_path+r"\config\db_config.ini"
            # config = configparser.ConfigParser()
            # config.read(config_path)
            host = '127.0.0.1'
            port = 3306
            user = 'root'
            password = '123456'
            db = 'iam'
            # 连接MySQL数据库
            self.connection = pymysql.connect(host=host, port=int(port), user=user, password=password,
                                         db=db,
                                         charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
            self.cursor = self.connection.cursor()
        except pymysql.err.OperationalError as e:
            print('Mysql error %d:%s'%(e.args[0],e.args[1]))

    # def connect_db(self):
    #     config = configparser.ConfigParser()
    #     config.read("db_config.ini")
    #     host = config.get('apiDB','host')
    #     port = config.get('apiDB','port')
    #     user = config.get('apiDB','user')
    #     password = config.get('apiDB','password')
    #     db = config.get('apiDB','db')
    #     # 连接MySQL数据库
    #     connection = pymysql.connect(host=host, port=int(port), user=user, password=password,
    #                                  db=db,
    #                                  charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
    #
    #     return connection

    def get_tags(self):
        connection = self.connection
        cursor = connection.cursor()
        sql = 'select * from api_tags_info;'
        cursor.execute(sql)
        result = cursor.fetchall()
        connection.close()
        return result

    def get_api(self):
        connection = self.connection
        cursor = connection.cursor()
        sql = 'select api_path,project_id from api_api;'
        cursor.execute(sql)
        result = cursor.fetchall()
        connection.close()
        return result

    def get_case(self,url):
        connection = self.connection
        # 通过cursor创建游标
        cursor = connection.cursor()
        # 创建sql 语句，并执行
        sql = "select case_name,case_url,case_data,case_checkpoint from `case_info` WHERE run_status =1 and case_url = '%s';"%url
        cursor.execute(sql)
        # 查询数据库多条数据
        result = cursor.fetchall()
        connection.close()
        # print(result)
        return result

    def add_case(self,case_name='',case_url='',case_checkpoint='',**case_data):
        connection = self.connection
        cursor = connection.cursor()
        cdata = str(case_data)
        sql = "INSERT INTO case_info ( case_name,case_url,case_checkpoint,case_data) VALUES " \
              "(\"%s\",\"%s\",\"%s\",\"%s\");"%(case_name,case_url,case_checkpoint,cdata)
        print(sql)
        cursor.execute(sql)
        # 提交SQL
        connection.commit()
        connection.close()

    def create_table(self):
        connection = self.connection
        cursor = connection.cursor()
        sql = '''create table new_table(id BIGINT,name VARCHAR(20),age INT DEFAULT 1'''
        cursor.execute(sql)
        connection.commit()
        connection.close()

    def add_api_update_log(self,content):
        sql = '''INSERT INTO `api_update_log` (`content`) VALUES ("%s");'''%str(content)
        print(sql)
        self.cursor.execute(sql)
        self.connection.commit()


class RedisTools():
    def __init__(self):
        self.rpool = redis.ConnectionPool(host='113.107.166.5', port=16379, db=0)
        self.rconn = redis.Redis(connection_pool=self.rpool)

    def get_api_update(self):
        api_list = self.rconn.lrange('test_api',0,-1)
        return api_list

    def lpop_api_update(self):
        try:
            api_list = self.rconn.lpop('testl1')
            print(api_list)
            return eval(api_list)
        except Exception as e:
            print(e)
            return None

if __name__=='__main__':
    # st = MysqlTools()
    # st.create_table()
    RT = RedisTools()
    al = RT.lpop_api_update()
    # while True:
    #     al = RT.lpop_api_update()
    #     print(al)
    #     if al is not None:
    #         st.add_api_update_log(al)
    #     time.sleep(2)
    # data = st.get_case()
    # print(type(eval(data[0]['case_data'])))
    # st.add_case(case_name='test1',username='15921720001',password='123456')
