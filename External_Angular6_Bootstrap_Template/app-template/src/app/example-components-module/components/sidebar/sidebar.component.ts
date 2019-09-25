import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @ViewChild('button') button: ElementRef;

  private _opened = false;

  private _toggleSidebar() {
    this._opened = !this._opened;

    this._opened
      ? (this.button.nativeElement.style.display = 'none')
      : (this.button.nativeElement.style.display = 'block');
  }
}
