'use strict';

/**
 * Maintenance Mode System
 * This script will enable or disable maintenance mode for the website.
 * When enabled, it will display a maintenance message to users.
 */

class MaintenanceMode {
    constructor() {
        this.isEnabled = false;
    }

    enable() {
        this.isEnabled = true;
        this.displayMessage();
    }

    disable() {
        this.isEnabled = false;
        this.removeMessage();
    }

    displayMessage() {
        console.log('The website is currently under maintenance. Please check back later.');
        // Additional logic to redirect users to a maintenance page can be added here.
    }

    removeMessage() {
        console.log('The website is back online. Thank you for your patience.');
        // Logic to remove maintenance message can be added here if necessary.
    }
}

// Example usage:
const maintenance = new MaintenanceMode();
maintenance.enable(); // Call this to enable maintenance mode
// maintenance.disable(); // Call this to disable maintenance mode
