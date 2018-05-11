/**
 * Common database helper functions.
 */
let dbPromise = idb.open('restaurant-db', 2, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
  case 0:
    var keyValStore = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
  case 1:
    var reviewStore = upgradeDb.createObjectStore('reviews', { keyPath: 'id',  autoIncrement:true });
    reviewStore.createIndex('reviewByRestaurantId', 'restaurant_id');
    reviewStore.createIndex('toPost', 'post');
  }
});

function storeRestaurantValues(data){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantsStore = tx.objectStore('restaurants');

    data.forEach(value => restaurantsStore.put(value));

    return tx.complete;
  }).then(function() {
    // console.log('All data added');
  });
}

function getRestaurantValues(){
  return dbPromise.then(function(db) {
    var tx = db.transaction('restaurants');
    var restaurantsStore = tx.objectStore('restaurants');

    return restaurantsStore.getAll();
  });
}

function storeReviewValues(data){
  return dbPromise.then(function(db) {
    var tx = db.transaction('reviews', 'readwrite');
    var reviewsStore = tx.objectStore('reviews');

    data.forEach(value => reviewsStore.put(value));

    return tx.complete;
  }).then(function() {
    // console.log('All data added');
  });
}

function getReviewValues(){
  return dbPromise.then(function(db) {
    var tx = db.transaction('reviews');
    var reviewsStore = tx.objectStore('reviews');

    return reviewsStore.getAll();
  });
}

function getReviewByIdValues(id){
  return dbPromise.then(function(db) {
    var tx = db.transaction('reviews');
    var reviewsStore = tx.objectStore('reviews');
    var reviewsIndex = reviewsStore.index('reviewByRestaurantId');

    // console.log('getReviewByIdValues: id - '+id);
    return reviewsIndex.getAll(parseInt(id));
  });
}

function storeReviewDefer(review){
  return dbPromise.then(function(db) {
    var tx = db.transaction('reviews', 'readwrite');
    var reviewsStore = tx.objectStore('reviews');

    review.post = 'yes';
    reviewsStore.put(review);

    return tx.complete;
  }).then(function() {
    // console.log('Review defer data added');
  });
}

function POSTReviewDefer(){
  return getReviewsDefer().then(function(values){
    // console.log('Review Defer:');
    // console.log(values);
    if (values.length > 0){
      values.forEach(function(value){
        postReview(value);
      })
    }
  });
}

function postReview(review){
  review.post = null;
  let body = JSON.stringify(review);
  // console.log('review to post:');
  // console.log(body);
  fetch(DBHelper.SERVER_API_REVIEWS_URL, {
    method: 'POST',
    headers: {
      'Content-Length': body.length,
      'Content-Type': 'application/json'
    },
    body: body
  }).then(function(response){
    // console.log(response);
    return response.text();
  }).then(function(data){
    // console.log(data);
    // console.log('post review done');
    let reviewDatas = [];
    reviewDatas.push(review);
    storeReviewValues(reviewDatas);
  }).catch(function(errorResponse){
    // console.log('post review failed');
  });
}

function getReviewsDefer(){
  return dbPromise.then(function(db) {
    var tx = db.transaction('reviews');
    var reviewsStore = tx.objectStore('reviews');
    var reviewToPost = reviewsStore.index('toPost');

    return reviewToPost.getAll('yes');
  });
}

(function(){
  //POST reviewsDefer and store in cache
  POSTReviewDefer();
})();

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000; // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  static get SERVER_API_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
    // return `/restaurants`;
  }

  static get SERVER_API_REVIEWS_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews/`;
  }

  static get SERVER_API_REVIEWS_BY_RESTAURANT_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews/?restaurant_id=`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    getRestaurantValues().then(function(values){
      if (values.length > 0) {
        // console.log('values found');
        // console.log(values);
        const restaurants = values;
        callback(null, restaurants);
      }
      fetch(DBHelper.SERVER_API_URL)
        .then(function(response){
          // console.log('fetch OK');
          return response.json();
        }).then(function(data){
          storeRestaurantValues(data);
          if (values.length <= 0){
            // console.log('callback inside fetch OK')
            const restaurants = data;
            callback(null, restaurants);
          }
        }).catch(function(responseError){
          if(values.length <= 0){
            const error = (`Request failed with error: ${responseError}`);
            callback(error, null);
          }
        });
    });
  }

  /**
   * Fetch Review By id
   */
  static fetchReviewById(id, callback) {
    getReviewByIdValues(id).then(function(values){
      // if (values.length > 0) {
      //   // console.log('reviews found');
      //   // console.log(values);
      //   const reviews = values.reverse();
      //   callback(null, reviews);
      // }
      fetch(DBHelper.SERVER_API_REVIEWS_BY_RESTAURANT_URL+id)
        .then(function(response){
          // console.log('review fetch OK');
          return response.json();
        }).then(function(data){
          storeReviewValues(data);
          if (data.length <= 0) {
            // console.log('reviews found');
            // console.log(values);
            const reviews = values.reverse();
            callback(null, reviews);
          }else{
            // console.log('review callback inside fetch OK');
            // console.log(data);
            const reviews = data.reverse();
            callback(null, reviews);
          }
          // if (values.length <= 0) {
          //   // console.log('reviews found');
          //   // console.log(values);
          //   const reviews = data.reverse();
          //   callback(null, reviews);
          // }
        }).catch(function(responseError){
          if(values.length <= 0){
            const error = (`Request failed with error: ${responseError}`);
            callback(error, null);
          }
          else{
            // console.log('reviews found');
            // console.log(values);
            const reviews = values.reverse();
            callback(null, reviews);
          }
        });
    });

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
    //TODO Attenzione bisogna passare una callback valida
    DBHelper.fetchReviewById(id, function(){});
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
