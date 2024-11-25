var directionsService;
var directionsRenderer;
var geocoder;
var midpoint;
var midpointCircle;
let markers = []; // Array to hold all markers

// Initialize the Google Map
function initMap() {
  var mapOptions = {
    center: { lat: 25.7617, lng: -80.1918 },
    zoom: 12,
  };

  var map = new google.maps.Map(document.getElementById("map"), mapOptions);

  directionsService = new google.maps.DirectionsService();

  // Custom route line appearance
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    polylineOptions: {
      strokeColor: "#2c9a84",
      strokeOpacity: 1.8,
      strokeWeight: 6,
    },
  });

  geocoder = new google.maps.Geocoder();
  window.map = map;

  // Google Places autocomplete for input fields
  var location1Input = document.getElementById("location1");
  var location2Input = document.getElementById("location2");

  var autocomplete1 = new google.maps.places.Autocomplete(location1Input);
  var autocomplete2 = new google.maps.places.Autocomplete(location2Input);

  autocomplete1.setFields(["formatted_address", "geometry"]);
  autocomplete2.setFields(["formatted_address", "geometry"]);

  // Add autocomplete for the search bar
  var searchInput = document.getElementById("searchInput");
  var searchAutocomplete = new google.maps.places.Autocomplete(searchInput);

  // Listener: When a place is selected in the search bar, update location1
  searchAutocomplete.addListener("place_changed", function () {
    var place = searchAutocomplete.getPlace();
    if (!place.geometry) {
      alert("No details available for the selected place.");
      return;
    }
    // Update the location1 input field
    location1Input.value = place.formatted_address;

    // Pan the map to the selected place and zoom in
    map.panTo(place.geometry.location);
    map.setZoom(14);
  });
}

// Function to find the user's current location and update the first input field
function findMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        geocoder.geocode({ location: pos }, function (results, status) {
          if (status === "OK" && results[0]) {
            document.getElementById("location1").value = results[0].formatted_address;
          } else {
            alert("Geocoding failed: " + status);
          }
        });
      },
      function () {
        alert("Geolocation failed. Please enter your location manually.");
      }
    );
  } else {
    alert("Your browser does not support geolocation.");
  }
}

function findMidpoint() {
  var location1 = document.getElementById("location1").value;
  var location2 = document.getElementById("location2").value;

  geocoder.geocode({ address: location1 }, function (results1, status1) {
    if (status1 === "OK") {
      var latLng1 = results1[0].geometry.location;

      geocoder.geocode({ address: location2 }, function (results2, status2) {
        if (status2 === "OK") {
          var latLng2 = results2[0].geometry.location;

          // Calculate the route and find the midpoint on the route path
          var request = {
            origin: latLng1,
            destination: latLng2,
            travelMode: google.maps.TravelMode.DRIVING,
          };

          directionsService.route(request, function (result, status) {
            if (status === "OK") {
              directionsRenderer.setDirections(result);

              var route = result.routes[0];
              var path = route.overview_path;

              // Find the midpoint of the overview_path
              var midpointIndex = Math.floor(path.length / 2);
              midpoint = path[midpointIndex];

              // Position the circle on the calculated midpoint
              if (midpoint) {
                if (midpointCircle) {
                  midpointCircle.setCenter(midpoint);
                } else {
                  midpointCircle = new google.maps.Circle({
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map: map,
                    center: midpoint,
                    radius: parseInt(document.getElementById("radiusSlider").value) || 1000,
                  });
                }

                map.setCenter(midpoint);
                updateMarkers();
              } else {
                alert("Could not determine midpoint along the route.");
              }
            } else {
              alert("Could not display directions due to: " + status);
            }
          });
        } else {
          alert("Geocode was not successful for the second location: " + status2);
        }
      });
    } else {
      alert("Geocode was not successful for the first location: " + status1);
    }
  });
}

// Function to update the radius based on slider input
document.getElementById("radiusSlider").addEventListener("input", function () {
  if (midpointCircle) {
    midpointCircle.setRadius(parseInt(this.value));
    updateMarkers();
  }
});

// Function to clear all markers from the map
function clearMarkers() {
  for (let marker of markers) {
    marker.setMap(null);
  }
  markers = [];
}

// Function to add markers for a specific place type around the midpoint
function addMarkersForType(type) {
  if (!midpoint) return;

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    {
      location: midpoint,
      radius: midpointCircle.getRadius(),
      type: type.toLowerCase(),
    },
    function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach((place) => {
          const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name,
            icon: {
              url: getMarkerColor(type), // Get the custom marker image
              scaledSize: new google.maps.Size(40, 40), // Resize the marker
            },
          });
          markers.push(marker);
        });
      } else {
        console.error("PlacesService failed due to: " + status);
      }
    }
  );
}

// Function to determine custom marker image based on type
function getMarkerColor(type) {
  switch (type.toLowerCase()) {
    case "library":
      return "images/library.png"; // Path to library marker
    case "cafe":
      return "images/coffee-cup.png"; // Path to cafe marker
    case "restaurant":
      return "images/restaurant.png"; // Path to restaurant marker
    case "nightlife":
      return "images/night-club.png"; // Path to nightlife marker
    default:
      return "images/default.png"; // Fallback for unknown types
  }
}

// Function to update markers based on selected preferences
function updateMarkers() {
  clearMarkers(); // Clear existing markers

  if (document.getElementById("library").checked) {
    addMarkersForType("library");
  }
  if (document.getElementById("cafe").checked) {
    addMarkersForType("cafe");
  }
  if (document.getElementById("restaurant").checked) {
    addMarkersForType("restaurant");
  }
  if (document.getElementById("nightlife").checked) {
    addMarkersForType("nightlife");
  }
}


// Attach change event listeners to checkboxes
["library", "cafe", "restaurant", "nightlife"].forEach((id) => {
  document.getElementById(id).addEventListener("change", updateMarkers);
});

// Function to open Google Maps for navigation from the user's current location to the midpoint
function startAtMidpoint() {
  if (midpoint) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          var currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          var directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${midpoint.lat},${midpoint.lng}&travelmode=driving`;

          window.open(directionsUrl, "_blank");
        },
        function () {
          alert("Failed to get your current location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  } else {
    alert("Please calculate the midpoint first by clicking 'Find Midpoint'.");
  }
}

// Initial call to display default markers
updateMarkers();

function updateRadiusDisplay() {
  const slider = document.getElementById("radiusSlider");
  const display = document.getElementById("radiusDisplay");

  // Update the display with the slider value
  display.textContent = `${slider.value} meters`;

  if (midpointCircle) {
    midpointCircle.setRadius(parseInt(slider.value));
  }
}

//function to add markers for a specific place type around the midpoint
function addMarkersForType(type) {
  if (!midpoint) return;

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    {
      location: midpoint,
      radius: midpointCircle.getRadius(),
      type: type.toLowerCase(),
    },
    function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach((place) => {
          const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name,
            icon: {
              url: getMarkerColor(type), //get the custom marker image
              scaledSize: new google.maps.Size(40, 40), //resize the marker
            },
          });

          //InfoWindow to display details
          const infoWindowContent = generateInfoWindowContent(place);
          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent,
          });

          //event listener to show InfoWindow when the marker is hovered
          marker.addListener("mouseover", function () {
            infoWindow.open(map, marker);
          });

          //event listener to close InfoWindow when hover ends
          marker.addListener("mouseout", function () {
            infoWindow.close();
          });

          markers.push(marker);
        });
      } else {
        console.error("PlacesService failed due to: " + status);
      }
    }
  );
}

//generate HTML content for InfoWindow
function generateInfoWindowContent(place) {
  let content = `<strong>${place.name}</strong><br>`;

  //add rating if available
  if (place.rating) {
    content += `Rating: ${place.rating} / 5<br>`;
  }

  //add photos if available
  if (place.photos && place.photos.length > 0) {
    content += `<img src="${place.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 })}" alt="Photo of ${place.name}" style="width: 100px; height: 100px;"><br>`;
  }

  //add address (formatted address)
  content += `Address: ${place.vicinity || "No address available"}<br>`;

  return content;
}

