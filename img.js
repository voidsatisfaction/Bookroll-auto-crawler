var fs = require('fs'),
    request = require('request');

var request = request.defaults({ jar: true });

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

download('https://bookroll.let.media.kyoto-u.ac.jp/bookroll/contents/unzipped/a200779402d76af34f32c421c11eca575d769559db4589868b19cf2e7d37d936_1/OPS/images/out_1.jpg', 'google.png', function(){
  console.log('done');
});
