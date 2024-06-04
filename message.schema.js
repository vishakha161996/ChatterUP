import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({

    name: String,
    userImage: String,
    message: String,
    dateTime: {
        type: Date,
        default: Date.now
    }
});

export const messageModel = mongoose.model('Message', messageSchema);
