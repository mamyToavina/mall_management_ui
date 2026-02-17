import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="inner">
        <div class="left">
          © {{ year }} — Développé par <strong>Mamy Toavina</strong> & <strong>Irchad Houssen</strong>
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
