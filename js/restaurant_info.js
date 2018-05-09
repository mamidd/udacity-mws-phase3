let restaurant, reviews;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    // DBHelper.fetchRestaurantById(id, (error, restaurant) => {
    //   self.restaurant = restaurant;
    //   if (!restaurant) {
    //     console.error(error);
    //     return;
    //   }
    //   fillRestaurantHTML();
    //   callback(null, restaurant)
    // });
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchReviewById(id, (error, reviews) => {
        self.restaurant.reviews = reviews;
        // console.log('reviews found per id - '+id);
        // console.log(reviews);

        fillRestaurantHTML();
        callback(null, restaurant)
      });
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.getElementById('restaurant-img');
  picture.className = 'restaurant-img'
  picture.src = DBHelper.imageUrlForRestaurant(restaurant);
  setPicture(picture, restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

setPicture = (picture, restaurant) => {
  let fileParts = picture.src.split(".");

  let image = document.createElement("img");
  image.src = fileParts[0] + "-small_1x.jpg";
  image.alt = restaurant.name;

  let sources = [
    document.createElement("source"),
    document.createElement("source"),
    document.createElement("source")
  ]
  sources[0].media = "(min-width: 375px)";
  sources[0].srcset = fileParts[0] + "-small_2x.jpg";
  sources[1].media = "(min-width: 675px) and (max-width: 750px)";
  sources[1].srcset = fileParts[0] + ".jpg";
  sources[2].media = "(min-width: 750px)";
  sources[2].srcset = fileParts[0] + "-small_2x.jpg";

  picture.appendChild(sources[2]);
  picture.appendChild(sources[1]);
  picture.appendChild(sources[0]);
  picture.appendChild(image);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  container.appendChild(createReviewsFormHTML(self.restaurant.id));

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('tabindex', '0');
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt*1000);
  date.setAttribute('tabindex', '0');
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('tabindex', '0');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('tabindex', '0');
  li.appendChild(comments);

  return li;
}

createReviewsFormHTML = (idRestaurant) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'reviews-form');

  const form = document.createElement('form');
  form.setAttribute('id', 'restaurand_id-'+idRestaurant);

  const nameL = document.createElement('label');
  nameL.setAttribute('for', 'name');
  nameL.innerHTML = 'Your Name';
  form.appendChild(nameL);

  const nameI = document.createElement('input');
  nameI.setAttribute('type', 'text');
  nameI.setAttribute('name', 'name');
  form.appendChild(nameI);

  const ratingL = document.createElement('label');
  ratingL.setAttribute('for', 'rating');
  ratingL.innerHTML = 'Your Rating';
  form.appendChild(ratingL);

  for (let i=1; i<6; i++){
    let ratingI = document.createElement('input');
    ratingI.setAttribute('type', 'radio');
    ratingI.setAttribute('name', 'rating');
    ratingI.setAttribute('value', i);    
    form.appendChild(ratingI);
    let spanRating = document.createElement('span');
    spanRating.innerHTML = i;
    form.appendChild(spanRating);
  }

  const commentsL = document.createElement('label');
  commentsL.setAttribute('for', 'comments');
  commentsL.innerHTML = 'Your Comments';
  form.appendChild(commentsL);

  const commentsI = document.createElement('input');
  commentsI.setAttribute('type', 'text');
  commentsI.setAttribute('name', 'comments');
  form.appendChild(commentsI);

  const button = document.createElement('button');
  button.innerHTML = 'Submit';
  //TODO add eventHandler on click
  form.appendChild(button);

  div.appendChild(form);
  return div;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
