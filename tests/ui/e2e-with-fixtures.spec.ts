import { test } from '../fixtures/basePage.fixture';
import { expect } from '@playwright/test'

test.beforeEach(async ({ context, auth, orderPage }) => {
  await context.addInitScript((token) => {
    localStorage.setItem('jwt', token)
  }, auth.jwt);
  await orderPage.open()
})

const newOrder = {
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  comment: 'comment'
}

test('TL-23-1 Create order using fixtures auth', async ({ orderPage }) => {
  await orderPage.nameField.fill(newOrder.customerName)
  await orderPage.phoneField.fill(newOrder.customerPhone)
  await orderPage.commentField.fill(newOrder.comment)
  const createOrderResponse = orderPage.page.waitForResponse('**/orders')
  await orderPage.createOrderButton.click()
  await createOrderResponse
  await orderPage.checkElementVisibility(orderPage.successfulCreationPopup)
})

test('TL-23-2 Find created order using fixtures auth and order create in delivery status', async ({ orderId, orderPage, foundPage }) => {
  await orderPage.statusButton.click()
  await orderPage.fillElement(orderPage.orderIdInputField, orderId)
  const trackOrderResponse = orderPage.page.waitForResponse('**/orders/*')
  await orderPage.trackButton.click()
  await trackOrderResponse
  expect(await foundPage.orderName.innerText()).toBe(newOrder.customerName)
})