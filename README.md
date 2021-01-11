# Image Repository
This project consists of the backend of an image repository web app

Technologies: Node.js, Express.js, MongoDB (mongoose), JWT, bcrypt, Tensorflow (mobilenet)

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
| Authenticated Deletion | Only the owner of an image can delete it
| Machine Learning Generated Tags | When an image is uploaded

### Example of Generated Tags
![Alt text](https://imgur.com/iJ9ajPi.gif)

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

## License
[MIT](https://choosealicense.com/licenses/mit/)