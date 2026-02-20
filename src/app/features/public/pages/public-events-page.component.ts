import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import { EVENT_ACTIVITIES } from '../data/public-content.data';

@Component({
  selector: 'app-public-events-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './public-events-page.component.html',
  styleUrls: ['./public-events-page.component.css']
})
export class PublicEventsPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly events = EVENT_ACTIVITIES;

  constructor() {
    this.title.setTitle('TI Commercial | Activites et evenements');
    this.meta.updateTag({
      name: 'description',
      content: 'Decouvrez toutes les activites publiques a venir a TI Commercial.'
    });
  }
}

