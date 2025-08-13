// Popup script for Chrome SS Tools extension
document.addEventListener('DOMContentLoaded', function() {
    console.log("Chrome SS Tools popup loaded!");

    // Check if we're on a supported page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const statusElement = document.getElementById('status');

        if (currentTab.url && currentTab.url.includes('ci.samesystem.net')) {
            if (statusElement) {
                statusElement.textContent = 'Active on this page';
                statusElement.className = 'active';
            }
        } else {
            if (statusElement) {
                statusElement.textContent = 'Not active (only works on ci.samesystem.net)';
                statusElement.className = 'inactive';
            }
        }
    });
});
