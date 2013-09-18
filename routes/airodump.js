var csv = require('csv'),
    ejs = require('ejs'),
    fs = require('fs'),
    networkTableTemplate = fs.readFileSync(__dirname + '/../views/networksTable.ejs', 'utf8'); 

var outputFileName = '/tmp/aircrack-web/aircrack.csv',
    PIDFileName = '/tmp/aircrack-web/aircrack.pid';

exports.hopListRender = function(req, res){
	listAvailableNetworks(function(networks){
		res.render('airodump', { title: 'Network list' });
	});
}


exports.hopList = function(req, res){
	listAvailableNetworks(function(networks){
		res.send(ejs.render(networkTableTemplate, { data: networks }));
	});
}

exports.channelList = function(req, res){
	res.render('airodump', { title: 'Network list on channel #' });
};


function listAvailableNetworks(next){
	var networks = [];
	var clients =[];

	foundSplitIndex = false;
	splitIndex = 0;
	
	csv()
	.from.path(hopListFileName, { delimiter: ',', escape: '"' })
	.to.array(function(data, count){
		if(!foundSplitIndex)
			console.log('Split index not found!');
		
		networks = data.slice(0, splitIndex);
		clients = data.slice(splitIndex);

		var model = new Object();
		model.networks = networks;
		model.clients = clients;

		next(model);
	})
	.transform(function(row) {
		if(!foundSplitIndex)
		{
			if(row[0].indexOf('Station MAC') != -1)
			{
				foundSplitIndex = true;
			}
			else
			{
				splitIndex++;
			}
		}
		return row.map(function(val){
			return val.trim();
		});
	});
};
