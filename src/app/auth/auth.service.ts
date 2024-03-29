import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';

import { User } from './user.model';
import { Router } from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // creating and storing the user data start
  // tap is an rxjs operator used without alterating the response
  // tap is used stroring the user data

  user = new BehaviorSubject<User>(null);
  // user = new Subject<User>();

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAQo0a4q1wkYCgYJeW81isDJ9JRUYm7Ib0',
        {
          email,
          password,
          returnSecureToken: true,
        },
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn,
          );
        }),
      );
  }
  // new login method created in auth service
  login(email: string, password: string) {
    return (
      this.http
        .post<AuthResponseData>(
          'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAQo0a4q1wkYCgYJeW81isDJ9JRUYm7Ib0',
          {
            email,
            password,
            returnSecureToken: true,
          },
        )
        // login error handling start
        .pipe(
          catchError(this.handleError),
          tap(resData => {
            this.handleAuthentication(
              resData.email,
              resData.localId,
              resData.idToken,
              +resData.expiresIn,
            );
          }),
        )
    );
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
  }
  // creating and storing user data start
  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number,
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
  }
  // creating and storing user data end
  // login error handling start
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
  // login error handling end
}
