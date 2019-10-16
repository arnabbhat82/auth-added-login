import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthService, AuthResponseData } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    // sending login request start
    let authObs: Observable<AuthResponseData>;
    // sending login request end

    this.isLoading = true;

    if (this.isLoginMode) {
      // sending login request start
      authObs = this.authService.login(email, password);
      // sending login request end
    } else {
      authObs = this.authService.signup(email, password);
    }
    // sending login request start
    authObs.subscribe(
      resData => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(['/recipes']);
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      },
    );
    // sending login request end

    form.reset();
  }
}
