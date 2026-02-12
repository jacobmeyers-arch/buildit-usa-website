/* ============================================
   Build It USA — v2 Form Handling
   Purpose: Submit waitlist form via fetch, show success/error
   Created: 2026-02-11
   ============================================ */

(function () {
    'use strict';

    var form = document.getElementById('waitlist-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(form);
        var submitBtn = form.querySelector('.form__button');
        var originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            if (response.ok) {
                form.innerHTML =
                    '<div class="form__success">' +
                    "<p>You're on the list! We'll be in touch.</p>" +
                    '</div>';
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(function () {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert('Something went wrong. Please try emailing jacob.meyers@buildit-usa.com directly.');
        });
    });

})();
