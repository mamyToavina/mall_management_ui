import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="inner">
        <div class="left">
          (c) {{ year }} - Developpe par <strong>RABEHARISAINA Mamy Toavina</strong> & <strong>RANDREFAHANANA Irchad Houssen</strong>
        </div>
        <div class="right">
          Version 1.0
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  year = new Date().getFullYear();
}
