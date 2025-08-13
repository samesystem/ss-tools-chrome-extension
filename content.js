// Content script that runs on ci.samesystem.net pages
(function() {
    'use strict';

    // Function to create and style the copy button
    function createCopyButton() {
        const button = document.createElement('button');
        const defaultText = 'Copy RSpec command';
        button.textContent = defaultText;
        button.style.marginTop = '10px';
        button.style.marginBottom = '10px';
        button.style.padding = '5px 10px';
        button.style.border = '1px solid #AAA';
        button.style.cursor = 'pointer';

        button.addEventListener('click', function() {
            const nextSibling = button.nextElementSibling;
            const rspecCommand = nextSibling ? commandFromDivContent(nextSibling.textContent) : '';
            copyToClipboard(button, rspecCommand);
        });

        return button;
    }

    // Function to copy text to clipboard
    function copyToClipboard(button, text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Text copied to clipboard successfully');
            // Temporary visual feedback
            showCopyFeedback(button, 'Copied!', '#9ad79dff');
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
            showCopyFeedback(button, 'Copy failed :(' + err.message + ')', '#ffc2bdff');
        });
    }

    // Show visual feedback when text is copied
    function showCopyFeedback(button, feedbackText, backgroundColor) {
        button.textContent = feedbackText;
        const previousBackgroundColor = button.style.backgroundColor;
        button.style.backgroundColor = backgroundColor;
        setTimeout(() => {
            button.textContent = 'Copy RSpec command';
            button.style.backgroundColor = previousBackgroundColor; // Reset background color
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
            // Create a copy button and insert it before the div
            const copyButton = createCopyButton();
            copyButton.setAttribute('data-copy-button', 'true');
            matchingDiv.insertAdjacentElement('beforebegin', copyButton);
            console.log('Added copy button for:', matchingDiv.textContent);
        }
    }

    function commandFromDivContent(content) {
      const strippedContent = content
             .replace(/^result {\s+rspec\s+\.\//, '')
             .replace(/\s+}$/, '')
             .replace(/rspec\s+\.\//gm, ' ')
             .replace(/#.*$/gm, '')
             .replace(/\s+/gm, ' ');
      return "bundle exec rspec " + strippedContent;
    }

    // Initialize the extension when the page is ready
    function init() {
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
