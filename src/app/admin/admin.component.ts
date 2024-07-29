import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  // private userService = inject(UserService);
  // private router = inject(Router);
  // ngOnInit(): void {
  //   this.userService.getCurrentUser().subscribe(user => {
  //     if(!user.isadmin){
  //       this.router.navigate(['/home']);
  //     }
  //   });
  // }

}
