// var fs = require('fs');
// var csvFile = fs.readFileSync("friend_list.csv","utf8");
// var csv_data = csvParse(csvFile);
// console.log(csvParse(csvFile));
// function csvParse(file){
// 	var contact= file.split('\n');
// 	for (var i =1; i< contact.length;i++){
// 		var info = contact[i].split(',');
// 		var num=0;
// 		var contactArray=[];
// 		var obj = {
// 			firstName: info[0],
// 			lastName: info[1],
// 			numMonthsSinceContact: info[2],
// 			emailAddress: info[3]
// 		};
// 		contactArray[num]=obj;
// 		num++;
// 	}
// 	return contactArray;
// }

var fs = require('fs');
var ejs = require('ejs');


var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');
var tumblr = require('tumblr.js');

var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  consumer_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
  token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  token_secret: 'xxxxxxxxxxxxxxxxxxxxxx'
});


var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('xxxxxxxxxxxxxxxxxxxxxxxx');

function csvParse(csvFile){
    var arrayOfObjects = [];
    var arr = csvFile.split("\n");
    var newObj;

    keys = arr.shift().split(",");

    arr.forEach(function(contact){
        contact = contact.split(",");
        newObj = {};

        for(var i =0; i < contact.length; i++){
            newObj[keys[i]] = contact[i];
        }

        arrayOfObjects.push(newObj);

    })

    return arrayOfObjects;
}

var friendList = csvParse(csvFile);


client.posts('yoshithecorgi.tumblr.com', function(err, blog){
	//create an array of objects that each has a recent post link and the title.
	var latestPosts=[];
	for(var i=0; i< blog.posts.length;i++){
		var postDate = new Date(blog.posts[i].date);
		var diff = (Date.now()-postDate.getTime())/86400000;//date difference
		if (diff <30) latestPosts.push({href: blog.posts[i].post_url,title:blog.posts[i].title});
	}

	//customize emails for each contact on the friend_list.csv
	friendList.forEach(function(row){
		var obj = {
			firstName:row.firstName,
			numMonthsSinceContact:row.numMonthsSinceContact,
			latestPosts:latestPosts}
		var copyTemplate = emailTemplate;
		var customizedEmail = ejs.render(copyTemplate, obj);

		//Send out the email 
		sendEmail(row.firstName, row.emailAddress, 'Stella Zhao','tmrvivian@gmail.com','Stay in Touch',customizedEmail);
	});
});


function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
}