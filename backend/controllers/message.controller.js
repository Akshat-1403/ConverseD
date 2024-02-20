import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in send message controller: ", error.message)
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessage = async (req, res) => {
    try {

        const { id: userToChatId } = req.params.id;
        const senderId = req.body._id;
        
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");

        // // idhar console log ho rha hai
        // res.status(200).json(conversation.messages);
        // // Yaha control nhi phuch rha

        if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
    } catch (error) {
        console.log("Error in get message controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};