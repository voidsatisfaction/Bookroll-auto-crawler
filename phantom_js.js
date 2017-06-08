const page = require('webpage').create();

class BookrollHaker {
  constructor({ id, password }){
    this.id = id;
    this.password = password;
    this.csrf = '';
    this.lecturesCode = [];
  }

  getHiddenLoginData() {
    page.open(
      'https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login',
      (status) => {
        const csrf = page.evaluate(function() {
          return document.getElementsByName('_csrf')[1].value;
        });
        this.csrf = csrf;
        this.login();
        phantom.exit();
      }
    );
  }

  login() {
    const postBody = `userid=${this.id}&password=${this.password}&_csrf=${this.csrf}`;
    page.open(
      'https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login',
      'POST',
      postBody,
      (status) => {
        console.log(status);
        console.log(page.content);
        phantom.exit();
      }
    );
  }
}

// Input user id and password
const id = 'br_u03631';
const password = 'MjMxZDVi';
const bookroll = new BookrollHaker({ id, password });

bookroll.getHiddenLoginData();  