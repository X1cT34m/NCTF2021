import socketserver
from Crypto.Util.number import *
import os
import signal
import string
import random
from hashlib import sha256
from secret import flag

class Task(socketserver.BaseRequestHandler):
    def _recvall(self):
        BUFF_SIZE = 2048
        data = b''
        while True:
            part = self.request.recv(BUFF_SIZE)
            data += part
            if len(part) < BUFF_SIZE:
                break
        return data.strip()

    def send(self, msg, newline=True):
        try:
            if newline:
                msg += b'\n'
            self.request.sendall(msg)
        except:
            pass

    def recv(self, prompt=b'> '):
        self.send(prompt, newline=False)
        return self._recvall()

    def proof_of_work(self):
        random.seed(os.urandom(8))
        proof = ''.join([random.choice(string.ascii_letters+string.digits) for _ in range(20)])
        _hexdigest = sha256(proof.encode()).hexdigest()
        self.send(f"sha256(XXXX+{proof[4:]}) == {_hexdigest}".encode())
        x = self.recv(prompt=b'Give me XXXX: ')
        if len(x) != 4 or sha256(x+proof[4:].encode()).hexdigest() != _hexdigest:
            return False
        return True

    def handle(self):
        p = getPrime(512)
        q = getPrime(512)
        n = p*q
        e = 65537

        signal.alarm(120)
        self.send(b'Try to factor n within 120 seconds')
        self.send("n = {}\ne = {}".format(n, e).encode())
        self.send(b'And solve the proof-of-work below to begin the challenge.')

        if not self.proof_of_work():
            return

        signal.alarm(12)
        secret = os.urandom(16)
        for i in range(4):
            self.send("c{} = {}".format(i, pow(bytes_to_long(secret[4*i:4*i+4]), e, n)).encode())

        self.send(b"Give me the secret:")
        s = self.recv()
        if secret.hex().encode() == s:
            self.send(b"Congratulations! Your flag is: "+flag.encode())
        else:
            self.send(b"Wrong secret")
        self.request.close()


class ThreadedServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass


class ForkedServer(socketserver.ForkingMixIn, socketserver.TCPServer):
    pass


if __name__ == "__main__":
    HOST, PORT = '0.0.0.0', 10002
    server = ForkedServer((HOST, PORT), Task)
    server.allow_reuse_address = True
    server.serve_forever()


