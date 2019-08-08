import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { Login } from '../login';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

	model = new Login('', '', false); //email, password, remember_me
	// let userModel = {"name":"","email":""}; //name and email

	submitted = false;


	onSubmit() { 
		try {

			fetch('http://localhost:8000/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type' : 'application/json'
				},
				body : JSON.stringify(this.model)
			})
			.then(response => response.json())
			.then((data) => {
				console.log(data)
				if(typeof data.access_token !== 'undefined') { 
					//check for remember_me
					if(this.model.remember_me) {
						let expires;
						let cookieName = 'authorization';
						let date = new Date(data.expires_at);
						expires = "; expires=" + date.toUTCString();
						document.cookie = cookieName + "=" + data.token_type + " " 
						+ data.access_token + expires + "; path=/";
					}
					sessionStorage.setItem('authorization', data.token_type + " "
						+ data.access_token);


					this.submitted = true;


				} else {
					throw "No access to you!";
				}
			})
			.catch(error => console.error(error));	
		} catch (error) {
			console.error(error);
		}
	 }
	 getUserDetails(authToken) {
		fetch('http://localhost:8000/api/auth/user', {
			headers : {
				'Authorization' : authToken
			}
		})
		.then(response => response.json())
		.then((data) => {
			if(typeof sessionStorage.getItem('authorization') !== 'undefined'){
				sessionStorage.setItem('authorization', authToken);
			}
			this.model.email = data.email;
			this.submitted = true;
		})
		.catch(error => console.error('There was some error'));	
	 }

	ngOnInit(){
		let authToken;
		if(typeof sessionStorage.getItem('authorization') !== 'undefined' &&
			sessionStorage.getItem('authorization') !== null){
			authToken = sessionStorage.getItem('authorization');

		} else if(typeof this.getCookie('authorization') !== 'undefined' &&
			this.getCookie('authorization') !== null) {
			authToken = this.getCookie('authorization');
		}

			console.log(authToken);
		if(typeof authToken !== 'undefined') {
			this.getUserDetails(authToken);
		}
	}
	logOut() {
		if(typeof sessionStorage.getItem('authorization') !== 'undefined') {
			fetch('http://localhost:8000/api/auth/logout', {
				headers : {
					'Authorization' : sessionStorage.getItem('authorization')
				}
			})
			.then(response => response.json())
			.then((data) => {
				if(typeof sessionStorage.getItem('authorization') !== 'undefined'){
					sessionStorage.removeItem('authorization');
				}
				if(typeof this.getCookie('authorization') !== 'undefined') {
					document.cookie = 'authorization=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				}

				this.submitted = false;
				console.log("logged out!");
			})
			.catch(error => console.error('There was some error'));				
		}		
	}
	getCookie(cname) {

	  var name = cname + "=";
	  var decodedCookie = decodeURIComponent(document.cookie);
	  var ca = decodedCookie.split(';');
	  for(var i = 0; i <ca.length; i++) {
	    var c = ca[i];
	    while (c.charAt(0) == ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
	}

  // TODO: Remove this when we're done
  get diagnostic() { return JSON.stringify(this.model); }


}
