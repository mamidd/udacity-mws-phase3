/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

// let body = 'restaurant_id=9+name=mario+rating=1+comments=test';
let body = JSON.stringify({
  'restaurant_id': 5,
  'name': 'mario 10',
  'rating': 1,
  'comments': 'my comment test 10'
});
fetch('http://localhost:1337/reviews/', {
  method: 'POST',
  headers: {
    'Content-Length': body.length,
    // 'Content-type': 'application/x-www-form-urlencoded'
    'Content-Type': 'application/json'
  },
  body: body
}).then(function(response){
  return response.text();
}).then(function(data){
  console.log(data);
});

let reviewToDelete = 30;
fetch('http://localhost:1337/reviews/'+reviewToDelete, {
  method: 'DELETE'
}).then(function(response){
  return response.text();
}).then(function(data){
  console.log(data);
});
