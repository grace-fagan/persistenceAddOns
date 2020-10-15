var activeTime;
var toolsUsed;

var request = new XMLHttpRequest()
request.open('GET', 'https://intense-lowlands-76055.herokuapp.com/APIdata', true)


request.onload = function loadData() {

  	var res = JSON.parse(this.response)

  	var data = []
  	var idx = 0

	for(var i in res){
		data[idx] = new Object()
		data[idx].user = i
		data[idx].data = res[i]
		idx++
	}
		
  	processData(data);
  	createVis(data);

}

request.send()

function processData(data){

	var puzzle_categories = new Object();

	puzzle_categories = {
    "Sandbox" : 0,
    "One Box" : 1,
    "Separated Boxes" : 1,
    "Rotate a Pyramid" : 1,
    "Match Silhouettes" : 1,
    "Removing Objects" : 1,
    "Stretch a Ramp" : 1,
    "Max 2 Boxes" : 1,
    "Combine 2 Ramps" : 1,
    "Scaling Round Objects" : 1,
    "Square Cross-Sections" : 2,
    "Bird Fez" : 2,
    "Pi Henge" : 2,
    "45-Degree Rotations" : 2,
    "Pyramids are Strange" : 2,
    "Boxes Obscure Spheres" : 2,
    "Object Limits" : 2,
    "Not Bird" : 3,
    "Angled Silhouette" : 2,
    "Warm Up" : 2,
    "Stranger Shapes" : 3,
    "Sugar Cones" : 3,
    "Tall and Small" : 3,
    "Ramp Up and Can It" : 3,
    "More Than Meets Your Eye" : 3,
    "Unnecessary" : 3,
    "Zzz" : 3,
    "Bull Market" : 3,
    "Few Clues" : 3,
    "Orange Dance" : 3,
    "Bear Market" : 3,
    "Tetromino" : 0
	};

	data.forEach(function(d){
		
		//create active time keys
		d.AT_1_P = d.AT_1_F = d.AT_2_P = d.AT_2_F = d.AT_3_P = d.AT_3_F = d.active_time = 0

		for (var i in d.data){
			var attempt = d.data[i]
			var task_id = attempt.task_id
			if (task_id[1] == ".")
				task_id = task_id.slice(3, (task_id.length))
				attempt.task_id = task_id
			attempt.puzzle_difficulty = puzzle_categories[task_id]

			d.active_time += attempt.active_time

			//assign active time categories based on puzzle difficulty
			switch(attempt.puzzle_difficulty){
				case 1:
					switch(attempt.completed){
						case 1:
							d.AT_1_P += attempt.active_time
							break;
						case 0:
							d.AT_1_F += attempt.active_time
					}
					break;

				case 2:
					switch(attempt.completed){
						case 1:
							d.AT_2_P += attempt.active_time
							break;
						case 0:
							d.AT_2_F += attempt.active_time
					}
					break;

				case 3:
					switch(attempt.completed){
						case 1:
							d.AT_3_P += attempt.active_time
							break;
						case 0:
							d.AT_3_F += attempt.active_time
					}
			}
		}
	})

	console.log(data)

}

function createVis(data) {

	activeTime = new activeTime("active_time", data)
	toolsUsed = new toolsUsed("tools_used", data)
}