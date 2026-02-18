import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  template: `
    <footer class="admin-footer">
      © {{ year }} Admin Panel — Version 1.0
    </footer>
  `
})
export class AdminFooterComponent {
  year = new Date().getFullYear();
}
