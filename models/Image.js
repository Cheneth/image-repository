const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [
        {
            type: String
        }
    ],
    likes: [
        {
            like: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    img: {
        type: Buffer,
        required: true
    },
    content_type: {
        type: String,
        required: true
    }
})

const Image = mongoose.model("Image", ImageSchema)
module.exports = Image
