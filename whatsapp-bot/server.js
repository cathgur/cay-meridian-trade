import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v23.0';

app.get('/', (_req, res) => {
  res.json({ service: 'Cay Meridian Trade WhatsApp Bot', status: 'online' });
});

// Meta uses this endpoint to verify the webhook during setup.
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Meta sends incoming WhatsApp messages here.
app.post('/webhook', async (req, res) => {
  // Acknowledge immediately so Meta does not retry the event.
  res.sendStatus(200);

  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;

    const from = message.from;
    const text = message.text?.body?.trim();
    if (!from || !text) return;

    const reply = buildReply(text);
    if (reply) await sendWhatsAppMessage(from, reply);
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
});

function buildReply(text) {
  const input = text.toLowerCase();

  if (/^(hi|hello|hey|start|menu|help)\b/.test(input)) {
    return `👋 Welcome to Cay Meridian Trade!\n\n🇨🇳 China → 🇿🇦 Southern Africa\n\nHow can we help you today?\n\n1️⃣ Product sourcing\n2️⃣ Supplier sourcing\n3️⃣ Procurement\n4️⃣ Shipping & logistics\n5️⃣ Existing order\n6️⃣ Speak to a consultant\n\nReply with a number or tell me what you need.`;
  }

  if (input === '1' || input.includes('product sourcing')) {
    return `📦 Product Sourcing\n\nGreat! Tell us:\n• What product are you looking for?\n• Approximate quantity?\n• Any specifications, brand, size or colour?\n• Do you have a photo or product link?\n\nSend the details here and we'll take it from there.`;
  }

  if (input === '2' || input.includes('supplier sourcing')) {
    return `🔎 Supplier Sourcing\n\nTell us what product or business item you need a supplier for, plus your approximate quantity and any requirements you have.`;
  }

  if (input === '3' || input.includes('procurement')) {
    return `🛒 Procurement\n\nSend us the product details, quantity and any supplier information you already have. We'll help coordinate the purchase.`;
  }

  if (input === '4' || input.includes('shipping') || input.includes('logistics')) {
    return `🚢 Shipping & Logistics\n\nTell us what you're shipping, the approximate quantity/volume, and the destination in Southern Africa. A consultant can then advise on the next step.`;
  }

  if (input === '5' || input.includes('existing order')) {
    return `📋 Existing Order\n\nPlease send your order/reference number and the name used for the order. A consultant will assist you.`;
  }

  if (input === '6' || input.includes('consultant') || input.includes('human')) {
    return `👩🏽‍💼 No problem. A Cay Meridian Trade consultant will assist you.\n\nPlease briefly tell us what you need help with, and we'll continue from there.`;
  }

  return `Thanks for contacting Cay Meridian Trade. 😊\n\nI can help with:\n1️⃣ Product sourcing\n2️⃣ Supplier sourcing\n3️⃣ Procurement\n4️⃣ Shipping & logistics\n5️⃣ Existing order\n6️⃣ Speak to a consultant\n\nReply with a number or type *menu*.`;
}

async function sendWhatsAppMessage(to, body) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log('WhatsApp credentials are not configured yet. Message would be:', { to, body });
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body }
      })
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp API error ${response.status}: ${details}`);
  }
}

app.listen(PORT, () => {
  console.log(`Cay Meridian WhatsApp bot listening on port ${PORT}`);
});
