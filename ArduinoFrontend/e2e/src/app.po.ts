import { browser, by, element } from 'protractor';

/**
 * AppPage End to End Testing
 */
export class AppPage {
  /**
   * Navigate to Base URL
   */
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }
}
