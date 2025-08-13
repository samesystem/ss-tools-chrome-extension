// Content script that runs on ci.samesystem.net pages
(function() {
    'use strict';

    // Function to inject Bootstrap CSS into the page
    function injectBootstrapCSS() {
        if (!document.querySelector('link[href*="bootstrap"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
            link.integrity = 'sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    }

    // Function to inject Bootstrap JS into the page
    function injectBootstrapJS() {
        if (!document.querySelector('script[src*="bootstrap"]')) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js';
            script.integrity = 'sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL';
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
    }

    // Function to create and style the dropdown copy button with Bootstrap classes
    function createCopyButtonDropdown() {
        // Create the dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'btn-group my-2';
        dropdownContainer.setAttribute('role', 'group');

        // Create the main button
        const mainButton = document.createElement('button');
        mainButton.textContent = 'Copy RSpec command';
        mainButton.className = 'btn btn-primary btn-sm';
        mainButton.type = 'button';

        // Create the dropdown toggle button
        const dropdownToggle = document.createElement('button');
        dropdownToggle.className = 'btn btn-primary btn-sm dropdown-toggle dropdown-toggle-split';
        dropdownToggle.type = 'button';
        dropdownToggle.setAttribute('data-bs-toggle', 'dropdown');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownToggle.innerHTML = '<span class="visually-hidden">Toggle Dropdown</span>';

        // Create the dropdown menu
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';

        // Create dropdown items
        const fullCommandItem = document.createElement('li');
        const fullCommandLink = document.createElement('a');
        fullCommandLink.className = 'dropdown-item';
        fullCommandLink.href = '#';
        fullCommandLink.textContent = 'Copy RSpec command (full)';
        fullCommandItem.appendChild(fullCommandLink);

        const filesOnlyItem = document.createElement('li');
        const filesOnlyLink = document.createElement('a');
        filesOnlyLink.className = 'dropdown-item';
        filesOnlyLink.href = '#';
        filesOnlyLink.textContent = 'Copy RSpec command (files only)';
        filesOnlyItem.appendChild(filesOnlyLink);

        dropdownMenu.appendChild(fullCommandItem);
        dropdownMenu.appendChild(filesOnlyItem);

        // Assemble the dropdown
        dropdownContainer.appendChild(mainButton);
        dropdownContainer.appendChild(dropdownToggle);
        dropdownContainer.appendChild(dropdownMenu);

        // Add event listeners
        mainButton.addEventListener('click', function() {
            const nextSibling = dropdownContainer.nextElementSibling;
            const rspecCommand = nextSibling ? commandFromDivContent(nextSibling.textContent, false) : '';
            copyToClipboard(mainButton, rspecCommand, 'Copy RSpec command');
        });

        fullCommandLink.addEventListener('click', function(e) {
            e.preventDefault();
            const nextSibling = dropdownContainer.nextElementSibling;
            const rspecCommand = nextSibling ? commandFromDivContent(nextSibling.textContent, false) : '';
            copyToClipboard(mainButton, rspecCommand, 'Copy RSpec command');
        });

        filesOnlyLink.addEventListener('click', function(e) {
            e.preventDefault();
            const nextSibling = dropdownContainer.nextElementSibling;
            const rspecCommand = nextSibling ? commandFromDivContent(nextSibling.textContent, true) : '';
            copyToClipboard(mainButton, rspecCommand, 'Copy RSpec command');
        });

        return dropdownContainer;
    }

    // Function to copy text to clipboard
    function copyToClipboard(button, text, originalText) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Text copied to clipboard successfully');
            // Temporary visual feedback
            showCopyFeedback(button, 'Copied!', 'btn-success', originalText);
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
            showCopyFeedback(button, 'Copy failed!', 'btn-danger', originalText);
        });
    }

    // Show visual feedback when text is copied using Bootstrap classes
    function showCopyFeedback(button, feedbackText, buttonClass, originalText) {
        button.textContent = feedbackText;
        const originalClass = button.className;
        button.className = `btn ${buttonClass} btn-sm`;
        setTimeout(() => {
            button.textContent = originalText;
            button.className = originalClass;
        }, 1500);
    }

    // Function to find divs containing rspec commands and add copy buttons
    function addCopyButton() {
        // Look for divs that contain text matching "rspec ./spec/*" pattern
        const allDivs = document.querySelectorAll('div');
        const rspecPattern = /^result {\s+rspec \.\/spec\//;
        const buttonExists = !!document.querySelector('[data-copy-button]');

        if (buttonExists) {
            console.log('Copy buttons already exist, skipping addition.');
            return;
        }

        const matchingDiv = Array.from(allDivs).find(div => rspecPattern.test(div.textContent));
        if (matchingDiv) {
            // Create a copy button dropdown and insert it before the div
            const copyButtonDropdown = createCopyButtonDropdown();
            copyButtonDropdown.setAttribute('data-copy-button', 'true');
            matchingDiv.insertAdjacentElement('beforebegin', copyButtonDropdown);
            console.log('Added copy button dropdown for:', matchingDiv.textContent);
        }
    }

    function commandFromDivContent(content, filesOnly = false) {
        const strippedContent = content
            .replace(/^result {\s+rspec\s+\.\//, '')
            .replace(/\s+}$/, '')
            .replace(/rspec\s+\.\//gm, ' ')
            .replace(/#.*$/gm, '')
            .replace(/\s+/gm, ' ');

        let command = "bundle exec rspec " + strippedContent;

        if (filesOnly) {
            // Remove line numbers (everything after :) to get files only
            command = command.replace(/:\d+/g, '');
            // Remove duplicate file paths and clean up
            const files = [...new Set(command.replace('bundle exec rspec ', '').split(' ').filter(file => file.trim()))];
            command = "bundle exec rspec " + files.join(' ');
        }

        return command;
    }

    // Initialize the extension when the page is ready
    function init() {
        // Inject Bootstrap CSS and JS
        injectBootstrapCSS();
        injectBootstrapJS();

        // Add copy buttons to existing content
        addCopyButton();
    }

    // Wait for the page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('Chrome SS Tools: Content script loaded for', window.location.href);
})();
