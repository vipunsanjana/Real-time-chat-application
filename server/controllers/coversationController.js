const Conversations = require('../models/conversations');
const Users = require('../models/users');

const createConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversations({ members: [senderId, receiverId] });
        await newConversation.save();
        res.status(200).send('Conversation created successfully');
    } catch (error) {
        console.log(error, 'Error');
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversations.find({ members: { $in: [userId] } });
        const conversationUserData = await Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await Users.findById(receiverId);
            return { user: { receiverId: user._id, email: user.email, fullName: user.fullName }, conversationId: conversation._id };
        }));
        res.status(200).json(conversationUserData);
    } catch (error) {
        console.log(error, 'Error');
    }
};

module.exports = {
    createConversation,
    getConversations
};
