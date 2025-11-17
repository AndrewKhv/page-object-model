import BasePage from './base-page'
import { Locator, Page } from '@playwright/test'
import { SERVICE_URL } from '../../config/env-data'

export default class NotFoundPage extends BasePage {
  readonly title: Locator
  readonly description: Locator

  constructor(page: Page, url?: string) {
    super(page, url ? url : `${SERVICE_URL}/order/-1`);
    this.title = this.page.locator('.not-found__title')
    this.description = this.page.locator('.not-found__description')
  }
}