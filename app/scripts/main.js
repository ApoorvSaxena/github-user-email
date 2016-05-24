'use strict';

var Github = {
	getEvents: function (username) {
		return $.ajax({
			url: 'https://api.github.com/users/' + username + '/events/public'
		});
	},
	getProfile: function (username) {
		return $.ajax({
			url: 'https://api.github.com/users/' + username
		});
	}
}

var app = {
	init: function () {
		$('input').focus();
		this.addEventListeners();
	},
	addEventListeners: function () {
		var self = this;
		$('#github-form').submit(function (e) {
			var input = $(this).find('input').val();
			var username = self.getUsername(input);
			$('#progress-bar').removeClass('hide');
			$.when(
				self.processEvents(username),
				self.processProfile(username)
			).done(function () {
				var emails = _.uniq(_.flatten(arguments));
				self.render(emails);
				$('#progress-bar').addClass('hide');
			});
			return false;
		})
	},
	getUsername: function (input) {
		if (input.match('github.com')) {
			return input.split('github.com/')[1].split('/')[0];
		} else {
			return input;
		}
	},
	processEvents: function (username) {
		var self = this;
		return Github
			.getEvents(username)
			.then(function (data) {
				var emails = self.parseAndFilterEmails(data);
				return emails;
			});
	},
	processProfile: function (username) {
		var self = this;
		return Github
			.getProfile(username)
			.then(function (data) {
				return [data.email];
			});
	},
	parseAndFilterEmails: function (data) {
		var emails = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].type === 'PushEvent') {
				try {
					emails.push(data[i].payload.commits[0].author.email);
				} catch (e) {}
			}
		}
		return _.uniq(emails);
	},
	render: function (emails) {
		$('.result').removeClass('hide');
		var listEl = $('.emails-list');
		listEl.html('');
		for (var i = 0; i < emails.length; i++) {
			if (emails[i] && emails[i].length > 1) {
				listEl.append('<li>' + emails[i] + '</li>');
			}
		}
	}
}

app.init();