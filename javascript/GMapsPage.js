/**
 * File: GMapsPage.js
 */
(function($) {
    $.entwine('ss', function($) {

        /**
         * ID: #GMapsPage_Map
         * 
         * Initialise map upon matching appropriate field
         */
        $('#GMapsPage_Map').entwine({
            // Constructor: onmatch
            onmatch: function() {
                initialiseMap();
            }
        });

        /**
         * ID: #Root_GoogleMap[aria-hidden="false"]
         * 
         * Redraw map when tab becomes visible. Trigger resize event when switching tabs as 
         * map will render at 0 width/height in inactive tabs. Also need to re-center after
         */
        $('#Root_GoogleMap[aria-hidden="false"]').entwine({
            // Constructor: onmatch
            onmatch: function() {
                google.maps.event.trigger(map, 'resize');
                center = marker.getPosition();
                map.panTo(center);
            }
        });

        /**
         * Class: .cms-edit-form input[name=SearchAddress]
         * 
         * Bind events for geocoding address
         */
        $('.cms-edit-form input[name=SearchAddress]').entwine({
            // Constructor: onmatch
            onmatch: function() {
                var self = this;

                this.bind('keypress blur', function(e) {
                    if (d) clearTimeout(d);
                    // Set timeout to prevent lots of maps API requests
                    var d = setTimeout(function() {
                        geocodePosition(self.val());
                    }, 500);
                });
            }
        });
    });

    var lat, // Coordinates
        lng,
        latField = $('.cms-edit-form input[name=GMapLat]'), // Fields
        lngField = $('.cms-edit-form input[name=GMapLon]'),
        center = new google.maps.LatLng(latField.val(), lngField.val()),
        options = { 
            zoom: 13,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById('GMapsPage_Map'), options),
        marker = new google.maps.Marker({
            position: center,
            map: map,
            draggable: true
        }),
        geocoder = new google.maps.Geocoder();

    /**
     * Pans the map to center & adds event listener for marker dragging
     */
    function initialiseMap() {
        center = marker.getPosition();
        map.panTo(center);
        google.maps.event.addListener(marker, 'dragend', updateMarkerPosition);
    }

    /**
     * Updates the hidden fields for coordinates and triggers an onchange event as 
     * 3.1's changetracker needs that event to pick up the changes
     */
    function updateMarkerPosition() {
        var latLng = marker.getPosition();
        latField.val(latLng.lat()).change();
        lngField.val(latLng.lng()).change();
    }

    /**
     * Converts an address/location into a LatLng object and updates map & hidden
     * fields with coordinates
     */
    function geocodePosition(address) {
        geocoder.geocode({
                'address': address
            }, function(responses) {
                if (responses && responses.length > 0) {
                    lat = responses[0].geometry.location.lat();
                    lng = responses[0].geometry.location.lng();
                    center = new google.maps.LatLng(lat, lng);
                    latField.val(lat);
                    lngField.val(lng);
                    map.setCenter(center);
                    marker.setPosition(center);
                    updateMarkerPosition();
                }
            }
        );
    }
}(jQuery));