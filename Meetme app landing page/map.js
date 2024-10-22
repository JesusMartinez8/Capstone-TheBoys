var directionsService;
var directionsRenderer;
var geocoder;
var midpoint; // Store the midpoint globally

// Initialize the Google Map
function initMap() {
  var mapOptions = {
    center: { lat: 25.7617, lng: -80.1918 },
    zoom: 12,
  };

  var map = new google.maps.Map(document.getElementById("map"), mapOptions);
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map
  });
  geocoder = new google.maps.Geocoder();
  window.map = map;
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

// Function to calculate and display the midpoint, markers, and route
function findMidpoint() {
  var location1 = document.getElementById("location1").value;
  var location2 = document.getElementById("location2").value;

  geocoder.geocode({ address: location1 }, function(results1, status1) {
    if (status1 === "OK") {
      var latLng1 = results1[0].geometry.location;
      var marker1 = new google.maps.Marker({
        position: latLng1,
        map: map,
        title: "Location 1",
        label: "A"
      });

      geocoder.geocode({ address: location2 }, function(results2, status2) {
        if (status2 === "OK") {
          var latLng2 = results2[0].geometry.location;
          var marker2 = new google.maps.Marker({
            position: latLng2,
            map: map,
            title: "Location 2",
            label: "B"
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
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
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
      // Get the user's current location
      navigator.geolocation.getCurrentPosition(function(position) {
        var currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Construct a URL to open Google Maps with the directions
        var directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${midpoint.lat},${midpoint.lng}&travelmode=driving`;

        // Open the URL in a new tab to start directions in Google Maps
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
