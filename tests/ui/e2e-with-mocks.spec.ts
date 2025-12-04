import { expect, test } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page'
import { SERVICE_URL } from '../../config/env-data'

const jwt =
  'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhbmRyZWlrcm0iLCJleHAiOjE3NjQ2MjY5NDMsImlhdCI6MTc2NDYwODk0M30.qY5NsWSqtybtpPCfwFtvwU66BHEupsapz8o_vONaB3s0POp26lvbaKdhYLeO3m_nrNePiYhmCGl2z0PWgZ228w'

test('TL-22-1 signIn with mocks', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const orderPage = new OrderPage(page)
  await loginPage.mockAuth()
  await loginPage.open()
  await loginPage.usernameField.fill('test')
  await loginPage.passwordField.fill('test1234')
  await loginPage.signInButton.click()
  await orderPage.checkElementVisibility(orderPage.trackButton)
})

test('TL-22-2 create and find order with mocks', async ({ context }) => {
  const newOrder = {
    status: 'OPEN',
    courierId: null,
    customerName: 'customerName',
    customerPhone: 'customerPhone',
    comment: 'comment',
    id: 100,
  }
  await context.addInitScript((token) => {
    localStorage.setItem('jwt', token)
  }, jwt)
  const page = await context.newPage()
  const loginPage = new LoginPage(page)
  const orderPage = new OrderPage(page)
  const foundPage = new FoundPage(page)
  await loginPage.open()

  await orderPage.nameField.fill(newOrder.customerName)
  await orderPage.phoneField.fill(newOrder.customerPhone)
  await orderPage.commentField.fill(newOrder.comment)
  await page.route('**/orders', async (route) => {
    await route.fulfill({
      status: 200,
      json: newOrder,
    })
  })
  const createOrderResponse = page.waitForResponse('**/orders')
  await orderPage.createOrderButton.click()
  await createOrderResponse
  await orderPage.checkElementVisibility(orderPage.successfulCreationPopup)
  expect(await orderPage.getOrderIdFromPopup()).toBe(newOrder.id)
  await orderPage.okButton.click()
  await orderPage.statusButton.click()
  await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id))

  await page.route('**/orders/*', async (route) => {
    await route.fulfill({
      status: 200,
      json: newOrder,
    })
  })
  const trackOrderResponse = page.waitForResponse('**/orders/*')
  await orderPage.trackButton.click()
  await trackOrderResponse
  expect(await foundPage.orderName.innerText()).toBe(newOrder.customerName)
})
