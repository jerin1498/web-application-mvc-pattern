export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiamVyaW5oYXBweSIsImEiOiJjazh6aDQwb2kwbzZ0M25zMmUzeTkzbGgwIn0.uR3X5LkhCvswkzIK64CN6A';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jerinhappy/ck8zhyurd0f2w1ip390h8yccv',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // logoPosition: 'top-right'
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // creating marker   check in css marker proprety 
        const el = document.createElement('div');
        el.className = 'marker';

        // adding marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        // adding popup message
        new mapboxgl.Popup({ offset: 30, closeOnClick: false })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);
        // extend the map bound to include the current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 150,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
};
