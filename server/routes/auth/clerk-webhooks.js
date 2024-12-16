// server/routes/auth/clerk-webhooks.js
import express from 'express';
import { Webhook } from 'svix';
import { ClerkController } from '../../controllers/auth/clerk-controller.js';

const router = express.Router();

const webhookSecret = process.env.WEBHOOK_SECRET;

// Helper to parse the raw body
const getRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

router.post('/clerk', async (req, res) => {
  try {
    const payload = await getRawBody(req);
    const headerPayload = req.headers;
    const svixId = headerPayload['svix-id'];
    const svixTimestamp = headerPayload['svix-timestamp'];
    const svixSignature = headerPayload['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    const { type, data } = evt;

    let result;
    switch (type) {
      case 'user.created':
        result = await ClerkController.handleUserCreated(data);
        break;
      case 'user.updated':
        result = await ClerkController.handleUserUpdated(data);
        break;
      case 'user.deleted':
        result = await ClerkController.handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
        return res.status(400).json({ error: 'Unhandled webhook type' });
    }

    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;