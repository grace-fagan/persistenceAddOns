

const express = require('express')
const app = express()

// const data = require('./data/persistenceAPI.json')

const axios = require('axios')

app.use(express.static("public"))


app.get('/APIdata/:group', function(req, res){

	console.log("group:", req.params['group'])
	const group = req.params['group']

	async function getData() {
	
		const response = await axios.get("http://104.248.237.179/api/dashboard/" + group + "/persistence", {
		headers: { "Access-Control-Allow-Origin": "*" }
		})

		// console.log("data we want", response.data)

		res.header('Access-Control-Allow-Origin', '*')
		res.send(response.data)
	}

	getData()

})

const port = process.env.PORT || 5000

app.listen(port, function(err){ 
    if (err) console.log("Error in server setup") 
    console.log("Server listening on Port", port); 
}) 