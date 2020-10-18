

const express = require('express')
const app = express()

// const data = require('./data/persistenceAPI.json')

const axios = require('axios')

const group = 'leja2'


app.use(express.static("public"))


app.get('/APIdata', function(req, res){

	async function getData() {
	
		const response = await axios.get("http://104.248.237.179/api/dashboard/" + group +"/persistence", {
		headers: { "Access-Control-Allow-Origin": "*" }
		})

		console.log(response.data)

		res.header('Access-Control-Allow-Origin', '*')
		res.send(response.data)
	}

	getData()

})


app.listen(process.env.PORT || 5000)