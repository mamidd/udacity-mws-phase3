/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

// let body = 'restaurant_id=9+name=mario+rating=1+comments=test';
let body = JSON.stringify({
  'restaurant_id': 5,
  'name': 'mario 10',
  'rating': 1,
  'comments': 'my comment test 10'
});
// let body = JSON.stringify({
//   "restaurant_id":"2",
//   "name":"mario nome inviato",
//   "rating":"3",
//   "comments":"commenti inviati",
//   "createdAt":"1525974392219",
//   "updatedAt":"1525974392219",
// });
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

let reviewToDelete = 56;
fetch('http://localhost:1337/reviews/'+reviewToDelete, {
  method: 'DELETE'
}).then(function(response){
  return response.text();
}).then(function(data){
  console.log(data);
});
