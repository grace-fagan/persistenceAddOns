	data.forEach(function(d){
		
		//create active time keys
		d.active_time = 0
		d["AT_1"] = [0,0]
		d["AT_2"] = [0,0]
		d["AT_3"] = [0,0]

		for (var i in d.data){
			var attempt = d.data[i]
			var task_id = attempt.task_id
			if (task_id[1] == ".")
				task_id = task_id.slice(3, (task_id.length))
				attempt.task_id = task_id
			attempt.puzzle_difficulty = puzzle_categories[task_id]

			d.active_time += attempt.active_time

			var diff = attempt.puzzle_difficulty.toString();

			switch(attempt.completed){
				case 1:
					d["AT_" + diff][0] += attempt.active_time
					break;
				case 0:
					d["AT_" + diff][1] += attempt.active_time
			}

		}
	})
}