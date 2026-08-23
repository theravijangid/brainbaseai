import { Router } from 'express'
import express from 'express'
import { razorpayWebhookHandler } from '../controllers/webhook.controller'

const router = Router()

// Need to use express.raw to preserve the exact payload for signature verification
router.post('/razorpay', express.raw({ type: 'application/json' }), razorpayWebhookHandler)

export default router
