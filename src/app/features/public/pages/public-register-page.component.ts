import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-public-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './public-register-page.component.html',
  styleUrls: ['./public-register-page.component.css']
})
export class PublicRegisterPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  fullName = '';
  email = '';

  constructor() {
    this.title.setTitle('TI Commercial | Creer un compte');
    this.meta.updateTag({
      name: 'description',
      content: 'Creez votre compte TI Commercial pour acceder aux offres personnalisees et rappels d activites.'
    });
  }

  submit(): void {
    alert('Formulaire demo : le endpoint backend d inscription peut etre branche ici.');
  }
}

