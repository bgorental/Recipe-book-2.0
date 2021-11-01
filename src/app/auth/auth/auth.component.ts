import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  error = null;

  constructor(private authService: AuthService, private route: Router) { }

  ngOnInit(): void {
  }

  onSwitchMode(){
    this.isLoginMode = !this.isLoginMode;
  }

  // onSubmitForm(form: NgForm){
  //   this.isLoading = true;
  //   if(!form.valid){
  //     return;
  //   }

  //   const email = form.value.email;
  //   const password = form.value.password;

  //   if(this.isLoginMode){
  //     this.authService.Login(email, password).subscribe(
  //       responseData => {
  //         this.isLoading = false;
  //         console.log(responseData);
  //       },
  //       errorRes => {
  //         this.isLoading = false;
  //         this.error = errorRes;
  //       }
  //     )
  //   }else{
  //     this.authService.signUp(email, password).subscribe(
  //       responseData => {
  //         this.isLoading = false;
  //         console.log(responseData);
  //       },
  //       errorRes => {
  //         this.isLoading = false;
  //         this.error = errorRes;
  //         console.log(errorRes);
  //         ////////////////////// this Logic is written in auth Service
  //         // this.error = errorRes.error.error.message;
  //         // switch(errorRes.error.error.message){
  //         //   case 'EMAIL_EXISTS':
  //         //     this.error = "This email is already exists"
  //         // }
  //       });
  //   }

  //   form.reset();
  // }


//this is just refactorization of response (subscribe code) to avoide writing the code many times
  onSubmitForm(form: NgForm){
    this.isLoading = true;
    if(!form.valid){
      return;
    }

    const email = form.value.email;
    const password = form.value.password;

    let authObservable: Observable<AuthResponseData>;

    if(this.isLoginMode){
      authObservable = this.authService.Login(email, password);
    }else{
      authObservable = this.authService.signUp(email, password);
    }

    authObservable.subscribe(
      responseData => {
        this.isLoading = false;
        console.log(responseData);
        this.route.navigate(['/recipes']);
      },
      errorRes => {
        this.isLoading = false;
        this.error = errorRes;
        console.log(errorRes);
      });

    form.reset();
  }
}