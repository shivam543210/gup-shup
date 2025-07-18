import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
     conversationKey: {
    type: String,
    unique: true,     // optional, but recommended to avoid duplicate conversations
    index: true
  },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
