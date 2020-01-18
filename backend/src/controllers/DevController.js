const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {

    async index(request, response) {
        const devs = await Dev.find();

        return response.json(devs);
    },

    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ github_username });
        if (!dev) {
          
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`, {validateStatus: false});
            if (apiResponse.status != 404) {
                 
                const { name = login, bio, avatar_url } = apiResponse.data;
                const techsArray = parseStringAsArray(techs);
            
                const location = {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                };
            
                dev = await Dev.create({
                    github_username,
                    name,
                    bio,
                    avatar_url,
                    techs: techsArray,
                    location
                })  

                // Filter conexões que estão há no máximo 10 km de distancia e que o novo deve tenha uma das techs
                const sendSocketMessageTo = findConnections({latitude,longitude}, techsArray);
                sendMessage(sendSocketMessageTo, 'new-dev', dev);

            }
        }
    
        return response.json(dev);
    }, 

    async udpate(req, res) {

    },

    async delete(req, res) {
        
    }
};