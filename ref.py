import requests
import os
import shutil
from bs4 import BeautifulSoup

your_id = "br_u03631"
your_pass = "MjMxZDVi"

s = requests.session()
login = s.get("https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login")
print login.text
soup = BeautifulSoup(login.text, "html5lib")
csrf = soup.select_one("input[name=_csrf]").get("value")
login = s.post("https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login", data={
    "userid": your_id,
    "password": your_pass,
    "_csrf": csrf
})
# print(login.text)


# def dl_contents(url, dirname, limit):
#     if not os.path.exists(dirname):
#         os.mkdir(dirname)
#     for i in range(1, limit + 1):
#         stream = s.get(url % i, stream=True)
#         with open(dirname + ("/img%s.jpg" % i), "wb") as f:
#             shutil.copyfileobj(stream.raw, f)
# dl_contents("https://bookroll.let.media.kyoto-u.ac.jp/bookroll/contents/unzipped/e89f38039ee41ccb137879a1d1f237f5f3679ab0dea961e78d77d48becfc7766/OPS/images/out_%s.jpg", "t1", 147)
# print("dl")