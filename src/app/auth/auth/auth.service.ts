import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "src/app/user.model";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // user = new Subject<User>();
  // Subject just emits when ever there is any change, and if that change happens before he subscribe, he can't access that!
  // ex: if token generated(changed) and after sometime he tries to login which requires token to pass into http request, since there is no change in token at the movement so the user doesn't get anything...
  // So using BehaviourSubject he have access to the previous changes also. 

  user = new BehaviorSubject<User>(null);

  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private route: Router) {}

  //   signUp(email: string, password: string) {
  //     return this.http
  //       .post<AuthResponseData>(
  //         "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCwTq3vmCYcyy_dHJwFHPXjZwPl500P2eY",
  //         {
  //           email: email,
  //           password: password,
  //           returnSecureToken: true,
  //         }
  //       )
  //       .pipe(
  //         catchError((errorRes) => {
  //           let errorMessage = "An unknown error Occured!";
  //           if (!errorRes.error || !errorRes.error.error) {
  //             return throwError(errorMessage);
  //           }
  //           switch (errorRes.error.error.message) {
  //             case "EMAIL_EXISTS":
  //               errorMessage = "This email is already exists";
  //           }
  //           return throwError(errorMessage);
  //         })
  //       );
  //   }

  //   Login(email:string, password: string){
  //       return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCwTq3vmCYcyy_dHJwFHPXjZwPl500P2eY', {
  //           email: email,
  //           password: password,
  //           returnSecureToken: true,
  //       })
  //   }

  //this is just refactorization of Error Response (catchError code) to avoide writing the code many times
  signUp(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCwTq3vmCYcyy_dHJwFHPXjZwPl500P2eY",
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((responseData) => {
          this.handleAuthentication(
            responseData.email,
            responseData.localId,
            responseData.idToken,
            +responseData.expiresIn
          );
        })
        // tap( responseData =>{
        //     // expire time will be in seconds but javascript time will be in miliseconds so multiply 1000, 
        //     //'+' to add to present time when user signed in, '+' convert to number type.
        //     const expirationDate = new Date(new Date().getTime() + +responseData.expiresIn * 1000);
        //     // create a new user object of that class to create a new user if anyone signup.
        //     const user = new User(responseData.email, responseData.localId, responseData.idToken, expirationDate);
        //     this.user.next(user);
        //     }
        // )
      );
  }

  Login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCwTq3vmCYcyy_dHJwFHPXjZwPl500P2eY",
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((responseData) => {
          this.handleAuthentication(
            responseData.email,
            responseData.localId,
            responseData.idToken,
            +responseData.expiresIn
          );
        })
      );

      
  }

  autoLogin(){
    const userData: { email: string; id: string; _token: string; _tokenExpirationDate: string; } = JSON.parse(localStorage.getItem('userData'));

    if(!userData){
      return;
    }

    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    if(loadedUser.token){
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    } 
  }

  logout(){
    this.user.next(null);
    this.route.navigate(['/auth']);
    // this will clear everything in local storage.
    // localStorage.clear();
    // but we wanted to clear only userData here so,
    localStorage.removeItem('userData');
    // forcefully make timeout
    if(this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer);
    }
    //we manually making it null here
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number){
    console.log(expirationDuration);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout()
    }, expirationDuration)
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = "An Unknown Error Occured!";
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case "EMAIL_EXISTS":
        errorMessage = "This email is already exists.";
        break;
      case "EMAIL_NOT_FOUND":
        errorMessage = "This email does not exist.";
        break;
      case "INVALID_PASSWORD":
        errorMessage = "The password is invalid.";
        break;
      case "USER_DISABLED":
        errorMessage =
          "The user account has been disabled by an administrator.";
        break;
    }
    return throwError(errorMessage);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    // expire time will be in seconds but javascript time will be in miliseconds so multiply 1000, 
    //'+' to add to present time when user signed in, '+' convert to number type.
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    // create a new user object of that class to create a new user if anyone signup.
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}
