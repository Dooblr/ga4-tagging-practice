$(document).ready(function() {
    // Initialize 3D scene
    const carScene = new CarScene();

    // Existing color change functionality
    $('#changeColorBtn').click(function() {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        $('#colorSquare').css('background-color', randomColor);

        // Send GA4 event for button click
        gtag('event', 'click', {
            'event_category': 'button',
            'event_action': 'click',
            'event_label': 'change_color_button'
        });

        // Send GA4 event for color change
        gtag('event', 'color_change', {
            'event_category': 'interactive',
            'event_action': 'color_change',
            'event_label': 'color_square',
            'color_value': randomColor
        });
    });

    // Send GA4 event for page view
    gtag('event', 'view', {
        'event_category': 'header',
        'event_action': 'view',
        'event_label': 'main_header'
    });
});
