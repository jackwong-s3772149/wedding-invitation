// ========================================
// WEDDING INVITATION - JAVASCRIPT
// Google Sheets Integration
// ========================================

// ⚠️ IMPORTANT: Replace this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYH2TrXR4c--7UA_OLEzaaX842jSbHhBbzGVdPUBsbFLrMoCaY6D1fkdA-DHjnFlpECw/exec';

document.addEventListener('DOMContentLoaded', function() {
    initCountdown();
    initRSVPForm();
    initScrollAnimations();
    initDietaryDropdown();
    initGallerySlideshow();
});

// ========================================
// COUNTDOWN TIMER
// ========================================

function initCountdown() {
    const weddingDate = new Date('October 25, 2026 19:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '0';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ========================================
// DIETARY DROPDOWN LOGIC
// ========================================

// ========================================
// GALLERY SLIDESHOW
// ========================================

function initGallerySlideshow() {
    const photos = document.querySelectorAll('.gallery-photo');
    const dots = document.querySelectorAll('.dot');
    
    if (photos.length === 0) return;
    
    let currentIndex = 0;
    const intervalTime = 4000; // 4 seconds per photo
    
    function showPhoto(index) {
        photos.forEach((photo, i) => {
            photo.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }
    
    function nextPhoto() {
        const nextIndex = (currentIndex + 1) % photos.length;
        showPhoto(nextIndex);
    }
    
    // Auto slideshow
    let slideInterval = setInterval(nextPhoto, intervalTime);
    
    // Click on dots to navigate
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showPhoto(index);
            // Reset interval when manually navigating
            clearInterval(slideInterval);
            slideInterval = setInterval(nextPhoto, intervalTime);
        });
    });
}

function initDietaryDropdown() {
    const dietarySelect = document.getElementById('dietary');
    const dietaryOthersGroup = document.getElementById('dietaryOthersGroup');
    const dietaryOthersInput = document.getElementById('dietaryOthers');
    const dietaryError = document.getElementById('dietaryError');
    
    if (!dietarySelect || !dietaryOthersGroup) return;
    
    // Show/hide "Others" text input based on dropdown selection
    dietarySelect.addEventListener('change', function() {
        if (this.value === 'Others') {
            dietaryOthersGroup.style.display = 'block';
            dietaryOthersInput.required = true;
            // Add animation
            dietaryOthersGroup.style.animation = 'fadeIn 0.3s ease';
        } else {
            dietaryOthersGroup.style.display = 'none';
            dietaryOthersInput.required = false;
            dietaryOthersInput.value = '';
            // Hide error if visible
            dietaryError.style.display = 'none';
            dietaryOthersInput.classList.remove('error');
        }
    });
    
    // Clear error when user starts typing
    dietaryOthersInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            dietaryError.style.display = 'none';
            this.classList.remove('error');
        }
    });
}

// Validate dietary "Others" field
function validateDietaryOthers() {
    const dietarySelect = document.getElementById('dietary');
    const dietaryOthersInput = document.getElementById('dietaryOthers');
    const dietaryError = document.getElementById('dietaryError');
    
    if (dietarySelect.value === 'Others') {
        if (!dietaryOthersInput.value.trim()) {
            dietaryError.style.display = 'block';
            dietaryOthersInput.classList.add('error');
            dietaryOthersInput.focus();
            return false;
        }
    }
    return true;
}

// Get the final dietary value for Google Sheets
function getDietaryValue() {
    const dietarySelect = document.getElementById('dietary');
    const dietaryOthersInput = document.getElementById('dietaryOthers');
    
    if (dietarySelect.value === 'Others') {
        // Return the custom value they typed
        return dietaryOthersInput.value.trim();
    }
    // Return the dropdown value (No, Vegetarian, or Halal)
    return dietarySelect.value;
}

// ========================================
// RSVP FORM
// ========================================

function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    const attendingRadios = document.querySelectorAll('input[name="attending"]');
    const attendingDetails = document.querySelectorAll('.attending-details');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = form.querySelector('.submit-btn');
    
    // Show/hide attending details based on selection
    attendingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                attendingDetails.forEach(el => el.classList.add('show'));
            } else {
                attendingDetails.forEach(el => el.classList.remove('show'));
                // Reset dietary dropdown when declining
                const dietarySelect = document.getElementById('dietary');
                const dietaryOthersGroup = document.getElementById('dietaryOthersGroup');
                if (dietarySelect) {
                    dietarySelect.value = 'No';
                    dietaryOthersGroup.style.display = 'none';
                }
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate dietary "Others" field if attending
        const isAttending = document.querySelector('input[name="attending"]:checked')?.value === 'yes';
        if (isAttending && !validateDietaryOthers()) {
            return; // Stop submission if validation fails
        }
        
        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳ Sending...</span>';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            attending: isAttending ? 'Yes' : 'No',
            guests: document.getElementById('guests').value || '1',
            dietary: isAttending ? getDietaryValue() : 'N/A',
            message: document.getElementById('message').value || 'No message'
        };
        
        try {
            // Send to Google Sheets
            if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                await sendToGoogleSheets(formData);
            } else {
                console.log('⚠️ Google Sheets URL not configured. RSVP data:', formData);
                console.log('To enable Google Sheets integration, replace GOOGLE_SCRIPT_URL with your Apps Script URL');
            }
            
            // Also save locally as backup
            saveRSVPLocally(formData);
            
            // Show success message
            form.style.display = 'none';
            successMessage.classList.add('show');

            // Show calendar button only if attending
            if (isAttending) {
                showCalendarButton();
            }

            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('Error submitting RSVP:', error);

            // Still save locally and show success (better UX)
            saveRSVPLocally(formData);
            form.style.display = 'none';
            successMessage.classList.add('show');

            // Show calendar button only if attending
            if (isAttending) {
                showCalendarButton();
            }

            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Reset button (in case of error handling that keeps form visible)
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    });
}

// ========================================
// GOOGLE SHEETS INTEGRATION
// ========================================

async function sendToGoogleSheets(data) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('✅ RSVP sent to Google Sheets');
        return true;
        
    } catch (error) {
        console.error('❌ Error sending to Google Sheets:', error);
        throw error;
    }
}

// ========================================
// LOCAL STORAGE (Backup)
// ========================================

function saveRSVPLocally(data) {
    try {
        const existing = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
        data.timestamp = new Date().toISOString();
        existing.push(data);
        localStorage.setItem('weddingRSVPs', JSON.stringify(existing));
        console.log('💾 RSVP saved locally as backup');
    } catch (e) {
        console.error('Could not save to localStorage:', e);
    }
}

// Function to view all local RSVPs (for debugging)
function viewAllRSVPs() {
    const rsvps = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
    console.table(rsvps);
    return rsvps;
}

// Make viewAllRSVPs available globally for debugging
window.viewAllRSVPs = viewAllRSVPs;

// ========================================
// ADD TO CALENDAR
// ========================================

function downloadCalendarFile() {
    // Wedding event details
    const eventTitle = 'Xian Jing & Hiuyan Wedding';
    const eventDescription = 'Wedding Dinner of Xian Jing & Hiuyan\\n\\nVenue: Restoran Pekin Johor Jaya\\n北京楼 Hall 2\\n\\nGoogle Maps: https://maps.app.goo.gl/a7S2mQoHPDB2XuUW7';
    const eventLocation = 'Restoran Pekin Johor Jaya, 北京楼 Hall 2, Johor Jaya';

    // Date: October 25, 2026, 7:00 PM Malaysia Time (UTC+8)
    // ICS format requires UTC time, so 7PM MYT = 11AM UTC
    const startDate = '20261025T110000Z';
    const endDate = '20261025T150000Z'; // 4 hour event (11PM MYT)

    // Generate unique ID for the event
    const uid = 'wedding-xianjing-hiuyan-20261025@invitation';

    // Create ICS content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Xian Jing & Hiuyan Wedding//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${eventTitle}`,
        `DESCRIPTION:${eventDescription}`,
        `LOCATION:${eventLocation}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Wedding tomorrow!',
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-PT2H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Wedding in 2 hours!',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    // Create and download the file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'XianJing-Hiuyan-Wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Show calendar button for attending guests
function showCalendarButton() {
    const calendarBtn = document.getElementById('addToCalendarBtn');
    if (calendarBtn) {
        calendarBtn.style.display = 'inline-flex';
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.details, .countdown-section, .rsvp-section, .quote-section');
    sections.forEach(section => {
        observer.observe(section);
    });

}