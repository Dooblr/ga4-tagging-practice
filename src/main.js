import './style.css';
import { CarScene } from './scene';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import $ from 'jquery';

window.$ = $;
window.jQuery = $;

document.addEventListener('DOMContentLoaded', () => {
    const carScene = new CarScene();
    carScene.init();

    const heroText = document.querySelector('.hero-text');
    const subText = document.querySelector('.hero-subtext');
    const textContainer = document.querySelector('.overlay-text');

    // Animation sequence
    const sequence = async () => {
        // Show header text with transform
        heroText.classList.add('visible');
        
        // Wait 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show subheader with transform
        subText.classList.add('visible');
        
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fade out all text
        textContainer.style.opacity = '0';
        
        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove text container
        textContainer.style.display = 'none';
        
        // Fade in 3D model
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