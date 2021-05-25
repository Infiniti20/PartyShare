const crypto = require('crypto');

module.exports={
 computeHash:function (text){
  const hash = crypto.createHash('sha256').update(text).digest('base64');
  return hash
 },
 generateUUID:function() {
  return 'xxxxxxxx-xxxx-4xxxx-xxx-x'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
 }
}