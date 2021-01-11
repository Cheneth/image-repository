# Image Repository
This project consists of the backend of an image repository web app

Technologies: Node.js, Express.js, MongoDB, Tensorflow (mobilenet)

## Setup
1. Clone the repo and run `npm install`
2. Create a file called `.env` and copy the following lines into it:
```
PORT=3000
TOKEN_SECRET=ShopifyBackend2021
MONGO_URL=mongodb+srv://ethan:ethan@shopify-challenge-clust.hc8zo.mongodb.net/<dbname>?retryWrites=true&w=majority
```
3. Start the app by running `node index.js`

## Features
| Feature | Description 
| :------ | :--------
| User Authentication | User registration and login
| Password Hashing | Passwords are hashed using bcrypt before stored for user security
| Authenticated endpoints | Certain resources require an access token to use
| Search function | Search for images based on tags in an AND or an OR fashion
| Upload Images | Repository supports jpeg/jpg/png
| Like Images | Users can like images
| Authenticated Deletion | Only the owner of an image can delete it
| Machine Learning Generated Tags | When an image is uploaded

### Demo of generated tags
In the gif below, I upload a picture of a cute corgi to the repository and manually give it the tags "dog" and "cute", but after the upload the image actually has the tags [ "dog", "cute", "pembroke", "pembroke welsh corgi" ]. The tags "cute" and "pembroke" were generated using the mobilenet model and since their probability of accuracy was above 0.75, they were added as tags to the image. Admittedly, this model doesn't work very well and classifications of above 0.75 are hard to come by. Nonetheless, this feature was a fun and interesting proof of concept.

![Demo pic](https://media.giphy.com/media/6q3ukP7tUeRDff3rVX/giphy.gif)

## Demo of viewing an image

Using the imageId returned from uploading the image:

![Demo pic](https://media.giphy.com/media/VoIyMNQirsjRu7XqfM/giphy.gif)

### Example of search

Following the previous demo, let's say I uploaded another picture of a dog with the tags "dog" and "shiba". If I do an "OR" search with the terms "dog" and "shiba", I will find both images since we are looking for images that have ANY of the search terms provided.

![Demo pic](https://i.imgur.com/SwnDGUm.png)

Otherwise, if I do an "AND" search, I will only get the image of the shiba because we are looking for all images that incude ALL search terms.

![Demo pic](https://i.imgur.com/VYSoAAX.png)


## Endpoints

| Endpoint      | Authenticated | Parameters | Return | Purpose
| :------------- |:-------------| :-----| :-----| :-----|
| /register         | no            | username, password | None | Register a user
| /login            | no            | username, password | Access Token | Login a user
| /image/upload     | yes           | image file, tags as comma separated strings | imageId | Upload an image
| /image/search     | no            | searchTerms (as comma separated strings), isAnd (bool) | Array of images | Search for images based on tags
| /image/myimages   | yes           | None | Array of images | Get a user's images
| /image/view/:image       | no           | imageId (url) | Image | View any image
| /image/like      | yes           | imageId | None | Like an image
| /image/unlike | yes           | imageId | None | Unlike an image
| /image/delete | yes           | imageId | None | Delete an image

## Expansion

Ideas for expansion of this project:

* Create a "hot" page which returns the images with the largest increase in likes from the past 24 hrs
* Support pagination for all endpoints that return an array of images

## License
[MIT](https://choosealicense.com/licenses/mit/)
