const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const upload = multer({
    fileFilter: (req, file, cb) => {
        console.log(file.mimetype);
        acceptedTypes = ["image/gif", "image/jpeg", "image/png"];
        if (acceptedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Please use one of the following file types for your image: gif, jpeg, png"), false);
        }
    }
});

// ML
const mobilenet = require('@tensorflow-models/mobilenet');
const tfnode = require('@tensorflow/tfjs-node');
// Middleware
const authentication = require("../middleware/authentication");

// Models
const Image = require("../models/Image");
const User = require("../models/User");

async function classify(image) {
    const mobilenetModel = await mobilenet.load();
    const predictions = await mobilenetModel.classify(image);
    console.log('Classification Results:', predictions);
    return predictions;
}

async function generateTags(imageId, image) {
    let results = await classify(tfnode.node.decodeImage(image));
    let generatedTags = []
    results.map((x) => {
        if (x.probability >= 0.75) {
            let classTags = []
            classTags.push(x.className)
            classTags = x.className.toLowerCase().split(",")
            classTags = classTags.map((tag) => tag.trim())
            console.log(classTags)
            generatedTags = generatedTags.concat(classTags)
        }
    })
    console.log(generatedTags)
    Image.findOne({_id: imageId}).then((image) => {
        generatedTags.map((x) => {
            image.tags.addToSet(x)
        })
        image.save().then((updated) => {
            console.log("updated:", updated);
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
}

// Upload images
// Params: image of type "image/gif", "image/jpeg", "image/png", tags as comma separated strings
// Return: id of uploaded image
router.post("/image/upload", authentication.authenticate, upload.single("image"), (req, res) => {
    let tags = []
    if (req.body.tags) {
        tags = req.body.tags.toLowerCase().split(",");
        tags = tags.map((tag) => tag.trim())
    }
    User.findOne({username: req.user.id}).then((user) => {
        let newImage = new Image({owner: user.id, tags: tags, img: req.file.buffer, content_type: req.file.mimetype});
        newImage.save().then((img) => {
            console.log("Saved image", img);
            generateTags(img._id, req.file.buffer)
            return res.status(200).send("Image uploaded: " + img._id);
        }).catch((err) => {
            console.log(err);
            return res.status(400).send("Error uploading image, please try again");
        });
    }).catch((err) => {
        console.log(err);
        return res.status(400).send("Error, please attach an image");
    });
});

// Search images based on space separated keywords
// Params: searchTerms (as comma separated strings), isAnd (bool)
// Return: Array of images
router.get("/image/search", authentication.authenticate, (req, res) => { // TODO
    if (req.body.isAnd == null) {
        return res.status(400).send("Error, please include a boolean value for the parameter 'isAnd' to specify whether the search method should be OR or AND.")
    }
    let searchTerms = []
    if (req.body.searchTerms) {
        searchTerms = req.body.searchTerms.toLowerCase().split(",");
        searchTerms = searchTerms.map((term) => term.trim())
    }
    if (req.body.isAnd == true) {
        Image.find({
            tags: {
                $all: searchTerms
            }
        }).select('-img').then((images) => {
            console.log(images)
            return res.status(200).send(images)
        }).catch((err) => {
            console.log(err)
            return res.sendStatus(500)
        })
    } else if (req.body.isAnd == false) {
        Image.find({
            tags: {
                $in: searchTerms
            }
        }).select('-img').then((images) => {
            console.log(images)
            return res.status(200).send(images)
        }).catch((err) => {
            console.log(err)
            return res.sendStatus(500)
        })
    }
});

// Images of user
// Params: None
// Return: Array of images without the binary
router.get("/image/myimages", authentication.authenticate, (req, res) => {
    console.log(req.user.id);
    User.findOne({username: req.user.id}).then((user) => {
        Image.find({owner: user.id}).select("-img").then((images) => {
            console.log(images);
            return res.status(200).send(images);
        }).catch((err) => {
            console.log(err);
            return res.sendStatus(500);
        });
    }).catch((err) => {
        console.log(err);
        return res.status(400).send("Error, user does not exist");
    });
});

// View an image
// Params: imageId
// Return: Image file
router.get("/image/view", authentication.authenticate, (req, res) => {
    if (!req.body.imageId) {
        return res.status(400).send("Error getting image, please include imageId in the body of your request");
    }

    Image.findOne({_id: req.body.imageId}).then((image) => {
        console.log(image);
        res.type(image.content_type);
        return res.status(200).send(image.img);
    }).catch((err) => {
        console.log(err);
        return res.status(404).send("Error getting image, image does not exist");
    });
});

// Like an image
// Params: imageId
// Return: None
router.post("/image/like", authentication.authenticate, (req, res) => {
    if (!req.body.imageId) {
        return res.status(400).send("Error liking image, please include imageId in the body of your request");
    }
    User.findOne({username: req.user.id}).then((user) => {
        Image.findOne({_id: req.body.imageId}).select("likes").then((image) => {
            console.log(image);
            image.likes.addToSet(mongoose.Types.ObjectId(user._id));
            image.save().then((updated) => {
                console.log("updated:", updated);
            }).catch((err) => {
                console.log(err);
            });
            return res.status(200).send("Image liked");
        }).catch((err) => {
            console.log(err);
            return res.status(400).send("Error liking image");
        });
    }).catch((err) => {
        console.log(err);
        return res.status(400).send("Error, user does not exist");
    });
});

// Unlike an image
// Params: imageId
// Return: None
router.post("/image/unlike", authentication.authenticate, (req, res) => {
    if (!req.body.imageId) {
        return res.status(400).send("Error unliking image, please include imageId in the body of your request");
    }
    User.findOne({username: req.user.id}).then((user) => {
        Image.findOne({_id: req.body.imageId}).select("likes").then((image) => {
            console.log(image);
            image.likes.pull(mongoose.Types.ObjectId(user._id));
            image.save().then((updated) => {
                console.log("updated:", updated);
            }).catch((err) => {
                console.log(err);
            });
            return res.status(200).send("Image unliked");
        }).catch((err) => {
            console.log(err);
            return res.status(400).send("Error unliking image");
        });
    }).catch((err) => {
        console.log(err);
        return res.status(400).send("Error, user does not exist");
    });
});

// Delete an image
// Params: imageId
// Return: None
router.get("/image/delete", authentication.authenticate, (req, res) => {
    if (!req.body.imageId) {
        return res.status(400).send("Error deleting image, please include imageId in the body of your request");
    }
    User.findOne({username: req.user.id}).then((user) => {
        Image.findOne({_id: req.body.imageId}).select("owner").then((image) => {
            if (user._id.equals(image.owner)) {
                Image.deleteOne({_id: req.body.imageId}).then(() => {
                    return res.status(200).send("Image deleted");
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).send("Error deleting image");
                });
            } else {
                return res.status(403).send("You are not the owner of this image");
            }
        }).catch((err) => {
            console.log(err);
            return res.status(404).send("Error deleting image, image does not exist");
        });
    }).catch((err) => {
        console.log(err);
        return res.status(400).send("Error, user does not exist");
    });
});

module.exports = router;
