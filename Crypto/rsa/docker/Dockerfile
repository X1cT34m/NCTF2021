FROM python:3.7
 
COPY ./files /usr/local/
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pycryptodome
WORKDIR /usr/local/code
EXPOSE 10001

CMD exec /bin/bash -c "python app.py; trap : TERM INT; sleep infinity & wait"