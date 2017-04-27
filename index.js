var app = require('express')();
var bodyParser = require('body-parser');
var port = process.env.PORT || 7777;
var mongojs = require('./database');
var db = mongojs.connect;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', function (req, res) 
	{	
		res.send('<h1>ToDoList Api v1.0.0 </h1>');
	});

app.get('/api/v1/alltask', function (req, res) 
	{
		db.tasklist.count(function(err, result) 
			{
			if (result <= 0) 
				{
				res.send('<h1>No Task</h1>');
				db.tasklist.ensureIndex( { name: 1 }, { unique: true } ) 
				} 
			else 
				{ 
				db.tasklist.find(function(err, docs) 
					{
					var alltask = eval(docs);
					var htmlText = '';
					for ( var key in alltask ) 
						{
						htmlText += '<div class="div-conatiner">';
						htmlText += '<h1 class="taskname">'+ alltask[key].name +'</h1>';
						htmlText += '<p class="taskdesc">description: ' + alltask[key].description + '</p>';
						var cfont
						if(alltask[key].status == 'pending')cfont='red';
						else cfont='green';
						htmlText += '<p class="status"> status: '+'<font color="'+cfont+'">'+alltask[key].status+'</font></p>';
						htmlText += '<p> </p>';
           				htmlText += '</div>';
						}
					res.send(htmlText);
					});
				}
			});
	});
app.get('/api/v1/task/:tname', function (req, res) 
	{
		var tname = req.params.tname;
		db.tasklist.findOne({name: tname}, function(err, docs) 
			{
			if(err){res.send(err);}
			else
				{
				var singletask = eval(docs);
				if(singletask == null)res.send(tname+' is not exist in tasklist');
				else
					{
					var htmlText = '<div class="div-conatiner">';
					htmlText += '<h1 class="taskname">'+ singletask.name +'</h1>';
					htmlText += '<p class="taskdesc">description: ' + singletask.description + '</p>';
					var cfont
						if(singletask.status == 'pending')cfont='red';
						else cfont='green';
					htmlText += '<p class="status"> status: '+'<font color="'+cfont+'">'+singletask.status+'</font></p>';
					htmlText += '<p> </p>';
           			htmlText += '</div>';
					res.send(htmlText);
					}
				}
			});
	});

app.post('/api/v1/newtask', function (req, res) 
	{
		db.tasklist.count(function(err, result) 
			{
			if(err){res.send(err)}
			else
				{	 
				if (result <= 0) 
					{	
					db.tasklist.ensureIndex( { name: 1 }, { unique: true } );
					}
				}
			});
		var json = req.body;
		if (json.name==null)res.send('Add Task incomplete please input taskname');
		else{
		db.tasklist.insert(json, function(err, docs) 
			{
			if(err)res.send(err);
			else 
				{
				
				
					db.tasklist.findAndModify({
    				query: json,
    				update: { $set: {status : 'pending'} },
    				new: true}, function(err, doc, lastErrorObject) 
						{
						if(err)res.send(err);
        				});


					
				res.send('Add Task : ' + docs.name + ' Completed!');
				}
			});}
	});

app.put('/api/v1/task/:tname/edit', function (req, res) 
	{
		var prejson
		var tname = req.params.tname; 
		db.tasklist.findOne({name: tname}, function(err, docs) 
			{
				if(err)res.send(err);
				else
					{
					if(docs == null)res.send(tname+' is not exist in tasklist');
					else 
						{
						var json = req.body;
						json.status = docs.status;
						db.tasklist.findAndModify({
						query: docs,
						update: { $set: json },
						new: true}, function(err, doc, lastErrorObject) 
							{
						if(err)res.send(err);
						 else res.send('Update Completed!');
							});
						}
					}
			});
	});
app.delete('/api/v1/task/:tname/delete', function (req, res) 
	{
		var tname = req.params.tname;
		db.tasklist.findOne({name: tname}, function(err, docs) 
			{
			if(err)res.send(err);
   			else
				{
				if(docs == null)res.send(tname+' is not exist in tasklist');
				else 
					{
					db.tasklist.remove(docs, function(err, doc) {res.send('Remove Completed!');});
					}
				}
			});
	});

app.put('/api/v1/task/:tname/set-done', function (req, res) 
	{
		var prejson
		var tname = req.params.tname; 
		db.tasklist.findOne({name: tname}, function(err, docs) 
			{
			if(docs == null)res.send(tname+' is not exist in tasklist');
			else {
			var json = {"status" : "done"}
			db.tasklist.findAndModify({
			query: docs,
			update: { $set: json },
			new: true}, function(err, doc, lastErrorObject) 
				{
				res.send(doc.name+' is done');
				});}
	
			});
	});

app.put('/api/v1/task/:tname/set-pending', function (req, res) 
	{
		var prejson
		var tname = req.params.tname; 
		db.tasklist.findOne({name: tname}, function(err, docs) 
			{
			if(docs == null)res.send(tname+' is not exist in tasklist');
			else {
			var json = {"status" : "pending"}
			db.tasklist.findAndModify({
			query: docs,
			update: { $set: json },
			new: true}, function(err, doc, lastErrorObject) 
				{
				res.send(doc.name+' is pending');
				});}
			});
	});

app.listen(port, function() 
	{
		console.log('Starting node.js on port ' + port);
	});