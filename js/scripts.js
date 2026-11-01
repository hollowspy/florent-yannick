/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Formulaire de contact (envoi via EmailJS)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        initContactForm(contactForm);
    }

});


// Service Id staging Julien NIEDZWIECKI sur EmailJS
// const EMAILJS_SERVICE_ID = 'service_3di3gar';


// Service ID et template ID prod Mail yannick Florent
const EMAILJS_SERVICE_ID = 'service_wsh0xwy';
const EMAILJS_TEMPLATE_ID = 'template_xg99wwt';

// 10 chiffres commençant par 0, ou +33 suivi de 9 chiffres (espaces, points et tirets tolérés)
const PHONE_REGEX = /^(?:0\d{9}|\+33\d{9})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const normalizePhone = (value) => value.replace(/[\s.\-]/g, '');

// Chaque règle renvoie un message d'erreur, ou une chaîne vide si le champ est valide
const contactRules = {
    name: (value) => value.trim() ? '' : 'Le nom est obligatoire.',
    email: (value) => {
        if (!value.trim()) return 'Un email est obligatoire.';
        return EMAIL_REGEX.test(value.trim()) ? '' : "L'email n'est pas valide (ex : nom@exemple.fr).";
    },
    phone: (value) => {
        if (!value.trim()) return 'Un n° de téléphone est obligatoire.';
        return PHONE_REGEX.test(normalizePhone(value)) ? '' : 'Le n° doit contenir 10 chiffres (ex : 06 12 34 56 78) ou commencer par +33.';
    },
    message: (value) => value.trim() ? '' : 'Un message est obligatoire.',
};

function initContactForm(form) {
    const submitButton = document.getElementById('submitButton');
    const submitLabel = submitButton.innerHTML;
    const fields = Object.keys(contactRules).map((name) => form.elements[name]);
    let isSending = false;

    const validateField = (field, showError) => {
        const error = contactRules[field.name](field.value);
        if (showError) {
            field.classList.toggle('is-invalid', Boolean(error));
            document.getElementById(field.name + '-feedback').textContent = error;
        }
        return !error;
    };

    const updateSubmitButton = () => {
        const isValid = fields.every((field) => validateField(field, false));
        submitButton.disabled = isSending || !isValid;
    };

    fields.forEach((field) => {
        field.addEventListener('input', () => {
            // Une fois l'erreur affichée, on la met à jour pendant la saisie
            if (field.classList.contains('is-invalid')) {
                validateField(field, true);
            }
            updateSubmitButton();
        });
        // L'erreur n'apparaît qu'en quittant un champ déjà rempli, pas pendant la première saisie
        field.addEventListener('blur', () => {
            if (field.value) {
                validateField(field, true);
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const isValid = fields.map((field) => validateField(field, true)).every(Boolean);
        if (!isValid || isSending) {
            return;
        }

        // Champ anti-spam rempli : c'est un robot, on fait semblant d'avoir envoyé
        if (form.elements.website.value) {
            form.reset();
            updateSubmitButton();
            showContactResult(true);
            return;
        }

        const email = form.elements.email.value.trim();
        const params = {
            name: form.elements.name.value.trim(),
            email: email,
            reply_to: email,
            phone: form.elements.phone.value.trim(),
            message: form.elements.message.value.trim(),
        };

        isSending = true;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Envoi en cours…';

        if (typeof emailjs === 'undefined') {
            onSendError(new Error('EmailJS non chargé'));
            onSendEnd();
            return;
        }

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
            .then(() => {
                form.reset();
                fields.forEach((field) => field.classList.remove('is-invalid'));
                showContactResult(true);
            })
            .catch(onSendError)
            .finally(onSendEnd);
    });

    function onSendError(error) {
        console.error("Erreur lors de l'envoi du message :", error);
        showContactResult(false);
    }

    function onSendEnd() {
        isSending = false;
        submitButton.innerHTML = submitLabel;
        updateSubmitButton();
    }
}

function showContactResult(isSuccess) {
    const modalElement = document.getElementById('contactResultModal');
    modalElement.classList.toggle('is-success', isSuccess);
    modalElement.classList.toggle('is-error', !isSuccess);
    document.getElementById('contactResultTitle').textContent = isSuccess ? 'Message envoyé' : 'Échec de l\'envoi';
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}
