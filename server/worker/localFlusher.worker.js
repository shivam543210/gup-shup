import redisClient from "../config/redis.js";
import { localMessageQueue } from "../queue/messageLocalQueue.js";

export async function startLocalQueueFlusher() {
  console.log("🚀 Local queue flusher started");

  while (true) {
    if (localMessageQueue.length > 0) {
      // Remove all at once
      const messages = localMessageQueue.splice(0, localMessageQueue.length);

      // Batch LPUSH to Redis
      await redisClient.lpush("queue:messages", messages.map(JSON.stringify));

      // optional: console.log
    //   console.log(`Flushed ${messages.length} messages to Redis`);
    }

    // Sleep 5–10 ms to reduce CPU usage
    await new Promise(res => setTimeout(res, 10));
  }
}
