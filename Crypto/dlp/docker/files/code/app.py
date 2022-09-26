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
        if not self.proof_of_work():
            return

        p = 144622268328968993341365710278894755118767129325286994164661347213200068288320713151689155598130690763440455157929587751885813242814750422828312072382119518429040602281694119210475772654999865828418886175678335978908269120940864300610431302161143383386149363868608635140950451657400233892787130315426229955639
        s = [getPrime(100)]
        for i in range(1023):
            s.append(s[i]*s[i]%(p-1))
        while True:
            self.send(b'>', newline=False)
            choice = self.recv()
            if choice == b"1":
                try:
                    self.send(b"Give me m:")
                    m = int(self.recv()) % p
                    self.send(b"Give me k:")
                    k = int(self.recv())
                    if k not in range(1024):
                        break
                    c = pow(m, s[k], p)
                    self.send("c = {}".format(c).encode())
                except:
                    break
            elif choice == b"2":
                self.send(b"Give me the secret:")
                secret = int(self.recv()) % p
                if pow(secret, s[0], p) == 0xdeadbeef:
                    self.send(flag)
                else:
                    self.send(b'flag')
                break
        self.request.close()


class ThreadedServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass


class ForkedServer(socketserver.ForkingMixIn, socketserver.TCPServer):
    pass


if __name__ == "__main__":
    HOST, PORT = '0.0.0.0', 10001
    server = ForkedServer((HOST, PORT), Task)
    server.allow_reuse_address = True
    server.serve_forever()


