var directionsService;
var directionsRenderer;
var geocoder;
var midpoint;
var midpointCircle;

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
      strokeColor: "#2c9a84",  // Custom color for the route
      strokeOpacity: 1.8,       // Line opacity
      strokeWeight: 6           // Line thickness
    }
  });

  geocoder = new google.maps.Geocoder();
  window.map = map;

  //google places autocomplete on input fields
  var location1Input = document.getElementById("location1");
  var location2Input = document.getElementById("location2");
  
  var autocomplete1 = new google.maps.places.Autocomplete(location1Input);
  var autocomplete2 = new google.maps.places.Autocomplete(location2Input);

  //optional set fields to avoid unnecessary data
  autocomplete1.setFields(["formatted_address", "geometry"]);
  autocomplete2.setFields(["formatted_address", "geometry"]);
}

// Function to find the user's current location and update the first input field
function findMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = { lat: position.coords.latitude, lng: position.coords.longitude };
      geocoder.geocode({ location: pos }, function (results, status) {
        if (status === "OK" && results[0]) {
          document.getElementById("location1").value = results[0].formatted_address;
        } else {
          alert("Geocoding failed: " + status);
        }
      });
    }, function () {
      alert("Geolocation failed. Please enter your location manually.");
    });
  } else {
    alert("Your browser does not support geolocation.");
  }
}

/*
// Function to calculate and display the midpoint, markers, and route
function findMidpoint() {
  var location1 = document.getElementById("location1").value;
  var location2 = document.getElementById("location2").value;

  geocoder.geocode({ address: location1 }, function(results1, status1) {
    if (status1 === "OK") {
      var latLng1 = results1[0].geometry.location;
      
      // Custom icon for the starting point (A)
      var marker1 = new google.maps.Marker({
        position: latLng1,
        map: map,
        title: "Location 1",
        icon: {
           // Blue marker
          scaledSize: new google.maps.Size(40, 40)                        // Custom size
        }
      });

      geocoder.geocode({ address: location2 }, function(results2, status2) {
        if (status2 === "OK") {
          var latLng2 = results2[0].geometry.location;
          
          // Custom icon for the ending point (B)
          var marker2 = new google.maps.Marker({
            position: latLng2,
            map: map,
            title: "Location 2",
            icon: {
               // Red marker
              scaledSize: new google.maps.Size(40, 40)                       // Custom size
            }
          });

          calculateAndDisplayRoute(latLng1, latLng2);

          var midpointLat = (latLng1.lat() + latLng2.lat()) / 2;
          var midpointLng = (latLng1.lng() + latLng2.lng()) / 2;
          midpoint = { lat: midpointLat, lng: midpointLng };

          var midpointMarker = new google.maps.Marker({
            position: midpoint,
            map: map,
            title: "Midpoint",
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(40, 40)
            }
          });

          map.setCenter(midpoint);
        } else {
          alert("Geocode was not successful for the second location: " + status2);
        }
      });
    } else {
      alert("Geocode was not successful for the first location: " + status1);
    }
  });
}
*/

function findMidpoint() {
  var location1 = document.getElementById("location1").value;
  var location2 = document.getElementById("location2").value;

  geocoder.geocode({ address: location1 }, function(results1, status1) {
    if (status1 === "OK") {
      var latLng1 = results1[0].geometry.location;

      geocoder.geocode({ address: location2 }, function(results2, status2) {
        if (status2 === "OK") {
          var latLng2 = results2[0].geometry.location;

          // Calculate the route and place the midpoint along it
          var request = {
            origin: latLng1,
            destination: latLng2,
            travelMode: google.maps.TravelMode.DRIVING
          };

          directionsService.route(request, function(result, status) {
            if (status === "OK") {
              directionsRenderer.setDirections(result);

              // Find midpoint based on route legs and steps
              var route = result.routes[0];
              var totalDistance = 0;
              var halfwayDistance = route.legs[0].distance.value / 2;

              for (let i = 0; i < route.legs[0].steps.length; i++) {
                var step = route.legs[0].steps[i];
                totalDistance += step.distance.value;

                if (totalDistance >= halfwayDistance) {
                  midpoint = step.end_location;
                  break;
                }
              }

              // Position circle on the calculated route midpoint
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
                  radius: parseInt(document.getElementById("radiusSlider").value) || 1000
                });
              }

              map.setCenter(midpoint);
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
  }
});


// Function to calculate and display the route between two locations
function calculateAndDisplayRoute(latLng1, latLng2) {
  var request = {
    origin: latLng1,
    destination: latLng2,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function(result, status) {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    } else {
      alert("Could not display directions due to: " + status);
    }
  });
}

// Function to open Google Maps for navigation from the user's current location to the midpoint
function startAtMidpoint() {
  if (midpoint) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        var directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${midpoint.lat},${midpoint.lng}&travelmode=driving`;

        window.open(directionsUrl, '_blank');
      }, function() {
        alert("Failed to get your current location. Please try again.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  } else {
    alert("Please calculate the midpoint first by clicking 'Find Midpoint'.");
  }
}
