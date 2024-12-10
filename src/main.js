import './style.css';
import { CarScene } from './scene';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import $ from 'jquery';

window.$ = $;
window.jQuery = $;

// Test mode flag
const TEST_MODE = true;

document.addEventListener('DOMContentLoaded', () => {
    const carScene = new CarScene();
    carScene.init();

    const heroText = document.querySelector('.hero-text');
    const subText = document.querySelector('.hero-subtext');
    const textContainer = document.querySelector('.overlay-text');

    // Animation sequence
    const sequence = async () => {
        if (TEST_MODE) {
            // Skip text animations and hide text container immediately
            textContainer.style.display = 'none';
            carScene.fadeIn();
            return;
        }

        // Regular sequence
        heroText.classList.add('visible');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        subText.classList.add('visible');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        textContainer.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        textContainer.style.display = 'none';
        
        carScene.fadeIn();
    };

    // Start sequence when car model is ready
    carScene.onReady(() => {
        sequence();
    });

    // GA4 event for page view
    gtag('event', 'view', {
        'event_category': 'header',
        'event_action': 'view',
        'event_label': 'main_header'
    });
}); 