import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { BOUTIQUES } from '../data/public-content.data';

@Component({
  selector: 'app-public-boutiques-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-boutiques-page.component.html',
  styleUrls: ['./public-boutiques-page.component.css']
})
export class PublicBoutiquesPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly boutiques = BOUTIQUES;

  constructor() {
    this.title.setTitle('TI Commercial | Boutiques');
    this.meta.updateTag({
      name: 'description',
      content: 'Explorez les boutiques de TI Commercial, leurs activites et leurs offres phares.'
    });
  }
}
