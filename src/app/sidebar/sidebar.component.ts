import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})


export class SidebarComponent implements OnInit {

  @Input() people: Array<Object>;
  @Input() talents: Array<Object>;
  @Input() talentCount: Array<Object>;
  @Input() filterArray;

  constructor() { }

  ngOnInit() {
  }

}
