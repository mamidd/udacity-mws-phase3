let restaurants,neighborhoods,cuisines,dbPromise=idb.open("restaurant-db",2,function(e){switch(e.oldVersion){case 0:e.createObjectStore("restaurants",{keyPath:"id"});case 1:var t=e.createObjectStore("reviews",{keyPath:"id",autoIncrement:!0});t.createIndex("reviewByRestaurantId","restaurant_id"),t.createIndex("toPost","post")}});function storeRestaurantValues(e){return dbPromise.then(function(t){var n=t.transaction("restaurants","readwrite"),r=n.objectStore("restaurants");return e.forEach(e=>r.put(e)),n.complete}).then(function(){})}function getRestaurantValues(){return dbPromise.then(function(e){return e.transaction("restaurants").objectStore("restaurants").getAll()})}function storeReviewValues(e){return dbPromise.then(function(t){var n=t.transaction("reviews","readwrite"),r=n.objectStore("reviews");return e.forEach(e=>r.put(e)),n.complete}).then(function(){})}function getReviewValues(){return dbPromise.then(function(e){return e.transaction("reviews").objectStore("reviews").getAll()})}function getReviewByIdValues(e){return dbPromise.then(function(t){return t.transaction("reviews").objectStore("reviews").index("reviewByRestaurantId").getAll(parseInt(e))})}function storeReviewDefer(e){return dbPromise.then(function(t){var n=t.transaction("reviews","readwrite"),r=n.objectStore("reviews");return e.post="yes",r.put(e),n.complete}).then(function(){})}function POSTReviewDefer(){return getReviewsDefer().then(function(e){e.length>0&&e.forEach(function(e){postReview(e)})})}function postReview(e){e.post=null;let t=JSON.stringify(e);fetch(DBHelper.SERVER_API_REVIEWS_URL,{method:"POST",headers:{"Content-Length":t.length,"Content-Type":"application/json"},body:t}).then(function(e){return console.log(e),e.text()}).then(function(t){console.log(t),console.log("post review done");let n=[];n.push(e),storeReviewValues(n)}).catch(function(e){console.log("post review failed")})}function getReviewsDefer(){return dbPromise.then(function(e){return e.transaction("reviews").objectStore("reviews").index("toPost").getAll("yes")})}POSTReviewDefer();class DBHelper{static get DATABASE_URL(){return"http://localhost:8000/data/restaurants.json"}static get SERVER_API_URL(){return"http://localhost:1337/restaurants"}static get SERVER_API_REVIEWS_URL(){return"http://localhost:1337/reviews/"}static get SERVER_API_REVIEWS_BY_RESTAURANT_URL(){return"http://localhost:1337/reviews/?restaurant_id="}static fetchRestaurants(e){getRestaurantValues().then(function(t){if(t.length>0){e(null,t)}fetch(DBHelper.SERVER_API_URL).then(function(e){return e.json()}).then(function(n){if(storeRestaurantValues(n),t.length<=0){e(null,n)}}).catch(function(n){if(t.length<=0){e(`Request failed with error: ${n}`,null)}})})}static fetchReviewById(e,t){getReviewByIdValues(e).then(function(n){fetch(DBHelper.SERVER_API_REVIEWS_BY_RESTAURANT_URL+e).then(function(e){return e.json()}).then(function(e){if(storeReviewValues(e),e.length<=0){const e=n.reverse();t(null,e)}else{const n=e.reverse();t(null,n)}}).catch(function(e){if(n.length<=0){t(`Request failed with error: ${e}`,null)}else{const e=n.reverse();t(null,e)}})})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}}),DBHelper.fetchReviewById(e,function(){})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,s)=>{if(r)n(r,null);else{let r=s;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/images/${e.id}.jpg`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}var map,markers=[];document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,r=t.selectedIndex,s=e[n].value,a=t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(s,a,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li"),n=document.createElement("img");n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e),n.alt=e.name,addSrcSet(n),t.append(n);const r=document.createElement("h2");let s=document.createElement("a");s.innerHTML=e.name,s.href=DBHelper.urlForRestaurant(e),r.appendChild(s),t.append(r);const a=document.createElement("p");a.innerHTML=e.neighborhood,t.append(a);const o=document.createElement("p");o.innerHTML=e.address,t.append(o);const i=document.createElement("a");return i.innerHTML="View Details",i.href=DBHelper.urlForRestaurant(e),i.setAttribute("aria-hidden","true"),t.append(i),t}),addSrcSet=(e=>{let t=e.src.split(".");e.src=t[0]+"-small_1x.jpg",e.srcset=t[0]+"-small_1x.jpg 1x,",e.srcset=e.srcset+t[0]+"-small_2x.jpg 2x"}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),navigator.serviceWorker&&navigator.serviceWorker.register("/sw.js");