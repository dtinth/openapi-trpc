import { test, expect } from '@playwright/test'
import fs from 'fs'

test('basic', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('tRPC HTTP-RPC')).toBeVisible()
  fs.mkdirSync('temp/examples', { recursive: true })
  await page.screenshot({ path: 'temp/examples/basic.png' })
})
