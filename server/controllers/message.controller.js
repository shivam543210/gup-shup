import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import {getSocketId, io} from '../socket/socket.js'
import redisClient from "../config/redis.js";
import { localMessageQueue } from "../queue/messageLocalQueue.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.receiverId;
  const message = req.body.message;
  const conversationId = req.body.conversationId;

   console.time("sendMessage");
  if (!senderId || !receiverId || !message || !conversationId) {
    return next(new errorHandler("All fields are required", 400));
  }
  // const participants = [senderId.toString(), receiverId.toString()].sort();
  // const conversationKey = participants.join("_");
// try to get conversationId from redis
//  let conversationId = await redisClient.get(`conv:${conversationKey}`);

  
  //  if(!conversationId){
  //   // find or create conversation
  //   let conversation = await Conversation.findOne({conversationKey}).lean();

  // if (!conversation) {
  //   conversation = await Conversation.create({
  //     participants: participants,
  //     conversationKey: conversationKey,
  //   });
  // }
  // conversationId = conversation._id.toString();
  // await redisClient.set(`conv:${conversationKey}`, conversationId, 'EX', 60 * 60 * 24);
  // }
  const newMessage = ({
    senderId,
    receiverId,
    message,
    conversationId: conversationId,
    createdAt: new Date().toString()
  });
  // await redisClient.lpush(`queue:messages`, JSON.stringify(newMessage));
  // //respond immediately 

//push to local queue
localMessageQueue.push(newMessage);
  //Emit socket event

  const socketId = getSocketId(receiverId);
  if (socketId) {
    io.to(socketId).emit('newMessage', newMessage);
  }
    res.status(201).json({
    success: true,
    responseData: newMessage,
  });
 
console.timeEnd("sendMessage");
  // console.log("Message sent successfully", newMessage);

 
 
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;
  const otherParticipantId = req.params.otherParticipantId;

  if (!myId || !otherParticipantId) {
    return next(new errorHandler("All fields are required", 400));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myId, otherParticipantId] },
  }).populate("messages");

  res.status(200).json({
    success: true,
    responseData: conversation,
  });
});
