# 接口自动化测试平台
# python3.6 Django 2.0.2框架

## 系统声明：
---
1.本系统采用Django编写接口，前端页面采用比较容易上手的LayUI<br>
2.初步学习web开发，接口统一采用基于方法的方式编写，后续引入权限系统，并修改成基于类的方法<br></br>

## 使用方法：
---
### 1.安装Python3环境（未在Python2上运行后，不知道有没有问题）<br>
### 2.下载代码到本地并解压<br>
### 3.cmd到根目录下安装相关依赖包<br>
```bash
pip install -r requirements.txt
pip install https://github.com/darklow/django-suit/tarball/v2
```
### 4.安装mysql数据库，配置数据库连接，进入IAM/settings.py<br>
```python
DATABASES = {
    'default': {
        'ENGINE':'django.db.backends.mysql',     # 数据库类型，mysql
        'NAME':'iam',            #  database名
        'USER':'root',               # 登录用户
        'PASSWORD':'123456',        #  登录用户名
        'HOST':'127.0.0.1',        # 数据库地址
        'PORT':'3306'              # 数据库端口
    }
}
```
### 5.cmd到根目录下，让 Django 知道我们在我们的模型有一些变更<br>
```bash
python manage.py makemigrations
```
### 6.创造或修改表结构<br>
```bash
python manage.py migrate 
```
### 7.创建超级用户，用于登录后台管理<br>
```bash
python manage.py createsuperuser
```
### 8.运行启动django服务<br>
```bash
python manage.py runserver 0.0.0.0:8000
```
### 9.linux上部署方法<br>
https://www.jianshu.com/p/623a5793eb0a
