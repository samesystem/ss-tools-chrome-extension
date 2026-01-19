// Content script that runs on ci.samesystem.net pages
(function() {
    'use strict';

    // Function to inject Bootstrap Icons CSS into the page
    function injectBootstrapIcons() {
        if (!document.querySelector('link[href*="bootstrap-icons"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css';
            document.head.appendChild(link);
        }
    }

    const COPY_SVG = `
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
             width="18" height="18"
             class="link-icon"
             viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve"
        >
            <rect x="13" y="9" fill="none" stroke-width="2" stroke-miterlimit="10" width="14" height="18"/>
            <polyline fill="none" stroke-width="2" stroke-miterlimit="10" points="11,23 5,23 5,5 19,5 19,7 "/>
        </svg>
    `

    const CUSTOM_CSS = `
      .btn.btn-primary { background-color: #26a69a; border-color: #26a69a; }
      .btn.btn-primary:hover { background-color: #00796b; border-color: #00796b; }
      .btn.btn-primary:active { background-color: #004d40; border-color: #004d40; }
      .btn.btn-link { color: #26a69a; }
      .link-icon rect { stroke: #26a69a; }
      .link-icon polyline { stroke: #26a69a; }
    `

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

        const style = document.createElement('style');
        style.textContent = CUSTOM_CSS;
        document.head.appendChild(style);
    }

    // Custom dropdown implementation (no Bootstrap JS needed)
    function initializeCustomDropdown(dropdownContainer) {
        const dropdownToggle = dropdownContainer.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu');

        if (!dropdownToggle || !dropdownMenu) return;

        // Toggle dropdown on button click
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });

            // Toggle current dropdown
            dropdownMenu.classList.toggle('show');
            dropdownToggle.setAttribute('aria-expanded', dropdownMenu.classList.contains('show'));
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownContainer.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown when pressing Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdownMenu.classList.remove('show');
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown when clicking on menu items
        dropdownMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                dropdownMenu.classList.remove('show');
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        });
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
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownToggle.innerHTML = '<span class="visually-hidden">Toggle Dropdown</span>';

        // Create the dropdown menu with custom positioning
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 1000;
            display: none;
            min-width: 10rem;
            padding: 0.5rem 0;
            margin: 0;
            font-size: 0.875rem;
            color: #212529;
            text-align: left;
            list-style: none;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid rgba(0,0,0,.15);
            border-radius: 0.25rem;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,.175);
        `;

        // CSS for show state
        const style = document.createElement('style');
        style.textContent = `
            .dropdown-menu.show {
                display: block !important;
            }
            .dropdown-item {
                display: block;
                width: 100%;
                padding: 0.25rem 1rem;
                clear: both;
                font-weight: 400;
                color: #212529;
                text-align: inherit;
                text-decoration: none;
                white-space: nowrap;
                background-color: transparent;
                border: 0;
                cursor: pointer;
            }
            .dropdown-item:hover {
                color: #1e2125;
                background-color: #e9ecef;
            }
        `;
        document.head.appendChild(style);

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

        // Helper function to get failed tests content div
        function getFailedTestsContentDiv() {
            const descriptionContent = document.querySelector('#description-content');
            if (!descriptionContent) return null;

            const childDivs = Array.from(descriptionContent.children);
            const failedTestsContainer = childDivs.find(div =>
                div.textContent.includes('Failed tests:') && div.textContent.includes('rspec')
            );

            if (!failedTestsContainer) return null;

            // Find the styled div that contains the actual rspec commands
            return Array.from(failedTestsContainer.children).find(div =>
                div.style.marginLeft && div.textContent.includes('rspec')
            );
        }

        // Add event listeners
        mainButton.addEventListener('click', function() {
            const failedTestsDiv = getFailedTestsContentDiv();
            const rspecCommand = failedTestsDiv ? commandFromDivContent(failedTestsDiv.textContent, false) : '';
            copyToClipboard(mainButton, rspecCommand, 'Copy RSpec command');
        });

        fullCommandLink.addEventListener('click', function(e) {
            e.preventDefault();
            const failedTestsDiv = getFailedTestsContentDiv();
            const rspecCommand = failedTestsDiv ? commandFromDivContent(failedTestsDiv.textContent, false) : '';
            copyToClipboard(mainButton, rspecCommand, 'Copy RSpec command');
        });

        filesOnlyLink.addEventListener('click', function(e) {
            e.preventDefault();
            const failedTestsDiv = getFailedTestsContentDiv();
            const rspecCommand = failedTestsDiv ? commandFromDivContent(failedTestsDiv.textContent, true) : '';
            copyToClipboard(mainButton, rspecCommand, 'Copy RSpec command');
        });

        // Initialize custom dropdown functionality
        initializeCustomDropdown(dropdownContainer);

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

    function writeToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Text copied to clipboard successfully');
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
        });
    }

    // Show visual feedback when text is copied using Bootstrap classes
    function showCopyFeedback(button, feedbackText, buttonClass, originalText) {
        button.textContent = feedbackText;
        const toggleButton = button.nextElementSibling;

        button.classList.add(buttonClass);
        toggleButton.classList.add(buttonClass);

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove(buttonClass);
            toggleButton.classList.remove(buttonClass);
        }, 1500);
    }

    // Function to find divs containing rspec commands and add copy buttons
    function addCopyRspecButton() {
        // Look for divs that contain text matching "rspec ./spec/*" pattern

        const buttonExists = !!document.querySelector('[data-copy-button]');

        if (buttonExists) {
            console.log('Copy buttons already exist, skipping addition.');
            return;
        }

        // In the new Jenkins UI, failed tests are in #description-content
        // Look for a div containing "Failed tests:" text
        const descriptionContent = document.querySelector('#description-content');
        if (!descriptionContent) return;

        const childDivs = Array.from(descriptionContent.children);
        const failedTestsContainer = childDivs.find(div =>
            div.textContent.includes('Failed tests:') && div.textContent.includes('rspec')
        );

        if (failedTestsContainer) {
            // The failed tests container has the title and content together
            // Find the inner div with the rspec commands
            const titleDiv = Array.from(failedTestsContainer.children).find(div =>
                div.textContent === 'Failed tests:'
            );

            if (titleDiv) {
                // Create a copy button dropdown and insert it after the title
                const copyButtonDropdown = createCopyButtonDropdown();
                copyButtonDropdown.setAttribute('data-copy-button', 'true');
                copyButtonDropdown.style.marginLeft = '10px';
                copyButtonDropdown.style.display = 'inline-block';
                titleDiv.appendChild(copyButtonDropdown);
            }
        }
    }

    function commandFromDivContent(content, filesOnly = false) {
        const strippedContent = content
            .replace(/^result {\s+rspec\s+\.\//, '')
            .replace(/^result {\s+rspec\s+'\.\//, "'")
            .replace(/\s+}$/, '')
            .replace(/rspec\s+\.\//gm, ' ')
            .replace(/rspec\s+'\.\//gm, " '")
            .replace(/#.*$/gm, '')
            .replace(/\s+/gm, ' ');

        let command = "bundle exec rspec " + strippedContent;

        if (filesOnly) {
            // Remove line numbers (everything after :) to get files only
            command = command.replace(/\[[\d:]+\]/g, '').replace(/'/g, "").replace(/:\d+/g, '');
            // Remove duplicate file paths and clean up
            const files = [...new Set(command.replace('bundle exec rspec ', '').split(' ').filter(file => file.trim()))];
            command = "bundle exec rspec " + files.join(' ');
        }

        return command;
    }

    function addCopyBranchButton() {
        // Look for divs that contain text matching "git checkout -b" pattern
        const descriptionContent = document.querySelector('#description-content');
        if(!descriptionContent) return;

        // In the new UI, the branch name is typically the first child div
        const branchDiv = Array.from(descriptionContent.children).find(div => {
            const text = div.textContent.trim();
            // Check if it looks like a branch name and doesn't contain other content markers
            return text &&
                   !text.includes('DEPLOY FAILED') &&
                   !text.includes('retried jobs') &&
                   !text.includes('Failed jobs:') &&
                   !text.includes('Failed tests:') &&
                   !text.includes('Fatal errors:') &&
                   text.length > 0 &&
                   text.length < 200; // Branch names are typically short
        });

        if (!branchDiv) return;

        const branchName = branchDiv.textContent.trim();
        if (branchName === '') return;

        // Check if copy button already exists
        if (branchDiv.querySelector('[data-copy-branch]')) return;

        // Create a copy link and insert at the end of the branch div
        const copyLink = document.createElement('a');
        copyLink.innerHTML = COPY_SVG;
        copyLink.className = "btn btn-sm btn-link";
        copyLink.setAttribute('data-copy-branch', 'true');
        copyLink.addEventListener('click', function(e) {
            e.preventDefault();
            writeToClipboard(branchName);
            copyLink.innerHTML = 'Copied!';
             setTimeout(() => {
                 copyLink.innerHTML = COPY_SVG;
            }, 1500);
        });
        branchDiv.appendChild(copyLink);
    }

    function mergeReportCells(tds) {
        if (tds.length === 0) return;

        // New structure: [status icon, separator, link, message]
        const mainTd = tds[0]; // Status icon cell
        if (!mainTd) return;

        const statusIcon = mainTd.textContent.trim();
        const linkCell = tds[2]; // Link is in the 3rd cell
        const tooltip = tds[3] ? tds[3].textContent.trim() : ''; // Message is in the 4th cell
        const link = linkCell ? linkCell.querySelector('a') : null;
        const updatedLinkHtml = link ? reportLinkToIconsHtml(link) : '-';

        mainTd.style = '';
        mainTd.innerHTML = `<span class="report-table-status-icon" title="${tooltip}">${statusIcon}</span> ${updatedLinkHtml}`;
        mainTd.classList.add('report-table-status-cell', 'text-start');

        // Remove the other tds (separator, link, message)
        for (let i = 1; i < tds.length; i++) {
            if (tds[i]) {
                tds[i].remove();
            }
        }
    }

    function reportLinkToIconsHtml(link) {
        if (!link) return;

        const href = link.href;
        let html = `<a href="${href}"><i class="bi bi-file-code" style="font-size: 18px;"></i></a>`;
        if (href.includes('/job/selenium')) {
            const url = href.replace('/console', '/artifact/report/report.html');
            html = html + `<a href="${url}"><i class="bi bi-file-earmark-text" style="font-size: 18px;"></i></a>`;
        } else if (href.includes('/job/playwright')) {
            const url = href.replace('/console', '/artifact/report/index.html');
            html = html + `<a href="${url}"><i class="bi bi-file-earmark-text" style="font-size: 18px;"></i></a>`;
        }

        return html;
    }

    function styleReportsTable() {
        // In the new Jenkins UI, the report table is inside a div containing "retried jobs"
        const descriptionContent = document.querySelector('#description-content');
        if (!descriptionContent) return;

        const childDivs = Array.from(descriptionContent.children);
        const retriedJobsDiv = childDivs.find(div => div.textContent.includes('retried jobs'));
        if (!retriedJobsDiv) return;

        const reportTable = retriedJobsDiv.querySelector('table');
        if (!reportTable) return;

        reportTable.style = 'width: auto;';
        reportTable.classList.add('table', 'table-sm', 'table-bordered', 'table-hover', 'table-striped', 'report-table');

        const reportTableTrs = reportTable.querySelectorAll('tr');
        Array.from(reportTableTrs).forEach((tr, index) => {
          const tds = Array.from(tr.querySelectorAll('td'));

          // New structure has 13 cells:
          // 0: job name
          // 1-4: first run (status, separator, link, message)
          // 5-8: second run (status, separator, link, message)
          // 9-12: third run (status, separator, link, message)

          if (tds.length < 13) return; // Skip rows that don't have the expected structure

          tds[0].classList.add('report-table-job-name');

          // Determine row color based on status icons
          // Check if any run has ✗ (failed)
          if (tds[1].textContent.includes('✗') || tds[5].textContent.includes('✗') || tds[9].textContent.includes('✗')) {
              tr.classList.add('table-danger');
          }
          // Check if any run has ✓ (success)
          else if (tds[1].textContent.includes('✓') || tds[5].textContent.includes('✓') || tds[9].textContent.includes('✓')) {
              tr.classList.add('table-success');
          }
          // Otherwise it's in progress
          else {
              tr.classList.add('report-table-in-progress');
          }

          // Merge cells for each run
          mergeReportCells([tds[1], tds[2], tds[3], tds[4]]);
          mergeReportCells([tds[5], tds[6], tds[7], tds[8]]);
          mergeReportCells([tds[9], tds[10], tds[11], tds[12]]);
        });

        // Order TRs: in progress, failed, success
        const inProgressRows = Array.from(reportTable.querySelectorAll('tr.report-table-in-progress'));
        const failedRows = Array.from(reportTable.querySelectorAll('tr.table-danger'));
        const successRows = Array.from(reportTable.querySelectorAll('tr.table-success'));
        const tbody = reportTable.querySelector('tbody') || reportTable;

        inProgressRows.forEach(row => tbody.appendChild(row));
        failedRows.forEach(row => tbody.appendChild(row));
        successRows.forEach(row => tbody.appendChild(row));
    }

    function hideExtraDetailsTable() {
      const extraDetailsTable = document.querySelector('div#main-panel>table');
      if (extraDetailsTable) {
        extraDetailsTable.style.display = 'none';
      }
    }

    // Initialize the extension when the page is ready
    function init() {
        // Inject Bootstrap CSS (but not JS due to CSP)
        injectBootstrapCSS();
        injectBootstrapIcons();

        // Add copy buttons to existing content
        addCopyRspecButton();
        addCopyBranchButton();
        styleReportsTable();
        hideExtraDetailsTable();
    }

    // Wait for the page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('Chrome SS Tools: Content script loaded for', window.location.href);
})();
