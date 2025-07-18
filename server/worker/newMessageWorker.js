import redisClient from "../config/redis.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

export async function processQueue() {
  console.log("🚀 Worker started");
  while (true) {
    // RPOP multiple messages
    const batch = [];
    for (let i = 0; i < 20; i++) {
      const msgJson = await redisClient.rpop('queue:messages');
      if (!msgJson) break;
      batch.push(JSON.parse(msgJson));
    }

    if (batch.length > 0) {
      console.log(`Processing batch of ${batch.length} messages`);
      try {
        // Insert all at once
        const savedMsgs = await Message.insertMany(batch.map(m => ({
          senderId: m.senderId,
          receiverId: m.receiverId,
          message: m.message,
          createdAt: m.createdAt
        })));

        // Update conversations in parallel
        await Promise.all(batch.map((msg, i) =>
          Conversation.updateOne(
            { _id: msg.conversationId },
            { $push: { messages: savedMsgs[i]._id } }
          )
        ));
      } catch (err) {
        console.error("Worker error:", err);
      }
    } else {
      // nothing to do, sleep
      await new Promise(res => setTimeout(res, 10));
    }
  }
}
 