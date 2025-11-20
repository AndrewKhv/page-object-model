import { expect, Page, Locator, test } from '@playwright/test'
import BasePage from './base-page'
import { SERVICE_URL } from '../../config/env-data'

export class OrderPage extends BasePage {
  readonly statusButton: Locator
  readonly nameField: Locator
  readonly phoneField: Locator
  readonly commentField: Locator
  readonly createOrderButton: Locator

  // creation popup
  readonly successfulCreationPopup: Locator
  readonly okButton: Locator
  readonly codeSpan: Locator

  // search popup elements
  readonly searchOrderPopup: Locator
  readonly orderIdInputField: Locator
  readonly trackButton

  constructor(page: Page, url?: string) {
    super(page, url ? url : SERVICE_URL)
    this.statusButton = page.getByTestId('openStatusPopup-button')
    this.nameField = page.getByTestId('username-input')
    this.phoneField = page.getByTestId('phone-input')
    this.commentField = page.getByTestId('comment-input')
    this.createOrderButton = page.getByTestId('createOrder-button')

    this.successfulCreationPopup = page.locator('main > .popup')
    this.okButton = this.successfulCreationPopup.getByTestId('orderSuccessfullyCreated-popup-ok-button')
    this.codeSpan = this.successfulCreationPopup.locator('.notification-popup__text').nth(1)

    this.searchOrderPopup = page.getByTestId('searchOrder-popup')
    this.orderIdInputField = this.searchOrderPopup.getByTestId('searchOrder-input')
    this.trackButton = this.searchOrderPopup.getByTestId('searchOrder-submitButton')
  }

  async checkInnerComponentsVisible(): Promise<void> {
    await this.checkElementVisibility(this.statusButton)
    await expect(this.statusButton).toBeEnabled()
    await this.checkElementVisibility(this.nameField)
    await this.checkElementVisibility(this.phoneField)
    await this.checkElementVisibility(this.commentField)
    await this.checkElementVisibility(this.createOrderButton)
  }

  // condition ? true : false
  async checkCreationPopupVisible(visible = true): Promise<void> {
    expect(await this.successfulCreationPopup.getAttribute('class')).toContain(
      visible ? 'popup_opened' : 'undefined',
    )
  }

  async findOrderById(id: number): Promise<void> {
    await test.step(`Search order by ID: '${id}'`, async () => {
      await this.clickElement(this.statusButton)
      await this.fillElement(this.orderIdInputField, String(id))
      await this.clickElement(this.trackButton)
    })
  }

  async closeCreationPopup(): Promise<void> {
    await test.step('Close popup after order creation', async () => {
      await this.clickElement(this.okButton)
    })
  }

  async getOrderIdFromPopup(): Promise<number> {
    const text = await this.codeSpan.innerText() // Tracking code: 13223
    const strArray = text.split(' ')

    return Number(strArray[strArray.length-1])
  }
}
