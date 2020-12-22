var activeTime;
var toolsUsed;

var url = window.location

function selectGroup(group){

	var request = new XMLHttpRequest()
	request.open('GET', url + 'APIdata/' + group, true)

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
			
	  	data = processData(data);
	  	createVis(data);

	}

	request.send()

}

function processData(data){

	new_data = []

	var puzzle_categories = new Object();

	puzzle_categories = {
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
    "Angled Silhouette" : 2,
    "Warm Up" : 2,
    "Not Bird" : 3,
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
	};

	data.forEach(function(d){

		//create keys
		d.AT_1_P = d.AT_1_F = d.AT_2_P = d.AT_2_F = d.AT_3_P = d.AT_3_F = d.active_time = d.num_failed_att = d.num_failed_puzz = d.reattempts_AF = 0
		d.byPuzzle = []

		//add puzzle difficulty and active time by category metrics
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

		var failed_puzzles = []
		
		//Reattempts after failure
		for (var i in d.data){
			var attempt = d.data[i]
			if (failed_puzzles.includes(attempt.task_id)) {
				if (attempt.completed == 1) {
					d.data[i].reattempt_AF = 1;
					d.reattempts_AF ++;
					//remove from failed puzzles array
					failed_puzzles.splice(failed_puzzles.indexOf(attempt.task_id), 1);
				} else {
					d.data[i].reattempt_AF = 1;
					d.num_failed_att ++;
					d.reattempts_AF ++;
				}
			} else {
				if (attempt.completed == 1) {
					d.data[i].reattempt_AF = 0;
					continue;
				} else {
					d.data[i].reattempt_AF = 0;
					d.num_failed_att ++;
					d.num_failed_puzz ++;
					failed_puzzles.push(attempt.task_id)
				}
			}
		}

		//populate byPuzzle array (individual student view)
		Object.keys(puzzle_categories).forEach(function(p){
			var puzzle = new Object()
			puzzle["task_id"] = p
			puzzle["fails"] = 0
			puzzle["reattempts_AF"] = 0
			puzzleArray = d.byPuzzle
			puzzleArray.push(puzzle)
		})

		d.data.forEach(function(a){
			var task_id = a.task_id

			for (var i in d.byPuzzle){
				if (d.byPuzzle[i].task_id == task_id) {
					if (a.completed == 0){
						d.byPuzzle[i].fails ++;
					}

					d.byPuzzle[i].reattempts_AF += a.reattempt_AF;
				}
			}
		})
	})

	byPuzzle = []
	Object.keys(puzzle_categories).forEach(function(d){
		var puzzle = new Object()
		puzzle["task_id"] = d
		puzzle["fails"] = 0
		puzzle["reattempts_AF"] = 0
		byPuzzle.push(puzzle)
	})

	//populate byPuzzle array (class view)
	data.forEach(function(d){
		for (var i in d.data){
			var attempt = d.data[i]
			var task_id = attempt.task_id

			for (var i in byPuzzle){
				if (byPuzzle[i].task_id == task_id) {
					if (attempt.completed == 0){
						byPuzzle[i].fails ++;
					}

					byPuzzle[i].reattempts_AF += attempt.reattempt_AF;
				}
			}
		}
	})

	new_data.push(data)
	new_data.push(byPuzzle)

	return new_data;
}

function createVis(data) {

	var vis = initVis(data);

}